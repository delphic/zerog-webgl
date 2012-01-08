		var onClick = GremlinAudio.load("sounds/buttonclick.wav");
		var onHover = GremlinAudio.load("sounds/buttonrollover.wav");
		var bgMusic = GremlinAudio.load("sounds/menu1.mp3", true);

		GremlinGUI.setOnClick(function(){ onClick.play(); });
		GremlinGUI.setOnHover(function(){ onHover.play(); });

		// Lighting
		Gremlin.setLightEnvironment(0.05,0.05,0.05,0.75,0.75,0.6,-1.0,0.0,0.0);
		Gremlin.setLightingFlags("lighting", true);
		Gremlin.setLightingFlags("specularLighting", false);

		// Game Objects
		Game.createObjectPrimitive({
			"position": [0, 0, -5000],
			"primType": "sphere",
			"textureName": "textures/earth.jpg",
			"scale": 500, 
			"longBands": 30,
			"latBands": 30,
			"animation": function(elapsed) { this.rotate( ( (5 * elapsed) / 1000.0), 0, 1, 0); }
		});
		Game.createObjectPrimitive({
			"position": [0, 0, 0],
			"primType": "sphere", 
			"textureName": "textures/huge_stars.png", 
			"scale": 10000, 
			"longBands": 30, 
			"latBands": 30, 
			"isSkyBox": true
		});

		bgMusic.setVolume(0.1);

		Game.setLevelThink(function(){
			if(!Game.getLevelVar("loaded") && !bgMusic.isLoading){
				bgMusic.play(0, true);
				Game.setLevelVar("loaded", true);
			}
		});

		Game.setLevelCleanUp(function() { bgMusic.stop(); });
