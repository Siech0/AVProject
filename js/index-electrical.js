let Schematic = function(graphData){
	this.vertices = [];
	this.aliasTable = { count: 0 };
	this.sources = [];	
	this.evt = {};
	
	if(graphData) {
		this.generateFromData(graphData);
	}
}

Schematic.prototype.generateFromData = function(graphData) {
	if(graphData == null) {
		throw new Error("Attempt to generate graph from invalid data source");
	}
	for(let i = 0; i < graphData.length; ++i) {
		let vtx = graphData[i];
		let node = null;
		if(!vtx.is_source){ // is vertex
			node = this.addVertex(vtx.id, vtx.passthrough, vtx.requires, vtx.shared);
		} else { // is source
			node = this.addSourceVertex(vtx.id, vtx.passthrough, vtx.class_name, vtx.requires, vtx.shared);
		}
		node.hasOnOff = (vtx.has_on_off == null || vtx.has_on_off == false) ? false : true;
	}
	
	for(let i = 0; i < graphData.length; ++i) {
		let vtx = graphData[i];
		for(let j = 0; j < vtx.edges.length; ++j) {
			this.addEdge(vtx.id, vtx.edges[j]);
		}
	}	
	this.emitEvent("dataLoaded");
}

Schematic.prototype.addVertex = function(id, passthrough, requires, shared) {
	let idx = this.registerAlias(id);
	if(idx != null && this.vertices[idx] == null) {
		this.vertices[idx] = new Vertex(id, passthrough, requires, shared);
	} else {
		console.log("Attempted to register vertex that already exists: " + id);
	}
	return this.vertices[idx];
}

Schematic.prototype.addSourceVertex = function(id, passthrough, cls, requires, shared) {
	let idx = this.registerAlias(id);
	if(idx != null && this.vertices[idx] == null) {
		this.vertices[idx] = new SourceVertex(id, passthrough, cls, requires, shared);
		this.sources.push(idx);		
		for(let i = 0; i < this.vertices.length; ++i) {
			this.vertices[i].state.length = this.sources.length;
		}
	} else {
		console.log("Attempted to register source vertex that already exists: " + id);
	}
	return this.vertices[idx];
}

Schematic.prototype.addEdge = function(frm, to){
	let idxFrom = this.lookupAlias(frm);
	let idxTo = this.lookupAlias(to);
	if(idxFrom != null && idxTo != null) {
		this.vertices[idxFrom].edges.push(idxTo);
	} else {
		console.log("Attempted to register edge to vertex that doesnt exist: ( " + frm + ", " + to + " )");
	}
}

Schematic.prototype.registerAlias = function(id) {
	if(this.aliasTable[id] == null) {
		this.aliasTable[id] = this.aliasTable.count++;
		this.aliasTable[this.aliasTable[id]] = id;
		return this.aliasTable[id];
	}
	return null;
}

Schematic.prototype.lookupAlias = function(id) {
	if(id == null) return null;
	return this.aliasTable[id] == null ? null : this.aliasTable[id];
}

//Set passthrough of vertex to bool(val) if val is defined, otherwise, set passthrough to !passthrough
Schematic.prototype.setPassthrough = function(id, val) {
	let idx = this.lookupAlias(id);
	if(idx == null) {
		throw new Error("Attempted to set passthrough to invalid element with id: " + id);
	}
	if(this.sharedConflict(id) && val == true){
		throw new Error("Attempt to set true passthrough to item in a shared conflict, set shared element to no passthrough first.");
	}
	
	if(val === undefined || val === null) {
		this.vertices[idx].passthrough = !this.vertices[idx].passthrough;
	} else {
		this.vertices[idx].passthrough = val;
	}
}

Schematic.prototype.getPassthrough = function(id) {
	let idx = this.lookupAlias(id);
	if(idx == null){
		throw new Error("Attempted to get passthrough on invalid element with id: " + id);
	}
	
	return this.vertices[idx].passthrough;
}

//items with requires tag can only allow passthrough if their requirements allow passthrough
Schematic.prototype.requirementsSatisfied = function(id) {
	let idx = this.lookupAlias(id);
	if(idx == null){
		throw new Error("Attempted to check requirements on invalid element with id: " + id);
	}
	
	let vtx = this.vertices[idx];
	if(vtx.requires == null)
		return true;
	
	for(let i = 0; i < vtx.requires.length; ++i) {
		if(this.getPassthrough(vtx.requires[i]) == false) {
			return false;
		}
	}
	return true;
}

