const express = require('express');
const sessionRouter = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const appContext = require('../appContext');
const Auth = require('../middleware/check-auth');
const redis = require('../app-modules/redisModule');
const tokenUtil = require('../middleware/tokenUtilities')();



sessionRouter.get('/online', Auth, (req, res, next) => {
	
	appContext.redisModule.getAllUserSession((list) => {
		if(list) {
			res.json({success: true, data: list});
		} else {
			res.json({success: false, msg: 'Error in getting sessions in redis'});
		}
	})

});

sessionRouter.get('/search', Auth, (req, res, next) => {
	let searchText = req.param('searchVal');
	let username = tokenUtil.getUsernameFromReq(req);
	console.log(username);
	redisModule.scanSessions(searchText,username, (result) => {
		if(result) {
			res.json({success: true, data: result});
		} else {
			res.json({success: false, msg: "Error scanning session on Redis"});
		}
	})
})



module.exports = sessionRouter;