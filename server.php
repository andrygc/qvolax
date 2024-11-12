<?php

ini_set("log_errors", 1);
ini_set("error_log", "error/php-error.log");
error_reporting(1);

$ret = array();

include "include/config.php";

$data = $_POST['data'];
$prts = explode("%0D%0A", $data);

$chat = new chat;

if (!isset($ret['errors']))

	foreach ($prts as $pt) {
		if ($pt != '') {
			parse_str($pt, $POST);
			foreach ($POST as $k => $v) {
				$POST[$k] = addslashes($v);
			}
			extract($POST);
			if (method_exists($chat, $act)) {
				$chat->$act();
			}
		}
	}

$svr = $_POST['svr'];
$myself = (isset($_SESSION['user_data'])) ? $_SESSION['user_data']['id'] : 0;

if ($svr > 0) {

	/* update last seen */
	$db->query("UPDATE users SET last_seen=$now WHERE id=" . $myself);

	/* run the new */
	$lastsvr = $svr;
	$exe = $db->query("SELECT * FROM commands WHERE (id>$svr AND mfrom<>$myself AND (mdest=0 OR mdest=$myself)) ORDER BY id ASC");
	if ($exe->num_rows > 0) {
		while ($row = $exe->fetch_array(MYSQLI_ASSOC)) {
			extract($row);
			$ret[$type][] = $cmd;
			$lastsvr = $id;
		}
	}

	/* server last id */
	if ($lastsvr != $svr) {
		$ret['svr'] = $lastsvr;
	}
}

echo json_encode($ret);

class chat
{

	function start()
	{
		global $db, $ret, $now;

		/* rating */
		$rating = array();
		$qry = $db->query("SELECT * FROM users ORDER BY public_messages DESC LIMIT 0,10");
		while ($row = $qry->fetch_array(MYSQLI_ASSOC)) {
			array_push($rating, getdata($row, array('username', 'avatar', 'public_messages')));
		}
		$ret['act']['stats']['rating'] = $rating;

		/* staff online */
		$staff = array();
		$qry = $db->query("SELECT * FROM users WHERE (privileges>1 AND user_group>10) AND online='1' ORDER BY privileges DESC");
		while ($row = $qry->fetch_array(MYSQLI_ASSOC)) {
			array_push($staff, getdata($row, array('username', 'avatar')));
		}
		$ret['act']['stats']['staff'] = $staff;

		/* online users */
		$onlines = $db->query("SELECT * FROM users WHERE online='1'");
		$ret['act']['stats']['online'] = $onlines->num_rows;

		/* create stadisticas */
		$stats = $db->query("SELECT * FROM visits ORDER BY id DESC limit 0,7");

		$visits = array();
		$max = array();
		$c = 0;
		$ds = array('Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado');
		while ($stat = $stats->fetch_array(MYSQLI_ASSOC)) {
			if ($c == 0) $visits['Hoy'] = $stat['visits'];
			elseif ($c == 1) $visits['Ayer'] = $stat['visits'];
			else $visits[$ds[date('w', $now - $c * 60 * 60 * 24)] . " " . date('d', $now - $c * 60 * 60 * 24)] = $stat['visits'];
			$max[] = $stat['max'];
			$c++;
		}

		$ret['act']['stats']['visits'] = array_reverse($visits);
		$ret['act']['stats']['max'] = array_reverse($max);

		/* users quantity */
		$users = $db->query("SELECT * FROM users");
		$ret['act']['stats']['total'] = $users->num_rows;

		/* masculino */
		$masculino = $db->query("SELECT * FROM users WHERE gender='m'");
		$ret['act']['stats']['masculino'] = $masculino->num_rows;

		$ret['exe'][] = "start_complete";
	}