//Items with shared tag cannot exist at the same time, this changes switch draw logic
Schematic.prototype.sharedConflict = function(id) {
	let idx = this.lookupAlias(id);
	if(idx == null) {
		throw new Error("Attempted to check for shared conflict on invalid element with id: " + id);
	}
	
	let vtx = this.vertices[idx];
	if(vtx.shared == null)
		return false;
	
	for(let i = 0; i < vtx.shared.length; ++i) {
		if(this.getPassthrough(vtx.shared[i]) == true) {
			return true;
		}
	}
	return false;
}

Schematic.prototype.deepCopyState = function() {
	let cloneObject = function(obj) {
		let clone = {};
		for(let i in obj) {
			if(obj[i] != null && typeof(obj[i])=="object") {
				clone[i] = cloneObject(obj[i]);
			} else {
				clone[i] = obj[i];
			}
		}
		return clone;
	}
	return cloneObject(this.vertices);
}

Schematic.prototype.clearState = function(){
	for(let i = 0; i < this.vertices.length; ++i){
		this.vertices[i].state.length = this.sources.length;
		this.vertices[i].state.fill(false); //set it so that no source has reached this node
	}
}

Schematic.prototype.update = function(){
	let oldState = this.deepCopyState();
	this.clearState();
	
	for(let i = 0; i < this.sources.length; ++i){
		//Do DFS from each source
		let S = [];
		S.push(this.sources[i]); 
		
		//Initialize the visited array with null
		let V = [];
		V.length = this.vertices.length;
		V.fill(false);
		
		//While stack not empty
		while(S.length > 0){
			let node = S.pop();
			//If node isnt visited and it allows current through
			if(!V[node] && this.vertices[node].passthrough && this.requirementsSatisfied(this.lookupAlias(node))){ 
				V[node] = true; //We have now visited the node
				//The source at sources[i] did reach the current node
				this.vertices[node].state[i] = true; 
			} else {
				continue;
			}
			
			//For each child in the current node (god this is wordy)
			for(let j = 0; j < this.vertices[node].edges.length; ++j){
				//Push each child onto the stack;
				let child = this.vertices[node].edges[j];
				if(!V[child]){ //If we havent visited this child
					S.push(child);
				}
			}
		}
	}
	
	for(let i = 0; i < this.vertices.length; ++i) {
		let vtx = this.vertices[i];
		let oldVtx = oldState[i];
		for(let j = 0; j < this.sources.length; ++j) {
			if(vtx.state[j] != oldVtx.state[j] && oldVtx.state[j] != null) {
				//console.log(`State Change: \n\tvtx: ${this.lookupAlias(i)} \n\tsrc: ${this.lookupAlias(j)} \n\tvtx.state[j]: ${vtx.state[j]} \n\toldVtx.state[j]: ${oldVtx.state[j]} `);
				this.emitVertexEvent(this.vertices[i], "powerChanged", this.lookupAlias(this.sources[j]), this.vertices[i].state[j]); 
			}
		}
	}
}

Schematic.prototype.draw = function(){
	for(let i = 0; i < this.vertices.length; ++i){
		let vtx = this.vertices[i];
		//Determine if switch is draw open or closed
		let reqState = this.requirementsSatisfied(vtx.id)
		if(!reqState){
			if(vtx.hasOnOff){
				let id = vtx.id.substr(1, vtx.id.length); //cut # off
				let onStmt = "[id*=" +id + "_on]";
				let offStmt = "[id*=" +id + "_off]";
				$(onStmt).toggleClass("hidden", true);
				$(offStmt).toggleClass("hidden", false);
			}
		} else if(vtx.hasOnOff) {
			let id = vtx.id.substr(1, vtx.id.length); //cut # off
			let onStmt = "[id*=" +id + "_on]";
			let offStmt = "[id*=" +id + "_off]";
			if(vtx.passthrough == true) {
				$(onStmt).toggleClass("hidden", false);
				$(offStmt).toggleClass("hidden", true);

			} else {
				//Do not modify the offstate if there is a shared conflict
				if(!this.sharedConflict(vtx.id)) {
					$(offStmt).toggleClass("hidden", false);		
				}
				$(onStmt).toggleClass("hidden", true);
			}
		}
		
		for(let j = 0; j < this.sources.length; ++j){
			let src = this.vertices[this.sources[j]];
			if(vtx.id[0] === '_'){//Dummy element doesnt get drawn
				continue;
			}
			
			//If the required state isnt met, don't light up
			if(!reqState){ 
				$(vtx.id).toggleClass(src.cls, false);	
				/*
				if(vtx.hasOnOff) {
					$(vtx.id).toggleClass(src.cls, vtx.state[j]);				
				} else {
					$(vtx.id).toggleClass(src.cls, false);	
				}*/
				continue;
				
			//If its a switch, check if its currently closed
			} else if(vtx.hasOnOff){
				if(vtx.passthrough == true) {
					$(vtx.id).toggleClass(src.cls, vtx.state[j]);
				} else {
					$(vtx.id).toggleClass(src.cls, false);
				}
			//Otherwise, just check if the state is valid
			} else {
				$(vtx.id).toggleClass(src.cls, vtx.state[j]);	
			}
		}
	}
}

