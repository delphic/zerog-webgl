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
	
	function resize() {
		var canvas = document.getElementById("gremlinCanvas");
		_gl.viewportWidth = canvas.width;
        _gl.viewportHeight = canvas.height;
	}
	// Lighting 
	// Possibly should have it's own namespace
	var lightingFlags = [];
	// Environmental Light
	var ambientLight = [];
	var directionalLight = [];
	var pointLights = [];
	var spotLights = [];

	function addPointLight(x,y,z,r,g,b) {
		var pointLight = [];
		pointLight.x = x;
		pointLight.y = y;
		pointLight.z = z;
		pointLight.r = r;
		pointLight.g = g;
		pointLight.b = b;
		pointLight.on = true;
		// TODO: TO add check that we've not reached the max number of lights
		pointLights.push(pointLight);
		
		return (pointLights.length-1);
	}
	
	function setPointLight(i,x,y,z,r,g,b) {
		var pointLight = [];
		pointLight.x = x;
		pointLight.y = y;
		pointLight.z = z;
		pointLight.r = r;
		pointLight.g = g;
		pointLight.b = b;
		pointLights[i] = pointLight;
	}
	
	function updatePointLight(i,dx,dy,dz,dr,dg,db) {
		pointLights[i].x += dx;
		pointLights[i].y += dy;
		pointLights[i].z += dz;
		pointLights[i].r += dr;
		pointLights[i].g += dg;
		pointLights[i].b += db;
	}
	
	function addSpotLight(x,y,z,dirX,dirY,dirZ,r,g,b,theta,thi,falloff) {
		var spotLight = [];
		spotLight.x = x;
		spotLight.y = y;
		spotLight.z = z;
		spotLight.dirX = dirX;
		spotLight.dirY = dirY;
		spotLight.dirZ = dirZ;
		spotLight.r = r;
		spotLight.g = g;
		spotLight.b = b;
		spotLight.theta = degToRad(theta);
		spotLight.thi = degToRad(thi);
		spotLight.falloff = falloff;
		spotLight.on = true;
		spotLights.push(spotLight);
		
		return (spotLights.length-1);
	}
	
	function setSpotLight(i,x,y,z,dirX,dirY,dirZ,r,g,b,theta,thi,falloff) {
		var spotLight = [];
		spotLight.x = x;
		spotLight.y = y;
		spotLight.z = z;
		spotLight.dirX = dirX;
		spotLight.dirY = dirY;
		spotLight.dirZ = dirZ;
		spotLight.r = r;
		spotLight.g = g;
		spotLight.b = b;
		spotLight.theta = degToRad(theta);
		spotLight.thi = degToRad(thi);
		spotLight.falloff = falloff;
		spotLights[i] = spotLight;
	}
	
	function updateSpotLight(i,dx,dy,dz,ddirX,ddirY,ddirZ,dr,dg,db,dtheta,dthi,dfalloff) {
		spotLights[i].x += dx;
		spotLights[i].y += dy;
		spotLights[i].z += dz;
		spotLights[i].dirX += ddirX;
		spotLights[i].dirY += ddirY;
		spotLights[i].dirZ += ddirZ;
		spotLights[i].r += dr;
		spotLights[i].g += dg;
		spotLights[i].b += db;
		spotLights[i].theta += degToRad(dtheta);
		spotLights[i].thi += degToRad(dthi);
		spotLights[i].falloff += dfalloff;
	}
	
	function setLight(val, type) {
		if(type==="Spot") { spotLights[i].on = val; }
		else if (type==="Point") { pointLights[i].on = val; }
	}
	
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
	
	function setLightingFlags(name, val) {
		lightingFlags[name] = val;
	}
	
	// Prepare Scene - Clears View, and sets perspective and camera 
	// TODO: Should separate this into several functions
    function prepareScene() {
        _gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, _gl.viewportWidth / _gl.viewportHeight, 0.1, 10000.0, _pMatrix);

		// Set Camera View
		// This transforms the model view matrix to use the camera coordinate system
		// Anything specified in global coords rather than in relation to the newly 
		// calculated mvMatrix, will also need to be transformed
		mat4.identity(_mvMatrix);
		mat4.multiply(_mvMatrix, _playerCamera.rotationMatrix);
        mat4.translate(_mvMatrix, [-_playerCamera.x, -_playerCamera.y, -_playerCamera.z]);
    }
	
	// Render Game Object
	function renderObject(object) {
		
		if (!object.visible) return;
		_mvPushMatrix();
		if (!object.isSkyBox) {
			mat4.translate(_mvMatrix, [object.x, object.y, object.z]);        
		}
		else {
			// TODO: This is depedant on current implementation of camera, try to decouple
			mat4.translate(_mvMatrix, [_playerCamera.x, _playerCamera.y, _playerCamera.z]);
		}
		mat4.multiply(_mvMatrix, object.rotation, _mvMatrix);
		
		if(object.scale != 1) mat4.scale(_mvMatrix, [object.scale,object.scale,object.scale] , _mvMatrix);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.vertexPosition);
        _gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, object.buffers.vertexPosition.itemSize, _gl.FLOAT, false, 0, 0);

		if (object.useIndices) {
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, object.buffers.vertexIndex);
		}
		
		_gl.uniform4fv(_shaderProgram.colorUniform, object.color);
		
		if (object.useTextures) {
			_gl.uniform1i(_shaderProgram.useTexturesUniform, true);
			_gl.enableVertexAttribArray(_shaderProgram.textureCoordAttribute);
			// Textures
			_gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.textureCoords);
			_gl.vertexAttribPointer(_shaderProgram.textureCoordAttribute, object.buffers.textureCoords.itemSize, _gl.FLOAT, false, 0, 0);

			_gl.activeTexture(_gl.TEXTURE0);
			_gl.bindTexture(_gl.TEXTURE_2D, object.texture);
			_gl.uniform1i(_shaderProgram.samplerUniform, 0);
		}
		else {
			// BUG: This does not result in full colour, but a reduced colour
			// This can be combatted by increasing the colour
			_gl.disableVertexAttribArray(_shaderProgram.textureCoordAttribute);
			_gl.uniform1i(_shaderProgram.useTexturesUniform, false);
		}
		
				
		// Setting Lights 
		if(lightingFlags.lighting && object.useLighting) {
			// TODO: Move the non-object dependant lights out of the object renderer?
				// We might want to feed in different lights depedant on value...
			_gl.uniform1i(_shaderProgram.useLightingUniform, true);
			if (lightingFlags.specularLighting && object.shininess > 0) {
				_gl.uniform1i(_shaderProgram.useSpecularUniform, true); 
			}
			else {
				_gl.uniform1i(_shaderProgram.useSpecularUniform, false);
			}
			// Normals
			_gl.enableVertexAttribArray(_shaderProgram.vertexNormalAttribute);
			_gl.bindBuffer(_gl.ARRAY_BUFFER, object.buffers.vertexNormals); 
			_gl.vertexAttribPointer(_shaderProgram.vertexNormalAttribute, object.buffers.vertexNormals.itemSize, _gl.FLOAT, false, 0, 0);
			
			// Ambient Light
			_gl.uniform3f(_shaderProgram.ambientColorUniform, ambientLight.r, ambientLight.g, ambientLight.b);
			
			// Directional Light
			var lightingDirection = [ directionalLight.x, directionalLight.y, directionalLight.z];
			var adjustedLD = vec3.create();
			vec3.normalize(lightingDirection, adjustedLD);
			vec3.scale(adjustedLD, -1);
			_playerCamera.rotation(adjustedLD);
			_gl.uniform3fv(_shaderProgram.lightingDirectionUniform, adjustedLD);
			// Directional Light Colour
			_gl.uniform3f(_shaderProgram.directionalColorUniform,directionalLight.r,directionalLight.g,directionalLight.b);
			
			// Point Lights
			_gl.uniform1i(_shaderProgram.pointLightingNumberUniform, pointLights.length);
			for(var i=0; i<pointLights.length; i++){
				if (i > 8) break; // 8 is max number of points lights
				_setPointLight(i, _playerCamera);
			}
			
			// Spot Lights
			_gl.uniform1i(_shaderProgram.spotLightingNumberUniform, spotLights.length); 
			for(var i=0; i<spotLights.length; i++){
				if (i > 8) break; // 8 is max number of points lights
				_setSpotLight(i, _playerCamera);
			}
			
			// Material / Specular
			_gl.uniform1f(_shaderProgram.materialShininessUniform, object.shininess);
		}
		else {
			_gl.uniform1i(_shaderProgram.useLightingUniform, false);
			_gl.disableVertexAttribArray(_shaderProgram.vertexNormalAttribute);
		}
		
        _setMatrixUniforms();
		
		if (!object.wireframe && !object.points) {
			if(object.useIndices) {
				_gl.drawElements(_gl.TRIANGLES, object.buffers.vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.TRIANGLES, 0, object.buffers.vertexPosition.numItems);
			}
		}
		else if (object.wireframe){
			if(object.useIndices) {
				_gl.drawElements(_gl.LINES, object.buffers.vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.LINES, 0, object.buffers.vertexPosition.numItems);
			}
		}
		else {
			if(object.useIndices) {
				_gl.drawElements(_gl.POINTS, object.buffers.vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.POINTS, 0, object.buffers.vertexPosition.numItems);
			}
		}
        _mvPopMatrix();
	}

	// Primitive Creation Functions
	// TODO: Add Cylinders, Generalise to Cuboids & Elipsoids and add 2D shapes Rays, Elipses, Rectangles 
	function createPyramid(object, textured, size) {
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
	}
	function createCube(object, textured, size) {
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
	function createSphere(object, textured, size, latBands, longBands) {
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
		
		// Index Buffer
		var sphereVertexIndexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), _gl.STATIC_DRAW);
		sphereVertexIndexBuffer.itemSize = 1;
		sphereVertexIndexBuffer.numItems = indexData.length;
		
		object.assignBuffer("vertexIndex", sphereVertexIndexBuffer);
		object.useIndices = true; 
	}
	function createRay(object, size) {
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
	}
    function createPoint(object) {
		object.points = true;
			
		var pointVertexPositionBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, pointVertexPositionBuffer);
		var vertices = [0.0, 0.0, 0.0];
		
		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
		pointVertexPositionBuffer.itemSize = 3;
		pointVertexPositionBuffer.numItems = 1;
		
		object.assignBuffer("vertexPosition", pointVertexPositionBuffer);
	}
	
	function loadModel(object, fileName, scale){
		object.visible = false;
		object.scale = scale;
		var request = new XMLHttpRequest();
        request.open("GET", fileName);
        request.onreadystatechange = function () {
            if (request.readyState == 4) {
                _handleLoadedModel(object, JSON.parse(request.responseText));
            }
        }
        request.send();
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
	function movePlayerCameraZX(dx,dy,dz) {
		_playerCamrea.moveCameraZX(dx, dy, dz);
	}
	function setPlayerCameraRotation(yaw, pitch, roll) {
		_playercamera.setRotation(yaw, pitch, roll);
	}
	function rotatePlayerCamera(dyaw, dpitch, droll) {
		_playerCamera.rotateCamera(dyaw, dpitch, droll);
	}
	function playerCameraPos(value) {
		value[0] = _playerCamera.x;
		value[1] = _playerCamera.y; 
		value[2] = _playerCamera.z;
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
	// TODO: May need an attach to camera function useable from the game code
	function camera(x,y,z, yaw, pitch, roll) {
		this.x = x;
		this.y = y; 
		this.z = z;
		
		// Create Rotation Matrix
		rotMatrix = mat4.create();
		mat4.identity(rotMatrix);
		mat4.rotate(rotMatrix, -degToRad(pitch), [1, 0, 0]);
		mat4.rotate(rotMatrix, -degToRad(yaw), [0, 1, 0]);
		mat4.rotate(rotMatrix, -degToRad(roll), [0, 0, 1]);
		this.rotationMatrix = rotMatrix;
		
		this.setRotation= setRotation; 
		this.rotateCamera = rotateCamera;
		this.moveCamera = moveCamera;
		this.moveCameraZX = moveCameraZX;
		this.rotation = rotation;
		this.transform = transform;
		
		// TODO: Add Roll
		function setRotation(yaw, pitch, roll) {
			// Sets Rotation Matrix in Global Y P R
			mat4.identity(this.rotationMatrix);
			mat4.rotate(this.rotationMatrix, -degToRad(pitch), [1, 0, 0]);
			mat4.rotate(this.rotationMatrix, -degToRad(yaw), [0, 1, 0]);
			mat4.rotate(this.rotationMatrix, -degToRad(roll), [0, 0, 1]);
		}
		function rotateCamera(dyaw, dpitch, droll) {
			// Rotates around local axes
			var newRotation = mat4.create();
			mat4.identity(newRotation);
			mat4.rotate(newRotation, -degToRad(dpitch), [1, 0, 0]);
			mat4.rotate(newRotation, -degToRad(dyaw), [0, 1, 0]);
			mat4.rotate(newRotation, -degToRad(droll), [0, 0, 1]);
			mat4.multiply(newRotation, this.rotationMatrix, this.rotationMatrix);
		}
		function moveCamera(dx,dy,dz) {
			/* 
			* The transpose of the rotation matrix corresponds to:
			* LocalX.x 	LocalX.y 	LocalX.z 	0
			* LocalY.x 	LocalY.y 	LocalY.z 	0
			* LocalZ.x 	LocalZ.y 	LocalZ.z 	0
			* 0			0			0			1
			*/
			this.x += this.rotationMatrix[0]*dx + this.rotationMatrix[1]*dy + this.rotationMatrix[2]*dz
			this.y += this.rotationMatrix[4]*dx + this.rotationMatrix[5]*dy + this.rotationMatrix[6]*dz
			this.z += this.rotationMatrix[8]*dx + this.rotationMatrix[9]*dy + this.rotationMatrix[10]*dz
		}
		function moveCameraZX(dx,dy,dz) {
			// Moves Camera clamps to x-z axis
			this.x += this.rotationMatrix[0]*dx + this.rotationMatrix[2]*dz; // Probably need to normalise these
			this.y += dy;
			this.z += this.rotationMatrix[8]*dx + this.rotationMatrix[10]*dz; // Probably need to normalise these
		}
		function rotation(vector) {
			var cameraRotation = mat4.create();
			mat4.multiplyVec3(this.rotationMatrix, vector, vector);
		}
		function transform(vector) {
			var cameraTransform = mat4.create(this.rotationMatrix);
			mat4.translate(cameraTransform, [-this.x, -this.y, -this.z]);
			mat4.multiplyVec3(cameraTransform, vector, vector);
		}
	}
	
	var _playerCamera = new camera(0,0,5, 0, 0, 0);
	
	// Lighting Functions
	function _setPointLight(i, camera){
		if(pointLights[i].on) {
			// TODO: Add check that i is not greater than max # of lights
			var pointLightingLocation = [pointLights[i].x, pointLights[i].y, pointLights[i].z];
			camera.transform(pointLightingLocation);				
			_gl.uniform3fv(_shaderProgram.pointLightingLocationUniform[i], pointLightingLocation);
			_gl.uniform3f(_shaderProgram.pointLightingColorUniform[i], pointLights[i].r, pointLights[i].g, pointLights[i].b);
		}
	}
	
	function _setSpotLight(i, camera){
		if(spotLights[i].on) {
			var spotLightLocation = [spotLights[i].x,spotLights[i].y,spotLights[i].z];
			var spotLightDirection = [spotLights[i].dirX,spotLights[i].dirY,spotLights[i].dirZ];
			var spotLightColor = [spotLights[i].r,spotLights[i].g,spotLights[i].b];
				
			camera.rotation(spotLightDirection);
			camera.transform(spotLightLocation);
					
			_gl.uniform3fv(_shaderProgram.spotLightingLocationUniform[i], spotLightLocation);
			_gl.uniform3fv(_shaderProgram.spotLightingDirectionUniform[i], spotLightDirection);
			_gl.uniform3fv(_shaderProgram.spotLightingColorUniform[i], spotLightColor);
			_gl.uniform1f(_shaderProgram.spotLightingThetaUniform[i], spotLights[i].theta);
			_gl.uniform1f(_shaderProgram.spotLightingThiUniform[i], spotLights[i].thi);
			_gl.uniform1f(_shaderProgram.spotLightingFalloffUniform[i], spotLights[i].falloff);
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
	
	// Model Functions
	function _handleLoadedModel(object, modelData) {
		var modelVertexNormalBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, modelVertexNormalBuffer);
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(modelData.vertexNormals), _gl.STATIC_DRAW);
        modelVertexNormalBuffer.itemSize = 3;
        modelVertexNormalBuffer.numItems = modelData.vertexNormals.length / 3;
		
		object.assignBuffer("vertexNormals", modelVertexNormalBuffer);

        var modelVertexTextureCoordBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, modelVertexTextureCoordBuffer);
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(modelData.vertexTextureCoords), _gl.STATIC_DRAW);
        modelVertexTextureCoordBuffer.itemSize = 2;
        modelVertexTextureCoordBuffer.numItems = modelData.vertexTextureCoords.length / 2;
		
		object.assignBuffer("textureCoords", modelVertexTextureCoordBuffer);
		object.useTextures = true; // TODO: check that there were some tex-coords

        var modelVertexPositionBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ARRAY_BUFFER, modelVertexPositionBuffer);
        _gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(modelData.vertexPositions), _gl.STATIC_DRAW);
        modelVertexPositionBuffer.itemSize = 3;
        modelVertexPositionBuffer.numItems = modelData.vertexPositions.length / 3;
		
		object.assignBuffer("vertexPosition", modelVertexPositionBuffer);

        var modelVertexIndexBuffer = _gl.createBuffer();
        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);
        _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indices), _gl.STATIC_DRAW);
        modelVertexIndexBuffer.itemSize = 1;
        modelVertexIndexBuffer.numItems = modelData.indices.length;

		object.assignBuffer("vertexIndex", modelVertexIndexBuffer);
		object.useIndices = true; 
		
		object.visible = true;
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

	function _createShader(vertexShaderID, fragmentShaderID) {
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
		
		// Textures
		program.colorUniform = _gl.getUniformLocation(program, "uColor");
		program.textureCoordAttribute = _gl.getAttribLocation(program, "aTextureCoord");
		_gl.enableVertexAttribArray(program.textureCoordAttribute);
		program.useTexturesUniform = _gl.getUniformLocation(program, "uUseTextures");
			
		// Normals
		program.vertexNormalAttribute = _gl.getAttribLocation(program, "aVertexNormal");
		_gl.enableVertexAttribArray(program.vertexNormalAttribute);
		
        program.pMatrixUniform = _gl.getUniformLocation(program, "uPMatrix");
        program.mvMatrixUniform = _gl.getUniformLocation(program, "uMVMatrix");
		
		// Lighting Uniforms
		// TODO: Generalise
		program.nMatrixUniform = _gl.getUniformLocation(program, "uNMatrix");
        program.samplerUniform = _gl.getUniformLocation(program, "uSampler");
		// Lighting Flag
        program.useLightingUniform = _gl.getUniformLocation(program, "uUseLighting");
		// Environmental Light (Ambient + Directional)
        program.ambientColorUniform = _gl.getUniformLocation(program, "uAmbientColor");
        program.lightingDirectionUniform = _gl.getUniformLocation(program, "uLightingDirection");
        program.directionalColorUniform = _gl.getUniformLocation(program, "uDirectionalColor");
		// Point Lights
		program.pointLightingLocationUniform = new Array();
		program.pointLightingColorUniform = new Array();
		program.pointLightingNumberUniform = _gl.getUniformLocation(program, "uPointLightNumber");
		for(var i=0; i<8; i++) { // Max 8 Point Lights
			program.pointLightingLocationUniform[i] = _gl.getUniformLocation(program, "uPointLightingLocation["+i+"]");
			program.pointLightingColorUniform[i] = _gl.getUniformLocation(program, "uPointLightingColor["+i+"]");
		}
		// Spot Lights
		program.spotLightingLocationUniform = new Array();
		program.spotLightingDirectionUniform = new Array();
		program.spotLightingColorUniform = new Array();
		program.spotLightingThetaUniform = new Array();
		program.spotLightingThiUniform = new Array();
		program.spotLightingFalloffUniform = new Array();
		program.spotLightingNumberUniform = _gl.getUniformLocation(program, "uSpotLightNumber");
		for(var i=0; i<8; i++) { // Max 8 Spot Lights
			program.spotLightingLocationUniform[i] = _gl.getUniformLocation(program, "uSpotLightLocation["+i+"]");
			program.spotLightingDirectionUniform[i] = _gl.getUniformLocation(program, "uSpotLightDirection["+i+"]");
			program.spotLightingColorUniform[i] = _gl.getUniformLocation(program, "uSpotLightColor["+i+"]");
			program.spotLightingThetaUniform[i] = _gl.getUniformLocation(program, "uSpotLightTheta["+i+"]");
			program.spotLightingThiUniform[i] = _gl.getUniformLocation(program, "uSpotLightThi["+i+"]");
			program.spotLightingFalloffUniform[i] = _gl.getUniformLocation(program, "uSpotLightFalloff["+i+"]");
		}
		
		// Specular Lighting
		// TODO: if we want separate specular colours will have to add an array of uniforms for colour
		program.useSpecularUniform = _gl.getUniformLocation(program, "uUseSpecular");
		program.materialShininessUniform = _gl.getUniformLocation(program, "uMaterialShininess");
		
		return program;
	}
	
	function _setShaderByObject(type) {
		if (type==="Pixel") {
			_shaderProgram = _shaderPrograms.Pixel; 
		} 
		else if (type==="Vertex") {
			_shaderProgram = _shaderPrograms.Vertex; 
		}
		_gl.useProgram(_shaderProgram);
	}
	function _initShaders() {
		_shaderPrograms["Vertex"] = _createShader("vertex-shader-vs", "vertex-shader-fs");
		_shaderPrograms["Pixel"] = _createShader("pixel-shader-vs", "pixel-shader-fs");
		_shaderProgram = _shaderPrograms.Pixel;
		_gl.useProgram(_shaderProgram);
    }	
	
	//	 _                     _ _           
	//	| |__   __ _ _ __   __| | | ___  ___ 
	//	| '_ \ / _` | '_ \ / _` | |/ _ \/ __|
	//	| | | | (_| | | | | (_| | |  __/\__ \
	//	|_| |_|\__,_|_| |_|\__,_|_|\___||___/

	return { 
		init: 						init, 
		resize: 					resize,
		createPyramid:				createPyramid,
		createCube:					createCube,
		createSphere:				createSphere,
		createRay:					createRay,
		createPoint:				createPoint,
		loadModel:					loadModel,
		createTexture:				createTexture,
		handleLoadedTexture:		handleLoadedTexture,
		setLightEnvironment:		setLightEnvironment,
		setLightingFlags:			setLightingFlags,
		addPointLight:				addPointLight,
		setPointLight:				setPointLight,
		updatePointLight:			updatePointLight,
		addSpotLight: 				addSpotLight,
		setSpotLight:				setSpotLight,
		updateSpotLight:			updateSpotLight,
		setLight: 					setLight,
		prepareScene: 				prepareScene, 
		renderObject:				renderObject,
		movePlayerCamera:			movePlayerCamera,
		movePlayerCameraZX:			movePlayerCameraZX,
		setPlayerCameraRotation:	setPlayerCameraRotation,
		rotatePlayerCamera:			rotatePlayerCamera,
		playerCameraPos:			playerCameraPos,
		degToRad: 					degToRad 
	};
}

