module.exports = function(server){

	var module = {};
	var app = server.app;
	var cors = server.cors;
	var logger = server.logger;
	var bodyParser = server.bodyParser;
	var port = server.port;
	var express = server.express;
	var path = server.path;
	var users = server.users;
	var sessions = server.sessions;
	var route_Invite = server.route_Invite;



	function setupRouter() {

		app.use(function(req, res, next) {
		  res.header("Access-Control-Allow-Origin", "http://localhost:4200");
		  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		  next();
		});

		app.use('/users', users);
		app.use('/sessions', sessions);
		app.use('/invites', route_Invite);

		app.get('/', function(req, res){
			res.send("Invalid endpoint");
		});
	}


	function setupMiddleware(){
		app.use(cors());
		app.use(bodyParser.json());
		app.use(express.static(path.join(__dirname, 'public')));
	}

	module.init = function(callback) {
		setupMiddleware();
		setupRouter();
		return callback(true);
	};

	return module;

}