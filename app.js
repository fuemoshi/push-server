/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */

//全局常量，当前项目路径
APP_PATH = __dirname;

//debug
DEBUG = true;

//REDIS 分片全局变量
REDIS_SERVERS = {
	NODE_NUM : 256,
	HASH     : []
}

SYS_CONFIG = require('./config/system');
APP_CONFIG = require('./config/app');

LOG4JS = require('log4js');


//引入库文件
APP_LIB = {};
require('./lib/redis');
require('./lib/common');
require('./lib/extends');

//通知方式
INFORM_MODE = [
	'broadcast_all', //广播应用所有人
	'broadcast_public', //广播大厅中所有人（即不传group的客户端连接）
	'broadcast_group', //广播给某个/些房间所有人
	'private_public_uid', //私信给大厅中某个/些用户
	'private_group_uid', //私信给某个/些房间的某/某些用户
	//
	'add_uid_group',  //新增订阅某个/些分类，注意会去重
	'cancel_uid_group', //取消订阅某个/些分类
	'update_uid_group'
];


//初使化
require('./init');
