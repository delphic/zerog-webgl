// ZeroG.Game.Player

var Player = function() {
    var player = new GameObject({ "position": [0,0,0] });
    player.attach(new Components.Ship());

    this.ship = player.ship;

    function position() {
		return player.position;
	}
	function velocity() {
		return player.velocity;
	}
	function rotation() {
		return player.rotation;
	}
	function projectileSpeed() {
		return (vec3.length(player.velocity)+player.ship.weaponSpeed);
	}
    function setPosition(position) {
		player.setPosition(position[0], position[1], position[2]);
	}
	function setVelocity(velocity) {
		player.setVelocity(velocity[0], velocity[1], velocity[2]);
	}
	function setRotation(rotation) {
		// TODO: Update game code to use player object rotation not Engine Camera Rotation
		//player.setRotation(rotation[0], rotation[1], rotation[2]);
		Gremlin.Gizmo.setPlayerCameraRotation(rotation[0], rotation[1], rotation[2]);
	}
    function update(elapsed) {
        player.update(elapsed);
    }
    function updateVelocity(dx,dy,dz) {
        player.updateVelocity(dx,dy,dz);
    }

    // Player HUD Values
    // These shouldn't be here now should they Harry?
	var healthBar;
	var shieldBar;
	var energyBar;// Om Nom Nom Nom

	function createHud() {
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

    function updateHud() {
        Gremlin.HUD.updateHud(
        {
            health: { index: healthBar, value: (player.ship.healthPoints/player.ship.healthMax) },
            shield: { index: shieldBar, value: (player.ship.shieldPoints/player.ship.shieldMax) },
            energy: { index: energyBar, value: (player.ship.energyPoints/player.ship.energyMax) }
        });
    }

    function reset() {
        player.position = [0,0,0];
		player.velocity = [0,0,0];
		player.ship.firingTimer = 1000;
		player.ship.healthPoints = player.ship.healthMax;
		player.ship.shieldPoints = player.ship.shieldMax;
		player.ship.energyPoints = player.ship.energyMax;
    }

    return {
        position: position,
        velocity: velocity,
        rotation: rotation,
        ship: ship,
        setPosition: setPosition,
        setVelocity: setVelocity,
        setRotation: setRotation,
        update: update,
        updateVelocity: updateVelocity,
        projectileSpeed: projectileSpeed,
        createHud: createHud,
        updateHud: updateHud,
        reset: reset
    }

}();

