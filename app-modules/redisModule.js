module.exports = function(obj) {

	var module = {};
	var redis = obj.redis;
	var host = obj.host;
	var port = obj.port;
	var redisClient;
	var logger = obj.logger;
	const userSessionPrefix = "sessionUser:";



	let connectRedis = function() {
		redisClient = redis.createClient();
		redisClient.on('connect', (e) => {
			logger.info('Redis Connected on ' + host + ' ' + port)
		});
	}

	module.init = function() {
		connectRedis();
	};


	module.validateSessionExist = (username, callback) => {
		redisClient.hgetall(userSessionPrefix + username, (err, obj) => {
			if(err === null){
				if(obj != null){
					return callback(true);
				} else {
					return callback(false);
				} 
			} else {
				logger.error('Error : ' + err);
			}
		});
	};


	module.addNewUserSession = (username, sId) => {
		redisClient.hmset(userSessionPrefix + username, {fieldSessID : sId});
	};



	module.getAllUserSession = (callback) => {
		
		var promise = new Promise(function(resolve, reject){
			redisClient.keys(userSessionPrefix + "*", (err,list) => {
				resolve(list);
			}) 
		})

		promise.then(function(list) {
			
			accumulateSessionList(list, (accumList) => {
				return callback(accumList);
			})

		})
		
	}

	let accumulateSessionList = (list, callback) => {

		var accumList = []

		let step = function(i) {
			if(i < list.length) {
				let key = list[i];
				let usernameKey = key.split(":")[1];
				redisClient.hgetall(key, (err, obj) => {
					let user = {
						username: usernameKey,
						sId: obj.fieldSessID
					}
					accumList.push(user);
					step(i + 1);
				})
			} else {
				// logger.debug('Finished loading data into list');
				// console.log(accumList);
				return callback(accumList);
			}
		}

		step(0);
	}

	let accumSessionListFiltered =(list, filter, callback) => {
		var accumList = []

		let step = function(i) {
			if(i < list.length) {
				let key = list[i];
				let usernameKey = key.split(":")[1];
				redisClient.hgetall(key, (err, obj) => {
					let user = {
						username: usernameKey,
						sId: obj.fieldSessID
					}
					if(filter != user.username){
						accumList.push(user);
					}
				
					step(i + 1);
				})
			} else {
				// logger.debug('Finished loading data into list');
				// console.log(accumList);
				return callback(accumList);
			}
		}

		step(0);
	}



	module.delUserSessionByUsername = (username, callback) => {
		redisClient.del(userSessionPrefix + username, (e) => {
			if(e === 1){
				logger.debug('User is found and has been deleted from redis');
			} else if(e === 0){
				logger.debug('User not found');
			}
			return callback(true);

		});
	};


	module.scanSessions = (text,username, callback) => {


		var scanList = new Promise((resolve, reject) => {
			var cursor = '0';
			redisClient.scan(cursor, "MATCH", "sessionUser:" + text + "*",
			 function(err, result) {
			 	if(err) {
			 		return callback(false);
			 	}
			 	cursor = result[0];
			 	if(cursor === '0'){
			 		resolve(result[1]);
			 	} else {
			 		return scan();
			 	}
			 });
		})

		scanList.then(function(list) {
			accumSessionListFiltered(list, username, (accumList) => {
				return callback(accumList);
			})
		})
	}





	//------------ COMMONS UTIL --------------------------------//
	let getObjectByKey = (key) => {
		let usernameKey = key.split(":")[1];
		return new Promise(function(resolve, reject) {
			redisClient.hgetall(key, (err, obj) => {
				let user = {
					username: usernameKey,
					sId: obj.fieldSessID
				}
				resolve(user);
			})
		})
	}

	return module;
}