<?php
ini_set("log_errors", 1);
ini_set("error_log", "error/upload-error.log");

include('include/config.php');

if (!isset($_SESSION['user_data']['id'])) {
	$return = array(
		'status'	=> 0,
		'message'	=> 'Disculpe ha ocurrido un error...',
	);
	exit(json_encode($return));
}

if (!isset($_POST)) {
	$return = array(
		'status'	=> 0,
		'message'	=> 'No hay post iniciados...',
	);
	exit(json_encode($return));
}

if (!isset($_FILES['file'])) {
	$return = array(
		'status'	=> 0,
		'message'	=> 'Disculpe a ocurrido un error #1...',
	);
	exit(json_encode($return));
}

$me = $_SESSION['user_data']['id'];

$file = $_FILES['file'];

$name = $file['name'];

$pt = explode(".", $name);

$ext = array_pop($pt);

$disallowed_ext = array('php', 'php0', 'php1', 'php2', 'php3', 'php4', 'php5', 'cgi', 'exe', 'bat');

if (!in_array($ext, $disallowed_ext)) {
	$newname = "$name.tmp";
	$newpath = "uploads/files/" . $me;
	@mkdir($newpath);
	$newpath .= "/$newname";

	if (move_uploaded_file($file['tmp_name'], $newpath)) {
		$return = array(
			'status'	=> 1,
			'message'	=> $name
		);
		exit(json_encode($return));
	}
} else {
	$return = array(
		'status'	=> 0,
		'message'	=> 'No se permite el formato del fichero...',
	);
	exit(json_encode($return));
}
