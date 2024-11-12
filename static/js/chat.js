/*!
 * Qvolax v1.0
 */

var start = 0;
var yo = 0;
var soy = null;
var tabsel = 0;
var prv = 0;
var sess = uniqueid(16);
var nopv = null;
var sound = null;

var favicon = new Favico({
	animation: 'none',
});

var favtotal = 0;

$(document).ready(function () {
	/* run start */
	cmd.add({ act: 'start' }, 1);
});

$(function () {
	/* disabled ondragstart */
	document.ondragstart = function () {
		return false;
	};

	/* disabled oncontextmenu */
	document.oncontextmenu = function () {
		return false;
	};

	/* updated or close browser */
	window.onunload = function () {
		if (start > 0) quit();
	};

	/* settings for jconfirm */
	jconfirm.defaults = {
		theme: 'supervan',
	};

	/* run progressbar */
	$('.progress .progress-bar').progressbar();

	createflagrules();

	/* cookie user */
	$('#log_us').val($.cookie('login'));

	/* enable notifications */
	notificationdesktop();

	/* run tooltip bootstrap */
	run_tooltip();

	/* rum popover */
	$('[data-toggle="popover"]').popover({
		html: true,
		container: 'body',
	});

	/* login */
	$(document.body).on('submit', '.form_signin', function (e) {
		e.preventDefault();
		var submit = $(this).find('button[type="submit"]');
		/* show loading */
		submit.data('text', submit.html());
		submit.prop('disabled', true);
		submit.html('Iniciando...');
		cmd.add(
			{
				act: 'login',
				username: $('#log_us').val(),
				password: $('#log_passw').val(),
			},
			1
		);
		return false;
	});

	/* register */
	$(document.body).on('submit', '.form_signup', function (e) {
		e.preventDefault();
		var submit = $(this).find('button[type="submit"]');
		submit.data('text', submit.html());
		submit.prop('disabled', true);
		submit.html('Registrando...');
		cmd.add(
			{
				act: 'signup',
				username: $('#reg_us').val(),
				password: $('#reg_passw').val(),
				password_reper: $('#reg_passw_reper').val(),
				age: $('#reg_age').val(),
				gender: $('#reg_sex').val(),
			},
			1
		);
		return false;
	});

	$(document.body).on('click', '.adjuntos', function (e) {
		e.stopPropagation();
	});

	/* changedata */
	$(document.body).on('submit', '.form_changedata', function (e) {
		e.preventDefault();
		var submit = $(this).find('button[type="submit"]');
		submit.data('text', submit.html());
		submit.prop('disabled', true);
		submit.html('Guardando...');
		var data = parsestr('act=changedata&' + $(this).serialize());
		cmd.add(data, 1);
		return false;
	});

	/* form_changepref */
	$(document.body).on('submit', '.form_changepref', function (e) {
		e.preventDefault();
		var submit = $(this).find('button[type="submit"]');
		submit.data('text', submit.html());
		submit.prop('disabled', true);
		submit.html('Guardando...');
		if ($('#prefnopv').is(':checked')) $.cookie('nopv', 1);
		else $.cookie('nopv', 0);
		if ($('#prefsound').is(':checked')) $.cookie('sound', 1);
		else $.cookie('sound', 0);
		submit.html(submit.data('text')).attr('disabled', false);
		$('#modal-change-prefer').modal('hide');
		custom_alert('Preferencias guardadas...');
		preferencias();
		return false;
	});

	/* change password */
	$(document.body).on('submit', '#chgpassw', function (e) {
		e.preventDefault();
		var data = parsestr('act=chgpassw&' + $(this).serialize());
		cmd.add(data, 1);
		return false;
	});

	/* uban */
	$(document.body).on('submit', '#form_uban', function (e) {
		e.preventDefault();
		var type = $('#uban_kill').val();
		if (type > 1) return false;
		var user = $('#uban_user').val();
		var mot = $('#uban_motiv').val();
		cmd.add({ act: 'kill', type: type, user: user, reason: mot }, 1);
		$('#uban').modal('hide');
		return false;
	});

	/* event to display emoticons */
	$(document.body).on('click', '#showemot', function (e) {
		e.preventDefault();
		if ($('.emoticons').html() == '') {
			$('.emoticons').html(create_emot());
		}
	});

	/* view private message */
	$(document.body).on('click', 'ul#zone-header li', function () {
		var self = $(this);
		var zone = self.attr('zone');
		var user = self.attr('data-original-title') || undefined;

		if (tabsel == zone) return;

		sendwrite(0);
		$('#zone-boddy div[zone-id="' + tabsel + '"]').hide();
		$('#zone-boddy div[zone-id="' + zone + '"]').show();
		$('ul#zone-header').find('li.active').removeClass('active');
		self.addClass('active');

		/* change tabsel */
		tabsel = zone;

		maxscroll(1);

		/* clean counter */
		if ($('#e' + zone).html() > 0) {
			var cn = parseInt($('#e' + zone).html());
			favicon.badge(favtotal - cn);
			favtotal = favtotal - cn;
		}
		$('#e' + zone)
			.html(0)
			.hide();

		if ($(window).width() > 768) {
			$('#tx-mess').focus();
		}

		/* replace placeholder */
		if (user != undefined) {
			if (
				!$('div.user[user-id="' + zone + '"]').get(0) ||
				!$('div.user[user-id="' + zone + '"]').is(':visible')
			) {
				$('#tx-mess').attr({ placeholder: '@offline', disabled: true });
			} else {
				$('#tx-mess').attr({ placeholder: '@' + user, disabled: false });
			}
			$('#addfile').prop('disabled', false);
		} else {
			$('#tx-mess').attr({
				placeholder: 'Escriba su mensaje aqui...',
				disabled: false,
			});
			$('#addfile').prop('disabled', true);
		}

		self.trigger('mouseleave');
	});

	/* close message */
	$(document.body).on('dblclick', 'ul#zone-header li', function () {
		var w = $(this).attr('zone');
		if (w == 0) return false;
		var self = null;
		self = $(this).next().get(0);
		self = self == null ? $(this).prev().get(0) : self;
		$(self).trigger('click');
		$(this).trigger('mouseleave').remove();
		play('close');
	});

	/* close view profile */
	$(document.body).on('click', '.view-profile .back', function () {
		$('.view-profile').animate({ right: -350 }, 400);
	});

	/* block user */
	$(document.body).on('click', '.locked', function () {
		var w = $(this).attr('locked');
		var us = $(this).attr('user');
		switch (w) {
			case '0':
				$(this).prop('disabled', true);
				/* blokear */
				cmd.add({ act: 'bloquear', us: us }, 1);
				break;
			case '1':
				$(this).prop('disabled', true);
				/* desblokear */
				cmd.add({ act: 'desbloquear', us: us }, 1);
				break;
		}
	});

	/* create private message */
	$(document.body).on('click', '.user-list div.user,.init-charla', function () {
		var user = $(this).attr('user-id');
		if (!$('div.user[user-id="' + user + '"]').get(0)) {
			return false;
		}
		$('.view-profile').animate({ right: -350 }, 400);
		if (user != undefined && user != null) {
			pv(user, 1);
		}
	});

	/* send message */
	$('#tx-mess')
		.keypress(function (e) {
			if ($(this).val() != '') {
				if (e.which == 13) {
					$(this).attr('wri', 0);
					send_message();
				}
			}
		})
		.keyup(function () {
			if (tabsel == 0) return false;
			if ($(this).val() != '') {
				if (locked['user_' + tabsel]) {
					return false;
				}
				sendwrite(tabsel);
			}
		});

	/* upload avatar */
	$(document.body).on('submit', '#form-change-avatar', function (e) {
		e.preventDefault;
		var options = {
			dataType: 'json',
			uploadProgress: _progress,
			success: _success,
			error: _error,
			resetForm: true,
		};

		function _progress() {
			$('.js-upload-avatar').show();
		}

		function _success(j) {
			if (j) {
				switch (j.status) {
					case 0:
						custom_alert(j.message);
						break;
					case 1:
						var w = $('div.user[user-id="' + yo + '"]')
							.attr('data')
							.split('|');
						w[4] = j.message;
						online(
							w[0],
							w[1],
							w[2],
							w[3],
							w[4],
							w[5],
							w[6],
							w[7],
							w[8],
							w[9],
							w[10],
							w[11],
							w[12]
						);
						break;
				}
				$('#thumb_sess').val(sess);
				$('.js-upload-avatar').hide();
			}
		}

		function _error() {
			custom_alert('Disculpe ha ocurrido un error...');
			$('.js-upload-avatar').hide();
		}
		$(this).ajaxSubmit(options);
		return false;
	});

	/* upload file */
	$(document.body).on('submit', '#form-upload', function (e) {
		e.preventDefault;
		var num = $('#files_contens TR').length;
		if (num >= 10) {
			custom_alert('Ha alcanzado el límite de almacenamiento.');
			e.stopPropagation();
			return false;
		}
		var options = {
			dataType: 'json',
			uploadProgress: _progress,
			success: _success,
			error: _error,
			resetForm: true,
		};

		function _progress() {
			$('.btn-upload-file').prop('disabled', true).html('Subiendo...');
		}

		function _success(j) {
			if (j) {
				switch (j.status) {
					case 0:
						custom_alert(j.message);
						break;
					case 1:
						addfile(parseInt(num) + 1, j.message);
						break;
				}
				$('#upload_sess').val(sess);
				$('.btn-upload-file').prop('disabled', false).html('Subir Fichero');
			}
		}

		function _error() {
			custom_alert('Disculpe ha ocurrido un error...');
			$('.btn-upload-file').prop('disabled', false).html('Subir Fichero');
		}
		$(this).ajaxSubmit(options);
		return false;
	});

	$(document.body).mouseup(function (e) {
		var w = e.target ? e.target : e.srcElement;
		if (w.id != 'profile_view') {
			var fn = 0;
			$(w)
				.parents()
				.each(function () {
					if (this == $('#profile_view').get(0)) fn = 1;
				});
			if (fn == 0) {
				$('.view-profile').animate(
					{
						right: -350,
					},
					400
				);
			}
		}
		if (!$(w).hasClass('popover')) {
			var fn = 0;
			$(w)
				.parents()
				.each(function () {
					if (this == $('.popover').get(0)) fn = 1;
				});
			if (fn == 0) {
				$('[data-toggle="popover"]').popover('hide');
			}
		}
		if ($(window).width() < 768) {
			if (!$(w).hasClass('user-list')) {
				var fn = 0;
				$(w)
					.parents()
					.each(function () {
						if (this == $('.user-list').get(0)) fn = 1;
						if (this == $('#profile_view').get(0)) fn = 1;
					});
				if (fn == 0) {
					$('.user-list').css({ left: 'calc(100% - 57px)' });
				}
			}
		}
	});

	$(document.body).on('click', '#view_user_list', function () {
		if ($(this).attr('show') == 0) {
			$('.user-list').css({ left: 0 });
			$(this).attr('show', 1);
		} else {
			$('.user-list').css({ left: 'calc(100% - 57px)' });
			$(this).attr('show', 0);
		}
	});

	$(document.body).on('keyup', '#search', function () {
		if ($(this).val() != '' && $(this).val().length > 2) {
			clearTimeout($(this).data('time'));
			$('#search-results').show();
			var w = setTimeout(function () {
				cmd.add({ act: 'find', nick: $('#search').val() }, 1);
			}, 1000);
			$(this).data('time', w);
		} else {
			$('#search-results').hide();
			$('#search-results .dropdown-widget-header, #search-results-all').show();
			$('#search-results .dropdown-widget-body').html(
				'<div class="loader mt10 mb10"></div>'
			);
		}
	});

	$(document.body).on('click', '#search', function () {
		if ($(this).val() != '') {
			$('#search-results').show();
		}
	});

	$(document.body).on('click', function (e) {
		if (!$(e.target).is('#search')) {
			$('#search-results').hide();
		}
	});

	$(document.body).on('click', '.dropdown-open', function (e) {
		e.stopPropagation();
	});

	$(document.body).on('click', '.avatar .avatar-image', function () {
		var thumb = $(this).attr('avatar');
		if (thumb == '-') thumb = 'uploads/thumbs/default.png';
		else thumb = 'uploads/thumbs/2/' + thumb;
		$('#view_avatar').attr('href', thumb).trigger('click');
	});
});

