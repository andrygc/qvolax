<?php
$chat = file_get_contents('include/template.html');
$search = array('/\>[^\S ]+/s', '/[^\S ]+\</s', '/(\s)+/s');
$replace = array('>', '<', '\\1');
$chat = preg_replace($search, $replace, $chat);
echo $chat;
