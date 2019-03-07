$( function() {
	//Ultimately this exists for debug purposes
	//We could realistically use local state closures
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
	};
	

	var classOnOff = function(id, classToAdd, classToRemove){
		if ($(id).find("*").length == 0) {
			$(id).removeClass(classToRemove);
			$(id).addClass(classToAdd);
		} else {
			$(id).find('*').removeClass(classToRemove);
			$(id).find('*').addClass(classToAdd);
		}
	};
    
		// Switch the class on an id from c1 to c2 and vice versa
	var cSwitch = function(id, initFirst, cls1, cls2) {
		return elementClassSwitch($(id), id, initFirst, cls1, cls2);
	};
	// Switch the class on an id and its children from c1 to c2 and vice versa
	var crSwitch = function(id, initFirst, cls1, cls2) {
		return elementClassSwitch($(id).find('*'), id, initFirst, cls1, cls2);
	};
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
		};
	};
	
	// Toogle a class on an id to be on/off.
	var cToogle = function(id, initActive, cls) {
		return elementClassToogle($(id), id, initActive, cls);
	};
	// Toogle a class on an id and its children to be on/off.
	var crToogle = function(id, initActive, cls) {
		return elementClassToogle($(id).find('*'), id, initActive, cls);
	};
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
		};
	};
    
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
		};
	};
    
	
	// I want a function that takes advantage of my naming conventions to turn
	// switches and breakers on and off
	var schematicFlipSwitch = function(name, toState){
		var onId = "#" + name + "_on";
		var offId = "#" + name + "_off";
		//console.log(onId);
		//console.log(offId);
		
		// so we want to flip it to state
		if (toState) {
            //that means we want to turn the switch to on
			$(onId).removeClass("hidden");
			//$(onId).find("*").removeClass("hidden");
			
			$(offId).addClass("hidden");
			//$(offId).find("*").addClass("hidden");
			
        } else {
			$(offId).removeClass("hidden");
			//$(offId).find("*").removeClass("hidden");
			
			$(onId).addClass("hidden");
			//$(onId).find("*").addClass("hidden");
		}
	}
	
	//Exists for code reuse, toogles class on supplied elements, not id!



	//Function that generates a panel self close function
	var close = function(id, rate) {
		return function() {
			$(id).hide(rate);
		};
	};
	
	//Function that plays audio {
	var audio = function(id) {
		return function () {
			$(id).trigger("play");
		};
	};
	
    /* When the document is loaded, it will hide all elements in the pop_up_list*/
    $( document ).ready(function(){
        $("#pop_up_list").children().hide();
    });

    /*Function to display pop up box when clicking on the 'starter' svg element present in C172SSchematic.svg
      For some reason, I was able to make it work one time.  After I refreshed the page, it stopped working and I have no idea why.*/
    var svg_starter = document.getElementById('starter');
    $(svg_starter).click(function(){
       $("#alternator_main_container").show(500); 
    });
    
    
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
				classOnOff("#master_switch_alt", "master_switch_on_alt", "master_switch_off_alt");
				classOnOff("#master_switch_bat", "master_switch_on_bat", "master_switch_off_bat");

               $("#audio_master").trigger("play");
			   
			   // makes the paths connected to the switch turn on
			   
			   classOnOff("#alt_master_switch", "on", "");
			   classOnOff("#alt_relay", "on", "");
			   classOnOff("#battery_relay", "on", "");
			   classOnOff("#battery_master_switch", "on", "");
			   
			   
			   schematicFlipSwitch("alt_relay", true);
			   schematicFlipSwitch("alt_master_switch", true);
			   schematicFlipSwitch("battery_master_switch", true);
			   schematicFlipSwitch("battery_relay", true);
			   
           }
        else
            {
				classOnOff("#master_switch_alt", "master_switch_off_alt", "master_switch_on_alt");
			
			   // makes the paths turn off
			   classOnOff("#alt_master_switch", "", "on");
			   classOnOff("#alt_relay", "", "on");
			   
			   schematicFlipSwitch("alt_relay", false);
			   schematicFlipSwitch("alt_master_switch", false);
			   
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
			   
			   classOnOff("#battery_master_switch", "on", "");
			   classOnOff("#battery_relay", "on", "");
			   
			   schematicFlipSwitch("battery_master_switch", true);
			   schematicFlipSwitch("battery_relay", true);
			   
           }
        else
            {
				classOnOff("#master_switch_bat", "master_switch_off_bat", "master_switch_on_bat");
				classOnOff("#master_switch_alt", "master_switch_off_alt", "master_switch_on_alt");
				
				classOnOff("#battery_master_switch", "", "on");
				schematicFlipSwitch("battery_master_switch", false);
				
				classOnOff("#battery_relay", "", "on");
				schematicFlipSwitch("battery_relay", false);
				
				classOnOff("#alt_master_switch", "", "on");
				schematicFlipSwitch("alt_master_switch", false);
				
                classOnOff("#alt_relay", "", "on");
				schematicFlipSwitch("alt_relay", false);
			   
            }
    });
    
	
} );

// Getter
var scope = $( ".selector" ).draggable( "option", "scope" );

// puts svg into wrapper.
$( "#svg_wrapper" ).load("images/C172SSchematic.svg");	
 
// Setter
$( ".selector" ).draggable( "option", "scope", "buttonBox" );
