module.exports = function(obj){

	var module = {}
	var mongoose = obj.mongoose;
	var logger = obj.logger;
	var config = obj.config;


	//INIT MONGO DB connection
	let initMongo = function(){
		mongoose.connect(config.database);

		mongoose.connection.on('connected', () => {
			logger.info("Connected to mongoDB " + config.database);
		});

		mongoose.connection.on('error', (err) => {
			logger.debug("Error connecting to MongoDB " + err);
		});
	}

	module.init = () => {
		initMongo();
	}

	return module;
}