 //  _____                 ___     ___                     
//  / _  / ___ _ __ ___   / _ \   / _ \__ _ _ __ ___   ___ 
//  \// / / _ \ '__/ _ \ / /_\/  / /_\/ _` | '_ ` _ \ / _ \
//   / //\  __/ | | (_) / /_\\  / /_\\ (_| | | | | | |  __/
//  /____/\___|_|  \___/\____/  \____/\__,_|_| |_| |_|\___|
                                                       
//    __                   __           _       _   
//    \ \  __ ___   ____ _/ _\ ___ _ __(_)_ __ | |_ 
//     \ \/ _` \ \ / / _` \ \ / __| '__| | '_ \| __|
//  /\_/ / (_| |\ V / (_| |\ \ (__| |  | | |_) | |_ 
//  \___/ \__,_| \_/ \__,_\__/\___|_|  |_| .__/ \__|
//                                       |_|     

function _Game() {
	// TODO: Change naming to public / private functions...
	// TODO: Extract all things that should be in their own namespace (e.g. projectiles, gameobjects etc)
	// TODO: add /** comments to functions to make their use clearer. 
	
	var canvas;
	var	resolutionScale;
	var lastTime = 0;
	var gameState;
	
	var loadingTargetState;
	var assetsLoading = false; 
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
					if (projectiles[i].friendly && ShipManager.checkShipsCollision(projectiles[i].position, 0.03, projectiles[i].dmg)){
						// TODO: remove hardcoded radius
						// Remove Projectile
						removeProjectile(i);
					}
					// TODO: remove hardcoded radi
					else if(!(projectiles[i].friendly) && GremlinCollision.sphereToSphereIntersect(projectiles[i].position, 0.03, player.position, 1)) {
						if(player.takeDamage(projectiles[i].dmg)){
							// GAME OVER
							GremlinGUI.endGame("<h2>Game Over</h2>")
						}
						removeProjectile(i);
					}
				
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
			
				var dvelocity = [dx, 0, dz ];
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
						var pos = vec3.create(player.position);
						// TODO: Also this needs to be turret attach point rather than camera position
						var aimtAt = [0,0,0];
						aimAt = Gremlin.pickPosition(mousePos[0], mousePos[1], 500); // TODO: 500 should be replaced by z-component of distance to target - if this is altered, update aimAt reticle
						var v = [0,0,0]; 
						vec3.subtract(aimAt, pos, v);
						vec3.normalize(v);
						vec3.scale(v,player.weaponSpeed);
						vec3.add(v,player.velocity);
						
						spawnProjectile(pos, v, [5.0,0,0,1.0], 30, 30000, true);
						player.fire();
					}
				}
				
				if (GremlinInput.keyDown("Esc")) {
					updateGameState("InMenu");
					pause();
					GremlinGUI.pause();
				}
			
			
				// Update HUD
				GremlinHUD.updateHud( 
				{ 
					health: { index: healthBar, value: (player.healthPoints/player.healthMax) },
					shield: { index: shieldBar, value: (player.shieldPoints/player.shieldMax) },
					energy: { index: energyBar, value: (player.energyPoints/player.energyMax) } 
				});
				
				// Update Motes
				updateMotes(player.position, player.velocity); 
				
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
						projectiles[i].updatePosition(elapsed); 
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
			var colour = [1,1,1,1];
			position = projectiles[n].getPosition();
			colour = projectiles[n].getColor();
			projectileObject.setPosition(position[0], position[1], position[2]);
			projectileObject.setColor(colour[0], colour[1], colour[2], colour[3], colour[4]);
			Gremlin.renderObject(projectileObject);
		}
		ShipManager.renderShips();
		
		// WebGL HUD
		if(gameState == "InGame") {
			GremlinHUD.renderHud();
		}
		
		
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
		function setScale(x,y,z) { 
			if(y && z) { this.scale = [x,y,z]; } 
			else { this.scale = x; }
		}
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
	// TODO: Refactor to take an object as an argument, then the names of the object will be a guide on required values
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
		Gremlin.createTetrahedron(projectileObject, false);
		projectileObject.setScale(0.03,0.03,0.03);
		projectileObject.animate = function(elapsed) { this.rotate( ( (300 * elapsed) / 1000.0), 1, 1, 1); }
		
		loadLevel("menu.js", "InMenu");
	}

	// Player / Ships
	function attachShip(object, attributes) {
		object.mass = 10;
		object.shieldMax = 100;
		object.shieldPoints = 100;
		object.shieldRegen = 0.0025;
		object.healthMax = 100;
		object.healthPoints = 100;
		object.energyMax = 100;
		object.energyPoints = 100;
		object.energyRegen = 0.0125;
		if(attributes && attributes["FiringPeriod"]) {
			object.firingPeriod = attributes["FiringPeriod"];
		}
		else {
			object.firingPeriod = 300;	
		}
		object.firingTimer = 300;
		object.firingCost = 5;
		object.weaponSpeed = 0.1;
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
			this.energyPoints += elapsed*this.energyRegen; if(this.energyPoints>this.energyMax) this.energyPoints = this.energyMax;
			this.firingTimer += elapsed;
		}
		object.accelerationRate = function(elapsed) {
			var accelerationAmount = 0.00005 * elapsed;
			accelerationAmount/=this.mass
			
			return accelerationAmount;
		}
		object.accelerate = function(elapsed) {
			// Nothing Doing
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
		object.setWeaponSpeed = function(speed) {
			this.weaponSpeed = speed;
		}
	}
	
	var player = new gameObject([0,0,0]);
	attachShip(player);
	
	// Player HUD Values
	var healthBar;
	var shieldBar;
	var energyBar;// Om Nom Nom Nom
	
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
	function getPlayerPosition() {
		return player.position;
	}
	function getPlayerVelocity() {
		return player.velocity;
	}
	function getPlayerProjectileSpeed() {
		return (vec3.length(player.velocity)+player.weaponSpeed);
	}
	
	// Basic Projectile System
	// TODO: namespace
	var projectiles = [];
	var projectileObject = new gameObject([0,0,0]);
	projectileObject.rotate(90, 1, 0, 0)
	projectileObject.setColor(1,1,1,1);
	projectileObject.setUseLighting(false); //TODO: Would be better with lighting true and emissive material
	// Would also be better if when we had a particle system that it would leave a short lived trail.
	// Also don't know if we want more than one protecile object... but we do want more than one colour.
	
	function projectile(position, velocity, color, dmg, lifetime, friendly) {
		this.position = position;
		this.velocity = velocity;
		this.dmg = dmg;
		this.lifetime = lifetime;
		this.friendly = friendly;
		this.color = color;
		
		this.getColor = getColor;
		this.getPosition = getPosition;
		this.updatePosition = updatePosition;
		
		function getPosition() {
			return this.position;
		}
		function getColor() {
			return this.color;
		}
		function updatePosition(elapsed) {
			this.position[0] += this.velocity[0]*elapsed;
			this.position[1] += this.velocity[1]*elapsed;
			this.position[2] += this.velocity[2]*elapsed;
		}
	}
	
	function spawnProjectile(position, velocity, color, damage, lifetime, friendly) {
		var newproj = new projectile(position, velocity, color, damage, lifetime, friendly);
		projectiles.push(newproj);
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
					// As posDiff > bounding radius, reset to be bounding radius
					vec3.normalize(posDiff);
					vec3.scale(posDiff, boundingR);
					// Respawn on opposite site of sphere 
					dustMotes[i].setPosition(
						pos[0] + posDiff[0],
						pos[1] + posDiff[1],
						pos[2] + posDiff[2]
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
	function getCanvasSize() {
		return [canvas.width, canvas.height];
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
		player.healthPoints = player.healthMax;
		player.shieldPoints = player.shieldMax;
		player.energyPoints = player.energyMax;
		// End Reset Player 
		
		// Load HUD
		healthBar = GremlinHUD.createBar(
			[-0.9, -0.65],
			[0.04, 0.3],
			[0.1, 0.5, 0.1, 1],
			[0.7, 1, 0.7, 1], 
			"Vertical");
		shieldBar = GremlinHUD.createBar(
			[0.9,-0.65],
			[0.04,0.3],
			[0.1,0.1,0.5,1],
			[0.7,0.7,1,1], 
			"Vertical");
		energyBar = GremlinHUD.createBar(
			[0,-0.9],
			[0.25,0.05],
			[0.5,0.15,0.05,1],
			[1,0.8,0.5,1], 
			"Horizontal");
		
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
		GremlinHUD.clearHud();
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
		getPlayerPosition:			getPlayerPosition,
		getPlayerVelocity:			getPlayerVelocity,
		getPlayerProjectileSpeed:	getPlayerProjectileSpeed,
		setPlayerPosition:          setPlayerPosition,
		setPlayerVelocity:			setPlayerVelocity,
		setPlayerRotation:			setPlayerRotation,	
		spawnProjectile:			spawnProjectile,
		applyOptions:				applyOptions,
		getCanvasSize:				getCanvasSize,
		pause:						pause,
		unpause:					unpause,
		webGLStart: 				webGLStart
	}
}
var Game = _Game();

//   __ _     _                                                  
//  / _\ |__ (_)_ __     /\/\   __ _ _ __   __ _  __ _  ___ _ __ 
//  \ \| '_ \| | '_ \   /    \ / _` | '_ \ / _` |/ _` |/ _ \ '__|
//  _\ \ | | | | |_) | / /\/\ \ (_| | | | | (_| | (_| |  __/ |   
//  \__/_| |_|_| .__/  \/    \/\__,_|_| |_|\__,_|\__, |\___|_|   
//             |_|                               |___/         

// Enemy Ship Mananger

function _ShipManager() {
	
	// Public
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
		
		// Create HUD elements
		var canvasSize = Game.getCanvasSize();
		var separation = vec3.create();
		vec3.subtract(position, Game.getPlayerPosition(),separation);
		var scaleFactor = 1/vec3.length(separation);
		var size = [scaleFactor*(canvasSize[1]/canvasSize[0]),scaleFactor];
		tmpShip.aimAtIndex = GremlinHUD.createWireframe("Box",[0,0,0], size, [1,0,0,1]);

		// Attach Ship Attributes
		var attributes = {};
		attributes.FiringPeriod = 600;
		Game.attachShip(tmpShip, attributes);

		// Attach AI
		ShipAI.attachAI(tmpShip);

		// Add to List
		shipList.push(tmpShip);
	}
	function destroyShip(index) {
		GremlinHUD.hideElement(shipList[index].aimAtIndex);
		shipList.splice(index,1);
	}
	function destroyShips() {
		shipList.splice(0,shipList.length);
	}

	function updateShips(elapsed, playerPos, playerVel) {
		if(shipList.length > 0) {
			for(var i = 0; i < shipList.length; i++) {	
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
		for(var i = 0; i < shipList.length; i++) {
			Gremlin.renderObject(shipList[i]);
		}
	}
	
	function checkShipsCollision(position, radius, dmg) {
		for(var i = 0; i < shipList.length; i++) {
			// TODO: Remove hardcoded ship radius - add radius method to gameobject (returns average scale)
			if(GremlinCollision.sphereToSphereIntersect(position, radius, shipList[i].position, 1)){
				shipList[i].takeDamageAi();
				if (shipList[i].takeDamage(dmg))
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
		
		// TODO: Calculate if in field of vision
		// if not, hide aimAt, show indicator arrow
		// else calculate aimAt as below
		
		// Calculate required velocity to hit target
		if(GremlinMaths.calculateProjectileVelocity(separation, ship.velocity, Game.getPlayerProjectileSpeed(), projectileVelocity)) {
			// Remove Player Component, as it is removed from aiming calculation, arguably it shouldn't be
			vec3.subtract(projectileVelocity, Game.getPlayerVelocity());

			// Reverse Pick at z=-500 units (this is currenlty hardcoded in aiming) along velocity vector.
			var aimAtPoint = vec3.create(projectileVelocity);
			vec3.normalize(aimAtPoint);
			var scaleFactor = 500 / aimAtPoint[2];
			vec3.scale(aimAtPoint, scaleFactor);

			// Move to Global Coordinate System
			vec3.add(aimAtPoint, Game.getPlayerPosition());
							
			var coords = [0,0];
			if(Gremlin.reversePick(aimAtPoint[0],aimAtPoint[1],aimAtPoint[2], coords)){
				var canvasSize = Game.getCanvasSize();
				var separation = vec3.create();
				vec3.subtract(ship.position, Game.getPlayerPosition(),separation);
				var scaleFactor = 1/vec3.length(separation);
				var size = [scaleFactor*(canvasSize[1]/canvasSize[0]),scaleFactor];  // TODO: Should not have to check for screen resize here, should be a factor in HUD / GUI.
				GremlinHUD.showElement(ship.aimAtIndex);
				GremlinHUD.updateElement(ship.aimAtIndex, [coords[0],coords[1],-1], size); 
			}
			else {
				GremlinHUD.hideElement(ship.aimAtIndex);
			}
		}
		else {
			// Player can not hit ship
			GremlinHUD.hideElement(ship.aimAtIndex);
		}
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

//     _      _____ 
//    /_\     \_   \
//   //_\\     / /\/
//  /  _  \_/\/ /__ 
//  \_/ \_(_)____(_)

function _ShipAI() {

	// Attach Ship AI
	function attachAI(obj, attributes) {
		// AI State - enum - 0, Idle; 1, Close; 2, Attack; 3, Flee; 4, Evasive; 5, Patrol
		obj.AiState = 0;
		obj.AiStateTimer = 0;
		
		// AI friendly - bool 
		// TODO: Create enum for factions including neutral, to make for more complex interactions
		if(attributes && attributes["Friendly"]) {
			obj.AiFiendly = attributes["Friendly"];
		}
		else {
			obj.AiFriendly = false;
		}
		
		// AI In Combat - bool
		obj.AiInCombat = false;
		
		// AI Skill - number - skill factor
		if(attributes && attributes["Skill"]) {
			obj.AiSkill = attributes["Skill"];
		}
		else {
			obj.AiSkill = 1;
		}
		
		// AI Confidence - number - affects state changes
		if(attributes && attributes["Confidence"]) {
			obj.AiConfidence = attributes["Confidence"];
		}
		else {
			obj.AiConfidence = obj.AiSkill; 
		}
		
		// AI Engage Distance - number - number of units at which non-friendly AI engages.
		if(attributes && attributes["EngageDistance"]) {
			obj.AiEngageDistance = attributes["EngageDistance"];
		}
		else {
			obj.AiEngageDistance = 50*obj.AiSkill; // TODO: Tweak once units have been actually figured out!
		}
		
		// AI Disengage Distance - number - number of units at which AI stops pursuing.
		if(attributes && attributes["DisengageDistance"]) {
			obj.AiDisengageDistance = attributes["DisengageDistance"];
		}
		else {
			obj.AiDisengageDistance = 10*obj.AiEngageDistance;
		}		

		obj.runAI = _runAI;
		obj.takeDamageAi = _takeDamageAi;
	}
	
	function _takeDamageAi(aggressor) {
		// If currently idle switch to attack
		if(this.AiState == 0) {
			this.AiState = 2;
			//TODO: if / when AI has targets, rather than just the player then target aggressor
		}
	}
	
	function _runAI(ship, elapsed) {
		this.AiStateTimer += elapsed;		
		// Check state and change if necessary.
		// Simple minimum of 1 sec in state currently
		var stateChanged = false;
		if(this.AiStateTimer > 1000) {
			switch(this.AiState){
			// Close
			case 1:
				// Check own health/shield - if below certain amount change to Flee / Evasive
				if (this.healthPoints/this.healthMax + this.shieldPoints/this.shieldMax < 0.5/this.AiConfidence)
				{
					this.AiState = 3;
					stateChanged = true;
					break;
				}
				
				// Check distance and relative velocity is close enough switch to attack
				separation = vec3.create();
				velocityDifference = vec3.create();
				vec3.subtract(Game.getPlayerPosition(), this.position, separation);
				vec3.subtract(Game.getPlayerVelocity(), this.velocity, velocityDifference);
				if (vec3.length(separation) < 100 && vec3.length(velocityDifference) < 25) {
					this.AiState = 2;
					stateChanged = true;
					break;
				}
				
				// if > disengage, then change attribute and idle
				if (vec3.length(separation) > this.AiDisengageDistance) {
					this.AiState = 0;
					stateChanged = true;
					break;
				}
				break;
			// Attack
			case 2: 
				// Check health and shield and if low switch to flee / evasive
				if (this.healthPoints/this.healthMax + this.shieldPoints/this.shieldMax < 0.5/this.AiConfidence)
				{
					this.AiState = 3;
					stateChanged = true;
					break;
				}
				
				// Check distance and relative velocity and change to close if necessary
				separation = vec3.create();
				velocityDifference = vec3.create();
				vec3.subtract(Game.getPlayerPosition(), this.position, separation);
				vec3.subtract(Game.getPlayerVelocity(), this.velocity, velocityDifference);
				if (vec3.length(separation) > 150 || vec3.length(velocityDifference) > 40) {
					this.AiState = 1;
					stateChanged = true;
					break;
				}
				
				break;
			//Flee
			case 3: 
				separation = vec3.create();
				velocityDifference = vec3.create();
				vec3.subtract(Game.getPlayerPosition(), this.position, separation);
				// Check distance if greater than a safety distance (disengage distance?)
				if (this.healthPoints/this.healthMax + this.shieldPoints/this.shieldMax > 0.5/this.AiConfidence
					|| vec3.length(separation) > this.AiDisengageDistance)
				{
					// Check relative health and shield and switch to either close or idle
					this.AiState = 0;
					stateChanged = true;
					break;
				}
				// Check distance if less than safety distance (disengage distance?)
					// Check relative health and shield and attack if safe appropriate
				break;
			// Evade
			case 4:
				separation = vec3.create();
				velocityDifference = vec3.create();
				vec3.subtract(Game.getPlayerPosition(), this.position, separation);
				// As Above
				if (vec3.length(separation) > this.AiDisengageDistance
					&& this.healthPoints/this.healthMax + this.shieldPoints/this.shieldMax > 0.5/this.AiConfidence)
				{
					// Check relative health and shield and switch to either close or idle
					this.AiState = 1;
					stateChanged = true;
					break;
				}
				break;
			// Default / Idle
			default:
				// Check Aggro distance, and attack if within range and is not friendly.
				if(!this.AiFriendly) {
					separation = vec3.create();
					velocityDifference = vec3.create();
					vec3.subtract(Game.getPlayerPosition(), this.position, separation);
					if(vec3.length(separation) < this.AiEngageDistance) {
						this.AiState = 2;
						stateChanged = true;
						break;
					}
				}
				break;				
			}
		}
		
		// Run current state
		if(!stateChanged)
		{
			var accelRate = this.accelerationRate(elapsed);
			var playerPos = Game.getPlayerPosition();
			var playerVel = Game.getPlayerVelocity();
			var separation = vec3.create();
			var relativeVelocity = vec3.create();
			vec3.subtract(playerPos, this.position, separation);
			vec3.subtract(playerVel, this.velocity, relativeVelocity);
				
			switch(this.AiState) {
			// Close
			case 1:
				// Accelerate to minimise relative velocity and separation
				var direction = [
					(separation[0]+relativeVelocity[0]), 
					(separation[1]+relativeVelocity[1]),
					(separation[2]+relativeVelocity[2])];
				vec3.normalize(direction);
				vec3.scale(direction,accelRate);
				this.updateVelocity(direction[0], direction[1], direction[2]);
				this.accelerate(elapsed);
				break;
			// Attack
			case 2:
				// Maintain distance / velocity within range
				if(vec3.length(relativeVelocity) > 5)
				{
					var direction = vec3.create(relativeVelocity);
					vec3.normalize(direction);
					vec3.scale(direction,accelRate);
					this.updateVelocity(direction[0],direction[1],direction[2]);
					this.accelerate(elapsed);
				}
				// Check firing timer and fire if possible
				if (this.canFire()) {
					// Caculate desired velocity
					var pos = vec3.create(this.position);
					var projectileVelocity = vec3.create();
					
					// Create Estimated player position - Skill Accuracy Effect
					var estimatedSeparation = vec3.create();
					
					// At 20 units skill of 1 has 0-1 unit inaccuracy
					// TODO: link this to target size.
					var scalingFactor = vec3.length(separation) / (20 * this.AiSkill);
					vec3.add(separation, [ (Math.random()-0.5)*scalingFactor, (Math.random()-0.5)*scalingFactor, (Math.random()-0.5)*scalingFactor], estimatedSeparation);
	
					if(GremlinMaths.calculateProjectileVelocity(estimatedSeparation, playerVel, (this.weaponSpeed+vec3.length(this.velocity)), projectileVelocity))
					{
						// Spawn new projectile
						Game.spawnProjectile(pos, projectileVelocity, this.color, 10, 30000, false);
						this.fire();	
					}
				}
				break;
			// Flee
			case 3:
				// Accelerate to maximize relative velocity and separation
				var direction = [
					(-separation[0]-relativeVelocity[0]), 
					(-separation[1]-relativeVelocity[1]),
					(-separation[2]-relativeVelocity[2])];
				vec3.normalize(direction);
				vec3.scale(direction,accelRate);
				this.updateVelocity(direction[0], direction[1], direction[2]);
				this.accelerate(elapsed);
				break;
				
			// TODO: Implement	
			//case 4:
				// Accelerate in a random direction mostly away from aggresor
				// break;
			// case 5:
				// Patrol along path
				// break;
			
			default:
				// Slow to Stop
				if (vec3.length(this.velocity) > accelRate)
				{
					var direction = vec3.create();
					vec3.negate(this.velocity, direction);
					vec3.normalize(direction);
					vec3.scale(direction,accelRate);
					this.updateVelocity(direction[0], direction[1], direction[2]);
					this.accelerate(elapsed);
				}
				else if (vec3.length(this.velocity) != 0)
				{
					this.setVelocity(0,0,0);
				}
				break;
			}
		}
		else {
			this.AiStateTimer = 0;
		}
	}

	return {
		attachAI:				attachAI
	}
}

var ShipAI = _ShipAI();
