	// Alone in space, except for a teapot
	
	// Lighting
	Gremlin.setLightEnvironment(0.05,0.05,0.05,0.75,0.75,0.6,-1.0,0.0,0.0);
	Gremlin.setLightingFlags("lighting", true);

	// Game Objects
	// Parameters: position, primType, textureName, scale, latBands, longBands, animation, shininess, isSkyBox, stopPush
	Game.createObjectPrimitive({
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
	Game.createObjectPrimitive({
		"position": [10000, 0, -5000],
		"primType": "sphere",
		"textureName": "textures/Sun.jpg",
		"scale": 100,
		"latBands": 30,
		"longBands": 30,
		"isSkyBox": true
	});
	// Whilst the scales and distances are completely wrong, as they are both in the sky box is doesn't matter
	
	Game.createObjectPrimitive({
		"position": [0, 0, 0],
		"primType": "sphere", 
		"textureName": "textures/huge_stars.png", 
		"scale": 15000, 
		"latBands": 30, 
		"longBands": 30, 
		"isSkyBox": true
	});
	
	// Parameters: position, modelName, textureName, scale, animation, shininess
	Game.createObjectModel({
		"position": [0, 0, -300],
		"modelName": "Teapot.json", 
		"textureName": "textures/metal.jpg",
		"scale": 0.1, 
		"animation": function(elapsed) { this.rotate( ( (30 * elapsed) / 1000.0), 0,1,0); }, 
		"shininess": 100
	});

    Game.setLevelThink(
		function() {
            // Play Ambient Noise
            if(!Game.getLevelVar("loaded") && !Game.getSound("space-ambient").isLoading){
                Game.getSound("space-ambient").play(0, true);
                Game.setLevelVar("loaded", true);
            }
        }
    );

    Game.setLevelCleanUp(function() { Game.getSound("space-ambient").stop(); });
	
	Game.createMotes();
	