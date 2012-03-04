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
		var tmpShip = Game.createObjectPrimitive({
			"position": parameters.position, 
			"primType": "cube", 
			"textureName": "textures/crate.gif", 
			"scale": 1.0, 
			"animation": function(elapsed) { this.rotate( ( (75 * elapsed) / 1000.0), 1, 1, 1); }, 
			"stopPush": true
		});
		var color = parameters.color ? parameters.color : [1, 1, 1, 1];
		tmpShip.setColor(parameters.color[0], parameters.color[1], parameters.color[2], parameters.color[3]);

		// Create HUD elements
		var canvasSize = Game.getCanvasSize();
		var separation = vec3.create();
		vec3.subtract(parameters.position, Game.getPlayerPosition(), separation);
		var scaleFactor = 1/vec3.length(separation);
		tmpShip.aimAtIndex = Gremlin.HUD.createWireframe("Box",[0,0,0], [scaleFactor,scaleFactor], [1,0,0,1]);
		tmpShip.healthBar = Gremlin.HUD.createBar(
			[-0.95, 0],
			[0.1, 0.7],
			[0.1, 0.5, 0.1, 1],
			[0,0,0,0], 
			"Vertical");
		tmpShip.shieldBar = Gremlin.HUD.createBar(
			[0.95,0],
			[0.1,0.7],
			[0.1,0.1,0.5,1],
			[0,0,0,0], 
			"Vertical");
		tmpShip.targetBrace = Gremlin.HUD.createWireframe("Brace",[0,0,0], [0.9,0.9],[1,0,0,1]);
		tmpShip.infoContainer = Gremlin.HUD.createGroup([0,0,0],[0.25,0.25]);
		tmpShip.offScreenArrow = Gremlin.HUD.createElement([0,0,0], [0.02, 0.02], [1,1,1,1], "textures/arrow.png");
		Gremlin.HUD.attachElementToGroup(tmpShip.infoContainer, tmpShip.healthBar);
		Gremlin.HUD.attachElementToGroup(tmpShip.infoContainer, tmpShip.shieldBar);
		Gremlin.HUD.attachElementToGroup(tmpShip.infoContainer, tmpShip.targetBrace);

		// Attach Ship parameters
		var parameters = {};
		parameters.FiringPeriod = 600;
		Game.attachShip(tmpShip, parameters);

		// Attach AI
		ShipAI.attachAI(tmpShip);

		// Add to List
		var index = shipList.push(tmpShip)-1;

		// Update HUD Element size
		_updateHudElements(shipList[index]); // This prevents the HUD elements from taking up the entire screen for 1 frame on ship creation
	}
	function destroyShip(index) {
		Gremlin.HUD.hideElement(shipList[index].aimAtIndex);
		Gremlin.HUD.hideGroupElements(shipList[index].infoContainer);
		shipList.splice(index,1);
	}
	function destroyShips() {
		shipList.splice(0,shipList.length);
	}

	function updateShips(elapsed, playerPos, playerVel) {
		if(shipList.length > 0) {
			var shipListMax = shipList.length;
			for(var i = 0; i < shipListMax; i++) {	
				// Run AI - Argueably should be in separate function
				shipList[i].runAI(shipList[i], elapsed);

				shipList[i].update(elapsed);
				shipList[i].updateShip(elapsed);
				shipList[i].animate(elapsed); // Argueably should be in separate function
				_updateHudElements(shipList[i]);
			}
		}
		else {
			// No Ships .. possibly pass victory condition, really this should be dealt with by the level think function
			// Need to think about a way to couple that more strongly.
		}
	}
	function renderShips() {
		var gizmo = Gremlin.Gizmo;
		for(var i = 0; i < shipList.length; i++) {
			gizmo.renderObject(shipList[i]);
		}
	}

	function checkShipsCollision(position, velocity, mass, radius, dmg) {
		for(var i = 0; i < shipList.length; i++) {
			// TODO: Remove hardcoded ship radius - add radius method to gameobject (returns average scale)
			if(Gremlin.Collision.sphereToSphereIntersect(position, radius, shipList[i].position, 1)){
				shipList[i].takeDamageAi();
				if (shipList[i].takeDamage(velocity, mass, dmg))
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
	function _updateHudElements(ship) {

		var separation = vec3.create();
		vec3.subtract(ship.position, Game.getPlayerPosition(), separation);
		var projectileVelocity = vec3.create();

		// Update Aim at Element
		// Calculate required velocity to hit target
		if(Gremlin.Maths.calculateProjectileVelocity(separation, ship.velocity, Game.getPlayerProjectileSpeed(), projectileVelocity)) {
			// Remove Player Component, as it is removed from aiming calculation, arguably it shouldn't be
			vec3.subtract(projectileVelocity, Game.getPlayerVelocity());

			// Reverse Pick at z=-500 units in z-direction (this is currently hardcoded in aiming) along velocity vector.
			var aimAtPoint = vec3.create(projectileVelocity);
			vec3.normalize(aimAtPoint);
			var scaleFactor = - 500 / aimAtPoint[2];			
			if(aimAtPoint[2] > 0) {
				scaleFactor *= -1;
			}
			vec3.scale(aimAtPoint, scaleFactor);

			// Move to Global Coordinate System
			vec3.add(aimAtPoint, Game.getPlayerPosition());

			var coords = [0,0];
			var separation = vec3.create();
			vec3.subtract(ship.position, Game.getPlayerPosition(),separation);
			scaleFactor = 1/vec3.length(separation);

			if(Gremlin.Gizmo.reversePick(aimAtPoint[0],aimAtPoint[1],aimAtPoint[2], coords)) {
				Gremlin.HUD.updateElement(ship.aimAtIndex, [coords[0],coords[1],-1], [scaleFactor,scaleFactor]);
				if(Math.abs(coords[0]) < 1 && Math.abs(coords[1]) < 1) {
					Gremlin.HUD.showElement(ship.aimAtIndex);
					Gremlin.HUD.hideElement(ship.offScreenArrow);
				} else {
					Gremlin.HUD.showElement(ship.offScreenArrow);
					Gremlin.HUD.hideElement(ship.aimAtIndex);
				}
			}
			else {
				// Aim at position not in front of player
				Gremlin.HUD.hideElement(ship.aimAtIndex);
				Gremlin.HUD.showElement(ship.offScreenArrow);
			}
			_updateOffScreenArrow(ship, separation, scaleFactor);
		}
		else {
			// Player can not hit ship
			Gremlin.HUD.hideElement(ship.aimAtIndex);
		}

		// Update Elements Group Position
		var shipPosition = [0,0];
		if(Gremlin.Gizmo.reversePick(ship.position[0],ship.position[1],ship.position[2],shipPosition))
		{
			var groupScale = 5*scaleFactor;
			if(groupScale < 0.01) { groupScale = 0.01; } 
			Gremlin.HUD.showGroupElements(ship.infoContainer);
			Gremlin.HUD.setGroupPosition(ship.infoContainer, [shipPosition[0],shipPosition[1],0]);
			Gremlin.HUD.setGroupSize(ship.infoContainer, [groupScale,groupScale]);
		}
		else {
			Gremlin.HUD.hideGroupElements(ship.infoContainer);
		}

		// Update Health and Shield Bars
		Gremlin.HUD.updateHud({ 
			health: { index: ship.healthBar, value: (ship.healthPoints/ship.healthMax) },
			shield: { index: ship.shieldBar, value: (ship.shieldPoints/ship.shieldMax) }
		});
	}

	function _updateOffScreenArrow(ship, separation, scaleFactor) {
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
		Gremlin.HUD.updateElement(ship.offScreenArrow, [coords[0], coords[1], -1], [adjustedScaleFactor, adjustedScaleFactor], [0,0,rotationAngle]);

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