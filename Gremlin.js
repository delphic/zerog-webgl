//	   ___                    _ _                          _            
//	  / _ \_ __ ___ _ __ ___ | (_)_ __     ___ _ __   __ _(_)_ __   ___ 
//	 / /_\/ '__/ _ \ '_ ` _ \| | | '_ \   / _ \ '_ \ / _` | | '_ \ / _ \
//	/ /_\\| | |  __/ | | | | | | | | | | |  __/ | | | (_| | | | | |  __/
//	\____/|_|  \___|_| |_| |_|_|_|_| |_|  \___|_| |_|\__, |_|_| |_|\___|
//													 |___/             
// 		A simultaneous learning WebGL & JavaScript Experiment!
//		v0.1
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

		_gl.clearColor(0.0, 0.0, 0.0, 1.0);
        _gl.enable(_gl.DEPTH_TEST);
	}
	

	// Prepare Scene - Clears View, and sets perspective and camera 
	// TODO: Should separate this into several functions
    function prepareScene() {
        _gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, _gl.viewportWidth / _gl.viewportHeight, 0.1, 100.0, _pMatrix);

		// Set Camera View
		mat4.identity(_mvMatrix);
		// TODO: Add Roll
        mat4.rotate(_mvMatrix, -degToRad(_playerCamera.pitch), [1, 0, 0]);
		mat4.rotate(_mvMatrix, -degToRad(_playerCamera.yaw), [0, 1, 0]);
        mat4.translate(_mvMatrix, [-_playerCamera.x, -_playerCamera.y, -_playerCamera.z]);
    }
	
	// Render Game Object
	function renderObject(object) {
		_mvPushMatrix();
		mat4.translate(_mvMatrix, [object.x, object.y, object.z]);
        
		mat4.multiply(_mvMatrix, object.rotation, _mvMatrix);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.vertexPosition);
        _gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, object.buffers.vertexPosition.itemSize, _gl.FLOAT, false, 0, 0);

		if(object.buffers.vertexColor) {
			_gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.vertexColor);
			_gl.vertexAttribPointer(_shaderProgram.vertexColorAttribute, object.buffers.vertexColor.itemSize, _gl.FLOAT, false, 0, 0);
		}
		if (object.useIndices) {
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, object.buffers.vertexIndex);
		}
		
		// TODO: Add Textures & Normals
		
        _setMatrixUniforms();
		
        if(object.useIndices) {
			_gl.drawElements(_gl.TRIANGLES, object.buffers.vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
		}
		else {
			_gl.drawArrays(_gl.TRIANGLES, 0, object.buffers.vertexPosition.numItems);
		}
        _mvPopMatrix();
	}
	// Render as Wireframe
	// TODO: Remove duplicated code
	// Consider if this should be a flag on render function instead or a state on the Gremlin object
	function renderObjectAsWireFrame(object) {
		_mvPushMatrix();
		mat4.translate(_mvMatrix, [object.x, object.y, object.z]);
        
		mat4.multiply(_mvMatrix, object.rotation, _mvMatrix);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.vertexPosition);
        _gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, object.buffers.vertexPosition.itemSize, _gl.FLOAT, false, 0, 0);

		if(object.buffers.vertexColor) {
			_gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.vertexColor);
			_gl.vertexAttribPointer(_shaderProgram.vertexColorAttribute, object.buffers.vertexColor.itemSize, _gl.FLOAT, false, 0, 0);
		}
		if (object.useIndices) {
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, object.buffers.vertexIndex);
		}
		
		// TODO: Add Textures & Normals!
		
        _setMatrixUniforms();
		
		if(object.useIndices) {
			_gl.drawElements(_gl.LINES, object.buffers.vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
		}
		else {
			_gl.drawArrays(_gl.LINES, 0, object.buffers.vertexPosition.numItems);
		}
        _mvPopMatrix();
	}
	
	// TODO: Should have an init buffer for object method - manager for objects in game code
	// Debug shapes vertex info stored in engine
	// Debug shapes to have a single colour
    function createDebugBuffers(object, objectType) {
		// TODO: Add Cylinders, Generalise to Cuboids & Elipsoids and add 2D shapes Rays, Elipses, Rectangles 
		// TODO: add parameters for creation (i.e. size, number of sides for spheres / cylinders etc)
		if (objectType === "pyramid") {
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
			
			object.assignBuffer("vertexPosition", pyramidVertexPositionBuffer);

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

			object.assignBuffer("vertexColor", pyramidVertexColorBuffer);
		}
		else if (objectType === "cube"){
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
			
			object.assignBuffer("vertexPosition", cubeVertexPositionBuffer);

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
		
			object.assignBuffer("vertexColor", cubeVertexColorBuffer);
		
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
			
			object.assignBuffer("vertexIndex", cubeVertexIndexBuffer);
			object.useIndices = true; 
		}
		else if (objectType==="sphere") {
			// TODO: Ability to set latitude and longitude in function
			// - will require a number of createDebugBuffer functions
			// Method taken from Lesson 11 of learningWebGL.com
			var latitudeBands = 30;
			var longitudeBands = 30;
			var radius = 1;

			var vertexPositionData = [];
			var normalData = [];
			var textureCoordData = [];
			for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
				var theta = latNumber * Math.PI / latitudeBands;
				var sinTheta = Math.sin(theta);
				var cosTheta = Math.cos(theta);

				for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
					var phi = longNumber * 2 * Math.PI / longitudeBands;
					var sinPhi = Math.sin(phi);
					var cosPhi = Math.cos(phi);

					var x = cosPhi * sinTheta;
					var y = cosTheta;
					var z = sinPhi * sinTheta;
					var u = 1 - (longNumber / longitudeBands);
					var v = 1 - (latNumber / latitudeBands);

					normalData.push(x);
					normalData.push(y);
					normalData.push(z);
					textureCoordData.push(u);
					textureCoordData.push(v);
					vertexPositionData.push(radius * x);
					vertexPositionData.push(radius * y);
					vertexPositionData.push(radius * z);
				}
			}

			var indexData = [];
			for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
				for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
					var first = (latNumber * (longitudeBands + 1)) + longNumber;
					var second = first + longitudeBands + 1;
					indexData.push(first);
					indexData.push(second);
					indexData.push(first + 1);

					indexData.push(second);
					indexData.push(second + 1);
					indexData.push(first + 1);
				}
			}

			// TODO: Include textures (although not for debug shapes or at least not yet) and normals (yes for debug shapes too)!
			/*var sphereVertexNormalBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(normalData), _gl.STATIC_DRAW);
			sphereVertexNormalBuffer.itemSize = 3;
			sphereVertexNormalBuffer.numItems = normalData.length / 3;

			var sphereVertexTextureCoordBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(textureCoordData), _gl.STATIC_DRAW);
			sphereVertexTextureCoordBuffer.itemSize = 2;
			sphereVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;
			*/
			
			var sphereVertexPositionBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), _gl.STATIC_DRAW);
			sphereVertexPositionBuffer.itemSize = 3;
			sphereVertexPositionBuffer.numItems = vertexPositionData.length / 3;
			
			object.assignBuffer("vertexPosition", sphereVertexPositionBuffer);
			
			var sphereVertexColorBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexColorBuffer);
			colors = []
			// Weyhey! Random Stripey Sphere!
			for (var i=0; i < sphereVertexPositionBuffer.numItems; i++) {
				if(i%3 === 0) {
					colors = colors.concat([1.0, 0.0, 0.0, 1.0]);
				}
				else if (i%3 === 1){
					colors = colors.concat([0.0, 0.0, 1.0, 1.0]);
				}
				else {
					colors = colors.concat([0.0, 1.0, 0.0, 1.0]);
				}
			}
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(colors), _gl.STATIC_DRAW);
			sphereVertexColorBuffer.itemSize = 4;
			sphereVertexColorBuffer.numItems = sphereVertexPositionBuffer.numItems;
			
			object.assignBuffer("vertexColor", sphereVertexColorBuffer);

			var sphereVertexIndexBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
			_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), _gl.STATIC_DRAW);
			sphereVertexIndexBuffer.itemSize = 1;
			sphereVertexIndexBuffer.numItems = indexData.length;
			
			object.assignBuffer("vertexIndex", sphereVertexIndexBuffer);
			object.useIndices = true; 
		}
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
		init: 						init, 
		createDebugBuffers:			createDebugBuffers,
		prepareScene: 				prepareScene, 
		renderObject:				renderObject,
		renderObjectAsWireFrame: 	renderObjectAsWireFrame,
		movePlayerCamera:			movePlayerCamera,
		rotatePlayerCamera:			rotatePlayerCamera,
		degToRad: 					degToRad 
	};
}

var Gremlin = _Gremlin();