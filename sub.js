/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */
require('./global');

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

