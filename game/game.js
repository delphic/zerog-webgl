//////////////////////////
// TODO: Add ASCI Title //
//////////////////////////

function _Game() {
	// TODO: Change naming to public / private functions...
	// TODO: Extract all things that should be in their own namespace (e.g. projectiles, gameobjects etc)
	// TODO: add /** comments to functions to make their use clearer. 
	
	var canvas;
	var	resolutionScale;
	var lastTime = 0;
	var gameState;
	
	var loadingTargetState;
	var assetsLoading = false; // for quick and dirty loading system - asset counter in the engine.
	function setLoading(val) {
		assetsLoadings = val;
	}

	// Game State Functions
	function updateGameState(val) {
		gameState = val;
	}
	
    function animate() {
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
            var elapsed = timeNow - lastTime;
			
			// Animate Objects
			for(object in gameObjects)
			{
				gameObjects[object].animate(elapsed);
				gameObjects[object].update(elapsed);
			}
			
			if(gameState == "InGame") {
				// TODO: Collision Checks and AI (should possibly be run every X frames)
				// Check for projectile - ship collision
				for(var i = 0; i < projectiles.length; i++){
					// Check enemy ships
					if (ShipManager.checkShipsCollision(projectiles[i].position, 0.03, projectiles[i].dmg)){
						// TODO: remove hardcoded radius
						// Remove Projectile
						removeProjectile(i);
					}
					// TODO: Check player
				}
				
				// TODO: this should possibly also run every X frames.
				levelThink();
				
				// Update Player ship
				player.updateShip(elapsed);	
			
				// Update Enemy ships
				ShipManager.updateShips(elapsed);
				
				// Handle Game Input
				// BUG: Keys get 'stuck down'
				var width = parseInt(canvas.style.width, 10);
				var height = parseInt(canvas.style.height, 10);
				var mousePos, lmbDown, rmbDown;
				mousePos = GremlinInput.getMousePos();
				lmbDown = GremlinInput.mouseDown(0);
				rmbDown = GremlinInput.mouseDown(2);
				
				var dyaw, dpitch, droll, dx, dz;
				dyaw = 0.05 * elapsed * ((width*0.5)-mousePos[0])/(0.5*width);
				dpitch = 0.05 * elapsed * ((height*0.5)-mousePos[1])/(0.5*height);
				droll = 0;
				if (GremlinInput.keyDown("q")) { droll += 0.1 * elapsed; }
				if (GremlinInput.keyDown("e")) { droll -= 0.1 * elapsed; }
				if (rmbDown) Gremlin.rotatePlayerCamera(dyaw, dpitch, droll);
				else if (GremlinInput.keyDown("q") || GremlinInput.keyDown("e")) { Gremlin.rotatePlayerCamera(0, 0, droll); }

				var accelRate = player.accelerationRate(elapsed);
				dx = 0;
				dz = 0;

				if (GremlinInput.keyDown("Left") || GremlinInput.keyDown("a")) {
					// Strafe Left
					dx -= accelRate;
				} 
				else if (GremlinInput.keyDown("Right") || GremlinInput.keyDown("d")) {
					// Strafe Right
					dx += accelRate;
				}

				if (GremlinInput.keyDown("Up") || GremlinInput.keyDown("w")) {
					// Move Forward
					dz -= accelRate;
				} 
				else if (GremlinInput.keyDown("Down") || GremlinInput.keyDown("s")) {
					// Move Backward
					dz += accelRate;
				}
				
				if(dx && dz) { // Clamp Diagonal Speed
					dx /= 1.41421;
					dz /= 1.41421;
				}
			
				var dvelocity = [(0.01*dx/player.mass), 0, (0.01*dz/player.mass) ];
				Gremlin.playerCameraReverseRotation(dvelocity);
				
				if (accelRate > 0 && (dx != 0 || dz != 0)) {
					player.updateVelocity(dvelocity[0], dvelocity[1], dvelocity[2]);
					player.accelerate(elapsed);
				}
				
				player.update(elapsed);
				
				Gremlin.setPlayerCamera(player.position[0],player.position[1],player.position[2]);
				
				// Pew Pew
				if(lmbDown) {
					if (player.canFire()) {
						var pos = [0,0,0];
						Gremlin.playerCameraPos(pos); // Note setting equal to player.position cause updating the camera as well as the projectiles! TODO: put player in an object / namespace rather than store as an array to remove this temptation!
						// TODO: Also this needs to be turret attach point rather than camera position
						var aimtAt = [0,0,0];
						aimAt = Gremlin.pickPosition(mousePos[0], mousePos[1], 500); // TODO: 500 should be replaced by distance to target
						var v = [0,0,0]; 
						vec3.subtract(aimAt, pos, v);
						vec3.normalize(v);
						vec3.scale(v,1);
						vec3.add(v,player.velocity);
						
						var newproj = new projectile(pos, v, 30, 30000, true);

						projectiles.push(newproj);
						player.fire();
					}
				}
				
				if (GremlinInput.keyDown("Esc")) {
					updateGameState("InMenu");
					pause();
					GremlinGUI.pause();
				}
			
			
				// Update HUD
				GremlinHUD.setHudValues((player.healthPoints/player.healthMax)*100, (player.shieldPoints/player.shieldMax)*100, (player.fuelPoints/player.fuelMax)*100, (player.energyPoints/player.energyMax)*100);
				
				// Update Motes
				updateMotes(player.position, player.velocity); //TODO: Needs to take elapsed in order to be indepedant of frame rate - make this a method retrieving velocity from player gameobject
				
				// Update Projectiles
				projectileObject.animate(elapsed);
				for(var i = 0; i < projectiles.length; i++) {
					// Update Lifetime
					projectiles[i].lifetime -= elapsed;
					// Despawn if lifetime has expired
					if (projectiles[i].lifetime < 0) {
						projectiles.splice(i,1); // TODO: Use remove function
					}
					else {
						// Update Position
						projectiles[i].updatePosition(); 
					}
				}
			}
			
        }
        lastTime = timeNow;
    }

    function tick() {
        if(controller.isRunning()) { requestAnimFrame(tick); }
		
		if(gameState == "Loading") {
			// Wait for all assets to load
			if(assetsLoading) return;
			else gameState = loadingTargetState;
		}
		
		// Show / Hide HUD
		if(gameState == "InGame") { GremlinHUD.showHud(); }
		else { GremlinHUD.hideHud(); }
		
		// Render Scene
		Gremlin.prepareScene();
		for(object in gameObjects)
		{
			if(gameObjects[object].visible) {
				Gremlin.renderObject(gameObjects[object]);
			}
		}
		for(var i = 0; i < dustMotes.length; i++)
		{
			// Note: Not an efficient method of rendering particles...
			// We can get away with this because it's only ~100 objects
			Gremlin.renderObject(dustMotes[i]);
		}
		for(var n = 0; n < projectiles.length; n++)
		{
			var position = [0,0,0];
			position = projectiles[n].getPosition();
			projectileObject.setPosition(position[0], position[1], position[2]);
			Gremlin.renderObject(projectileObject);
		}
		ShipManager.renderShips();
		
		// Animate Scene
        animate();
    }

	// Game Objects
	var gameObjects = [];
	var gamePointLights = [];
	var gameSpotLights = [];
	
	// Game Object Obj
	function gameObject(position) { 
		this.position = [position[0],position[1],position[2]]; 
		this.velocity = [0,0,0]; 
		
		this.rotation = mat4.create();
		mat4.identity(this.rotation);
		
		this.buffers = [];
		this.scale = [1, 1, 1];
		// TODO: Proper Material System?
		// TODO: Make into array for multiple texture IDs
		this.texture;
		this.color = [1.0,1.0,1.0,1.0];
		this.setColor = setColor;
		this.useLighting = true;
		this.setUseLighting = setUseLighting;
		this.shininess = 0;
		this.setShininess = setShininess;
		
		this.isSkyBox = false;
		this.setIsSkyBox = setIsSkyBox;
		
		this.move = move;
		this.setPosition = setPosition;
		this.setVelocity = setVelocity;
		this.updateVelocity = updateVelocity;
		this.update = update;
		
		this.rotate = rotate;
		this.setRotation = setRotation;
		this.setScale = setScale;
		this.animate = defaultAnimation;
		this.assignBuffer = assignBuffer;

		// Render Flags
		// Consider: Moving to Renderer except visible
		this.visible = true;
		this.wireframe = false;
		this.points = false; // TODO: Combine this and wireframe into a render type (triangles / lines / points etc)
		this.useIndices = false;
		this.useTextures = false;
		
		function setPosition(x,y,z) {
			this.position = [x,y,z];
		}
		function move(dx, dy, dz) {
			this.position[0] += dx;
			this.position[1] += dy;
			this.position[2] += dz;
		}
		function setVelocity(vx,vy,vz) {
			this.velocity = [vx,vy,vz];
		}
		function updateVelocity(dvx,dvy,dvz) {
			this.velocity[0] += dvx;
			this.velocity[1] += dvy;
			this.velocity[2] += dvz;
		}
		function update(elapsed) {
			this.position[0] += this.velocity[0]*elapsed;
			this.position[1] += this.velocity[1]*elapsed;
			this.position[2] += this.velocity[2]*elapsed;
		}
		
		function rotate(amount, X, Y, Z) {
			mat4.rotate(this.rotation, Gremlin.degToRad(amount), [X, Y, Z]);
		}
		function setRotation(yaw, pitch, roll) {
			mat4.identity(this.rotation);
			mat4.rotate(this.rotation, Gremlin.degToRad(yaw), [0,1,0]);
			mat4.rotate(this.rotation, Gremlin.degToRad(pitch), [1,0,0]);
			mat4.rotate(this.rotation, Gremlin.degToRad(roll), [0,0,0]);
		}
		function setScale(x,y,z) { this.scale = [x,y,z]; }
		function setColor(r,g,b,a) { this.color = [r,g,b,a]; }
		function setUseLighting(val) { this.useLighting = val; }
		function setShininess(val) { this.shininess = val; }
		
		function setIsSkyBox(val) { this.isSkyBox = val; if(this.isSkyBox) this.useLighting = false; } 
		
		function defaultAnimation() { /* Blank */ }
		function assignBuffer(index) {
			this.buffers = index;
		}
	}
	
	// Creation Objection
	// TODO: Refactor to take an object as an argument, then the names of the object will be a guide on required arguments
	function createObjectPrimitive(position, primType, textureName, scale, latBands, longBands, animation, shininess, isSkyBox, stopPush) {
		var object = new gameObject(position);
		var textured;
		if (textureName) { 
			textured = true;
		}
		else {
			textured = false;
		}
		if(scale.length) {
			object.setScale(scale);
		}
		else {
			object.setScale(scale,scale,scale);
		}
		switch(primType) {
		case "pyramid":
			Gremlin.createPyramid(object, textured);
			break;
		case "cube": 
			Gremlin.createCube(object, textured);
			break;
		case "sphere":
			Gremlin.createSphere(object, textured, latBands, longBands);
			break;
		case "ray":
			Gremlin.createRay(object);
			break;
		case "point":
			Gremlin.createPoint(object);
			break;
		default:
			alert("Invalid Prim Type: "+primType+"");
			return;
		}
		if(textured) {
			object.texture = Gremlin.createTexture(textureName);
		}
		if(shininess) {
			object.setShininess(shininess);
		}
		if(isSkyBox) {
			object.setIsSkyBox(true);
		}
		if(animation) {
			object.animate = animation;
		}
		if(!stopPush)
		{
			gameObjects.push(object);
		}
		return object;
		
	}

	function createObjectModel(position, modelName, textureName, scale, animation, shininess) {
		var object = new gameObject(position);
		var textured;
		if (textureName) { 
			textured = true;
		}
		else {
			textured = false;
		}
		if(scale.length) {
			object.setScale(scale);
		}
		else {
			object.setScale(scale,scale,scale);
		}
		Gremlin.loadModel(object, modelName);
		if(textured) {
			object.texture = Gremlin.createTexture(textureName);
		}
		if(shininess) {
			object.setShininess(shininess);
		}
		if(animation) {
			object.animate = animation;
		}
		gameObjects.push(object);
	}
	// Game Init
	function gameInit() {
		assetsLoading = false;
		
		// TODO: Player Init
		
		// TODO: Projectile Init
		// Create Projectiles
		Gremlin.createTetrahedron(projectileObject, false);		// TODO: Tumbling Tetrahedron would be better
		projectileObject.setScale(0.03,0.03,0.03);
		projectileObject.animate = function(elapsed) { this.rotate( ( (300 * elapsed) / 1000.0), 1, 1, 1); }
		
		loadLevel("menu.js", "InMenu");
	}

	// Player / Ships
	function attachShip(object) {
		object.mass = 10;
		object.shieldMax = 100;
		object.shieldPoints = 100;
		object.shieldRegen = 0.0025;
		object.fuelMax = 100;
		object.fuelPoints = 100;
		object.fuelRegen = 0.0075;
		object.healthMax = 100;
		object.healthPoints = 100;
		object.energyMax = 100;
		object.energyPoints = 100;
		object.energyRegen = 0.01;
		object.firingPeriod = 300;
		object.firingTimer = 300;
		object.firingCost = 5;
		object.fuelFactor = 5;
		object.canFire = function() { 
			if(this.firingTimer > this.firingPeriod && (this.energyPoints > this.firingCost)) { 
				return true; 
			} 
			else {			
				return false; 
			}
		}
		object.fire = function() { 
			if(this.canFire()) { 
				if (this.energyPoints > 0.8*this.energyMax) {
					this.firingTimer = 0.2*this.firingPeriod; // 20% increase in firing rate when energy is over 80%
				}
				else {
					this.firingTimer = 0; 
				}
				this.energyPoints -= this.firingCost;
			}
		}
		object.updateShip = function(elapsed) {
			this.shieldPoints += elapsed*this.shieldRegen; if(this.shieldPoints>this.shieldMax) this.shieldPoints = this.shieldMax;
			this.fuelPoints += elapsed*this.fuelRegen; if(this.fuelPoints>this.fuelMax) this.fuelPoints = this.fuelMax;
			this.energyPoints += elapsed*this.energyRegen; if(this.energyPoints>this.energyMax) this.energyPoints = this.energyMax;
			this.firingTimer += elapsed;
		}
		object.accelerationRate = function(elapsed) {
			var accelerationAmount = 0.03 * elapsed;
			if(this.fuelPoints > 0.8*this.fuelMax) {
				accelerationAmount*=1.2; // 20% increase in acceleration rate when fuel is over 80%
			}
			else if (this.fueldPoints < 0.2*this.fuelMax) {
				accelerationAmount*=0.8;
			}
			accelerationAmount/=this.mass
			// This check should not be here
			if (this.fuelFactor*accelerationAmount > this.fuelPoints) return 0;
			
			return accelerationAmount;
		}
		object.accelerate = function(elapsed) {
			this.fuelPoints -= this.fuelFactor*this.accelerationRate(elapsed);
		}
		object.takeDamage = function(damage) {
			if(this.shieldPoints > 0) {
				this.shieldPoints -= damage;
				if(this.shieldPoints < 0) {
					this.healthPoints -= -this.shieldPoints;
					this.shieldPoints = 0;
				}
			}
			else {
				this.healthPoints -= damage;
			}
			if(this.healthPoints<=0){
				return true;
			}
			else {
				return false;
			}
		}
	}
	
	var player = new gameObject([0,0,0]);
	attachShip(player);
	
	// Player Access Functions
	function setPlayerPosition(position) {
		// TODO: Check input is vector
		player.setPosition(position[0], position[1], position[2]);
	}
	function setPlayerVelocity(velocity) {
		// TODO: Check input is vector
		player.setVelocity(velocity[0], velocity[1], velocity[2]);
	}
	function setPlayerRotation(rotation) {
		// TODO: Check input is vector
		// TODO: Update game code to use player object rotation not Engine Camera Rotation
		//player.setRotation(rotation[0], rotation[1], rotation[2]);
		Gremlin.setPlayerCameraRotation(rotation[0], rotation[1], rotation[2]);
	}
	
	// Basic Projectile System
	// TODO: namespace
	var projectiles = [];
	var projectileObject = new gameObject([0,0,0]);
	projectileObject.rotate(90, 1, 0, 0)
	projectileObject.setColor(5.0,0,0,1);
	projectileObject.setUseLighting(false); //TODO: Would be better with lighting true and emissive material
	// Would also be better if when we had a particle system that it would leave a short lived trail.
	
	function projectile(position, velocity, dmg, lifetime, friendly) {
		this.position = position;
		this.velocity = velocity;
		this.dmg = dmg;
		this.lifetime = lifetime;
		this.friendly = friendly;
		
		this.getPosition = getPosition;
		this.updatePosition = updatePosition;
		
		function getPosition() {
			return this.position;
		}
		function updatePosition() {
			this.position[0] += this.velocity[0];
			this.position[1] += this.velocity[1];
			this.position[2] += this.velocity[2];
		}
	}
	
	function removeProjectile(index) {
		projectiles.splice(index,1);
	}
	
	// Dust Motes
	var dustMotes = [];
	var maxMotes, randomFactor, rootThree;
	rootThree = 1.73205; // Approximately
	randomFactor = 10; // To Be Adjusted
	maxMotes = 100; // To Be Adjusted
	
	function createMotes() {
		// Remove Existing Motes
		dustMotes.splice(0,dustMotes.length);
		// Add New Motes
		for(var i = 0; i < maxMotes; i++) {
			var obj = new gameObject([2*randomFactor*(Math.random()-0.5), 2*randomFactor*(Math.random()-0.5), 2*randomFactor*(Math.random()-0.5)]);
			Gremlin.createPoint(obj);
			obj.points = true;
			obj.useLighting = false; // If we want the motes to be lit properly we'll have to figure out the normal to a point!
			obj.setColor(0.8,0.8,0.8,1);
			dustMotes.push(obj); 
		}
	}
 
	function updateMotes(pos, vel) {
		if (vec3.length(vel)) {
			for(var i = 0; i < dustMotes.length; i++){
				var boundingR;
				var posDiff = vec3.create();
				boundingR = vec3.length(vel) + rootThree*randomFactor;
				vec3.subtract(pos,dustMotes[i].position, posDiff); 
				if (vec3.length(posDiff) >  boundingR) {
					// Respawn on opposite site of sphere 
					dustMotes[i].setPosition(
						pos[0] + 0.99*posDiff[0],
						pos[1] + 0.99*posDiff[1],
						pos[2] + 0.99*posDiff[2]
					);
				}
			}
		}
	}
	
	// WebGL Start
	
    function webGLStart(resScale) {
		canvas = document.getElementById("gremlinCanvas");
		resolutionScale = resScale;
		setCanvasSize();
		
		// Initialise
		Gremlin.init();
		gameInit();
		
		// Start Game Loop
        tick();
		
    }
	
	// Controller Bar
	
	function _controller() {
		var running = true;
		var windowPaused = false;
		
		function handlePause() { 
			if(running) { 
				_pause();
			} 
			else { 
				_unpause();
			}
		}
		
		function handleUnpause() {
			if(!running) {
				_unpause();
			}
		}
		
		function handleWindowBlur() {
			if(running) {
				windowPaused = true;
				_pause();
			}
		}
		
		function handleWindowFocus() {
			if(windowPaused) {
				windowPaused = false;
				_unpause();
			}
		}
		function isRunning() { return running; }
		function _pause() { running = false; }
		// TODO: if/when the game timer moves to an object adjust this		
		function _unpause() { running = true; lastTime = new Date().getTime(); requestAnimFrame(tick); }
		
		return { 
			isRunning: isRunning, 
			handlePause: handlePause, 
			handleUnpause: handleUnpause,
			handleWindowBlur: handleWindowBlur, 
			handleWindowFocus: handleWindowFocus 
		};
	}
	var controller = _controller();
	
	function pause() {
		controller.handlePause();
	}
	function unpause() {
		controller.handleUnpause();
	}
	function applyOptions(resScale, _lighting, _lightingType, _specularLighting) {
		resolutionScale = resScale;
		setCanvasSize();
		Gremlin.setLightingFlags("lighting", _lighting);
		Gremlin.setLightingFlags("specularLighting", _specularLighting);
		Gremlin.setShader(_lightingType);
	}
	function setCanvasSize() {
		if (resolutionScale) {
			canvas.width = resolutionScale*document.width;
			canvas.height = resolutionScale*window.innerHeight;
		}
		else {
			canvas.width = document.width;
			canvas.height = window.innerHeight;
		}
		canvas.style.width = document.width+"px";
		canvas.style.height = window.innerHeight+"px";
	}
	
	GremlinEventHandler.bindEvent("onblur", controller.handleWindowBlur);
	GremlinEventHandler.bindEvent("onfocus", controller.handleWindowFocus);
	GremlinEventHandler.bindEvent("onresize", setCanvasSize);
	GremlinEventHandler.bindEvent("onresize", Gremlin.resize);
	
	// Level Functions - Own namespace?
	function _levelThink() { 
		// Default function blank
	}
	var levelThink = _levelThink;
	
	var levelVars = new Array();
	
	function setLevelThink(func) {
		levelThink = func;
	}
	
	function getLevelVar(key) {
		return levelVars[key];
	}
	function setLevelVar(key, value) {
		levelVars[key] = value;
	}
	
	function loadLevel(fileName, targetState) {
		// Reset Player Object - should be method on player
		Gremlin.setPlayerCamera(0,0,0);
		Gremlin.setPlayerCameraRotation(0,0,0);
		player.position = [0,0,0];
		player.velocity = [0,0,0];
		player.firingTimer = 1000;
		// End Reset Player 
		gameState = "Loading";
		loadingTargetState = targetState;
		var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", fileName);
		if (typeof fileref!="undefined") document.getElementsByTagName("head")[0].appendChild(fileref);
	}
	function unloadLevel() {
		for(variables in levelVars)
		{
			levelVars[variables] = null;
		}
		ShipManager.destroyShips();
		setLevelThink(function() { /* Blank! */ });
		gameObjects.splice(0, gameObjects.length);
		projectiles.splice(0, projectiles.length);
		dustMotes.splice(0, dustMotes.length); // Looks like we need a level manager! ;D
		Gremlin.removeLights();
	}
	
	
	return {
		attachShip:					attachShip,
		createObjectPrimitive: 		createObjectPrimitive,
		createObjectModel: 			createObjectModel,
		createMotes:				createMotes,
		setLoading:  				setLoading,
		updateGameState: 			updateGameState,
		loadLevel: 					loadLevel,
		unloadLevel:				unloadLevel,
		setLevelThink:				setLevelThink,
		getLevelVar:				getLevelVar,
		setLevelVar:				setLevelVar,
		setPlayerPosition:          setPlayerPosition,
		setPlayerVelocity:			setPlayerVelocity,
		setPlayerRotation:			setPlayerRotation,
		applyOptions:				applyOptions,
		pause:						pause,
		unpause:					unpause,
		webGLStart: 				webGLStart
	}
}
var Game = _Game();

