/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */

var appConf = APP_CONFIG;

module.exports = (function(){
	
	var RET_SUCCESS = 0;
	var RET_PARAMS_ERROR = 1;
	var RET_SIGN_ERROR = 2;

	return {
		//主要作接收和验证的工作
		inform : function(req, res){
			
			var data = req.body;

			APP_LIB.COMMON.debug(data);

			if(!data.appId || !data.appSign
				|| !data.mode || typeof(data.mode) != 'string'){
				res.send({code : RET_PARAMS_ERROR , 'msg': 'params error'});
				return;
			}

			if(INFORM_MODE.indexOf(data.mode) == -1){
				res.send({code : RET_PARAMS_ERROR , 'msg': 'param mode error'});
				return;
			}
			//不超过200个字符（中英文）
			if(data.msg && data.msg.length > 200){
				res.send({code : RET_PARAMS_ERROR , 'msg': 'msg too long'});
				return;
			}

			var appSecret = appConf[data.appId].appSecret;
			var sign = APP_LIB.COMMON.authSign(appSecret, data);
			if(data.appSign != sign){
				res.send({code : RET_SIGN_ERROR , 'msg': 'sign error'});
				return;
			}

			if(data.mode != 'add_uid_group' 
				&& data.mode != 'cancel_uid_group'
				&& data.mode != 'update_uid_group'){
				if(!data.msg){
					res.send({code : RET_SIGN_ERROR , 'msg': 'empty msg'});
					return;
				}
				data.eventName = data.eventName || 'message';
			}

			switch ( data.mode ){
				case 'broadcast_all':
				case 'broadcast_public':  
					break;
				case 'broadcast_group': 
					data.group = APP_LIB.COMMON.strToArr(data.group);
					if(data.group.length == 0){
						res.send({code : RET_PARAMS_ERROR , 'msg': 'group is empty'});
						return;
					}
					break;
				case 'private_group_uid':
				case 'add_uid_group':
				case 'cancel_uid_group':
				case 'update_uid_group':
					if(!data.group || !data.uid){
						res.send({code : RET_PARAMS_ERROR , 'msg': 'empty group and uid'});
						return;
					}
					if(typeof(data.group) != 'string'){
						res.send({code : RET_PARAMS_ERROR , 'msg': 'valide type of group'});
						return;
					}

					data.group = APP_LIB.COMMON.strToArr(data.group);
					if(data.group.length == 0){
						res.send({code : RET_PARAMS_ERROR , 'msg': 'group is empty'});
						return;
					}

					if(typeof(data.uid) != 'string'){
						res.send({code : RET_PARAMS_ERROR , 'msg': 'valide type of uid'});
						return;
					}

					data.uid = APP_LIB.COMMON.strToArr(data.uid);
					if(data.uid.length == 0){
						res.send({code : RET_PARAMS_ERROR , 'msg': 'uid is empty'});
						return;
					}
					break;

				case 'private_public_uid':
					if(!data.uid){
						res.send({code : RET_PARAMS_ERROR , 'msg': 'empty uid'});
						return;
					}
					if(typeof(data.uid) != 'string' && !(data.uid instanceof Array)){
						res.send({code : RET_PARAMS_ERROR , 'msg': 'valide type of uid'});
						return;
					}
					break;
				default : 
					res.send({code : RET_PARAMS_ERROR , 'msg': 'mode not found'});
					return;
				break;
			}
			process.send({act:'inform',data:data});
			res.send({code : RET_SUCCESS, 'msg' : 'success'});
		},
		//
		getOnline : function(req, res){

		}
	}
})();