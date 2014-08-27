/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */

var fs     = require('fs');
var path   = require('path');
var server = require('http').Server();
var io     = require('socket.io')(server);
var cp     = require('child_process');

//进程ID写入文件以供脚本使用
var pidfile = path.join(SYS_CONFIG.pidPath);
fs.writeFileSync(pidfile, process.pid);

process.on('SIGTERM', function(){
	if(fs.existsSync(pidfile)){
		fs.unlinkSync(pidfile);
	}
	process.exit(0);
});

//为Redis集群切片
var largeNum = REDIS_SERVERS.NODE_NUM;
var startCount = 0;
var divCount = SYS_CONFIG.cache.redis.length;

if( divCount > 0 ){
	var step = largeNum / divCount;
	for(var i = 0; i < divCount; ++i ){
		var startNum = startCount * step;
		var endNum = startCount < (divCount-1) ? ((startCount+1) * step - 1) : largeNum - 1;

		REDIS_SERVERS.HASH.push({
			host  : SYS_CONFIG.cache.redis[i][0],
			port  : SYS_CONFIG.cache.redis[i][1],
			start : startNum,
			end   : endNum
		});

		startCount++;
	}
}

//日志初使化，为每个应用建不同日志目录
var log4jsConf = [];
log4jsConf.push(SYS_CONFIG.log4js);
for(var appId in APP_CONFIG){
	var tmpConf = {};
	for(var k in SYS_CONFIG.log4js){
		tmpConf[k] = SYS_CONFIG.log4js[k];
	}
	tmpConf.category = appId;
	tmpConf.filename = APP_PATH + '/logs/' + appId + '/';
	if(!fs.existsSync(tmpConf.filename)){
		fs.mkdirSync(tmpConf.filename);
	}
	log4jsConf.push(tmpConf);
}
LOG4JS.configure({
	appenders : log4jsConf
});

//socket.io监听客户端连接
APP_SOCKET_MAP = {}; //存储对应关系，注意内存控制
LOGGER = {};

for(var appId in APP_CONFIG){
	APP_SOCKET_MAP[appId] = {};
	APP_SOCKET_MAP[appId].uidSocketMap = {}; //存储 uid => socket
	
	//只有在chat类型下 disconnect 时才会销毁，这对象将来可存redis
	APP_SOCKET_MAP[appId].groupUidMap = {};  //存储 group => uid 

	LOGGER[appId] = LOG4JS.getLogger(appId);
}

var WebClient = require(APP_PATH + '/controllers/webclt');

io.set('authorization', function(handshakeData, callback) {
	//将来这里可以优化，在握手时就验证连接的合法性，从而不必为非法连接创建socket
    callback(null, true);
});

io.on('connection', function(socket){
	//
	var webclt = new WebClient();
	webclt.register(socket);
});


server.listen(SYS_CONFIG.listenPort, function(){
	console.log('listenning on *:4000 for client');
});


//子进程监听来自 push 消息的请求
var notifySvr = require(APP_PATH + '/controllers/notifysvr');
var workers = {};

var createWorker = function(){
	
	var worker = cp.fork(__dirname + '/sub.js');
	worker.on('exit', function(){
		//自动重启子进程
		console.log('worker process exit');
		createWorker();
	});
	worker.on('message', function(m){
		///
		APP_LIB.COMMON.debug('get message from notify process');
		APP_LIB.COMMON.debug(m);
		///
		if(m.act && m.data && notifySvr[m.act] 
			&& m.data.appId && APP_CONFIG[appId]){
			notifySvr[m.act](m.data);
		}
	});
	workers[worker.pid] = worker;
	console.log('Create worker . pid ' + worker.pid);
}

createWorker();

process.on('exit', function(){
	for(var pid in workers){
		workers[pid].kill();
	}
});