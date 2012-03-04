	// Player HUD
    ZeroG.Game.createPlayerHud();

	// Lighting
	ZeroG.Gremlin.Gizmo.setLightEnvironment(0.3,0.3,0.3,0,0,0,0.0,0.0,0.0);
	ZeroG.Gremlin.Gizmo.setLightingFlags("lighting", true);
	ZeroG.Gremlin.Gizmo.setLightingFlags("specularLighting", true);
	
	// Attributes: position, primType, textureName, scale, latBands, longBands, animation, shininess, isSkyBox, stopPush
	ZeroG.Game.createObjectPrimitive({
		"position": [0, 0, 0],
		"primType": "sphere", 
		"textureName": "textures/huge_stars.png",
		"scale": 10000, 
		"latBands": 30, 
		"longBands": 30, 
		"isSkyBox": true	
	});
	
	ZeroG.Game.setLevelThink(
		function() {
            // Play Ambient Noise
            if(!ZeroG.Game.getLevelVar("loaded") && !ZeroG.Game.getSound("space-ambient").isLoading){
                ZeroG.Game.getSound("space-ambient").play(0, true);
                ZeroG.Game.setLevelVar("loaded", true);
            }

			// Spawning New Waves
			// Check wave one spawned
			if(!ZeroG.Game.getLevelVar("WaveOneSpawned"))	{
				ZeroG.Game.setLevelVar("WaveOneSpawned", true);
				// Spawn first wave of enemies at + view dir
				ZeroG.ShipManager.createShip({
					"position": [0, 0, -40],
					"color": [0, 2, 0, 1]
				});
			}
			else if (!ZeroG.Game.getLevelVar("WaveTwoTriggered") && ZeroG.Game.getLevelVar("WaveOneDestroyed")) {
				ZeroG.Game.setLevelVar("WaveTwoTriggered",true);
				// Spawn Second Wave with 5 second delay
				var queue = setTimeout(
					function() {
						ZeroG.ShipManager.createShip({
							"position": [-10, 0, -40],
							"color": [0, 2, 0, 1]
						});
						ZeroG.ShipManager.createShip({
							"position": [0, 0, -40],
							"color": [0, 2, 0, 1]
						});
						ZeroG.ShipManager.createShip({
							"position": [10, 0, -40],
							"color": [0, 2, 0, 1]
						});
						ZeroG.Game.setLevelVar("WaveTwoSpawned", true);
					}, 
					5000);
                ZeroG.Game.setLevelVar("Queue", queue);
			}
			
			// Checking on Old Waves and updating
			// If wave one spawned
			if(ZeroG.Game.getLevelVar("WaveOneSpawned"))
			{
				// Number of Ships
				if(ZeroG.ShipManager.numberOfShips() < 1)
				{
					// Set Wave One destroyed var
					ZeroG.Game.setLevelVar("WaveOneDestroyed", true);
				}
				// Else carry on
			}
			if(ZeroG.Game.getLevelVar("WaveTwoSpawned"))
			{
				if(ZeroG.ShipManager.numberOfShips() < 1)
				{
					// You Win!
					ZeroG.Gremlin.GUI.endGame("<h1 style='colour=purple'>You Win</h1><p>Congratulations!</p>");
				}
			}
		}
	);

    ZeroG.Game.setLevelCleanUp(function() {
        clearTimeout(ZeroG.Game.getLevelVar("Queue"));
        ZeroG.Game.getSound("space-ambient").stop();
    });
	
	ZeroG.Game.createMotes();
	