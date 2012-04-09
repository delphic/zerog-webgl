// ZeroG.Game.Components.Ship
// TODO: extract components that should live elsewhere and create component dependancies (e.g. mass)
// TODO: update any references to gameObject.mass, gameObject.health etc when it means gameObject.Ship
// TODO: Update to prototype functions
function Ship(parameters) {
		this.mass = 10;
		this.shieldMax = 100;
		this.shieldPoints = 100;
		this.shieldRegen = 0.0025;
		this.healthMax = 100;
		this.healthPoints = 100;
		this.energyMax = 100;
		this.energyPoints = 100;
		this.energyRegen = 0.0125;
		if(parameters && parameters["FiringPeriod"]) {
			this.firingPeriod = parameters["FiringPeriod"];
		}
		else {
			this.firingPeriod = 300;
		}
		// TODO: Weapon Damage
		this.firingTimer = 300;
		this.firingCost = 5;
		this.weaponSpeed = 0.1;
		this.canFire = function() {
			return (this.firingTimer > this.firingPeriod && (this.energyPoints > this.firingCost));
		};
		this.fire = function() {
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
		this.updateShip = function(elapsed) {
			this.shieldPoints += elapsed*this.shieldRegen; if(this.shieldPoints>this.shieldMax) this.shieldPoints = this.shieldMax;
			this.energyPoints += elapsed*this.energyRegen; if(this.energyPoints>this.energyMax) this.energyPoints = this.energyMax;
			this.firingTimer += elapsed;
		};
		this.accelerationRate = function(elapsed) {
			var accelerationAmount = 0.00005 * elapsed;
			accelerationAmount/=this.mass;

			return accelerationAmount;
		};
		this.accelerate = function(elapsed) {
		    /* Nothing Doing*/
        };
		this.takeDamage = function(velocity, mass, damage) { //damage = damage per unit mass
			// TODO: extract method - should not be in ship takeDamage method
			var relativeVelocity = vec3.create();
			vec3.subtract(velocity, this.parent.velocity, relativeVelocity);
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
		this.setWeaponSpeed = function(speed) {
			this.weaponSpeed = speed;
		};
	}