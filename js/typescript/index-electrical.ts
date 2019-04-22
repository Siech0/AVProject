class VertexState {
    private readonly _name: string;
    private readonly _id: string;
    private readonly _passthrough: boolean;
    private readonly _edges: Array<string>
    private readonly _requires: Array<string>

    constructor(name: string, id: string, passthrough: boolean, edges: Array<string>, opt) {
        this._name = name;
        this._id = id;
        this._passthrough = passthrough;
        this._edges = edges;
        this._requires = opt.requires == null ? [] : opt.requires;
    }

    public get name(): string {
        return this._name;
    }

    public get id(): string {
        return this._id;
    }

    public get passthrough(): boolean {
        return this._passthrough;
    }

    public get edges(): Array<string> {
        return this._edges;
    }

    public get requires(): Array<string> {
        return this._requires;
    }
}

class Vertex {
    private readonly _states: Map<string, VertexState>;
    private _currentState: VertexState;
    private _defaultState: VertexState;
    private _failureState: VertexState;
    private readonly _name: string;
    private readonly _parentID: string;
    private _events: Map<string, Array<Function>>;

    constructor(name, parentID) {
        this._states = new Map<string, VertexState>();
        this._currentState = null;
        this._name = name;
        this._parentID = parentID;
        this._events = new Map<string, Array<Function>>();
    }

    public get states(): Map<string, VertexState> {
        return this._states;
    } 

    public get currentState(): VertexState {
        return this._currentState;
    }

    public get defaultState(): VertexState {
        return this._defaultState;
    }

    public get failureState(): VertexState {
        return this._failureState;
    }

    public get name(): string {
        return this._name;
    }

    public get parentID(): string {
        return this._parentID;
    }

    public get events(): Map<string, Array<Function>> {
        return this._events;
    }

    public addState(name: string, id: string, passthrough: boolean, edges: Array<string>, opt): void {
        this.states.set(name, new VertexState(name, id, passthrough, edges, opt));
        if (opt.isDefault || this.states.size == 1) { //First state or specified to be default.
            this.setCurrentState(name);
            this._defaultState = this.states.get(name);
            if (this.failureState == null) {
                this._failureState = this.states.get(name);
            }
        }
        if (opt.isFailure) {
            this._failureState = this.states.get(name);
        }
		this.emitEvent("stateAdded", name);
    }

    public getState(name: string): VertexState {
        return this.states.get(name);
    }

    public setCurrentState(name: string): void {
        let state: VertexState  = this.states.get(name);
        if (state == null) {
            throw new Error("Vertex.setCurrentState(): Attempt to set current state to an unregistered state: "  + name);
        }
        this._currentState = state;
		this.emitEvent("stateChanged", name);
    }

    public setToDefaultState(): void {
        this.setCurrentState(this.defaultState.name);
    }
	
	
	public addEventListener(evtName: string, func: Function): void {
        if (this.events.get(evtName) == null) {
            this.events.set(evtName, new Array<Function>());
        }
        this.events.get(evtName).push(func);
    }
	
    public removeEventListener(evtName: string, func: Function) {
        let events = this.events.get(evtName);
        for (let i = 0; i < events.length; ++i) {
            if (events[i] == func) {
                events.splice(i, 1);
            }
        }
    }
	
    public emitEvent(evtName: string, ...args: any): void {
        if (this.events.get(evtName) != null && this.events.get(evtName).length > 0) {
            let events = this.events.get(evtName);
            for (let i = 0; i < events.length; ++i) {
                events[i].call(this, ...args);
            }
        }
    }
}

class Source {
	public readonly _name: string;
    public readonly _className: string;
    private readonly _connections: Set<string>;

    constructor(name: string, className: string) {
		this._name = name;
        this._className = className;
        this._connections = new Set<string>();
    }

	public get name(): string {
		return this._name;
	}
	
    public get className(): string {
        return this._className;
    }

    private get connections(): Set<string>{
        return this._connections;
    }

    public clear() {
        this._connections.clear();
    }

    public addConnection(vertexName: string) {
        this.connections.add(vertexName);
    }

    public hasConnection(vertexName: string) {
        return this.connections.has(vertexName);
    }

    public forEachConnection(func: (value1: string, value2:string, set: Set<string>) => void) {
        this.connections.forEach(func);
    }
}

class Schematic {
    private readonly _vertices: Map<string, Vertex>;
    private readonly _sources: Map<string, Source>;
    private readonly _stateClasses: Map<string, any>;
    private readonly _events: Map<string, Array<Function>>;

    constructor(graphData) {
        if (graphData != null) {
            this.loadData(graphData);
        }

        this._vertices = new Map<string, Vertex>();
        this._sources = new Map<string, Source>();
        this._stateClasses = new Map<string, any>();
        this._events = new Map<string, Array<Function>>();
    }

