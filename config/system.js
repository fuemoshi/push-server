/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */

module.exports = {
	//logs
	logPath : APP_PATH + '/logs',
	log4js : {
		type : 'dateFile',
		filename : APP_PATH + '/logs/app/',
		pattern : 'yyyy-MM-dd.log',
		maxLogSize : 1024 * 1024,
		alwaysIncludePattern : true,
		backups : 3,
		category : 'app'
	},
	//socket.io listen post
	listenPort : 4000,
	//pid save path
	pidPath : APP_PATH + '/run/app.pid',
	//redis cluster
	cache : {
		redis : [
			[
				process.env.PUSHSERVER_CACHE_REDIS_HASH_A_HOST,
				process.env.PUSHSERVER_CACHE_REDIS_HASH_A_PORT
			],
			[
				process.env.PUSHSERVER_CACHE_REDIS_HASH_B_HOST,
				process.env.PUSHSERVER_CACHE_REDIS_HASH_B_PORT
			],
			[
				process.env.PUSHSERVER_CACHE_REDIS_HASH_C_HOST,
				process.env.PUSHSERVER_CACHE_REDIS_HASH_C_PORT
			]
		]
	}
};

