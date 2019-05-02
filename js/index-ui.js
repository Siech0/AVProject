﻿let panelState = {};
let schem = new Schematic();

/* 
	SCHEMATIC EVENT SETUP
*/
schem.addEventListener("dataLoaded", function() {
	let mfd_powered = false;
	schem.addVertexEventListener("breaker_mfd_svg", "powerChanged", function(value) {
		mfd_powered = schem.isVertexPowered("breaker_mfd_svg");
	});
	
	let pfd_powered = false;
	let pfd_avn1_powered = false;
	schem.addVertexEventListener("breaker_ess_pfd_svg", "powerChanged", function(value, sourceName) {
		pfd_powered = schem.isVertexPowered("breaker_ess_pfd_svg");
	});
	
	schem.addVertexEventListener("breaker_avn1_pfd_svg", "powerChanged", function(value, sourceName) {
		pfd_avn1_powered = schem.isVertexPowered("breaker_avn1_pfd_svg");
	});
	
	let has_volts = false;
	schem.addVertexEventListener("low_volt_indicator", "powerChanged", function(value){
		has_volts = schem.isVertexPowered("low_volt_indicator");
	});
	
	let has_alt_input = true;
	schem.addVertexEventListener("battery_relay", "powerChanged", function(value){
		has_alt_input = schem.isVertexPowered("alternator_indicator");
	});
	schem.addVertexEventListener("alternator_indicator", "powerChanged", function(value){
		has_alt_input = schem.isVertexPowered("alternator_indicator");
	});
    
    let has_oil_pressure = true;
	schem.addVertexEventListener("battery_relay", "powerChanged", function(value){
		has_oil_pressure = schem.isVertexPowered("alternator_indicator");
	});
	schem.addVertexEventListener("alternator_indicator", "powerChanged", function(value){
		has_oil_pressure = schem.isVertexPowered("alternator_indicator");
	});
	
	schem.addEventListener("draw", function() {		
		$("#mfd").toggleClass("hidden", !mfd_powered);
		$("#pfd").toggleClass("hidden", !(pfd_powered || pfd_avn1_powered));
		$("#low_volts_warning").toggleClass("hidden", !(pfd_powered || pfd_avn1_powered) || !has_volts);
		$("#engine_off_warning").toggleClass("hidden", !(pfd_powered || pfd_avn1_powered) || has_alt_input);
        $("#low_oil_pressure_warning").toggleClass("hidden", !(pfd_powered || pfd_avn1_powered) || has_oil_pressure);
	});
});


/* 
	UTILITY FUNCTIONS
*/
let toggle = function(id, initial, rate) {
	if(panelState[id] == null){
		panelState[id] = initial;
	}
	
	if(panelState[id]){
		$(id).fadeOut(rate);
	} else {
		$(id).fadeIn(rate);
	}
	panelState[id] = !panelState[id];
}

let close = function(id, rate) {
	if(panelState[id] == undefined) {
		panelState[id] = false;
	}
	$(id).fadeOut(rate);
}

let remove = function(id, rate) {
	$(id).hide(rate);
	setTimeout(() => {
		$(id).remove(); //remove element from dom
		panelState[id] = undefined;
	}, rate);
}

/*
	PULL ANCHORS
*/
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

/*
	Navigation Bar Engine/EPU button responsiveness.
*/
panelState["#engine_button"] = false;
$("#engine_button").bind("mousedown touchstart", function(){
	var status = $("#engine_status"); 
	if(panelState["#engine_button"]){ //Active
		status.css("color", "red");
		status.text("OFFLINE");
		
		schem.setVertexState("low_volt_indicator", "active");
		schem.setVertexState("alternator", "inactive");
		$("#main_volts").text("24.0");
		$("#stdby_volts").text("24.0");
		$("#main_amps").text("110");
		if (schem.isVertexPowered("breaker_ess_stdby_battery_svg", "standby_battery")) {
			$("#stdby_amps").text("110");    
        } else {
			$("#stdby_amps").text("0");    
		}
			
		panelState["#engine_button"] = false;
	} else if(schem.isVertexPowered("battery_relay", "battery")) { //Engine can only activate if battery is on
		status.css("color", "cyan");
		status.text("ONLINE");
		if (schem.isVertexPowered("alt_relay", "battery")) {
            schem.setVertexState("low_volt_indicator", "inactive");
			$("#main_volts").text("32.0");
			$("#stdby_volts").text("32.0");
			$("#main_amps").text("110");
			if (schem.isVertexPowered("breaker_ess_stdby_battery_svg", "standby_battery")) {
				$("#stdby_amps").text("110");    
			} else {
				$("#stdby_amps").text("0");    
			}
			let func = function() {
				schem.setVertexState("starter_relay_svg", "inactive");
				schem.update();
				schem.draw();
				document.removeEventListener("mouseup", func);
			}
			
			document.addEventListener("mouseup", func);
        }
		
		schem.setVertexState("alternator", "active");
		schem.setVertexState("starter_relay_svg", "active");
		panelState["#engine_button"] = true;
	}
	schem.update();
	schem.draw();

});

