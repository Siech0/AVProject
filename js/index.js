
	//Ultimately this exists for debug purposes
	//We could realistically use local state closures
	var panel_state = {};
	var activeClass = "on";
	
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
			$(id).removeClass(classToRemove);
			$(id).addClass(classToAdd);
		}
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
    
	var schematicFlipMaster = function(name, toState){
		var onId = "#" + name + "_on";
		var offId = "#" + name + "_off";
		if (toState) {
            //that means we want to turn the switch to on
			
			//$(switchId).removeClass("off");
			$(onId).removeClass("hidden");
			//$(onId).find("*").removeClass("hidden");
			//$(offId).removeClass(inheiritClass);
			$(offId).addClass("hidden");
			//$(offId).find("*").addClass("hidden");
			
  } else {
			//$(switchId).addClass("off");
			//if (inheiritTo != "") {
			
			$(offId).removeClass("hidden");
			//$(offId).find("*").removeClass("hidden");
			//$(onId).removeClass("off");
			//$(onId).removeClass(inheiritClass[0]);
			$(onId).addClass("hidden");
			//$(onId).find("*").addClass("hidden");
		}
		
	};
	// I want a function that takes advantage of my naming conventions to turn
	// switches and breakers on and off
	var schematicFlipSwitch = function(name, toState){
		var onId = "#" + name + "_on";
		var offId = "#" + name + "_off";
		var switchId = "#" + name;
		//console.log(onId);
		//console.log(offId);
		var inheiritFrom = "";
		var inheiritTo = "";
		//if (name.split("_")[0] == "breaker") {
      inheiritTo = name.replace("breaker", "switch");
  //} else if (name.split("_")[0] == "switch") {
    inheiritFrom = name.replace("switch", "breaker");
  //}
		
		//console.log(inheiritFrom);
		//if (inheiritFrom != "") {
     inheiritClass = $("#"+inheiritFrom).prop("classList");
  //}
		
		//console.log(inheiritClass);
		// so we want to flip it to state
		if (toState) {
            //that means we want to turn the switch to on
			$(switchId).addClass(inheiritClass[0]);
			console.log(inheiritTo.replace("_svg",""));
			console.log(panel_state[inheiritTo.replace("_svg","")]);
			if (panel_state[inheiritTo.replace("_svg","")]) {
				console.log(inheiritTo);
        $("#" + inheiritTo).addClass(inheiritClass[0]);
    }
			
			//$(switchId).removeClass("off");
			$(onId).removeClass("hidden");
			//$(onId).find("*").removeClass("hidden");
			//$(offId).removeClass(inheiritClass);
			$(offId).addClass("hidden");
			//$(offId).find("*").addClass("hidden");
			
  } else {
			//$(switchId).addClass("off");
			//if (inheiritTo != "") {
			console.log($(switchId).prop("classList"));
			
   $("#"+inheiritTo).removeClass(activeClass);
   ////}
			
			$(switchId).removeClass(inheiritClass[0]);
			$(offId).removeClass("hidden");
			//$(offId).find("*").removeClass("hidden");
			//$(onId).removeClass("off");
			//$(onId).removeClass(inheiritClass[0]);
			$(onId).addClass("hidden");
			//$(onId).find("*").addClass("hidden");
		}
	};
	
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
	
    /* When the document is loaded, it will hide all elements in the pop_up_list
    $( document ).ready(function(){
        $("#pop_up_list").children().hide();
    });
	*/

    /*Function to display pop up box when clicking on the 'starter' svg element present in C172SSchematic.svg
      For some reason, I was able to make it work one time.  After I refreshed the page, it stopped working and I have no idea why.
    var svg_starter = document.getElementById('starter');
    $(svg_starter).click(function(){
       $("#alternator_main_container").show(500); 
    });
 */

	//Enable draggable functionality for all draggable containers
	$(".draggable").draggable({scope: "buttonBox"});
	
	//Enable navigation button panel toogle functionality
	
	panel_state["#engine_button"] = false;
	$("#engine_button").click(function(){
		var status = $("#engine_status");
		if(panel_state["#engine_button"]){
			status.css("color", "red");
			status.text("OFFLINE");
		} else {
			status.css("color", "cyan");
			status.text("ONLINE");
		}
		panel_state["#engine_button"] = !panel_state["#engine_button"];
	});
	
	panel_state["#epu_button"] = false;
	$("#epu_button").click(function(){
		var status = $("#epu_status");
		if(panel_state["#epu_button"]){
			status.css("color", "red");
			status.text("OFFLINE");
		} else {
			status.css("color", "cyan");
			status.text("ONLINE");
		}
		panel_state["#epu_button"] = !panel_state["#epu_button"];
	});
	
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
			   
			   
			   schematicFlipMaster("alt_relay", true);
			   schematicFlipMaster("alt_master_switch", true);
			   schematicFlipMaster("battery_master_switch", true);
			   schematicFlipMaster("battery_relay", true);
			   
           }
        else
            {
				classOnOff("#master_switch_alt", "master_switch_off_alt", "master_switch_on_alt");
			
			   // makes the paths turn off
			   classOnOff("#alt_master_switch", "", "on");
			   classOnOff("#alt_relay", "", "on");
			   
			   schematicFlipMaster("alt_relay", false);
			   schematicFlipMaster("alt_master_switch", false);
			   
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
			   
			   schematicFlipMaster("battery_master_switch", true);
			   schematicFlipMaster("battery_relay", true);
			   
           }
        else
            {
				classOnOff("#master_switch_bat", "master_switch_off_bat", "master_switch_on_bat");
				classOnOff("#master_switch_alt", "master_switch_off_alt", "master_switch_on_alt");
				
				classOnOff("#battery_master_switch", "", "on");
				schematicFlipMaster("battery_master_switch", false);
				
				classOnOff("#battery_relay", "", "on");
				schematicFlipMaster("battery_relay", false);
				
				classOnOff("#alt_master_switch", "", "on");
				schematicFlipMaster("alt_master_switch", false);
				
                classOnOff("#alt_relay", "", "on");
				schematicFlipMaster("alt_relay", false);
			   
            }
    });
    
	// if we name the div tags right, we can set this up in a loop to toggle
	// the switches in the switches panel...
	// also we can set it to the "active" class
	// how it's gonna work is
	// forall the switches in the panel
	// we get the id, and concatenate it with svg to access the switchon the schematic
	var switchPanel = $("#switches_switch_panel").children();
	console.log(switchPanel);
	switchPanel.each(function(){
		$(this).click(function(){
			var id = $(this).attr('id');
		if (panel_state[id] == undefined) {
			panel_state[id] = false;
		}
		schematicFlipSwitch(id+"_svg", !panel_state[id]);
		panel_state[id] = !panel_state[id];
		
		//cSwitch("#beacon_light_switch", true, "on");
		if (panel_state[id]) {
			console.log("Turning on " + id);
			//classOnOff("#"+id+"_svg", "on", "");    
		} else {
			//classOnOff("#"+id+"_svg", "", "on");
			console.log("Turning off " + id);
		}
		});
		
	}
			
	);
	
	var breakerPanel = $("#breaker_switch_panel").children();
	console.log(breakerPanel);
	breakerPanel.each(function(){
		$(this).click(function(){
			var id = $(this).attr('id');
		if (panel_state[id] == undefined) {
			panel_state[id] = true;
		}
		panel_state[id] = !panel_state[id];
		if (panel_state[id]) {
			console.log("Turning on " + id);
			classOnOff("#"+id+"_svg", "on", "");    
		} else {
			classOnOff("#"+id+"_svg", "", "on");
			console.log("Turning off " + id);
		}
		
		schematicFlipSwitch(id+"_svg", panel_state[id]);
		
		
		//cSwitch("#beacon_light_switch", true, "on");
		
		});
		
	}
			
	);
	
 ;

	
	


