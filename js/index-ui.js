let panelState = {};
let schem = new Schematic();

let toogle = function(id, initial, rate) {
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
		schem.setPassthrough("#external_power_relay", true);
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
		schem.setPassthrough("#external_power_relay", false);
	} else { //Switch inactive
		$("#master_switch_bat").toggleClass("active", true);
		
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

let stb_switch = $("#standby_battery_switch");
let stb_arm = $("#standby_battery_arm");
let stb_test = $("#standby_battery_test");
stb_arm.click( () => {
	if(stb_switch.hasClass("off")){ //arming stb_switch
        $("#standby_battery_switch").removeClass("off").addClass("arm");
		schem.setPassthrough("#switch_stb_test", false);
		schem.setPassthrough("#switch_stb_arm", true);
		schem.setPassthrough("#switch_stb_active", true);	
	} else if (stb_switch.hasClass("test")) { //This should never happen, but for the sake of it we check.
		$("#standby_battery_switch").removeClass("test").addClass("off");
        schem.setPassthrough("#switch_stb_arm", false);
		schem.setPassthrough("#switch_stb_test", false);
		schem.setPassthrough("#switch_stb_active", false);	
	} 
	schem.update();
	schem.draw();
});

stb_test.mousedown( () => {
	if(stb_switch.hasClass("off")){ //testing stb_switch
		$("#standby_battery_switch").removeClass("off").addClass("test");
		schem.setPassthrough("#switch_stb_arm", false);
		schem.setPassthrough("#switch_stb_test", true);
		schem.setPassthrough("#switch_stb_active", true);
		schem.update();
		schem.draw();

		//The test switch should automatically switch itself back up
		stb_test.off("mouseup");
		stb_test.mouseup( () => {
			$("#standby_battery_switch").removeClass("test").addClass("off");
			schem.setPassthrough("#switch_stb_arm", false);
			schem.setPassthrough("#switch_stb_test", false);
			schem.setPassthrough("#switch_stb_active", false);			
			schem.update();
			schem.draw();	
		});

	} else if (stb_switch.hasClass("arm")) { //de-arming stb_switch
		stb_test.off("mouseup");
		stb_test.mouseup( () => {
			$("#standby_battery_switch").removeClass("arm").addClass("off");
			schem.setPassthrough("#switch_stb_arm", false);
			schem.setPassthrough("#switch_stb_test", false);
			schem.setPassthrough("#switch_stb_active", false);	
			schem.update();
			schem.draw();	
		});
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
		$(this).toggleClass("off");
		$(this).toggleClass("on");
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
	if(panelState["#engine_button"]){ //Active
		status.css("color", "red");
		status.text("OFFLINE");
		schem.setPassthrough("#low_volt_indicator", true);
		schem.setPassthrough("#alt_input", false)
	} else {
		status.css("color", "cyan");
		status.text("ONLINE");
		schem.setPassthrough("#low_volt_indicator", false);
		schem.setPassthrough("#alt_input", true);
	}
	schem.update();
	schem.draw();
	panelState["#engine_button"] = !panelState["#engine_button"];
});

panelState["#epu_button"] = false;
$("#epu_button").click(function(){
	var status = $("#epu_status");
	if(panelState["#epu_button"]){ //Active
		status.css("color", "red");
		status.text("OFFLINE");
		schem.setPassthrough("#external_power", false);
		schem.setPassthrough("#external_power_relay", false);
	} else {
		status.css("color", "cyan");
		status.text("ONLINE");
		schem.setPassthrough("#external_power", true);
		schem.setPassthrough("#external_power_relay", true);
	}
	panelState["#epu_button"] = !panelState["#epu_button"];
	schem.update();
	schem.draw();
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
				let wrapper = $("#svg_wrapper");
				let infoPanels = json.info_panels;	
				//Generate information panels and target events
				let targets = document.getElementById("targets");	
				targets.addEventListener("click", function (e){
					//generate a new panel for this info
					if(infoPanels[e.target.id] === undefined){ //We didnt define anything for this target
						throw new Error("Attempt to open info panel from anchor with id: '" + e.target.id + "' failed because the information is not defined");
					}
					
					if(panelState[e.target.id] === undefined) {
						panelState[e.target.id] = false;
					} 
					
					if(panelState[e.target.id] === false) {
						var wrapper_pos = wrapper.position();
						var panel = $("<div class='info_panel' id='info_panel_" + e.target.id + "'></div>");
						panel.css('top', (e.pageY + 5 - wrapper_pos.top ) + 'px');
						panel.css('left', (e.pageX + 5 - wrapper_pos.left ) + 'px');
						var title = $("<div class='info_panel_header draggable_handle' id='info_panel_" + e.target.id + "_handle'></div>");
						title.text(infoPanels[e.target.id].title);
						var closer = $("<span class='close' id='info_panel_close_'" + e.target.id + "'></span>");
						closer.text('×');
						closer.click(() => {
							remove("#info_panel_"+ e.target.id, 500);
							panelState[e.target.id] = false;
						});
						var content = $("<div class='info_panel_content'></div>");
						var content_text = $("<p class='info_panels_textwrap'></p>");
						//content.text(infoPanels[e.target.id].text);
                        var text = infoPanels[e.target.id].text;
                        var changed = text.replace(/"\n"/g,"<br/>");
					    content_text.text(changed);					
				        closer.appendTo(title);
				        title.appendTo(panel);
                        content_text.appendTo(content);
				        content.appendTo(panel);
						panel.appendTo(wrapper);	
						
						//Ensure that this is draggable by its handle
						panel.draggable({handle: "#info_panel_" + e.target.id + "_handle", containment: "#svg_wrapper"});		
						panelState[e.target.id] = true;
					}
				});
				
				//Generate graph
				let graphData = json.graph_data;
				schem.generateFromData(graphData);
				schem.update();
				schem.draw();
			}
		}).fail(function(jqXHR, textSatus, error) {
			throw new Error("Error parsing schematic information file, schematic functionality will not be loaded: " + error);
		});
	}
}, "text");

schem.addEventListener("dataLoaded", function() {
	schem.addVertexEventListener("#alt_relay", "powerChanged", function(source, state) {
		console.log(this);
		console.log("Alt relay power status change. (Source: " + source + ", state: " + state + ')');
	});
});

