<?php
session_id();
session_start();

$now = time();

$db = mysqli_connect('localhost', 'root', '', 'qvolax');

if (!$db) {
	exit('No se pudo conectar al servidor...');
}