var app_title = 'Simple chat en vivo con PHP usando Ajax ';

function acttitle() {
	var nick = soy == null ? 'Qvolax' : soy;
	var title = nick + ' - ' + app_title;
	return $(document).attr('title', title);
}

var groups = [
	'',
	'Mindundi',
	'Estrella',
	'Super Estrella',
	'Estrella Permanente',
	'Prince',
	'Princess',
	'Destacado',
	'Chico VIP',
	'Chica VIP',
	'Promotor',
	'Reina',
	'Operador',
	'Supervisor',
	'Webmaster',
	'Administrador',
];

function changelevel(id, group, start) {
	var us = '';
	if ((us = $('div.user[user-id="' + id + '"]').get(0))) {
		var w = $('div.user[user-id="' + id + '"]')
			.attr('data')
			.split('|');
		write_msg(
			0,
			0,
			'sys',
			'*** <b>' +
				w[1] +
				'</b> ha cambiado de [<b>' +
				groups[w[5]] +
				'</b> a <b>' +
				groups[group] +
				'</b>]',
			'system'
		);
		w[5] = group;
		w[6] = start;
		online(
			w[0],
			w[1],
			w[2],
			w[3],
			w[4],
			w[5],
			w[6],
			w[7],
			w[8],
			w[9],
			w[10],
			w[11],
			w[12]
		);
	}
	if (id == yo) {
		notify(
			'Felicidades',
			'Has cambiado a [' + groups[group] + ']',
			'static/img/qvola.jpg'
		);
	}
}

function uplfil(file) {}

function run_tooltip() {
	if ($(window).width() < 768) {
		/*! isMovile */
		return false;
	}
	$('[data-toggle="tooltip"]').tooltip({
		html: true,
		container: 'body',
	});
}

function search_open() {
	return $('#search-results .dropdown-widget-body').html('');
}

function add_result(
	id,
	nick,
	sexo,
	age,
	thumb,
	group,
	start,
	status,
	ip,
	messages,
	priv,
	mute
) {
	var l =
		thumb == '-' ? 'uploads/thumbs/default.png' : 'uploads/thumbs/0/' + thumb;
	var j = join_data([
		id,
		nick,
		sexo,
		age,
		thumb,
		group,
		start,
		status,
		ip,
		messages,
		priv,
		mute,
	]);
	var pt = '<div class="data-container item-result">';
	pt += '<a>';
	pt += '<img class="data-avatar" src="' + l + '">';
	pt += '</a>';
	pt += '<div class="data-content">';
	pt += '<div class="pull-right">';
	pt +=
		'<button class="btn btn-default btn-md" onclick="profile(this);" data="' +
		j +
		'">';
	pt += 'Ver perfil';
	pt += '</button>';
	pt += '</div>';
	pt += '<div>';
	pt += '<span class="name">';
	pt += '<span class="stt' + group + '">' + nick + '</span>';
	pt +=
		'<br><small style="font-weight:normal;">[' + groups[group] + ']</small>';
	pt += '</span>';
	pt += '</div>';
	pt += '</div>';
	pt += '</div>';
	$('#search-results .dropdown-widget-body').append(pt);
}

function search_close() {
	if ($('.item-result').length == 0) {
		return $('#search-results .dropdown-widget-body').append(
			'<div class="mt10 mb10 text-center"><p class="text-mute">No se encontraron resultados...</p></div>'
		);
	}
	return false;
}

function join_data(w) {
	var ret = '';
	for (t = 0; t < w.length; t++) {
		ret += (ret == '' ? '' : '|') + w[t];
	}
	return ret;
}

var locked = {};

function profile(w) {
	var user = $(w).attr('data').split('|');
	$('#search-results').hide();
	var thumb =
		user[4] == '-' || user[4] == null
			? 'uploads/thumbs/default.png'
			: 'uploads/thumbs/1/' + user[4];
	var sexo = user[2] == 'm' ? 'Hombre' : 'Mujer';
	var blok = locked['user_' + user[0]] ? true : false;

	/* Is it me or is not online */
	if (user[0] == yo || !$('div.user[user-id="' + user[0] + '"]').get(0)) {
		$('.init-charla,.locked').hide();
		if (user[0] == yo) {
			var btn =
				'<button type="button" data-toggle="modal" href="#modal-change-avatar" class="btn btn-default btn-block">Cambiar avatar</button><button type="button" data-toggle="modal" href="#modal-change-prefer" class="btn btn-default btn-block">Preferencias</button>';
			$('.extra').html(btn);
		} else {
			$('.extra').html('');
		}
		if ((prv & 2) == 2 && user[0] != yo) {
			$('.extra').append(
				'<button type="button" disabled="" onclick="kill(\'' +
					user[1] +
					"'," +
					user[0] +
					',0);" class="btn btn-default btn-block">Expulsar</button>'
			);
		}
		if ((prv & 4) == 4 && user[0] != yo) {
			$('.extra').append(
				'<button type="button" onclick="kill(\'' +
					user[1] +
					"'," +
					user[0] +
					',1);" class="btn btn-default btn-block">Banear</button>'
			);
		}
		if ((prv & 16) == 16 && user[0] != yo) {
			if (user[11] == 0) {
				$('.extra').append(
					'<button type="button" disabled="" onclick="mutear(' +
						user[0] +
						');" class="btn itm-mute btn-default btn-block">Mutear</button>'
				);
			} else
				$('.extra').append(
					'<button type="button" disabled="" onclick="desmutear(' +
						user[0] +
						');" class="btn itm-mute btn-default btn-block">Desmutear</button>'
				);
		}
		if ((prv & 64) == 64 && $('div.user[user-id="' + user[0] + '"]').get(0)) {
			$('.extra').append(
				'<button type="button" onclick="adminuser(' +
					user[0] +
					');" class="btn btn-default btn-block">Administrar</button>'
			);
		}
	} else {
		/* it's not me */
		$('.init-charla').attr('user-id', user[0]);
		$('.init-charla,.locked').show();

		if (blok == false) {
			$('.locked')
				.attr({ locked: 0, user: user[0] })
				.html('<i class="icon-ban"></i> Bloquear usuario');
		} else {
			$('.locked')
				.attr({ locked: 1, user: user[0] })
				.html('<i class="icon-ban"></i> Desbloquear');
		}

		$('.extra').html('');
		if ((prv & 2) == 2) {
			$('.extra').append(
				'<button type="button" onclick="kill(\'' +
					user[1] +
					"'," +
					user[0] +
					',0);" class="btn btn-default btn-block">Expulsar</button>'
			);
		}
		if ((prv & 4) == 4) {
			$('.extra').append(
				'<button type="button" onclick="kill(\'' +
					user[1] +
					"'," +
					user[0] +
					',1);" class="btn btn-default btn-block">Banear</button>'
			);
		}
		if ((prv & 16) == 16) {
			if (user[11] == 0) {
				$('.extra').append(
					'<button type="button" onclick="mutear(' +
						user[0] +
						');" class="btn itm-mute btn-default btn-block">Mutear</button>'
				);
			} else
				$('.extra').append(
					'<button type="button" onclick="desmutear(' +
						user[0] +
						');" class="btn itm-mute btn-default btn-block">Desmutear</button>'
				);
		}
		if ((prv & 64) == 64) {
			$('.extra').append(
				'<button type="button" onclick="adminuser(' +
					user[0] +
					');" class="btn btn-default btn-block">Administrar</button>'
			);
		}
	}

	if ((prv & 1) == 1) {
		var ip = '<small>[<a>' + long2ip(user[8]) + '</a>]</small>';
	} else {
		var ip = '';
	}

	$('.avatar .avatar-image')
		.css({ 'background-image': "url('" + thumb + "')" })
		.attr('avatar', user[4]);

	$('.info .unamenick').html(
		'<span class="status-' +
			user[7] +
			'"></span>&nbsp;<span class="stt' +
			user[5] +
			'">' +
			user[1] +
			'</span>'
	);

	$('.info small').html('[' + groups[user[5]] + ']');
	$('.info .data').html(
		'<label class="fl_' +
			cou(0) +
			'" style="margin-top:3px;margin-right: 5px;"></label>' +
			sexo +
			', ' +
			user[3] +
			' años ' +
			ip
	);
	$('.view-profile').animate(
		{
			right: 0,
		},
		400
	);
}

function bloquear(id) {
	$('.locked')
		.attr({ locked: 1 })
		.html('<i class="icon-ban"></i> Desbloquear')
		.prop('disabled', false);
	return (locked['user_' + id] = true);
}

function desbloquear(id) {
	$('.locked')
		.attr({ locked: 0 })
		.html('<i class="icon-ban"></i> Bloquear usuario')
		.prop('disabled', false);
	return delete locked['user_' + id];
}

function mutear(id, confirm) {
	var user = get(id, 'nick');
	if (confirm == null) {
		$.confirm({
			title: false,
			content: 'Deseas mutear a ' + user,
			buttons: {
				Mutear: function () {
					mutear(id, 1);
				},
				cancelar: function () {},
			},
		});
	} else {
		$('.itm-mute')
			.html('Desmutear')
			.attr('onclick', 'desmutear(' + id + ')')
			.prop('disabled', true);
		cmd.add(
			{
				act: 'mute',
				user: id,
				mute: 1,
			},
			1
		);
	}
}

