var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

//Register
router.get('/register', function(req, res){
    res.render('register');
});

//Login
router.get('/login', function(req, res){
    res.render('login');
});

//Stream
router.get('/stream', function(req, res){
    res.render('stream');
});

// Register User
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var country = req.body.country;
	var gender = req.body.gender;
	var occupation = req.body.occupation;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
	req.checkBody('gender', 'Gender is required').notEmpty();
	req.checkBody('occupation', 'Occupation is required').notEmpty();
	

	var errors = req.validationErrors();

	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password,
			country: country,
			gender: gender,
			occupation: occupation
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

// http://passportjs.org/docs/username-password authenticate users is via a username and password. 
//Support for this mechanism is provided by the passport-local module.
passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err; //check for error and thorw if its one
   	if(!user){ //check for user if not match
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

//http://passportjs.org/docs/configure -- Sessions

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

//http://passportjs.org/docs --- Authentication
router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/');
  });

  router.get('/logout', function(req, res){
      req.logout();

      req.flash('success_msg', 'You are logged out');

      res.redirect('/users/login');
  });

module.exports = router;