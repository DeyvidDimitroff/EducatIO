var http = require('http');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport'); //authentication
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var socketIO = require('socket.io');

//chat stuff
connections = [];
usernames = [];

mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var courses = require('./routes/courses');
var browseC = require('./routes/browseC');


// Init App
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

// Set Port
var serverPort = 3000;
server.listen(serverPort, function () {
  console.log('server is running on localhost:' + serverPort);
});



//View Engine
app.set('views', path.join(__dirname, 'views')); //tells the sistem, that we want a folder called 'views' to handle our views
app.engine('handlebars', exphbs({
  defaultLayout: 'layout',
  helpers: {
    isTeacher: function (user, options) {
      if (user.occupation === 'teacher') {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    }
  }
})); //we tell that default layout file want to be called layout.handlebars
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public'))); //put stilesheets, jwplayer public files, images, jquery and stuff accessible for the browser

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator --- https://github.com/ctavan/express-validator --- Middleware Options
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});



app.use('/', routes);
app.use('/users', users);
app.use('/courses', courses);
app.use('/browseC', browseC);

//chat 

io.sockets.on('connection', function (socket) {
  connections.push(socket);
  console.log("Connected: %s sockets connected", connections.length);
  io.sockets.emit('users_count', connections.length);

  // Disconnect
  socket.on('disconnect', function (data) {

    connections.splice(connections.indexOf(socket), 1);
    io.sockets.emit('users_count', connections.length);
    console.log('Disconnected: %s sockets connected', connections.length);

  });

  //send message
  socket.on('send message', function (data) {
    io.sockets.emit('new message', data);
  });
});