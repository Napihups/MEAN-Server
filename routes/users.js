const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const appContext = require('../appContext');
const Auth = require('../middleware/check-auth');

//Include the Model repo here
const User = require('../models/user');
// Redis repos
const redis = require('../app-modules/redisModule');

//	Register
router.post('/register', (req, res, next) => {
	let newUser = new User({
		name: req.body.name,
		email: req.body.email,
		username: req.body.username,
		password: req.body.password
	});


	User.addUser(newUser, (err, user) => {
		if(err){
			res.json({success: false, msg: 'Failed to register user'});
		}else {
			res.json({success: true, msg: 'User registered'});
		}
	});
});



// Profile
router.get('/profile', Auth, (req, res, next) => {
	res.json({user: req.userData});
});

// Validate
router.get('/validate', Auth, (req, res, next) => {

});


// LOGIN
router.post('/login', (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;

	User.getUserByUsername(username, (err, user) => {
		if(!user) {
			res.json({success: false, msg: "No user found "});
		}
		else {

			User.comparePassword(password, user.password, (err, isMatch) => {
				if(!isMatch || err) {
					return res.json({success: false, msg: 'Wrong Password'});
				} else {
					const token = jwt.sign({
						id : user._id,
						username : user.username
					},
					config.secret,
					{
						expiresIn: "1h"
					});


					res.json({success: true, user: user, token: token});
				}
			});
		}
	});


});


module.exports = router;