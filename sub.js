/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */
 
//全局常量，当前项目路径
APP_PATH = __dirname;

SYS_CONFIG = require('./config/system');
APP_CONFIG = require('./config/app');

LOG4JS = require('log4js');

//引入库文件
APP_LIB = {};
require('./lib/common');

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

DEBUG = true;

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false}));

//parse application/json
app.use(bodyParser.json());

//parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))


process.on('message', function(m){
	//
});

//允许跨域请求
app.all('*', function(req, res, next){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	next();
});

//routes
var subNotify = require(APP_PATH + '/controllers/subnotify');

app.post('/inform', subNotify.inform);
app.get('/online', subNotify.getOnline);

app.listen(5000, function(){
	console.log('listenning on *:5000 for app notify');
});

