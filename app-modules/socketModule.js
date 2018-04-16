module.exports = function(obj) {

	var module = {};
	var io = obj.io;
	var redis_repo = obj.redis_repo;
	var connections = [];
	var logger = obj.logger;
	const tokenUtils = obj.tokenUtils;
	const Invite = require('../models/invitation');


	module.startSocket = function(e) {
		io.sockets.on('connection', (thisSocket) => {
			logger.info('Accepting new Connection from client : ' + thisSocket.id);

			connections.push(thisSocket);

			/*
				This will invoked when user has successfully logged in 
				and credentials retrieved from clients...
				<code>username</code> will be used for client connection
				identification.. 
			*/
			thisSocket.on('new user', (token) => {
				let username = tokenUtils.getUsernameFromToken(token);
				redis_repo.addNewUserSession(username, thisSocket.id);
				thisSocket.username = username;
				notifyUserOnline({
					username: thisSocket.username,
					sId: thisSocket.id
				}); // method on testing
				
			});


			//endpoint for logout or disconnected user
			thisSocket.on('disconnect', () => {
				logger.info('Client disconnected : ' + thisSocket.username + " " + thisSocket.id);
				delLogoutUser(thisSocket.username, (e) => {
					if(e){
						// updateOnlineUsers(); not using this method in future
						notifyUserOffline({
							username: thisSocket.username,
							sId: thisSocket.id
						});
					}
				});
				connections.splice(connections.indexOf(thisSocket), 1);
			});

			//endpoint for new incoming msg from client
			thisSocket.on('chat message', (payload) => {
				io.sockets.emit('new message', {msg : payload, user : thisSocket.username});
			});


			thisSocket.on('private message', (payload) => {
				thisSocket.broadcast.io(payload.id)
					.emit('new private message', {msh: payload.content, username: thisSocket.username})
			});

			thisSocket.on('invite new game', (payload) => {
				let sentToName = payload.toName;
				let sidTo = payload.sIdTo;
				console.log(payload.sIdTo);
				var moment = require('moment');
				var now = moment();
				var time = now.format('YYYY-MM-DD HH:mm:ss Z');
				// var newInvite = new Invite({
				// 	sendTo: sentToName,
				// 	sendBy: thisSocket.username,
				// 	timeSent: time
				// }) 

				// Invite.saveInvite(newInvite, function(e){
				// 	if(e.success){
				// 		console.log("successfully saved new invite");
				// 	} else {
				// 		console.log(e.msg);
				// 	}
				// })


				thisSocket.broadcast.to(sidTo)
					.emit('new game invitation',
					 {from: thisSocket.username, time: time});
			})

		});

	};



	//----------------Local utilities -------------------//

	let updateOnlineUsers = () => {
		redis_repo.getAllUserSession((list) => {
			console.log("This list from updateOnlineUsers", list);

			if(list != null || list.length > 0){
				io.sockets.emit('update users', list);
			}
		});
	};

	let notifyUserOnline = (userSess) => {
		io.sockets.emit('notify user online', userSess);
	}

	let notifyUserOffline = (userSess) => {
		io.sockets.emit('notify user offline', userSess);
	}

	let delLogoutUser = (username, callback) => {
		redis_repo.delUserSessionByUsername(username, (e) => {
			if(e){
				return callback(true);
			} else {
				return callback(false);
			}
		})
	}

	return module;

}