var timer;
var bal;
var bet;
var current_steps = 1;
var start_bet = 0;
var $multiplier;
var $steps;
var $run;
var running = false; //Start of graph toggle function
var graphRunning = false;
var arr_ignore = new Array();
var timer_num = function(){        
        return parseInt(1500);
}; //Timer delay between bets.
var current_bet_num = 0;

// Extra buttons found on pastebin http://pastebin.com/n8X8uRAT Originally from a user called "v" and edited by another unknown user.

$('.button_inner_group:nth(2)').append(
      '<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("invest", csrf, "all", $("#invest_code").val());\'>invest all<div class="key">J</div></button>').append(
      '<button onClick=\'javascript:socket.emit("invest_box", csrf); socket.emit("divest", csrf, "all", $("#divest_code").val());\'>divest all<div class="key">K</div></button>');

var usdCache = 0;
var usdCacheAge = 0;
function cacheUSD(){
	if(usdCacheAge < new Date().getTime() - 60000){
		$.ajax("https://api.bitcoinaverage.com/all", {success:function(data){
			usdCache = data;
		}});
		usdCacheAge = new Date().getTime();
	}
}
function updateUSD(){
		$(".investmentUSD").html((parseFloat($(".investment").html()) * usdCache[$("#currencySelector").val()]["averages"]["24h_avg"]).toFixed(2) + " " + $("#currencySelector").val());
		$(".invest_pftUSD").html((parseFloat($(".invest_pft").html()) * usdCache[$("#currencySelector").val()]["averages"]["24h_avg"]).toFixed(2) + " " + $("#currencySelector").val());
		$(".myprofitUSD").html((parseFloat($(".myprofit").html()) * usdCache[$("#currencySelector").val()]["averages"]["24h_avg"]).toFixed(2) + " " + $("#currencySelector").val());
		$(".wageredUSD").html((parseFloat($(".wagered").html()) * usdCache[$("#currencySelector").val()]["averages"]["24h_avg"]).toFixed(2) + " " + $("#currencySelector").val());
		$("#pct_balanceUSD").val(($("#pct_balance").val() * usdCache[$("#currencySelector").val()]["averages"]["24h_avg"]).toFixed(2) + " " + $("#currencySelector").val());
}

var losses = 0;
var lastWin = new Date().getTime();
var profitPerMS = 0;

function martingale() 
{
        setTimeout(updateUSD, 1);
        /* Stats */
        this.stats = {
                won: 0,
                lost: 0,
                maxStreak: 0,
                currentProfit: 0,
                wagered: 0
        }
                
  if (bal.data('oldVal') != bal.val() && running) {
    clearInterval(timer);

    var curr_bal = bal.val();

//Add a step into the martingale to see if we reach our desired loss length, If so reset
if (current_bet_num == $delay.val() && curr_bal < bal.data('oldVal'))
    {
        current_bet_num = 1;
        $("#pct_bet").val(start_bet);
        
            var new_val = ($('#pct_balance').val() / 100) * ($percentage).val();

            //get rid of scientific notation
            if (String(new_val).indexOf('e') !== -1) {
                var arr = new Array();
                arr = String(new_val).split('e');
                  new_val = new_val.toFixed(arr[1].substring(1));
                console.log('new_val='  +new_val);
            }

            
            $("#pct_bet").val(new_val);

            //Increase the steps
            current_steps = 1;
            current_steps++;
            //current_bet_num = 1;
            $("#a_hi").trigger('click');
        }    


   else if (curr_bal > bal.data('oldVal'))
    {
        current_steps = 1;
        current_bet_num = 0;
        $("#pct_bet").val(start_bet);
        var profit = curr_bal - bal.data('oldVal');
        var now = new Date().getTime();
        var diff = now - lastWin;
        if(lastWin == 0){
        	profitPerMS = profit / diff; 
        }else{
        	profitPerMS += profit / diff;
        	profitPerMS /= 2;
        }
        lastWin = now;
            //Increase our bet by the multiplier
            var new_val = $("#pct_bet").val(); // Why I had left a multiplyer here.. Madness Fixed now.

            //get rid of scientific notation
            if (String(new_val).indexOf('e') !== -1) {
                var arr = new Array();
                arr = String(new_val).split('e');
                  new_val = new_val.toFixed(arr[1].substring(1));
                console.log('new_val='  +new_val);
            }

            
            $("#pct_bet").val(new_val);

            //Increase the steps
            current_steps++;
            current_bet_num++;
            $("#a_hi").trigger('click');
        }
    
        
    else if ($.isNumeric($multiplier.val()) && 
             $.isNumeric($steps.val()) && 
            (current_steps < $steps.val())) {

            //Increase our bet by the multiplier
            var new_val = $("#pct_bet").val() * $multiplier.val();

            //get rid of scientific notation
            if (String(new_val).indexOf('e') !== -1) {
                var arr = new Array();
                arr = String(new_val).split('e');
                  new_val = new_val.toFixed(arr[1].substring(1));
                console.log('new_val='  +new_val);
            }

            
            $("#pct_bet").val(new_val);

            //Increase the steps
            current_steps++;
            current_bet_num++;
            $("#a_hi").trigger('click');
    }

    //otherwise we go back to the start
    else {
      current_steps = 1;
      current_bet_num = 0;
      $("#pct_bet").val(start_bet);
      running = false;
    }

    // Updated stored value
    bal.data('oldVal', bal.val());
    timer = setInterval(function() { martingale() },timer_num);

  }

  else bal.data('oldVal', bal.val());
  
}

