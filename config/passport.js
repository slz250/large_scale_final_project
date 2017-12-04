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

    passport.use('user',new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      },
      (username, password, done) => {
        db.query('SELECT * FROM user_table WHERE username = $1 AND password = $2', [username, password], (err, result) => {
          if(err) {
            console.log(err)
            return done(err)
          }
          if(result.rows.length > 0) {
            const user = result.rows[0]
            bcrypt.compare(password, user.password, function(err, isMatch) {
              if(err) {
                done(null, false)
              } else {
                return done(null, { id: user.user_id, username: user.username })

              }
            })
          } else {
            done(null, false)
          }
        })
      }
    ));
};
