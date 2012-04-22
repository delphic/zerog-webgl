// ZeroG.Game.World
var World = function() {
    // Game Objects
    // Arguably these should live in Gremlin
    var gameObjects = [];
    var gamePointLights = [];
    var gameSpotLights = [];
    var gameSounds = [];

    function init() {
        projectileObject.rotate(90, 1, 0, 0); // TODO: Should create rotation matrix and hand into GameObject creator
        var projectileRenderObject = new Components.Render({});
        projectileObject.addRenderObject(projectileRenderObject);
        projectileRenderObject.assignBuffer(Gremlin.Primitives.createTetrahedron());
        projectileRenderObject.setUseLighting(false); //TODO: Would be better with lighting true and emissive material
        projectileRenderObject.setScale(0.03,0.03,0.03);
        projectileRenderObject.animate = function(elapsed) { this.rotate( ( (300 * elapsed) / 1000.0), 1, 1, 1); };
        var prevSetColor = projectileObject.setColor;
        projectileObject.setColor = function(r,g,b,a) {
            prevSetColor(r,g,b,a);
            this.color = [r, g, b, a];
        }
    }

    // Creation Objection
    // parameters: position, primType, textureName, scale, latBands, longBands, animation, shininess, isSkyBox, stopPush,
    // color, useLighting, outerRadius, innerRadius, thickness, numberOfSides
    function createObjectPrimitive(parameters) {
		// Required parameters
		if(!parameters.primType) {
			throw new Error("Required argument missing for createObjectPrimitive: 'primType'");
		}
		if(!parameters.position) {
			throw new Error("Required argument missing for createObjectPrimitive: 'position");
		}
		if(!parameters.scale) {
			throw new Error("Required argument missing for createObjectPrimitive: 'scale'");
		}

		var object = (parameters.gameObjectIndex) ? gameObjects[parameters.gameObject] :
            (parameters.gameObject) ? parameters.gameObject : new GameObject({ "position": parameters.position });

        var renderObject = new Components.Render({});
        object.addRenderObject(renderObject);
        renderObject.useTextures = (parameters.textureName) ? true : false;

		if(parameters.scale.length) {
            renderObject.setScale(parameters.scale);
		}
		else {
            renderObject.setScale(parameters.scale,parameters.scale,parameters.scale);
		}

		switch(parameters.primType) {
		case "pyramid":
            renderObject.assignBuffer(Gremlin.Primitives.createPyramid());
			break;
		case "cube":
            renderObject.assignBuffer(Gremlin.Primitives.createCube());
			break;
		case "sphere":
            renderObject.assignBuffer(Gremlin.Primitives.createSphere({ latBands: parameters.latBands, longBands: parameters.longBands }));
			break;
		case "ring":
            renderObject.assignBuffer(Gremlin.Primitives.createRing({ outerRadius: parameters.outerRadius, innerRadius: parameters.innerRadius, thickness: parameters.thickness, numberOfSides: parameters.numberOfSides }));
			break;
		case "ray":
            renderObject.assignBuffer(Gremlin.Primitives.createRay());
			break;
		case "point":
            renderObject.assignBuffer(Gremlin.Primitives.createPoint());
			break;
		default:
			throw new Error("Invalid Prim Type: "+parameters.primType+"");
		}
		if(parameters.textureName) {
            renderObject.texture = Gremlin.Gizmo.createTexture(parameters.textureName);
		}
		if(parameters.shininess) {
            renderObject.setShininess(parameters.shininess);
		}
		if(parameters.isSkyBox) {
            renderObject.setIsSkyBox(true);
		}
		if(parameters.useLighting) {
            renderObject.setUseLighting(parameters.useLighting);
		}
		if(parameters.animation) {
            renderObject.animate = parameters.animation;
		}
		if(parameters.color) {
            renderObject.setColor(parameters.color[0], parameters.color[1], parameters.color[2], parameters.color[3]);
		}
		if(!parameters.stopPush && !(parameters.gameObjectIndex || parameters.gameObject))
		{
			gameObjects.push(object);
		}

		return object;

	}

	// parameters: position, modelName, textureName, scale, animation, shininess
	function createObjectModel(parameters) {
		// Check for required parameters
		if(!parameters.position) {
			throw new Error("Required argument missing for createObjectModel: 'position'");
		}
		if(!parameters.modelName) {
			throw new Error("Required argument missing for createObjectModel: 'modelName'");
		}
		if(!parameters.scale) {
			throw new Error("Required argument missing for createObjectModel: 'scale'");
		}

        var object = (parameters.gameObjectIndex) ? gameObjects[parameters.gameObject] :
            (parameters.gameObject) ? parameters.gameObject : new GameObject({ "position": parameters.position });

        var renderObject = new Components.Render({});
        object.addRenderObject(renderObject);

        renderObject.useTextures = (parameters.textureName)? true : false;

		if(parameters.scale.length) {
            renderObject.setScale(parameters.scale);
		}
		else {
            renderObject.setScale(parameters.scale, parameters.scale, parameters.scale);
		}

		Gremlin.Gizmo.loadModel(renderObject, parameters.modelName); // TODO: do not pass object, use callback

		if(parameters.textureName) {
            renderObject.texture = Gremlin.Gizmo.createTexture(parameters.textureName);
		}
		if(parameters.shininess) {
            renderObject.setShininess(parameters.shininess);
		}
		if(parameters.animation) {
            renderObject.animate = parameters.animation;
		}
		if(parameters.color) {
            renderObject.setColor(parameters.color[0], parameters.color[1], parameters.color[2], parameters.color[3]);
		}
        if(!parameters.stopPush && !(parameters.gameObjectIndex || parameters.gameObject))
        {
		    gameObjects.push(object);
        }
	}

	function getSound(name) {
		return gameSounds[name];
	}
	function setSound(name, sound) {
		gameSounds[name] = sound;
		return gameSounds[name];
	}

	// Basic Projectile System
	// TODO: namespace
	var projectiles = [];
	var projectileObject = new GameObject({ "position": [0,0,0] });
	// Would also be better if when we had a particle system that it would leave a short lived trail.
	// Also don't know if we want more than one projectile object... but we do want more than one colour.

    function spawnProjectile(parameters) {
		var newproj = new Projectile(parameters);
		projectiles.push(newproj);
	}

	function removeProjectile(index) {
		projectiles.splice(index,1);
	}

    // TODO: Sub Namespace?
    // Dust Motes
	var dustMotes = [];
	var maxMotes, randomFactor, rootThree;
	rootThree = 1.73205; // Approximately
	randomFactor = 10; // To Be Adjusted
	maxMotes = 100; // To Be Adjusted

	function createMotes() {
		// Remove Existing Motes
		dustMotes.splice(0,dustMotes.length);
		// Add New Motes
		for(var i = 0; i < maxMotes; i++) {
			var obj = new GameObject(
				{ "position":
					[2*randomFactor*(Math.random()-0.5),
					2*randomFactor*(Math.random()-0.5),
					2*randomFactor*(Math.random()-0.5)] });
            var renderObj = new Components.Render({});
            renderObj.assignBuffer(Gremlin.Primitives.createPoint());
            renderObj.points = true;
            renderObj.useLighting = false; // If we want the motes to be lit properly we'll have to figure out the normal to a point!
            renderObj.setColor(0.8,0.8,0.8,1);
            obj.addRenderObject(renderObj);
			obj.spawnDistance = rootThree*randomFactor;
			dustMotes.push(obj);
		}
	}

    // TODO OPTIMISE: remove vec3.create
	function updateMotes(position, velocity) {
		if (vec3.length(velocity)) {
			for(var i = 0; i < dustMotes.length; i++){
				var boundingR = dustMotes[i].spawnDistance;
				var separation = vec3.create();
				vec3.subtract(position,dustMotes[i].position, separation);
				if (vec3.length(separation) >  boundingR) {
					// Randomise position of modes and reset to new bounding radius
					separation = [Math.random()*separation[0], Math.random()*separation[1], Math.random()*separation[2]];
					vec3.normalize(separation);
					boundingR = vec3.length(velocity) + rootThree*randomFactor;
					vec3.scale(separation, boundingR);

					// Respawn on other side of sphere with randomised position
					dustMotes[i].spawnDistance = boundingR;
					dustMotes[i].setPosition(
						position[0] + separation[0],
						position[1] + separation[1],
						position[2] + separation[2]
					);
				}
			}
		}
	}

    // Level Functions - Own namespace?
	var levelThink = function() { /* Blank! */ };
	var levelCleanUp = function() { /* Blank! */ };
	var levelVars = [];

    function runLevelThink() {
        levelThink();
    }

	function setLevelThink(func) {
		levelThink = func;
	}
	function setLevelCleanUp(func) {
		levelCleanUp = func;
	}
	function getLevelVar(key) {
		return levelVars[key];
	}
	function setLevelVar(key, value) {
		levelVars[key] = value;
	}

	function loadLevel(fileName, targetState) {
		// Reset Player Object - should be method on player
		// Also we should only reset the camera!
		Gremlin.Gizmo.setPlayerCamera(0,0,0);
		Gremlin.Gizmo.setPlayerCameraRotation(0,0,0);
		Player.reset();

		gameState = "Loading";
		loadingTargetState = targetState;

		var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", fileName);
		if (typeof fileref!="undefined") document.getElementsByTagName("head")[0].appendChild(fileref);

	}
	function unloadLevel() {
		levelCleanUp();
		for(key in levelVars)
		{
			if(levelVars.hasOwnProperty(key)) { levelVars[key] = null; }
		}
		ShipManager.destroyShips();
		setLevelThink(function() { /* Blank! */ });
		setLevelCleanUp(function() { /* Blank! */});
		gameObjects.splice(0, gameObjects.length);
		projectiles.splice(0, projectiles.length);
		dustMotes.splice(0, dustMotes.length); // Looks like we need a level manager! ;D
		Gremlin.Gizmo.removeLights();
		Gremlin.HUD.clearHud();
	}

    return {
        gameObjects: gameObjects,
        gamePointLights: gamePointLights,
        gameSpotLights: gameSpotLights,
        gameSounds: gameSounds,
        motes: dustMotes,
        projectiles: projectiles,
        projectileObject: projectileObject, // Remove access to everything above this and implement World.Update
        spawnProjectile: spawnProjectile,
        removeProjectile: removeProjectile,
        init: init,
        createObjectPrimitive: createObjectPrimitive,
        createObjectModel: createObjectModel,
        getSound: getSound,
        setSound: setSound,
        createMotes: createMotes,
        updateMotes: updateMotes,
        loadLevel: loadLevel,
        unloadLevel: unloadLevel,
        levelThink: runLevelThink, // Also remove access to this, and place in World.Update
        setLevelThink: setLevelThink,
        setLevelCleanUp: setLevelCleanUp,
        getLevelVar: getLevelVar,
        setLevelVar: setLevelVar
    }

}();