//Return a list of sources that are reachable from this vertex
Schematic.prototype.getReachedSources = function(id) {
	let sources = [];
	let vtx = this.lookupAlias(id);
	for(let i = 0; i < vtx.state.length; ++i) {
		sources.push(this.lookupAlias(vtx.sources[j]));
	}
	return sources;
}

Schematic.prototype.addEventListener = function(evtName, func) {
	if(this.evt[evtName] == null) {
		this.evt[evtName] = [];
	}
	this.evt[evtName].push(func);
}

Schematic.prototype.addVertexEventListener = function(id, evtName, func){
	let vtx = this.vertices[this.lookupAlias(id)];
	if(vtx.evt[evtName] == null) {
		vtx.evt[evtName] = [];
	}
	vtx.evt[evtName].push(func);
}

Schematic.prototype.removeEventListener = function(evtName, func) {
	if(this.evt[evtName] == null || this.evt[evtName].length <= 0) {
		return;
	}
	
	for(let i = 0; i <this.evt[evtName].length; ++i) {
		if(this.evt[evtName][i] == func) {
			this.evt[evtName].splice(i, 1);
		}
	}
}

Schematic.prototype.removeVertexEventListener = function(id, evtName, func) {
	let vtx = this.vertices[this.lookupAlias(id)];
	if(vtx.evt[evtName] == null || vtx.evt[evtName].length <= 0) {
		return;
	}
	
	for(let i = 0; i < vtx.evt[evtName].length; ++i){
		if(vtx.evt[evtName][i] == func) {
			vtx.evt[evtName].splice(i, 1);
		}
	}
}

Schematic.prototype.emitEvent = function(evtName, ...args) {
	if(this.evt[evtName] != null && this.evt[evtName].length > 0) {
		for(let i = 0; i < this.evt[evtName].length; ++i) { 
			this.evt[evtName][i].call(this, ...args);
		}
	}
}

Schematic.prototype.emitVertexEvent = function(vtx, evtName, ...args) {
	if(vtx == null || !(vtx instanceof Vertex || vtx instanceof SourceVertex) ) {
		throw new Error("Schematic.emitEvent: attempt to emit event to invalid vertex: " + vtx);
	}
	
	if(vtx.evt[evtName] != null && vtx.evt[evtName].length > 0) {
		for(let i = 0; i < vtx.evt[evtName].length; ++i) {
			vtx.evt[evtName][i].call(vtx, ...args);
		}
	}
}

Schematic.prototype.isVertexPowered = function(idVert, idSource){
	let vert = this.vertices[this.lookupAlias(idVert)];
	let src = this.vertices[this.lookupAlias(idSource)];
	let srcIdx = this.sources.indexOf(src);
	if(srcIdx == -1){
		//Can't check powered by non-source
		throw new Error("Attempt to check if vertex '" + idVert + "' was powered by non-source vertex '" +idSource + "'");
	} else {
		return vert.state[srcIdx];
	}
}

//Vertex class for map
function Vertex(id, passthrough, requires, shared) {
	if(id == null) {
		throw new Error("Vertex: 'id' parameter cannot be null or undefined");
	} else if(passthrough == null) {
		throw new Error("Vertex: 'passthrough' parameter cannot be null or undefined");
	} 
	
	this.id = id;
	this.passthrough = passthrough;
	this.edges = []; 	//array<int>
	this.requires = requires == null ? null : requires;
	this.shared = shared == null ? null : shared; 
	this.state = []; 	// array<bool>
	this.evt = {}; 		// map<str, [func]>
}


//Inherits from vertex, has some minor additional information
function SourceVertex(id, passthrough, cls, requires, shared){
	if(cls == null) {
		throw new Error("SourceVertex: 'class' parameter cannot be null or undefined");
	}
	
	Vertex.call(this, id, passthrough, requires, shared);
	this.cls = cls;
}



	