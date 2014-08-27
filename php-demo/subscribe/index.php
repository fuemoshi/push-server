<?php	
	if(!isset($_COOKIE['uid']) || !$_COOKIE['uid']){
		header('Location: login.php');
		exit(0);
	}

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

	$appConf = array(
		'appId' => '10001',
		'appSecret' => '06619b227f401ba76babdd77393cef3d'
	);
	
	if($_POST){
		if($_POST['act'] == 'update_uid_group'){
			$pushSvr = 'http://push-server-demos.vip.com:5000/inform';
			$params = array(
				'uid'   => $_COOKIE['uid'],
				'appId' => $appConf['appId'],
				'time'  => time(),
				'mode'  => 'update_uid_group',
				'group' => implode(',',$_POST['groups'])
			);
			$params['appSign'] = authSign($params,$appConf['appSecret']);

			$data = request_by_curl($pushSvr,http_build_query($params));

			setcookie($_COOKIE['uid']. '_subProductIds',implode(',',$_POST['groups']), time() + 24*3600*365);

			exit($data);
		}
		exit;
	}

	isset($_GET['group']) ||  $_GET['group'] = '';
	$uid = $_COOKIE['uid'];
	$subProducts = array();
	$subProductIds = array();
	if(isset($_COOKIE[$uid.'_subProductIds'])){
		$subProductIds = explode(',',$_COOKIE[$uid.'_subProductIds']);
	}

	$productNum = 30;
	$products = array();
	$unSubProducts = array();
	for($i = 1; $i <= 30; ++$i){
		$pid = 10000 + $i;
		if(in_array($pid, $subProductIds)){
			$subProducts[$pid] = array($pid , '商品'.$i);
		}else{
			$unSubProducts[$pid] = array($pid , '商品'.$i);
		}
		$products[$pid] = array($pid , '商品'.$i);
	}

    $params = array(
		'uid'   => $_COOKIE['uid'],
		'appId' => $appConf['appId'],
		'time'  => time()
	);

    if($_GET['group']){
    	$params['group'] = $_GET['group'];
    }

	$params['appSign'] = authSign($params,$appConf['appSecret']);

	if(!empty($_REQUEST)){
		isset($_REQUEST['act']) || $_REQUEST['act'] = '';
	    //logout
	    if($_REQUEST['act'] == 'logout'){
	        setcookie('uid');
	        header('Location: login.php');
	    }
	}


	include './template/index.html';
?>