function desmutear(id, confirm) {
	var user = get(id, 'nick');
	if (confirm == null) {
		$.confirm({
			title: false,
			content: 'Deseas desmutear a ' + user,
			buttons: {
				Desmutear: function () {
					desmutear(id, 1);
				},
				cancelar: function () {},
			},
		});
	} else {
		$('.itm-mute')
			.html('Mutear')
			.attr('onclick', 'mutear(' + id + ')')
			.prop('disabled', true);
		cmd.add(
			{
				act: 'mute',
				user: id,
				mute: 0,
			},
			1
		);
	}
}

function response_mute(id, mute, oper) {
	var user = get(id, 'nick');
	var operador = oper == 0 ? 'Robot' : get(oper, 'nick');
	var action = mute == 0 ? 'desmutea a' : 'deja mute a';
	$('.itm-mute').prop('disabled', false);
	var us = '';
	if ((us = $('div.user[user-id="' + id + '"]').get(0))) {
		var w = $('div.user[user-id="' + id + '"]')
			.attr('data')
			.split('|');
		w[11] = mute;
		online(
			w[0],
			w[1],
			w[2],
			w[3],
			w[4],
			w[5],
			w[6],
			w[7],
			w[8],
			w[9],
			w[10],
			w[11],
			w[12]
		);
		write_msg(
			0,
			0,
			'sys',
			'*** <b>' + operador + '</b> ' + action + ' <b>' + user + '</b>...',
			'system'
		);
		if (id == yo) {
			var act = mute == 0 ? 'desmuteado' : 'muteado';
			notify('Aviso', operador + ' te ha ' + act, get(oper, 'av-1'));
		}
	}
}

function kill(u, i, l) {
	act_form({
		uban_user: i,
		uban_kill: l,
	});
	switch (l) {
		case 0:
			$('#uban')
				.find('.modal-title')
				.html('Expulsar a ' + u);
			$('#uban').find('button.btn-primary').html('Expulsar');
			$('#uban').modal('show');
			break;
		case 1:
			$('#uban')
				.find('.modal-title')
				.html('Banear a ' + u);
			$('#uban').find('button.btn-primary').html('Banear');
			$('#uban').modal('show');
			break;
	}
}

function kit(w, t, m, o) {
	var n = get(w, 'nick');
	var u = '';
	var r = t == 0 ? 'expulsado' : 'baneado';
	var p = o == '*' ? '' : 'por <b>' + o + '</b>';
	if ((u = $('div.user[user-id="' + w + '"]').get(0))) {
		var ms =
			'*** <b>' +
			n +
			'</b> ha sido ' +
			r +
			' ' +
			p +
			' [Motivo: <i>' +
			m +
			'</i>]';
		write_msg(0, 0, 'sys', ms, 'system');
		$(u).remove();
	}
	if (parseInt(w) == yo) {
		$.alert({
			title: 'Has sido ' + r,
			content: 'Motivo: ' + m,
		});
		logout();
	}
}

function adminuser(w) {
	if ($('div.user[user-id="' + w + '"]').get(0)) {
		var u = $('div.user[user-id="' + w + '"]')
			.attr('data')
			.split('|');
		data = {
			prof_id: u[0],
			prof_nick: u[1],
			prof_stars: u[6],
			prof_stt: u[5],
		};
		if ($('#prof_stt').get(0) == null) {
			var o = '';
			for (t in groups) {
				if (groups[t] != '' && groups[t] != 'Administrador')
					o += '<option value="' + t + '">' + groups[t] + '</option>';
				else if (groups[t] == 'Administrador')
					o +=
						'<option disabled="" value="' + t + '">' + groups[t] + '</option>';
			}
			$('#status_xone').html(
				'<select class="form-control" id="prof_stt">' + o + '</select>'
			);
		}
		act_form(data);

		var p = 1;
		do {
			c = (u[10] & p) == p ? true : false;
			$('[priv=' + p + ']').prop('checked', c);
			p += p;
		} while (p < 255);

		if ((prv & 128) != 128) $('.mypriv').hide();
		$('#adminuser').modal('show');
	}
}

function changepriv() {
	var us = $('#prof_id').val();
	var stars = $('#prof_stars').val();
	var stt = $('#prof_stt').val();
	var priv = 0,
		cc = 1;
	for (var t = 1; t < 9; ++t) {
		var ch = $('[priv=' + cc + ']').is(':checked') ? 1 : 0;
		priv += ch * cc;
		cc += cc;
	}
	cmd.add({ act: 'save', us: us, stars: stars, stt: stt, priv: priv }, 1);
	return $('#adminuser').modal('hide');
}

function change(user, stt, priv, stars, oper) {
	var chgs = [];
	var us = '';
	if ((us = $('div.user[user-id="' + user + '"]').get(0))) {
		/* id,nick,sexo,age,thumb,group,start,status,ip,messages,priv,mute */
		var w = $('div.user[user-id="' + user + '"]')
			.attr('data')
			.split('|');
		if (w[10] != priv) chgs.push('<b>privilegios</b>');
		if (w[5] != stt) chgs.push('<b>grupo</b>');
		if (w[6] != stars && w[2] == 'm') chgs.push('<b>estrellas</b>');
		if (w[6] != stars && w[2] == 'f') chgs.push('<b>corasones</b>');
		ms =
			'*** <b>' +
			get(oper, 'nick') +
			'</b> cambia ' +
			chgs.join(', ') +
			' de <b>' +
			w[1] +
			'</b>...';
		write_msg(0, 0, 'sys', ms, 'system');
		w[5] = stt;
		w[6] = stars;
		w[10] = priv;
		online(
			w[0],
			w[1],
			w[2],
			w[3],
			w[4],
			w[5],
			w[6],
			w[7],
			w[8],
			w[9],
			w[10],
			w[11],
			w[12]
		);
	}
}

function act_form(j) {
	for (var t in j) {
		if ($('#' + t).is('INPUT, SELECT, TEXTAREA')) {
			$('#' + t).val(j[t]);
		} else if ($('#' + t).is('IMG')) {
			$('#' + t).attr('src', j[t]);
		} else $('#' + t).html(j[t]);
	}
}

function createflagrules() {
	var al = '';
	for (var t = 0; t <= 242; ++t) {
		fl = cou(t);
		var x = (t % 11) * 16;
		var y = parseInt(t / 11) * 11;
		al +=
			'.fl_' +
			fl +
			' {background:url(static/img/fl.gif) -' +
			x +
			'px -' +
			y +
			'px no-repeat;height:11px;width:16px;vertical-align:middle;}';
	}
	$(document.body).append('<style>' + al + '</style>');
}

var ccv = 'XXX,AP,EU,ANDD,AREE,AFG,ATGG,AIA,ALB,ARMM,ANT,AGOO,AQ,ARG,ASM,AUTT,AUS,ABWW,AZE,BIHA,BRBB,BGDD,BEL,BFA,BGR,BHR,BDII,BENJ,BMU,BRNN,BOL,BRA,BHSS,BTN,BV,BWA,BLRY,BLZZ,CAN,CC,CODD,CAFF,COGG,CHE,CIV,COKK,CHLL,CMR,CHNN,COL,CRI,CUB,CPVV,CX,CYP,CZE,DEU,DJI,DNKK,DMA,DOM,DZA,ECU,ESTE,EGY,ESHH,ERI,ESP,ETH,FIN,FJI,FLKK,FSMM,FROO,FRA,FX,GAB,GBR,GRDD,GEO,GUFF,GHA,GIB,GRLL,GMB,GINN,GLPP,GNQQ,GRC,GS,GTM,GUM,GNBW,GUYY,HKG,HM,HND,HRV,HTI,HUN,IDN,IRLE,ISRL,IND,IO,IRQQ,IRN,ISL,ITA,JAMM,JOR,JPN,KEN,KGZ,KHM,KIR,COMKM,KNA,PRKKP,KORR,KWT,CYMKY,KAZZ,LAO,LBN,LCA,LIE,LKA,LBRR,LSO,LTU,LUX,LVA,LBYY,MAR,MCO,MDA,MDGG,MHL,MKD,MLI,MMR,MNG,MACO,MNPP,MTQQ,MRT,MSR,MLTT,MUS,MDVV,MWI,MEXX,MYS,MOZZ,NAM,NCL,NER,NFK,NGA,NIC,NLD,NOR,NPL,NRU,NIUU,NZL,OMN,PAN,PER,PYFF,PNGG,PHL,PAKK,POLL,SPMPM,PCNN,PRI,PSE,PRTT,PLWW,PRYY,QAT,REU,ROU,RUS,RWA,SAU,SLBB,SYCC,SDN,SWEE,SGP,SHN,SVNI,SJM,SVKK,SLE,SMR,SENN,SOM,SURR,STP,SLVV,SYR,SWZZ,TCA,TCDD,TF,TGO,THA,TJK,TKL,TLSM,TKMN,TUNO,TONP,TURR,TTO,TUVV,TWN,TZA,UKRA,UGA,UM,USA,URYY,UZB,VAT,VCT,VEN,VGB,VIR,VNM,VUT,WLFF,WSM,YEM,YT,SCGCS,ZAF,ZMB,ZR,ZWE,A1,A2,O1'.split(
	','
);