    public get vertices(): Map<string, Vertex> {
        return this._vertices;
    }
    public get sources(): Map<string, Source> {
        return this._sources;
    }
    public get stateClasses(): Map<string, any> {
        return this._stateClasses;
    }
    public get events(): Map<string, Array<Function>> {
        return this._events;
    }

    public loadData(data) {
		if (data == null) {
            throw new Error("Attempt to generate schematic graph from null data");
        }
        //Phase one, load state classes
		if(data.classes != null) {			
			for (var k in data.classes) {
				var cls = data.classes[k];
				this.addStateClass(k, {
					name: cls.name,
					id: cls.id,
					passthrough: cls.passthrough,
					edges: cls.edges,
					requires: cls.requires,
					className: cls.class_name,
					isDefault: cls.is_default,
					isFailure: cls.is_failure
				});
			}
		} else {
			console.log("Schematic.loadData(): No classes array defined.");
		}
        //Phase two, load vertex information
		if(data.vertices == null) {
				throw new Error("Schematic.loadData(): Attempt to load data but vertices array is undefined.");
		}
        for (var i = 0; i < data.vertices.length; ++i) {
            //This can throw, but we assume that if there is an error reading the json
            //Then all of the information in it could be incorrect
            var dataVertex = data.vertices[i];
            this.addVertex(dataVertex.name, dataVertex.parent_id);
            if (dataVertex.class_name != null) { // Has information to be a source vertex
                this.registerSource(dataVertex.name, dataVertex.class_name);
            }
        }
        //Phase three, load states into each vertex after doing class inheritance and edge validation.
        for (var i = 0; i < data.vertices.length; ++i) {
            var dataVertex = data.vertices[i];
            var vertex = this.vertices.get(dataVertex.name);
			if(dataVertex.states == null) {
				throw new Error("Schematic.loadData(): Attempt to load data with data vertex '" + dataVertex.name + "' where states array is not defined.");
			}
            for (var j = 0; j < dataVertex.states.length; ++j) {
                //function(name, id, passthrough, edges, opt)
                var dataState = dataVertex.states[j];
                var opt = { requires: dataState.requires, isDefault: dataState.is_default, isFailure: dataState.is_failure };
                //If no state id is provided, default to using the parent id.
                var id = dataState.id == null ? vertex.parentID : dataState.id;
                //Add the state, inherit it from a class if neeeded.
                if (dataState.class_id != null) {
                    this.addVertexStateFromClass(dataVertex.name, dataState.class_id, dataState.name, dataState.id, dataState.passthrough, dataState.edges, opt);
                }
                else {
                    this.addVertexState(vertex.name, dataState.name, dataState.id, dataState.passthrough, dataState.edges, opt);
                }
            }
        }
		
		this.emitEvent("dataLoaded");
    }

    /* Vertex Management */
    public addVertex(name: string, parentID: string): void  {
        if (this.vertices.get(name) != null) {
            throw new Error("Schematic.addVertex(): Attempt to add vertex with name '" + name + "' that is already registered");
        }
        this.vertices.set(name, new Vertex(name, parentID));
		this.emitEvent("vertexAdded", name);
    }

    public getVertexPassthrough(name: string): boolean {
        let vertex = this.vertices.get(name);
        if (vertex == null) {
            throw new Error("Schematic.checkVertexPassthrough(): Attempted to check passthrough on invalid vertex with name '" + name + "'");  
        }
        return vertex.currentState.passthrough;
    }

    public checkVertexRequirements(name: string): boolean {
        let vertex = this.vertices.get(name);
        if (vertex == null) {
            throw new Error("Schematic.checkVertexRequirements(): Attempted to check requirements on invalid vertex with name '" + name + "'");
        }     

        if (vertex.currentState.requires == null) {
            return true;
        } else {
            let requires = vertex.currentState.requires;
            for (let i = 0; i < requires.length; ++i) {
                if (this.getVertexPassthrough(requires[i]) === false) {
                    return false;
                }
            }
        }
		return true;
    }