$("#engine_button").bind("mouseup touchend", function(){
	schem.setVertexState("starter_relay_svg", "inactive");
	schem.update();
	schem.draw();
});

// disabled context menu on engine button (so that long click on mobile won't show context menu)
$("#engine_button").contextmenu(function(){
	return false;
});
panelState["#epu_button"] = false;

$("#epu_button").click(function(){
	var status = $("#epu_status");
	if(panelState["#epu_button"]){ //Active
		status.css("color", "red");
		status.text("OFFLINE");
		schem.setVertexState("external_power", "inactive");
		schem.setVertexState("external_power_relay", "inactive");
	} else {
		status.css("color", "cyan");
		status.text("ONLINE");
		schem.setVertexState("external_power", "active");
		schem.setVertexState("external_power_relay", "active");
	}
	panelState["#epu_button"] = !panelState["#epu_button"];
	schem.update();
	schem.draw();
});

/* 
	MASTER SWITCH CONTAINER
*/
$("#master_switch_alt").click( () => {
	if($("#master_switch_alt").hasClass("active")){ //Switch active
		$("#master_switch_alt").toggleClass("active", false);
		$("#switch_alt_master").toggleClass("active", false);
		
		schem.setVertexState("alt_relay", "inactive");
		schem.setVertexState("low_volt_indicator", "active");
		$("#main_volts").text("24.0");
		$("#stdby_volts").text("24.0");
		$("#main_amps").text("110");
		if (schem.isVertexPowered("breaker_ess_stdby_battery_svg", "standby_battery")) {
			$("#stdby_amps").text("110");    
        } else {
			$("#stdby_amps").text("0");    
		}
		let state = schem.getVertexState("switch_alt_master");
        schem.setVertexState("switch_alt_master", state == "active" ? "inactive" : "active");
	} else { //Switch inactive
		$("#master_switch_alt").toggleClass("active", true);
		$("#master_switch_bat").toggleClass("active", true);
		
		$("#audio_master").trigger("play");
		
		
		schem.setVertexState("switch_alt_master", "active");
		schem.setVertexState("alt_relay", "active");
		schem.setVertexState("battery_relay", "active");
		schem.setVertexState("switch_battery_master", "active");
		schem.update();
		if (schem.isVertexPowered("alt_relay", "alternator")) {
            schem.setVertexState("low_volt_indicator", "inactive");
			$("#main_volts").text("32.0");
			$("#stdby_volts").text("32.0");
			$("#main_amps").text("110");
			if (schem.isVertexPowered("breaker_ess_stdby_battery_svg", "standby_battery")) {
			$("#stdby_amps").text("110");    
			} else {
				$("#stdby_amps").text("0");    
			}
        }
	}
	schem.update();
	schem.draw();
});

$("#master_switch_bat").click( () => {
	if($("#master_switch_bat").hasClass("active")){ //Switch active
		$("#master_switch_bat").toggleClass("active", false);
		$("#master_switch_alt").toggleClass("active", false);
		
		schem.setVertexState("switch_battery_master", "inactive");
		schem.setVertexState("battery_relay", "inactive");
		schem.setVertexState("switch_alt_master", "inactive");
		schem.setVertexState("alt_relay", "inactive");
	} else { //Switch inactive
		$("#master_switch_bat").toggleClass("active", true);
		$("#main_volts").text("24.0");
		$("#stdby_volts").text("24.0");
		$("#main_amps").text("110");
		if (schem.isVertexPowered("breaker_ess_stdby_battery_svg", "standby_battery")) {
			$("#stdby_amps").text("110");    
        } else {
			$("#stdby_amps").text("0");    
		}
		schem.setVertexState("switch_battery_master", "active");
		schem.setVertexState("battery_relay", "active");
	}
	schem.update();
	schem.draw();
});

