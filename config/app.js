/**
 * @author Simba.wei <Simba.wei@vipshop.com>
 */

module.exports = {
	'10000' : {
		appId     : '10000',
		appSecret : '5e90bac2abc385892d2e22baf7166c47',
		type      : 'chat', //即时聊天应用
		appName   : 'chatRoom',
		maxGroupNum : 10, //允许开启最多房间数
		maxGroupUserNum : 500, //一个房间允许最多人数
	},
	'10001' : {
		appId     : '10001',
		appSecret : '06619b227f401ba76babdd77393cef3d',
		type      : 'subscribe', //订阅通知应用
		appName   : 'stock',
		maxGroupNum : -1, //无限制
		maxGroupUserNum : -1
	}
}