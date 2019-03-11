$( function() {
	//Ultimately this exists for debug purposes
	//We could realistically use local state closures
	var panel_state = {};
	
	var func_concat = function (funcs){
		var ret = funcs[ funcs.length - 1];
		funcs.pop();
		funcs = funcs.length > 1 ? func_concat(funcs) : funcs[0];
		
		return function() { ret.apply(new funcs); };
	}
	
		// Switch the class on an id from c1 to c2 and vice versa
	var cSwitch = function(id, initFirst, cls1, cls2) {
		return elementClassSwitch($(id), id, initFirst, cls1, cls2);
	}
	// Switch the class on an id and its children from c1 to c2 and vice versa
	var crSwitch = function(id, initFirst, cls1, cls2) {
		return elementClassSwitch($(id).find('*'), id, initFirst, cls1, cls2);
	}
	//Don't use directly, the interface is different from other similar functions.
	var elementClassSwitch = function(ele, id, initFirst, cls1, cls2) {
		if(panel_state[id] === undefined) {
			panel_state[id] = initFirst;
		}
		return function() {
			if(panel_state[id]) {
				ele.addClass(cls2);
				ele.removeClass(cls1);

			} else {
				ele.addClass(cls1);
				ele.removeClass(cls2);
			}
			panel_state[id] = !panel_state[id];
		}
	}
	
	// Toogle a class on an id to be on/off.
	var cToogle = function(id, initActive, cls) {
		return elementClassToogle($(id), id, initActive, cls);
	} 
	// Toogle a class on an id and its children to be on/off.
	var crToogle = function(id, initActive, cls) {
		return elementClassToogle($(id).find('*'), id, initActive, cls);
	}
	//Don't use directly, the interface is different from other similar functions.    
	var elementClassToogle = function(ele, id, initActive, cls) {
		if(panel_state[id] === undefined) {
			panel_state[id] = initActive;
		}

		return function() {
			if(panel_state[id]) {
				ele.removeClass(cls);
			} else {
				ele.addClass(cls);
			}
			panel_state[id] = !panel_state[id];
		}
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
	
	//Exists for code reuse, toogles class on supplied elements, not id!


	//Function that generates a panel self close function
	var close = function(id, rate) {
		return function() {
			$(id).hide(rate);
		}
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