var Gremlin = _Gremlin();

function _GremlinEventHandler() {
	
	//				 _     _ _      
	//	 _ __  _   _| |__ | (_) ___ 
	//	| '_ \| | | | '_ \| | |/ __|
	//	| |_) | |_| | |_) | | | (__ 
	//	| .__/ \__,_|_.__/|_|_|\___|
	//	|_| 
	
	function bindEvent(eventName, func, override) {
		// This can almost certainly be replaced with addEventListener
		switch(eventName){
		case "onresize":
			resize.push(func);
			break;
		case "onblur":
			blur.push(func);
			break;
		case "onfocus":
			focus.push(func);
			break;
		case "onmousemove":
			mousemove.push(func);
			break;
		case "onmousedown":
			mousedown.push(func);
			break;
		case "onmouseup":
			mouseup.push(func);
			break;
		case "onkeyup":
			keyup.push(func);
			break;
		case "onkeydown":
			keydown.push(func);
			break;
		default:
			return;
		}
		if(override) {
			overrides[eventName] = true;
		}
	}
	
	// May need an option to return false, but after all events have been executed.
	
	//				_            _       
	//	 _ __  _ __(_)_   ____ _| |_ ___ 
	//	| '_ \| '__| \ \ / / _` | __/ _ \
	//	| |_) | |  | |\ V / (_| | ||  __/
	//	| .__/|_|  |_| \_/ \__,_|\__\___|
	//	|_| 
	
	// Events
	var blur = [];
	var focus = []
	var resize = [];
	
	var mousemove = [];
	var mousedown = [];
	var mouseup = [];
	var keyup = [];
	var keydown = [];
	
	var overrides = [];
	
	function onBlur() {
		for(event in blur)
		{
			blur[event]();
		}
		if (overrides["onblur"]) { return false; }
	}
	function onFocus() {
		for(event in focus)
		{
			focus[event]();
		}
		if (overrides["onfocus"]) { return false; }
	}
	function onResize() {
		for(event in resize)
		{
			resize[event]();
		}
		if (overrides["onresize"]) { return false; }
	}
	
	function onMouseMove(e) {
		for(event in mousemove)
		{
			mousemove[event](e);
		}
		if (overrides["onmousemove"]) { return false; }
	}
	function onMouseDown(e) {
		for(event in mousedown)
		{
			mousedown[event](e);
		}
		if (overrides["onmousedown"]) { return false; }
	}
	function onMouseUp(e) {
		for(event in mouseup)
		{
			mouseup[event](e);
		}
		if (overrides["onmouseup"]) { return false; }
	}
	function onKeyUp(e) {
		for(event in keyup)
		{
			keyup[event](e);
		}
		if (overrides["onkeyup"]) { return false; }
	}
	function onKeyDown(e) {
		for(event in keydown)
		{
			keydown[event](e);
		}
		if (overrides["onkeydown"]) { return false; }
	}

	// Bind Arrays
	document.onkeydown = function() { onKeyDown(event); }
	document.onkeyup = function() { onKeyUp(event); }
	
	// May want to move this to canvas
	document.onmousemove = function() { onMouseMove(event); }
	document.onmousedown = function() { onMouseDown(event); }
	document.onmouseup = function() { onMouseUp(event); }
	
	window.onresize = function() { onResize(); }
	window.onblur = function() { onBlur(); }
	window.onfocus = function() { onFocus(); }
	
	//	 _                     _ _           
	//	| |__   __ _ _ __   __| | | ___  ___ 
	//	| '_ \ / _` | '_ \ / _` | |/ _ \/ __|
	//	| | | | (_| | | | | (_| | |  __/\__ \
	//	|_| |_|\__,_|_| |_|\__,_|_|\___||___/
	
	return {
		bindEvent: bindEvent
	}
}

