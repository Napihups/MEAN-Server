/* App server app */

const express = require('express');
const app = express();
// const http = require('http').Server(app);
const redis = require('redis');
const logger = require('js-logging').console();
const pathModule = require('path');
const bodyParser = require('body-parser');
const corsModule = require('cors');
const mongoose = require('mongoose');
const config = require('./config/database');

const PORT = 3000;
const redis_PORT = 6379;

//START express & io
var x = app.listen(PORT);
const io = require('socket.io').listen(x);
io.set('origin', 'http://locahost:4200');
//---------------------------------------------//

//CUSTOM MODULES
const appContext = require('./appContext');
const users = require('./routes/users');
const sessions = require('./routes/sessions');
const route_Invite = require('./routes/route-invite');
const tokenUtils = require('./middleware/tokenUtilities')();
const server = require('./app-modules/server')({
	app: app,
	bodyParser: bodyParser,
	cors: corsModule,
	port: PORT,
	logger: logger,
	express: express,
	path: pathModule,
	users: users,
	sessions: sessions,
	route_Invite: route_Invite
});
const mongoose_repo = require('./app-modules/mongooseModule')({
	mongoose: mongoose,
	config: config,
	logger: logger
});
const redis_repo = require('./app-modules/redisModule')({
	redis: redis,
	host: 'localhost',
	port: redis_PORT,
	logger: logger
});

const socket = require('./app-modules/socketModule')({
	io: io,
	redis_repo: redis_repo,
	logger: logger,
	tokenUtils: tokenUtils
})

appContext.setRedisModule(redis_repo);


//START UP SERVER 
server.init(function(e){
	if(e){
		logger.info("Server listening on port " + PORT);
	}
});

//INIT MONGODB 
mongoose_repo.init();

//INIT REDIS 
redis_repo.init();

//SETUP ALL SOCKET ENDPOINT
socket.startSocket();