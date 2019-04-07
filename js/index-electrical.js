let Schematic = function(graphData){
	this.vertices = [];
	this.aliasTable = { count: 0 };
	this.sources = [];	
	
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
	} else {
		console.log("Attempted to register source vertex that already exists: " + id);
	}
	return this.vertices[idx];
}

Schematic.prototype.addEdge = function(frm, to){
	let idxFrom = this.aliasLookup(frm);
	let idxTo = this.aliasLookup(to);
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

Schematic.prototype.aliasLookup = function(id) {
	if(id == null) return null;
	return this.aliasTable[id] == null ? null : this.aliasTable[id];
}

//Set passthrough of vertex to bool(val) if val is defined, otherwise, set passthrough to !passthrough
Schematic.prototype.setPassthrough = function(id, val) {
	let idx = this.aliasLookup(id);
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
	let idx = this.aliasLookup(id);
	if(idx == null){
		throw new Error("Attempted to get passthrough on invalid element with id: " + id);
	}
	
	return this.vertices[idx].passthrough;
}

//items with requires tag can only allow passthrough if their requirements allow passthrough
Schematic.prototype.requirementsSatisfied = function(id) {
	let idx = this.aliasLookup(id);
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
	let idx = this.aliasLookup(id);
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

Schematic.prototype.clearState = function(){
	for(let i = 0; i < this.vertices.length; ++i){
		this.vertices[i].state.length = this.sources.length;
		this.vertices[i].state.fill(false); //set it so that no source has reached this node
	}
}

Schematic.prototype.update = function(){
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
			if(!V[node] && this.vertices[node].passthrough && this.requirementsSatisfied(this.aliasLookup(node))){ 
				V[node] = true; //We have now visited the node
				//The source at sources[i] did reach the current node
				this.vertices[node].state[i] = true; 
			} else if (this.vertices[node].passthrough === false) {
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

Schematic.prototype.isVertexPowered = function(idVert, idSource){
	let vert = this.vertices[this.aliasLookup(idVert)];
	let src = this.vertices[this.aliasLookup(idSource)];
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
	this.edges = [];
	this.requires = requires == null ? null : requires;
	this.shared = shared == null ? null : shared;
	this.state = [];
}


//Inherits from vertex, has some minor additional information
function SourceVertex(id, passthrough, cls, requires, shared){
	if(cls == null) {
		throw new Error("SourceVertex: 'class' parameter cannot be null or undefined");
	}
	
	Vertex.call(this, id, passthrough, requires, shared);
	this.cls = cls;
}



	