var GremlinEventHandler = _GremlinEventHandler(); 

function _GremlinInput() {

	// This may need to go in an init function
	GremlinEventHandler.bindEvent("onmousemove", handleMouseMove);
	GremlinEventHandler.bindEvent("onmousedown", handleMouseDown, true);
	GremlinEventHandler.bindEvent("onmouseup", handleMouseUp);
	GremlinEventHandler.bindEvent("onkeyup", handleKeyUp);
	GremlinEventHandler.bindEvent("onkeydown", handleKeyDown);
	
	//				 _     _ _      
	//	 _ __  _   _| |__ | (_) ___ 
	//	| '_ \| | | | '_ \| | |/ __|
	//	| |_) | |_| | |_) | | | (__ 
	//	| .__/ \__,_|_.__/|_|_|\___|
	//	|_| 
	
	// Key State Queries
	function getMousePos() {
		return [xPos, yPos];
	}
	function keyDown(key) {
		// TODO: Add mapping from key letter to key code
		return currentlyPressedKeys[key];
	}
	function mouseDown(button) {
		return mouseState[button];
	}
	
	//				_            _       
	//	 _ __  _ __(_)_   ____ _| |_ ___ 
	//	| '_ \| '__| \ \ / / _` | __/ _ \
	//	| |_) | |  | |\ V / (_| | ||  __/
	//	| .__/|_|  |_| \_/ \__,_|\__\___|
	//	|_| 
	
	var xPos, yPos;
	var currentlyPressedKeys = [];
	var mouseState = [false,false,false];
	// TODO: Add keyUp and mouseUp data (will either need a poll in game tick, or will need to bind a function).
	
	function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
	}
	function handleKeyUp(event) {
		currentlyPressedKeys[event.keyCode] = false;
	}
	function handleMouseMove(event) { // Returns Position in Document
		xPos = event.pageX;
		yPos = event.pageY;
	}
	function handleMouseDown(event) {
		mouseState[event.button] = true; 
	}
	function handleMouseUp(event) {
		mouseState[event.button] = false;
	}
	
	//	 _                     _ _           
	//	| |__   __ _ _ __   __| | | ___  ___ 
	//	| '_ \ / _` | '_ \ / _` | |/ _ \/ __|
	//	| | | | (_| | | | | (_| | |  __/\__ \
	//	|_| |_|\__,_|_| |_|\__,_|_|\___||___/
	
	return {
		getMousePos:	getMousePos,
		keyDown:		keyDown,
		mouseDown:		mouseDown
	}
}

var GremlinInput = _GremlinInput();