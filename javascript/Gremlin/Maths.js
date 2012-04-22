// GremlinMaths
var Maths = function() {
	// Calculates the time at which two objects will collide for a known separation
	// one object has known velocity other has known velocity magnitude.
	function calculateCollisionTime(separation, targetVelocity, projectileSpeed) {
		// Calculation the solution to a quadratic for T.
		// a = magnitude of Relative Velocity squared - magnitude of Projectile Velocity squared
		// b = 2 * dot product of Relative Velocity and Separaation
		// c = magnitude of separation squared
		var a = (targetVelocity[0]*targetVelocity[0] + targetVelocity[1]*targetVelocity[1] + targetVelocity[2]*targetVelocity[0]) - projectileSpeed*projectileSpeed;
		var b = 2*vec3.dot(targetVelocity, separation);
		var c = (separation[0]*separation[0] + separation[1]*separation[1] + separation[2]*separation[2]);

		var results = _solveQuadratic(a,b,c);

		if (results) {			
			if (results.length == 1) {
				// Single Root
				// This implies that the objects are on top of each other... should never happen, but do not want to explicitly forbid it.
				return results[0];
			}
			else {
				// Two Roots
				// One should be in the future and one in the past, we return the future result.
				if(results[0] > 0 && results[1] <= 0) {
					return results[0];
				}
				else if (results[0] <= 0 && results[1] > 0) {
					return results[1];
				}
				else {
					if (results[0] > 0 && results[1] > 0) {
						throw new Error("Both solutions to projectile calculation positive ("+results[0]+", "+results[1]+"), check arguments");
					}
					else {
						throw new Error("Both solutions to projectile calculation negative ("+results[0]+", "+results[1]+"), check arguments");
					}
				}
			}
		}
		else {
			// No Solution, return 0
			return 0;
		}
	}

	/**
	 * Returns false if it is not possible to hit target with given projectile speed.
	 * Else returns true and sets projectile velocity to velocity required to hit target
	 */
	function calculateProjectileVelocity(separation, targetVelocity, projectileSpeed, projectileVelocity){
		var collisionTime = calculateCollisionTime(separation, targetVelocity, projectileSpeed);	
		if (collisionTime != 0) {
			var separationScaled = vec3.create();
			vec3.scale(separation, 1/collisionTime, separationScaled);
			vec3.add(targetVelocity, separationScaled, projectileVelocity);
			return true;
		}
		else {
			return false;
		}
	}

	// Returns false if no real roots
	// Returns array with single or multiple roots
	function _solveQuadratic(a,b,c) {
		var results = [];
		var quadDet;

		if (b*b > 4*a*c) { 
			quadDet = Math.sqrt(b*b - 4*a*c);
		}
		else {
			// No Real Roots
			return false;
		}
		if(quadDet == 0) {
			// Single Root
			results[0] = (-b/(2*a));
		}
		else {
			// Two Real Roots
			results[0] = (-b + quadDet)/(2*a);
			results[1] = (-b - quadDet)/(2*a);
		}

		return results;
	}

	return {
		calculateCollisionTime: 		calculateCollisionTime,
		calculateProjectileVelocity: 	calculateProjectileVelocity
	}
}();