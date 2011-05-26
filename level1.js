		// Lighting
		Gremlin.setLightEnvironment(0.4,0.4,0.4,0.4,0.4,0.4,-1.0,0.0,0.0);
		Gremlin.setLighting(true);
		
		Gremlin.addPointLight(0,0,-6.0,0.0,2.0,0);
		Gremlin.addPointLight(0,0,-5.5,6.0,2.0,0);

		Gremlin.addSpotLight(0,0,0,-0.15,0,-1,1,0,1,5,8,2.0);
		Gremlin.addSpotLight(0,0,-1,0,0,-1,5,1,1,20,45,2.0);
		
		// Game Objects
		var cube = new gameObject(-1.5,0,-8.0);
		var sphere = new gameObject(1.5, 0, -8.0);
		var teapot = new gameObject(0,0,-5);
		
		Gremlin.createPrimitive(cube, "cube", false, true, 1.0, 0, 0);
		Gremlin.createPrimitive(sphere, "sphere", false, true, 1.5, 30, 30);
		Gremlin.loadModel(teapot, "Teapot.json", 0.1);
		
		gameObjects["cube"] = cube;
		gameObjects["sphere"] = sphere;
		gameObjects["teapot"] = teapot;
		
		// TODO: Move to texture and handle event to Texture List in Engine, store index in gameobject
		// TODO: Move Texture Filtering to engine globals
		gameObjects.cube.texture = Gremlin.createTexture("textures/crate.gif");
		gameObjects.cube.texture.image.onload = function() { Gremlin.handleLoadedTexture(gameObjects.cube.texture, 3); } 
		
		gameObjects.sphere.texture = Gremlin.createTexture("textures/earth.jpg");
		gameObjects.sphere.texture.image.onload = function() { Gremlin.handleLoadedTexture(gameObjects.sphere.texture, 3); }
		
		gameObjects.teapot.texture = Gremlin.createTexture("textures/metal.jpg");
		gameObjects.teapot.texture.image.onload = function() { Gremlin.handleLoadedTexture(gameObjects.teapot.texture, 3); }
		
		//gameObjects.cube.animate = function(elapsed) { this.rotate( ( (75 * elapsed) / 1000.0), 1, 1, 1); };
		//gameObjects.sphere.animate = function(elapsed) { this.rotate( ( (-50 * elapsed) / 1000.0), 0, 1, 0); };
		gameObjects.teapot.animate = function(elapsed) { this.rotate( ( (30 * elapsed) / 1000.0), 0,1,0); };
		
		gameObjects.teapot.setShininess(100);