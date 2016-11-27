var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	gender: {
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema); //access outside this file

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) { // from https://www.npmjs.com/package/bcryptjs Usage-Async --- hashing password
	    bcrypt.hash(newUser.password, salt, function(err, hash) { 
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){ //some mongoose methods
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) { //grab it again from bcryptjs
    	if(err) throw err;
    	callback(null, isMatch);
	});
}