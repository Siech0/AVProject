var VertexState = /** @class */ (function () {
    function VertexState(name, id, passthrough, edges, opt) {
        this._name = name;
        this._id = id;
        this._passthrough = passthrough;
        this._edges = edges;
        this._requires = opt.requires == null ? [] : opt.requires;
    }
    Object.defineProperty(VertexState.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexState.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexState.prototype, "passthrough", {
        get: function () {
            return this._passthrough;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexState.prototype, "edges", {
        get: function () {
            return this._edges;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VertexState.prototype, "requires", {
        get: function () {
            return this._requires;
        },
        enumerable: true,
        configurable: true
    });
    return VertexState;
}());
var Vertex = /** @class */ (function () {
    function Vertex(name, parentID) {
        this._states = new Map();
        this._currentState = null;
        this._name = name;
        this._parentID = parentID;
        this._events = new Map();
    }
    Object.defineProperty(Vertex.prototype, "states", {
        get: function () {
            return this._states;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex.prototype, "currentState", {
        get: function () {
            return this._currentState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex.prototype, "defaultState", {
        get: function () {
            return this._defaultState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex.prototype, "failureState", {
        get: function () {
            return this._failureState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex.prototype, "parentID", {
        get: function () {
            return this._parentID;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex.prototype, "events", {
        get: function () {
            return this._events;
        },
        enumerable: true,
        configurable: true
    });
    Vertex.prototype.addState = function (name, id, passthrough, edges, opt) {
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
    };
    Vertex.prototype.getState = function (name) {
        return this.states.get(name);
    };
    Vertex.prototype.setCurrentState = function (name) {
        var state = this.states.get(name);
        if (state == null) {
            throw new Error("Vertex.setCurrentState(): Attempt to set current state to an unregistered state: " + name);
        }
        this._currentState = state;
        this.emitEvent("stateChanged", name);
    };
    Vertex.prototype.setToDefaultState = function () {
        this.setCurrentState(this.defaultState.name);
    };
    Vertex.prototype.addEventListener = function (evtName, func) {
        if (this.events.get(evtName) == null) {
            this.events.set(evtName, new Array());
        }
        this.events.get(evtName).push(func);
    };
    Vertex.prototype.removeEventListener = function (evtName, func) {
        var events = this.events.get(evtName);
        for (var i = 0; i < events.length; ++i) {
            if (events[i] == func) {
                events.splice(i, 1);
            }
        }
    };
    Vertex.prototype.emitEvent = function (evtName) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.events.get(evtName) != null && this.events.get(evtName).length > 0) {
            var events = this.events.get(evtName);
            for (var i = 0; i < events.length; ++i) {
                (_a = events[i]).call.apply(_a, [this].concat(args));
            }
        }
    };
    return Vertex;
}());
var Source = /** @class */ (function () {
    function Source(name, className) {
        this._name = name;
        this._className = className;
        this._connections = new Set();
    }
    Object.defineProperty(Source.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Source.prototype, "className", {
        get: function () {
            return this._className;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Source.prototype, "connections", {
        get: function () {
            return this._connections;
        },
        enumerable: true,
        configurable: true
    });
    Source.prototype.clear = function () {
        this._connections.clear();
    };
    Source.prototype.addConnection = function (vertexName) {
        this.connections.add(vertexName);
    };
    Source.prototype.hasConnection = function (vertexName) {
        return this.connections.has(vertexName);
    };
    Source.prototype.forEachConnection = function (func) {
        this.connections.forEach(func);
    };
    return Source;
}());
var Schematic = /** @class */ (function () {
    function Schematic(graphData) {
        /* General Functions */
        this.clearState = function () {
            this.sources.forEach(function (source, key, map) {
                source.clear();
            });
        };
        /* Event Handling */
        this.addEventListener = function (evtName, func) {
            if (this.events.get(evtName) == null) {
                this.events.set(evtName, new Array());
            }
            this.events.get(evtName).push(func);
        };
        this.removeEventListener = function (evtName, func) {
            if (this.events.get(evtName) == null || this.events.get(evtName).length <= 0) {
                return;
            }
            var events = this.events.get(evtName);
            for (var i = 0; i < events.length; ++i) {
                if (events[i] == func) {
                    events.splice(i, 1);
                }
            }
        };
        if (graphData != null) {
            this.loadData(graphData);
        }
        this._vertices = new Map();
        this._sources = new Map();
        this._stateClasses = new Map();
        this._events = new Map();
    }
    Object.defineProperty(Schematic.prototype, "vertices", {
        get: function () {
            return this._vertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schematic.prototype, "sources", {
        get: function () {
            return this._sources;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schematic.prototype, "stateClasses", {
        get: function () {
            return this._stateClasses;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Schematic.prototype, "events", {
        get: function () {
            return this._events;
        },
        enumerable: true,
        configurable: true
    });
    Schematic.prototype.loadData = function (data) {
        if (data == null) {
            throw new Error("Attempt to generate schematic graph from null data");
        }
        //Phase one, load state classes
        if (data.classes != null) {
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
        }
        else {
            console.log("Schematic.loadData(): No classes array defined.");
        }
        //Phase two, load vertex information
        if (data.vertices == null) {
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
            if (dataVertex.states == null) {
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
    };
    /* Vertex Management */
    Schematic.prototype.addVertex = function (name, parentID) {
        if (this.vertices.get(name) != null) {
            throw new Error("Schematic.addVertex(): Attempt to add vertex with name '" + name + "' that is already registered");
        }
        this.vertices.set(name, new Vertex(name, parentID));
        this.emitEvent("vertexAdded", name);
    };
    Schematic.prototype.getVertexPassthrough = function (name) {
        var vertex = this.vertices.get(name);
        if (vertex == null) {
            throw new Error("Schematic.checkVertexPassthrough(): Attempted to check passthrough on invalid vertex with name '" + name + "'");
        }
        return vertex.currentState.passthrough;
    };
    Schematic.prototype.checkVertexRequirements = function (name) {
        var vertex = this.vertices.get(name);
        if (vertex == null) {
            throw new Error("Schematic.checkVertexRequirements(): Attempted to check requirements on invalid vertex with name '" + name + "'");
        }
        if (vertex.currentState.requires == null) {
            return true;
        }
        else {
            var requires = vertex.currentState.requires;
            for (var i = 0; i < requires.length; ++i) {
                if (this.getVertexPassthrough(requires[i]) === false) {
                    return false;
                }
            }
        }
        return true;
    };
    Schematic.prototype.isVertexPowered = function (vertexName, sourceName) {
        var source = this.sources.get(sourceName);
        if (source == null) {
            throw new Error("Schematic.isVertexPowered(): Attempt to check if vertex is connected to invalid source '" + sourceName + "'");
        }
        var vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.isVertexPowered(): Attempt to check if invalid vertex '" + vertexName + "' is connected to source");
        }
        return source.hasConnection(vertexName);
    };
    /* Source Management */
    Schematic.prototype.registerSource = function (name, className) {
        if (this.sources.get(name) != null) {
            throw new Error("Schematic.registerSource(): Attempt to register vertex with name '" + name + "' that is already registered as a source vertex");
        }
        this.sources.set(name, new Source(name, className));
        this.emitEvent("sourceRegistered", name, className);
    };
    /* State Management */
    Schematic.prototype.addVertexState = function (vertexName, name, id, passthrough, edges, opt) {
        if (vertexName == null) {
            throw new Error("Schematic.addVertexState(): Required parameter 'vertexName' undefined or null");
        }
        else if (name == null) {
            throw new Error("Schematic.addVertexState(): Required parameter 'name' undefined or null");
        }
        else if (passthrough == null) {
            throw new Error("Schematic.addVertexState(): Required parameter 'passthrough' undefined or null");
        }
        else if (edges == null) {
            throw new Error("Schematic.addVertexState(): Required parameter 'edges' undefined or null");
        }
        else if (opt == null) {
            opt = {};
        }
        var vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.addVertexState(): Attempt to add state to invalid vertex '" + vertexName + "'");
        }
        //Verify edges
        for (var i = 0; i < edges.length; ++i) {
            if (this.vertices.get(edges[i]) == null) {
                throw new Error("Schematic.addVertexState() attempt to add state to vertex '" + vertexName +
                    "' which contains edge to unregistered vertex '" + edges[i] + "'");
            }
        }
        //Verify requirements
        if (opt.requires != null) {
            for (var i = 0; i < opt.requires.length; ++i) {
                if (this.vertices.get(opt.requires[i]) == null) {
                    throw new Error("Schematic.addVertexState() attempt to add state to vertex '" + vertexName +
                        "' which contains requirement to unregistered vertex '" + opt.requires[i] + "'");
                }
            }
        }
        vertex.addState(name, id, passthrough, edges, opt);
    };
    Schematic.prototype.addVertexStateFromClass = function (vertexName, clsName, name, id, passthrough, edges, opt) {
        if (vertexName == null) {
            throw new Error("Schematic.addVertexStateFromClass(): Required parameter 'vertexName' undefined or null");
        }
        else if (clsName == null) {
            throw new Error("Schematic.addVertexStateFromClass(): Required parameter 'clsName' undefined or null");
        }
        var cls = this.stateClasses.get(clsName);
        if (cls == null) {
            throw new Error("Schematic.addVertexStateFromClass(): Attempt to create state inheriting from invalid class '" + clsName + "'");
        }
        var newName = (name == null ? cls.name : name);
        var newID = (id == null ? cls.id : id);
        var newPassthrough = (passthrough == null ? cls.passthrough : passthrough);
        var newEdges = (edges == null ? cls.edges : edges);
        var newOpt = {
            requires: opt.requires == null ? cls.requires : opt.requires,
            isDefault: opt.isDefault == null ? cls.isDefault : opt.isDefault,
            isFailure: opt.isFailure == null ? cls.isFailure : opt.isFailure
        };
        this.addVertexState(vertexName, newName, newID, newPassthrough, newEdges, newOpt);
    };
    Schematic.prototype.setVertexState = function (vertexName, state) {
        var vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.setVertexState(): Attempt to set state of invalid vertex '" + vertexName + "'");
        }
        vertex.setCurrentState(state);
    };
    Schematic.prototype.getVertexState = function (vertexName) {
        var vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.getVertexState(): Attempt to get state of invalid vertex '" + vertexName + "'");
        }
        return vertex.currentState.name;
    };
    /* State Class Management */
    Schematic.prototype.addStateClass = function (name, opt) {
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
    };
    Schematic.prototype.update = function () {
        var _this = this;
        //Deep copy old data for future comparisons
        var oldData = new Map();
        this.sources.forEach(function (source, key, sources) {
            oldData.set(key, new Set());
            var oldSource = oldData.get(key);
            source.forEachConnection(function (connection, _0, _1) {
                oldSource.add(connection);
            });
        });
        //Clear the previous state so that we dont accidentally leave any vertex untouched
        this.clearState();
        //Perform depth-first-search from each registered soruce.
        this.sources.forEach(function (source, key, sources) {
            //Copy old data so we can check for differences after the update
            var stack = new Array();
            stack.push(_this.vertices.get(key));
            var visited = new Map();
            _this.vertices.forEach(function (value, key, map) {
                //Initialize everything in visited to false.
                visited.set(key, false);
            });
            while (stack.length > 0) {
                var vertex = stack.pop();
                if (!visited.get(vertex.name)
                    && vertex.currentState.passthrough
                    && _this.checkVertexRequirements(vertex.name)) {
                    visited.set(vertex.name, true);
                    source.addConnection(vertex.name);
                }
                else {
                    continue;
                    //If this vertex doesnt meet the requirements to allow passthrough
                    //Don't look at its children.
                }
                //For each child, check if it has been visited, if not, add it to the stack for later.
                var edges = vertex.currentState.edges;
                for (var j in edges) {
                    var child = edges[j];
                    if (!visited.get(child)) {
                        stack.push(_this.vertices.get(child));
                    }
                }
            }
            //get the symetrical difference of the set
            source.forEachConnection(function (connection, _0, _1) {
                if (!oldData.has(connection)) {
                    _this.emitVertexEvent(connection, "powerChanged", true);
                }
            });
            oldData.get(key).forEach(function (connection, _0, _1) {
                if (!source.hasConnection(connection)) {
                    _this.emitVertexEvent(connection, "powerChanged", false);
                }
            });
        });
        this.emitEvent("load");
    };
    Schematic.prototype.draw = function () {
        var _this = this;
        this.vertices.forEach(function (vertex, vertexName, vertices) {
            //Hide all other elements of the vertex
            vertex.states.forEach(function (state, name, states) {
                $(state.id).toggleClass("hidden", true);
            });
            //Skip dummy nodes for draw info
            if (vertex.parentID[0] != "#") {
                return;
            }
            if (_this.checkVertexRequirements(vertex.name)) {
                $(vertex.currentState.id).toggleClass("hidden", false);
                _this.sources.forEach(function (src, srcName, sources) {
                    $(vertex.parentID).toggleClass(src.className, src.hasConnection(vertex.name));
                });
            }
            else {
                $(vertex.failureState.id).toggleClass("hidden", false);
                _this.sources.forEach(function (src, srcName, sources) {
                    $(vertex.parentID).toggleClass(src.className, false);
                });
            }
        });
        this.emitEvent("draw");
    };
    Schematic.prototype.emitEvent = function (evtName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.events.get(evtName) != null && this.events.get(evtName).length > 0) {
            var events = this.events.get(evtName);
            for (var i = 0; i < events.length; ++i) {
                events[i].call(this, args);
            }
        }
    };
    Schematic.prototype.addVertexEventListener = function (vertexName, evtName, func) {
        var vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.addVertexEventListener(): Attempt to attach listener to invalid vertex '" + vertexName + "'");
        }
        vertex.addEventListener(evtName, func);
    };
    Schematic.prototype.removeVertexEventListener = function (vertexName, evtName, func) {
        var vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.removeEventListener(): Attempt to remove listener from invalid vertex '" + vertexName + "'");
        }
        vertex.removeEventListener(evtName, func);
    };
    Schematic.prototype.emitVertexEvent = function (vertexName, evtName) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var vertex = this.vertices.get(vertexName);
        if (vertex == null) {
            throw new Error("Schematic.emitVertexEvent(): Attempt to emit vertex event for invalid vertex '" + vertexName + "'");
        }
        vertex.emitEvent.apply(vertex, [evtName].concat(args));
    };
    return Schematic;
}());
