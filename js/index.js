
//Ultimately this exists for debug purposes
//We could realistically use local state for closures
var panel_state = {};
var activeClass = "on"; 


// I want a function that takes advantage of my naming conventions to turn
// switches and breakers on and off
// (Could we format this better, its incredibly hard to unserstand this code)
var schematicFlipSwitch = function(name, toState){
	var onId = "#" + name + "_on";
	var offId = "#" + name + "_off";
	var switchId = "#" + name;
	var inheiritFrom = "";
	var inheiritTo = "";
	//if (name.split("_")[0] == "breaker") {
	inheiritTo = name.replace("breaker", "switch");
	//} else if (name.split("_")[0] == "switch") {
	inheiritFrom = name.replace("switch", "breaker");
	//}
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

            $(onId).removeClass("hidden");
            $(offId).addClass("hidden");
            
        } else {
            console.log($(switchId).prop("classList"));

            $("#"+inheiritTo).removeClass(activeClass);

            $(switchId).removeClass(inheiritClass[0]);
            $(offId).removeClass("hidden");
            $(onId).addClass("hidden");

        }
};
	
// Someday I hope to reduce these into one function, but three will do
var armStandbyBattery = function(){
	offStandbyBattery();
	$("#standby_battery_paths").addClass("on_standby_battery");
	$("#test_switch_arm").addClass("on_standby_battery");
	$("#test_switch_arm").removeClass("hidden");
	$("#test_switch_off").addClass("hidden");
	$("#on_off_control_on").removeClass("hidden");
	$("#on_off_control_on").addClass("on_standby_battery");
	$("#on_off_control_off").addClass("hidden");
};

var testStandbyBattery = function(){
	offStandbyBattery();
	$("#standby_battery_paths").addClass("on_standby_battery");
	//$("#standby_battery_test_paths").addClass("on_standby_battery");
	$("#test_voltage_sense").addClass("on_standby_battery");
	$("#test_switch_test").addClass("on_standby_battery");
	$("#test_switch_test").removeClass("hidden");
	$("#test_led").addClass("on_standby_battery");
	$("#on_off_control_on").removeClass("hidden");
	$("#on_off_control_on").addClass("on_standby_battery");
	$("#on_off_control_off").addClass("hidden");
	$("#test_switch_off").addClass("hidden");
};

var offStandbyBattery = function(){
	$("#test_switch_arm").removeClass("on_standby_battery");
	$("#test_switch_test").removeClass("on_standby_battery");
	$("#test_voltage_sense").removeClass("on_standby_battery");
	$("#test_switch_arm").addClass("hidden");
	$("#test_switch_test").addClass("hidden");
	
	$("#test_led").removeClass("on_standby_battery");
	$("#on_off_control_on").addClass("hidden");
	$("#on_off_control_on").removeClass("on_standby_battery");
	$("#on_off_control_off").removeClass("hidden");
	$("#test_switch_off").removeClass("hidden");
	
	$("#standby_battery_paths").removeClass("on_standby_battery");
};                  
                        
var classOnOff = function(id, classToAdd, classToRemove){
    $(id).removeClass(classToRemove);
    $(id).addClass(classToAdd);

};
    
var toogle = function(id, initial, rate) {
        if(panel_state[id] === undefined) {
                panel_state[id] = initial;
        }

        if(panel_state[id]) { 	//Active
                $(id).hide(rate);
        } else { 				//Inactive
                $(id).show(rate);
        }
        panel_state[id] = !panel_state[id];
        
};


//Function that generates a panel self close function
var close = function(id, rate) {
	$(id).hide(rate);
};

var remove = function(id, rate) {
	var ele = $(id);
	ele.hide(rate);
	setTimeout(() => { 
		ele.remove();
		panel_state[id] = undefined;
	}, rate);
};

//Function that plays audio {
var audio = function(id) {
	$(id).trigger("play");
};


    
var schematicFlipMaster = function(name, toState){
    var onId = "#" + name + "_on";
    var offId = "#" + name + "_off";
	 console.log(onId);
    if (toState) {
        // that means we want to turn the switch on
        $(onId).removeClass("hidden");
        $(offId).addClass("hidden");
        
    } else {
        $(offId).removeClass("hidden");
        $(onId).addClass("hidden");
    }
};

/* When the document is loaded, it will hide all elements in the pop_up_list
=======
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
/*
>>>>>>> 99ed5193c2d0e63cbec818db25bfcc2b4b28eaa5
$( document ).ready(function(){
    
    }); */

/*Function to display pop up box when clicking on the 'starter' svg element present in C172SSchematic.svg
  For some reason, I was able to make it work one time.  After I refreshed the page, it stopped working and I have no idea why.
var svg_starter = document.getElementById('starter');
$(svg_starter).click(function(){
   $("#alternator_main_container").show(500); 
});
*/

