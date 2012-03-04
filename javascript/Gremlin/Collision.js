var Collision = function() {
	// TODO: Should proabably introduce bounding volumes and save those to objects and do comparisions on those, for now we'll just feed all the data in.
	function isPointInsideSphere(spherePosition, radius, point) {
		var difference = [];
		vec3.subtract(spherePosition, point, difference);
		var separation = vec3.length(difference);
		if (separation < radius) return true;
		return false;
	}
	function sphereToSphereIntersect(spherePos1, radius1, spherePos2, radius2) {
		var difference = [];
		vec3.subtract(spherePos1, spherePos2, difference);
		var separation = vec3.length(difference);
		if (separation < (radius1 + radius2)) return true;
		return false;
	}
	// TODO: Bounding Boxes

	// TODO: High Speed Collisions (check between previous positions and current position)

	return {
		isPointInsideSphere: 			isPointInsideSphere,
		sphereToSphereIntersect:		sphereToSphereIntersect
	}
}();