var contry_name = Array(
	'Desconocido',
	'Asia/Pacific Region',
	'Europe',
	'Andorra',
	'United Arab Emirates',
	'Afghanistan',
	'Antigua and Barbuda',
	'Anguilla',
	'Albania',
	'Armenia',
	'Netherlands Antilles',
	'Angola',
	'Antarctica',
	'Argentina',
	'American Samoa',
	'Austria',
	'Australia',
	'Aruba',
	'Azerbaijan',
	'Bosnia and Herzegovina',
	'Barbados',
	'Bangladesh',
	'Belgium',
	'Burkina Faso',
	'Bulgaria',
	'Bahrain',
	'Burundi',
	'Benin',
	'Bermuda',
	'Brunei Darussalam',
	'Bolivia',
	'Brazil',
	'Bahamas',
	'Bhutan',
	'Bouvet Island',
	'Botswana',
	'Belarus',
	'Belize',
	'Canada',
	'Cocos (Keeling) Islands',
	'Congo, The Democratic Republic of the',
	'Central African Republic',
	'Congo',
	'Switzerland',
	"Cote D'Ivoire",
	'Cook Islands',
	'Chile',
	'Cameroon',
	'China',
	'Colombia',
	'Costa Rica',
	'Cuba',
	'Cape Verde',
	'Christmas Island',
	'Cyprus',
	'Czech Republic',
	'Germany',
	'Djibouti',
	'Denmark',
	'Dominica',
	'Dominican Republic',
	'Algeria',
	'Ecuador',
	'Estonia',
	'Egypt',
	'Western Sahara',
	'Eritrea',
	'Spain',
	'Ethiopia',
	'Finland',
	'Fiji',
	'Falkland Islands (Malvinas)',
	'Micronesia, Federated States of',
	'Faroe Islands',
	'France',
	'France, Metropolitan',
	'Gabon',
	'United Kingdom',
	'Grenada',
	'Georgia',
	'French Guiana',
	'Ghana',
	'Gibraltar',
	'Greenland',
	'Gambia',
	'Guinea',
	'Guadeloupe',
	'Equatorial Guinea',
	'Greece',
	'South Georgia and the South Sandwich Islands',
	'Guatemala',
	'Guam',
	'Guinea-Bissau',
	'Guyana',
	'Hong Kong',
	'Heard Island and McDonald Islands',
	'Honduras',
	'Croatia',
	'Haiti',
	'Hungary',
	'Indonesia',
	'Ireland',
	'Israel',
	'India',
	'British Indian Ocean Territory',
	'Iraq',
	'Iran, Islamic Republic of',
	'Iceland',
	'Italy',
	'Jamaica',
	'Jordan',
	'Japan',
	'Kenya',
	'Kyrgyzstan',
	'Cambodia',
	'Kiribati',
	'Comoros',
	'Saint Kitts and Nevis',
	"Korea, Democratic People's Republic of",
	'Korea, Republic of',
	'Kuwait',
	'Cayman Islands',
	'Kazakstan',
	"Lao People's Democratic Republic",
	'Lebanon',
	'Saint Lucia',
	'Liechtenstein',
	'Sri Lanka',
	'Liberia',
	'Lesotho',
	'Lithuania',
	'Luxembourg',
	'Latvia',
	'Libyan Arab Jamahiriya',
	'Morocco',
	'Monaco',
	'Moldova, Republic of',
	'Madagascar',
	'Marshall Islands',
	'Macedonia',
	'Mali',
	'Myanmar',
	'Mongolia',
	'Macau',
	'Northern Mariana Islands',
	'Martinique',
	'Mauritania',
	'Montserrat',
	'Malta',
	'Mauritius',
	'Maldives',
	'Malawi',
	'Mexico',
	'Malaysia',
	'Mozambique',
	'Namibia',
	'New Caledonia',
	'Niger',
	'Norfolk Island',
	'Nigeria',
	'Nicaragua',
	'Netherlands',
	'Norway',
	'Nepal',
	'Nauru',
	'Niue',
	'New Zealand',
	'Oman',
	'Panama',
	'Peru',
	'French Polynesia',
	'Papua New Guinea',
	'Philippines',
	'Pakistan',
	'Poland',
	'Saint Pierre and Miquelon',
	'Pitcairn Islands',
	'Puerto Rico',
	'Palestinian Territory',
	'Portugal',
	'Palau',
	'Paraguay',
	'Qatar',
	'Reunion',
	'Romania',
	'Russian Federation',
	'Rwanda',
	'Saudi Arabia',
	'Solomon Islands',
	'Seychelles',
	'Sudan',
	'Sweden',
	'Singapore',
	'Saint Helena',
	'Slovenia',
	'Svalbard and Jan Mayen',
	'Slovakia',
	'Sierra Leone',
	'San Marino',
	'Senegal',
	'Somalia',
	'Suriname',
	'Sao Tome and Principe',
	'El Salvador',
	'Syrian Arab Republic',
	'Swaziland',
	'Turks and Caicos Islands',
	'Chad',
	'French Southern Territories',
	'Togo',
	'Thailand',
	'Tajikistan',
	'Tokelau',
	'Turkmenistan',
	'Tunisia',
	'Tonga',
	'East Timor',
	'Turkey',
	'Trinidad and Tobago',
	'Tuvalu',
	'Taiwan',
	'Tanzania, United Republic of',
	'Ukraine',
	'Uganda',
	'United States Minor Outlying Islands',
	'United States',
	'Uruguay',
	'Uzbekistan',
	'Holy See (Vatican City State)',
	'Saint Vincent and the Grenadines',
	'Venezuela',
	'Virgin Islands, British',
	'Virgin Islands, U.S.',
	'Vietnam',
	'Vanuatu',
	'Wallis and Futuna',
	'Samoa',
	'Yemen',
	'Mayotte',
	'Serbia and Montenegro',
	'South Africa',
	'Zambia',
	'Zaire',
	'Zimbabwe',
	'Anonymous Proxy',
	'Satellite Provider',
	'Other'
);

function country(w) {
	var w = parseInt(w);
	return contry_name[w];
}

function cou(q) {
	q = parseInt(q);
	var w = ccv[q].toLowerCase();
	if (w.length < 4) {
		return w.substr(0, 2);
	} else if (w.length == 4) {
		return w.substr(0, 1) + w.substr(3, 1);
	} else return w.substr(3);
}

function showrating(w) {
	if ($(w).attr('show') == 0) {
		cmd.add({ act: 'rating' }, 1);
		$(w).attr('show', 1);
	}
}

function showranking() {
	$('.rating').html('');
}

var rating_pos = 0;

function insert_rating(
	id,
	nick,
	sexo,
	age,
	thumb,
	group,
	start,
	status,
	ip,
	messages,
	priv,
	mute
) {
	rating_pos++;
	var l =
		thumb == '-' ? 'uploads/thumbs/default.png' : 'uploads/thumbs/0/' + thumb;
	var j = join_data([
		id,
		nick,
		sexo,
		age,
		thumb,
		group,
		start,
		status,
		ip,
		messages,
		priv,
		mute,
	]);
	var pt = '<div class="data-container item-result">';
	pt += '<a>';
	pt += '<img class="data-avatar" src="' + l + '">';
	pt += '</a>';
	pt += '<div class="data-content">';
	pt += '<div class="pull-right">';
	pt +=
		'<button class="btn btn-default btn-xs" onclick="profile(this);" data="' +
		j +
		'">';
	pt += 'Ver perfil';
	pt += '</button>';
	pt += '</div>';
	pt += '<div>';
	pt += '<span class="name">';
	pt +=
		'<span class="stt' + group + '">' + rating_pos + '.-' + nick + '</span>';
	pt +=
		'<br><p style="font-weight:normal;margin-top:5px;"><i class="icon-bubbles"></i> ' +
		messages +
		'</p>';
	pt += '</span>';
	pt += '</div>';
	pt += '</div>';
	pt += '</div>';
	$('.rating').append(pt);
}

function long2ip(w) {
	var l = parseInt(w, 16);
	var ip = '0.0.0.0';
	if (!isNaN(l) && (l >= 0 || l <= 4294967295)) {
		ip =
			Math.floor(l / Math.pow(256, 3)) +
			'.' +
			Math.floor((l % Math.pow(256, 3)) / Math.pow(256, 2)) +
			'.' +
			Math.floor(
				((l % Math.pow(256, 3)) % Math.pow(256, 2)) / Math.pow(256, 1)
			) +
			'.' +
			Math.floor(
				(((l % Math.pow(256, 3)) % Math.pow(256, 2)) % Math.pow(256, 1)) /
					Math.pow(256, 0)
			);
	}
	return ip;
}

function signup(w, e) {
	switch (w) {
		case '0':
			$('.form_signup').html(
				'<div class="text-center" style="padding-bottom:25px;"><h1><i class="icon-note"></i></h1><p>Su registro se ha completado por favor <b>Inicie sesi&oacute;n</b></p>'
			);
			/*$('.dropdown-mn').trigger('click');*/
			break;
		case '1':
			var _submit = $('.form_signup').find('button[type="submit"]');
			_submit.html(_submit.data('text')).attr('disabled', false);
			custom_alert(e);
			break;
	}
}

var twr = null;

function sendwrite(w) {
	/* do not send more than once */
	if ($('#tx-mess').attr('wri') != w) {
		/* send cmd */
		cmd.add({ act: 'write', dest: tabsel, wri: w == 0 ? 0 : 1 }, 1);
		$('#tx-mess').attr('wri', w);
		clearTimeout(twr);
		if (w != 0) {
			/* auto remove after 20 seconds */
			twr = setTimeout(function () {
				$('#tx-mess').attr('wri', 0);
			}, 20000);
		}
	}
}

var wtrs = [];

function write(w, j) {
	switch (j) {
		case '1':
			if ($('#zone-header li[zone="' + w + '"]').get(0)) {
				if (locked['user_' + w]) return false;
				if ($('.wtin' + w).get(0)) $('.wtin' + w).remove();
				var user = get(w, 'nick');
				var ms = '*** ' + user + ' est&aacute; escribiendo...';
				write_msg(w, yo, 'sys', ms, 'system wtin' + w);
				if ($('ul#zone-header li[zone="' + w + '"]').get(0) && tabsel != w) {
					$('ul#zone-header li[zone="' + w + '"]').addClass('escribiendo');
				}
			}
			if ($('ul#zone-header li[zone="' + w + '"]').get(0)) {
				play('write');
			}
			wtrs['w' + w] = setTimeout(function () {
				write(w, 0);
			}, 20000);
			break;
		default:
			if (wtrs['w' + w] != null) {
				clearTimeout(wtrs['w' + w]);
				delete wtrs['w' + w];
			}
			$('.wtin' + w).remove();
			if ($('ul#zone-header li[zone="' + w + '"]').hasClass('escribiendo'))
				$('ul#zone-header li[zone="' + w + '"]').removeClass('escribiendo');
			break;
	}
}

function parsestr(w) {
	ret = {};
	w = w.split('&');
	for (var t = 0; t < w.length; ++t) {
		var pr = w[t].split('=');
		ret[pr[0]] = pr[1];
	}
	return ret;
}

function contchar(w, j) {
	var ret = 0;
	var a = w.indexOf(j);
	while (a != -1) {
		ret++;
		w = w.substr(a + j.length);
		var a = w.indexOf(j);
	}
	return ret;
}

function changeprof(id, status, sexo, edad) {
	if (id == yo) {
		$('#modal-change-data').modal('hide');
		var _submit = $('.form_changedata').find('button[type="submit"]');
		_submit.html(_submit.data('text')).attr('disabled', false);
	}
	if ($('div.user[user-id="' + id + '"]').get(0)) {
		var stados = ['', 'online', 'offline', 'ausente'],
			sex = { m: 'Masculino', f: 'Femenino' },
			chg = [];
		var w = $('div.user[user-id="' + id + '"]')
			.attr('data')
			.split('|');
		if (w[3] != edad) chg.push('edad a <b>' + edad + '</b> a&ntilde;os');
		if (w[2] != sexo) chg.push('sexo a <b>' + sex[sexo] + '</b>');
		if (w[7] != status) chg.push('modo <b>' + stados[status] + '</b>');
		w[7] = status;
		w[2] = sexo;
		w[3] = edad;
		online(
			w[0],
			w[1],
			w[2],
			w[3],
			w[4],
			w[5],
			w[6],
			w[7],
			w[8],
			w[9],
			w[10],
			w[11],
			w[12]
		);
		write_msg(
			0,
			0,
			'sys',
			'*** <b>' + w[1] + '</b> cambia ' + chg.join(', ') + '...',
			'system'
		);
	}
}

