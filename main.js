var current_steps = 1;
var $run;
var running = false;
var graphRunning = false;
var arr_ignore = new Array();
var oldBal = 0;
var botBal = NaN;
var losses = 0;
var lastWin = new Date().getTime() - 10000;
var first = 0;
var usdCache = 0;
var usdCacheAge = 0;
var lastVarianceWrite = new Date().getTime();
var lastBalanceWrite = new Date().getTime();
var lastProfitWrite = new Date().getTime();
var uiBalance = 0;
var timesBeforeLoss = 0;
var rollHigh = true;

var standardSeries = {
		series : {
			shadowSize : 5
		},
		xaxis : {
			mode : "time"
		},
		yaxis : {},
		legend : {
			position : "nw"
		}
	};
var defaultProfitData = [ {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	},
	label : "Profit Per Day"
}, {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	},
	label : "Profit Per Day EMA"
} ];
var profitData = JSON.parse(JSON.stringify(defaultProfitData));
var balanceChart;
var varianceChart;
var profitChart;
var defaultBalanceData = [ {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	},
	label : "Balance"
} ];
var balanceData = JSON.parse(JSON.stringify(defaultBalanceData));
var defaultVarianceData = [ {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	},
	label : "Consecutive Wins"
}, {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	},
	label : "Consecutive Losses"
}, {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	},
	label : "Win:Loss Ratio"

}, {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : true
	},
	label : "Consecutive Win/Loss EMA"
}, {
	data : [],
	lines : {
		show : true
	},
	points : {
		show : false
	},
	label : "Max Losses"
} ]
var varianceData = JSON.parse(JSON.stringify(defaultVarianceData));
var winsBeforeLosses = 0;
var lossesBeforeWins = 0;
var varianceRatio = 0;
var winLossRatioMA = 0;
var profitPerMS = 0;
var lastUpdate = new Date().getTime();
var lastBal = 0;
var highscore = 0;



function commaify(num) {
	num = num + "";
	var num2;
	num = num.replace(/^([0-9]+)([0-9]{3})$/, "$1,$2");
	while (true) {
		num2 = num.replace(/([0-9])([0-9]{3}[,.])/, "$1,$2");
		if (num == num2)
			break;
		num = num2
	}
	return num
}
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
	if (!$.isNumeric($("#pct_balance").val())) {
		return;
	}
	if (usdCache[$("#currencySelector").val()] == undefined) {
		return;
	}
	$(".investmentUSD").html(
			commaify((parseFloat($(".investment").html()) * usdCache[$(
					"#currencySelector").val()]["averages"]["24h_avg"])
					.toFixed(2))
					+ " " + $("#currencySelector").val());
	$(".invest_pftUSD").html(
			commaify((parseFloat($(".invest_pft").html()) * usdCache[$(
					"#currencySelector").val()]["averages"]["24h_avg"])
					.toFixed(2))
					+ " " + $("#currencySelector").val());
	$(".myprofitUSD").html(
			commaify((parseFloat($(".myprofit").html()) * usdCache[$(
					"#currencySelector").val()]["averages"]["24h_avg"])
					.toFixed(2))
					+ " " + $("#currencySelector").val());
	$(".wageredUSD").html(
			commaify((parseFloat($(".wagered").html()) * usdCache[$(
					"#currencySelector").val()]["averages"]["24h_avg"])
					.toFixed(2))
					+ " " + $("#currencySelector").val());
	$("#pct_balanceUSD").val(
			commaify(($("#pct_balance").val() * usdCache[$("#currencySelector")
					.val()]["averages"]["24h_avg"]).toFixed(2))
					+ " " + $("#currencySelector").val());
}

