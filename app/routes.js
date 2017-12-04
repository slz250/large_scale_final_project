const db = require('../db')
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');

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
                //res.send(result.rows)
                res.json(result.rows);
                console.log("still works");
                //console.log(results)
            }
        });
    });

    app.get("/", function (req, res) {
        res.render("index.hbs");
    });

    app.get("/login", function (req, res) {
        res.render("login.hbs");
    });

    app.post('/login', function(req,res) {
      console.log('test')
      passport.authenticate('user', (err,user,message) => {
        console.log('it gets here')
        if(err) console.log(err)
        else if(!user){
          console.log('Its not the user')
          return res.redirect('/login')
        }else {
          req.logIn(user, function(err){
            if(err) console.log(err)
            else {
              console.log('Sign in successfull')
              return res.redirect('/' + user.user_id);
            }
          })
        }
      })(req,res)
      console.log('another test')
    })

    app.get("/registration", function (req, res) {
        res.render("registration.hbs");
    });

    app.post('/registration', function(req,res){
      let firstName = req.body.first_name,
          lastName = req.body.last_name,
          email = req.body.email,
          password = req.body.password,
          username = req.body.username,
          // id = uuidv4();
          id = db.query("CREATE OR REPLACE FUNCTION shard_1.id_generator(OUT result bigint) AS $$ DECLARE our_epoch bigint := 1314220021721; seq_id bigint; now_millis bigint; shard_id int := 1; BEGIN SELECT nextval('shard_1.global_id_sequence') % 1024 INTO seq_id; SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis; result := (now_millis - our_epoch) << 23; result := result | (shard_id << 10); result := result | (seq_id); END; $$ LANGUAGE PLPGSQ select shard_1.id_generator(); ");

      bcrypt.hash(password, 10, function(err, hash) {
        if(err){
          console.log('error hashing');
          console.log(err);
        }else{
          let query = {
            text:'INSERT INTO user_table (user_id, first_name, last_name, email, username, password) VALUES ($1, $2, $3, $4, $5, $6 )',
            values: [id, firstName, lastName, email, username, hash]
          }
          db.query(query, (err,result) => {
            console.log('it gets here')
            if(err){
              console.log('Sign up unsuccessful');
              console.log(err);
            }else{
              console.log('Sign up successfull')
              //console.log(req.user)
              res.redirect('/login')
            }
          })
        }
      })
    });

    //assumes user_id data type is text instead of an int
    app.get("/:user_id", checkLoggedIn, function (req, res) {
        let query = "SELECT * FROM user_table WHERE user_id=";
        query = query + "'" + req.params.user_id + "'";
        // console.log(query);
        db.query(query, (err, result) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                //res.send(result.row)
                // res.json(result.rows);
                console.log(result)
                let obj_query = 'SELECT name FROM object_table WHERE user_id=';
                obj_query = obj_query + "'" + result.rows[0].user_id + "'";
                console.log(obj_query);
                db.query(obj_query, (error, obj_result) => {
                  if (error) {
                    console.log(error);
                    res.send(error);
                  } else {
                    // console.log(obj_result.rows)
                    // console.log('done')
                    res.render('homepage',
                    {'user_id':result.rows[0].user_id,
                    'first_name':result.rows[0].first_name,
                    'last_name':result.rows[0].last_name,
                    'email':result.rows[0].email,
                    'username':result.rows[0].username,
                    'password':result.rows[0].password,
                    'objects':obj_result.rows
                    });
                  }
                });
                //get list of objects that belong to this user.
                //query for SELECT name FROM object_table WHERE user_id= (user_id from current user)



                // console.log(result.rows[0]);
                //console.log(results)
            }
        });
    });

    app.post("/add_new_item", (req,res) => {
        console.log("works")
    });

    const user = "owner";
    app.get("/:user_id/:object_id", (req, res) => {
        /**
         * first get user then get object
         */
        let object = null;
        db.query("SELECT name, state FROM object_table where object_id = 12032017", (err, result) => {
            if (err) {
                res.send(err);
            } else {
                object = result.rows[0];
                // console.log(object.rows[0]);
                object.state = object.state === 2 ? "In-Possession" : object.state === 1 ? "Found" : "Lost";
                if (user === "owner") {
                    res.render("recover_object.hbs", {object: object, owner: true});
                } else {
                    res.render("recover_object.hbs", {object: object, owner: false});
                }
            }
        });
    });

    app.post("/update_status", (req,res) => {
        // res.send(req.body.item_status);
        if (Object.keys(req.body).length !== 0) {
            const status = parseInt(req.body.item_status);
            db.query("UPDATE object_table set state = " + status + "where object_id = 12032017", (err, result) => {
                if (err) {
                    res.send(err);
                }
                res.redirect("/userid/12032017");
            });
        }
    });

    app.post("/:user_id/:object_id", (req, res) => {
        if (Object.keys(req.body).length !== 0) {
            console.log(req.body.textbox);
        }
    });

    app.get('/logout', function(req, res){
      req.logout();
      res.redirect('/');
    });

};

function checkLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/");
    }
}
