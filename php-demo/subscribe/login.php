<?php
	if(isset($_COOKIE['uid']) && $_COOKIE['uid']){
		header('Location: index.php');
		exit(0);
	}
	if(!empty($_POST)){
		$username = $_POST['username'];
		if($username){
			setcookie('uid',$username);
			header('Location: index.php');
		}
	}
	include './template/login.html';
?>