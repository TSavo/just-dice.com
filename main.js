var timer;
var bal;
var bet;
var current_steps = 1;
var start_bet = 0.00001;
var $run;
var running = false;
var graphRunning = false;
var arr_ignore = new Array();
var oldBal = 0;
var losses = 0;
var lastWin = new Date().getTime() - 10000;
var first = 0;
var usdCache = 0;
var usdCacheAge = 0;

var plot;
var variancePlot;
var balanceData = [ {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	}
} ];
var varianceData = [ {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	}
}, {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	}
}, {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	}
}, {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	}
} ]
var winsBeforeLosses = 0;
var lossesBeforeWins = 0;
var varianceRatio = 0;
var winLossRatioMA = 0;

var timer_num = function() {
	return parseInt(50);
};

function cacheUSD() {
	if (usdCacheAge < new Date().getTime() - 60000) {
		$.ajax("https://api.bitcoinaverage.com/all", {
			success : function(data) {
				usdCache = data;
			}
		});
		usdCacheAge = new Date().getTime();
	}
}
function updateUSD() {
	$(".investmentUSD").html(
			(parseFloat($(".investment").html()) * usdCache[$(
					"#currencySelector").val()]["averages"]["24h_avg"])
					.toFixed(2)
					+ " " + $("#currencySelector").val());
	$(".invest_pftUSD").html(
			(parseFloat($(".invest_pft").html()) * usdCache[$(
					"#currencySelector").val()]["averages"]["24h_avg"])
					.toFixed(2)
					+ " " + $("#currencySelector").val());
	$(".myprofitUSD")
			.html(
					(parseFloat($(".myprofit").html()) * usdCache[$(
							"#currencySelector").val()]["averages"]["24h_avg"])
							.toFixed(2)
							+ " " + $("#currencySelector").val());
	$(".wageredUSD").html(
			(parseFloat($(".wagered").html()) * usdCache[$("#currencySelector")
					.val()]["averages"]["24h_avg"]).toFixed(2)
					+ " " + $("#currencySelector").val());
	$("#pct_balanceUSD")
			.val(
					($("#pct_balance").val() * usdCache[$("#currencySelector")
							.val()]["averages"]["24h_avg"]).toFixed(2)
							+ " " + $("#currencySelector").val());
}
var profitPerMS = 0;
var lastUpdate = new Date().getTime();
var lastBal = 0;
function updateProfitPer() {
	// winning = true;
	// console.debug("winning");
	if (!$.isNumeric($("#pct_balance").val())) {
		return;
	}
	var profit = parseFloat($("#pct_balance").val()) - lastBal;
	lastBal = parseFloat($("#pct_balance").val());
	var now = new Date().getTime();
	var diff = Math.max(1, now - lastUpdate);
	lastUpdate = now;
	if (profitPerMS == 0 || isNaN(profitPerMS)) {
		profitPerMS = profit / diff;
	} else {
		profitPerMS += profit / diff;
		profitPerMS /= 2;
	}
	$(".profitPerS").html((profitPerMS * 1000).toFixed(8));
	$(".profitPerSUSD").html(((profitPerMS * 60000 * 1440)).toFixed(8));
}
function updateUI() {
	set_run();
	updateUSD();
}

function updateWinCount() {
	winsBeforeLosses++;
	if (winLossRatioMA == 0) {
		winLossRatioMA += winsBeforeLosses;
	} else {
		winLossRatioMA += winsBeforeLosses;
		winLossRatioMA /= 2;
	}
	lossesBeforeWins = 0;
	varianceRatio++;
	varianceData[0].data.push([ new Date().getTime(), winsBeforeLosses ]);
	varianceData[1].data.push([ new Date().getTime(), lossesBeforeWins ]);
	varianceData[2].data.push([ new Date().getTime(), varianceRatio ]);
	varianceData[3].data.push([ new Date().getTime(), winLossRatioMA ]);
	if (varianceData[0].data.length > 200) {
		varianceData[0].data.splice(0, 1);
		varianceData[1].data.splice(0, 1);
		varianceData[2].data.splice(0, 1);
		varianceData[3].data.splice(0, 1);
	}
	variancePlot.setData(varianceData);
	variancePlot.setupGrid();
	variancePlot.draw();
}