function topic(w) {
	$('.topic,#topic').html(unescape(w));
}

function savetopic(num) {
	var button = $('#modal-change-topic').find('button.btn-primary');
	if (num == 0) {
		if (prv & (255 == 255)) {
			button.prop('disabled', true).html('Guardando...');
			cmd.add({ act: 'topic', text: escape($('#topic').val()) }, 1);
		} else return false;
	} else if (num == 1) {
		$('#modal-change-topic').modal('hide');
		button.prop('disabled', false).html('Guardar');
		write_msg(
			0,
			0,
			'sys',
			'*** Has modificado el <b>topic</b> correctamente...',
			'system'
		);
	}
}

function changethumb(id, thumb) {
	if ($('div.user[user-id="' + id + '"]').get(0)) {
		if (id != yo) {
			var w = $('div.user[user-id="' + id + '"]')
				.attr('data')
				.split('|');
			w[4] = thumb;
			online(
				w[0],
				w[1],
				w[2],
				w[3],
				w[4],
				w[5],
				w[6],
				w[7],
				w[8],
				w[9],
				w[10],
				w[11],
				w[12]
			);
		}
		if ((id = yo)) {
			$('#thumb_sess').val(sess);
		}
	}
}

function signin(
	id,
	nick,
	sexo,
	edad,
	avatar,
	grupo,
	estrellas,
	status,
	ip,
	mensajes,
	priv,
	mute,
	localice,
	nav,
	platform
) {
	$('.log-false').hide();
	$('.log-true,.navbar-search-user').show();
	$('#mynavbar').removeClass('container').addClass('container-fluid');
	$('.dropdown-user-opcion li').each(function () {
		if ($(this).hasClass('vis')) $(this).removeClass('vis');
		else $(this).addClass('vis');
	});
	if ((priv & 8) == 8) {
		$('.qban').each(function () {
			$(this).removeClass('hidden');
		});
	}
	if ((priv & 255) == 255) {
		$('.tpic').each(function () {
			$(this).removeClass('hidden');
		});
	}
	if ($(window).width() < 768) $('#view_user_list').removeClass('hidden');
	else $('#cntonline').removeClass('hidden');
	$('#modal-login').modal('hide');
	(yo = id), (soy = nick), (start = 1);
	$.cookie('login', soy);
	cliente.startcheck();
	preferencias();
	acttitle();
	enter(
		id,
		nick,
		sexo,
		edad,
		avatar,
		grupo,
		estrellas,
		status,
		ip,
		mensajes,
		priv,
		mute,
		localice,
		nav,
		platform
	);
	$('#thumb_sess,#upload_sess').val(sess);
	play('login');
	$('[data-plugin="switchery"]').each(function (idx, obj) {
		new Switchery($(this)[0], $(this).data());
	});
}

function close() {
	/* close session */
	$.confirm({
		title: false,
		content: 'Deseas cerrar su sesi&oacute;n?',
		buttons: {
			Confirmar: function () {
				logout();
				quit(1);
			},
			cancelar: function () {},
		},
	});
}

function sessionend() {
	return false;
}

function quit(w) {
	/* invoke bye */
	if (yo != 0) {
		var p = w == null ? 1 : 2;
		cmd.add({ act: 'bye', reason: p }, 1);
	}
}

function bye(i, m) {
	/* id,motivo */
	if (!i) return false;

	var us = '';
	var mot = [
		'No responde',
		'Cerr&oacute; el Navegador',
		'Se desconecta del Chat',
		'Inactividad en el chat',
	];

	if ((us = $('div.user[user-id="' + i + '"]').get(0))) {
		var nick = $(us).attr('user-nick');
		var ms =
			'*** Sale: <nick class="stt' +
			$(us).attr('user-grupo') +
			'" onclick="mention(\'' +
			nick +
			'\');">' +
			nick +
			'</nick> <i>[' +
			mot[m] +
			']</i>';
		write_msg(0, 0, 'sys', ms);
		$(us).fadeOut(500, function () {
			$(us).remove();
		});
		countusers();
	}

	/* it's me */
	if (i == yo) {
		if (m == '3') {
			$.alert({
				title: 'Has sido desconectado',
				content: 'Motivo: Inactividad en el chat',
			});
		}
		logout();
	}
}

function countusers() {
	var u = $('div.user').length;
	return $('#cntonline').find('.badge').html(u);
}

function logout() {
	$('.log-false').show();
	$('.log-true,.navbar-search-user').hide();
	$('#mynavbar').removeClass('container-fluid').addClass('container');
	play('logout');
	$('.dropdown-user-opcion li').each(function () {
		if ($(this).hasClass('vis')) $(this).removeClass('vis');
		else $(this).addClass('vis');
	});
	if ($('#view_user_list').is(':visible'))
		$('#view_user_list').addClass('hidden');
	cliente.endcheck();
	cliente.init = 0;
	cliente.ping = 6;
	(prv = 0), (start = 0);
	var _submit = $('.form_signin').find('button[type="submit"]');
	_submit.html(_submit.data('text')).attr('disabled', false);
	$('#log-passw').val('');
	acttitle();
	$('#myavatar').attr('src', 'uploads/thumbs/default.png');
}

function log_error(w) {
	var mot = [
		'No existe el usuario...',
		'Contrase&ntilde;a incorrecta...',
		'Estas baneado del servidor...',
		'',
		'',
	];
	var self = $('.form_signin');
	var err = self.find('.alert.alert-danger');
	var _submit = self.find('button[type="submit"]');
	_submit.prop('disabled', false);
	_submit.html(_submit.data('text'));
	return err.html(mot[w]).removeClass('hidden').slideDown();
}

function start_complete() {
	for (var t in stats.rating) {
		var pt = stats.rating[t].split('|');
		var pos = $('img.img-rating').length + 1;
		var img =
			pt[1] != '-' ? 'uploads/thumbs/0/' + pt[1] : 'uploads/thumbs/default.png';
		var user =
			'<div data-toggle="tooltip" data-original-title="' +
			pt[0] +
			'<br> ' +
			pt[2] +
			' mensajes"><img src="' +
			img +
			'" class="img-rating img-circle" /><pos>' +
			pos +
			'</pos></div>';
		if ($('.showrating IMG').length > 0) $('.showrating').append(user);
		else $('.showrating').html(user);
	}

	for (var t in stats.staff) {
		var pt = stats.staff[t].split('|');
		var img =
			pt[1] != '-' ? 'uploads/thumbs/0/' + pt[1] : 'uploads/thumbs/default.png';
		var user =
			'<div data-toggle="tooltip" data-original-title="' +
			pt[0] +
			'"><img src="' +
			img +
			'" class="img-circle" /></div>';
		if ($('.showstaff IMG').length > 0) $('.showstaff').append(user);
		else $('.showstaff').html(user);
	}

	if ($('.showstaff IMG').length == 0)
		$('.showstaff').html('<small>Ningun miembro conectado</small>');
	if ($('.showrating IMG').length == 0)
		$('.showrating').html('<small>no ahy miembros populares</small>');

	$('#cntonline').find('.badge').html(stats.online);

	var day = [];
	var visits = [];
	var max = [];
	for (var k in stats.visits) {
		day.push(k);
		visits.push(stats.visits[k]);
	}
	for (var j in stats.max) {
		max.push(stats.max[j]);
	}

	var ChartData = {
		labels: day,
		datasets: [
			{
				label: 'Total de visitas',
				fillColor: 'rgba(65,196,254,0.2)',
				strokeColor: 'rgba(65,196,254,1)',
				pointColor: 'rgba(65,196,254,1)',
				pointStrokeColor: '#fff',
				pointHighlightFill: '#fff',
				pointHighlightStroke: 'rgba(65,196,254,1)',
				data: visits,
			},
			{
				label: 'Max. Conectados',
				fillColor: 'rgba(151,187,205,0.2)',
				strokeColor: 'rgba(151,187,205,1)',
				pointColor: 'rgba(151,187,205,1)',
				pointStrokeColor: '#fff',
				pointHighlightFill: '#fff',
				pointHighlightStroke: 'rgba(151,187,205,1)',
				data: max,
			},
		],
	};
	var ChartOptions = {
		showScale: true,
		scaleShowGridLines: true,
		scaleGridLineColor: 'rgba(0,0,0,.05)',
		scaleGridLineWidth: 1,
		scaleShowHorizontalLines: true,
		scaleShowVerticalLines: true,
		bezierCurve: true,
		bezierCurveTension: 0.3,
		pointDot: true,
		pointDotRadius: 4,
		pointDotStrokeWidth: 1,
		pointHitDetectionRadius: 20,
		datasetStroke: true,
		datasetStrokeWidth: 2,
		datasetFill: true,
		legendTemplate:
			'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].lineColor%>"></span><%=datasets[i].label%></li><%}%></ul>',
		maintainAspectRatio: true,
		responsive: true,
	};
	new Chart(document.getElementById('linechart').getContext('2d')).Line(
		ChartData,
		ChartOptions
	);
	$('#total_de_users').html(stats.total);
	$('#total_de_users_m').html(stats.masculino);
	var pox_m = (stats.masculino * 100) / stats.total;
	$('.total_de_users_m').attr('data-transitiongoal', pox_m).progressbar();
	$('#total_de_users_f').html(stats.total - stats.masculino);
	var pox_f = ((stats.total - stats.masculino) * 100) / stats.total;
	$('.total_de_users_f').attr('data-transitiongoal', pox_f).progressbar();
	return run_tooltip();
}

function custom_alert(w) {
	return $.alert({
		title: false,
		content: w,
	});
}

function chgpassw() {
	$('#changePass').modal('hide');
	custom_alert('Contraseña cambiada satisfactoriamente');
}

function pv(u, f) {
	/* not allow to open private message with myself */
	if (u == yo) return false;

	if ($(window).width() < 768) {
		if ($('#view_user_list').attr('show') == 1) {
			$('.user-list').css({ left: 'calc(100% - 57px)' });
			$('#view_user_list').attr('show', 0);
		}
	}

	/* exists */
	if ($('#zone-header li[zone="' + u + '"]').get(0)) {
		if (f == 1) $('ul#zone-header li[zone="' + u + '"]').trigger('click');
	} else {
		if (!$('#zone-boddy div[zone-id="' + u + '"]').get(0)) {
			$('#zone-boddy').append('<div zone-id="' + u + '"></div>');
		}

		play('open');

		/* message counter */
		var edata = '<span id="e' + u + '" class="edata">0</span>';

		/* create headed */
		$('#zone-header').append(
			'<li zone="' +
				u +
				'" data-toggle="tooltip" data-original-title="' +
				get(u, 'nick') +
				'">' +
				edata +
				'<img src="' +
				get(u, 'avatar') +
				'" class="img-circle img-thumbnail"></li>'
		);

		run_tooltip();

		/* force open */
		if (f == 1) $('ul#zone-header li[zone="' + u + '"]').trigger('click');
		else $('#zone-boddy div[zone-id="' + u + '"]').hide();
	}
}

