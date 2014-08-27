<?php	
	if(!isset($_COOKIE['uid']) || !$_COOKIE['uid']){
		header('Location: login.php');
		exit(0);
	}
	isset($_GET['group']) ||  $_GET['group'] = '';

	function authSign($params, $appSecret){
		$str = '';
		ksort($params);
		foreach($params as $k => $v){
			$str .= $k . '=' . $v . '&';
		}
		$str .= $appSecret;
		return md5($str);
	}

	$appConf = array(
		'appId' => '10000',
		'appSecret' => '5e90bac2abc385892d2e22baf7166c47'
	);
	
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