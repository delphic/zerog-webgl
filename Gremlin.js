//	   ___                    _ _                          _            
//	  / _ \_ __ ___ _ __ ___ | (_)_ __     ___ _ __   __ _(_)_ __   ___ 
//	 / /_\/ '__/ _ \ '_ ` _ \| | | '_ \   / _ \ '_ \ / _` | | '_ \ / _ \
//	/ /_\\| | |  __/ | | | | | | | | | | |  __/ | | | (_| | | | | |  __/
//	\____/|_|  \___|_| |_| |_|_|_|_| |_|  \___|_| |_|\__, |_|_| |_|\___|
//													 |___/             
// 		A simultaneous learning WebGL & JavaScript Experiment!
//
// 		Delph 2011

function _Gremlin() {

	//				 _     _ _      
	//	 _ __  _   _| |__ | (_) ___ 
	//	| '_ \| | | | '_ \| | |/ __|
	//	| |_) | |_| | |_) | | | (__ 
	//	| .__/ \__,_|_.__/|_|_|\___|
	//	|_| 

	function init() {
		var canvas = document.getElementById("gremlinCanvas");
		_initGL(canvas);        
		_initShaders();
		_initBuffers();		

		_gl.clearColor(0.0, 0.0, 0.0, 1.0);
        _gl.enable(_gl.DEPTH_TEST);
	}
	

	// Draw Scene
    function drawScene() {
        _gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, _gl.viewportWidth / _gl.viewportHeight, 0.1, 100.0, _pMatrix);

		// Set Camera View
		mat4.identity(_mvMatrix);
		// TODO: Add Roll
        mat4.rotate(_mvMatrix, -degToRad(_playerCamera.pitch), [1, 0, 0]);
		mat4.rotate(_mvMatrix, -degToRad(_playerCamera.yaw), [0, 1, 0]);
        mat4.translate(_mvMatrix, [-_playerCamera.x, -_playerCamera.y, -_playerCamera.z]);

		// TODO: Use Manager
		_renderObject(pyramid);
		_renderObject(cube);
    }
	
	// Animate Function
	function animate(elapsed) {
		pyramid.rotate( ( (180 * elapsed) / 1000.0), 0, 1, 0);
		cube.rotate( ( (75 * elapsed) / 1000.0), 1, 1, 1);
	}
	
	// Camera Functions
	function movePlayerCamera(dx,dy,dz) {
		_playerCamera.moveCamera(dx, dy, dz);
	}
	function rotatePlayerCamera(dyaw, dpitch) {
		_playerCamera.rotateCamera(dyaw, dpitch);
	}
	
	// Maths Functions
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

	
	//				_            _       
	//	 _ __  _ __(_)_   ____ _| |_ ___ 
	//	| '_ \| '__| \ \ / / _` | __/ _ \
	//	| |_) | |  | |\ V / (_| | ||  __/
	//	| .__/|_|  |_| \_/ \__,_|\__\___|
	//	|_| 
	
	// WebGL Obj
	var _gl;
	
	// View Matrix
    var _mvMatrix = mat4.create();
    var _mvMatrixStack = [];
    // Perspective Matrix
	var _pMatrix = mat4.create();

	// Basic Camera Obj
	// TODO: Add Roll
	// TODO: Convert to Matrix - remove Pitch Clamping
	function camera(x,y,z, yaw, pitch) {
		this.x = x;
		this.y = y; 
		this.z = z;
		this.yaw = yaw;
		this.pitch = pitch;
		
		this.rotateCamera = rotateCamera;
		this.moveCamera = moveCamera;
		
		// TODO: Add rotate around axis function
		function rotateCamera(dyaw, dpitch) {
			this.yaw += dyaw;
			this.pitch += dpitch;
			// Pitch Clamp
			if (this.pitch > 89.9) this.pitch = 89.8;
			else if (this.pitch < -89.9) this.pitch = 89.8;
		}
		function moveCamera(dx,dy,dz) {
			var syaw = Math.sin(degToRad(this.yaw));
			var cyaw = Math.cos(degToRad(this.yaw));
			
			this.x += dz*syaw+dx*cyaw;
			this.z += -dx*syaw+dz*cyaw;
			this.y += dy; // TODO: Implement Unfixed Up Axis
		}
	}
	
	var _playerCamera = new camera(0,0,5, 0, 0);
	
	// Game Object Obj
	function gameObject(x,y,z) {
		this.x = x;
		this.y = y;
		this.z = z;
		
		this.rotation = mat4.create();
		mat4.identity(this.rotation);
		
		this.buffers = [];
		
		this.move = move;
		this.setPosition = setPosition;
		this.rotate = rotate;
		this.setRotation = setRotation;
		this.assignBuffer = assignBuffer;
		this.useIndices = false;
		
		function setPosition(x,y,z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}
		function move(dx, dy, dz) {
			this.x += dx;
			this.y += dy;
			this.z += dz;
		}
		function rotate(amount, X, Y, Z) {
			mat4.rotate(this.rotation, degToRad(amount), [X, Y, Z]);
		}
		function setRotation(yaw, pitch, roll) {
			mat4.identity(this.rotation);
			// TODO: Check order of rotations
			mat4.rotate(this.rotation, degToRad(yaw), [0,1,0]);
			mat4.rotate(this.rotation, degToRad(pitch), [1,0,0]);
			mat4.rotate(this.rotation, degToRad(roll), [0,0,0]);
		}
		function assignBuffer(name, buffer) {
			this.buffers[name] = buffer;
		}
	}
	
	// Init functions
    function _initGL(canvas) {
        try {
            _gl = canvas.getContext("experimental-webgl");
            _gl.viewportWidth = canvas.width;
            _gl.viewportHeight = canvas.height;
        } catch (e) {
        }
        if (!_gl) {
            alert("Could not initialise WebGL");
        }
    }
	
	// TODO: Place in an array in a manager
	var pyramid = new gameObject(-1.5,0,-8.0);
	var cube = new gameObject(1.5,0,-8.0);
	
	// TODO: Alter to use manager
	// Vertices for Debug Shapes to be stored in engine
	// Debug shapes to have a single colour
    function _initBuffers() {
        var pyramidVertexPositionBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
        var vertices = [
            // Front face
             0.0,  1.0,  0.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,

            // Right face
             0.0,  1.0,  0.0,
             1.0, -1.0,  1.0,
             1.0, -1.0, -1.0,

            // Back face
             0.0,  1.0,  0.0,
             1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,

            // Left face
             0.0,  1.0,  0.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0
        ];
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
        pyramidVertexPositionBuffer.itemSize = 3;
        pyramidVertexPositionBuffer.numItems = 12;
		
		pyramid.assignBuffer("vertexPosition", pyramidVertexPositionBuffer);

        var pyramidVertexColorBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
        var colors = [
            // Front face
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,

            // Right face
            1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0,

            // Back face
            1.0, 0.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,

            // Left face
            1.0, 0.0, 0.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 1.0, 0.0, 1.0
        ];
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(colors), _gl.STATIC_DRAW);
        pyramidVertexColorBuffer.itemSize = 4;
        pyramidVertexColorBuffer.numItems = 12;

		pyramid.assignBuffer("vertexColor", pyramidVertexColorBuffer);

        var cubeVertexPositionBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ];
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
        cubeVertexPositionBuffer.itemSize = 3;
        cubeVertexPositionBuffer.numItems = 24;
		
		cube.assignBuffer("vertexPosition", cubeVertexPositionBuffer);

        var cubeVertexColorBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, cubeVertexColorBuffer);
        colors = [
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [0.0, 0.0, 1.0, 1.0]  // Left face
        ];
        var unpackedColors = [];
        for (var i in colors) {
            var color = colors[i];
            for (var j=0; j < 4; j++) {
                unpackedColors = unpackedColors.concat(color);
            }
        }
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(unpackedColors), _gl.STATIC_DRAW);
        cubeVertexColorBuffer.itemSize = 4;
        cubeVertexColorBuffer.numItems = 24;
		
		cube.assignBuffer("vertexColor", cubeVertexColorBuffer);
		
        var cubeVertexIndexBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ];
        _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), _gl.STATIC_DRAW);
        cubeVertexIndexBuffer.itemSize = 1;
        cubeVertexIndexBuffer.numItems = 36;
		
		cube.assignBuffer("vertexIndex", cubeVertexIndexBuffer);
		cube.useIndices = true; 
    }

	// Render Game Object
	function _renderObject(object) {
		_mvPushMatrix();
		mat4.translate(_mvMatrix, [object.x, object.y, object.z]);
        
		mat4.multiply(_mvMatrix, object.rotation, _mvMatrix);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.vertexPosition);
        _gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, object.buffers.vertexPosition.itemSize, _gl.FLOAT, false, 0, 0);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.vertexColor);
        _gl.vertexAttribPointer(_shaderProgram.vertexColorAttribute, object.buffers.vertexColor.itemSize, _gl.FLOAT, false, 0, 0);

		if (object.useIndices) {
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, cube.buffers.vertexIndex);
		}
		
		// TODO: Add Textures!
		
        _setMatrixUniforms();
		
		// TODO: Debug objects to be drawn depedent on flag (render as - wireframe or solid)
		// Should be flag on rendering engine?
        if(object.useIndices) {
			_gl.drawElements(_gl.TRIANGLES, object.buffers.vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
		}
		else {
			_gl.drawArrays(_gl.TRIANGLES, 0, object.buffers.vertexPosition.numItems);
		}
        _mvPopMatrix();
	}
	
	// Matrix Functions - Stack functions and Set Shader Uniforms
	function _mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(_mvMatrix, copy);
        _mvMatrixStack.push(copy);
    }

    function _mvPopMatrix() {
        if (_mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        _mvMatrix = _mvMatrixStack.pop();
    }

	// Question - Should this be group with Shader or Rendering Code?
    function _setMatrixUniforms() {
        _gl.uniformMatrix4fv(_shaderProgram.pMatrixUniform, false, _pMatrix);
        _gl.uniformMatrix4fv(_shaderProgram.mvMatrixUniform, false, _mvMatrix);
    }
	
	// Shader Code
	// TODO: Move programs to a manager in render
	// TODO: Move shader specific stuff to it's own JS file
	var _shaderProgram;	
	
	function _getShader(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }

        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }

        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

	function _initShaders() {
        var fragmentShader = _getShader(_gl, "shader-fs");
        var vertexShader = _getShader(_gl, "shader-vs");

        _shaderProgram = _gl.createProgram();
        _gl.attachShader(_shaderProgram, vertexShader);
        _gl.attachShader(_shaderProgram, fragmentShader);
        _gl.linkProgram(_shaderProgram);

        if (!_gl.getProgramParameter(_shaderProgram, _gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        _gl.useProgram(_shaderProgram);

        _shaderProgram.vertexPositionAttribute = _gl.getAttribLocation(_shaderProgram, "aVertexPosition");
        _gl.enableVertexAttribArray(_shaderProgram.vertexPositionAttribute);

        _shaderProgram.vertexColorAttribute = _gl.getAttribLocation(_shaderProgram, "aVertexColor");
        _gl.enableVertexAttribArray(_shaderProgram.vertexColorAttribute);

        _shaderProgram.pMatrixUniform = _gl.getUniformLocation(_shaderProgram, "uPMatrix");
        _shaderProgram.mvMatrixUniform = _gl.getUniformLocation(_shaderProgram, "uMVMatrix");
    }	
	
	//	 _                     _ _           
	//	| |__   __ _ _ __   __| | | ___  ___ 
	//	| '_ \ / _` | '_ \ / _` | |/ _ \/ __|
	//	| | | | (_| | | | | (_| | |  __/\__ \
	//	|_| |_|\__,_|_| |_|\__,_|_|\___||___/

	return { 
		init: 				init, 
		drawScene: 			drawScene, 
		animate: 			animate,
		movePlayerCamera:	movePlayerCamera,
		rotatePlayerCamera:	rotatePlayerCamera,
		degToRad: 			degToRad 
	};
}

var Gremlin = _Gremlin();