$("#avn_bus1_switch").click( () => {
	if($("#avn_bus1_switch").hasClass("active")){ //active
		$("#avn_bus1_switch").toggleClass("active", false);
		schem.setVertexState("switch_avn1_svg", "inactive");
	} else {
		schem.setVertexState("switch_avn1_svg", "active");
		$("#avn_bus1_switch").toggleClass("active", true);
	}
	schem.update();
	schem.draw();
});

$("#avn_bus2_switch").click( () => {
	if($("#avn_bus2_switch").hasClass("active")){ //active
		$("#avn_bus2_switch").toggleClass("active", false);
		schem.setVertexState("switch_avn2_svg", "inactive");
	} else {
		$("#avn_bus2_switch").toggleClass("active", true);
		schem.setVertexState("switch_avn2_svg", "active");
	}
	schem.update();
	schem.draw();
});

let stb_switch = $("#standby_battery_switch");
let stb_arm = $("#standby_battery_arm");
let stb_test = $("#standby_battery_test");
stb_arm.bind("click touchstart", () => {
	if(stb_switch.hasClass("off")){ //arming stb_switch
        $("#standby_battery_switch").removeClass("off").addClass("arm");
		schem.setVertexState("switch_stb", "arm");
		schem.setVertexState("switch_stb_dummy", "active");
		schem.setVertexState("switch_stb_active", "active");
		
		if (schem.isVertexPowered("breaker_ess_stdby_battery_svg", "battery") ||
			schem.isVertexPowered("breaker_ess_stdby_battery_svg", "external_power") ||
			schem.isVertexPowered("breaker_ess_stdby_battery_svg", "alternator")) {
			$("#stdby_amps").text("110");        
        } else {
			$("#stdby_amps").text("110");    
		}
		
	} else if (stb_switch.hasClass("test")) { //This should never happen, but for the sake of it we check.
		$("#standby_battery_switch").removeClass("test").addClass("off");
		schem.setVertexState("switch_stb", "inactive");
		schem.setVertexState("switch_stb_dummy", "inactive");
		schem.setVertexState("switch_stb_active", "inactive");
		$("#stdby_amps").text("0");    
		
	} 
	schem.update();
	schem.draw();
});

stb_test.contextmenu(function() {
	return false;
});

stb_test.bind("mousedown touchstart", () => {
	if(stb_switch.hasClass("off")){ //testing stb_switch
		$("#standby_battery_switch").removeClass("off").addClass("test");
        $("#standby_led").removeClass("off").addClass("test");
		schem.setVertexState("switch_stb", "test");
		schem.setVertexState("switch_stb_dummy", "inactive");
		schem.setVertexState("switch_stb_active", "active");
		$("#stdby_amps").text("-110"); 
		schem.update();
		schem.draw();

		//The test switch should automatically switch itself back up
		stb_test.off("mouseup touchend");
		let func = function() {
			$("#standby_battery_switch").removeClass("test").addClass("off");
            $("#standby_led").removeClass("test").addClass("off");
			schem.setVertexState("switch_stb", "inactive");
			schem.setVertexState("switch_stb_dummy", "inactive");
			schem.setVertexState("switch_stb_active", "inactive");
			$("#stdby_amps").text("0"); 
			schem.update();
			schem.draw();	
			document.removeEventListener("mouseup", func);
			document.removeEventListener("touchend", func);
		}
		document.addEventListener("mouseup", func);
		document.addEventListener("touchend", func);

	} else if (stb_switch.hasClass("arm")) { //de-arming stb_switch
		stb_test.off("mouseup touchend");
		let func  = function() {
			$("#standby_battery_switch").removeClass("arm").addClass("off");
			schem.setVertexState("switch_stb", "inactive");
			schem.setVertexState("switch_stb_dummy", "inactive");
			schem.setVertexState("switch_stb_active", "active");
			$("#stdby_amps").text("0"); 
			schem.update();
			schem.draw();
			console.log("here");
			document.removeEventListener("mouseup", func);
			document.removeEventListener("touchend", func);
		}
		document.addEventListener("mouseup", func);
		document.addEventListener("touchend", func);
	} 

});