//Enable navigation button panel toogle functionality
$("#master_button").click(() => toogle("#master_main_container", false, 500)); //Master
$("#breakers_button").click(() => toogle("#breakers_main_container", false, 500)); //Breakers
$("#switches_button").click(() => toogle("#switches_main_container", false, 500)); //Switches


//Enable panel self close functionality
$("#master_close").click(() => close("#master_main_container", 500)); //Master
$("#breakers_close").click(() => close("#breakers_main_container", 500)); //Breakers
$("#switches_close").click(() => close("#switches_main_container", 500)); //Switches

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

$("#avn_bus1_switch").click(function(){
   if ($("#avn_bus1_switch").hasClass("avn_bus1_off"))
       {
           classOnOff("#avn_bus1_switch", "avn_bus1_on", "avn_bus1_off");
           schematicFlipMaster("switch_avn1_svg", true);
       }
    else
        {
           classOnOff("#avn_bus1_switch", "avn_bus1_off", "avn_bus1_on");
           schematicFlipMaster("switch_avn1_svg", false);
        }
});

$("#avn_bus2_switch").click(function(){
   if ($("#avn_bus2_switch").hasClass("avn_bus2_off"))
       {
           classOnOff("#avn_bus2_switch", "avn_bus2_on", "avn_bus2_off");
           schematicFlipMaster("switch_avn2_svg", true);
       }
    else
        {
           classOnOff("#avn_bus2_switch", "avn_bus2_off", "avn_bus2_on");
           schematicFlipMaster("switch_avn2_svg", false);
        }
});

/*
	Navigation Bar Engine/EPU button responsiveness.
*/
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


// if we name the div tags right, we can set this up in a loop to toggle
// the switches in the switches panel...
// also we can set it to the "active" class
// how it's gonna work is
// forall the switches in the panel
// we get the id, and concatenate it with svg to access the switchon the schematic
var switchPanel = $("#switches_switch_container").children();
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
});

/*

<<<<<<< HEAD
=======
var standbyBatterySwitch = $("#standby_battery_switch");
standbyBatterySwitch.click(function(e){
	if(e.target.id == "standby_battery_arm"){
		armStandbyBattery();
	} else if (e.target.id == "standby_battery_test") {
      testStandbyBattery();
   } else {
		offStandbyBattery();
	}
	
}
);
>>>>>>> 99ed5193c2d0e63cbec818db25bfcc2b4b28eaa5 

*/

var breakerPanel = $("#breaker_switch_container").children();
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
	});
});


