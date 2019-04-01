let panelState = {};
let schem = new Schematic();

let toogle = function(id, initial, rate) {
	if(panelState[id] == null){
		panelState[id] = initial;
	}
	
	if(panelState[id]){
		$(id).hide(rate);
	} else {
		$(id).show(rate);
	}
	panelState[id] = !panelState[id];
}

let close = function(id, rate) {
	if(panelState[id] == undefined) {
		panelState[id] = false;
	}
	$(id).hide(rate);
}

let remove = function(id, rate) {
	$(id).hide(rate);
	setTimeout(() => {
		$(id).remove(); //remove element from dom
		panelState[id] = undefined;
	}, rate);
}

let flipMaster = function(name, toState){
    var onId = name + "_on";
    var offId = name + "_off";
    if (toState) {
        // that means we want to turn the switch on
        $(onId).removeClass("hidden");
        $(offId).addClass("hidden");
        
    } else {
        $(offId).removeClass("hidden");
        $(onId).addClass("hidden");
    }
};

// I want a function that takes advantage of my naming conventions to turn
// switches and breakers on and off
// (Could we format this better, its incredibly hard to unserstand this code)
let flipSwitch = function(name, toState){
	var onId = name + "_on";
	var offId = name + "_off";
	var switchId = name;
	var inheiritFrom = "";
	var inheiritTo = "";
	inheiritTo = name.replace("breaker", "switch");
	inheiritFrom = name.replace("switch", "breaker");
	inheiritClass = $(inheiritFrom).prop("classList");
	if (toState) {
		$(switchId).addClass(inheiritClass[0]);
		if (panelState[inheiritTo.replace("_svg","")]) {
			$(inheiritTo).addClass(inheiritClass[0]);
		}
		$(onId).removeClass("hidden");
		$(offId).addClass("hidden");
	} else {
		$("#"+inheiritTo).removeClass(activeClass);
		$(switchId).removeClass(inheiritClass[0]);
		$(offId).removeClass("hidden");
		$(onId).addClass("hidden");
	}
};

/*Implement all pull panel functionality*/
$('#nav_pull_anchor').click(function(){
	if(panelState['#nav_pull_anchor'] == null) {
		panelState['#nav_pull_anchor'] = true;
	}
	$("#nav_list").toggleClass("hidden");
	$("#nav_pull_anchor").toggleClass("content_hidden");
	panelState['#nav_pull_anchor'] = !panelState['nav_pull_anchor'];
});

$('#left_pull_anchor').click(function(){
	if(panelState['#left_pull_anchor'] == null) {
		panelState['#left_pull_anchor'] = false;
	}
	$("#left_panel_content").toggleClass("hidden");
	$("#left_pull_anchor").toggleClass("content_hidden");
	panelState['#left_pull_anchor'] = !panelState['#left_pull_anchor'];
});

$('#right_pull_anchor').click(function(){
	if(panelState['#right_pull_anchor'] == null) {
		panelState['#right_pull_anchor'] = false;
	}
	
	$("#right_panel_content").toggleClass("hidden");
	$("#right_pull_anchor").toggleClass("content_hidden");
	panelState['#right_pull_anchor'] = !panelState['#right_pull_anchor'];
});

$("#master_switch_alt").click( () => {
	if($("#master_switch_alt").hasClass("active")){ //Switch active
		$("#master_switch_alt").toggleClass("active", false);
		$("#alt_master_switch").toggleClass("active", false);
		$("#alt_relay").toggleClass("on", false);
		
		flipMaster("#alt_relay", false);
		flipMaster("#alt_master_switch", false);
		
	} else { //Switch inactive
		$("#master_switch_alt").toggleClass("active", true);
		$("#master_switch_bat").toggleClass("active", true);
		
		$("#audio_master").trigger("play");
		
		$("#alt_master_switch").toggleClass("on", true);
		$("#alt_relay").toggleClass( "on", true);
		$("#battery_relay").toggleClass( "on", true);
		$("#battery_master_switch").toggleClass("on", true);
		
		flipMaster("#alt_relay", true);
		flipMaster("#alt_master_switch", true);
		flipMaster("#battery_master_switch", true);
		flipMaster("#battery_relay");
	}
});

$("#master_switch_bat").click( () => {
	if($("#master_switch_bat").hasClass("active")){ //Switch active
		$("#master_switch_bat").toggleClass("active", false);
		$("#master_switch_alt").toggleClass("active", false);
		
		$("#battery_master_switch").toggleClass("on", false);
		$("#battery_relay").toggleClass("on", false);
		$("#alt_master_switch").toggleClass("on", false);
		$("#alt_relay").toggleClass("on", false);
		
		flipMaster("#battery_master_switch", false);
		flipMaster("#battery_relay", false);
		flipMaster("#alt_master_switch", false);
		flipMaster("#alt_relay", false);
	} else { //Switch inactive
		$("#master_switch_bat").toggleClass("active", true);
		$("#master_switch_alt").toggleClass("active", true);
		
		$("#battery_master_switch").toggleClass("on", true);
		$("#battery_relay").toggleClass("on", true);
		
		flipMaster("#battery_master_switch", true);
		flipMaster("#battery_relay", true);
	}
});

