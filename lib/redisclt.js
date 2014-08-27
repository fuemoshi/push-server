/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */

var redis  = require("redis");
var logger = LOG4JS.getLogger('app');

APP_LIB.RedisClient = function(conf){
	this.client = redis.createClient(conf.port, conf.host, {connect_timeout:3000});
	this.client.on("error",function(err){
		logger.error(err);
	});
}

APP_LIB.RedisClient.prototype.set = function(key, val, callback){
	callback = callback || function(err,reply){};
	this.client.set(key, val, callback);
}

APP_LIB.RedisClient.prototype.get = function(key, val, callback){
	callback = callback || function(err,reply){};
	this.client.get(key, val, callback);
}

APP_LIB.RedisClient.prototype.sadd = function(key, val, callback){
	callback = callback || function(err,reply){};
	this.client.sadd(key, val, callback);
}

APP_LIB.RedisClient.prototype.srem = function(key, val, callback){
	callback = callback || function(err,reply){};
	this.client.srem(key, val, callback);
}