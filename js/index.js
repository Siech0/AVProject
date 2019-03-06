$( function() {
	var panel_state = {};
	
	/* 	
		This function essentially concatenates functions
		provided in the funcs array and generates a new function,
		that can be used as an event handler. 
		
		EXAMPLE:
		
		$("#master_button").click( func_concat( [
			toogle("#master_main_container", true, 500),
			toogle("#breakers_main_container", true, 500)
        ])
    );
	*/
	var func_concat = function (funcs){
		var ret = funcs[ funcs.length - 1];
		funcs.pop();
		funcs = funcs.length > 1 ? func_concat(funcs) : funcs[0];
		
		return function() { ret.apply(new funcs); };
	}
    
	//Function that generates toogle functionality for panel buttons.
	var toogle = function(id, initial, rate) {
		if(panel_state[id] === undefined) {
			panel_state[id] = initial;
		}
		return function() {
			if(panel_state[id]) { 	//Active
				$(id).hide(rate);
			} else { 				//Inactive
				$(id).show(rate);
			}
			panel_state[id] = !panel_state[id];
		}
	}
    
	//Function that generates a panel self close function
	var close = function(id, rate) {
		return function() {
			$(id).hide(rate);
		}
	}
	
	//Function that plays audio {
	var audio = function(id) {
		return function () {
			$(id).trigger("play");
		};
	}
	
	//Enable draggable functionality for all draggable containers
	$(".draggable").draggable({scope: "buttonBox"});
	
	//Enable navigation button panel toogle functionality
    $("#master_button").click(toogle("#master_main_container", true, 500)); //Master
    $("#breakers_button").click(toogle("#breakers_main_container", true, 500)); //Breakers
	$("#switches_button").click(toogle("#switches_main_container", true, 500)); //Switches
	
	
	//Enable panel self close functionality
	$("#master_close").click(close("#master_main_container", 500)); //Master
    $("#breakers_close").click(close("#breakers_main_container", 500)); //Breakers
    $("#switches_close").click(close("#switches_main_container", 500)); //Switches
	
	//Toogle master_alt on and off, plays music.
	$("#master_switch_alt").click(function(){
       if ($("#master_switch_alt").hasClass("master_switch_off_alt"))
           {
               $("#master_switch_alt").removeClass("master_switch_off_alt");
               $("#master_switch_alt").addClass("master_switch_on_alt");
               $("#master_switch_bat").removeClass("master_switch_off_bat");
               $("#master_switch_bat").addClass("master_switch_on_bat");
               $("#audio_master").trigger("play");
			   
			   // makes the paths connected to the switch turn on
			   $("#alt_master_switch").find("*").addClass("on");
			   $("#alt_relay").find("*").addClass("on");
			   $("#alt_relay_off").find("*").addClass("hidden");
			   $("#alt_relay_on").removeClass("hidden");
			   $("#battery_master_switch").find("*").addClass("on");
			   $("#battery_relay").find("*").addClass("on");
			   $("#battery_relay_on").removeClass("hidden");
			   $("#battery_relay_off").find("*").addClass("hidden");
			   
			   
			   // makes the switch toggle from off to on
			   $("#alt_master_switch_on").removeClass("hidden");
			   $("#alt_master_switch_off").addClass("hidden");
			   $("#battery_master_switch_on").removeClass("hidden");
			   $("#battery_master_switch_off").addClass("hidden");
			   
           }
        else
            {
               $("#master_switch_alt").removeClass("master_switch_on_alt");
               $("#master_switch_alt").addClass("master_switch_off_alt");
			   
			   // makes the paths turn off
			   $("#alt_master_switch").find("*").removeClass("on");
			   $("#alt_relay").find("*").removeClass("on");
			   $("#alt_master_switch_on").removeClass("on");
			   
			   // makes the switch toggle from on to off
			   $("#alt_master_switch_on").addClass("hidden");
			   $("#alt_master_switch_off").removeClass("hidden");
			   
			   $("#alt_relay_on").addClass("hidden");
			   $("#alt_relay_off").find("*").removeClass("hidden");
			   
            }
    });
	
	//Toogle master_bat on and off
	
    $("#master_switch_bat").click(function(){
       if ($("#master_switch_bat").hasClass("master_switch_off_bat"))
           {
               $("#master_switch_bat").removeClass("master_switch_off_bat");
               $("#master_switch_bat").addClass("master_switch_on_bat");
			   $("#battery_master_switch").find("*").addClass("on");
			   $("#battery_relay").find("*").addClass("on");
			   
			   $("#battery_master_switch_on").removeClass("hidden");
			   $("#battery_master_switch_off").addClass("hidden");
			   $("#battery_relay_on").removeClass("hidden");
			   $("#battery_relay_off").find("*").addClass("hidden");
			   
           }
        else
            {
               $("#master_switch_bat").removeClass("master_switch_on_bat");
               $("#master_switch_bat").addClass("master_switch_off_bat"); 
               $("#master_switch_alt").removeClass("master_switch_on_alt");
               $("#master_switch_alt").addClass("master_switch_off_alt");
			   
			   $("#battery_master_switch").find("*").removeClass("on");
			   $("#battery_relay").find("*").removeClass("on");
			   $("#alt_master_switch").find("*").removeClass("on");
			   $("#alt_relay").find("*").removeClass("on");
			   
			   $("#battery_master_switch_off").removeClass("hidden");
			   $("#battery_master_switch_on").addClass("hidden");
			   $("#battery_relay_on").addClass("hidden");
			   $("#battery_relay_off").find("*").removeClass("hidden");
			   
			   $("#alt_master_switch_on").addClass("hidden");
			   $("#alt_master_switch_off").removeClass("hidden");
			   
			   $("#alt_relay_on").addClass("hidden");
			   $("#alt_relay_off").find("*").removeClass("hidden");
			   
			   
            }
    });
	
} );

// Getter
var scope = $( ".selector" ).draggable( "option", "scope" );

// puts svg into wrapper.
$( "#svg_wrapper" ).load("images/C172SSchematic.svg");	
 
// Setter
$( ".selector" ).draggable( "option", "scope", "buttonBox" );