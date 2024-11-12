CREATE TABLE IF NOT EXISTS `blocked_users` (
  `id` int(10) unsigned NOT NULL,
  `user` int(11) NOT NULL,
  `locked` int(11) NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `commands` (
  `id` int(11) NOT NULL,
  `type` char(25) NOT NULL,
  `mfrom` int(11) NOT NULL,
  `mdest` int(11) NOT NULL,
  `cmd` longtext NOT NULL,
  `mtime` int(11) NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=4461 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `ip_forbidden` (
  `id` int(11) NOT NULL,
  `ip` char(255) NOT NULL,
  `user` char(25) NOT NULL,
  `oper` char(25) NOT NULL,
  `reason` char(255) NOT NULL,
  `date` datetime NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `system` (
  `id` int(11) NOT NULL,
  `item` char(25) NOT NULL,
  `content` char(255) NOT NULL
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `system`
--

INSERT INTO `system` (`id`, `item`, `content`) VALUES
(1, 'topic', 'Bienvenidos al Qvolax, creado con amor para la comunidad cubana.'),
(2, 'mute', '0');

CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL,
  `username` char(25) NOT NULL,
  `password` char(255) NOT NULL,
  `gender` enum('m','f') NOT NULL,
  `age` int(2) DEFAULT NULL,
  `avatar` char(32) DEFAULT NULL,
  `user_group` int(2) NOT NULL DEFAULT '1',
  `privileges` int(11) NOT NULL DEFAULT '0',
  `stars` enum('1','2','3','4','5') NOT NULL DEFAULT '1',
  `last_seen` int(11) DEFAULT NULL,
  `registered` date DEFAULT NULL,
  `ip_address` char(20) NOT NULL DEFAULT '0.0.0.0',
  `user_token` char(255) DEFAULT NULL,
  `online` enum('0','1') NOT NULL DEFAULT '0',
  `status` enum('1','2','3') NOT NULL DEFAULT '2',
  `public_messages` int(11) NOT NULL DEFAULT '0',
  `country` int(11) NOT NULL DEFAULT '0',
  `mute` enum('0','1') NOT NULL DEFAULT '0'
) ENGINE=MyISAM AUTO_INCREMENT=25 DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `gender`, `age`, `avatar`, `user_group`, `privileges`, `stars`, `last_seen`, `registered`, `ip_address`, `online`, `status`, `public_messages`, `country`, `mute`) VALUES
(1, 'Admin', 'e10adc3949ba59abbe56e057f20f883e', 'm', 23, null, 15, 255, '5', 1549587577, '2017-10-20', '7f000001', '1', '1', 0, 0, '0');

CREATE TABLE IF NOT EXISTS `visits` (
  `id` int(10) unsigned NOT NULL,
  `date` date NOT NULL,
  `visits` int(11) NOT NULL,
  `max` int(11) NOT NULL DEFAULT '0'
) ENGINE=MyISAM AUTO_INCREMENT=86 DEFAULT CHARSET=utf8;

INSERT INTO `visits` (`id`, `date`, `visits`, `max`) VALUES
(26, '2017-10-23', 3, 1),
(27, '2017-10-27', 5, 1),
(28, '2017-10-31', 7, 1),
(29, '2017-11-07', 5, 1),
(30, '2017-11-09', 7, 1),
(31, '2017-11-13', 8, 1),
(32, '2017-11-16', 9, 1),
(33, '2017-11-20', 11, 1);


ALTER TABLE `blocked_users`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `commands`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `ip_forbidden`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `system`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `visits`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `blocked_users`
  MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT;

ALTER TABLE `commands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `ip_forbidden`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `system`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;

ALTER TABLE `visits`
  MODIFY `id` int(10) unsigned NOT NULL AUTO_INCREMENT;
