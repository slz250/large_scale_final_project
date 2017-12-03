index.post('/sign-up', function(req, res) {
    // TODO:
    // how to provide user feedback if there is a failure during sign-up
    if (req.user) {
      // TODO:
      // test this
      return res.redirect('/');
    }

    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password;

    // TODO:
    // check to make sure that each of these fields are legitimate fields first before creating a new user
    bcrypt.hash(password, 10, function(err, hash) {
      if (err) {
        // TODO:
        // error handle
        console.log('error hashing');
        console.log(JSON.stringify(err));
        return res.redirect('/');
      }
      pool.query('INSERT INTO customer (first_name, last_name, email, password, date_joined) VALUES ($1, $2, $3, $4, $5)', [first_name, last_name, email, hash, new Date().toISOString()], function(err, result) {
        if (err) {
          // TODO:
          // error handle / log error
          if (err.code == 23505) console.log(new Date().toUTCString() + ': Signup unsuccessful - Duplicate email [' + email + ']');
          else console.log(new Date().toUTCString() + ': Signup unsuccessful - PostgreSQL Error [' + err.code + ']');
          return res.redirect('/');
        }
        
        console.log(new Date().toUTCString() + ': Signup successful');

        passport.authenticate('user', function(err, user, message) {
          if (err) {
            // TODO:
            // error handle / log
            res.redirect('/');
          } else if (!user) {
            console.log(JSON.stringify(message));
            res.redirect('/');
          } else {
            req.logIn(user, function(err) {
              if (err) {
                // TODO:
              // error handle
              res.redirect('/');
              }
              res.redirect('/');
            });
          }
        })(req, res);
      });
    });
  });