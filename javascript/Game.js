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

var Game = function() {
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

	// Returns if a key is down for the specified binding
	function _keyState(binding) {
		var bind = Gremlin.Bindings.GetBinding(binding);
		if (bind.Enabled) {
			return (((_isMouseButton(bind.PrimaryKey)) ? Gremlin.Input.mouseDown(bind.PrimaryKey) : Gremlin.Input.keyDown(bind.PrimaryKey)) 
				|| ((_isMouseButton(bind.SecondaryKey)) ? Gremlin.Input.mouseDown(bind.SecondaryKey) : Gremlin.Input.keyDown(bind.SecondaryKey)));
		} else {
			return false;
		}
	}

	function _isMouseButton(key) {
		return (key === "LeftMouseButton" || key === "RightMouseButton" || key == "MiddleMouseButton");
	}

	function animate() {
		var timeNow = new Date().getTime();
		if (lastTime != 0) {
			var elapsed = timeNow - lastTime;

			// Animate Objects
			for(key in gameObjects)
			{
				if(gameObjects.hasOwnProperty(key)) {
					gameObjects[key].animate(elapsed);
					gameObjects[key].update(elapsed);
				}
			}

			if(gameState == "InGame") {
				// Collision Checks and AI TODO: should possibly be run every X frames
				// Check for projectile - ship collision

				for(var i = 0; i < projectiles.length; i++){
					// Check enemy ships
					if (projectiles[i].friendly && ShipManager.checkShipsCollision(projectiles[i].position, projectiles[i].velocity, projectiles[i].mass, 0.03, projectiles[i].dmg)){
						// TODO: remove hardcoded radius
						// Remove Projectile
						removeProjectile(i);
						i--; // Prevent skipping of next projectile after splice
					}
					// TODO: remove hardcoded radi
					else if(!(projectiles[i].friendly) && Gremlin.Collision.sphereToSphereIntersect(projectiles[i].position, 0.03, player.position, 1)) {
						getSound("impact").play();
						if(player.takeDamage(projectiles[i].velocity, projectiles[i].mass, projectiles[i].dmg)){
							// GAME OVER
							Gremlin.GUI.endGame("<h2>Game Over</h2>")
						}
						removeProjectile(i);
						i--; // Prevent skipping of next projectile after splice
					}
				}

				// TODO: this should possibly also run every X frames.
				levelThink();

				// Update Player ship
				player.updateShip(elapsed);	

				// Update Enemy ships
				ShipManager.updateShips(elapsed);

				// Handle Game Input
				// BUG: Keys get 'stuck down' - can not be resolved without proper HTML5 User Interface API
				var width = parseInt(canvas.style.width, 10);
				var height = parseInt(canvas.style.height, 10);
				var mousePos;
				mousePos = Gremlin.Input.getMousePos();

				var dyaw, dpitch, droll, dx, dy, dz;
				dyaw = 0.05 * elapsed * ((width*0.5)-mousePos[0])/(0.5*width);
				dpitch = 0.05 * elapsed * ((height*0.5)-mousePos[1])/(0.5*height);
				droll = 0;
				if (_keyState("RollLeft")) { droll += 0.1 * elapsed; }
				if (_keyState("RollRight")) { droll -= 0.1 * elapsed; }
				if (_keyState("Look")) Gremlin.Gizmo.rotatePlayerCamera(dyaw, dpitch, droll);
				else if (_keyState("RollLeft") || _keyState("RollRight")) { Gremlin.Gizmo.rotatePlayerCamera(0, 0, droll); }

				var accelRate = player.accelerationRate(elapsed);
				dx = 0;
				dy = 0;
				dz = 0;

				if (_keyState("Left")) {
					// Strafe Left
					dx -= accelRate;
				} 
				else if (_keyState("Right")) {
					// Strafe Right
					dx += accelRate;
				}

				if (_keyState("Forward")) {
					// Move Forward
					dz -= accelRate;
				} 
				else if (_keyState("Backward")) {
					// Move Backward
					dz += accelRate;
				}

				if (_keyState("Up")) {
					// Move Up
					dy += accelRate;	
				} 
				else if (_keyState("Down")) {
					// Move Down
					dy -= accelRate;
				}

				// Clamp Diagonal Speeds 
				// Physically speaking we probably shouldn't do this if we assume thruster based movement
				if(dx && dz && !dy) { 
					dx /= 1.41421;
					dz /= 1.41421;
				} else if (dx && dy && !dz) {
					dx /= 1.41421;
					dy /= 1.41421;					
				} else if (dy && dz && !dx) {
					dy /= 1.41421;
					dz /= 1.41421;
				} else if (dx && dy && dz) {
					dx /= 1.73205;
					dy /= 1.73205;
					dz /= 1.73205;
				}

				var dvelocity = [dx, dy, dz ];
				Gremlin.Gizmo.playerCameraReverseRotation(dvelocity);

				if (accelRate > 0 && (dx != 0 || dy != 0 || dz != 0)) {
					player.updateVelocity(dvelocity[0], dvelocity[1], dvelocity[2]);
					player.accelerate(elapsed);
				}

				player.update(elapsed);

				Gremlin.Gizmo.setPlayerCamera(player.position[0],player.position[1],player.position[2]);

				// Pew Pew
				if(_keyState("PewPew")) {
					if (player.canFire()) {
						var pos = vec3.create(player.position);
						// TODO: Also this needs to be turret attach point rather than camera position
						var aimAt = [0,0,0];
						aimAt = Gremlin.Gizmo.pickPosition(mousePos[0], mousePos[1], 500); // TODO: 500 should be replaced by z-component of distance to target - if this is altered, update aimAt reticle
						var v = [0,0,0]; 
						vec3.subtract(aimAt, pos, v);
						vec3.normalize(v);
						vec3.scale(v,player.weaponSpeed);
						vec3.add(v,player.velocity);

						spawnProjectile({ 
							"position": pos,
							"velocity": v,
							"color": [5.0,0,0,1.0],
							"damage": 40000,
							"lifetime": 30000, 
							"friendly": true }); // specification of damage of projectile should not be here
						getSound("fire").play();
						player.fire();
					}
				}

				if (Gremlin.Input.keyDown("Esc")) {
					updateGameState("InMenu");
					pause();
					Gremlin.GUI.pause();
				}


				// Update HUD
				Gremlin.HUD.updateHud( 
				{ 
					health: { index: healthBar, value: (player.healthPoints/player.healthMax) },
					shield: { index: shieldBar, value: (player.shieldPoints/player.shieldMax) },
					energy: { index: energyBar, value: (player.energyPoints/player.energyMax) } 
				});

				// Update Motes
				updateMotes(player.position, player.velocity); 

				// Update Projectiles
				projectileObject.animate(elapsed);
				for(i = 0; i < projectiles.length; i++) {
					// Update Lifetime
					projectiles[i].lifetime -= elapsed;
					// Despawn if lifetime has expired
					if (projectiles[i].lifetime < 0) {
						removeProjectile(i);
						i--; // Prevent loop skipping next projectile in list after splice
					}
					else {
						// Update Position
						projectiles[i].updatePosition(elapsed); 
					}
				}
			}
			else {
				// This is useful for menus etc too!
				// TODO: Should probably run every X frames
				levelThink();
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
		var gizmo = Gremlin.Gizmo;
		gizmo.prepareScene();
		for(key in gameObjects)
		{
			if(gameObjects.hasOwnProperty(key) && gameObjects[key].visible) {
				gizmo.renderObject(gameObjects[key]);
			}
		}

		var dustMotesMax = dustMotes.length; // This won't change in the loop so don't evaluate it each time
		for(var i = 0; i < dustMotesMax; i++)
		{
			// Note: Not an efficient method of rendering particles...
			// We can get away with this because it's only ~100 objects
			gizmo.renderObject(dustMotes[i]);
		}

		var projectilesMax = projectiles.length; // This won't change in the loop so don't evaluate it each time
		for(var n = 0; n < projectilesMax; n++) 
		{
			var position = [0,0,0];
			var colour = [1,1,1,1];
			position = projectiles[n].getPosition();
			colour = projectiles[n].getColor();
			projectileObject.setPosition(position[0], position[1], position[2]);
			projectileObject.setColor(colour[0], colour[1], colour[2], colour[3], colour[4]);
			gizmo.renderObject(projectileObject);
		}

		ShipManager.renderShips();

		// WebGL HUD
		if(gameState == "InGame") {
			Gremlin.HUD.renderHud();
		}


		// Animate Scene
		animate();
	}
	// Game Objects
	var gameObjects = [];
	var gamePointLights = [];
	var gameSpotLights = [];

	// Game Object Obj
	function GameObject(parameters) { 
		if(!(this instanceof GameObject)) {
			return new GameObject(parameters);
		}

		// TODO: Make properties private by using var instead of this or add to prototype.

		this.position = parameters.position ? vec3.create(parameters.position) : [0,0,0];
		this.velocity = parameters.velocity ? vec3.create(parameters.velocity) : [0,0,0]; 
		this.rotation = parameters.rotation ? mat4.create(parameters.rotation) : mat4.identity(mat4.create());
		this.scale = parameters.scale ? vec3.create(parameters.scale) : [1, 1, 1];

		this.buffers = [];

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
			mat4.rotate(this.rotation, Gremlin.Gizmo.degToRad(amount), [X, Y, Z]);
		}
		function setRotation(yaw, pitch, roll) {
			mat4.identity(this.rotation);
			mat4.rotate(this.rotation, Gremlin.Gizmo.degToRad(yaw), [0,1,0]);
			mat4.rotate(this.rotation, Gremlin.Gizmo.degToRad(pitch), [1,0,0]);
			mat4.rotate(this.rotation, Gremlin.Gizmo.degToRad(roll), [0,0,1]);
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
	// parameters: position, primType, textureName, scale, latBands, longBands, animation, shininess, isSkyBox, stopPush,
	// color, useLighting, outerRadius, innerRadius, thickness, numberOfSides
	function createObjectPrimitive(parameters) {

		// Required parameters
		if(!parameters.primType) {
			throw new Error("Required argument missing for createObjectPrimitive: 'primType'");
		}
		if(!parameters.position) {
			throw new Error("Required argument missing for createObjectPrimitive: 'position");
		}
		if(!parameters.scale) {
			throw new Error("Required argument missing for createObjectPrimitive: 'scale'");
		}

		var object = new GameObject({ "position": parameters.position });
		object.useTextures = (parameters.textureName) ? true : false;
	    
		if(parameters.scale.length) {
			object.setScale(parameters.scale);
		}
		else {
			object.setScale(parameters.scale,parameters.scale,parameters.scale);
		}

		switch(parameters.primType) {
		case "pyramid":
			object.assignBuffer(Gremlin.Primitives.createPyramid());
			break;
		case "cube": 
			object.assignBuffer(Gremlin.Primitives.createCube());
			break;
		case "sphere":
			object.assignBuffer(Gremlin.Primitives.createSphere({ latBands: parameters.latBands, longBands: parameters.longBands }));
			break;
		case "ring":
			object.assignBuffer(Gremlin.Primitives.createRing({ outerRadius: parameters.outerRadius, innerRadius: parameters.innerRadius, thickness: parameters.thickness, numberOfSides: parameters.numberOfSides }));
			break;
		case "ray":
			object.assignBuffer(Gremlin.Primitives.createRay());
			break;
		case "point":
			object.assignBuffer(Gremlin.Primitives.createPoint());
			break;
		default:
			throw new Error("Invalid Prim Type: "+parameters.primType+"");
		}
		if(parameters.textureName) {
			object.texture = Gremlin.Gizmo.createTexture(parameters.textureName);
		}
		if(parameters.shininess) {
			object.setShininess(parameters.shininess);
		}
		if(parameters.isSkyBox) {
			object.setIsSkyBox(true);
		}
		if(parameters.useLighting) {
			object.setUseLighting(parameters.useLighting);
		}
		if(parameters.animation) {
			object.animate = parameters.animation;
		}
		if(parameters.color) {
			object.setColor(parameters.color[0], parameters.color[1], parameters.color[2], parameters.color[3]);
		}		
		if(!parameters.stopPush)
		{
			gameObjects.push(object);
		}

		return object;

	}

	// parameters: position, modelName, textureName, scale, animation, shininess
	function createObjectModel(parameters) {
		// Check for required parameters
		if(!parameters.position) {
			throw new Error("Required argument missing for createObjectModel: 'position'");
		}
		if(!parameters.modelName) {
			throw new Error("Required argument missing for createObjectModel: 'modelName'");
		}
		if(!parameters.scale) {
			throw new Error("Required argument missing for createObjectModel: 'scale'");
		}
		var object = new GameObject({ "position": parameters.position });
		object.useTextures = (parameters.textureName)? true : false;

		if(parameters.scale.length) {
			object.setScale(parameters.scale);
		}
		else {
			object.setScale(parameters.scale, parameters.scale, parameters.scale);
		}

		Gremlin.Gizmo.loadModel(object, parameters.modelName); // TODO: do not pass object, use callback

		if(parameters.textureName) {
			object.texture = Gremlin.Gizmo.createTexture(parameters.textureName);
		}
		if(parameters.shininess) {
			object.setShininess(parameters.shininess);
		}
		if(parameters.animation) {
			object.animate = parameters.animation;
		}
		if(parameters.color) {
			object.setColor(parameters.color[0], parameters.color[1], parameters.color[2], parameters.color[3]);
		}
		gameObjects.push(object);
	}

	// Game Init
	function gameInit() {
		assetsLoading = false;

		// TODO: Player Init

		// TODO: Projectile Init

		// Bindings
		Gremlin.Bindings.Bind({Name: "Forward", PrimaryKey: "w", SecondaryKey: "Up" });
		Gremlin.Bindings.Bind({Name: "Backward", PrimaryKey: "s", SecondaryKey: "Down"});
		Gremlin.Bindings.Bind({Name: "Left", PrimaryKey: "a", SecondaryKey: "Left"});
		Gremlin.Bindings.Bind({Name: "Right", PrimaryKey: "d", SecondaryKey: "Right"});
		Gremlin.Bindings.Bind({Name: "Up", PrimaryKey: "Space"});
		Gremlin.Bindings.Bind({Name: "Down", PrimaryKey: "Shift"});
		Gremlin.Bindings.Bind({Name: "RollLeft", PrimaryKey: "q"});
		Gremlin.Bindings.Bind({Name: "RollRight", PrimaryKey: "e"});
		Gremlin.Bindings.Bind({Name: "Look", PrimaryKey: "RightMouseButton"});
		Gremlin.Bindings.Bind({Name: "PewPew", PrimaryKey: "LeftMouseButton"});

		// Create Projectiles
		projectileObject.assignBuffer(Gremlin.Primitives.createTetrahedron());
		projectileObject.setScale(0.03,0.03,0.03);
		projectileObject.animate = function(elapsed) { this.rotate( ( (300 * elapsed) / 1000.0), 1, 1, 1); };

		loadLevel("menu.js", "InMenu");

		// Preload Some Sounds
		setSound("space-ambient", Gremlin.Audio.load("sounds/space-ambient.ogg")).setVolume(0.2);
		setSound("fire", Gremlin.Audio.load("sounds/neutron-disruptor.wav"));
		setSound("impact", Gremlin.Audio.load("sounds/impact.ogg"));
	}

	// Player / Ships
	function attachShip(object, parameters) {
		object.mass = 10;
		object.shieldMax = 100;
		object.shieldPoints = 100;
		object.shieldRegen = 0.0025;
		object.healthMax = 100;
		object.healthPoints = 100;
		object.energyMax = 100;
		object.energyPoints = 100;
		object.energyRegen = 0.0125;
		if(parameters && parameters["FiringPeriod"]) {
			object.firingPeriod = parameters["FiringPeriod"];
		}
		else {
			object.firingPeriod = 300;	
		}
		// TODO: Weapon Damage
		object.firingTimer = 300;
		object.firingCost = 5;
		object.weaponSpeed = 0.1;
		object.canFire = function() { 
			return (this.firingTimer > this.firingPeriod && (this.energyPoints > this.firingCost));
		};
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
		};
		object.updateShip = function(elapsed) {
			this.shieldPoints += elapsed*this.shieldRegen; if(this.shieldPoints>this.shieldMax) this.shieldPoints = this.shieldMax;
			this.energyPoints += elapsed*this.energyRegen; if(this.energyPoints>this.energyMax) this.energyPoints = this.energyMax;
			this.firingTimer += elapsed;
		};
		object.accelerationRate = function(elapsed) {
			var accelerationAmount = 0.00005 * elapsed;
			accelerationAmount/=this.mass;

			return accelerationAmount;
		};
		object.accelerate = function(elapsed) {
		    /* Nothing Doing*/
        };
		object.takeDamage = function(velocity, mass, damage) { //damage = damage per unit mass 

			// TODO: extract method - should not be in ship takeDamage method 
			var relativeVelocity = vec3.create();
			vec3.subtract(velocity, this.velocity, relativeVelocity);
			var v = vec3.length(relativeVelocity);
			var keneticAdjustedDamage = 0.5*mass*damage*v*v;  

			if(this.shieldPoints > 0) {
				this.shieldPoints -= keneticAdjustedDamage;
				if(this.shieldPoints < 0) {
					this.healthPoints -= -this.shieldPoints;
					this.shieldPoints = 0;
				}
			}
			else {
				this.healthPoints -= keneticAdjustedDamage;
			}
			return (this.healthPoints<=0);
		};
		object.setWeaponSpeed = function(speed) {
			this.weaponSpeed = speed;
		};
	}
	var player = new GameObject({ "position": [0,0,0] });
	attachShip(player);

	var sounds = [];

	function getSound(name) {
		return sounds[name];
	}
	function setSound(name, sound) {
		sounds[name] = sound;
		return sounds[name];
	}

	// Player HUD Values
	var healthBar;
	var shieldBar;
	var energyBar;// Om Nom Nom Nom

	// Player Access Functions
	// TODO: Remove these and just use the player object
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
		Gremlin.Gizmo.setPlayerCameraRotation(rotation[0], rotation[1], rotation[2]);
	}
	function getPlayerPosition() {
		return player.position;
	}
	function getPlayerVelocity() {
		return player.velocity;
	}
	function getPlayerRotation() {
		return player.rotation;
	}
	function getPlayerProjectileSpeed() {
		return (vec3.length(player.velocity)+player.weaponSpeed);
	}
	function createPlayerHud() {
		healthBar = Gremlin.HUD.createBar(
			[-0.9, -0.65],
			[0.04, 0.3],
			[0.1, 0.5, 0.1, 1],
			[0.7, 1, 0.7, 1],
			"Vertical");
		shieldBar = Gremlin.HUD.createBar(
			[0.9,-0.65],
			[0.04,0.3],
			[0.1,0.1,0.5,1],
			[0.7,0.7,1,1],
			"Vertical");
		energyBar = Gremlin.HUD.createBar(
			[0,-0.9],
			[0.4,0.04],
			[0.5,0.15,0.05,1],
			[1,0.8,0.5,1],
			"Horizontal");
	}

	// Basic Projectile System
	// TODO: namespace
	var projectiles = [];
	var projectileObject = new GameObject({ "position": [0,0,0] });
	projectileObject.rotate(90, 1, 0, 0); // TODO: Should create rotation matrix and hand into gameobject creator
	projectileObject.setUseLighting(false); //TODO: Would be better with lighting true and emissive material
	// Would also be better if when we had a particle system that it would leave a short lived trail.
	// Also don't know if we want more than one protecile object... but we do want more than one colour.

	function Projectile(parameters) {
		if(!this instanceof Projectile) {
			return new Projectile(parameters);
		}

		// Required parameters
		if(!parameters.position) {
			throw new Error("Projectile position must be specified: 'position'");
		}
		if(!parameters.velocity) {
			throw new Error("Projectile velocity must be specified: 'velocity'"); 
		}
		if (!parameters.damage) {
			throw new Error("Projectile damage per unit mass must be specified: 'damage'");
		}

		this.position = vec3.create(parameters.position); 
		this.velocity = vec3.create(parameters.velocity); 
		this.mass = parameters.mass || 0.1; 
		this.dmg = parameters.damage;
		this.lifetime = parameters.lifetime || 30000;
		this.friendly = parameters.friendly || false;
		this.color = parameters.color || [1, 1, 1, 1] ;

		this.getColor = getColor;
		this.getPosition = getPosition;
		this.updatePosition = updatePosition;

		function getPosition() {
			return this.position;
		}
		function getVelocity() {
			return this.velocity;
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

	function spawnProjectile(parameters) {
		var newproj = new Projectile(parameters);
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
			var obj = new GameObject(
				{ "position": 
					[2*randomFactor*(Math.random()-0.5), 
					2*randomFactor*(Math.random()-0.5), 
					2*randomFactor*(Math.random()-0.5)] });
			obj.assignBuffer(Gremlin.Primitives.createPoint());
			obj.points = true;
			obj.useLighting = false; // If we want the motes to be lit properly we'll have to figure out the normal to a point!
			obj.setColor(0.8,0.8,0.8,1);
			obj.spawnDistance = rootThree*randomFactor;
			dustMotes.push(obj); 
		}
	}

	function updateMotes(position, velocity) {
		if (vec3.length(velocity)) {
			for(var i = 0; i < dustMotes.length; i++){
				var boundingR = dustMotes[i].spawnDistance;
				var separation = vec3.create();
				vec3.subtract(position,dustMotes[i].position, separation);
				if (vec3.length(separation) >  boundingR) {
					// Randomise position of modes and reset to new bounding radius
					separation = [Math.random()*separation[0], Math.random()*separation[1], Math.random()*separation[2]];
					vec3.normalize(separation);
					boundingR = vec3.length(velocity) + rootThree*randomFactor;
					vec3.scale(separation, boundingR);

					// Respawn on other side of sphere with randomised position
					dustMotes[i].spawnDistance = boundingR;
					dustMotes[i].setPosition(
						position[0] + separation[0],
						position[1] + separation[1],
						position[2] + separation[2]
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
		Gremlin.Gizmo.init();
		Gremlin.Audio.init(); // TODO: move this and any other inits into Gremlin's
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
		Gremlin.Gizmo.setLightingFlags("lighting", _lighting);
		Gremlin.Gizmo.setLightingFlags("specularLighting", _specularLighting);
		Gremlin.Gizmo.setShader(_lightingType);
	}
	function setCanvasSize() {
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
		if (resolutionScale) {
			canvas.width = resolutionScale*windowWidth;
			canvas.height = resolutionScale*windowHeight;
		}
		else {
			canvas.width = windowWidth;
			canvas.height = windowHeight;
		}
		canvas.style.width = windowWidth+"px";
		canvas.style.height = windowHeight+"px";
	}
	function getCanvasSize() {
		return [canvas.width, canvas.height];
	}

	Gremlin.EventHandler.bindEvent("onblur", controller.handleWindowBlur);
	Gremlin.EventHandler.bindEvent("onfocus", controller.handleWindowFocus);
	Gremlin.EventHandler.bindEvent("onresize", setCanvasSize);
	Gremlin.EventHandler.bindEvent("onresize", Gremlin.Gizmo.resize);

	// Level Functions - Own namespace?
	var levelThink = function() { /* Blank! */ };
	var levelCleanUp = function() { /* Blank! */ };
	var levelVars = [];

	function setLevelThink(func) {
		levelThink = func;
	}
	function setLevelCleanUp(func) {
		levelCleanUp = func;
	}
	function getLevelVar(key) {
		return levelVars[key];
	}
	function setLevelVar(key, value) {
		levelVars[key] = value;
	}

	function loadLevel(fileName, targetState) {
		// Reset Player Object - should be method on player
		// Also we should only reset the camera!
		Gremlin.Gizmo.setPlayerCamera(0,0,0);
		Gremlin.Gizmo.setPlayerCameraRotation(0,0,0);
		player.position = [0,0,0];
		player.velocity = [0,0,0];
		player.firingTimer = 1000;
		player.healthPoints = player.healthMax;
		player.shieldPoints = player.shieldMax;
		player.energyPoints = player.energyMax;
		// End Reset Player 

		gameState = "Loading";
		loadingTargetState = targetState;

		var fileref=document.createElement('script');
		fileref.setAttribute("type","text/javascript");
		fileref.setAttribute("src", fileName);
		if (typeof fileref!="undefined") document.getElementsByTagName("head")[0].appendChild(fileref);

	}
	function unloadLevel() {
		levelCleanUp();
		for(key in levelVars)
		{
			if(levelVars.hasOwnProperty(key)) { levelVars[key] = null; }
		}
		ShipManager.destroyShips();
		setLevelThink(function() { /* Blank! */ });
		setLevelCleanUp(function() { /* Blank! */});
		gameObjects.splice(0, gameObjects.length);
		projectiles.splice(0, projectiles.length);
		dustMotes.splice(0, dustMotes.length); // Looks like we need a level manager! ;D
		Gremlin.Gizmo.removeLights();
		Gremlin.HUD.clearHud();
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
		setLevelCleanUp:            setLevelCleanUp,
		getLevelVar:				getLevelVar,
		setLevelVar:				setLevelVar,
		createPlayerHud:            createPlayerHud,
		getPlayerPosition:			getPlayerPosition, 		// Replace with reference to player object
		getPlayerVelocity:			getPlayerVelocity,
		getPlayerRotation:			getPlayerRotation,
		getPlayerProjectileSpeed:	getPlayerProjectileSpeed,
		setPlayerPosition:          setPlayerPosition,
		setPlayerVelocity:			setPlayerVelocity,
		setPlayerRotation:			setPlayerRotation,
		getSound:                   getSound,
		setSound:                   setSound,
		spawnProjectile:			spawnProjectile,
		applyOptions:				applyOptions,
		getCanvasSize:				getCanvasSize,
		pause:						pause,
		unpause:					unpause,
		webGLStart: 				webGLStart
	}
}();
