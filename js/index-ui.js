let panelState = {};
let schem = null;

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
		$("#switch_alt_master").toggleClass("active", false);
		
		schem.setPassthrough("#alt_relay", false);		
	} else { //Switch inactive
		$("#master_switch_alt").toggleClass("active", true);
		$("#master_switch_bat").toggleClass("active", true);
		
		$("#audio_master").trigger("play");
		
		schem.setPassthrough("#switch_alt_master", true);
		schem.setPassthrough("#alt_relay", true);
		schem.setPassthrough("#battery_relay", true);
		schem.setPassthrough("#switch_battery_master", true);
	}
	schem.update();
	schem.draw();
});

$("#master_switch_bat").click( () => {
	if($("#master_switch_bat").hasClass("active")){ //Switch active
		$("#master_switch_bat").toggleClass("active", false);
		$("#master_switch_alt").toggleClass("active", false);
		
		schem.setPassthrough("#switch_battery_master", false);
		schem.setPassthrough("#battery_relay", false);
		schem.setPassthrough("#switch_alt_master", false);
		schem.setPassthrough("#alt_relay", false);
	} else { //Switch inactive
		$("#master_switch_bat").toggleClass("active", true);
		$("#master_switch_alt").toggleClass("active", true);
		
		schem.setPassthrough("#switch_battery_master", true);
		schem.setPassthrough("#battery_relay", true);
	}
	schem.update();
	schem.draw();
});

$("#avn_bus1_switch").click( () => {
	if($("#avn_bus1_switch").hasClass("active")){ //active
		$("#avn_bus1_switch").toggleClass("active", false);
		schem.setPassthrough("#switch_avn1_svg", false);
	} else {
		schem.setPassthrough("#switch_avn1_svg", true);
		$("#avn_bus1_switch").toggleClass("active", true);
	}
	schem.update();
	schem.draw();
});

$("#avn_bus2_switch").click( () => {
	if($("#avn_bus2_switch").hasClass("active")){ //active
		$("#avn_bus2_switch").toggleClass("active", false);
		schem.setPassthrough("#switch_avn2_svg", false);
	} else {
		$("#avn_bus2_switch").toggleClass("active", true);
		schem.setPassthrough("#switch_avn2_svg", true);
	}
	schem.update();
	schem.draw();
});


let stbSwitch = $("#standby_battery_switch");
stbSwitch.click( () => {
	if(stbSwitch.hasClass("arm")){ //arm

	} else if (stbSwitch.hasClass("test")) { //test

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
		schem.setPassthrough("#" + id + "_svg");
		schem.update();
		schem.draw();
	});	
});

var breakerPanel = $("#breaker_switch_container").children();
breakerPanel.each(function(){
	$(this).click(function(){
		var id = $(this).attr('id');
		schem.setPassthrough("#" + id + "_svg");
		schem.update();
		schem.draw();
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
					if(infoPanels[e.target.id] === undefined){ //We didnt define anything for this target
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
						title.text(infoPanels[e.target.id].title);
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
				});
				
				//Generate graph
				let graphData = json.graph_data;
				schem = new Schematic(graphData);
			}
		}).fail(function(jqXHR, textSatus, error) {
			throw new Error("Error parsing schematic information file, schematic functionality will not be loaded: " + error);
		});
	}
}, "text");
