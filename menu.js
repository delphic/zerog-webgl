		// Lighting
		Gremlin.setLightEnvironment(0.05,0.05,0.05,0.75,0.75,0.6,-1.0,0.0,0.0);
		Gremlin.setLightingFlags("lighting", true);
		Gremlin.setLightingFlags("specularLighting", false);
				
		// Game Objects
		Game.createObjectPrimitive([0, 0, -5000], "sphere", "textures/earth.jpg", 500, 30, 30, function(elapsed) { this.rotate( ( (5 * elapsed) / 1000.0), 0, 1, 0); });
		Game.createObjectPrimitive([0, 0, 0], "sphere", "textures/huge_stars.png", 10000, 30, 30, false, 0, true);