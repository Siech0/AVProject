let Schematic = function(schematicData){
	this.vertices = [];
	this.aliasTable = { count: 0 };
	this.sources = [];	
}

Schematic.prototype.addVertex = function(id, passthrough) {
	let idx = this.registerAlias(id);
	if(idx != null && this.vertices[idx] == null) {
		this.vertices[idx] = new Vertex(id, passthrough);
	} else {
		console.log("Attempted to register vertex that already exists: " + id);
	}
}

Schematic.prototype.addSourceVertex = function(id, passthrough, cls) {
	let idx = this.registerAlias(id);
	if(idx != null && this.vertices[idx] == null) {
		this.vertices[idx] = new SourceVertex(id, passthrough, cls);
		this.sources.push(idx);		
	} else {
		console.log("Attempted to register source vertex that already exists: " + id);
	}
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
	if(val === undefined || val === null) {
		let idx = this.aliasLookup(id);
		this.vertices[idx].passthrough = !this.vertices[idx].passthrough;
	} else {
		let idx = this.aliasLookup(id);
		this.vertices[idx].passthrough = val;
	}
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
			if(!V[node] && this.vertices[node].passthrough){ 
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
		for(let j = 0; j < this.sources.length; ++j){
			let src = this.vertices[this.sources[j]];
			$("#"+this.vertices[i].id).toggleClass(src.cls, this.vertices[i].state[j]);
		}

	}
}

//Vertex class for map
function Vertex(id, passthrough) {
	if(id == null) {
		throw new Error("Vertex: 'id' parameter cannot be null or undefined");
	} else if(passthrough == null) {
		throw new Error("Vertex: 'passthrough' parameter cannot be null or undefined");
	} 
	
	this.id = id;
	this.passthrough = passthrough;
	this.edges = [];
	this.state = [];
}

//Inherits from vertex, has some minor additional information
function SourceVertex(id, passthrough, cls){
	if(cls == null) {
		throw new Error("SourceVertex: 'class' parameter cannot be null or undefined");
	}
	
	Vertex.call(this, id, passthrough);
	this.cls = cls;
}


function generateGraph(graphData){
	let graph = new Graph();
	for(let i = 0; i < graphData.length; ++i) {
		let vtx = graphData[i];
		if(vtx.source){ // is source
			graph.addSourceVertex(vtx.id, vtx.passthrough, vtx.class_name);
		} else {
			graph.addVertex(vtx.id, vtx.passthrough);
		}
	}
	
	for(let i = 0; i < graphData.length; ++i) {
		let vtx = graphData[i];
		for(let j = 0; j < vtx.edges.length; ++j) {
			graph.addEdge(vtx.id, vtx.edges[j]);
		}
	}
	return graph;
}

$.getJSON("itemInfo.json", function(json) {
	let graphData = json.graphData;
	diagramGraph = generateGraph(graphData);
	diagramGraph.update();
	diagramGraph.draw();
});


	