function updateLossCount() {
	lossesBeforeWins++;
	if (winLossRatioMA == 0) {
		winLossRatioMA += lossesBeforeWins;
	} else {
		winLossRatioMA += lossesBeforeWins;
		winLossRatioMA /= 2;
	}
	winsBeforeLosses = 0;
	varianceRatio--;
	varianceData[0].data.push([ new Date().getTime(), winsBeforeLosses ]);
	varianceData[1].data.push([ new Date().getTime(), lossesBeforeWins ]);
	varianceData[2].data.push([ new Date().getTime(), varianceRatio ]);
	varianceData[3].data.push([ new Date().getTime(), winLossRatioMA ]);
	if (varianceData[0].data.length > 200) {
		varianceData[0].data.splice(0, 1);
		varianceData[1].data.splice(0, 1);
		varianceData[2].data.splice(0, 1);
		varianceData[3].data.splice(0, 1);
	}

	variancePlot.setData(varianceData);
	variancePlot.setupGrid();
	variancePlot.draw();
}

function updateBalanceChart() {
	var x = (new Date()).getTime(), y = parseFloat($("#pct_balance").val());
	if (y != oldBal && !isNaN(y)) {
		balanceData[0].data.push([ x, y ]);
		if (balanceData[0].data.length > 200) {
			balanceData[0].data.splice(0, 1);
		}
		plot.setData(balanceData);
		plot.setupGrid();
		plot.draw();
	}
	oldBal = y;
}

function updateBalanceChart() {
	var x = (new Date()).getTime(), y = parseFloat($("#pct_balance").val());
	if (y != oldBal && !isNaN(y)) {
		balanceData[0].data.push([ x, y ]);
		if (balanceData[0].data.length > 200) {
			balanceData[0].data.splice(0, 1);
		}
		plot.setData(balanceData);
		plot.setupGrid();
		plot.draw();
	}
	oldBal = y;
}

function resetLastWin() {
	lastWin = new Date().getTime();
}
function stuckRefresh() {
	if (running && lastWin < new Date().getTime() - 60000) {
		window.location = window.location;
		resetLastWin();
	}
}

function martingale() {

	if (bal.data('oldVal') != bal.val() && running) {
		clearInterval(timer);
		updateUSD();
		var curr_bal = bal.val();
		if (curr_bal > bal.data('oldVal')) {
			set_run();
			updateProfitPer();
			updateWinCount();
			resetLastWin();
			current_steps = 1;
			$("#pct_bet").val((parseFloat(start_bet)).toFixed(8));
			$("#a_hi").trigger('click');
		}

		else if ($.isNumeric($("#multiplier").val())
				&& $.isNumeric($("#steps").val())
				&& (current_steps <= $("#steps").val())) {
			

			updateLossCount();

			// Increase our bet by the multiplier
			var new_val = ($("#pct_bet").val() * $("#multiplier").val())
					.toFixed(8);

			$("#pct_bet").val(new_val);

			// Increase the steps
			current_steps++;
			$("#a_hi").trigger('click');
		} else {
			current_steps = 1;
			$("#pct_bet").val(start_bet.toFixed(8));
			running = false;
		}

		// Updated stored value
		bal.data('oldVal', bal.val());
		timer = setInterval(function() {
			martingale()
		}, timer_num());

	}

	else
		bal.data('oldVal', bal.val());

}

// Added Extra tab from Grays Bot. This is currently just a placeholder.
function tabber() {
	var markup = '<div class="bot-stats"><div class="statspanel"><h2>Stats</h2></div><div class="clear"></div><div id="container" style="height: 400px; width:916px; margin: 0 auto"></div><div id="variancePlot" style="height: 400px; width:916px; margin: 0 auto"></div></div>';
	$panelWrapper = $('<div>').attr('id', 'Nixsy9').css({
		display : 'none'
	}).insertAfter('#faq'), $panel = $('<div>').addClass('panel')
			.append(markup).appendTo($panelWrapper),

	$s_bet = $('#gbs_bet')

	$('<li>').append($('<a>').text('Charts').attr('href', '#Nixsy9')).appendTo(
			'.tabs');
};