	function login()
	{
		global $db, $ret, $POST, $now;
		extract($POST);

		/* check if exists */
		$exist = $db->query("SELECT * FROM users WHERE username='" . $username . "'");
		if ($exist->num_rows > 0) { # parche
			if ($user = $exist->fetch_array(MYSQLI_ASSOC)) {
				/* check password */
				if (md5($password) == $user['password']) {
					/* info user */
					$info = new info;
					$dataip = $info->dataip();

					/* if you are not an operator */
					if ($user['privileges'] == 0) {
						/* check ip */
						$ips = '';
						foreach ($dataip as $ip) {
							$ips .= " OR ip LIKE '%" . $ip . "%'";
						}
						$qry = $db->query("SELECT * FROM ip_forbidden WHERE user='" . $username . "' " . $ips);
						if ($qry->fetch_array(MYSQLI_ASSOC)) {
							/* you are banned from the server */
							unset($user);
							return $ret['exe'][] = "log_error|2";
						}
					}

					$cou = $info->getcou($info->getip());

					/* update user */
					$db->query("UPDATE users SET last_seen=$now, ip_address='" . $dataip[0] . "', status='1', online='1' WHERE id=" . $user['id']);
				} else {
					/* password error */
					unset($user);
					return $ret['exe'][] = "log_error|1";
				}
			} else {
				/* user not exists */
				unset($user);
				return $ret['exe'][] = "log_error|0";
			}
		} else {
			/* user not exists */
			return $ret['exe'][] = "log_error|0";
		}

		if (isset($user)) {
			/* update data */
			$user['status'] = 1;
			$user['online'] = 1;
			$user['ip_address'] = $dataip[0];

			/* create session */
			$_SESSION['user_data'] = $user;
			$_SESSION['sess'] = $_POST['sess'];

			$browsers = array(
				'OPR'			=> 'Opera',
				'Flock'			=> 'Flock',
				'Edge'			=> 'Spartan',
				'Chrome'		=> 'Google Chrome',
				'Opera.*?Version'	=> 'Opera',
				'Opera'			=> 'Opera',
				'MSIE'			=> 'Internet Explorer',
				'Internet Explorer'	=> 'Internet Explorer',
				'Trident.* rv'	=> 'Internet Explorer',
				'Shiira'		=> 'Shiira',
				'Firefox'		=> 'Firefox',
				'Chimera'		=> 'Chimera',
				'Phoenix'		=> 'Phoenix',
				'Firebird'		=> 'Firebird',
				'Camino'		=> 'Camino',
				'Netscape'		=> 'Netscape',
				'OmniWeb'		=> 'OmniWeb',
				'Safari'		=> 'Safari',
				'Mozilla'		=> 'Mozilla',
				'Konqueror'		=> 'Konqueror',
				'icab'			=> 'iCab',
				'Lynx'			=> 'Lynx',
				'Links'			=> 'Links',
				'hotjava'		=> 'HotJava',
				'amaya'			=> 'Amaya',
				'IBrowse'		=> 'IBrowse',
				'Maxthon'		=> 'Maxthon',
				'Ubuntu'		=> 'Ubuntu Web Browser'
			);

			$platforms = array(
				'windows nt 10.0'	=> 'Windows 10',
				'windows nt 6.3'	=> 'Windows 8.1',
				'windows nt 6.2'	=> 'Windows 8',
				'windows nt 6.1'	=> 'Windows 7',
				'windows nt 6.0'	=> 'Windows Vista',
				'windows nt 5.2'	=> 'Windows 2003',
				'windows nt 5.1'	=> 'Windows XP',
				'windows nt 5.0'	=> 'Windows 2000',
				'windows nt 4.0'	=> 'Windows NT 4.0',
				'winnt4.0'			=> 'Windows NT 4.0',
				'winnt 4.0'			=> 'Windows NT',
				'winnt'				=> 'Windows NT',
				'windows 98'		=> 'Windows 98',
				'win98'				=> 'Windows 98',
				'windows 95'		=> 'Windows 95',
				'win95'				=> 'Windows 95',
				'windows phone'			=> 'Windows Phone',
				'windows'			=> 'Unknown Windows OS',
				'android'			=> 'Android',
				'blackberry'		=> 'BlackBerry',
				'iphone'			=> 'iOS',
				'ipad'				=> 'iOS',
				'ipod'				=> 'iOS',
				'os x'				=> 'Mac OS X',
				'ppc mac'			=> 'Power PC Mac',
				'freebsd'			=> 'FreeBSD',
				'ppc'				=> 'Macintosh',
				'linux'				=> 'Linux',
				'debian'			=> 'Debian',
				'sunos'				=> 'Sun Solaris',
				'beos'				=> 'BeOS',
				'apachebench'		=> 'ApacheBench',
				'aix'				=> 'AIX',
				'irix'				=> 'Irix',
				'osf'				=> 'DEC OSF',
				'hp-ux'				=> 'HP-UX',
				'netbsd'			=> 'NetBSD',
				'bsdi'				=> 'BSDi',
				'openbsd'			=> 'OpenBSD',
				'gnu'				=> 'GNU/Linux',
				'unix'				=> 'Unknown Unix OS',
				'symbian' 			=> 'Symbian OS'
			);

			$browser = null;
			$platform = null;

			if (isset($_SERVER['HTTP_USER_AGENT'])) {
				$agent = trim($_SERVER['HTTP_USER_AGENT']);
				foreach ($browsers as $key => $val) {
					if (preg_match('|' . $key . '.*?([0-9\.]+)|i', $agent, $match)) {
						$browser = $val;
						break;
					}
				}
				foreach ($platforms as $key => $val) {
					if (preg_match('|' . preg_quote($key) . '|i', $agent)) {
						$platform = $val;
						break;
					}
				}
			}

			$ret['debug'] = $platform;

			$enter = getdata($user, array('id', 'username', 'gender', 'age', 'avatar', 'user_group', 'stars', 'status', 'ip_address', 'public_messages', 'privileges', 'mute'));

			$others = "";

			$qry = $db->query("SELECT username FROM users WHERE ip_address = '" . $dataip[0] . "' ");
			while ($r = $qry->fetch_array(MYSQLI_ASSOC)) {
				$others .= (($others == "") ? '' : ', ') . "<a><b>" . $r['username'] . "</b></a>";
			}

			$enter .= "|" . $cou . "|" . $browser . "|" . $platform . "|" . $others;

			/* online users */
			$onlines = $db->query("SELECT * FROM users WHERE online='1' ORDER BY user_group DESC, username ASC");
			while ($us = $onlines->fetch_array(MYSQLI_ASSOC)) {
				if ($us['id'] != $user['id']) $ret['exe'][] = "online|" . getdata($us, array('id', 'username', 'gender', 'age', 'avatar', 'user_group', 'stars', 'status', 'ip_address', 'public_messages', 'privileges', 'mute', 'country'));
			}

			/* insert entry */
			$last_server = insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "enter|" . $enter));

