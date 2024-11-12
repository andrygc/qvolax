<?php
ini_set("log_errors", 1);
ini_set("error_log", "error/php-error.log");
error_reporting(1);

include "include/config.php";

/* delete old records in commands */
$db->query("DELETE FROM commands WHERE mtime<" . ($now - 900) . " OR mtime<" . ($now - 604800));

/* inactive users */
$qry = $db->query("SELECT * FROM users WHERE online='1' AND last_seen <" . ($now - 900));
if ($qry->num_rows > 0) {
	while ($row = $qry->fetch_array(MYSQLI_ASSOC)) {
		extract($row);
		$db->query("UPDATE users SET online='0', status='2' WHERE id=" . $id);
		insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "bye|$id|0"));
	}
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
