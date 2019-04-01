let Schematic = function(){
	
}

Schematic.prototype.toogleSwitch = function(name, state) {
	var onId = "#" + name + "_on";
	var offId = "#" + name + "_off";
	var switchId = "#" + name;
	var inheiritFrom = "";
	var inheiritTo = "";
	inheiritTo = name.replace("breaker", "switch");
	inheiritFrom = name.replace("switch", "breaker");
	inheiritClass = $("#"+inheiritFrom).prop("classList");
	if (toState) {
		$(switchId).addClass(inheiritClass[0]);
		if (panel_state[inheiritTo.replace("_svg","")]) {
			$("#" + inheiritTo).addClass(inheiritClass[0]);
		}
		$(onId).removeClass("hidden");
		$(offId).addClass("hidden");
	} else {
		$("#"+inheiritTo).removeClass("on");
		$(switchId).removeClass(inheiritClass[0]);
		$(offId).removeClass("hidden");
		$(onId).addClass("hidden");
	}
}


let schemToogleSwitch = function(name, state) {
	let idActive = "#" + name + "_on"
}