function get(i, e) {
	var w = '';
	switch (e) {
		case 'nick':
			w = $('div.user[user-id="' + i + '"]').attr('user-nick');
			break;
		case 'grupo':
			w = $('div.user[user-id="' + i + '"]').attr('user-grupo');
			break;
		case 'avatar':
			w = $('div.user[user-id="' + i + '"]').attr('user-avatar');
			if (w == '' || w == null || w == '-') {
				w = 'uploads/thumbs/default.png';
			} else {
				w = 'uploads/thumbs/0/' + w;
			}
			break;
		case 'av-1':
			w = $('div.user[user-id="' + i + '"]').attr('user-avatar');
			if (w == '' || w == null || w == '-') {
				w = 'uploads/thumbs/default.png';
			} else {
				w = 'uploads/thumbs/1/' + w;
			}
			break;
		case 'av-2':
			w = $('div.user[user-id="' + i + '"]').attr('user-avatar');
			if (w == '' || w == null || w == '-') {
				w = 'uploads/thumbs/default.png';
			} else {
				w = 'uploads/thumbs/2/' + w;
			}
			break;
		case 'sexo':
			w = $('div.user[user-id="' + i + '"]').attr('user-sexo');
			break;
		default:
			' ';
	}
	return w;
}

function send_message() {
	var msg = badwords(length30($.trim($('#tx-mess').val())));
	var unique = uniqueid(8);
	var format = getfmt();
	var emot = contchar(msg, ':');
	if (emot > 6) {
		custom_alert('No se admite m&aacute;s de 3 gif...');
		return false;
	}
	if (locked['user_' + tabsel]) {
		custom_alert('Tienes bloqueado al usuario...');
		return false;
	}
	if (msg == '' || $('#tx-mess').attr('disabled')) return false;
	write_msg(yo, tabsel, 'msg', escape(msg), format, unique);
	$('#tx-mess').val('');
	cliente.init = 0;
	cmd.add(
		{
			act: 'message',
			from: tabsel,
			msg: escape(msg),
			ap: unique,
			format: format,
		},
		1
	);
}

function length30(w) {
	var prt = w.split(' ');
	for (var t = 0; t < prt.length; ++t) {
		if (prt[t].length > 30) {
			prt[t] = prt[t].substr(0, 30) + '...';
		}
	}
	return prt.join(' ');
}

function badwords(w) {
	var pt = w.split(' ');
	var srd = [
		'\\bcojon',
		'\\bping',
		'\\bbollo\\b',
		'\\bsing',
		'\\bresing',
		'\\bputa\\b',
		'\\bmaric',
		'\\bmarik',
		'\\bpene\\b',
		'\\bmierd',
		'\\bemping',
		'\\bmamalon',
		'\\bcago',
	];
	for (t in pt) {
		for (bw in srd) {
			txt = pt[t];
			txt = txt.replace(new RegExp(srd[bw], 'gi'), '');
			if (txt != pt[t]) {
				pt[t] = '(...)';
			}
		}
	}
	return pt.join(' ');
}

function unescape2(w) {
	w = unescape(w);
	w = w.replace(/</g, '&lt;');
	w = w.replace(/>/g, '&gt;');
	return w;
}

function write_msg(fr, to, tp, message, format, ap) {
	/* writer|receiver|type|text|format|arrival */
	switch (tp) {
		case 'msg':
			/* check if online */
			if (!$('div.user[user-id="' + fr + '"]').get(0)) {
				return false;
			}

			if (to == yo) {
				var priv = $('div.user[user-id="' + fr + '"]').attr('user-priv');

				if (
					!$('#zone-header li[zone="' + fr + '"]').get(0) &&
					nopv == true &&
					(priv & 128) != 128
				) {
					cmd.add(
						{
							act: 'nopv',
							to: fr,
						},
						1
					);
					return false;
				}

				if (locked['user_' + fr] && (priv & 128) != 128) {
					cmd.add(
						{
							act: 'locked',
							to: fr,
						},
						1
					);
					return false;
				}

				if (!$('#zone-header li[zone="' + fr + '"]').get(0)) {
					pv(fr);
				}
				to = fr;
				if (tabsel != to) {
					play('notify');
					var cn = parseInt($('#e' + fr).html());
					$('#e' + fr)
						.html(cn + 1)
						.show();
					favtotal++;
					favicon.badge(favtotal);
				}
			}

			/* do not see messages in the room if it is locked */
			if (locked['user_' + fr]) {
				return false;
			}

			if ($('.wtin' + fr).get(0)) {
				$('.wtin' + fr).remove();
				if ($('ul#zone-header li[zone="' + fr + '"]').hasClass('escribiendo')) {
					$('ul#zone-header li[zone="' + fr + '"]').removeClass('escribiendo');
				}
			}

			var nick = get(fr, 'nick');
			var thumb = get(fr, 'avatar');
			var thumb2 = get(fr, 'av-2');

			var unique =
				nick == soy ? '<span class="send" id="u_' + ap + '">»</span>' : '»';

			var cls = [];

			if (format.substr(0, 1) == '1') cls.push('bold');
			if (format.substr(1, 1) == '1') cls.push('italic');
			if (format.substr(2, 1) == '1') cls.push('unline');

			message = unescape2(message);

			if (message.indexOf(soy, 0) != -1) {
				notify(nick + ' te ha mencionado', message, get(fr, 'av-1'));
				var r = '';
				for (var t = 0; t < soy.length; ++t) {
					r +=
						'<b class="tx' +
						parseInt(Math.random() * 9 + 1) +
						'">' +
						soy.substr(t, 1) +
						'</b>';
				}
				message = message.replace(soy, '[' + r + ']');
				play('menc');
			}

			if (to == 0) {
				var ex = $('#x' + fr).get(0);
				var ax =
					'<a href="' +
					thumb2 +
					'" class="zoom"><img src="' +
					thumb +
					'" class="img-circle" width="22" height="22"></a>';
				if (ex == null) {
					$('#float-mnu2').append(
						'<span title="' +
							nick +
							'" time="' +
							$.now() +
							'" class="uactive" id="x' +
							fr +
							'">' +
							ax +
							'</span>'
					);
				} else {
					$(ex).attr('time', $.now());
				}
			}

			for (var t in emots) {
				var re = new RegExp(t, 'gi');
				if (re.test(message)) {
					message = message.replace(
						re,
						'<img src="static/img/emot/i' + emots[t] + '.gif" class="isgif" />'
					);
				}
			}
			var group = get(fr, 'grupo');
			var group_title = groups[group];

			if (
				(group_title == 'Administrador' ||
					group_title == 'Webmaster' ||
					group_title == 'Supervisor' ||
					group_title == 'Operador') &&
				to == 0
			) {
				var badge =
					'&nbsp;<span class="badge stt' +
					group +
					'">' +
					group_title +
					'</span>';
			} else {
				var badge = '';
			}

			var ret =
				'<div class="app-item animated fadeIn" user="' +
				nick +
				'" time="' +
				$.now() +
				'"><div class="app-item-avatar"><a class="zoom" href="' +
				thumb2 +
				'"><img src="' +
				thumb +
				'" class="img-circle" width="44" height="42"></a></div><div class="app-item-msg"><nick class="stt' +
				group +
				'" onclick="mention(\'' +
				nick +
				'\');">' +
				nick +
				'</nick>' +
				badge +
				'<time>' +
				hora() +
				'</time><p>' +
				unique +
				' <span class="' +
				cls.join(' ') +
				'" style="color:' +
				format.substr(3, 7) +
				';">' +
				message +
				'</span></p></div></div>';

			var last =
				$('#zone-boddy div[zone-id="' + to + '"]').attr('last') || null;

			/* when there are no messages in the area */
			if (last == null) {
				$('#zone-boddy div[zone-id="' + to + '"]').attr({ last: nick });
				$('#zone-boddy div[zone-id="' + to + '"]').append(ret);
			} else {
				/* when there is a message in the area */
				if (last != nick) {
					/* it is not from the same user */
					$('#zone-boddy div[zone-id="' + to + '"]').attr({ last: nick });
					$('#zone-boddy div[zone-id="' + to + '"]').append(ret);
				} else {
					var time = $('#zone-boddy div[zone-id="' + to + '"] div.app-item')
						.last()
						.attr('time');
					/* is from the same user check the date */
					if (parseInt(time) > $.now() - 1000 * 60) {
						$('#zone-boddy div[zone-id="' + to + '"] div.app-item-msg')
							.last()
							.append(
								'<p>' +
									unique +
									' <span class="' +
									cls.join(' ') +
									'" style="color:' +
									format.substr(3, 7) +
									';">' +
									message +
									'</span></p>'
							);
					} else {
						$('#zone-boddy div[zone-id="' + to + '"]').append(ret);
					}
				}
			}
			break;
		case 'sys':
			if (to == yo) {
				to = fr;
			}
			var clase = format != null ? format : '';
			var ret =
				'<div class="app-item ' +
				clase +
				'"><div class="app-item-avatar"></div><div class="app-item-msg">' +
				message +
				'</div></div>';
			$('#zone-boddy div[zone-id="' + to + '"]').append(ret);
			break;
		case 'share':
			/* check if online */
			if (!$('div.user[user-id="' + fr + '"]').get(0)) {
				return false;
			}
			if (to == yo) {
				var nick = get(fr, 'nick');
				var ret =
					'<div class="app-item ' +
					format +
					'"><div class="app-item-avatar"></div><div class="app-item-msg">*** <b>' +
					nick +
					'</b> ha compartido el fichero <a onclick="downfile(\'' +
					message +
					"'," +
					fr +
					',1);" data-toggle="tooltip" data-original-title="Clic para descargar">' +
					message +
					'</a></div></div>';
			} else {
				var ret =
					'<div class="app-item ' +
					format +
					'"><div class="app-item-avatar"></div><div class="app-item-msg">*** Has compartido el fichero <a onclick="downfile(\'' +
					message +
					"'," +
					fr +
					',1);" data-toggle="tooltip" data-original-title="Clic para descargar">' +
					message +
					'</a></div></div>';
			}
			if (to == yo) {
				var priv = $('div.user[user-id="' + fr + '"]').attr('user-priv');

				if (
					!$('#zone-header li[zone="' + fr + '"]').get(0) &&
					nopv == true &&
					(priv & 128) != 128
				) {
					cmd.add(
						{
							act: 'nopv',
							to: fr,
						},
						1
					);
					return false;
				}

				if (locked['user_' + fr] && (priv & 128) != 128) {
					cmd.add(
						{
							act: 'locked',
							to: fr,
						},
						1
					);
					return false;
				}

				if (!$('#zone-header li[zone="' + fr + '"]').get(0)) {
					pv(fr);
				}
				to = fr;
				if (tabsel != to) {
					play('notify');
					var cn = parseInt($('#e' + fr).html());
					$('#e' + fr)
						.html(cn + 1)
						.show();
					favtotal++;
					favicon.badge(favtotal);
				}
			}

			$('#zone-boddy div[zone-id="' + to + '"]').append(ret);
			run_tooltip();
			break;
		case 'notice':
			var ret =
				'<div class="app-item" style="margin-left:50px;"><div class="alert alert-info" style="margin-bottom:0px">' +
				unescape2(message) +
				'</div></div>';
			$('#zone-boddy div[zone-id="' + to + '"]').append(ret);
			break;
		case 'banner':
			if (format == null) {
				var ret =
					'<div class="app-item" style="margin-left:50px;"><img src="uploads/banners/' +
					message +
					'" class="img-responsive img-thumbnail" style="min-width:100%;"></div>';
			} else {
				var ret =
					'<div class="app-item" style="margin-left:50px;"><a href="' +
					format +
					'" target="_blank"><img src="uploads/banners/' +
					message +
					'" class="img-responsive img-thumbnail" style="min-width:100%;"></a></div>';
			}
			$('#zone-boddy div[zone-id="' + to + '"]').append(ret);
			break;
	}
	if ($('div[zone-id="' + to + '"]').find('div.app-item').length > 100) {
		var c = 0;
		$('div[zone-id="' + to + '"]')
			.find('div.app-item')
			.each(function () {
				c++;
				if (c > 10) return false;
				else $(this).remove();
			});
	}
	if (tabsel == to) maxscroll();
}

