// ZeroG.Game.GameObject
// TODO: extract components and add "attach" to attach components
// TODO: prototype functions!
function GameObject(parameters) {
    if(!(this instanceof GameObject)) {
        return new GameObject(parameters);
    }

    this.position = parameters.position ? vec3.create(parameters.position) : [0,0,0];
    this.attach = function(object) {
        if(object && typeof object.attachInstructions == "function") {
            object.attachInstructions(this);
        }
        else {
            throw new Error("Passed object did not have attachInstructions function.");
        }
    }

    this.velocity = parameters.velocity ? vec3.create(parameters.velocity) : [0,0,0];
    this.rotation = parameters.rotation ? mat4.create(parameters.rotation) : mat4.identity(mat4.create());

    this.move = function(dx, dy, dz) {
        this.position[0] += dx;
        this.position[1] += dy;
        this.position[2] += dz;
    };
    this.setPosition = function(x,y,z) {
        this.position = [x,y,z];
    };
    this.setVelocity = function(vx,vy,vz) {
        this.velocity = [vx,vy,vz];
    };
    this.updateVelocity = function(dvx,dvy,dvz) {
        this.velocity[0] += dvx;
        this.velocity[1] += dvy;
        this.velocity[2] += dvz;
    };
    this.update = function(elapsed) {
        this.position[0] += this.velocity[0]*elapsed;
        this.position[1] += this.velocity[1]*elapsed;
        this.position[2] += this.velocity[2]*elapsed;

        for(var key in renderObjects) {
            if(renderObjects.hasOwnProperty(key)) {
                renderObjects[key].animate(elapsed);
            }
        }
    };

    this.rotate = function(amount, X, Y, Z) {
        mat4.rotate(this.rotation, Gremlin.Gizmo.degToRad(amount), [X, Y, Z]);
    };
    this.setRotation = function(yaw, pitch, roll) {
        mat4.identity(this.rotation);
        mat4.rotate(this.rotation, Gremlin.Gizmo.degToRad(yaw), [0,1,0]);
        mat4.rotate(this.rotation, Gremlin.Gizmo.degToRad(pitch), [1,0,0]);
        mat4.rotate(this.rotation, Gremlin.Gizmo.degToRad(roll), [0,0,1]);
    };

    // Render Objects
    var renderObjects = [];
    this.render = function() {
        for(var key in renderObjects) {
            if(renderObjects.hasOwnProperty(key)) {
                renderObjects[key].render();
            }
        }
    }
    this.addRenderObject = function(object) {
        object.parent = this;
        return renderObjects.push(object) - 1;
    }
    this.removeRenderObject = function(index) {
        renderobjects.slice(index);
    }

    this.setColor = function(r,g,b,a) {
        for(var key in renderObjects) {
            if(renderObjects.hasOwnProperty(key)) {
                renderObjects[key].setColor(r,g,b,a);
            }
        }
    }
}
