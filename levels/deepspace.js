	// Lighting
	Gremlin.setLightEnvironment(0.3,0.3,0.3,0,0,0,0.0,0.0,0.0);
	Gremlin.setLightingFlags("lighting", true);
	Gremlin.setLightingFlags("specularLighting", true);
	
	//Gremlin.addPointLight(0,0,-6.0,0.0,2.0,0);
	//Gremlin.addPointLight(0,0,-5.5,6.0,2.0,0);

	//Gremlin.addSpotLight(0,0,0,-0.15,0,-1,1,0,1,5,8,2.0);
	//Gremlin.addSpotLight(0,0,-1,0,0,-1,5,1,1,20,45,2.0);
		
	// Game Objects
	//Game.createObjectPrimitive([-3,0,-6], "cube", "textures/crate.gif", 1.0, 0, 0, function(elapsed) { this.rotate( ( (75 * elapsed) / 1000.0), 1, 1, 1); });
	//Game.createObjectPrimitive([0, 0, -5000], "sphere", "textures/earth.jpg", 500, 30, 30, function(elapsed) { this.rotate( ( (5 * elapsed) / 1000.0), 0, 1, 0); });
	Game.createObjectPrimitive([0, 0, 0], "sphere", "textures/huge_stars.png", 10000, 30, 30, false, 0, true);
	
	//Game.createObjectModel([0,0,-5], "Teapot.json", "textures/metal.jpg", 0.1, function(elapsed) { this.rotate( ( (30 * elapsed) / 1000.0), 0,1,0); }, 100);
	
	Game.setLevelThink(
		function() {
			// Spawning New Waves
			// Check wave one spawned
			if(!Game.getLevelVar("WaveOneSpawned"))	{
				Game.setLevelVar("WaveOneSpawned", true);
				// Spawn first wave of enemies at + view dir
				ShipManager.createShip([0,0,-40],[0,2.0,0,1.0]);
			}
			else if (!Game.getLevelVar("WaveTwoTriggered") && Game.getLevelVar("WaveOneDestroyed")) {
				Game.setLevelVar("WaveTwoTriggered",true);
				// Spawn Second Wave with 5 second delay
				setTimeout(
					function() {
						ShipManager.createShip([-10,0,-40],[0,1.0,0,1.0]);
						ShipManager.createShip([0,0,-40],[0,1.0,0,1.0]);
						ShipManager.createShip([10,0,-40],[0,1.0,0,1.0]);
						Game.setLevelVar("WaveTwoSpawned", true);						
					}, 
					5000); // This can unfortunately spawn ships when your in the main menu! TODO: Need a queuing system.
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
					setTimeout(
						function() {
							GremlinGUI.endGame("<h1 style='colour=purple'>You Win</h1><p>Congratulations! More content coming soon I promise!</p>")
						},
						2000);
				}
			}
		}
	);
	
	Game.createMotes();
	