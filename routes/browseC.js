var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var Browse = require('../models/browse');

//Register
router.get('/browse', function (req, res) {
	res.render('browse');
});


module.exports = router;