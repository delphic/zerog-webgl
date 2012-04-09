		var onClick = ZeroG.Gremlin.Audio.load("sounds/buttonclick.wav");
		var onHover = ZeroG.Gremlin.Audio.load("sounds/buttonrollover.wav");
		var bgMusic = ZeroG.Gremlin.Audio.load("sounds/menu1.mp3", true);

		ZeroG.Gremlin.GUI.setOnClick(function(){ onClick.play(); });
		ZeroG.Gremlin.GUI.setOnHover(function(){ onHover.play(); });

		// Lighting
		ZeroG.Gremlin.Gizmo.setLightEnvironment(0.05,0.05,0.05,0.75,0.75,0.6,-1.0,0.0,0.0);
		ZeroG.Gremlin.Gizmo.setLightingFlags("lighting", true);
		ZeroG.Gremlin.Gizmo.setLightingFlags("specularLighting", false);

		// Game Objects
		ZeroG.Game.World.createObjectPrimitive({
			"position": [0, 0, -5000],
			"primType": "sphere",
			"textureName": "textures/earth.jpg",
			"scale": 500, 
			"longBands": 30,
			"latBands": 30,
			"animation": function(elapsed) { this.rotate( ( (5 * elapsed) / 1000.0), 0, 1, 0); }
		});
		ZeroG.Game.World.createObjectPrimitive({
			"position": [0, 0, 0],
			"primType": "sphere", 
			"textureName": "textures/huge_stars.png", 
			"scale": 10000, 
			"longBands": 30, 
			"latBands": 30, 
			"isSkyBox": true
		});

		bgMusic.setVolume(0.1);

		ZeroG.Game.World.setLevelThink(function(){
			if(!ZeroG.Game.World.getLevelVar("loaded") && !bgMusic.isLoading){
				bgMusic.play(0, true);
				ZeroG.Game.World.setLevelVar("loaded", true);
			}
		});

		ZeroG.Game.World.setLevelCleanUp(function() { bgMusic.stop(); });
