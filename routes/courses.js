var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Browse = require('../models/course');

//Register
router.get('/course', function (req, res) {
	res.render('course');
});


module.exports = router;