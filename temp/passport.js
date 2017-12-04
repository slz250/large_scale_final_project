// config/passport.js
// load all the things we need
var LocalStrategy = require('passport-local').Strategy;
const db = require('../db')
const bcrypt = require('bcrypt');

// expose this function to our app using module.exports
module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.user_id);
    });

    passport.deserializeUser(function (user_id, done) {
        db.query('SELECT user_id, username FROM users WHERE user_id = $1', [user_id], (err, results) => {
            if (err) {
                return done(err)
            }else{
              let user = result.rows[0]
              done(null, user)
            }
        })
    });

    passport.use('user',new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      },
      (username, password, done) => {
        console.log(username, password)
        db.query('SELECT * FROM user_table WHERE username = $1', [username], (err, result) => {
          if(err) {
            console.log(err)
            return done(err)
          }
          if(result.rows.length > 0) {
            const user = result.rows[0]
            bcrypt.compare(password, user.password, function(err, isMatch) {
              if(err) {
                console.log('Not a Match')
                done(null, false)
              } else {
                return done(null, user)
              }
            })
          } else {
            console.log('wrong password?')
            done(null, false)
          }
        })
      }
    ));
};