// Added Extra tab from Grays Bot. This is currently just a placeholder.
function tabber() {
        var markup = '<div class="bot-stats"><div class="statspanel"><h2>Stats</h2><div class="clear"></div><div class="slabel">Bets placed:</div><span id="gbs_bet">0</span><div class="clear"><div class="clear"></div></div></div><div class="clear"></div><div class="bot-graph">Some more stuff incoming!!!</div><div class="bot-foot">';
                $panelWrapper = $('<div>').attr('id','Nixsy9').css({display: 'none'}).insertAfter('#faq'),
                $panel = $('<div>').addClass('panel').append(markup).appendTo($panelWrapper),
                                
                                $s_bet = $('#gbs_bet')
       

        $('<li>').append($('<a>').text('Nix-Tab').attr('href','#Nixsy9')).appendTo('.tabs');
};

function ping_user() {

  var log = $(".chatlog");
  log.data('oldVal',log.html());
  log.data('length',0);
  setInterval(function() { 
       
        var new_str = log.html();
        var arr = new Array();
        arr = new_str.split('<br>');
          if (log.data('length') != arr.length || log.data('length')===101) {

          var depth;
          if (log.data('length') === 101) {console.log('here'); depth = 0;}
          else depth = arr.length - 2;


          //if this is the first time we'll look at every line, 
          //otherwise we'll just do the last (which is arr.length - 2)
          for(var line_count=depth; line_count < arr.length - 1; line_count++)
          {

            var line = arr[line_count];
            if (typeof line !== 'undefined') {

                var line_items = line.split(' ');
                var username = $('#login span:first-child').text();
                var pos = line_items.indexOf(username,3);
                if (pos >=0) {
                    line_items[pos] = line_items[pos].replace(username,
                        '<span style="color:red;font-weight:bold;">' + username + '</span>');

                    var new_line = line_items.join(' ');
                    arr[line_count] = new_line;
                }

                //ignore
                var i;
                for(i=0;i<arr_ignore.length ;i++) {
                    var ignore_user = '&lt;' + arr_ignore[i] + '&gt;';
                    var ignore_pos = line_items.indexOf(ignore_user,2);
                    console.log('target:' +  line_items[2]);
                    if (ignore_pos > -1)  arr[line_count] = 'ignored';
                }
            } //if undefined
          }  //for

          var new_log = arr.join('<br>');
          log.html( new_log);
              log.data('length', arr.length);
          console.log('length: ' + arr.length);
          $.playSound('notify.wav');
        }
   },100);
}

