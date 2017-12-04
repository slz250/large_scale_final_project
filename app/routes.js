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
        res.render("homepage.hbs");
    });

    app.get("/login", function (req, res) {
        res.render("login.hbs");
    });

    app.post('/login', passport.authenticate('user', {
        successRedirect: '/:user_id', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages

        //LOGIN and link to homepage with user_id in the link
        //get info from database ?
    }));

    app.get("/registration", function (req, res) {
        res.render("registration.hbs");
    });

    app.post('/registration', function(req,res){
      let firstName = req.body.first_name,
          lastName = req.body.last_name,
          email = req.body.email,
          password = req.body.password,
          username = req.body.username,
          id = db.query("CREATE OR REPLACE FUNCTION shard_1.id_generator(OUT result bigint) AS $$ DECLARE our_epoch bigint := 1314220021721; seq_id bigint; now_millis bigint; shard_id int := 1; BEGIN SELECT nextval('shard_1.global_id_sequence') % 1024 INTO seq_id; SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000) INTO now_millis; result := (now_millis - our_epoch) << 23; result := result | (shard_id << 10); result := result | (seq_id); END; $$ LANGUAGE PLPGSQ select shard_1.id_generator(); ");

      bcrypt.hash(password, 10, function(err, hash) {
        if(err){
          console.log('error hashing')
          console.log(err)
        }else{
          db.query('INSERT INTO user_table (user_id, first_name, last_name, email, username, password) VALUES ($1, $2, $3, $4, $5, $6 )', [id, firstName, lastName, email, username, hash], (err,result) => {
            console.log('it gets here')
            if(err){
              console.log('Sign up unsuccessfull')
              console.log(err)
            }else{
              console.log('Sign up successfull')
              res.redirect("/test_database");
            }
          })
        }
      })
    })


    //HOW TO GET user_id ?!
    app.get("/:user_id", (req, res) => {
        let object_list = null;
        const query = {
            text: "SELECT * FROM object_table where user_id = $1::text",
            values: [user_id]
        };
        db.query(query, (err, result) => {
            if (err) {
                console.log(err)
                res.send("db err")
            } else {
                //res.send(result.rows)
                object_list = result.rows
                //console.log(results)
            }
        });
        res.render("object_list.hbs", {object_list: object_list});
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
        const status = parseInt(req.body.item_status);
        db.query("UPDATE object_table set state = " + status + "where object_id = 12032017", (err,result) => {
            if (err) {
                res.send(err);
            }
            res.redirect("/userid/12032017");
        });
    });

    app.post("/:user_id/:object_id", (req, res) => {
        if (Object.keys(req.body).length !== 0) {
            console.log(req.body.textbox);
        }
    });

    app.get('/mypenis', (req, res) => {
        console.log(req.user);
        res.render('homepage.hbs')
    });

};