    public isVertexPowered(vertexName: string, sourceName: string): boolean{
        let source = this.sources.get(sourceName);
        if (source == null) {
            throw new Error("Schematic.isVertexPowered(): Attempt to check if vertex is connected to invalid source '" + sourceName + "'");
        }
        let vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.isVertexPowered(): Attempt to check if invalid vertex '" + vertexName + "' is connected to source");
        }
        return source.hasConnection(vertexName);
    }

    /* Source Management */
    public registerSource(name: string, className: string): void {
        if (this.sources.get(name) != null) {
            throw new Error("Schematic.registerSource(): Attempt to register vertex with name '" + name + "' that is already registered as a source vertex");
        }
		this.sources.set(name, new Source(name, className));
		this.emitEvent("sourceRegistered", name, className);
    }

    /* State Management */
    public addVertexState(vertexName: string, name: string, id: string, passthrough: boolean, edges: Array<string>, opt: any): void {
        if(vertexName == null) {
			throw new Error("Schematic.addVertexState(): Required parameter 'vertexName' undefined or null");
		} else if(name == null) {
			throw new Error("Schematic.addVertexState(): Required parameter 'name' undefined or null");			
		} else if(passthrough == null) {
			throw new Error("Schematic.addVertexState(): Required parameter 'passthrough' undefined or null");			
		} else if(edges == null) {
			throw new Error("Schematic.addVertexState(): Required parameter 'edges' undefined or null");			
		} else if(opt == null) {
			opt = {};
		}
		
		let vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.addVertexState(): Attempt to add state to invalid vertex '" + vertexName + "'");
        }

        //Verify edges
        for(let i = 0; i < edges.length; ++i) {
            if(this.vertices.get(edges[i]) == null) {
                throw new Error("Schematic.addVertexState() attempt to add state to vertex '" + vertexName +
                    "' which contains edge to unregistered vertex '" + edges[i] + "'");
            }
        }

        //Verify requirements
        if(opt.requires != null) {
            for(let i = 0; i < opt.requires.length; ++i) {
                if(this.vertices.get(opt.requires[i]) == null) {
                    throw new Error("Schematic.addVertexState() attempt to add state to vertex '" + vertexName +
                        "' which contains requirement to unregistered vertex '" + opt.requires[i] + "'");
                }
            }
        }
        vertex.addState(name, id, passthrough, edges, opt);
    }

    public addVertexStateFromClass(vertexName: string, clsName: string, name: string, id: string, passthrough: boolean, edges: Array<string>, opt: any): void {
        if(vertexName == null) {
			throw new Error("Schematic.addVertexStateFromClass(): Required parameter 'vertexName' undefined or null");
		} else if (clsName == null) {
			throw new Error("Schematic.addVertexStateFromClass(): Required parameter 'clsName' undefined or null");
		}
		
		let cls = this.stateClasses.get(clsName);
        if (cls == null) {
            throw new Error("Schematic.addVertexStateFromClass(): Attempt to create state inheriting from invalid class '" + clsName + "'");
        }

        let newName = (name == null ? cls.name : name);
        let newID = (id == null ? cls.id : id);
        let newPassthrough = (passthrough == null ? cls.passthrough : passthrough);
        let newEdges = (edges == null ? cls.edges : edges);
        let newOpt = {
            requires: opt.requires == null ? cls.requires : opt.requires,
            isDefault: opt.isDefault == null ? cls.isDefault : opt.isDefault,
            isFailure: opt.isFailure == null ? cls.isFailure : opt.isFailure
        };
        this.addVertexState(vertexName, newName, newID, newPassthrough, newEdges, newOpt);
    }

    public setVertexState(vertexName: string, state: string) {
        let vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.setVertexState(): Attempt to set state of invalid vertex '" + vertexName + "'");
        }
        vertex.setCurrentState(state);
    }

    public getVertexState(vertexName: string): string {
        let vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.getVertexState(): Attempt to get state of invalid vertex '" + vertexName + "'");
        }
        return vertex.currentState.name;
    }
	
	public isVertexPowered(vertexName: string, sourceName: string): bool {
		let vertex = this.vertices.get(vertexName);
		if(vertex == null) {
			throw new Error("Schematic.isVertexPowered(): Attempt to get power state of invalid vertex '" + vertexName + "'");
		}
		let source = this.sources.get(sourceName);
		if(source == null) {
			throw new Error("Schematic.isVertexPowered(): Attempt to get power state vertex from invalid source'" + sourceName + "'");
		}
		return source.hasConnection(vertexName);
	}

    /* State Class Management */
    public addStateClass(name: string, opt: any): void {
        if (this.stateClasses.get(name) != null) {
            throw new Error("Schematic.addStateClass(): Attempt to add state class  '" + name + "' that is already registered");
        }
        this.stateClasses.set(name, {
            name: opt.name,
            id: opt.id,
            passthrough: opt.passthrough,
            edges: opt.edges,
            requires: opt.requires,
            classID: opt.className,
            isDefault: opt.isDefault,
            isFailure: opt.isFailure
        });
		this.emitEvent("classAdded");
    }


    /* General Functions */
    public clearState = function (): void {
        this.sources.forEach((source: Source, key: string, map: Map<string, Source>) => {
            source.clear();
        });
    }
    
    public update(): void {
		//Deep copy old data for future comparisons
		let oldData = new Map<string, Set<string>>();
		this.sources.forEach((source: Source, key: string, sources: Map<string, Source>) => {
			oldData.set(key, new Set<string>());
			let oldSource = oldData.get(key);
			source.forEachConnection((connection: string, _0: string, _1: Set<string>) => {
				oldSource.add(connection);
			});
		});
		
		//Clear the previous state so that we dont accidentally leave any vertex untouched
        this.clearState();

        //Perform depth-first-search from each registered soruce.
        this.sources.forEach((source: Source, key: string, sources: Map<string, Source>) => {
			//Copy old data so we can check for differences after the update
					
            let stack = new Array<Vertex>();
            stack.push(this.vertices.get(key));

            let visited = new Map<string, boolean>();
            this.vertices.forEach((value: Vertex, key: string, map: Map<string, Vertex>) => {
                //Initialize everything in visited to false.
                visited.set(key, false);
            });

            while (stack.length > 0) {
                let vertex = stack.pop();
                if (!visited.get(vertex.name)
                    && vertex.currentState.passthrough
                    && this.checkVertexRequirements(vertex.name)
                ) {
                    visited.set(vertex.name, true);
                    source.addConnection(vertex.name);
                } else {
                    continue;
                    //If this vertex doesnt meet the requirements to allow passthrough
                    //Don't look at its children.
                }

                //For each child, check if it has been visited, if not, add it to the stack for later.
                let edges = vertex.currentState.edges;
                for (let j in edges) {
                    let child = edges[j];
                    if (!visited.get(child)) {
                        stack.push(this.vertices.get(child));
                    }
                }
            }
			
			//get the symetrical difference of the set
			source.forEachConnection((connection: string, _0: string, _1: Set<string>) => {
				if(!oldData.has(connection)) {
					this.emitVertexEvent(connection, "powerChanged", true);
				}
			});
			oldData.get(key).forEach((connection: string, _0: string, _1: Set<string>) => {
				if(!source.hasConnection(connection)) {
					this.emitVertexEvent(connection, "powerChanged", false);
				}
			});
        });
		this.emitEvent("load");
    }

    public draw(): void {
        this.vertices.forEach((vertex: Vertex, vertexName: string, vertices: Map<string, Vertex>) => {
            //Hide all other elements of the vertex
            vertex.states.forEach((state: VertexState, name: string, states: Map<string, VertexState>) => {
                $(state.id).toggleClass("hidden", true);
            });
	    //Skip dummy nodes for draw info
	    if (vertex.parentID[0] != "#"){
	        return;
	    }
	    
            if (this.checkVertexRequirements(vertex.name)) {
                $(vertex.currentState.id).toggleClass("hidden", false);
                this.sources.forEach((src: Source, srcName: string, sources: Map<string, Source>) => {
                    $(vertex.parentID).toggleClass(src.className, src.hasConnection(vertex.name));
                });
            } else {
                $(vertex.failureState.id).toggleClass("hidden", false);
                this.sources.forEach((src: Source, srcName: string, sources: Map<string, Source>) => {
                    $(vertex.parentID).toggleClass(src.className, false);
                });
            }

        });
	this.emitEvent("draw");
    }

    /* Event Handling */
    public addEventListener = function (evtName: string, func: Function): void {
        if (this.events.get(evtName) == null) {
            this.events.set(evtName, new Array<Function>());
        }
        this.events.get(evtName).push(func);
    }

    public removeEventListener = function (evtName:string , func: Function): void {
        if (this.events.get(evtName) == null || this.events.get(evtName).length <= 0) {
            return;
        }

        let events = this.events.get(evtName);
        for (let i = 0; i < events.length; ++i) {
            if (events[i] == func) {
                events.splice(i, 1);
            }
        }
    }
	
	public emitEvent(evtName: string, ...args: any): void {
        if (this.events.get(evtName) != null && this.events.get(evtName).length > 0) {
            let events = this.events.get(evtName);
            for (let i = 0; i < events.length; ++i) {
                events[i].call(this, args);
            }
        }
    }
	
    public addVertexEventListener(vertexName: string, evtName: string, func: Function): void {
        let vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.addVertexEventListener(): Attempt to attach listener to invalid vertex '" + vertexName + "'");
        }
		vertex.addEventListener(evtName, func);
    }

    public removeVertexEventListener(vertexName: string, evtName: string, func: Function): void {
        let vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.removeEventListener(): Attempt to remove listener from invalid vertex '" + vertexName + "'");
        }
		vertex.removeEventListener(evtName, func);
    }
	
	public emitVertexEvent(vertexName: string, evtName: string, ...args: any): void {
		let vertex = this.vertices.get(vertexName);
		if(vertex == null) {
			throw new Error("Schematic.emitVertexEvent(): Attempt to emit vertex event for invalid vertex '" + vertexName + "'");
		}
		vertex.emitEvent(evtName, ...args);	
	}
}