function updateProfitPer() {
	if (!$.isNumeric($("#pct_balance").val())) {
		return;
	}
	var profit = parseFloat($("#pct_balance").val()) - lastBal;
	lastBal = parseFloat($("#pct_balance").val());
	var now = new Date().getTime();
	var diff = Math.max(1, now - lastUpdate);
	lastUpdate = now;
//	profitData[0].data.push([ now, (profit / diff) * 60000 * 1440 ]);
//	if (profitData[0].length > 100) {
//		profitData[0].splice(0, 1);
//	}
	if (profitPerMS == 0 || isNaN(profitPerMS)) {
		profitPerMS = profit / diff;
	} else {
		profitPerMS += profit / diff;
		profitPerMS /= 2;
	}
//	profitData[1].data.push([ now, profitPerMS * 60000 * 1440 ]);
//	if (profitData[1].length > 100) {
//		profitData[1].splice(0, 1);
//	}
	$(".profitPerSUSD").html(((profitPerMS * 60000 * 1440)).toFixed(8));
	//profitChart.setData(profitData);
	//profitChart.setupGrid();
	//profitChart.draw();
//	if (new Date().getTime() > lastProfitWrite + 10000
//			+ (Math.random() * 10000)) {
//		lastProfitWrite = new Date().getTime();
//		setSetting("profitData", profitData);
//	}
}

function updateUI() {
	var balance = parseFloat($("#pct_balance").val());
	if (isNaN(balance)) {
		return;
	}
	if (uiBalance == balance) {
		return;
	}
	set_run();
	//updateBalanceChart();
	updateUSD();
	if (uiBalance == 0 && balance > 0) {
		uiBalance = balance;
		return;
	}
	if (balance > uiBalance) {
		updateWinCount();
		updateProfitPer()
	} else {
		updateLossCount();
	}
	uiBalance = balance;
}

function updateVarianceChart() {
	varianceData[0].data.push([ new Date().getTime(), winsBeforeLosses ]);
	varianceData[1].data.push([ new Date().getTime(), lossesBeforeWins ]);
	varianceData[2].data.push([ new Date().getTime(), varianceRatio ]);
	varianceData[3].data.push([ new Date().getTime(), winLossRatioMA ]);
	varianceData[4].data.push([ new Date().getTime(),
			parseInt($("#steps").val()) ])
	if (varianceData[0].data.length > 200) {
		varianceData[0].data.splice(0, 1);
		varianceData[1].data.splice(0, 1);
		varianceData[2].data.splice(0, 1);
		varianceData[3].data.splice(0, 1);
		varianceData[4].data.splice(0, 1);
	}
	varianceChart.setData(varianceData);
	varianceChart.setupGrid();
	varianceChart.draw();
	if (new Date().getTime() > lastVarianceWrite + 10000
			+ (Math.random() * 10000)) {
		lastVarianceWrite = new Date().getTime();
		setSetting("varianceData", varianceData);
	}
}

function updateWinCount() {
	timesBeforeLoss++;
	winsBeforeLosses++;
	if (winLossRatioMA == 0) {
		winLossRatioMA += winsBeforeLosses;
	} else {
		winLossRatioMA += winsBeforeLosses;
		winLossRatioMA /= 2;
	}
	lossesBeforeWins = 0;
	varianceRatio++;
	//updateVarianceChart();
}

function updateLossCount() {
	timesBeforeLoss++;
	lossesBeforeWins++;
	if (winLossRatioMA == 0) {
		winLossRatioMA += lossesBeforeWins;
	} else {
		winLossRatioMA += lossesBeforeWins;
		winLossRatioMA /= 2;
	}
	winsBeforeLosses = 0;
	varianceRatio--;
	//updateVarianceChart();
}

