$( function() {
	var panel_state = {};
	
	/* 	
		This function essentially concatenates functions
		provided in the funcs array and generates a new function,
		that can be used as an event handler. 
	*/
	var func_concat = function (funcs){
		var ret = funcs[ funcs.length - 1];
		funcs.pop();
		funcs = funcs.length > 1 ? func_concat(funcs) : funcs[0];
		
		return function() { ret.apply(new funcs); };
	}
	
	var classOnOff = function(id, classToAdd, classToRemove){
		if ($(id).find("*").length == 0) {
			$(id).removeClass(classToRemove);
			$(id).addClass(classToAdd);
		} else {
			$(id).find('*').removeClass(classToRemove);
			$(id).find('*').addClass(classToAdd);
		}
	};
    
    var classToogle = function(id, cInit, cSecond) {
		
		//console.log(id, cInit, cSecond);
			if(panel_state[id] === undefined) {
				panel_state[id] = true;
			}
        
            if(panel_state[id]) {
				if ($(id).find("*").length == 0) {
                    $(id).removeClass(cSecond);
					$(id).addClass(cInit);
                } else {
					$(id).find('*').removeClass(cSecond);
					$(id).find('*').addClass(cInit);
				}
            } else {
				if ($(id).find("*").length == 0) {
                    $(id).removeClass(cInit);
					$(id).addClass(cSecond);
                } else {
					$(id).find('*').removeClass(cInit);
					$(id).find('*').addClass(cSecond);	
				}
                
            }
			panel_state[id] = !panel_state[id];
    }
    
	//Function that generates toogle functionality for panel buttons.
	var toogle = function(id, initial, rate) {
		return function() {
			//undefined
			if(panel_state[id] === undefined) {
				panel_state[id] = initial;
			}

			if(panel_state[id]) { 	//Active
				$(id).hide(rate);
			} else { 				//Inactive
				$(id).show(rate);
			}
			panel_state[id] = !panel_state[id];
		}
	};
    
	//Function that generates a panel self close function
	var close = function(id, rate) {
		return function() {
			$(id).hide(rate);
		}
	};
	
	//Enable draggable functionality for all draggable containers
	$(".draggable").draggable({scope: "buttonBox"});
	
	//Enable navigation button panel toogle functionality
	//toogle switches_main_container
    $("#master_button").click( func_concat( [
        toogle("#master_main_container", true, 500),
        toogle("#breakers_main_container", true, 500)
        ])
    );
	//toogle switches_main_container
    $("#breakers_button").click(toogle("#breakers_main_container", true, 500));
	//toogle switches_main_container
	$("#switches_button").click(toogle("#switches_main_container", true, 500));
	
	
	//Enable panel self close functionality
	//Hide master_main_container
	$("#master_close").click(close("#master_main_container", 500));
	//hide breakers_main_container id
    $("#breakers_close").click(close("#breakers_main_container", 500));
	//hide switches_main_container
    $("#switches_close").click(close("#breakers_main_container", 500));
	
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
			//classToogle("#master_switch_bat", "master_switch_on_bat", "master_switch_off_bat");
			// because of how the two switches interact a simple toggle won't work
			// on all the other switches it should be fine though.
               classOnOff("#master_switch_bat", "master_switch_on_bat", "master_switch_off_bat");
			   $("#battery_master_switch").find("*").addClass("on");
			   $("#battery_relay").find("*").addClass("on");
			   
			   $("#battery_master_switch_on").removeClass("hidden");
			   $("#battery_master_switch_off").addClass("hidden");
			   $("#battery_relay_on").removeClass("hidden");
			   $("#battery_relay_off").find("*").addClass("hidden");
			   
           }
        else
            {
				classOnOff("#master_switch_bat", "master_switch_off_bat", "master_switch_on_bat");
				classOnOff("#master_switch_alt", "master_switch_off_alt", "master_switch_on_alt");
               
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