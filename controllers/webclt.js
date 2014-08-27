/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */

var map     = APP_SOCKET_MAP; //别名
var appConf = APP_CONFIG;
var notifySvr = require(APP_PATH + '/controllers/notifysvr');

var WebClient = function(){

}

WebClient.error = function(msg, socket, isCloseSocket){
	console.log(msg);

	isCloseSocket = isCloseSocket === undefined ? true : isCloseSocket;
	if(msg.stack){
		console.log(msg.stack);
	}
	if(socket.appId && LOGGER[socket.appId]){
		LOGGER[socket.appId].error(msg);
		if(msg.stack){
			LOGGER[socket.appId].error(msg.stack);
		}
	}
	if(isCloseSocket){
		socket.disconnect();
	}
}

WebClient.prototype.register = function(socket){

	var that = this;
	var query = socket.client.request._query;
	//
	var data = {
		appId : query.appId,
		appSign : query.appSign,
		time  : query.time,
		uid   : query.uid,
		group : undefined
	};

	//option
	if(query.group){
		data.group = query.group;
		if(typeof(data.group) != 'string'){
			WebClient.error('group type error', socket);
			return;
		}
	}
	
	APP_LIB.COMMON.debug(data);

	//注：uid, group后面要做格式验证
	if(!data.appId || !data.appSign  || !data.uid ){
		WebClient.error('params error', socket);
		return;
	}

	if(!appConf[data.appId]){
		WebClient.error('app id not exists', socket);
		return;
	}
	
	//将参数挂载到socket
	//注意将来内存不足时，可以将 socket.id => 数据存入redis	
 	socket.appId = data.appId;
 	socket.uid   = data.uid;
 	socket.group = data.group;

 	try{
 		var appSecret = appConf[data.appId].appSecret;
		var sign = APP_LIB.COMMON.authSign(appSecret, data);
		if(data.appSign != sign){
			WebClient.error('sign error', socket);
			return;
		}

	 	//一个用户不超过100个客户端
		var maxUidSocket = 100;
		//约定用首字母加 alias做为长变量对象的别名
 		var usAlias = map[data.appId]['uidSocketMap']; //别名

	 	if(!usAlias[data.uid]){
	 		usAlias[data.uid] = [socket];
	 	}else if(usAlias[data.uid].length < maxUidSocket){
	 		usAlias[data.uid].push(socket);
	 	}
	 	
 		if(data.group){
 			var guAlias = map[data.appId]['groupUidMap'];

 			if(!guAlias[data.group]){
				if(APP_LIB.COMMON.countMem(guAlias) > 
					APP_CONFIG[data.appId].maxGroupNum){
					//notify too much room
					WebClient.error('too much room', socket);
					return;
				}
				guAlias[data.group] = [];
			}
			if(APP_CONFIG[data.appId].maxGroupUserNum != -1 
				&& guAlias[data.group].length
					> APP_CONFIG[data.appId].maxGroupUserNum){
				//notify room is full
				WebClient.error('room is full', socket);
				return;
			}
			////
			if(guAlias[data.group].indexOf(data.uid) == -1){
				guAlias[data.group].push(data.uid);
			}
 		}

 	}catch(err){

 		WebClient.error(err, socket);
		return;
 	}

 	APP_LIB.COMMON.debug(map);

 	socket.on('disconnect', that.disconnect);
	socket.on('message', that.message);
}

WebClient.prototype.message = function(data){
	var socket = this;
	//仅接受来自聊天应用的信息
	if(!socket.appId || APP_CONFIG[socket.appId].type != 'chat'){
		return;
	}
	if(!data.eventName){
		data.eventName = 'message';
	}
	if(socket.group && socket.group.length > 0){
		
	}
	data.appId = socket.appId;
	//内容
	var msg = data.msg;
	data.msg = {};
	data.msg.msg = msg;
	data.msg.time = Date.now();
	data.msg.dateTime = require('moment')().format("YYYY-MM-D HH:mm:ss");
	data.msg.uid = socket.uid;
	data.msg.mode = data.mode;

	if(data.mode == 'private_public_uid' 
		|| data.mode == 'private_group_uid'){
		data.msg.toUid = data.uid;
		data.uid = [ socket.uid , data.uid ];
	}
	
	APP_LIB.COMMON.debug(data);

	//考虑以后这里追加验证data正确性
	try{
		notifySvr.inform(data);
	}catch(err){
		WebClient.error(err, socket, false);		
	}
}

WebClient.prototype.disconnect = function(){
	var socket = this;
	//
	if(!map[socket.appId]){
		return;
	}

	try{
		var usAlias = map[socket.appId]['uidSocketMap']
		//remove user => socket
		if(!socket.uid || !usAlias[socket.uid]){
			return;
		}
		
		var pos = usAlias[socket.uid].indexOf(socket);
		if(pos != -1){
			usAlias[socket.uid].splice(pos, 1);
		}
		//只有聊天应用才需要销毁组与用户之间的关系
		if(APP_CONFIG[socket.appId].type == 'chat'){
			var guAlias = map[socket.appId]['groupUidMap'];

			if(socket.group && guAlias[socket.group]){
				var isGroupExist = false;
				for(var i = 0; i < usAlias[socket.uid].length; ++i){
					var uSocket = usAlias[socket.uid][i];
					if(uSocket.group == socket.group){
						isGroupExist = true;
					}
				}
				if(isGroupExist === false){
					var guPos = guAlias[socket.group].indexOf(socket.uid);
					if(guPos != -1){
						guAlias[socket.group].splice(guPos, 1);
					}
					if(guAlias[socket.group].length == 0){
						delete guAlias[socket.group];
					}
				}
			}
		}

		if(usAlias[socket.uid].length == 0){
			delete usAlias[socket.uid];
		}

	}catch(err){
		WebClient.error(err, socket);
		return;
	}
}

module.exports = WebClient;