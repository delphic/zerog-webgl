	// Player HUD
    ZeroG.Game.Player.createHud();

	// Lighting
	ZeroG.Gremlin.Gizmo.setLightEnvironment(0.3,0.3,0.3,0,0,0,0.0,0.0,0.0);
	ZeroG.Gremlin.Gizmo.setLightingFlags("lighting", true);
	ZeroG.Gremlin.Gizmo.setLightingFlags("specularLighting", true);
	
	// Attributes: position, primType, textureName, scale, latBands, longBands, animation, shininess, isSkyBox, stopPush
	ZeroG.Game.World.createObjectPrimitive({
		"position": [0, 0, 0],
		"primType": "sphere", 
		"textureName": "textures/huge_stars.png",
		"scale": 10000, 
		"latBands": 30, 
		"longBands": 30, 
		"isSkyBox": true	
	});
	
	ZeroG.Game.World.setLevelThink(
		function() {
            // Play Ambient Noise
            if(!ZeroG.Game.World.getLevelVar("loaded") && !ZeroG.Game.World.getSound("space-ambient").isLoading){
                ZeroG.Game.World.getSound("space-ambient").play(0, true);
                ZeroG.Game.World.setLevelVar("loaded", true);
            }

			// Spawning New Waves
			// Check wave one spawned
			if(!ZeroG.Game.World.getLevelVar("WaveOneSpawned"))	{
				ZeroG.Game.World.setLevelVar("WaveOneSpawned", true);
				// Spawn first wave of enemies at + view dir
				ZeroG.ShipManager.createShip({
					"position": [0, 0, -40],
					"color": [0, 2, 0, 1]
				});
			}
			else if (!ZeroG.Game.World.getLevelVar("WaveTwoTriggered") && ZeroG.Game.World.getLevelVar("WaveOneDestroyed")) {
				ZeroG.Game.World.setLevelVar("WaveTwoTriggered",true);
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
						ZeroG.Game.World.setLevelVar("WaveTwoSpawned", true);
					}, 
					5000);
                ZeroG.Game.World.setLevelVar("Queue", queue);
			}
			
			// Checking on Old Waves and updating
			// If wave one spawned
			if(ZeroG.Game.World.getLevelVar("WaveOneSpawned"))
			{
				// Number of Ships
				if(ZeroG.ShipManager.numberOfShips() < 1)
				{
					// Set Wave One destroyed var
					ZeroG.Game.World.setLevelVar("WaveOneDestroyed", true);
				}
				// Else carry on
			}
			if(ZeroG.Game.World.getLevelVar("WaveTwoSpawned"))
			{
				if(ZeroG.ShipManager.numberOfShips() < 1)
				{
					// You Win!
					ZeroG.Gremlin.GUI.endGame("<h1 style='colour=purple'>You Win</h1><p>Congratulations!</p>");
				}
			}
		}
	);

    ZeroG.Game.World.setLevelCleanUp(function() {
        clearTimeout(ZeroG.Game.World.getLevelVar("Queue"));
        ZeroG.Game.World.getSound("space-ambient").stop();
    });
	
	ZeroG.Game.World.createMotes();
	