function ping_user() {

	var log = $(".chatlog");
	log.data('oldVal', log.html());
	log.data('length', 0);
	setInterval(
			function() {

				var new_str = log.html();
				var arr = new Array();
				arr = new_str.split('<br>');
				if (log.data('length') != arr.length
						|| log.data('length') === 101) {

					var depth;
					if (log.data('length') === 101) {
						// console.log('here');
						depth = 0;
					} else
						depth = arr.length - 2;

					// if this is the first time we'll look at every line,
					// otherwise we'll just do the last (which is arr.length -
					// 2)
					for (var line_count = depth; line_count < arr.length - 1; line_count++) {

						var line = arr[line_count];
						if (typeof line !== 'undefined') {

							var line_items = line.split(' ');
							var username = $('#login span:first-child').text();
							var pos = line_items.indexOf(username, 3);
							if (pos >= 0) {
								line_items[pos] = line_items[pos].replace(
										username,
										'<span style="color:red;font-weight:bold;">'
												+ username + '</span>');

								var new_line = line_items.join(' ');
								arr[line_count] = new_line;
							}

							// ignore
							var i;
							for (i = 0; i < arr_ignore.length; i++) {
								var ignore_user = '&lt;' + arr_ignore[i]
										+ '&gt;';
								var ignore_pos = line_items.indexOf(
										ignore_user, 2);
								// console.log('target:' + line_items[2]);
								if (ignore_pos > -1)
									arr[line_count] = 'ignored';
							}
						} // if undefined
					} // for

					var new_log = arr.join('<br>');
					log.html(new_log);
					log.data('length', arr.length);
					// console.log('length: ' + arr.length);
					// $.playSound('notify.wav');
				}
			}, 100);
}

