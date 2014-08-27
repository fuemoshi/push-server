/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */

var crypto = require('crypto');
var buffer = require('buffer');

module.exports = {
	/**
	*	签名验证
	*/
	authSign : function(appSecret, params){
		var arr = [];
		for(var key in params){
			if(key == 'appSign' || params[key] == undefined){
				continue;
			}
			arr.push(key);
		}
		arr.sort();
		var str = '';
		for(var i = 0; i < arr.length; ++i){
			str += arr[i] + '=' + params[arr[i]] + '&';
		}
		str += appSecret;
		return crypto.createHash('md5').update(str).digest('hex');
	},
	/**
	* 	计算对象成员个数
	*/
	countMem : function(obj){
		var num = 0;
		for(var i in obj){
			num++;
		}
		return num;
	},
	/*
	* Debug
	*/
	debug : function(msg){
		if(DEBUG){
			console.log(msg);
		}
	},
	/*
	* 字符串转数组，去除空元素
	*/
	strToArr : function(str, delimiter){
		if(!str) return [];
		delimiter = delimiter || ',';
		var arr = str.split(delimiter);
		var res = [];
		for(var i = 0; i < arr.length; ++i){
			if(arr[i] && typeof(arr[i]) == 'string'){
				res.push(arr[i]);
			}
		}
		return res;
	}
}