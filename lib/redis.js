/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */

require('./redisclt');
var crc32 = require("crc32");

APP_LIB.RedisCache = (function(){

	var instances = {};

	var _hashRD = function(key, m){
		var m = m || 256;
		return parseInt(crc32(key),16) & (m - 1);
	}

	function getCacheInstance(conf){
		var key = "redis" + conf.host + "_" + conf.port + "_";
		if(!instances[key]){
			instances[key] = new APP_LIB.RedisClient(conf);
		}
		return instances[key];
	}

	return {
		hashRD : function(key){
			var nodeNum = REDIS_SERVERS.NODE_NUM;
			var hashId  = _hashRD(key, nodeNum);
			for(var i = 0; i < REDIS_SERVERS.HASH.length; ++i){
				var redisConf = REDIS_SERVERS.HASH[i];
				if(hashId >= redisConf.start && hashId <= redisConf.end){
					return getCacheInstance(redisConf);
				}
			}
			return getCacheInstance(servers[servers.length-1]);
		}
	};
})();