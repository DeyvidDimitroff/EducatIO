var express = require('express');
var User = require('../models/user');
var router = express.Router();

//Get Homepage
router.get('/', function (req, res) {
    User.getTeachers(function (err, teachers) {
        if (err) {
            return res.send('Could not get list of teachers.');
        }
        res.render('index', {
            teachers: teachers
        });
    });
});


module.exports = router;