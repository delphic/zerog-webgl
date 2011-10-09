	// Alone in space, except for a teapot
	
	// Lighting
	Gremlin.setLightEnvironment(0.05,0.05,0.05,0.75,0.75,0.6,-1.0,0.0,0.0);
	Gremlin.setLightingFlags("lighting", true);
		
	// Game Objects
	// Attributes: position, primType, textureName, scale, latBands, longBands, animation, shininess, isSkyBox, stopPush
	Game.createObjectPrimitive({
		"position": [0, 0, -5000],
		"primType": "sphere", 
		"textureName": "textures/earth.jpg",
		"scale": 500,
		"latBands": 30,
		"longBands": 30, 
		"animation": function(elapsed) { this.rotate( ( (5 * elapsed) / 1000.0), 0, 1, 0); }
	});
	Game.createObjectPrimitive({
		"position": [0, 0, 0],
		"primType": "sphere", 
		"textureName": "textures/huge_stars.png", 
		"scale": 10000, 
		"latBands": 30, 
		"longBands": 30, 
		"isSkyBox": true
	});
	
	// Attributes: position, modelName, textureName, scale, animation, shininess
	Game.createObjectModel({
		"position": [0, 0, -300],
		"modelName": "Teapot.json", 
		"textureName": "textures/metal.jpg",
		"scale": 0.1, 
		"animation": function(elapsed) { this.rotate( ( (30 * elapsed) / 1000.0), 0,1,0); }, 
		"shininess": 100
	});
	
	Game.createMotes();
	