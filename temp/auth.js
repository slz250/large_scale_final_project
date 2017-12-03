module.exports = function(pool, bcrypt) {
	var passport = require('passport');
	var LocalStrategy = require('passport-local').Strategy;

	passport.use('user', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password'
		},
	  	function(username, password, done) {
	  		pool.query('SELECT * FROM customer WHERE email = ($1)', [username], function(err, result) {
	      		if (err) {
		      		return done(err); 
		      	}
		      	var user = result.rows[0];
		      	if (!user) {
		      		return done(null, false, {error: 'Incorrect email.'});
		      	}
		      	bcrypt.compare(password, user.password, function(err, res) {
					if (err) {
				   		// TODO:
				   		// error handle / log
				   		console.log('error in bcrypt');
				  	}
				  	if (res) {
						return done(null, user);
				  	} else {
				  		return done(null, false, {error: 'Incorrect password.'});
				  	}
				});
		    });
	  	}
	));

	passport.use('company', new LocalStrategy({
			usernameField: 'email',
			passwordField: 'password'
		},
	  	function(username, password, done) {
	  		pool.query('SELECT * FROM vendor WHERE email = ($1)', [username], function(err, result) {
	      		if (err) {
		      		return done(err); 
		      	}
		      	var user = result.rows[0];
		      	if (!user) {
		      		return done(null, false, {error: 'Incorrect email.'});
		      	}
		      	bcrypt.compare(password, user.password, function(err, res) {
					if (err) {
				   		// TODO:
				   		// error handle / log
				   		console.log('error in bcrypt');
				  	}
				  	if (res) {
						return done(null, user);
				  	} else {
				  		return done(null, false, {error: 'Incorrect password.'});
				  	}
				});
		    });
	  	}
	));

	passport.serializeUser(function(user, done) {
		// customer
		if (user.first_name) {
			user.id = 'a' + user.id;
			done(null, user.id);
		} else {
			user.id = 'b' + user.id;
			done(null, user.id);
		}
	});

	passport.deserializeUser(function(id, done) {
		if (id[0] == 'a') {
			pool.query('SELECT * FROM customer WHERE id = ($1)', [id.substr(1)], function(err, result) {
		  		if (err) {
		  			return done(err);
		      	}
		      	var user = result.rows[0];
		      	done(null, user);
	    	});
		} else {
			pool.query('SELECT * FROM vendor WHERE id = ($1)', [id.substr(1)], function(err, result) {
		  		if (err) {
		  			return done(err);
		      	}
		      	var user = result.rows[0];
		      	done(null, user);
	    	});
		}
	});

	return passport;
}