function create_ui() {

	$('.button_inner_group:nth(2)')
			.append('<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("invest", csrf, "all", $("#invest_code").val());\'>invest all<div class="key">J</div></button>')
			.append('<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("divest", csrf, "all", $("#divest_code").val());\'>divest all<div class="key">K</div></button>');

	var $container = $('<div class="container"/>');
	var $button_group = $('<div class="button_group"/>');
	$container.append($button_group);
	$button_group2 = $('<div class="button_group" style="margin:18px; margin-left:-18px;"/>');
	$container.append($button_group2);

	var $martingale_button = $('<button class="button_label chance_toggle" style="margin-top:4px;height:113px;">Bot</button>');

	var $run_div = $('<div class="button_inner_group" />');
	$run = $('<button id="c_run" style="margin-top:3px;">Start<div class="key">R</div></button>');

	$run.click(function() {
		lastWin = new Date().getTime();
		running = true;
		start_bet = $("#startingBet").val();
		setSetting("startingBet", start_bet);
		$("#pct_bet").val(start_bet);
		$("#a_hi").trigger('click');
	});
	$run_div.append($run);

	$Stop = $('<button id="c_stop" style="margin-top:3px;">Stop<div class="key">Q</div></button>');
	$Stop.click(function() {
		running = false;
	});
	$run_div.append($Stop);

	var $row0 = $('<div class="row"/>');
	var $label0 = $('<p class="llabel">Starting Bet</p>');
	var $startingBet = $('<input id="startingBet" value="0.00001"/>');
	$startingBet.keyup(function() {
		start_bet = $startingBet.val();
		setSetting("startingBet", start_bet);
		set_run();
	});
	getSetting("startingBet", function(startingBet) {
		$("#pct_bet").val(startingBet);
		$("#startingBet").val(startingBet);
		start_bet = startingBet;
	});
	var $x = $('<p class="rlabel">BTC</p>');
	$row0.append($label0);
	$row0.append($startingBet);
	$row0.append($x);

	var $row1 = $('<div class="row"/>');
	var $label1 = $('<p class="llabel">Multiplier</p>');
	var $multiplier = $('<input id="multiplier" value="2.02"/>');
	$multiplier.keyup(function() {
		setSetting("multiplier", $("#multiplier").val());
		set_run();
	});
	getSetting("multiplier", function(val) {
		$("#multiplier").val(val);
	});
	$x = $('<p class="rlabel">x</p>');
	$row1.append($label1);
	$row1.append($multiplier);
	$row1.append($x);

	var $row2 = $('<div class="row"/>');
	var $label2 = $('<p class="llabel">Max losses</p>');
	var $steps = $('<input id="steps" value="15"/>');
	$steps.keyup(function() {
		setSetting("maxLosses", $("#steps").val());
		set_run();
	});
	getSetting("maxLosses", function(val) {
		$("#steps").val(val);
	});
	var $numz = $('<p class="rlabel">#</p>');
	$row2.append($label2);
	$row2.append($steps);
	$row2.append($numz);

	var $row3 = $('<div class="row"/>');
	var $label3 = $('<p class="llabel">Total risk</p>');
	$delay = $('<input id="totalRisk" class="readonly"/>');
	$numz = $('<p class="rlabel">BTC</p>');
	$row3.append($label3);
	$row3.append($delay);
	$row3.append($numz);

	var $row4 = $('<div class="row"/>');
	var $label4 = $('<p class="llabel">Bets Until Bust</p>');
	$delay = $('<input id="bub" class="readonly"/>');
	$numz = $('<p class="rlabel">#</p>');
	$row4.append($label4);
	$row4.append($delay);
	$row4.append($numz);

	var $row5 = $('<div class="row"/>');
	var $label5 = $('<p class="llabel">Auto-Start Bot</p>');
	var autostart = $('<input id="autostart" class="readonly" style="color:red; cursor:pointer;" value = "DISABLED"/>');
	var end = $('<p class="rlabel">&nbsp;</p>');
	autostart.click(function() {
		if ($("#autostart").val() == "ENABLED") {
			$("#autostart").val("DISABLED").css("color", "red");
		} else {
			$("#autostart").val("ENABLED").css("color", "green");
		}
		setSetting("autostart", $("#autostart").val());
	});
	getSetting("autostart", function(a) {
		if (a == "ENABLED") {
			$("#autostart").val(a).css("color", "green");
			running = true;
		}
	});
	$row5.append($label5);
	$row5.append(autostart);
	$row5.append(end);

	var $fieldset = $('<fieldset/>');
	var $fieldset2 = $("<fieldset/>");
	$fieldset.append($row0);
	$fieldset.append($row1);
	$fieldset.append($row2);
	$fieldset2.append($row3);
	$fieldset2.append($row4);
	$fieldset2.append($row5);

	$button_group.append($martingale_button);
	$button_group.append($fieldset);
	$button_group.append($fieldset2);
	$button_group
			.append("<div style='color:white; font-size:8pt;'>Like the bot? Send a tip to Sapphire here: 1Eyd47ZFc3AbRNBMaXRiJBStKvNka9ASwE</div>");

	$button_group2.append($run_div);

	$(".container").eq('1').append($container);
	$(".container").eq('1').append('<div style="clear:left;"/>');
	$
			.ajax(
					"https://api.bitcoinaverage.com/all",
					{
						success : function(data) {
							// usdCache =
							// parseFloat(data.USD.averages["24h_avg"]);
							currencyOptions = "";
							for (i in data) {
								if (i == "USD") {
									currencyOptions += "<option value=\"" + i
											+ "\" SELECTED>" + i + "</option>";

								} else if (i.length == 3) {
									currencyOptions += "<option value=\"" + i
											+ "\">" + i + "</option>";
								}
							}
							$(".chatstat table tbody")
									.append(
											'<tr><th><select id="currencySelector">'
													+ currencyOptions
													+ '</select></th><td><span class="investmentUSD"></span></td><td><span class="invest_pftUSD"></span></td><td></td><td><span class="profitPerSUSD"></span></td><td><span class="wageredUSD"></span></td><td><span class="myprofitUSD"></span></td></tr>');
							setTimeout(updateUSD, 5000);
						}
					});

	$(".balance").append('<br><input id="pct_balanceUSD" class="readonly" tabindex="-1">');
	
	plot = $.plot("#container", balanceData, {
		series : {
			shadowSize : 0
		},
		xaxis : {
			mode : "time"
		},
		yaxis : {
		}
	});

	variancePlot = $.plot("#variancePlot", varianceData, {
		series : {
			shadowSize : 0
		},
		xaxis : {
			mode : "time"
		},
		yaxis : {
		}
	});
}

