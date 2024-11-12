<?php

$path = "uploads/files/" . $_GET['u'] . "/" . $_GET['f'] . ".tmp";

if (file_exists($path)) {
	header('Content-Description: File Transfer');
	header('Content-Type: application/octet-stream');
	header("Content-Disposition: attachment; filename=\"" . $_GET['f'] . "\"");
	header('Content-Transfer-Encoding: binary');
	header('Expires: 0');
	header('Cache-Control: must-revalidate');
	header('Pragma: public');
	header("Content-length:" . (string)(filesize($path)));
	$fd = fopen($path, 'r');
	fpassthru($fd);
} else {
	return false;
}