			/* insert entry for statistics */
			$day = date("Y-m-d");
			$visit = $db->query("SELECT * FROM visits WHERE date = '" . $day . "'");
			if ($visit->num_rows == 0) {
				$db->query("INSERT INTO visits (date, visits) VALUES ('" . $day . "', 1)");
			}
			$db->query("UPDATE visits SET visits=visits+1 WHERE date = '" . $day . "'");

			/* insert maximum amount online */
			$maxday = $onlines->num_rows;
			$db->query("UPDATE visits SET max=$maxday WHERE date='$day' AND max<$maxday");

			/* look at my entry */
			$ret['exe'][] = "signin|$enter";


			$ret['exe'][] = "topic|" . getvar('topic');

			/* my attachments */
			my_attachments($user['id']);

			/* blocked users */
			$blocked = $db->query("SELECT * FROM blocked_users WHERE user=" . $user['id']);
			if ($blocked->num_rows > 0) { # parche evitar error
				while ($locked = $blocked->fetch_array(MYSQLI_ASSOC)) {
					$ret['exe'][] = "bloquear|" . $locked['locked'];
				}
			}

			/* update */
			$ret['svr'] = $last_server;
		}
	}

	function signup()
	{
		global $db, $ret, $POST;
		extract($POST);

		/* check if it exists */
		$exist = $db->query("SELECT * FROM users WHERE username='" . $username . "'");
		if ($exist->num_rows > 0) {
			$ret['exe'][] = "signup|1|El usuario ya existe...";
			return;
		}

		if (strlen($password) < 6 || strlen($password_reper) < 6) {
			$ret['exe'][] = "signup|1|La contrase&ntilde;a debe contener 6 caracteres minimo...";
			return;
		}

		/* check password */
		if ($password != $password_reper) {
			$ret['exe'][] = "signup|1|Las contrase&ntilde;a no coinciden...";
			return;
		}

		/* check gender */
		if ($gender == '?') {
			$ret['exe'][] = "signup|1|Seleccione su sexo...";
			return;
		}

		if (trim($username) == '') {
			$ret['exe'][] = "signup|1|Disculpe introdusca un nombre de usuario...";
			return;
		}

		if (strlen($username) < 3) {
			$ret['exe'][] = "signup|1|El nombre no puede menos de 3 caracteres...";
			return;
		}

		/* info user */
		$info = new info;
		$dataip = $info->dataip();

		$ips = '';

		foreach ($dataip as $ip) {
			$ips .= " OR ip LIKE '%" . $ip . "%'";
		}

		$qry = $db->query("SELECT * FROM ip_forbidden WHERE user='" . $username . "' " . $ips);

		if ($qry->num_rows > 0) {
			$ret['exe'][] = "signup|1|Estas baneado del servidor...";
			return;
		}

		/* create record */
		$user = insert('users', [
			'username' 	=> $username,
			'password' 	=> md5($password),
			'gender' 	=> $gender,
			'age' 		=> $age,
			'registered' => date("Y-m-d"),
			'ip_address'		=> $dataip[0]
		]);

		if ($user) {
			$ret['exe'][] = "signup|0";
		} else {
			$ret['exe'][] = "signup|1|Disculpe ha ocurrido un error...";
		}
	}

	function message()
	{
		global $db, $POST, $ret;
		extract($POST);

		$myself = $_SESSION['user_data']['id'];
		$priv 	= $this->get('privileges');
		$stt 	= $this->get('user_group');

		/* user muted in public */
		if ($this->get('mute') == '1' && $from == 0) {
			$ret['exe'][] = "write_msg|0|0|sys|*** No tienes permitido escribir en la Sala Pública...|system";
			return;
		}

		/* add message if it is public */
		if ($from == 0) {
			$db->query("UPDATE users SET public_messages=public_messages+1 WHERE id=" . $myself);
		}

		/* is comando */
		if (iscmd($msg)) {
			return;
		}

		/* muted public room */
		$mute = intval(getvar('mute'));
		if (($priv & 128) != 128 && $mute > time()) {
			$ret['exe'][] = "write_msg|0|0|sys|*** La <b>Sala Pública</b> ha sido <b>muteada</b>...|system";
			return;
		}

		$msg = utf8_encode($msg);

		insert('commands', array('type' => 'exe', 'mfrom' => $myself, 'mdest' => $from, 'cmd' => "write_msg|$myself|$from|msg|$msg|$format"));

		$mensajes = $this->get('public_messages');

		/*
			automatic level
		*/
		if ($stt < 10 && ($priv & 255) != 255) {

			/* mindundi */
			if ($mensajes < 5000 && $stt > 1) {
				$db->query("UPDATE users SET user_group='1', stars='1' WHERE id=" . $myself);
				insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "changelevel|" . $myself . "|1|1"));
			}

			/* estrella */
			if (($mensajes > 5000 && $mensajes < 10000) && ($stt > 2 || $stt < 2)) {
				$db->query("UPDATE users SET user_group='2', stars='2' WHERE id=" . $myself);
				insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "changelevel|" . $myself . "|2|2"));
			}

			/* super estrella */
			if (($mensajes > 10000 && $mensajes < 15000) && ($stt > 3 || $stt < 3)) {
				$db->query("UPDATE users SET user_group='3', stars='2' WHERE id=" . $myself);
				insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "changelevel|" . $myself . "|3|2"));
			}

			/* estrella permanente */
			if (($mensajes > 15000 && $mensajes < 20000) && ($stt > 4 || $stt < 4)) {
				$db->query("UPDATE users SET user_group='4', stars='2' WHERE id=" . $myself);
				insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "changelevel|" . $myself . "|4|2"));
			}

			if (($mensajes > 20000 && $mensajes < 25000) && ($stt != 5 && $stt != 6)) {
				if ($_SESSION['user_data']['gender'] == 'm') {
					/* prince */
					$db->query("UPDATE users SET user_group='5', stars='3' WHERE id=" . $myself);
					insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "changelevel|" . $myself . "|5|3"));
				} else {
					/* princess */
					$db->query("UPDATE users SET user_group='6', stars='3' WHERE id=" . $myself);
					insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "changelevel|" . $myself . "|6|3"));
				}
			}

			if (($mensajes > 25000 && $mensajes < 50000) && ($stt > 7 || $stt < 7)) {
				/* destacado */
				$db->query("UPDATE users SET user_group='7', stars='3' WHERE id=" . $myself);
				insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "changelevel|" . $myself . "|7|3"));
			}

			if ($mensajes > 50000 && ($stt != 8 && $stt != 9)) {
				if ($_SESSION['user_data']['gender'] == 'm') {
					/* chico vip */
					$db->query("UPDATE users SET user_group='8', stars='3' WHERE id=" . $myself);
					insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "changelevel|" . $myself . "|8|3"));
				} else {
					/* chica vip */
					$db->query("UPDATE users SET user_group='9', stars='3' WHERE id=" . $myself);
					insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "changelevel|" . $myself . "|9|3"));
				}
			}
		}

		/*
			control spam by repeating text
		*/
		if (isset($_SESSION['msg'])) {
			if ($_SESSION['msg'] != $msg) {
				$_SESSION['spam'] = 0;
				$_SESSION['msg'] = $msg;
			} else {
				if (isset($_SESSION['spam'])) {
					$_SESSION['spam']++;
				} else {
					$_SESSION['spam'] = 0;
					$_SESSION['spam']++;
				}
			}
			if ($_SESSION['spam'] > 3) {
				$_SESSION['spam'] = 0;
				if ($stt < 10) {
					insert('commands', array('type' => 'exe', 'mfrom' => $myself, 'mdest' => $from, 'cmd' => "kit|$myself|0|Por repetir textos en el chat...|*"));
					$db->query("UPDATE users SET status='2', online='0' WHERE id=" . $myself);
					$ret['exe'][] = "kit|$myself|0|Por repetir textos en el chat...|*";
				}
			}
		} else {
			$_SESSION['msg'] = $msg;
		}

		/* 
			control spam by time
		*/
		$msg_time = isset($_SESSION['msg_time_counter']) ? $_SESSION['msg_time_counter'] : 0;
		if ($from == 0) {
			if (isset($_SESSION['msg_time'])) {
				$now = time();
				$time = $now - $_SESSION['msg_time'];

				if ($time < 1) {
					$_SESSION['msg_time_counter']++;
					if ($msg_time > 3) {
						if ($stt < 10) {
							insert('commands', array('type' => 'exe', 'mfrom' => $myself, 'mdest' => $from, 'cmd' => "kit|$myself|0|Por hacer spam...|*"));
							$db->query("UPDATE users SET status='2', online='0' WHERE id=" . $myself);
							$ret['exe'][] = "kit|$myself|0|Por hacer spam...|*";
						}
					}
				}
				$_SESSION['msg_time'] = $now;
			} else {
				$_SESSION['msg_time'] = time();
			}
		}

		$ret['exe'][] = "apr|" . $ap;
	}

	function write()
	{
		global $POST;
		extract($POST);
		$myself = $_SESSION['user_data']['id'];
		if ($myself == 0) return;
		insert('commands', array('type' => 'exe', 'mfrom' => $myself, 'mdest' => $dest, 'cmd' => "write|$myself|$wri"));
	}

	function bye()
	{
		global $db, $POST, $ret;
		extract($POST);
		$myself = (isset($_SESSION['user_data'])) ? $_SESSION['user_data']['id'] : 0;
		if ($myself == 0) return;
		session_destroy();
		insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "bye|$myself|$reason"));
		$db->query("UPDATE users SET status='2', online='0' WHERE id=" . $myself);
		if ($reason != 3) $ret['exe'][] = "bye|$myself|$reason";
	}

	function changedata()
	{
		global $db, $POST;
		extract($POST);
		$myself = $_SESSION['user_data']['id'];
		$db->query("UPDATE users SET status='" . $status . "',gender='" . $sexo . "',age='" . $edad . "' WHERE id=" . $myself);
		if ($db->affected_rows) {
			$cmd = "changeprof|" . $myself . "|" . $status . "|" . $sexo . "|" . $edad;
			insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => $cmd));
		}
	}

	function find()
	{
		global $db, $POST, $ret;
		extract($POST);
		if ($nick == '' || strlen($nick) < 3) return;
		$ret['exe'][] = 'search_open';
		$qry = $db->query("SELECT * FROM users WHERE username LIKE '%" . $nick . "%'");
		while ($us = $qry->fetch_array(MYSQLI_ASSOC)) {
			$ret['exe'][] = "add_result|" . getdata($us, array('id', 'username', 'gender', 'age', 'avatar', 'user_group', 'stars', 'status', 'ip_address', 'public_messages', 'privileges', 'mute', 'country'));
		}
		$ret['exe'][] = 'search_close';
	}

	function kill()
	{
		global $db, $POST, $ret;
		extract($POST);
		$yo = $_SESSION['user_data']['username'];
		$priv = $this->get('privileges');
		switch ($type) {
			case 0:
				if (($priv & 2) != 2) {
					$ret['exe'][] = "write_msg|0|0|sys|*** Privilegios insuficientes...|system";
					return;
				}
				$uspriv = $this->get('privileges', $user);
				if (($uspriv & 128) == 128) {
					$ret['exe'][] = "write_msg|0|0|sys|*** Privilegios insuficientes...|system";
					return;
				}
				insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "kit|$user|$type|$reason|$yo"));
				$db->query("UPDATE users SET status='2', online='0' WHERE id=" . $user);
				break;
			case 1:
				if (($priv & 4) != 4) {
					$ret['exe'][] = "write_msg|0|0|sys|*** Privilegios insuficientes...|system";
					return;
				}
				$uspriv = $this->get('privileges', $user);
				if (($uspriv & 128) == 128) {
					$ret['exe'][] = "write_msg|0|0|sys|*** Privilegios insuficientes...|system";
					return;
				}
				insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "kit|$user|$type|$reason|$yo"));
				$db->query("UPDATE users SET status='2', online='0' WHERE id=" . $user);
				/* insert ip address in table of forbidden ip */
				$nick = $this->get('username', $user);
				$ip = $this->get('ip_address', $user);
				$date = date("Y-m-d H:i:s");
				insert('ip_forbidden', array('ip' => $ip, 'user' => $nick, 'oper' => $yo, 'reason' => $reason, 'date' => $date));
				break;
			default:
				return;
				break;
		}
	}

	function save()
	{
		global $db, $POST, $ret;
		extract($POST);
		$myself = $_SESSION['user_data']['id'];
		$mypriv = $this->get('privileges');
		if (($mypriv & 64) != 64 && ($mypriv & 128) != 128) {
			$ret['exe'][] = "write_msg|0|0|sys|*** Acceso denegado...|system";
			return;
		}
		if (($mypriv & 128) == 128) {
			$db->query("UPDATE users SET user_group='" . $stt . "',privileges='" . $priv . "',stars='" . $stars . "' WHERE id=" . $us);
		} else if (($mypriv & 64) == 64) {
			$db->query("UPDATE users SET user_group='" . $stt . "',stars='" . $stars . "' WHERE id=" . $us);
		}

		if ($db->affected_rows) {
			insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "change|$us|$stt|$priv|$stars|$myself"));
		}
	}

	function mute()
	{
		global $db, $POST, $ret;
		extract($POST);
		$myself = $_SESSION['user_data']['id'];
		$mypriv = $this->get('privileges');
		$uspriv = $this->get('privileges', $user);
		if (!is_numeric($mute) || !is_numeric($user)) {
			return;
		}
		if (($mypriv & 16) != 16) {
			$ret['exe'][] = "write_msg|0|0|sys|*** Privilegios insuficientes...|system";
			return;
		}
		if (($uspriv & 128) == 128) {
			$ret['exe'][] = "write_msg|0|0|sys|*** Acceso denegado...|system";
			return;
		}
		$db->query("UPDATE users SET mute='" . $mute . "' WHERE id=" . $user);
		insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => "response_mute|$user|$mute|$myself"));
	}

	function chgpassw()
	{
		global $db, $POST, $ret;
		extract($POST);
		$myself = $_SESSION['user_data']['id'];
		$actual = $_SESSION['user_data']['password'];

		if (trim($changePass1) == '' || trim($changePass2) == '' || trim($changePass3) == '') {
			$ret['exe'][] = "custom_alert|Complete todos los campos";
			return;
		}

		if (strlen($changePass1) < 6 || strlen($changePass2) < 6 || strlen($changePass3) < 6) {
			$ret['exe'][] = "custom_alert|Las contrase&ntilde;as deben contener minimo 6 caracteres";
			return;
		}

		if (md5($changePass1) != $actual) {
			$ret['exe'][] = "custom_alert|La contrase&ntilde;a actual no coincide";
			return;
		}

		if ($changePass2 != $changePass3) {
			$ret['exe'][] = "custom_alert|Las contrase&ntilde;as no coinciden";
			return;
		}

		$qry = $db->query("UPDATE users SET password='" . md5($changePass2) . "' WHERE id=" . $myself);

		if ($qry) {
			$_SESSION['user_data']['password'] = md5($changePass2);
			$ret['exe'][] = "chgpassw";
		} else {
			$ret['exe'][] = "custom_alert|Disculpe ha ocurrido un error";
			return;
		}
	}

	function rating()
	{
		global $db, $ret;

		$qry = $db->query("SELECT * FROM users ORDER BY public_messages DESC LIMIT 0,10");

		$ret['exe'][] = "showranking";

		while ($row = $qry->fetch_array(MYSQLI_ASSOC)) {
			$ret['exe'][] = "insert_rating|" . getdata($row, array('id', 'username', 'gender', 'age', 'avatar', 'user_group', 'stars', 'status', 'ip_address', 'public_messages', 'privileges', 'mute', 'country'));
		}
	}

	function get($data, $where = 0)
	{
		global $db;
		$myself = $_SESSION['user_data']['id'];
		$wh = ($where == 0) ? $myself : $where;
		$qry = $db->query("SELECT $data FROM users WHERE id=" . $wh);
		if ($qry->num_rows == 0) return 0;
		$row = $qry->fetch_array(MYSQLI_ASSOC);
		if ($data == '*') return $row;
		else return $row[$data];
	}

	function nopv()
	{
		global $POST;
		extract($POST);
		$myself = $_SESSION['user_data']['id'];
		insert('commands', array('type' => 'exe', 'mfrom' => $myself, 'mdest' => $to, 'cmd' => "nopv_acept|$to|$myself"));
	}

	function locked()
	{
		global $POST;
		extract($POST);
		$myself = $_SESSION['user_data']['id'];
		insert('commands', array('type' => 'exe', 'mfrom' => $myself, 'mdest' => $to, 'cmd' => "locked|$to|$myself"));
	}

	function bloquear()
	{
		global $db, $POST, $ret;
		extract($POST);
		$myself = $_SESSION['user_data']['id'];
		if (!is_numeric($us)) return;
		$sql = "SELECT * FROM blocked_users WHERE user=$myself AND locked=$us";
		$exist = $db->query($sql);
		if ($exist->num_rows > 0) {
			return;
		}
		insert('blocked_users', array('user' => $myself, 'locked' => $us));
		$ret['exe'][] = "bloquear|$us";
	}

	function desbloquear()
	{
		global $db, $POST, $ret;
		extract($POST);
		$myself = $_SESSION['user_data']['id'];
		if (!is_numeric($us)) return;
		$sql = "SELECT * FROM blocked_users WHERE user=$myself AND locked=$us";
		$exist = $db->query($sql);
		if ($exist->num_rows == 0) {
			return;
		}
		$sql = "DELETE FROM blocked_users WHERE user=$myself AND locked=$us";
		$db->query($sql);
		$ret['exe'][] = "desbloquear|$us";
	}

	function viewban()
	{
		global $db, $ret;
		$mypriv = $this->get('privileges');
		if (($mypriv & 8) != 8) {
			$ret['exe'][] = "write_msg|0|0|sys|*** Privilegios insuficientes...|system";
			return;
		}
		$baneados = array();
		$sql = "SELECT * FROM ip_forbidden";
		$query = $db->query($sql);
		while ($row = $query->fetch_array(MYSQLI_ASSOC)) {
			$baneados[] = $row;
		}
		$ret['act']['baneados']['user'] = $baneados;
		return $ret['exe'][] = "viewban|1";
	}

	function uban()
	{
		global $db, $POST, $ret;
		extract($POST);
		$mypriv = $this->get('privileges');
		if (($mypriv & 8) != 8) {
			$ret['exe'][] = "write_msg|0|0|sys|*** Privilegios insuficientes...|system";
			return;
		}
		$sql = "DELETE FROM ip_forbidden WHERE id IN ($ids)";
		$query = $db->query($sql);
		if ($query) {
			return $ret['exe'][] = "uban_success|$ids";
		}
	}

	function topic()
	{
		global $POST, $ret;
		extract($POST);
		$mypriv = $this->get('privileges');
		if (($mypriv & 255) != 255) {
			$ret['exe'][] = "write_msg|0|0|sys|*** Privilegios insuficientes...|system";
			return;
		}
		putvar('topic', utf8_encode($text));
		return $ret['exe'][] = "savetopic|1";
	}

	function share()
	{
		global $POST, $ret;
		extract($POST);
		$me = $_SESSION['user_data']['id'];
		$path = "uploads/files/" . $me . "/" . $file . ".tmp";
		if (file_exists($path)) {
			if ($to != 0) {
				insert('commands', array('type' => 'exe', 'mfrom' => $me, 'mdest' => $to, 'cmd' => "write_msg|$me|$to|share|$file|system"));
				$ret['exe'][] = "write_msg|$me|$to|share|$file|system";
			} else {
				$ret['exe'][] = "write_msg|0|0|sys|*** No puedes compartir ficheros en la Sala P&uacute;blica...|system";
			}
		}
	}

	function downfile()
	{
		global $POST, $ret;
		extract($POST);
		$fl = "uploads/files/" . $num . "/" . $file . ".tmp";
		/* en hr de copia */
		if (file_exists($fl)) {
			$ret['exe'][] = "downfile|" . $file . "|" . $num;
		} else {
			$ret['exe'][] = "custom_alert|El fichero no existe...";
		}
	}

	function deletefil()
	{
		global $POST, $ret;
		extract($POST);
		$me = $_SESSION['user_data']['id'];
		$path = "uploads/files/" . $me . "/" . $file . ".tmp";
		if (file_exists($path)) {
			@unlink($path);
			$ret['exe'][] = "file_delete|" . $num;
		}
	}
}

