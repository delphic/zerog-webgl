//   __ _     _                                                  
//  / _\ |__ (_)_ __     /\/\   __ _ _ __   __ _  __ _  ___ _ __ 
//  \ \| '_ \| | '_ \   /    \ / _` | '_ \ / _` |/ _` |/ _ \ '__|
//  _\ \ | | | | |_) | / /\/\ \ (_| | | | | (_| | (_| |  __/ |   
//  \__/_| |_|_| .__/  \/    \/\__,_|_| |_|\__,_|\__, |\___|_|   
//             |_|                               |___/         

// Enemy Ship Mananger
var ShipManager = function() {

	// Public
	var shipList = [];

	function numberOfShips() {
		return shipList.length;
	}

	function createShip(parameters) {
		// Check for required parameters
		if(!parameters.position) { 
			throw new Error("Missing required attribute for createShip: 'position'");
		}
		// They're all evil spinning crates for now!
		var gameObject = Game.World.createObjectPrimitive({
			"position": parameters.position, 
			"primType": "cube", 
			"textureName": "textures/crate.gif", 
			"scale": 1.0,
            "color":  parameters.color ? parameters.color : [1, 1, 1, 1],
			"animation": function(elapsed) { this.rotate( ( (75 * elapsed) / 1000.0), 1, 1, 1); }, 
			"stopPush": true
		});

		// Create HUD elements
        if (!gameObject.Hud) { gameObject.Hud = {}; }
        var separation = vec3.create();
		vec3.subtract(parameters.position, Game.Player.position(), separation);
		var scaleFactor = 1/vec3.length(separation);
		gameObject.Hud.aimAtIndex = Gremlin.HUD.createWireframe("Box",[0,0,0], [scaleFactor,scaleFactor], [1,0,0,1]);
		gameObject.Hud.healthBar = Gremlin.HUD.createBar(
			[-0.95, 0],
			[0.1, 0.7],
			[0.1, 0.5, 0.1, 1],
			[0,0,0,0], 
			"Vertical");
		gameObject.Hud.shieldBar = Gremlin.HUD.createBar(
			[0.95,0],
			[0.1,0.7],
			[0.1,0.1,0.5,1],
			[0,0,0,0], 
			"Vertical");
		gameObject.Hud.targetBrace = Gremlin.HUD.createWireframe("Brace",[0,0,0], [0.9,0.9],[1,0,0,1]);
		gameObject.Hud.infoContainer = Gremlin.HUD.createGroup([0,0,0],[0.25,0.25]);
		gameObject.Hud.offScreenArrow = Gremlin.HUD.createElement([0,0,0], [0.02, 0.02], [1,1,1,1], "textures/arrow.png");
		Gremlin.HUD.attachElementToGroup(gameObject.Hud.infoContainer, gameObject.Hud.healthBar);
		Gremlin.HUD.attachElementToGroup(gameObject.Hud.infoContainer, gameObject.Hud.shieldBar);
		Gremlin.HUD.attachElementToGroup(gameObject.Hud.infoContainer, gameObject.Hud.targetBrace);

		// Attach Ship parameters
		var _parameters = {};
		_parameters.FiringPeriod = 600;
        _parameters.color = parameters.color ? parameters.color : [1, 1, 1, 1],
        gameObject.attach(new Game.Components.Ship(_parameters));
		// Attach AI
		gameObject.attach(ShipAI.Create());

		// Add to List
		var index = shipList.push(gameObject)-1;

		// Update HUD Element size
		_updateHudElements(shipList[index]); // This prevents the HUD elements from taking up the entire screen for 1 frame on ship creation
	}
	function destroyShip(index) {
		Gremlin.HUD.hideElement(shipList[index].Hud.aimAtIndex);
		Gremlin.HUD.hideGroupElements(shipList[index].Hud.infoContainer);
		shipList.splice(index,1);
	}
	function destroyShips() {
		shipList.splice(0,shipList.length);
	}

	function updateShips(elapsed) {
		if(shipList.length > 0) {
			var shipListMax = shipList.length;
			for(var i = 0; i < shipListMax; i++) {	
				// Run AI - Arguably should be in separate function
				shipList[i].shipAi.runAI(elapsed);
				shipList[i].update(elapsed);
				shipList[i].ship.updateShip(elapsed);
				_updateHudElements(shipList[i]);
			}
		}
		else {
			// No Ships .. possibly pass victory condition, really this should be dealt with by the level think function
			// Need to think about a way to couple that more strongly.
		}
	}
	function renderShips() {
		for(var i = 0; i < shipList.length; i++) {
		    shipList[i].render();
		}
	}

	function checkShipsCollision(position, velocity, mass, radius, dmg) {
		for(var i = 0; i < shipList.length; i++) {
			// TODO: Remove hardcoded ship radius - add radius method to GameObject (returns average scale)
			if(Gremlin.Collision.sphereToSphereIntersect(position, radius, shipList[i].position, 1)){
				shipList[i].shipAi.takeDamageAi();
				if (shipList[i].ship.takeDamage(velocity, mass, dmg))
				{
					this.destroyShip(i);
					i--; 
					// Because we are removing an element from the array, 
					// the index needs to be decreased as next element now 
					// has the index of the element we just removed,
				}
				return true;
			}
		}
		return false;
	}

	// Private
	function _updateHudElements(gameObject) {
        var hud = gameObject.Hud;
		var separation = vec3.create();
		vec3.subtract(gameObject.position, Game.Player.position(), separation);
		var projectileVelocity = vec3.create();

		// Update Aim at Element
		// Calculate required velocity to hit target
		if(Gremlin.Maths.calculateProjectileVelocity(separation, gameObject.velocity, Game.Player.projectileSpeed(), projectileVelocity)) {
			// Remove Player Component, as it is removed from aiming calculation, arguably it shouldn't be
			vec3.subtract(projectileVelocity, Game.Player.velocity());

			// Reverse Pick at z=-500 units in z-direction (this is currently hardcoded in aiming) along velocity vector.
			var aimAtPoint = vec3.create(projectileVelocity);
			vec3.normalize(aimAtPoint);
			var scaleFactor = - 500 / aimAtPoint[2];			
			if(aimAtPoint[2] > 0) {
				scaleFactor *= -1;
			}
			vec3.scale(aimAtPoint, scaleFactor);

			// Move to Global Coordinate System
			vec3.add(aimAtPoint, Game.Player.position());

			var coords = [0,0];
			var separation = vec3.create();
			vec3.subtract(gameObject.position, Game.Player.position(),separation);
			scaleFactor = 1/vec3.length(separation);

			if(Gremlin.Gizmo.reversePick(aimAtPoint[0],aimAtPoint[1],aimAtPoint[2], coords)) {
				Gremlin.HUD.updateElement(hud.aimAtIndex, [coords[0],coords[1],-1], [scaleFactor,scaleFactor]);
				if(Math.abs(coords[0]) < 1 && Math.abs(coords[1]) < 1) {
					Gremlin.HUD.showElement(hud.aimAtIndex);
					Gremlin.HUD.hideElement(hud.offScreenArrow);
				} else {
					Gremlin.HUD.showElement(hud.offScreenArrow);
					Gremlin.HUD.hideElement(hud.aimAtIndex);
				}
			}
			else {
				// Aim at position not in front of player
				Gremlin.HUD.hideElement(hud.aimAtIndex);
				Gremlin.HUD.showElement(hud.offScreenArrow);
			}
			_updateOffScreenArrow(hud.offScreenArrow, separation, scaleFactor);
		}
		else {
			// Player can not hit ship
			Gremlin.HUD.hideElement(hud.aimAtIndex);
		}

		// Update Elements Group Position
		var shipPosition = [0,0];
		if(Gremlin.Gizmo.reversePick(gameObject.position[0],gameObject.position[1],gameObject.position[2],shipPosition))
		{
			var groupScale = 5*scaleFactor;
			if(groupScale < 0.01) { groupScale = 0.01; } 
			Gremlin.HUD.showGroupElements(hud.infoContainer);
			Gremlin.HUD.setGroupPosition(hud.infoContainer, [shipPosition[0],shipPosition[1],0]);
			Gremlin.HUD.setGroupSize(hud.infoContainer, [groupScale,groupScale]);
		}
		else {
			Gremlin.HUD.hideGroupElements(hud.infoContainer);
		}

		// Update Health and Shield Bars
		Gremlin.HUD.updateHud({ 
			health: { index: hud.healthBar, value: (gameObject.ship.healthPoints/gameObject.ship.healthMax) },
			shield: { index: hud.shieldBar, value: (gameObject.ship.shieldPoints/gameObject.ship.shieldMax) }
		});
	}

	function _updateOffScreenArrow(hudIndex, separation, scaleFactor) {
		var screenHeight, screenWidth, x, y, offset, adjustedScaleFactor,rotationAngle;
		var coords = [];
		offset = 32;
		screenWidth = Game.getCanvasSize()[0];
		screenHeight = Game.getCanvasSize()[1];
		var transformedSeparation = vec3.create(separation);
		Gremlin.Gizmo.playerCameraRotation(transformedSeparation);
		x = transformedSeparation[0];
		y = transformedSeparation[1];
		if(Math.abs(x)*(screenHeight/(2*Math.abs(y))) > screenWidth/2 ) {
			coords[0] = (x>0) ? screenWidth-offset : offset;
			coords[1] = ((screenWidth-offset)/(2*Math.abs(x)))*y + screenHeight/2;
		} else {
			coords[0] = ((screenHeight-offset)/(2*Math.abs(y)))*x + screenWidth/2;
			coords[1] = (y>0) ? screenHeight-offset : offset;
		}
		rotationAngle = -Math.asin(x/Math.sqrt(x*x+y*y))*180/Math.PI;
		if(y<0) { rotationAngle = 180 - rotationAngle; }
		coords = Gremlin.HUD.transformToHudCoords(coords);
		adjustedScaleFactor = scaleFactor + 0.01; // This may need a fudge factor depending on size of texture.
		Gremlin.HUD.updateElement(hudIndex, [coords[0], coords[1], -1], [adjustedScaleFactor, adjustedScaleFactor], [0,0,rotationAngle]);

	}

	return {
		createShip:				createShip,
		destroyShip:			destroyShip,
		destroyShips:			destroyShips,
		updateShips:			updateShips,
		renderShips:			renderShips,
		numberOfShips:			numberOfShips,
		checkShipsCollision:	checkShipsCollision
	}
}();