$("#avn_bus1_switch").click( () => {
	if($("#avn_bus1_switch").hasClass("active")){ //active
		$("#avn_bus1_switch").toggleClass("active", false);
		flipMaster("switch_avn1_svg", false);
	} else {
		$("#avn_bus1_switch").toggleClass("active", true);
		flipMaster("switch_avn1_svg", true);
	}
});

$("#avn_bus2_switch").click( () => {
	if($("#avn_bus2_switch").hasClass("active")){ //active
		$("#avn_bus2_switch").toggleClass("active", false);
		flipMaster("switch_avn2_svg", false);
	} else {
		$("#avn_bus2_switch").toggleClass("active", true);
		flipMaster("switch_avn2_svg", true);
	}
});


let stb_switch = $("#standby_battery_switch");
stb_switch.click( () => {
	if(stb_switch.hasClass("arm")){ //arm

	} else if (stb_switch.hasClass("test")) { //test

	} 
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
		if (panelState[id] == undefined) {
			panelState[id] = false;
		}
		flipSwitch("#"+id+"_svg", !panelState[id]);
		panelState[id] = !panelState[id];
		
		//cSwitch("#beacon_light_switch", true, "on");
		if (panelState[id]) {
			console.log("Turning on " + id);
			//classOnOff("#"+id+"_svg", "on", "");    
		} else {
			//classOnOff("#"+id+"_svg", "", "on");
			console.log("Turning off " + id);
		}
	});	
});

var breakerPanel = $("#breaker_switch_container").children();
breakerPanel.each(function(){
	$(this).click(function(){
		var id = $(this).attr('id');
		if (panelState[id] == undefined) {
			panelState[id] = true;
		}
		panelState[id] = !panelState[id];
		if (panelState[id]) {
			console.log("Turning on " + id);
			classOnOff("#"+id+"_svg", "on", "");    
		} else {
			classOnOff("#"+id+"_svg", "", "on");
			console.log("Turning off " + id);
		}
		flipSwitch("#"+id+"_svg", panelState[id]);
	});
});

/*
	Navigation Bar Engine/EPU button responsiveness.
*/
panelState["#engine_button"] = false;
$("#engine_button").click(function(){
	var status = $("#engine_status");
	if(panelState["#engine_button"]){
		status.css("color", "red");
		status.text("OFFLINE");
	} else {
		status.css("color", "cyan");
		status.text("ONLINE");
	}
	panelState["#engine_button"] = !panelState["#engine_button"];
});

panelState["#epu_button"] = false;
$("#epu_button").click(function(){
	var status = $("#epu_status");
	if(panelState["#epu_button"]){
		status.css("color", "red");
		status.text("OFFLINE");
	} else {
		status.css("color", "cyan");
		status.text("ONLINE");
	}
	panelState["#epu_button"] = !panelState["#epu_button"];
});


//Enable navigation button panel toogle functionality
$("#master_button").click(() => toogle("#master_main_container", false, 500)); //Master
$("#breakers_button").click(() => toogle("#breakers_main_container", false, 500)); //Breakers
$("#switches_button").click(() => toogle("#switches_main_container", false, 500)); //Switches

//Enable bottom panel self close functionality
$("#master_close").click(() => close("#master_main_container", 500)); //Master
$("#breakers_close").click(() => close("#breakers_main_container", 500)); //Breakers
$("#switches_close").click(() => close("#switches_main_container", 500)); //Switches


//Enable draggable elements
$(".draggable").draggable({handle: ".draggable_handle"});

//Prevent annoying image drag 
$('img').on('dragstart', function(event) { event.preventDefault(); });

//Ensure that hidden elements are hidden using the jquery api, not just the style
$('.start-hidden').hide();
$('.start-hidden').toggleClass('start-hidden');

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
				console.log("here");
				if(info_panels[e.target.id] === undefined){ //We didnt define anything for this target
					return;
				}
				
				if(panelState[e.target.id] === undefined) {
					panelState[e.target.id] = false;
				} 
				
				if(panelState[e.target.id] === false) {
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
						panelState[e.target.id] = false;
					});
					var content = $("<p></p>");
					content.text(info_panels[e.target.id].text); 
					closer.appendTo(title);
					title.appendTo(panel);
					content.appendTo(panel);
					panel.appendTo(wrapper);	
					
					//Ensure that this is draggable by its handle
					panel.draggable({handle: "#info_panel_" + e.target.id + "_handle"});
					
					panelState[e.target.id] = true;
				}
			}, false);
		});
	}
}, "text");
