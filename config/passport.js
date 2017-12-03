// config/passport.js
// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
const db = require('../db')
const bcrypt = require('bcryptjs');

// expose this function to our app using module.exports
module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(user_id, done) {
      db.query('SELECT user_id, username FROM users WHERE user_id = $1', [parseInt(user_id)], (err, results) => {
          if(err) {
            console.log(err)
          }
          done(null, results.rows[0])
        })
    });

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
};