/* 
	BREAKER PANEL CONTAINER 
*/
var breakerPanel = $("#breaker_switch_container").children();
breakerPanel.each(function(){
	$(this).click(function(){
		$(this).toggleClass("off");
		var id = $(this).attr('id');
		let state = schem.getVertexState(id + "_svg");
		schem.setVertexState(id + "_svg", state == "active" ? "inactive" : "active");
		schem.update();
		schem.draw();
	});
});

// The alt breaker should also disengage the alt relay
$("#breaker_alt_field").click(function(){
	if (schem.getVertexState("breaker_alt_field_svg") == "inactive") {
        schem.setVertexState("alt_relay", "inactive");
    } else {
		schem.setVertexState("alt_relay", "active");
	}
	schem.update();
	schem.draw();
});

/* 
	SWITCH PANEL CONTAINER
*/
// if we name the div tags right, we can set this up in a loop to toggle
// the switches in the switches panel...
// also we can set it to the "active" class
// how it's gonna work is
// forall the switches in the panel
// we get the id, and concatenate it with svg to access the switchon the schematic
var switchPanel = $("#switches_switch_container > *:not('#switch_land_light')");
switchPanel.each(function(){
	$(this).click(function(){        
		$(this).toggleClass("on");
		var id = $(this).attr('id');		
		let state = schem.getVertexState(id + "_svg");
		schem.setVertexState(id + "_svg", state == "active" ? "inactive" : "active");
		schem.update();
		schem.draw();
	});	
});

//We filter out this specific id from the above code because its a special case.
$("#switch_land_light").click( () => {
	let _this = $("#switch_land_light");
	if (_this.hasClass("taxi")) {	//Taxi
		_this.removeClass("taxi").addClass("land");
		schem.setVertexState("switch_land_light_svg", "active");
		schem.setVertexState("switch_taxi_light_svg", "inactive");
		schem.update();
		schem.draw();
	} else if (_this.hasClass("land")) { //Land
		_this.removeClass("land")
		schem.setVertexState("switch_land_light_svg", "inactive");
		schem.update();
		schem.draw();
	} else { //off
		_this.addClass("taxi");
		schem.setVertexState("switch_taxi_light_svg", "active");
		schem.update();
		schem.draw();
	}
});

$("#help_menu").hide();
$("#logo_button").click(function(){
   if (!$("#help_menu").hasClass("on"))
    {
       $("#help_menu").addClass("on");
       $("#help_menu").slideDown(500);
    }
    else
    {
       $("#help_menu").removeClass("on");
       $("#help_menu").slideUp(500);        
    }
});

//Enable navigation button panel toggle functionality
$("#master_button").click(() => toggle("#master_main_container", false, 500)); //Master
$("#breakers_button").click(() => toggle("#breakers_main_container", false, 500)); //Breakers
$("#switches_button").click(() => toggle("#switches_main_container", false, 500)); //Switches

//Enable bottom panel self close functionality
$("#master_close").bind("click touchstart", () => {
	close("#master_main_container", 500);
	panelState["#master_main_container"] = false;
}); //Master
$("#breakers_close").bind("click touchstart",() => {
	close("#breakers_main_container", 500);
	panelState["#breakers_main_container"] = false;
}); //Breakers
$("#switches_close").bind("click touchstart",() => {
	close("#switches_main_container", 500);
	panelState["#switches_main_container"] = false;
}); //Switches


//Enable draggable elements
$(".draggable").draggable({handle: ".draggable_handle", containment: "window"});


//Prevent annoying image drag 
$('img').on('dragstart', function(event) { event.preventDefault(); });

//Ensure that hidden elements are hidden using the jquery api, not just the style
$('.start-hidden').hide();
$('.start-hidden').toggleClass('start-hidden');

$("#help_menu").css("width", $("#logo_button").width());
let logo_coord = $("#logo_button").position();
$("#help_menu").css("left", logo_coord.left);
$("#help_menu").css("left", logo_coord.left);
$("#help_menu").css("max-width", $("#logo_button").width());
$(window).resize(function(){
    let logo_coord = $("#logo_button").position();
    $("#help_menu").css("max-width", $("#logo_button").width());
    $("#help_menu").css("width", $("#logo_button").width());
    $("#help_menu").css("left", logo_coord.left);
});
  

