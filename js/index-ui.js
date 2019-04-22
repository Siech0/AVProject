let panelState = {};
let schem = new Schematic();

/* 
	SCHEMATIC EVENT SETUP
*/
schem.addEventListener("dataLoaded", function() {
	let mfd_powered = false;
	schem.addVertexEventListener("breaker_mfd_svg", "powerChanged", function(value) {
		mfd_powered = value;
	});
	
	let pfd_powered = false;
	let pfd_avn1_powered = false;
	schem.addVertexEventListener("breaker_ess_pfd_svg", "powerChanged", function(value) {
		pfd_powered = value;
	});
	schem.addVertexEventListener("breaker_avn1_pfd_svg", "powerChanged", function(value) {
		pfd_avn1_powered = value;
	});
	
	schem.addEventListener("draw", function() {		
		$("#mfd").toggleClass("hidden", !mfd_powered);
		$("#pfd").toggleClass("hidden", !(pfd_powered || pfd_avn1_powered));
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
$("#engine_button").mousedown(function(){
	var status = $("#engine_status"); 
	if(panelState["#engine_button"]){ //Active
		status.css("color", "red");
		status.text("OFFLINE");
		schem.setVertexState("low_volt_indicator", "active");
		schem.setVertexState("alternator", "inactive");
	} else {
		status.css("color", "cyan");
		status.text("ONLINE");
		schem.setVertexState("low_volt_indicator", "inactive");
		schem.setVertexState("alternator", "active");
		console.log("something");
		schem.setVertexState("starter_relay_svg", "active");
	}
	schem.update();
	schem.draw();
	panelState["#engine_button"] = !panelState["#engine_button"];
});

$("#engine_button").mouseup(function(){
	schem.setVertexState("starter_relay_svg", "inactive");
	schem.update();
	schem.draw();
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
stb_arm.click( () => {
	if(stb_switch.hasClass("off")){ //arming stb_switch
        $("#standby_battery_switch").removeClass("off").addClass("arm");
		schem.setVertexState("switch_stb", "arm");
		schem.setVertexState("switch_stb_active", "active");
	} else if (stb_switch.hasClass("test")) { //This should never happen, but for the sake of it we check.
		$("#standby_battery_switch").removeClass("test").addClass("off");
		schem.setVertexState("switch_stb", "inactive");
		schem.setVertexState("switch_stb_active", "inactive");
	} 
	schem.update();
	schem.draw();
});

stb_test.mousedown( () => {
	if(stb_switch.hasClass("off")){ //testing stb_switch
		$("#standby_battery_switch").removeClass("off").addClass("test");
        $("#standby_led").removeClass("off").addClass("test");
		schem.setVertexState("switch_stb", "test");
		schem.setVertexState("switch_stb_active", "active");
		schem.update();
		schem.draw();

		//The test switch should automatically switch itself back up
		stb_test.off("mouseup");
		stb_test.mouseup( () => {
			$("#standby_battery_switch").removeClass("test").addClass("off");
            $("#standby_led").removeClass("test").addClass("off");
			schem.setVertexState("switch_stb", "inactive");
			schem.setVertexState("switch_stb_active", "inactive");	
			schem.update();
			schem.draw();	
		});

	} else if (stb_switch.hasClass("arm")) { //de-arming stb_switch
		stb_test.off("mouseup");
		stb_test.mouseup( () => {
			$("#standby_battery_switch").removeClass("arm").addClass("off");
			schem.setVertexState("switch_stb", "inactive");
			schem.setVertexState("switch_stb_active", "inactive");	
			schem.update();
			schem.draw();	
		});
	} 

});


/* 
	BREAKER PANEL CONTAINER 
*/
var breakerPanel = $("#breaker_switch_container").children();
breakerPanel.each(function(){
	$(this).click(function(){
        
        if ($(this).hasClass("off"))
        {
            $(this).removeClass("off");
            $(this).addClass("on");
        }
        else
        {
            $(this).removeClass("on");
            $(this).addClass("off");                
        }
        
		var id = $(this).attr('id');
		let state = schem.getVertexState(id + "_svg");
		schem.setVertexState(id + "_svg", state == "active" ? "inactive" : "active");
		schem.update();
		schem.draw();
	});
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
	let _this = $(this);
	_this.click(function(){        
		var id = $(this).attr('id');
		_this.toggleClass("off");
		_this.toggleClass("on");
		
		let state = schem.getVertexState(id + "_svg");
		schem.setVertexState(id + "_svg", state == "active" ? "inactive" : "active");
		schem.update();
		schem.draw();
	});	
});

//We filter out this specific id from the above code because its a special case.
$("#switch_land_light").click( () => {
	let _this = $("#switch_land_light");
	if(_this.hasClass("off")) {
		console.log("test2");
		_this.removeClass("off").addClass("taxi");
		schem.setVertexState("switch_taxi_light_svg", "active");
		schem.update();
		schem.draw();
	} else if (_this.hasClass("taxi")) {
		_this.removeClass("taxi").addClass("land");
		schem.setVertexState("switch_land_light_svg", "active");
		schem.setVertexState("switch_taxi_light_svg", "inactive");
		schem.update();
		schem.draw();
	} else if (_this.hasClass("land")) {
		_this.removeClass("land").addClass("off");
		schem.setVertexState("switch_land_light_svg", "inactive");
		schem.update();
		schem.draw();
	}
});


//Enable navigation button panel toggle functionality
$("#master_button").click(() => toggle("#master_main_container", false, 500)); //Master
$("#breakers_button").click(() => toggle("#breakers_main_container", false, 500)); //Breakers
$("#switches_button").click(() => toggle("#switches_main_container", false, 500)); //Switches

//Enable bottom panel self close functionality
$("#master_close").click(() => {
	close("#master_main_container", 500);
	panelState["#master_main_container"] = false;
}); //Master
$("#breakers_close").click(() => {
	close("#breakers_main_container", 500);
	panelState["#breakers_main_container"] = false;
}); //Breakers
$("#switches_close").click(() => {
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
						closer.click(() => {
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