/*Load the SVG file into the SVG_WRAPPER and handle errors if they occur.*/
/*We are using .get over .load because .load is destructive to other elements in the wrapper*/
$.get("images/C172SSchematic.svg", null, function(data, status, jqXHR) {
	if(status === "error") {
		//If an error occurs, display a message
		var wrapper = $("#svg_wrapper");
		$("<p>Error: Unable to load diagram file.</p>").appendTo(wrapper);
	} else {
		$("#diagram").replaceWith(data);
		//Load info panel data and generate info panels
		$.getJSON("itemInfo.json", function(json, err) {
			let info_panels = json.info_panels;
			var wrapper = $("#svg_wrapper");
			var targets = document.getElementById("targets");	

			targets.addEventListener("click", function (e){
				//generate a new panel for this info
				
				if(info_panels[e.target.id] === undefined){ //We didnt define anything for this target
					return;
				}
				
				if(panel_state[e.target.id] === undefined) {
					panel_state[e.target.id] = false;
				} 
				
				if(panel_state[e.target.id] === false) {
					var wrapper_pos = wrapper.position();
					var panel = $("<div class='info_panel' id='info_panel_" + e.target.id + "'></div>");
					panel.css('top', (e.pageY + 5 - wrapper_pos.top ) + 'px');
					panel.css('left', (e.pageX + 5 - wrapper_pos.left ) + 'px');
					var title = $("<div class='draggable_handle' id='info_panel_" + e.target.id + "_handle'></div>");
					title.text(info_panels[e.target.id].title);
					var closer = $("<span class='close' id='info_panel_close_'" + e.target.id + "'></span>");
					closer.text('×');
					closer.click(() => {
						remove("#info_panel_"+ e.target.id, 500);
						panel_state[e.target.id] = false;
					});
					var content = $("<p></p>");
					content.text(info_panels[e.target.id].text); 
					closer.appendTo(title);
					title.appendTo(panel);
					content.appendTo(panel);
					panel.appendTo(wrapper);	
					
					//Ensure that this is draggable by its handle
					panel.draggable({handle: "#info_panel_" + e.target.id + "_handle"});
					
					panel_state[e.target.id] = true;
				}
				/*
				//Ensure that the generated elements can be dragged
				// this will move the info panel to where the user clicked
				$("#info_panel").css("top", e.pageY+5 +"px");
				$("#info_panel").css("left", e.pageX+5 +"px");
				 
				 
				// show hide the info panel
				toogle("#info_panel", false, 500);
				 
				// fill the info panel with the text from the json file according to the target chosen.
				$("#info_panel_title").text(info_panels[e.target.id].title);
				var closer = $("<span class='close' id='info_panel_close'>×</span>");
				closer.click(toogle("#info_panel", false, 500));
				closer.appendTo($("#info_panel_title"));
				$("#info_panel_content").text(info_panels[e.target.id].text);
				*/
			}, false);
		});


	}
    
    /* Added by Matt to locate the legend relative to the SVG */
    var svg = document.getElementById('svg1225');
    var left = svg.getBoundingClientRect().right - 160;
    var top = svg.getBoundingClientRect().top;
    
    var legend = document.getElementById("legend");
    legend.style.left = left + "px";
    legend.style.top = top + "px";
    
    $(window).resize(function(){
        var left = svg.getBoundingClientRect().right - 160;
        var top = svg.getBoundingClientRect().top;
    
        
        var legend = document.getElementById("legend");
        legend.style.left = left + "px";
        legend.style.top = top + "px";
    });
    
    $("#standby_battery_arm").click(function(){
        if ($("#standby_battery_switch").hasClass("off"))
        {
            classOnOff("#standby_battery_switch", "arm", "off");
            $("#standby_battery_switch").css("top", "52px");
            armStandbyBattery();
        }
        
        if ($("#standby_battery_switch").hasClass("standby_battery_test"))
        {
            classOnOff("#standby_battery_switch", "standby_battery_off", "standby_battery_test");
            offStandbyBattery();
        }        
    });
    
    $("#standby_battery_test").click(function(){
        if ($("#standby_battery_switch").hasClass("standby_battery_off"))
        {
            classOnOff("#standby_battery_switch", "standby_battery_test", "standby_battery_off");
            testStandbyBattery();
        }
        
        if ($("#standby_battery_switch").hasClass("standby_battery_arm"))
        {
            classOnOff("#standby_battery_switch", "standby_battery_off", "standby_battery_arm");
            $("#standby_battery_switch").css("top", "60px");
            offStandbyBattery();
        }        
    });
                
    
});	 

//Enable draggable functionality for all draggable containers
$(".draggable").draggable({handle: ".draggable_handle"});

//Prevent annoying image drag 
$('img').on('dragstart', function(event) { event.preventDefault(); });

$('#nav_pull_anchor').click(function(){
	if(panel_state['#nav_pull_anchor'] === undefined) {
		panel_state['#nav_pull_anchor'] = true;
	}
	if(panel_state['#nav_pull_anchor']) {
		$("#nav_list").toggleClass("hidden");
		classOnOff('#nav_pull_anchor', 'nav_pull_anchor_invisible', 'nav_pull_anchor_visibile');
	} else {
		$("#nav_list").toggleClass("hidden");
		classOnOff('#nav_pull_anchor', 'nav_pull_anchor_visibile', 'nav_pull_anchor_invisible');
	}
	panel_state['#nav_pull_anchor'] = !panel_state['nav_pull_anchor'];
});

$('#left_pull_anchor').click(function(){
	if(panel_state['#left_pull_anchor'] === undefined) {
		panel_state['#left_pull_anchor'] = false;
	}
	if(panel_state['#left_pull_anchor']) {
		$("#left_panel_content").toggleClass("hidden");
		classOnOff('#left_pull_anchor', 'left_pull_anchor_invisible', 'left_pull_anchor_visibile');
	} else {

		$("#left_panel_content").toggleClass("hidden");
		classOnOff('#left_pull_anchor', 'left_pull_anchor_visibile', 'left_pull_anchor_invisible');
	}
	panel_state['#left_pull_anchor'] = !panel_state['#left_pull_anchor'];
});

$('#right_pull_anchor').click(function(){
	if(panel_state['#right_pull_anchor'] === undefined) {
		panel_state['#right_pull_anchor'] = false;
	}
	if(panel_state['#right_pull_anchor']) {
		$("#right_panel_content").toggleClass("hidden");
		classOnOff('#right_pull_anchor', 'right_pull_anchor_invisible', 'right_pull_anchor_visibile');
	} else {
		$("#right_panel_content").toggleClass("hidden");
		classOnOff('#right_pull_anchor', 'right_pull_anchor_visibile', 'right_pull_anchor_invisible');
	}
	panel_state['#right_pull_anchor'] = !panel_state['#right_pull_anchor'];
});

$('.hidden').hide();
$('.hidden').toogleClass('hidden');
