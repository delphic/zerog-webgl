		// Lighting
		Gremlin.setLightEnvironment(0.01,0.01,0.01,0.75,0.75,0.6,-1.0,0.0,0.0);
		Gremlin.setLightingFlags("lighting", true);
		Gremlin.setLightingFlags("specularLighting", true);
		
		//Gremlin.addPointLight(0,0,-6.0,0.0,2.0,0);
		//Gremlin.addPointLight(0,0,-5.5,6.0,2.0,0);

		//Gremlin.addSpotLight(0,0,0,-0.15,0,-1,1,0,1,5,8,2.0);
		//Gremlin.addSpotLight(0,0,-1,0,0,-1,5,1,1,20,45,2.0);
		
		// Game Objects
		//Game.createObjectPrimitive([-3,0,-6], "cube", "textures/crate.gif", 1.0, 0, 0, function(elapsed) { this.rotate( ( (75 * elapsed) / 1000.0), 1, 1, 1); });
		Game.createObjectPrimitive([0, 0, -5000], "sphere", "textures/earth.jpg", 500, 30, 30, function(elapsed) { this.rotate( ( (5 * elapsed) / 1000.0), 0, 1, 0); });
		Game.createObjectPrimitive([0, 0, 0], "sphere", "textures/huge_stars.png", 10000, 30, 30, false, 0, true);
		
		//Game.createObjectModel([0,0,-5], "Teapot.json", "textures/metal.jpg", 0.1, function(elapsed) { this.rotate( ( (30 * elapsed) / 1000.0), 0,1,0); }, 100);