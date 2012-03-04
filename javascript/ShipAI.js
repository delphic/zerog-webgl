//     _      _____ 
//    /_\     \_   \
//   //_\\     / /\/
//  /  _  \_/\/ /__ 
//  \_/ \_(_)____(_)

var ShipAI = function() {

	// Attach Ship AI
	function attachAI(obj, parameters) {
		// AI State - enum - 0, Idle; 1, Close; 2, Attack; 3, Flee; 4, Evasive; 5, Patrol
		obj.AiState = 0;
		obj.AiStateTimer = 0;

		// AI friendly - bool 
		// TODO: Create enum for factions including neutral, to make for more complex interactions
		if(parameters && parameters["Friendly"]) {
			obj.AiFiendly = parameters["Friendly"];
		}
		else {
			obj.AiFriendly = false;
		}

		// AI In Combat - bool
		obj.AiInCombat = false;

		// AI Skill - number - skill factor
		if(parameters && parameters["Skill"]) {
			obj.AiSkill = parameters["Skill"];
		}
		else {
			obj.AiSkill = 1;
		}

		// AI Confidence - number - affects state changes
		if(parameters && parameters["Confidence"]) {
			obj.AiConfidence = parameters["Confidence"];
		}
		else {
			obj.AiConfidence = obj.AiSkill; 
		}

		// AI Engage Distance - number - number of units at which non-friendly AI engages.
		if(parameters && parameters["EngageDistance"]) {
			obj.AiEngageDistance = parameters["EngageDistance"];
		}
		else {
			obj.AiEngageDistance = 100*obj.AiSkill; // TODO: Tweak once units have been actually figured out!
		}

		// AI Disengage Distance - number - number of units at which AI stops pursuing.
		if(parameters && parameters["DisengageDistance"]) {
			obj.AiDisengageDistance = parameters["DisengageDistance"];
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

					if(Gremlin.Maths.calculateProjectileVelocity(estimatedSeparation, playerVel, (this.weaponSpeed+vec3.length(this.velocity)), projectileVelocity))
					{
						// Spawn new projectile
						Game.spawnProjectile({
								"position": pos, 
								"velocity": projectileVelocity, 
								"color": this.color, 
								"damage": 20000, 
								"lifetime": 30000 
						});
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
				// Accelerate in a random direction mostly away from aggressor
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
}();
