	// Alone in space, except for a teapot

    // Player HUD
    ZeroG.Game.Player.createHud();

	// Lighting
	ZeroG.Gremlin.Gizmo.setLightEnvironment(0.05,0.05,0.05,0.75,0.75,0.6,-1.0,0.0,0.0);
	ZeroG.Gremlin.Gizmo.setLightingFlags("lighting", true);

	// Game Objects
	// Parameters: position, primType, textureName, scale, latBands, longBands, animation, shininess, isSkyBox, stopPush
	ZeroG.Game.World.createObjectPrimitive({
		"position": [0, 0, -5000],
		"primType": "sphere", 
		"textureName": "textures/earth.jpg",
		"scale": 500,
		"latBands": 30,
		"longBands": 30, 
		"animation": function(elapsed) { this.rotate( ( (0.5 * elapsed) / 1000.0), 0, 1, 0); },
		"isSkyBox": true,
		"useLighting": true
	});
	ZeroG.Game.World.createObjectPrimitive({
		"position": [10000, 0, -5000],
		"primType": "sphere",
		"textureName": "textures/Sun.jpg",
		"scale": 100,
		"latBands": 30,
		"longBands": 30,
		"isSkyBox": true
	});
	// Whilst the scales and distances are completely wrong, as they are both in the sky box is doesn't matter
	
	ZeroG.Game.World.createObjectPrimitive({
		"position": [0, 0, 0],
		"primType": "sphere", 
		"textureName": "textures/huge_stars.png", 
		"scale": 15000, 
		"latBands": 30, 
		"longBands": 30, 
		"isSkyBox": true
	});
	
	// Parameters: position, modelName, textureName, scale, animation, shininess
	ZeroG.Game.World.createObjectModel({
		"position": [0, 0, -300],
		"modelName": "Teapot.json", 
		"textureName": "textures/metal.jpg",
		"scale": 0.1, 
		"animation": function(elapsed) { this.rotate( ( (30 * elapsed) / 1000.0), 0,1,0); }, 
		"shininess": 100
	});

    ZeroG.Game.World.setLevelThink(
		function() {
            // Play Ambient Noise
            if(!ZeroG.Game.World.getLevelVar("loaded") && !ZeroG.Game.World.getSound("space-ambient").isLoading){
                ZeroG.Game.World.getSound("space-ambient").play(0, true);
                ZeroG.Game.World.setLevelVar("loaded", true);
            }
        }
    );

    ZeroG.Game.World.setLevelCleanUp(function() { ZeroG.Game.World.getSound("space-ambient").stop(); });
	
	ZeroG.Game.World.createMotes();
	