const express  = require('express');
const app      = express();
const passport = require('passport');
const flash    = require('connect-flash');

const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const pg = require('pg')

// connection with Database
const connect = "postgres://admin:12345@localhost/largeScaleDB";

require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser());

app.set('view engine', 'hbs');

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));2

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Listening on port:", port);
});
