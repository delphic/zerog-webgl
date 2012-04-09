// ZeroG.Game.Projectile
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