var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongo = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;
var LocalStrategy = require('passport-local').Strategy;
var assert = require('assert');
var url = 'mongodb://localhost:27017/loginapp';
var expressValidator = require('express-validator');

var User = require('../models/user');


//Register
router.get('/register', function (req, res) {
	res.render('register');
});

//Login
router.get('/login', function (req, res) {
	res.render('login');
});

router.get('/update', function (req, res) {
	res.render('update');
});

//Profile
router.get('/profile/:username', function (req, res) {
	User.getUserByUsername(req.params.username, function (err, userinfo) {

		if (err) {
			return res.status(500).send(err.message);
		}
		if (!userinfo) {
			return res.status(404).send("no such user");
		}

		res.render('profile', {
			targetUser: userinfo
		});
	});
});

//Stream
router.get('/stream', function(req, res){
    res.render('stream');
});

//Chat
router.get('/chat', function(req, res){
    res.render('chat');
});

// Register User
router.post('/register', function (req, res) {
	var name = req.body.name;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	var country = req.body.country;
	var occupation = req.body.occupation;
	var title = req.body.title;
	var longDescription = req.body.longDescription;

	// Validation
	req.checkBody('name', 'Нужно е име. Дължината трябва да бъде между 5 и 15 символа').isLength(5, 15);
	req.checkBody('username', 'Нужно е потребителско име. Дължината трябва да бъде между 5 и 15 символа').isLength(5, 15);
	req.checkBody('password', 'Нужна е парола Дължината трябва да бъде между 6 и 10 символа').isLength(6, 10);
	req.checkBody('password2', 'Потвърдете паролата').equals(req.body.password);
	req.checkBody('country', 'Нужна е държава').isLength(5, 15);
	req.checkBody('occupation', 'Изберете дали сте ученик или учител').notEmpty();

	var errors = req.validationErrors();

	var newUser = new User({
		name: name,
		username: username,
		password: password,
		country: country,
		occupation: occupation,
		title: title,
		longDescription: req.body.longDescription
	});

	User.createUser(newUser, function (err, user) {
		var usernameDuplicateError;
		if (err) {
			usernameDuplicateError = {
				param: 'username',
				msg: 'Потребителското име е заето.',
				value: username
			};
		}

		if (errors && usernameDuplicateError) {
			errors.push(usernameDuplicateError);
		} 
		if (!errors && usernameDuplicateError) {
			errors = [usernameDuplicateError];
		}
		if (errors) {
			res.render('register', {
				errors: errors
			});
		} else {
			req.flash('success_msg', 'Вече сте регистриран и можете да влезете в системата');
			res.redirect('/users/login');
		}
	});
});

router.post('/update', function (req, res) {
	var cou = {
		title: req.body.title,
		longDescription: req.body.longDescription
	};
	var id = req.user.id;



	req.checkBody('title', 'Нужно е заглавие').notEmpty();
	req.checkBody('longDescription', 'Нужно е  кратко съдържание за курса').notEmpty();
	var errors = req.validationErrors();

	if (errors) {
		res.render('course', {
			errors: errors
		});
	} else {

		mongo.connect(url, function (err, db) {
			assert.equal(null, err);
			db.collection('users').updateOne({
				"_id": objectId(id)
			}, {
				$set: cou
			}, function (err, result) {
				assert.equal(null, err);
				console.log('Item updated');

			});
		});



		req.flash('success_msg', 'Регистрирали сте промените в курса');

		res.redirect('/users/login');
	}
});



// http://passportjs.org/docs/username-password authenticate users is via username and password. 
passport.use(new LocalStrategy(
	function (username, password, done) {
		User.getUserByUsername(username, function (err, user) {
			if (err) throw err; //check for error and thorw if its one
			if (!user) { //check for user if not match
				return done(null, false, {
					message: 'Unknown User'
				});
			}

			User.comparePassword(password, user.password, function (err, isMatch) {
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, {
						message: 'Invalid password'
					});
				}
			});
		});
	}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});


router.post('/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/users/login',
		failureFlash: true
	}),
	function (req, res) {
		res.redirect('/');
	});

router.get('/logout', function (req, res) {
	req.logout();

	req.flash('success_msg', 'Излязохте от системата');

	res.redirect('/users/login');
});

module.exports = router;