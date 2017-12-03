// config/passport.js
// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
const db = require('../db')
const bcrypt = require('bcrypt');

// expose this function to our app using module.exports
module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (user_id, done) {
        db.query('SELECT user_id, username FROM users WHERE user_id = $1', [parseInt(user_id)], (err, results) => {
            if (err) {
                console.log(err)
            }
            done(null, results.rows[0])
        })
    });

<<<<<<< HEAD
    passport.use('local-login',new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true
      },
      (req, user, done) => {
        db.query('SELECT user_id, username, password FROM user_table WHERE username=$1', [username], (err, result) => {
          if(err) {
            console.log(err)
          }
          if(result.rows.length > 0) {
            const first = result.rows[0]
            bcrypt.compare(password, first.password, function(err, isMatch) {
              if(isMatch) {
                return done(null, { id: first.user_id, username: first.username })
              } else {
                done(null, false)
              }
            })
          } else {
            done(null, false)
          }
        })
      }
    ));
=======
    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        (req, user, done) => {
            db.query('SELECT user_id, username, password FROM user_table WHERE username=$1', [username], (err, result) => {
                    if (err) {
                        console.log(err)
                    }
                    if (result.rows.length > 0) {
                        const first = result.rows[0]
                        bcrypt.compare(password, first.password, function (err, isMatch) {
                            if (isMatch) {
                                return done(null, {id: first.user_id, username: first.username})
                            } else {
                                done(null, false)
                            }
                        })
                    } else {
                        done(null, false)
                    }
                }
            )
        }
    ));
    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-registration', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },

        function (req, email, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function () {

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({'local.email': email}, function (err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // if there is no user with that email
                        // create the user
                        const newUser = new User();

                        // set the user's local credentials
                        newUser.local.email = email;
                        newUser.local.password = newUser.generateHash(password);

                        // save the user
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }

                });

            });

        }
    ))
>>>>>>> 7d0164f7cae0438694b8a455505a6bf7e2d45476
};
