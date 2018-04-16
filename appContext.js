//anything that is store in this context should be available globally
var AppContext = (function (){

	this.AppPassport = null;
	this.redisModule = null

	this.setAppPassport = function(passport) {
		this.AppPassport = passport;
	}

	this.setRedisModule = function(redis) {
		this.redisModule = redis;
	}


	return this;

})();

module.exports = AppContext;