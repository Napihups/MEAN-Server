const express = require('express');
const inviteRouter = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const appContext = require('../appContext');
const Auth = require('../middleware/check-auth');
const redis = require('../app-modules/redisModule');
const tokenUtil = require('../middleware/tokenUtilities')();
const Invite = require('../models/invitation');

inviteRouter.get('/', Auth, (req, res, next) => {

	let authName = tokenUtil.getUsernameFromReq(req);
	Invite.getAllInvites(authName, (c) => {
		if(!c.err){
			let list = c.data;
			let compList = [];
			for (var i = list.length - 1; i >= 0; i--) {
				let obj = {
					from: list[i].sendBy,
					time: list[i].timeSent
				}
				compList.push(obj);
			}
			res.json({success: true, data: compList});

		} else {
			res.json({success: false, msg: c.msg});

		}
	})
})

module.exports = inviteRouter;


