//Dreaded global, will refactor later.
//We could realistically use local state in a closure
//This is just here for debugging ezpz
var panel_state = {};

//Returns function that essentially concatenates other functions
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

$( function() {
	
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