function create_ui() {

  var $container = $('<div class="container"/>');
  var $container2 = $('<div class="container"/>');
  var $button_group = $('<div class="button_group"/>');
  $container.append($button_group); 
  
  var $martingale_button = $('<button class="button_label chance_toggle" style="margin-top:20px;">Nixsy5</button>');

  var $run_div = $('<div class="button_inner_group"/>');
  $run = $('<button id="c_run" style="margin-top:5px;">Start<div class="key">R</div></button>');

  $run.click(function() { 
        running = true; 
  start_bet =  $("#pct_bet").val();
  $("#a_hi").trigger('click');
  });
  $run_div.append($run);
    
  $Stop = $('<button id="c_stop" style="margin-top:5px;">Stop<div class="key">Q</div></button>');
  $Stop.click(function() {
  running = false;
  });
  $run_div.append($Stop);
  
  var $row1 = $('<div class="row"/>');
  var $label1 = $('<p class="llabel">Multiplier</p>');
  $multiplier = $('<input id="multiplier" value="2.1"/>');
  $multiplier.keyup(function() {set_run();});
  var $x = $('<p class="rlabel">x</p>');
  $row1.append($label1);
  $row1.append($multiplier);
  $row1.append($x);

  var $row2 = $('<div class="row"/>');
  var $label2 = $('<p class="llabel">Max losses</p>');
  $steps = $('<input id="steps" value="16"/>');
  $steps.keyup(function() {set_run();});
  var $numz = $('<p class="rlabel">#</p>');
  $row2.append($label2);
  $row2.append($steps);
  $row2.append($numz);
 
  var $row3 = $('<div class="row"/>'); 
  var $label3 = $('<p class="llabel">Reset loss</p>');
  $delay = $('<input id="updateInterval"/>');
  var $numz2 = $('<p class="rlabel">!</p>');
  $row1.append($label3);
  $row1.append($delay);
  $row1.append($numz2);
  
  
  var $label4 = $('<p class="llabel">Reset %</p>');
  $percentage = $('<input id="updateInterval"/>');
  var $numz3 = $('<p class="rlabel">%</p>');
  $row2.append($label4);
  $row2.append($percentage);
  $row2.append($numz3);

  var $fieldset = $('<fieldset/>');
  $fieldset.append($row1);
  $fieldset.append($row2);
  $fieldset.append($row3);

  //$button_group.append($martingale_button);
  $button_group.append($fieldset);
  $button_group.append($run_div);

  $(".container").eq('1').append($container);
  $(".container").eq('1').append('<div style="clear:left;"/>');

  $.ajax("https://api.bitcoinaverage.com/all", {success:function(data){
		//usdCache = parseFloat(data.USD.averages["24h_avg"]);
	currencyOptions = "";
	for(i in data){
		if(i=="USD"){
			currencyOptions += "<option value=\"" + i + "\" SELECTED>" + i + "</option>";
			
		}else if(i.length == 3){
			currencyOptions += "<option value=\"" + i + "\">" + i + "</option>";
		}
	}
	$(".chatstat table tbody").append(
			'<tr><th><select id="currencySelector">' + currencyOptions + '</select></th><td><span class="investmentUSD"></span></td><td><span class="invest_pftUSD"></span></td><td></td><td><span class="profitPerSUSD"></span></td><td><span class="wageredUSD"></span></td><td><span class="myprofitUSD"></span></td></tr>'		
	);
	setTimeout(updateUSD,5000);
  }});
  $(".balance").append('<br><input id="pct_balanceUSD" class="readonly" tabindex="-1">');
  
}

function set_run() {
  if ($multiplier !== undefined &&
      $steps !== undefined   )
      if ( $.isNumeric($multiplier.val()) && 
           $.isNumeric($steps.val()) &&
           $.isNumeric($('#pct_bet').val())) {

           var total = 0;
           var mult = 1;
           var i;
          console.log('steps: ' + $steps.val() +  
          '   multiplier:' + $multiplier.val() +
          '   bal: ' + $('#pct_balance').val() + 
          '   bet:' + $('#pct_bet').val());

           for(i=0;i<$steps.val();i++) {
             total+= $('#pct_bet').val() * mult;
             mult *= $multiplier.val(); 
           }
           console.log('total:' + total);

           if (total != 0 && total < $('#pct_balance').val()) {
             console.log("setting class VALID");
             $run.removeClass('invalid');
           }
           else {
             console.log("setting class invalid");
             $run.addClass('invalid');
           }
      }

      else {
        console.log("setting class invalid");
        $run.addClass('invalid');

      }  
}



//
//The main stuff
//
$(document).ready( function() {

  //tabber();

  console.log('starting');

  create_ui();

  ping_user();
  
  //drawchart();
  cacheUSD();
  setInterval(cacheUSD, 60000);
  setTimeout(updateUSD,5000);
  

  //set the balance
  //when the balance changes and we're martingaling 
  //we'll do our stuff
  bal = $("#pct_balance");
  bal.data('oldVal', bal.val());
  timer = setInterval(function() { martingale() },timer_num);

  //we also monitor the bet b/c it can also determine if 
  //we have enough btc to bet the martingale run
  bet = $("#pct_bet");
  bet.data('oldVal',bet.val());
  setInterval(function() { 
          if (bet.data('oldVal') != bet.val() && !running) {
              bet.data('oldVal', bet.val());
          set_run();
        }
   },100);

  //set our array list
  chrome.storage.sync.get('ignore',function(val) {
    arr_ignore = val["ignore"].split(',');
    console.log('local storage: ' + val["ignore"]);
  });

 $(document).keydown(function(e){
    var ctrlDown = false;
    var ctrlKey = 17, qKey = 81,rKey = 82;

    if (! $(document.activeElement).is('input') &&
      (e.keyCode == rKey)) {
        running = true;        
        start_bet =  $("#pct_bet").val();
        $("#a_hi").trigger('click');
    }

    $(document).keydown(function(e)
    {
        if (e.keyCode == ctrlKey) ctrlDown = true;
    }).keyup(function(e)
    {
        if (e.keyCode == ctrlKey) ctrlDown = false;
    });

    if (ctrlDown && (e.keyCode == qKey)) {
      clearInterval(timer);
      running = false;
      current_steps = 1;
    }
  });

});

(function($){

  $.extend({
    playSound: function(){
      return $("<embed src='"+arguments[0]+"' hidden='true' autostart='true' loop='false' class='playSound'>").appendTo('body');
    }
  });

})(jQuery);
