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
if (!isset($_FILES['avatar'])) {
	$return = array(
		'status'	=> 0,
		'message'	=> 'Disculpe a ocurrido un error #1...',
	);
	exit(json_encode($return));
}

/* original name */
$imagen = $_FILES['avatar'];
/* create array */
$pt = explode(".", $imagen['name']);
/* extension */
$ext = array_pop($pt);
$ext = strtolower($ext);

$myself = $_SESSION['user_data']['id'];

/* new name */
$newname = $myself . "-" . dechex(rand(65536, 1048575)) . ".$ext";

/* extensions disabled */
$disallowed_ext = array('php', 'php0', 'php1', 'php2', 'php3', 'php4', 'php5', 'htm', 'html', 'shtml', 'pl', 'jsp', 'cgi', 'exe', 'bat', 'cmd', 'js', 'asp', 'css', 'swf');

if ($ext == "gif" || $ext == "jpeg" || $ext == "jpg" || $ext == "png") {
	if (!in_array($ext, $disallowed_ext)) {
		if (move_uploaded_file($imagen['tmp_name'], "uploads/temp/$newname")) {

			include_once('include/resize.php');

			$img = new resize;
			$img->foto("uploads/temp/$newname");
			$img->create_thumb("uploads/thumbs/0/$newname", 44, 42);
			$img->create_thumb("uploads/thumbs/1/$newname", 200, 200);
			$img->create("uploads/thumbs/2/$newname", 500);

			@unlink("uploads/temp/$newname");

			$upd = $db->query("UPDATE users SET avatar='" . $newname . "' WHERE id=" . $myself);

			if (!$upd) {
				$return = array(
					'status'	=> 0,
					'message'	=> 'Disculpe ha ocurrido un error intentelo m&aacute;s tarde...',
				);
				exit(json_encode($return));
			} elseif ($upd) {
				if ($_SESSION['user_data']['avatar']) {
					@unlink("uploads/thumbs/0/" . $_SESSION['user_data']['avatar']);
					@unlink("uploads/thumbs/1/" . $_SESSION['user_data']['avatar']);
					@unlink("uploads/thumbs/2/" . $_SESSION['user_data']['avatar']);
				}
				$_SESSION['user_data']['avatar'] = $newname;
			}

			/* insert comand */
			insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "changethumb|$myself|$newname"));

			$return = array(
				'status'	=> 1,
				'message'	=> $newname
			);
			exit(json_encode($return));
		}
	} else {
		$return = array(
			'status'	=> 0,
			'message'	=> 'Solo se permiten los formatos (jpg, gif, png)',
		);
		exit(json_encode($return));
	}
} else {
	$return = array(
		'status'	=> 0,
		'message'	=> 'Solo se permiten los formatos (jpg, gif, png)',
	);
	exit(json_encode($return));
}

function insert($t, $a)
{
	global $db, $now;
	if ($t == 'commands') $a['mtime'] = $now;
	$qry = "INSERT INTO $t " . querystr('i', $a);
	$db->query($qry);
	return $db->insert_id;
}

function querystr($t, $a)
{
	$r = '';
	switch ($t) {
		case 'i':
			$s1 = '';
			$s2 = '';
			foreach ($a as $k => $v) {
				$s1 .= ($s1 == '') ? '' : ', ';
				$s1 .= $k;
				$po = $v;
				$sl = (is_string($v)) ? "'" : '';
				if ($sl != "'") {
					$po = ($po == '') ? 0 : intval($po);
				}
				$s2 .= (($s2 == '') ? '' : ',') . ($sl . $po . $sl);
			}
			$r = "($s1) VALUES ($s2)";
			break;
		case 'u':

			break;
	}
	return $r;
}