function nopv_acept(fr, to) {
	write_msg(fr, to, 'sys', '*** No acepta mensajes privados...', 'system');
}

function locked(fr, to) {
	write_msg(fr, to, 'sys', '*** El usuario te tiene bloqueado...', 'system');
}

function maxscroll() {
	var o = $('#zone-boddy').get(0);
	return (o.scrollTop = o.scrollHeight);
}

function checkactive() {
	var now = $.now();
	$('.uactive').each(function () {
		if (parseInt($(this).attr('time')) < now - 1000 * 300) $(this).remove();
	});
}

function play(w) {
	if (sound == false) return false;
	var j = {
		notify: 'notify',
		menc: 'menc',
		login: 'login',
		logout: 'logout',
		write: 'write',
		close: 'close',
		open: 'open',
	};
	return $('#sound').html(
		'<audio autoplay="autoplay"><source src="static/sound/' +
			j[w] +
			'.mp3"  type="audio/mp3"></audio>'
	);
}

function hora() {
	var ttim = new Date();
	var mins = ttim.getMinutes();
	var mm = ' am';
	var ho = ttim.getHours();
	if (ho > 11) mm = ' pm';
	if (ho > 12) ho = ho - 12;
	if (ho == 0) ho = 1;
	return ho + ':' + (mins >= 10 ? mins : '0' + mins) + mm;
}

function getfmt() {
	var ret = '';
	$('.btn-format').each(function () {
		if ($(this).is('button'))
			ret += $(this).attr('aria-pressed') == 'true' ? '1' : '0';
		else if ($(this).is('input')) ret += $(this).val();
	});
	return ret;
}

function mention(w) {
	var ms = $('#tx-mess').val();
	var cc = contchar(ms, w);
	if (cc > 2) return $('#tx-mess').focus();
	ms += ms == '' ? w + ' ' : ' ' + w + ' ';
	$('#tx-mess').val(ms).focus();
}

function notificationdesktop() {
	if (window.Notification) {
		Notification.requestPermission();
	}
}

function notify(title, message, thumb) {
	if ($(window).width() > 768) {
		var notify;
		notify = new Notification(title, {
			body: message,
			icon: thumb,
			tag: Math.ceil(Math.random() * 1000).toString(),
		});
	}
	return true;
}

var emots = {
	':0:': 0,
	':1:': 1,
	':2:': 2,
	':3:': 3,
	':4:': 4,
	':5:': 5,
	':6:': 6,
	':7:': 7,
	':8:': 8,
	':9:': 9,
	':10:': 10,
	':11:': 11,
	':12:': 12,
	':13:': 13,
	':14:': 14,
	':15:': 15,
	':16:': 16,
	':17:': 17,
	':18:': 18,
	':19:': 19,
	':20:': 20,
	':21:': 21,
	':22:': 22,
	':23:': 23,
	':24:': 24,
	':25:': 25,
	':26:': 26,
	':27:': 27,
	':28:': 28,
	':29:': 29,
	':30:': 30,
	':31:': 31,
	':32:': 32,
	':33:': 33,
	':34:': 34,
	':35:': 35,
	':36:': 36,
	':37:': 37,
	':38:': 38,
	':39:': 39,
	':40:': 40,
	':41:': 41,
	':42:': 42,
	':43:': 43,
	':44:': 44,
	':45:': 45,
	':46:': 46,
	':47:': 47,
	':48:': 48,
	':49:': 49,
	':50:': 50,
	':51:': 51,
	':52:': 52,
	':53:': 53,
	':54:': 54,
	':55:': 55,
	':56:': 56,
	':57:': 57,
	':58:': 58,
	':59:': 59,
	':60:': 60,
	':61:': 61,
	':62:': 62,
	':63:': 63,
	':64:': 64,
	':65:': 65,
	':66:': 66,
	':67:': 67,
	':68:': 68,
	':69:': 69,
	':70:': 70,
	':71:': 71,
	':72:': 72,
	':73:': 73,
	':74:': 74,
	':75:': 75,
	':76:': 76,
	':77:': 77,
	':78:': 78,
	':79:': 79,
};

function create_emot() {
	var r = '<ul class="list-inline list-unstyled" style="margin-left:0px;">';
	for (var t = 0; t < 80; ++t) {
		r +=
			'<li class="selemot" onclick="select_emot(' +
			t +
			');" style="margin-left:0px;"><img src="static/img/emot/i' +
			t +
			'.gif" width="45" height="45" /></li>';
	}
	r += '</ul>';
	return r;
}

function select_emot(w) {
	return $('#tx-mess')
		.val($.trim($('#tx-mess').val() + ' :' + w + ':'))
		.focus();
}

function uniqueid(m) {
	var r = '';
	for (var t = 0; t < m; ++t) {
		var w = Math.random() * 16;
		r += parseInt(w, 10).toString(16).toUpperCase();
	}
	return r;
}

function online(
	id,
	nick,
	sexo,
	edad,
	avatar,
	grupo,
	star,
	status,
	ip,
	messages,
	priv,
	mute,
	localice,
	is_enter
) {
	var sex = groups[grupo];
	var icon =
		sexo == 'm'
			? '<i class="icon-user"></i>'
			: '<i class="icon-user-female"></i>';
	var thumb =
		avatar == '-' ? 'uploads/thumbs/default.png' : 'uploads/thumbs/0/' + avatar;
	var thumb2 =
		avatar == '-' ? 'uploads/thumbs/default.png' : 'uploads/thumbs/1/' + avatar;
	var age = edad == '-' ? '' : ', ' + edad + ' a&ntilde;os';
	var j = join_data([
		id,
		nick,
		sexo,
		edad,
		avatar,
		grupo,
		star,
		status,
		ip,
		messages,
		priv,
		mute,
		localice,
	]);
	if ($('div.user[user-id="' + id + '"]').get(0)) {
		$('div.user[user-id="' + id + '"]').remove();
	}
	if (id == yo) {
		act_form({
			'tx-pflsex': sexo,
			'tx-pflage': edad,
			'tx-pflstatu': status,
			'tx-pflth': thumb2,
			myavatar: thumb,
		});
		prv = parseInt(priv);
		/*if ((priv&32)==32) $('#addfile').show();
		else $('#addfile').hide();     */
	}
	var animated = is_enter != null ? 'animated bounceInLeft' : '';

	var usertab =
		'<div class="user ' +
		animated +
		'" oncontextmenu="profile(this);" data="' +
		j +
		'" user-id="' +
		id +
		'" user-nick="' +
		nick +
		'" user-grupo="' +
		grupo +
		'" user-sexo="' +
		sexo +
		'" user-priv="' +
		priv +
		'" user-avatar="' +
		avatar +
		'"><div><img src="' +
		thumb +
		'" class="img-circle" width="42" height="40"></div><div><nick class="stt' +
		grupo +
		'">' +
		nick +
		'</nick><small><span class="status-' +
		status +
		'"></span> ' +
		sex +
		age +
		'</small></div><div class="pull-right"><deco class="stt' +
		grupo +
		'">' +
		stars_html(star, sexo) +
		'</deco><sex>' +
		icon +
		'</sex><br><label class="fl_' +
		cou(localice) +
		' pull-right" style="margin-top:5px;"></label></div></div>';
	var f = false;
	var stt = parseInt(grupo);
	$('.user-list .user').each(function () {
		var mus = $(this).attr('user-nick').toLowerCase();
		var mst = parseInt($(this).attr('user-grupo'));
		if (mst < stt || (mst == stt && nick.toLowerCase() < mus)) {
			f = true;
			$(this).before(usertab);
			return false;
		}
	});
	if (f == false) $('.user-list').append(usertab);
	countusers();
}

function stars_html(t, s) {
	var ret = '';
	for (var i = 0; i < t; i++) {
		if (s == 'm') ret += '<i class="icon-star"></i>';
		else ret += '<i class="icon-heart"></i>';
	}
	return ret;
}

function enter(
	id,
	nick,
	sexo,
	edad,
	avatar,
	grupo,
	estrellas,
	status,
	ip,
	mensajes,
	priv,
	mute,
	localice,
	nav,
	platform
) {
	online(
		id,
		nick,
		sexo,
		edad,
		avatar,
		grupo,
		estrellas,
		status,
		ip,
		mensajes,
		priv,
		mute,
		localice,
		1
	);
	var myip = '';
	var sex =
		sexo == 'm'
			? '<i class="icon-user"></i>'
			: '<i class="icon-user-female"></i>';
	if ((prv & 1) == 1) myip = '- [' + long2ip(ip) + ']';
	var ms =
		'*** Entra: ' +
		sex +
		' <nick class="stt' +
		grupo +
		'" onclick="mention(\'' +
		nick +
		'\');">' +
		nick +
		'</nick> - [' +
		groups[grupo] +
		'] - <label class="fl_' +
		cou(localice) +
		'" style="margin-top:3px;"></label> <a>' +
		country(localice) +
		'</a> - <i class="icon-bubbles"></i> <a>' +
		mensajes +
		'</a> - <i class="icon-screen-desktop"></i> <a>' +
		platform +
		'</a> - <i class="icon-globe-alt"></i> <a>' +
		nav +
		'</a> ' +
		myip;
	write_msg(0, 0, 'sys', ms);
	var ex = $('#w' + id).get(0);
	var ax =
		'<a class="zoom" href="' +
		get(id, 'av-2') +
		'"><img src="' +
		get(id, 'avatar') +
		'" class="img-circle" width="22" height="22"></a>';
	if (ex == null) {
		$('#float-mnu4').append(
			'<span title="' +
				nick +
				'" time="' +
				$.now() +
				'" class="usernew" id="w' +
				id +
				'">' +
				ax +
				'</span>'
		);
		$('.usernew').each(function () {
			if ($('.usernew').length <= 12) return;
			$(this).remove();
		});
	}
}

