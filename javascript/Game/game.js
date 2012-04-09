 //  _____                 ___     ___
//  / _  / ___ _ __ ___   / _ \   / _ \__ _ _ __ ___   ___
//  \// / / _ \ '__/ _ \ / /_\/  / /_\/ _` | '_ ` _ \ / _ \
//   / //\  __/ | | (_) / /_\\  / /_\\ (_| | | | | | |  __/
//  /____/\___|_|  \___/\____/  \____/\__,_|_| |_| |_|\___|

// ZeroG.Game
// Placed directly into the Game namespace

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

// TODO: change to 'update'
// TODO: can this be private?
function animate() {
	var timeNow = new Date().getTime();
	if (lastTime != 0) {
		var elapsed = timeNow - lastTime;

        // TODO: Remove these and instead call World.Update
        var gameObjects = World.gameObjects;
        var projectiles = World.projectiles;

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
					World.removeProjectile(i);
					i--; // Prevent skipping of next projectile after splice
				}
				// TODO: remove hardcoded radi
				else if(!(projectiles[i].friendly) && Gremlin.Collision.sphereToSphereIntersect(projectiles[i].position, 0.03, Player.position(), 1)) {
					World.getSound("impact").play();
					if(Player.ship.takeDamage(projectiles[i].velocity, projectiles[i].mass, projectiles[i].dmg)){
						// GAME OVER
						Gremlin.GUI.endGame("<h2>Game Over</h2>")
					}
					World.removeProjectile(i);
					i--; // Prevent skipping of next projectile after splice
				}
			}

			// TODO: this should possibly also run every X frames.
			World.levelThink();

			// Update Player ship
			Player.ship.updateShip(elapsed);

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

			var accelRate = Player.ship.accelerationRate(elapsed);
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
				Player.updateVelocity(dvelocity[0], dvelocity[1], dvelocity[2]);
			}

			Player.update(elapsed);

			Gremlin.Gizmo.setPlayerCamera(Player.position()[0],Player.position()[1],Player.position()[2]); // TODO: ugh! WTF

			// Pew Pew
			if(_keyState("PewPew")) {
				if (Player.ship.canFire()) {
					var pos = vec3.create(Player.position());
					// TODO: Also this needs to be turret attach point rather than camera position
					var aimAt = [0,0,0];
					aimAt = Gremlin.Gizmo.pickPosition(mousePos[0], mousePos[1], 500); // TODO: 500 should be replaced by z-component of distance to target - if this is altered, update aimAt reticle
					var v = [0,0,0];
					vec3.subtract(aimAt, pos, v);
					vec3.normalize(v);
					vec3.scale(v,Player.ship.weaponSpeed);
					vec3.add(v,Player.velocity());

					World.spawnProjectile({
						"position": pos,
						"velocity": v,
						"color": [5.0,0,0,1.0],
						"damage": 40000,
						"lifetime": 30000,
						"friendly": true }); // specification of damage of projectile should not be here
					World.getSound("fire").play();
					Player.ship.fire();
				}
			}

			if (Gremlin.Input.keyDown("Esc")) {
				updateGameState("InMenu");
				pause();
				Gremlin.GUI.pause();
			}


			// Update HUD
            Player.updateHud();

			// Update Motes
			World.updateMotes(Player.position(), Player.velocity());

			// Update Projectiles
			World.projectileObject.animate(elapsed);
			for(i = 0; i < projectiles.length; i++) {
				// Update Lifetime
				projectiles[i].lifetime -= elapsed;
				// Despawn if lifetime has expired
				if (projectiles[i].lifetime < 0) {
					World.removeProjectile(i);
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
			World.levelThink();
		}

	}
	lastTime = timeNow;
}

// TODO: can this be private?
function tick() {
	if(PauseController.isRunning()) { requestAnimFrame(tick); }

	if(gameState == "Loading") {
		// Wait for all assets to load
		if(assetsLoading) return;
		else gameState = loadingTargetState;
	}

	// Render Scene
	var gizmo = Gremlin.Gizmo;
	gizmo.prepareScene();

    // TODO: Remove these and use World.Render
    var gameObjects = World.gameObjects;
    var projectiles = World.projectiles;
    var projectileObject = World.projectileObject;
    var dustMotes = World.motes;
    
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

	// Animate Scene - Arguably this should be done first?
	animate();
}

// Game Init
function _gameInit() {
	assetsLoading = false;

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

    // Bind Events
    Gremlin.EventHandler.bindEvent("onblur", PauseController.handleWindowBlur);
    Gremlin.EventHandler.bindEvent("onfocus", PauseController.handleWindowFocus);
    Gremlin.EventHandler.bindEvent("onresize", setCanvasSize);
    Gremlin.EventHandler.bindEvent("onresize", Gremlin.Gizmo.resize);

	// Create Projectiles
    World.init();

	World.loadLevel("menu.js", "InMenu");

	// Pre-load Some Sounds
	World.setSound("space-ambient", Gremlin.Audio.load("sounds/space-ambient.ogg")).setVolume(0.2);
	World.setSound("fire", Gremlin.Audio.load("sounds/neutron-disruptor.wav"));
	World.setSound("impact", Gremlin.Audio.load("sounds/impact.ogg"));
}

 // WebGL Start
function webGLStart(resScale) {
	canvas = document.getElementById("gremlinCanvas");
	resolutionScale = resScale;
	setCanvasSize();

	// Initialise
	Gremlin.Gizmo.init();
	Gremlin.Audio.init(); // TODO: move this and any other inits into Gremlin's
	_gameInit();

	// Start Game Loop
	tick();
}

function pause() {
	PauseController.handlePause();
}

function unpause() {
	PauseController.handleUnpause();
}

function applyOptions(resScale, _lighting, _lightingType, _specularLighting) {
	resolutionScale = resScale;
	setCanvasSize();
	Gremlin.Gizmo.setLightingFlags("lighting", _lighting);
	Gremlin.Gizmo.setLightingFlags("specularLighting", _specularLighting);
	Gremlin.Gizmo.setShader(_lightingType);
}
// TODO: Can this be private?
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

/*#return
    setLoading: setLoading,
	updateGameState: updateGameState,
	webGLStart: webGLStart,
	pause: pause,
	unpause: unpause,
	applyOptions: applyOptions,
	getCanvasSize: getCanvasSize,
*/