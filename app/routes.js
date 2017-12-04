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

    app.post('/login', passport.authenticate('local-login', {
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
          id = uuidv4()

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


    // //HOW TO GET user_id ?!
    // app.get("/:user_id", (req, res) => {
    //     let object_list = null;
    //     // const query = {
    //     //     text: "SELECT * FROM object_table where user_id = $1::text",
    //     //     values: ['1234567890']
    //     // };
    //     const query = "SELECT * FROM object_table WHERE user_id = '1234567890'"
    //     db.query(query, (err, result) => {
    //         if (err) {
    //             console.log(err)
    //             // res.send("db err")
    //         } else {
    //             res.json(result.rows);
    //             //res.send(result.rows)
    //             // object_list = result.rows
    //             // console.log(result)
    //
    //         }
    //     });
    //     // res.render("object_list.hbs", {object_list: object_list});
    // });

    app.get("/:user_id", function (req, res) {
        let query = "SELECT * FROM user_table WHERE user_id="
        query = query + "'" + req.params.user_id + "'"
        console.log(query)
        db.query(query, (err, result) => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                //res.send(result.rows)
                res.json(result.rows);
                console.log("works");
                //res.render("object_list.hbs", {object_list: object_list});
                //console.log(results)
            }
        });
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
};