/*Load the SVG file into the SVG_WRAPPER and handle errors if they occur.*/
/*We are using .get over .load because .load is destructive to other elements in the wrapper*/
$.get("images/C172SSchematic.svg", null, function(data, status, jqXHR) {
	if(status === "error") {
		//If an error occurs, display a message
		let wrapper = $("#svg_wrapper");
		$("<p>Error: Unable to load diagram file.</p>").appendTo(wrapper);
	} else {
		$("#diagram").replaceWith(data);

		$.ajax({
			type: "GET",
			dataType: "json",
			url: "itemInfo.json",
			mimeType: "application/json",
			success: function(json){

				let infoPanels = json.info_panels;	
				//Generate information panels and target events
				let targets = document.getElementById("targets");
                
                                targets.addEventListener("click", function(e){ 
                    if(e.target.id == "info_breaker_feeder_a")
                    {
                        
                        let state = schem.getVertexState("breaker_feeder_a_svg")
                        schem.setVertexState("breaker_feeder_a_svg", state == "active" ? "inactive" : "active");
                        schem.update();
                        schem.draw();
                    }
                    else if (e.target.id == "info_breaker_feeder_b")
                    {
                         
                        let state = schem.getVertexState("breaker_feeder_b_svg")
                        schem.setVertexState("breaker_feeder_b_svg", state == "active" ? "inactive" : "active");
                        schem.update();
                        schem.draw();                            
                    }
                }); 
                
				targets.addEventListener("click", function (e){
					//generate a new panel for this info
					let wrapper = $("#svg_wrapper");
					if(infoPanels[e.target.id] === undefined){ //We didnt define anything for this target
						throw new Error("Attempt to open info panel from anchor with id: '" + e.target.id + "' failed because the information is not defined");
					}
					
					if(panelState[e.target.id] === undefined) {
						panelState[e.target.id] = false;
					} 
					
					let positionPanel = function(e, panel) {
						let wrapperPos = wrapper.position();
						let wrapperX = e.pageX - wrapperPos.left;
						let wrapperY = e.pageY - wrapperPos.top;
						console.log(`page: (${e.pageX}, ${e.pageY}), wrapper; (${wrapperX}, ${wrapperY}), dimensions: ${wrapper.width()}*${wrapper.height()}`);
						if(wrapperX + panel.innerWidth() < wrapper.innerWidth() - 40) {
							panel.css('left', wrapperX + 'px');
						} else {
							panel.css('right', wrapper.outerWidth() - wrapperX + 40 + 'px');							
						}
						
						if(wrapperY + panel.innerHeight() < wrapper.innerHeight() - 40) {
							panel.css('top', (wrapperY + 5) + 'px');
						} else {
							panel.css('bottom', wrapper.outerHeight() - wrapperY + 40 + 'px');
						}	
					}
					
					if(panelState[e.target.id] === false) {
						let panel = $("<div class='info_panel' id='info_panel_" + e.target.id + "'></div>")
						let title = $("<div class='info_panel_header draggable_handle' id='info_panel_" + e.target.id + "_handle'></div>");
						title.text(infoPanels[e.target.id].title);
						let closer = $("<span class='close' id='info_panel_close_'" + e.target.id + "'></span>");
						closer.text('×');
						closer.bind("click touchstart", () => {
							remove("#info_panel_"+ e.target.id, 500);
							panelState[e.target.id] = false;
						});
						let content = $("<div class='info_panel_content'></div>");
						let content_text = $("<p class='info_panels_textwrap'></p>");
						//content.text(infoPanels[e.target.id].text);
                        let text = infoPanels[e.target.id].text;
                        let changed = text.replace(/"\n"/g,"<br/>");
					    content_text.text(changed);					
				        closer.appendTo(title);
				        title.appendTo(panel);
                        content_text.appendTo(content);
				        content.appendTo(panel);
						panel.appendTo(wrapper);
						positionPanel(e, panel);
						
						//Ensure that the infobox is draggable by its handle						
						panel.draggable({handle: "#info_panel_" + e.target.id + "_handle", containment: "#svg_wrapper"});	
						
						panelState[e.target.id] = true;
					} else {
						positionPanel(e, $("#info_panel_" + e.target.id));
					}
				});
				
				//Generate graph
				let graphData = json.graph_data;
				schem.loadData(graphData);
				schem.update();
				schem.draw();
			}
		}).fail(function(jqXHR, textSatus, error) {
			throw new Error("Error parsing schematic information file, schematic functionality will not be loaded: " + error);
		});
	}
}, "text");