function preferencias() {
	if ($.cookie('nopv') == null || $.cookie('nopv') == 0) {
		nopv = false;
	} else {
		nopv = true;
		$('#prefnopv').attr('checked', true);
	}
	if ($.cookie('sound') == null || $.cookie('sound') == 0) {
		sound = true;
	} else {
		sound = false;
		$('#prefsound').attr('checked', true);
	}
}

function apr(w) {
	return $('#u_' + w).removeClass('send');
}

function addfile(num, name) {
	var container = $('#files_contens');
	var a = name.split('.');
	var ext = a[a.length - 1].toLowerCase();
	if ($.inArray(ext, ['jpg', 'png', 'gif']) != -1) {
		var icon = 'icon-picture';
	} else {
		var icon = 'icon-docs';
	}
	var content =
		'<tr id="file_' +
		num +
		'"><td><i class="' +
		icon +
		' pull-left"></i><a name="' +
		name +
		'" style="padding-left:5px;" data-toggle="tooltip" data-original-title="Compartir" onclick="sharefil(this);" role="button">' +
		name +
		'</a><i class="icon-trash pull-right" file="' +
		num +
		'" name="' +
		name +
		'" onclick="deletefil(this);" data-toggle="tooltip" data-original-title="Eliminar" role="button"></i></td></tr>';
	container.append(content);
	run_tooltip();
}

function sharefil(e) {
	var name = $(e).attr('name');
	$.confirm({
		title: false,
		content: 'Compartir ' + name + ' con ' + get(tabsel, 'nick'),
		buttons: {
			Compartir: function () {
				cmd.add({ act: 'share', file: name, to: tabsel }, 1);
			},
			Cancelar: function () {},
		},
	});
}

function deletefil(e) {
	var fil = $(e).attr('file');
	var name = $(e).attr('name');
	$.confirm({
		title: false,
		content: 'Deseas eliminar el fichero ' + name,
		buttons: {
			Eliminar: function () {
				cmd.add({ act: 'deletefil', file: name, num: fil }, 1);
			},
			Cancelar: function () {},
		},
	});
}

function downfile(fl, us, chk) {
	if (chk) {
		cmd.add({ act: 'downfile', file: fl, num: us }, 1);
	} else {
		var ir = 'downfile.php?f=' + fl + '&u=' + us;
		location.href = ir;
	}
}

function file_delete(num) {
	return $('#file_' + num).remove();
}

var cliente = {
	/* last response from the server */
	server: 0,
	/* time to send */
	time: 0,
	/* time to average */
	ttime: 0,
	/* is sending */
	out: false,
	/* number of errors */
	error: 0,
	/* chat inactivity */
	init: 0,
	/* for the interval */
	interval: null,
	/* time for ping */
	ping: 5,
	/* time of arrival */
	lag: 0,
	endcheck: function () {
		/* clear ping interval */
		clearInterval(this.interval);
	},
	startcheck: function () {
		/* self */
		var self = this;

		/* interval for ping */
		this.interval = setInterval(function () {
			/* increase time */
			self.time++;

			/* increase ttime */
			self.ttime++;

			/* increase inactivity */
			self.init++;

			$('.xpin').html(-self.ping + self.time);

			if (self.time == self.ping && self.out == false) {
				cmd.send();
			} else if (self.ttime == 15) {
				self.ttime = 0;
				cmd.send();
			}

			if (self.error > 0) {
			} else {
			}

			/* delay ping */
			if (self.init > 300) {
				self.ping = 16;
			} else if (self.init < 300 && self.ping == 16) {
				/* restore */
				self.ping = 5;
			}

			/* 30 min of inactivity */
			if (self.init > 1800 && get(yo, 'grupo') < 8) {
				self.init = 0;
				cmd.add(
					{
						act: 'bye',
						reason: 3,
					},
					1
				);
			}

			checkactive();
		}, 1000);
	},
};

var cmd = {
	/* commands to send */
	comando: [],

	/* number sends */
	mx: 0,

	/* how far has it been sent */
	cur: 0,

	/* add data */
	add: function (data, s) {
		/* add comando */
		this.comando['cm' + this.mx] = data;

		/* increase */
		this.mx++;

		/* send direct */
		if (s) return this.send();
		return false;
	},

	/* send */
	send: function () {
		if (cliente.out != false) return;
		var str = '';
		for (var i = this.cur; i < this.mx; ++i) {
			var w = this.comando['cm' + i];
			if (w != null) {
				var d = '';
				for (var k in w) d += (d == '' ? '' : '&') + k + '=' + w[k];
				str += (str == '' ? '' : '\r\n') + d;
			}
		}
		cliente.out = true;
		return this.proccess(encodeURI(str));
	},

	proccess: function (w) {
		var data = w ? w : '';
		return ajax.submit({
			sess: sess,
			svr: cliente.server,
			data: data,
			mx: this.mx,
		});
	},

	refresh: function (w) {
		for (var t = 0; t < w; t++) {
			delete cmd.comando['cm' + t];
			cmd.cur = t;
		}
	},
};

var ajax = {
	exe: [],
	mx: 0,
	submit: function (data) {
		/* reset ttime */
		cliente.ttime = 0;

		/* calculate time */
		cliente.lag = $.now();

		/* number of executions */
		var x = this.mx;

		/* petition */
		var a = 'a' + x;

		/* this */
		var self = this;

		/* ajax */
		this.exe[a] = $.ajax({
			url: 'server.php',
			data: data,
			type: 'post',
			dataType: 'json',
			cache: false,
			success: function (j) {
				if (data.mx != null) cmd.refresh(data.mx);

				self.remove(x);

				self.calculate(($.now() - cliente.lag) / 1500);

				/* no mistake */
				cliente.error = 0;

				/* reset time */
				cliente.time = 0;

				if (j.svr != null) cliente.server = j.svr;

				if (j.act) {
					for (var ac in j.act) {
						eval('var ob=' + ac);
						$.extend(ob, j.act[ac]);
					}
				}

				if (j.files) {
					for (var file in j.files) {
						addfile(file, j.files[file]);
					}
				}

				if (evaluate.runnow == false) {
					evaluate.rum(j.exe);
				} else {
					evaluate.runlater(j.exe);
				}
			},
			error: function (e) {
				cliente.error++;
				self.remove(x);
			},
		});
		this.mx++;
		return this.exe[ajax];
	},
	remove: function (w) {
		var e = this.exe['a' + w];
		if (w + 1 == this.mx) {
			/* reset to false submission */
			cliente.out = false;
			/* reset ttime */
			cliente.ttime = 0;
		}
		while (e != null) {
			e.abort();
			delete this.exe['a' + w];
			w--;
			e = this.exe['a' + w];
		}
	},
	calculate: function (w) {
		var pt = w.toString().split('.');
		pt[1] = pt[1] || '000';
		pt[1] = pt[1].substr(0, 3);
		var add = '';
		var l = pt[1].length;
		if (l == 1) add = '00';
		else if (l == 2) add = '0';
		return $('.xlag').html(pt[0] + '.' + pt[1] + add);
	},
};

var evaluate = {
	runnow: false,
	torun: [],
	runlater: function (w) {
		if (this.runnow == false) {
			this.rum(w);
		} else {
			var self = this;
			setTimeout(function () {
				self.runlater(w);
			}, 500);
		}
	},
	rum: function (w) {
		this.runnow = true;
		for (var t in w) {
			var it = w[t].split('|');
			var fn = it.shift();
			var namef = fn + this.param(it);
			this.torun.push(namef);
		}
		this.exetorun();
	},
	exetorun: function (w) {
		var ex = null;
		if ((ex = this.torun.shift())) {
			try {
				eval(ex);
			} catch (e) {
				console.log(e);
			}
			var self = this;
			if (ex.indexOf('write_msg') != -1) {
				setTimeout(function () {
					self.exetorun();
				}, Math.random() * 100 + 200);
			} else self.exetorun();
		} else {
			this.runnow = false;
		}
	},
	param: function (w) {
		var ret = '';
		for (var t in w)
			ret += (ret == '' ? '' : ',') + '"' + this.addslashes(w[t]) + '"';
		return '(' + ret + ')';
	},
	addslashes: function (str) {
		return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
	},
};

var stats = {
	visits: null,
	max: null,
	online: 0,
	rating: [],
	staff: [],
	total: 0,
	masculino: 0,
};

var baneados = {
	user: [],
};

function viewban($view) {
	if ((prv & 8) == 8 && $view == null) {
		cmd.add(
			{
				act: 'viewban',
			},
			1
		);
	} else if ($view != null) {
		$('#datatable').dataTable().fnDestroy();
		var table = '';
		for (var pt in baneados.user) {
			var user = baneados.user[pt];
			table += '<tr id="ban_' + user.id + '">';
			table += '<td align="center" width="5">';
			table +=
				'<input class="checkbox_ban" type="checkbox" value="' +
				user.id +
				'" data-plugin="switchery" data-color="#337ab7" data-size="small">';
			table += '</td>';
			table += '<td>';
			table += user.user;
			table += '</td>';
			table += '<td>';
			table += long2ip(user.ip);
			table += '</td>';
			table += '<td>';
			table += user.oper;
			table += '</td>';
			table += '<td>';
			table += user.reason;
			table += '</td>';
			table += '<td>';
			table += user.date.split(' ')[0];
			table += '</td>';
			table += '</tr>';
		}
		$('#users_ban').html(table);
		$('.checkbox_ban').each(function (idx, obj) {
			new Switchery($(this)[0], $(this).data());
		});
		$('#datatable').DataTable({
			language: {
				url: 'static/js/dataTables.json',
			},
		});
		$('#uban_users').modal();
	} else {
		return false;
	}
}

function uban_users() {
	if ((prv & 8) != 8) return;
	var pt = '';
	$('.checkbox_ban:CHECKED').each(function () {
		pt += (pt == '' ? '' : ',') + $(this).attr('value');
	});
	if (pt == '') return;
	cmd.add(
		{
			act: 'uban',
			ids: pt,
		},
		1
	);
	$('.btn-uban').prop('disabled', true).html('Desbaneando...');
}

function uban_success(ids) {
	var pt = ids.split(',');
	for (var i in pt) {
		$('tr#ban_' + pt[i]).remove();
	}
	return $('.btn-uban').prop('disabled', false).html('Desbanear');
}