class info
{
	function getip()
	{
		// user's ip
		$ii = '0.0.0.0';
		if (getenv("REMOTE_ADDR")) $ii = getenv("REMOTE_ADDR");
		elseif (getenv("HTTP_X_FORWARDED_FOR")) $ii = getenv("HTTP_X_FORWARDED_FOR");
		elseif (getenv("HTTP_CLIENT_IP")) $ii = getenv("HTTP_CLIENT_IP");
		return $ii;
	}

	function dataip($mip = '')
	{
		// user's ip
		if (isset($_POST['remote_ip'])) return $_POST['remote_ip'];
		$a = array("HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR", "REMOTE_ADDR");
		$r = array();
		if ($mip == '') {
			foreach ($a as $i1) {
				$m = (getenv($i1)) ? getenv($i1) : "";
				if ($m != '') {
					$m1 = explode(",", $m);
					foreach ($m1 as $kk) {
						$kk = trim($kk);
						array_push($r, dechex(ip2long($kk)));
					}
				}
			}
		} else {
			array_push($r, dechex(ip2long($mip)));
		}
		return $r;
	}

	function getcou($w = '')
	{
		// user's country
		include_once('include/ip.php');
		$theip = ($w != '') ? $w : $this->getip();
		$gi = geoip_open("include/GeoIP.dat", 0);
		return geoip_country_id_by_addr($gi, $theip);
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

function getdata($r, $a)
{
	$ret = "";
	foreach ($a as $t) {
		$dev = isset($r[$t]) ? $r[$t] : '-';
		$ret .= (($ret == '') ? '' : '|') . $dev;
	}
	return $ret;
}

function getvar($w)
{
	global $db;
	$r = '';
	$qry = $db->query("SELECT * FROM system WHERE item='$w'");
	if ($qry->num_rows > 0) {
		if ($row = $qry->fetch_array(MYSQLI_ASSOC)) {
			$r = $row['content'];
		}
	}
	return $r;
}

function putvar($item, $content)
{
	global $db;
	$r = '';
	$qry = "SELECT * FROM system WHERE item='$item'";
	$rsl = $db->query($qry);
	if (!$row = $rsl->fetch_array(MYSQLI_ASSOC)) {
		$qry = "INSERT INTO system (item,content) VALUES ('$item','$content')";
		$db->query($qry);
	} else {
		$qry = "UPDATE system SET content='$content' WHERE item='$item'";
		$db->query($qry);
	}
	return $r;
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

function my_attachments($userid)
{
	global $ret;
	$path = "uploads/files/" . $userid;
	if (is_dir($path)) {
		$d = dir($path);
		while (false !== ($entry = $d->read())) {
			if (substr($entry, strlen($entry) - 3) == 'tmp')
				$ret['files'][] = substr($entry, 0, strlen($entry) - 4);
		}
		$d->close();
	}
}

function iscmd($str)
{
	global $ret;
	$prv = intval($_SESSION['user_data']['privileges']);
	if (($prv & 32) != 32) {
		return false;
	}
	$str = urldecode($str);
	if (substr($str, 0, 1) == '/') {
		$pt = explode(" ", substr($str, 1));
		$cmd = array_shift($pt);
		switch ($cmd) {
			case 'mute':
				$time = implode(" ", $pt);
				$mute = ($time * 60) + time();
				putvar('mute', $mute);
				if ($time > 0) {
					$ms = "write_msg|0|0|sys|*** <b>" . $_SESSION['user_data']['username'] . "</b> deja muda la Sala Pública <b>" . $time . " minutos</b>...|system";
				} else {
					$ms = "write_msg|0|0|sys|*** <b>" . $_SESSION['user_data']['username'] . "</b> desmutea la <b>Sala Pública</b>...|system";
				}
				insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => $ms));
				return true;
				break;
			case 'notice':
				$alerta = implode(" ", $pt);
				$ms = "write_msg|0|0|notice|*** " . utf8_encode($alerta) . "...|system";
				insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => $ms));
				return true;
				break;
			case 'banner':
				$foto = array_shift($pt);
				$url = implode(" ", $pt);
				$exist = file_exists("uploads/banners/" . $foto);
				if ($exist) {
					if ($url == '') $ms = "write_msg|0|0|banner|" . $foto;
					else $ms = "write_msg|0|0|banner|" . $foto . "|" . $url;
					insert('commands', array('type' => 'exe', 'mfrom' => 0, 'mdest' => 0, 'cmd' => $ms));
					return true;
				} else {
					return true;
				}
				break;
			default:
				$ret['debug'] = $cmd;
				return true;
		}
	}
	return false;
}
