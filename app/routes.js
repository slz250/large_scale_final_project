const db = require('../db/index.js')
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');

let user_global = null;

module.exports = function (app, passport) {
    /**
     * testing the database
     */
    app.get("/test_database", function (req, res) {
        db.query("SELECT * FROM user_table;", (err, result) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.json(result.rows);
                console.log("still works");
            }
        });
    });

    app.get("/", function (req, res) {
        if (req.isAuthenticated()) {

            res.redirect("/")
        }
        res.render("index.hbs");
    });

    app.get("/login", function (req, res) {
        res.render("login.hbs");
    });

    app.post('/login', function (req, res) {
        console.log('test')
        passport.authenticate('user', (err, user, message) => {
            console.log('it gets here')
            if (err) console.log(err)
            else if (!user) {
                console.log('Its not the user')
                return res.redirect('/login')
            } else {
                req.logIn(user, function (err) {
                    if (err) console.log(err)
                    else {
                        user_global = user;
                        console.log('Sign in successfull')
                        return res.redirect('/' + user.user_id);
                    }
                })
            }
        })(req, res)
        console.log('another test')
    })

    app.get('/logout', function (req, res) {
        req.logout();
        console.log('its trying to logout')
        user_global = null;
        res.redirect('/');
    });


    app.get("/registration", function (req, res) {
        res.render("registration.hbs", {exists: false});
    });

    app.post('/registration', function (req, res) {
        let firstName = req.body.first_name,
            lastName = req.body.last_name,
            email = req.body.email,
            password = req.body.password,
            username = req.body.username
        /*  id = generated in postgres using these sql queries:
        create sequence public.global_id_sequence;

        CREATE OR REPLACE FUNCTION public.id_generator(OUT result bigint) AS $$
        DECLARE
        our_epoch bigint := 1314220021721;
        seq_id bigint;
        now_millis bigint;
        shard_id int := 1;
        BEGIN
        SELECT nextval('public.global_id_sequence') % 1024 INTO seq_id;

        SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis;
        result := (now_millis - our_epoch) << 23;
        result := result | (shard_id << 10);
        result := result | (seq_id);
        END;
        $$ LANGUAGE PLPGSQL;

        select public.id_generator();

        ---------------------------------------------------------------------------------

        create table public.user_table(
        user_id bigint not null default public.id_generator(),
        email text not null unique,
        first_name text,
        last_name text,
        username text,
        password text
        )

        */
        let checkQuery = {
          text: 'Select username from user_table where username = $1',
          values: [username]
        }
        db.query(checkQuery, (err, result) => {
          if (err){
            console.log(err)
          }else{
            if(result.rows[0]){
              console.log('username already exists')
              res.render("registration.hbs", {exists: true});
            }else{
              console.log('Youre in the clear!')
              bcrypt.hash(password, 10, function (err, hash) {
                  if (err) {
                      console.log('error hashing');
                      console.log(err);
                  } else {
                      let query = {
                          text: 'INSERT INTO user_table ( first_name, last_name, email, username, password) VALUES ($1, $2, $3, $4, $5 )',
                          values: [firstName, lastName, email, username, hash]
                      }
                      db.query(query, (err, result) => {
                          console.log('it gets here')
                          if (err) {
                              console.log('Sign up unsuccessful');
                              console.log(err);
                          } else {
                              console.log('Sign up successfull')
                              //console.log(req.user)
                              res.redirect('/login')
                          }
                      })
                  }
              })
            }
          }
        })
    });

    //assumes user_id data type is text instead of an int
    app.get("/:user_id", checkLoggedIn, function (req, res) {
        let userID = req.params.user_id
        let query = {
            text: "SELECT * FROM user_table WHERE user_id = $1",
            values: [userID]
        }
        db.query(query, (err, result) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                let obj_query = {
                    text: 'SELECT name, user_id, object_id FROM object_table WHERE user_id = $1',
                    values: [userID]
                }
                db.query(obj_query, (error, obj_result) => {
                    if (error) {
                        res.send(error);
                    } else {
                        //console.log(obj_result.rows);
                        res.render('homepage',
                            {
                                'user_id': result.rows[0].user_id,
                                'first_name': result.rows[0].first_name,
                                'last_name': result.rows[0].last_name,
                                'email': result.rows[0].email,
                                'username': result.rows[0].username,
                                'password': result.rows[0].password,
                                'objects': obj_result.rows
                            });
                    }
                });
            }
        });
    });

    app.post("/:user_id", (req, res) => {
        let objectName = req.body.object,
            user_id = req.params.user_id,
            url = "/" + user_id,
            query = {
                text: 'INSERT INTO object_table ( name, state, user_id ) VALUES ($1, $2, $3 )',
                values: [objectName, 2, user_id]
            };
        db.query(query, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Item added!')
                res.redirect(url)
            }
        })
    });

    app.get("/:user_id/:object_id", checkLoggedIn, (req, res) => {
        /**
         * first get user then get object
         */
        let object = null,
            query = {
                text: "SELECT name, state FROM object_table where object_id = $1",
                values: [req.params.object_id]
            };

        db.query(query, (err, result) => {
            if (err) {
                res.send(err);
            } else {
                object = result.rows[0];
                /**
                 * qr code
                 */
                object.state = object.state === 2 ? "In-Possession" : object.state === 1 ? "Found" : "Lost";
                res.render("specific_item.hbs", {object: object, id: req.params});
            }

        });
    });

    app.get("/:user_id/:object_id/recover", (req, res) => {
        let object = {
                user_id: req.params.user_id,
                object_id: req.params.object_id,
        }
        res.render("recover_object.hbs", {object: object});
    });

    app.post("/:user_id/:object_id/recover", (req, res) => {
        let object = {
                user_id: req.params.user_id,
                object_id: req.params.object_id,
        }
        let query = {
            text: 'SELECT email FROM user_table where user_id = $1',
            values: [object.user_id]
        }
        db.query(query, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result.rows[0].email)
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                let msg = {
                    to: result.rows[0].email,
                    from: 'noreply@QrFound.com',
                    subject: 'your item has been found!', //query to find item name?
                    text: req.body.textbox,
                  };
                console.log(msg);
                sgMail.send(msg);
                // isSent= true;
                res.redirect('/' + object.user_id + '/' + object.object_id + '/recover');
                // res.render("recover_object.hbs", {object: object, isSent: isSent});

            }
        });
    });

    app.post("/:user_id/:object_id/update_status", (req, res) => {

        if (Object.keys(req.body).length !== 0) {
          let status = req.body.item_status,
              user = req.body.user,
              object = req.body.object,
              query = {
                text: "UPDATE object_table SET state=$1 WHERE user_id=$2 AND object_id=$3",
                values: [status, user, object]
              }
              db.query(query, (err, result) => {
                if (err) {
                  return res.send(err);
                } else {
                  let url = "/" + user + "/" + object;
                  res.redirect(url)
                }
              });
        }
    });

    app.post("/:user_id/:object_id/delete", (req, res) => {
        if (Object.keys(req.body).length !== 0) {
            console.log(req.body);
            let user = req.body.user,
                object = req.body.object,
                query = {
                    text: "DELETE FROM object_table WHERE user_id=$1 AND object_id=$2",
                    values: [user, object]
                };
            console.log(query);

            db.query(query, (err, result) => {
              if (err) {
                return res.send(err);
              } else {
                let url = "/" + user;
                res.redirect(url)
              }
            });
        }
    });



};

function checkLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/");
    }
}
