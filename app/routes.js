const db = require('../db')
const bcrypt = require('bcrypt');
module.exports = function (app, passport) {
    /**
     * testing the database
     */
    app.get("/test_database", function(req,res) {
        db.query("SELECT * FROM user_table;", (err, result) => {
           if (err) {
             console.log(err)
             res.send("db err")
            } else{
              //res.send(result.rows)
              res.json(result.rows)
              console.log("still works")
              //console.log(results)
            }
        });
    });

    app.get("/", function (req, res) {
        res.render("homepage.hbs");
    });

    app.get("/login", function (req,res){
      res.render("login.hbs");
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/:user_id', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages

        //LOGIN and link to homepage with user_id in the link
        //get info from database ?
    }));

    app.get("/registration", function (req,res){
      res.render("registration.hbs");
    });

    app.post('/registration', function(req,res){
      let firstName = req.body.first_name,
          lastName = req.body.last_name,
          email = req.body.email,
          password = req.body.password,
          username = req.body.username,
          id = 1234567890

      bcrypt.hash(password, 10, function(err, hash) {
        if(err){
          console.log('error hashing')
          console.log(err)
        }else{
          db.query('INSERT INTO user_table (user_id, first_name, last_name, email, username, password) VALUES ($1, $2, $3, $4, $5, $6 )', [id, firstName, lastName, email, username, hash], (err,result) => {
            if(err){
              console.log('Sign up unsuccessfull')
              console.log(err)
            }else{
              console.log('Sign up successfull')
            }
          })
        }
      })
    }


    //HOW TO GET user_id ?!
    app.get("/:user_id", (req, res) => {
      //  ensure authenticated
      //  console.log('this is being run')
      let item_list = null;
      const query = {
        text: "SELECT * FROM object_table where user_id = $1::text",
        values: [user_id]
      };
        db.query(query, (err, result) => {
           if (err) {
             console.log(err)
             res.send("db err")
            } else{
              //res.send(result.rows)
              item_list = result.rows
              //console.log(results)
            }
        });
        res.render("item_list.hbs", {item_list: item_list});
    });




    const user = "owner";
    app.get("/:user_id/:object_id", (req, res) => {
        /**
         * first get user then get object
         * @type {{name: string, status: string}}
         */
        const item = {name: "iPhone X", status: "In-Possession"};
        //pseudo-code
        if (user === "owner") {
            res.render("recover_item.hbs", {item: item, owner: true});
        } else {
            res.render("recover_item.hbs", {item: item, owner: false});
        }

    });

    app.post("/:user_id/:object_id", (req, res) => {
        if (Object.keys(req.body).length !== 0) {
            console.log(req.body.textbox);
        }
    });
};
