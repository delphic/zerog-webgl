// Render Object Properties
function Render(parameters) {
	if(!(this instanceof Render)) {
		return new Render(parameters);
	}

	this.buffers = [];

	this.texture;
	this.color = [1.0,1.0,1.0,1.0];
	this.setColor = setColor;
	this.shininess = 0;
	this.setShininess = setShininess;

	this.isSkyBox = false;
	this.setIsSkyBox = setIsSkyBox;

	this.setScale = setScale;
	this.scale = parameters.scale ? vec3.create(parameters.scale) : vec3.create([1, 1, 1]);
	this.animate = parameters.animate || function() { };

    // The offset in parent coordinate space
    this.offset = parameters.offset ? vec3.create(parameters.offset) : vec3.create([0,0,0]);
    this.subRotation = parameters.rotation ? mat4.create(parameters.rotation) : mat4.identity(mat4.create());
    this.rotate = function(amount, X, Y, Z) {
        mat4.rotate(this.subRotation, Gremlin.Gizmo.degToRad(amount), [X, Y, Z]);
    };

    // Properties for rendering
    this.position = vec3.create();
    this.rotation = mat4.identity(mat4.create());

    // Objects used in calculations for memory saving
    var vec1 = vec3.create([0,0,0]);

    this.render = function() {
        if (this.parent) {
            // Set Position
            mat4.multiplyVec3(this.parent.rotation, this.offset, vec1);
            vec3.add(vec1, this.parent.position, this.position);
            // Set Rotation
            mat4.multiply(this.parent.rotation, this.subRotation, this.rotation);
        } else {
            this.position = this.offset;
            this.rotation = this.subRotation;
        }
        Gremlin.Gizmo.renderObject(this);
    }

	// Render Flags
	this.visible = true;
	this.useIndices = false;
	this.useTextures = false;
    this.useLighting = true;
    this.setUseLighting = setUseLighting;

    // Assigning Buffers
    this.assignBuffer = assignBuffer;

    function setScale(x,y,z) {
        if(y && z) { this.scale = [x,y,z]; }
        else { this.scale = x; }
    }
    function setColor(r,g,b,a) { this.color = [r,g,b,a]; }
    function setUseLighting(val) { this.useLighting = val; }
    function setShininess(val) { this.shininess = val; }

    function setIsSkyBox(val) { this.isSkyBox = val; if(this.isSkyBox) this.useLighting = false; }

    function assignBuffer(index) {
        this.buffers = index;
    }
}