//////////////////	
// Ship Manager //
//////////////////

// Enemy Ship Mananger

function _ShipManager() {
	
	var shipList = [];

	function numberOfShips() {
		return shipList.length;
	}
	
	function createShip(position, color) {
		// They're all evil spinning crates for now!
		var tmpShip = Game.createObjectPrimitive(
			position, 
			"cube", 
			"textures/crate.gif", 
			1.0, 
			0, 
			0, 
			function(elapsed) { this.rotate( ( (75 * elapsed) / 1000.0), 1, 1, 1); }, 
			null, 
			null, 
			true);
		tmpShip.setColor(color[0], color[1], color[2], color[3]);
		Game.attachShip(tmpShip);
		shipList.push(tmpShip);
	}
	function destroyShip(index) {
		shipList.splice(index,1);
	}
	function destroyShips() {
		shipList.splice(0,shipList.length);
	}
	function updateShips(elapsed) {
		if(shipList.length > 0) {
			for(var i = 0; i < shipList.length; i++) {	
				// Run AI - Argueably should be in separate function
				shipList[i].update(elapsed);
				shipList[i].updateShip(elapsed);
				shipList[i].animate(elapsed); // Argueably should be in separate function
			}
		}
		else {
			// No Ships .. possibly pass victory condition, really this should be dealt with by the level think function
			// Need to think about a way to couple that more strongly.
		}
	}
	function renderShips() {
		for(var i = 0; i < shipList.length; i++) {
			Gremlin.renderObject(shipList[i]);
		}
	}
	
	function checkShipsCollision(position, radius, dmg) {
		for(var i = 0; i < shipList.length; i++) {
			// TODO: Remove hardcoded ship radius - add radius method to gameobject (returns average scale)
			if(GremlinCollision.sphereToSphereIntersect(position, radius, shipList[i].position, 1)){
				if (shipList[i].takeDamage(dmg))
				{
					this.destroyShip(i);
				}
				return true;
			}
		}
		return false;
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
}
	
var ShipManager = _ShipManager();
		

function _ShipAI() {
	// Attach Ship AI
	
	// Ship AI Object
}

var ShipAI = _ShipAI();
