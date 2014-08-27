/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */

var map  = APP_SOCKET_MAP;

module.exports = (function(){
	
	//广播给应用的所有用户
	var broadcast_all = function(data, isPublic, pulicUidArr){

		var usAlias = map[data.appId]['uidSocketMap'];
		
		for(var uid in usAlias){
			for(var i = 0; i < usAlias[uid].length; ++i){
				var socket = usAlias[uid][i];
				if(isPublic && socket.group){
					//只通知大厅用户
					continue; 
				}
				if(isPublic && pulicUidArr !== undefined
					&& pulicUidArr.indexOf(uid) == -1){
					//只通知大厅的某些用户
					continue;
				}
				socket.emit(data.eventName , data.msg);	
			}
		}
	}

	//广播房间里面的所有用户
	var broadcast_group = function(data, uidArr){

		var appId = data.appId;
		var groupArr = typeof(data.group) == 'string' ? [data.group] : data.group;

		if(typeof(data.msg) == 'string'){
			var msg = data.msg;
			data.msg = {};
			data.msg.msg = msg;
		}

		for(var i = 0; i < groupArr.length; ++i){
			var guAlias = map[appId]['groupUidMap'];
			var usAlias = map[appId]['uidSocketMap'];

			//将group信息挂载到data.msg上
			data.msg.group = groupArr[i];
			if(!guAlias[groupArr[i]]){
				continue;
			}
			//
			for(var j = 0; j < guAlias[groupArr[i]].length; ++j){
				var uid = guAlias[groupArr[i]][j];
				//如果有传uidArr参数，则只通知这部份用户
				if(uidArr != undefined && uidArr.indexOf(uid) == -1){
					continue;
				}
				if(!usAlias[uid]){
					continue;
				}
				//
				for(var k = 0; k < usAlias[uid].length; ++k){
					var socket = usAlias[uid][k];
					//分两种类型
					if(APP_CONFIG[appId].type == 'chat'){
						if(groupArr[i] == socket.group){
							socket.emit(data.eventName , data.msg);
						}
					}else{ //subcribe
						socket.emit(data.eventName , data.msg);
					}
				}
			}
		}

	}

	//通知房间里面对应的用户
	var private_group_uid = function(data){
		var uidArr = typeof(data.uid) == 'string' ? [data.uid] : data.uid;
		broadcast_group(data, uidArr);
	}

	//通知大厅所有用户，这里相当于遍历所有socket，性能方面需要测试
	var broadcast_public = function(data){
		broadcast_all(data, true);
	}

	//通知大厅某个/些用户
	var private_public_uid = function(data){
		var uidArr = typeof(data.uid) == 'string' ? [data.uid] : data.uid;
		broadcast_all(data, true, uidArr);
	}

	//新增uid至group
	var add_uid_group = function(data){
		var uidArr   = typeof(data.uid) == 'string' ? [data.uid] : data.uid;
		var groupArr = typeof(data.group) == 'string' ? [data.group] : data.group;
		var guAlias  = map[data.appId]['groupUidMap'];
		for(var i = 0; i < groupArr.length; ++i){
			if(!guAlias[groupArr[i]]){
				guAlias[groupArr[i]] = [];
			}
			for(var j = 0; j < uidArr.length; ++j){
				if(guAlias[groupArr[i]].indexOf(uidArr[j]) == -1){
					guAlias[groupArr[i]].push(uidArr[j]);
				}
			}
		}
		APP_LIB.COMMON.debug(map);
	}

	//更新所有uid与group映射关系，此方法需要遍历所有group，要注意性能
	var update_uid_group = function(data){
		var uidArr   = typeof(data.uid) == 'string' ? [data.uid] : data.uid;
		var groupArr = typeof(data.group) == 'string' ? [data.group] : data.group;
		var guAlias  = map[data.appId]['groupUidMap'];
		for(var i = 0; i < uidArr.length; ++i){
			for(var groupId in guAlias){
				var guPos = guAlias[groupId].indexOf(uidArr[i]);
				if(guPos != -1){
					guAlias[groupId].splice(guPos, 1);
					if(guAlias[groupId].length == 0){
						delete guAlias[groupId];
					}
				}
			}
		}
		add_uid_group(data);
	}

	//取消订阅
	var cancel_uid_group = function(data){
		var uidArr   = typeof(data.uid) == 'string' ? [data.uid] : data.uid;
		var groupArr = typeof(data.group) == 'string' ? [data.group] : data.group;
		var guAlias  = map[data.appId]['groupUidMap'];
		for(var i = 0; i < groupArr.length; ++i){
			if(!guAlias[groupArr[i]]){
				continue;
			}
			for(var j = 0; j < uidArr.length; ++j){
				var guPos = guAlias[groupArr[i]].indexOf(uidArr[j]);
				if(guPos != -1){
					guAlias[groupArr[i]].slice(guPos, 1);
				}
				if(guAlias[groupArr[i]].length == 0){
					delete guAlias[groupArr[i]];
				}
			}
		}
	}

	return {
		inform : function(data){
			//暂时不做消息回传给子进程
			//eval会执行所有传过来的字符串，这里注意先验证
			if(INFORM_MODE.indexOf(data.mode) == -1){
				return;
			}
			eval(data.mode + '(' + JSON.stringify(data) + ')');
		}
	};

})();