// Getter
var scope = $( ".selector" ).draggable( "option", "scope" );

$( "#svg_wrapper" ).load("images/C172SSchematic.svg", function(res, status, jqXHR) {
	if(status === "error") {
		var wrapper = $("#svg_wrapper");
		$("<p>Error: Unable to load diagram file.</p>").appendTo(wrapper);
	} else {
		//Load info panel data and generate anchors and panels
		$.getJSON("itemInfo.json", function(json) {
			info_panels = json.info_panels;
			var wrapper = $("#svg_wrapper");
			for (var i = 0; i < info_panels.length; ++i) {
				var anchor = $("<div class='info_panel_anchor' id='info_panel_anchor_" + i + "'></div>");
				anchor.css('top', info_panels[i].yPos + '%');
				anchor.css('left', info_panels[i].xPos + '%');
				anchor.css('width', info_panels[i].width + '%');
				anchor.css('height', info_panels[i].height + '%');
				anchor.click(toogle("#info_panel_"+i, false, 500));
				anchor.appendTo(wrapper);
				
				var panel = $("<div class='info_panel draggable' id='info_panel_" + i + "'></div>");
				panel.hide(0);
				panel.css('top', (info_panels[i].yPos + 5) + '%');
				panel.css('left', (info_panels[i].xPos + 5) + '%');
				var title = $("<div></div>");
				title.text(info_panels[i].title);
				var closer = $("<span class='close' id='info_panel_close_'" + i + "'></span>");
				closer.text('×');
				closer.click(close("#info_panel_"+i, 500));
				var content = $("<p></p>");
				content.text(info_panels[i].text); 
				
				closer.appendTo(title);
				title.appendTo(panel);
				content.appendTo(panel);
				panel.appendTo(wrapper);
			}
		});
	}
});
 


// Getter
var scope = $( ".selector" ).draggable( "option", "scope" );
// Setter
$( ".selector" ).draggable( "option", "scope", "buttonBox" );
