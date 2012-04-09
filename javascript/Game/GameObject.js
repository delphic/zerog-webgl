// ZeroG.Game.GameObject
// TODO: extract components and add "attach" to attach components
// TODO: prototype functions!
function GameObject(parameters) {
    if(!(this instanceof GameObject)) {
        return new GameObject(parameters);
    }

    this.position = parameters.position ? vec3.create(parameters.position) : [0,0,0];
    this.attach = function(object) {
        if(object instanceof Components.Ship) {
            this.ship = object;
            this.ship.parent = this;
        }
        else if(object instanceof ShipAI.Type) {
            this.shipAi = object;
            this.shipAi.parent = this;
        }
    }

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