function set_run() {
	var $multiplier = $("#multiplier");
	if ($multiplier !== undefined && $("#steps") !== undefined)
		if ($.isNumeric($multiplier.val()) && $.isNumeric($("#steps").val())
				&& $.isNumeric($('#startingBet').val())) {

			var total = 0;
			var mult = 1;
			var i;
			// console.log('steps: ' + $("#steps").val() + ' multiplier:'
			// + $multiplier.val() + ' bal: ' + $('#pct_balance').val()
			// + ' bet:' + start_bet);

			for (i = 0; i < $("#steps").val(); i++) {
				total += start_bet * mult;
				mult *= $multiplier.val();
			}
			$("#totalRisk").val(total.toFixed(8));
			$("#bub").val(
					parseInt(Math.pow(
							4 * (parseFloat($("#pct_chance").val()) * 0.01),
							parseFloat($("#steps").val()))));

			// console.log('total:' + total);

			if (total != 0 && total < $('#pct_balance').val()) {
				// console.log("setting class VALID");
				$run.removeClass('invalid');
			} else {
				// console.log("setting class invalid");
				$run.addClass('invalid');
				running = false;

			}
		} else {
			// console.log("setting class invalid");
			$run.addClass('invalid');
			running = false;
			setTimeout(set_run, 500);
		}
}



function getSetting(key, callback) {
	chrome.storage.sync.get(key, function(settingsSync) {
		if (settingsSync[key] != undefined) {
			callback(settingsSync[key]);
		} else {
			return null;
		}
	});
}
function setSetting(key, value) {
	chrome.storage.sync.get(null, function(val) {
		val[key] = value;
		chrome.storage.sync.set(val);
	});
}
//
// The main stuff
//
$(document).ready(function() {

	tabber();

	console.log('starting');
	cacheUSD();

	create_ui();

	ping_user();

	// drawchart();
	setInterval(cacheUSD, 60000);
	setInterval(stuckRefresh, 10000);
	// setInterval(updateProfitPer, 10000);

	// set the balance
	// when the balance changes and we're martingaling
	// we'll do our stuff
	bal = $("#pct_balance");
	bal.data('oldVal', bal.val());
	lastBal = bal.val();
	timer = setInterval(function() {
		martingale()
	}, timer_num());

	// we also monitor the bet b/c it can also determine if
	// we have enough btc to bet the martingale run
	bet = $("#pct_bet");
	bet.data('oldVal', bet.val());

	// set our array list

	$(document).keydown(function(e) {
		var ctrlDown = false;
		var ctrlKey = 17, qKey = 81, rKey = 82;

		if (!$(document.activeElement).is('input') && (e.keyCode == rKey)) {
			running = true;
			start_bet = $("#startingBet").val();
			setSetting("startingBet", start_bet);
			$("#a_hi").trigger('click');
		}

		$(document).keydown(function(e) {
			if (e.keyCode == ctrlKey)
				ctrlDown = true;
		}).keyup(function(e) {
			if (e.keyCode == ctrlKey)
				ctrlDown = false;
		});

		if (ctrlDown && (e.keyCode == qKey)) {
			clearInterval(timer);
			running = false;
			current_steps = 1;
		}
	});

});

(function($) {

	$
			.extend({
				playSound : function() {
					return $(
							"<embed src='"
									+ arguments[0]
									+ "' hidden='true' autostart='true' loop='false' class='playSound'>")
							.appendTo('body');
				}
			});

})(jQuery);