function updateBalanceChart() {
	var x = (new Date()).getTime(), y = parseFloat($("#pct_balance").val());
	if (y != oldBal && !isNaN(y)) {
		balanceData[0].data.push([ x, y ]);
		if (balanceData[0].data.length > 200) {
			balanceData[0].data.splice(0, 1);
		}
		balanceChart.setData(balanceData);
		balanceChart.setupGrid();
		balanceChart.draw();
	}
	oldBal = y;
	if (new Date().getTime() > lastBalanceWrite + 10000
			+ (Math.random() * 10000)) {
		lastBalanceWrite = new Date().getTime();
		setSetting("balanceData", balanceData);
	}
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

function roll(){
	if(rollHigh){
		$("#a_hi").trigger('click');
	}else{
		$("#a_hi").trigger('click');
	}
	rollHigh = !rollHigh;
}
function martingale() {

	if(isNaN(botBal)){
		botBal = parseFloat($("#pct_balance").val());
		return;
	}
	if ($("#multiplier") == undefined || $("#steps") == undefined) {
		return;
	}
	if (!$.isNumeric($("#multiplier").val()) || !$.isNumeric($("#steps").val()) || !$.isNumeric($('#startingBet').val())) {
		return;
	}
	if (parseFloat($('#startingBet').val()) > parseFloat($("#pct_balance").val())) {
		return;
	}
	
	if (botBal != parseFloat($("#pct_balance").val()) && running) {
		var curr_bal = $("#pct_balance").val();
		if (curr_bal > botBal) {
			set_run();
			resetLastWin();
			current_steps = 1;
			highscore = Math.max(highscore, curr_bal);
			$("#pct_bet").val((parseFloat($("#startingBet").val()) * (curr_bal < highscore ? (highscore - curr_bal > 0.05 ? 100 : 25) : 1)).toFixed(8));
			roll();
		}
		else if ($.isNumeric($("#multiplier").val())
				&& $.isNumeric($("#steps").val())
				&& (current_steps <= parseInt($("#steps").val()) - 1)) {
			// Increase our bet by the multiplier
			var mult = parseFloat($("#multiplier").val());
			//if(current_steps < 5){
				//mult *= 2;
			//}
			var new_val = (parseFloat($("#pct_bet").val()) * mult).toFixed(8);
			$("#pct_bet").val(new_val);
			if(parseFloat($("#pct_balance").val()) < new_val){
				running = false;
				set_run();
			}
			// Increase the steps
			current_steps++;
			roll();
		} else {
			timesBeforeLoss = 0;
			current_steps = 1;
			$("#pct_bet").val(parseFloat($("#startingBet").val()).toFixed(8));
			botShouldStart();
			//running = false;
		}
		// Updated stored value
		botBal = parseFloat($("#pct_balance").val());
	}
}

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

	var markup = '<div class="bot-stats"><div class="statspanel"><h2>Stats</h2><button id="resetCharts">Reset Charts</button></div><div class="clear"></div><div id="balanceChart" style="height: 400px; width:916px; margin: 0 auto"></div><div id="varianceChart" style="height: 400px; width:916px; margin: 0 auto"></div><div id="profitChart" style="height: 400px; width:916px; margin: 0 auto"></div></div>';
	$panelWrapper = $('<div>').attr('id', 'ChartPanel').css({
		display : 'none'
	}).insertAfter('#faq'), $panel = $('<div>').addClass('panel')
			.append(markup).appendTo($panelWrapper),

	$s_bet = $('#gbs_bet')

	$('<li>').append($('<a>').text('Charts').attr('href', '#ChartPanel'))
			.appendTo('.tabs');
	$("#resetCharts").click(function() {
		varianceData = JSON.parse(JSON.stringify(defaultVarianceData));
		balanceData = JSON.parse(JSON.stringify(defaultBalanceData));
		profitData = JSON.parse(JSON.stringify(defaultProfitData));
	});

	$('.button_inner_group:nth(2)')
			.append(
					'<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("invest", csrf, "all", $("#invest_code").val());\'>invest all<div class="key">J</div></button>')
			.append(
					'<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("divest", csrf, "all", $("#divest_code").val());\'>divest all<div class="key">K</div></button>');

	var $container = $('<div class="container"/>');
	var $button_group = $('<div class="button_group"/>');
	$container.append($button_group);
	$button_group2 = $('<div class="button_group" style="margin:18px; margin-left:-18px;"/>');
	$container.append($button_group2);

	var $martingale_button = $('<button class="button_label chance_toggle" style="margin-top:4px;height:113px;">Bot</button>');

	var $run_div = $('<div class="button_inner_group" />');
	$run = $('<button id="c_run" style="margin-top:3px;">Start<div class="key">R</div></button>');

	$run.click(function() {
		botShouldStart();
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
		var st = parseFloat($("#startingBet").val()).toFixed(8);
		if(st > 0.001){
			$("#startingBet").val(0.001);
		}
		setSetting("startingBet", parseFloat($("#startingBet").val()).toFixed(8));
		set_run();
	});
	getSetting("startingBet", function(startingBet) {
		$("#pct_bet").val(parseFloat(startingBet).toFixed(8));
		$("#startingBet").val(parseFloat(startingBet).toFixed(8));
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
		set_run();
	});
	getSetting("autostart", function(a) {
		if (a == "ENABLED") {
			$("#autostart").val(a).css("color", "green");
			setTimeout(botShouldStart,1);
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
													+ '</select></th><td><span class="investmentUSD">loading...</span></td><td><span class="invest_pftUSD">loading...</span></td><td></td><td><span class="profitPerSUSD">loading...</span></td><td><span class="wageredUSD">loading...</span></td><td><span class="myprofitUSD">loading...</span></td></tr>');
							setTimeout(updateUSD, 5000);
						}
					});

	$(".balance").append(
			'<br><input id="pct_balanceUSD" class="readonly" tabindex="-1">');

	//balanceChart = $.plot("#balanceChart", balanceData, standardSeries);
	//varianceChart = $.plot("#varianceChart", varianceData, standardSeries);
	//profitChart = $.plot("#profitChart", profitData, standardSeries);
}

