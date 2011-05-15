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
	
	// Lighting 
	var lighting = false;
	// Environmental Light
	var ambientLight = [];
	var directionalLight = [];
	
	function setLightEnvironment(ambientR, ambientG, ambientB, directionalR, directionalG, directionalB, directionalX, directionalY, directionalZ) {
		ambientLight.r = ambientR;
		ambientLight.g = ambientG;
		ambientLight.b = ambientB;
		directionalLight.r = directionalR;
		directionalLight.g = directionalG;
		directionalLight.b = directionalB;
		directionalLight.x = directionalX;
		directionalLight.y = directionalY;
		directionalLight.z = directionalZ;
	}
	
	function setLighting(val) {
		lighting = val;
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
		
		// Set Shader
		// Question: Should we really be switching shader by object? If we have to surely we should do all of each type to cut down the changes.
		_setShaderByObject(object);
		
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
		
		if (object.useTextures) {
			// Textures
			_gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.textureCoords);
			_gl.vertexAttribPointer(_shaderProgram.textureCoordAttribute, object.buffers.textureCoords.itemSize, _gl.FLOAT, false, 0, 0);

			_gl.activeTexture(_gl.TEXTURE0);
			_gl.bindTexture(_gl.TEXTURE_2D, object.texture);
			_gl.uniform1i(_shaderProgram.samplerUniform, 0);
			
			// TODO: Separate useTexture and add useLighting
			
			// Normals
			_gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.vertexNormals); 
			_gl.vertexAttribPointer(_shaderProgram.vertexNormalAttribute, object.buffers.vertexNormals.itemSize, _gl.FLOAT, false, 0, 0);
			
			
			// Setting Lights 
			// TODO: This needs it's own section
			// TODO: Unnest from use textures
			if(lighting) {
				_gl.uniform1i(_shaderProgram.useLightingUniform, true);
				// Ambient Colour
				_gl.uniform3f(_shaderProgram.ambientColorUniform, ambientLight.r, ambientLight.g, ambientLight.b);
				// Light Direction
				// TODO: Move Calculation
				// TODO: Stop it rotating with camera
				var lightingDirection = [ directionalLight.x, directionalLight.y, directionalLight.z];
				var adjustedLD = vec3.create();
				vec3.normalize(lightingDirection, adjustedLD);
				vec3.scale(adjustedLD, -1);
				// Unrotate Vec for camera
				// HACK - We really shouldn't have to adjust for camera
				// This is a consequence of rotating out of the scene into camera coords before rendering
				// Consider moving adding uniform to shader to undo camera rotation
				var cameraRotation = mat4.create();
				mat4.identity(cameraRotation);
				mat4.rotate(cameraRotation, -degToRad(_playerCamera.yaw), [0, 1, 0]);
				mat4.rotate(cameraRotation, -degToRad(_playerCamera.pitch), [1, 0, 0]);
				mat4.multiplyVec3(cameraRotation, adjustedLD, adjustedLD);
				
				_gl.uniform3fv(_shaderProgram.lightingDirectionUniform, adjustedLD);
				// Directional Light Colour
				_gl.uniform3f(_shaderProgram.directionalColorUniform,directionalLight.r,directionalLight.g,directionalLight.b);
			}
		}
		
        _setMatrixUniforms();
		
		if (!object.wireframe) {
			if(object.useIndices) {
				_gl.drawElements(_gl.TRIANGLES, object.buffers.vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.TRIANGLES, 0, object.buffers.vertexPosition.numItems);
			}
		}
		else {
			if(object.useIndices) {
				_gl.drawElements(_gl.LINES, object.buffers.vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.LINES, 0, object.buffers.vertexPosition.numItems);
			}
		}
        _mvPopMatrix();
	}
		
    function createPrimitive(object, objectType, wireframe, textured, size, latBands, longBands) {
		// TODO: Add Cylinders, Generalise to Cuboids & Elipsoids and add 2D shapes Rays, Elipses, Rectangles 
		// TODO: add parameters for creation (i.e. size, number of sides for spheres / cylinders etc)
		// TODO: Convert colour buffers to single colour
		if (wireframe) {
			object.wireframe = true;
		}
		if (objectType === "pyramid") {
			// TODO: Convert to use index buffer
			var pyramidVertexPositionBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
			var vertices = [
				// Front face
				 0.0,  size,  0.0,
				-size, -size,  size,
				 size, -size,  size,

				// Right face
				 0.0,  size,  0.0,
				 size, -size,  size,
				 size, -size, -size,

				// Back face
				 0.0,  size,  0.0,
				 size, -size, -size,
				-size, -size, -size,

				// Left face
				 0.0,  size,  0.0,
				-size, -size, -size,
				-size, -size,  size,
				
				// Bottom face
				-size, -size, -size,
				-size, -size, size,
				size, -size, size,
				-size, -size, -size,
				size, -size, size,
				size, -size, -size
				
			];
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
			pyramidVertexPositionBuffer.itemSize = 3;
			pyramidVertexPositionBuffer.numItems = 18;
			
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
				0.0, 1.0, 0.0, 1.0,
				
				// Bottom face
				0.0, 0.0, 1.0, 1.0,
				0.0, 1.0, 0.0, 1.0,
				0.0, 0.0, 1.0, 1.0,
				0.0, 0.0, 1.0, 1.0,
				0.0, 0.0, 1.0, 1.0,
				0.0, 1.0, 0.0, 1.0
			];
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(colors), _gl.STATIC_DRAW);
			pyramidVertexColorBuffer.itemSize = 4;
			pyramidVertexColorBuffer.numItems = 18;

			object.assignBuffer("vertexColor", pyramidVertexColorBuffer);
		}
		else if (objectType === "cube"){
			// Vertex Buffer
			var cubeVertexPositionBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
			vertices = [
				// Front face
				-size, -size,  size,
				 size, -size,  size,
				 size,  size,  size,
				-size,  size,  size,

				// Back face
				-size, -size, -size,
				-size,  size, -size,
				 size,  size, -size,
				 size, -size, -size,

				// Top face
				-size,  size, -size,
				-size,  size,  size,
				 size,  size,  size,
				 size,  size, -size,

				// Bottom face
				-size, -size, -size,
				 size, -size, -size,
				 size, -size,  size,
				-size, -size,  size,

				// Right face
				 size, -size, -size,
				 size,  size, -size,
				 size,  size,  size,
				 size, -size,  size,

				// Left face
				-size, -size, -size,
				-size, -size,  size,
				-size,  size,  size,
				-size,  size, -size
			];
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
			cubeVertexPositionBuffer.itemSize = 3;
			cubeVertexPositionBuffer.numItems = 24;
			
			object.assignBuffer("vertexPosition", cubeVertexPositionBuffer);
		
			// Texture Buffer
			if(textured) {
				var cubeVertexTextureCoordBuffer;
				cubeVertexTextureCoordBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
				var textureCoords = [
				  // Front face
				  0.0, 0.0,
				  1.0, 0.0,
				  1.0, 1.0,
				  0.0, 1.0,

				  // Back face
				  1.0, 0.0,
				  1.0, 1.0,
				  0.0, 1.0,
				  0.0, 0.0,

				  // Top face
				  0.0, 1.0,
				  0.0, 0.0,
				  1.0, 0.0,
				  1.0, 1.0,

				  // Bottom face
				  1.0, 1.0,
				  0.0, 1.0,
				  0.0, 0.0,
				  1.0, 0.0,

				  // Right face
				  1.0, 0.0,
				  1.0, 1.0,
				  0.0, 1.0,
				  0.0, 0.0,

				  // Left face
				  0.0, 0.0,
				  1.0, 0.0,
				  1.0, 1.0,
				  0.0, 1.0,
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(textureCoords), _gl.STATIC_DRAW);
				cubeVertexTextureCoordBuffer.itemSize = 2;
				cubeVertexTextureCoordBuffer.numItems = 24;
				
				object.assignBuffer("textureCoords", cubeVertexTextureCoordBuffer);
				object.useTextures = true;
			}
			else {
				// Color Buffer
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
			}

			// Normal Buffer
			// WARNING: This is dependant on shader program should make this more robust
			var cubeVertexNormalBuffer;
			cubeVertexNormalBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, cubeVertexNormalBuffer);
			var vertexNormals = [
			  // Front face
			   0.0,  0.0,  1.0,
			   0.0,  0.0,  1.0,
			   0.0,  0.0,  1.0,
			   0.0,  0.0,  1.0,

			  // Back face
			   0.0,  0.0, -1.0,
			   0.0,  0.0, -1.0,
			   0.0,  0.0, -1.0,
			   0.0,  0.0, -1.0,

			  // Top face
			   0.0,  1.0,  0.0,
			   0.0,  1.0,  0.0,
			   0.0,  1.0,  0.0,
			   0.0,  1.0,  0.0,

			  // Bottom face
			   0.0, -1.0,  0.0,
			   0.0, -1.0,  0.0,
			   0.0, -1.0,  0.0,
			   0.0, -1.0,  0.0,

			  // Right face
			   1.0,  0.0,  0.0,
			   1.0,  0.0,  0.0,
			   1.0,  0.0,  0.0,
			   1.0,  0.0,  0.0,

			  // Left face
			  -1.0,  0.0,  0.0,
			  -1.0,  0.0,  0.0,
			  -1.0,  0.0,  0.0,
			  -1.0,  0.0,  0.0,
			];
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexNormals), _gl.STATIC_DRAW);
			cubeVertexNormalBuffer.itemSize = 3;
			cubeVertexNormalBuffer.numItems = 24;
			
			object.assignBuffer("vertexNormals", cubeVertexNormalBuffer);
			
			// Index Buffer
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
			// Method taken from Lesson 11 of learningWebGL.com
			var latitudeBands = latBands;
			var longitudeBands = longBands;
			var radius = size;

			var vertexPositionData = [];
			var normalData = [];
			var textureCoordData = [];
			for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
				var theta = latNumber * Math.PI / latitudeBands;
				var sinTheta = Math.sin(theta);
				var cosTheta = Math.cos(theta);

				// Generate Values
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

			// Vertex Buffer
			var sphereVertexPositionBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), _gl.STATIC_DRAW);
			sphereVertexPositionBuffer.itemSize = 3;
			sphereVertexPositionBuffer.numItems = vertexPositionData.length / 3;
			
			object.assignBuffer("vertexPosition", sphereVertexPositionBuffer);
			
			// Normals, WARNING: dependant on shaderProgram
			var sphereVertexNormalBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(normalData), _gl.STATIC_DRAW);
			sphereVertexNormalBuffer.itemSize = 3;
			sphereVertexNormalBuffer.numItems = normalData.length / 3;
			
			object.assignBuffer("vertexNormals", sphereVertexNormalBuffer);
			
			if (textured) {
				var sphereVertexTextureCoordBuffer = _gl.createBuffer();
				
				_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(textureCoordData), _gl.STATIC_DRAW);
				sphereVertexTextureCoordBuffer.itemSize = 2;
				sphereVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;
				
				object.assignBuffer("textureCoords", sphereVertexTextureCoordBuffer);
				object.useTextures = true;
			} 
			else {
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
			}

			// Index Buffer
			var sphereVertexIndexBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
			_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), _gl.STATIC_DRAW);
			sphereVertexIndexBuffer.itemSize = 1;
			sphereVertexIndexBuffer.numItems = indexData.length;
			
			object.assignBuffer("vertexIndex", sphereVertexIndexBuffer);
			object.useIndices = true; 
		}
		else if (objectType==="ray") {
			object.wireframe = true;
			
			var rayVertexPositionBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, rayVertexPositionBuffer);
			var vertices = [
				 0.0,  0.0,  0,
				 0.0, 0.0,  size,				
			];
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
			rayVertexPositionBuffer.itemSize = 3;
			rayVertexPositionBuffer.numItems = 2;
			
			object.assignBuffer("vertexPosition", rayVertexPositionBuffer);
			
			var rayVertexColorBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, rayVertexColorBuffer);
			var colors = [
				1.0, 0.0, 0.0, 1.0,
				1.0, 0.0, 0.0, 1.0,
			];
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(colors), _gl.STATIC_DRAW);
			rayVertexColorBuffer.itemSize = 4;
			rayVertexColorBuffer.numItems = 2;

			object.assignBuffer("vertexColor", rayVertexColorBuffer);
		}
	}
	
	// TODO: Add engine texture manager
	function createTexture(fileName) {
		var texture;
		texture = _gl.createTexture();
		texture.image = new Image();
		texture.image.src = fileName;
		return texture;
	}
	function handleLoadedTexture(texture, quality) {
		// Quality
		// 1 = Nearest Filtering, 2 = Linear Fitlering, 3 = Mipmaps
		_gl.bindTexture(_gl.TEXTURE_2D, texture);
		_gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, true);
		_gl.texImage2D(_gl.TEXTURE_2D, 0, _gl.RGBA, _gl.RGBA, _gl.UNSIGNED_BYTE, texture.image);
		if(quality === 3) {
			_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
			_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR_MIPMAP_NEAREST);
			_gl.generateMipmap(_gl.TEXTURE_2D);
		}
		else if (quality === 2) {
			_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.LINEAR);
			_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.LINEAR);
		}
		else {
			_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MAG_FILTER, _gl.NEAREST);
			_gl.texParameteri(_gl.TEXTURE_2D, _gl.TEXTURE_MIN_FILTER, _gl.NEAREST);
		}
		_gl.bindTexture(_gl.TEXTURE_2D, null);
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
		
		// TODO: Lighting Shader Only
		var normalMatrix = mat3.create();
		mat4.toInverseMat3(_mvMatrix, normalMatrix);
		mat3.transpose(normalMatrix);
		_gl.uniformMatrix3fv(_shaderProgram.nMatrixUniform, false, normalMatrix);
    }
	
	// Shader Code
	// TODO: Move programs to a manager in render
	// TODO: Move shader specific stuff to it's own JS file
	var _shaderProgram;	
	var _shaderPrograms = [];
	
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

	function _createShader(vertexShaderID, fragmentShaderID, type) {
		var fragmentShader = _getShader(_gl, vertexShaderID);
        var vertexShader = _getShader(_gl, fragmentShaderID);

        var program = _gl.createProgram();
        _gl.attachShader(program, vertexShader);
        _gl.attachShader(program, fragmentShader);
        _gl.linkProgram(program);

        if (!_gl.getProgramParameter(program, _gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }

        program.vertexPositionAttribute = _gl.getAttribLocation(program, "aVertexPosition");
        _gl.enableVertexAttribArray(program.vertexPositionAttribute);
		
		if(type == "Colour") {
			program.vertexColorAttribute = _gl.getAttribLocation(program, "aVertexColor");
			_gl.enableVertexAttribArray(program.vertexColorAttribute);
		}
		else if (type == "Textured") {
			program.textureCoordAttribute = _gl.getAttribLocation(program, "aTextureCoord");
			_gl.enableVertexAttribArray(program.textureCoordAttribute);
			
			// Normals
			program.vertexNormalAttribute = _gl.getAttribLocation(program, "aVertexNormal");
			_gl.enableVertexAttribArray(program.vertexNormalAttribute);
		}

        program.pMatrixUniform = _gl.getUniformLocation(program, "uPMatrix");
        program.mvMatrixUniform = _gl.getUniformLocation(program, "uMVMatrix");
		
		// Lighting Uniforms
		// TODO: Generalise
		program.nMatrixUniform = _gl.getUniformLocation(program, "uNMatrix");
        program.samplerUniform = _gl.getUniformLocation(program, "uSampler");
        program.useLightingUniform = _gl.getUniformLocation(program, "uUseLighting");
        program.ambientColorUniform = _gl.getUniformLocation(program, "uAmbientColor");
        program.lightingDirectionUniform = _gl.getUniformLocation(program, "uLightingDirection");
        program.directionalColorUniform = _gl.getUniformLocation(program, "uDirectionalColor");
		
		return program
	}
	
	function _setShaderByObject(object) {
		if (object.useTextures) { _shaderProgram = _shaderPrograms.Texture; }
		else { _shaderProgram = _shaderPrograms.Colour; }
		_gl.useProgram(_shaderProgram);
	}
	function _initShaders() {
		_shaderPrograms["Colour"] = _createShader("colour-shader-vs", "colour-shader-fs", "Colour");
		_shaderPrograms["Texture"] = _createShader("texture-shader-vs", "texture-shader-fs", "Textured");
    }	
	
	//	 _                     _ _           
	//	| |__   __ _ _ __   __| | | ___  ___ 
	//	| '_ \ / _` | '_ \ / _` | |/ _ \/ __|
	//	| | | | (_| | | | | (_| | |  __/\__ \
	//	|_| |_|\__,_|_| |_|\__,_|_|\___||___/

	return { 
		init: 						init, 
		createPrimitive:			createPrimitive,
		createTexture:				createTexture,
		handleLoadedTexture:		handleLoadedTexture,
		setLightEnvironment:		setLightEnvironment,
		setLighting:				setLighting,
		prepareScene: 				prepareScene, 
		renderObject:				renderObject,
		movePlayerCamera:			movePlayerCamera,
		rotatePlayerCamera:			rotatePlayerCamera,
		degToRad: 					degToRad 
	};
}

var Gremlin = _Gremlin();