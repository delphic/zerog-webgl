	// Player HUD
    Game.createPlayerHud();

	// Lighting
	Gremlin.setLightEnvironment(0.3,0.3,0.3,0,0,0,0.0,0.0,0.0);
	Gremlin.setLightingFlags("lighting", true);
	Gremlin.setLightingFlags("specularLighting", true);
	
	// Attributes: position, primType, textureName, scale, latBands, longBands, animation, shininess, isSkyBox, stopPush
	Game.createObjectPrimitive({
		"position": [0, 0, 0],
		"primType": "sphere", 
		"textureName": "textures/huge_stars.png",
		"scale": 10000, 
		"latBands": 30, 
		"longBands": 30, 
		"isSkyBox": true	
	});
	
	Game.setLevelThink(
		function() {
            // Play Ambient Noise
            if(!Game.getLevelVar("loaded") && !Game.getSound("space-ambient").isLoading){
                Game.getSound("space-ambient").play(0, true);
                Game.setLevelVar("loaded", true);
            }

			// Spawning New Waves
			// Check wave one spawned
			if(!Game.getLevelVar("WaveOneSpawned"))	{
				Game.setLevelVar("WaveOneSpawned", true);
				// Spawn first wave of enemies at + view dir
				ShipManager.createShip({
					"position": [0, 0, -40],
					"color": [0, 2, 0, 1]
				});
			}
			else if (!Game.getLevelVar("WaveTwoTriggered") && Game.getLevelVar("WaveOneDestroyed")) {
				Game.setLevelVar("WaveTwoTriggered",true);
				// Spawn Second Wave with 5 second delay
				var queue = setTimeout(
					function() {
						ShipManager.createShip({
							"position": [-10, 0, -40],
							"color": [0, 2, 0, 1]
						});
						ShipManager.createShip({
							"position": [0, 0, -40],
							"color": [0, 2, 0, 1]
						});
						ShipManager.createShip({
							"position": [10, 0, -40],
							"color": [0, 2, 0, 1]
						});
						Game.setLevelVar("WaveTwoSpawned", true);						
					}, 
					5000);
                Game.setLevelVar("Queue", queue);
			}
			
			// Checking on Old Waves and updating
			// If wave one spawned
			if(Game.getLevelVar("WaveOneSpawned"))
			{
				// Number of Ships
				if(ShipManager.numberOfShips() < 1)
				{
					// Set Wave One destroyed var
					Game.setLevelVar("WaveOneDestroyed", true);
				}
				// Else carry on
			}
			if(Game.getLevelVar("WaveTwoSpawned"))
			{
				if(ShipManager.numberOfShips() < 1)
				{
					// You Win!
					GremlinGUI.endGame("<h1 style='colour=purple'>You Win</h1><p>Congratulations!</p>"); 
				}
			}
		}
	);

    Game.setLevelCleanUp(function() {
        clearTimeout(Game.getLevelVar("Queue"));
        Game.getSound("space-ambient").stop();
    });
	
	Game.createMotes();
	