function botShouldStart(){
	if(!$.isNumeric($("#pct_balance").val())){
		setTimeout(botShouldStart, 500);
		return;
	}
	startBot();
}

function startBot(){
	lastWin = new Date().getTime();
	running = true;
	setSetting("startingBet", $("#startingBet").val());
	$("#pct_bet").val($("#startingBet").val());
	botBal = $("#pct_balance").val();
	roll();
}

function set_run() {
	var $multiplier = $("#multiplier");
	if ($multiplier !== undefined && $("#steps") !== undefined) {
		if ($.isNumeric($multiplier.val()) && $.isNumeric($("#steps").val())
				&& $.isNumeric($('#startingBet').val())) {

			var total = 0;
			var mult = 1;
			var i;

			for (i = 0; i <= $("#steps").val() - 1; i++) {
				total += parseFloat($("#startingBet").val()) * mult;
				//if(i < 5){
					//mult *= parseFloat($multiplier.val()) * 2;
				//}else{
					mult *= parseFloat($multiplier.val());
				//}
			}
			$("#totalRisk").val(total.toFixed(8));
			$("#bub").val(
					parseInt(Math.pow(
							4 * (parseFloat($("#pct_chance").val()) * 0.01),
							parseFloat($("#steps").val()))));

			if (total != 0 && total < $('#pct_balance').val()) {
				$("#totalRisk").css("background-color", "#ddd")
			} else {
				$("#totalRisk").css("background-color", "red")
			}
		} else {
			setTimeout(set_run, 500);
		}
	} else {
		setTimeout(set_run, 500);
	}
}

function getSetting(key, callback) {
	chrome.storage.local.get(key, function(settingsSync) {
		if (settingsSync[key] != undefined) {
			callback(settingsSync[key]);
		}
	});
}
function setSetting(key, value) {
	chrome.storage.local.get(null, function(val) {
		val[key] = value;
		chrome.storage.local.set(val);
	});
}


$(document).ready(function() {

	getSetting("balanceData", function(data) {
		balanceData = data;
	});
	getSetting("varianceData", function(data) {
		varianceData = data;
	});
	getSetting("profitData", function(data) {
		profitData = data;
	});

	create_ui();

	cacheUSD();

	setInterval(cacheUSD, 60000);
	setInterval(stuckRefresh, 10000);
	setInterval(updateUI, 50);
	set_run();
	setInterval(martingale, 10);




	$(document).keydown(function(e) {
		var ctrlDown = false;
		var ctrlKey = 17, qKey = 81, rKey = 82;

		if (!$(document.activeElement).is('input') && (e.keyCode == rKey)) {
			botShouldStart();
		}

		$(document).keydown(function(e) {
			if (e.keyCode == ctrlKey)
				ctrlDown = true;
		}).keyup(function(e) {
			if (e.keyCode == ctrlKey)
				ctrlDown = false;
		});

		if (ctrlDown && (e.keyCode == qKey)) {
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
