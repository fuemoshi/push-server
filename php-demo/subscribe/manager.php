<?php

$appConf = array(
	'appId' => '10001',
	'appSecret' => '06619b227f401ba76babdd77393cef3d'
);

function authSign($params, $appSecret){
	$str = '';
	ksort($params);
	foreach($params as $k => $v){
		$str .= $k . '=' . $v . '&';
	}
	$str .= $appSecret;
	return md5($str);
}

function request_by_curl($remote_server, $post_string){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $remote_server);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $post_string);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $data = curl_exec($ch);
    curl_close($ch);
    return $data;
}


if($_POST){
	if($_POST['act'] == 'notify'){
		$pushSvr = 'http://push-server-demos.vip.com:5000/inform';
		$params = array(
			'appId' => $appConf['appId'],
			'time'  => time(),
			'mode'  => 'broadcast_group',
			'group' => implode(',',$_POST['groups']),
			'msg'   => 'available'
		);
		$params['appSign'] = authSign($params,$appConf['appSecret']);

		$data = request_by_curl($pushSvr,http_build_query($params));
		exit($data);
	}
	exit;
}	

$productNum = 30;
$products = array();
for($i = 1; $i <= 30; ++$i){
	$products[10000+$i] = array(10000+$i, '商品'.$i);
}

include "./template/manager.html";