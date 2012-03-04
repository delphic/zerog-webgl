//     ___                    _ _                          _            
//    / _ \_ __ ___ _ __ ___ | (_)_ __     ___ _ __   __ _(_)_ __   ___ 
//   / /_\/ '__/ _ \ '_ ` _ \| | | '_ \   / _ \ '_ \ / _` | | '_ \ / _ \
//  / /_\\| | |  __/ | | | | | | | | | | |  __/ | | | (_| | | | | |  __/
//  \____/|_|  \___|_| |_| |_|_|_|_| |_|  \___|_| |_|\__, |_|_| |_|\___|
//                                                   |___/             
// 		A simultaneous learning WebGL & JavaScript Experiment!
//		v0.8.2
// 		Delph 2011

// WebGL Obj
// Private to the Gremlin namespace
var _gl;

// Temporarily calling this catch all 'Gizmo' but need to separate this into Camera, Render and other sections
var Gizmo = function() {

	//               _     _ _      
	//   _ __  _   _| |__ | (_) ___ 
	//  | '_ \| | | | '_ \| | |/ __|
	//  | |_) | |_| | |_) | | | (__ 
	//  | .__/ \__,_|_.__/|_|_|\___|
	//  |_| 

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
		// TODO: add check that we've not reached the max number of lights
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

	function setLight(i, val, type) {
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

	function removeLight(index, type) {
		switch(type) {
		case "Ambient":
			ambientLight.splice(0, ambientLight.length);
			break;
		case "Directional":
			directionalLight.splice(0, directionalLight.length);
			break;
		case "Point":
			pointLights.splice(index, 1);
			break;
		case "Spot":
			spotLights.splice(index, 1);
			break;
		default:
			return;
		}
	}

	function removeLights() {
		ambientLight.r = ambientLight.g = ambientLight.b = null;
		directionalLight.r = directionalLight.g = directionalLight.b = directionalLight.x =  directionalLight.y = directionalLight.z = null;
		pointLights.splice(0,pointLights.length);
		spotLights.splice(0,spotLights.length);
	}

	function setShader(type) {
		if (type==="Pixel") {
			_shaderProgram = _shaderPrograms.Pixel; 
		} 
		else if (type==="Vertex") {
			_shaderProgram = _shaderPrograms.Vertex; 
		}
		_gl.useProgram(_shaderProgram);
	}

	// Prepare Scene - Clears View, and sets perspective and camera 
	// TODO: Should separate this into several functions
	function prepareScene() {
		_gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
		_gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

		mat4.perspective(45, _gl.viewportWidth / _gl.viewportHeight, 0.1, 20000.0, _pMatrix);

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
			mat4.translate(_mvMatrix, object.position); // TODO: use a getter
		}
		else {
			// TODO: This is depedant on current implementation of camera, try to decouple
			mat4.translate(_mvMatrix, [_playerCamera.x+object.position[0], _playerCamera.y+object.position[1], _playerCamera.z+object.position[2]]);
		}
		mat4.multiply(_mvMatrix, object.rotation, _mvMatrix);

		if(object.scale != [1,1,1]) mat4.scale(_mvMatrix, object.scale, _mvMatrix);

		_gl.bindBuffer(_gl.ARRAY_BUFFER, buffersList[object.buffers].vertexPosition);
		_gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, buffersList[object.buffers].vertexPosition.itemSize, _gl.FLOAT, false, 0, 0);

		if (buffersList[object.buffers].useIndices) {
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, buffersList[object.buffers].vertexIndex);
		}

		_gl.uniform4fv(_shaderProgram.colorUniform, object.color);

		if (object.useTextures) {
			_gl.uniform1i(_shaderProgram.useTexturesUniform, true);
			_gl.enableVertexAttribArray(_shaderProgram.textureCoordAttribute);
			// Textures
			_gl.bindBuffer(_gl.ARRAY_BUFFER, buffersList[object.buffers].textureCoords);
			_gl.vertexAttribPointer(_shaderProgram.textureCoordAttribute, buffersList[object.buffers].textureCoords.itemSize, _gl.FLOAT, false, 0, 0);

			_gl.activeTexture(_gl.TEXTURE0);
			_gl.bindTexture(_gl.TEXTURE_2D, textureList[object.texture]);
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
			// We might want to feed in different lights dependant on value...
			_gl.uniform1i(_shaderProgram.useLightingUniform, true);
			if (lightingFlags.specularLighting && object.shininess > 0) {
				_gl.uniform1i(_shaderProgram.useSpecularUniform, true); 
			}
			else {
				_gl.uniform1i(_shaderProgram.useSpecularUniform, false);
			}
			// Normals
			_gl.enableVertexAttribArray(_shaderProgram.vertexNormalAttribute);
			_gl.bindBuffer(_gl.ARRAY_BUFFER, buffersList[object.buffers].vertexNormals); 
			_gl.vertexAttribPointer(_shaderProgram.vertexNormalAttribute, buffersList[object.buffers].vertexNormals.itemSize, _gl.FLOAT, false, 0, 0);

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
			for(i=0; i<spotLights.length; i++){
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

		_setMatrixUniforms(_pMatrix, _mvMatrix);

		if (!(object.wireframe || buffersList[object.buffers].renderMode === "wireframe") && !(object.points || buffersList[object.buffers].renderMode === "points")) {
			if(buffersList[object.buffers].useIndices) {
				_gl.drawElements(_gl.TRIANGLES, buffersList[object.buffers].vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.TRIANGLES, 0, buffersList[object.buffers].vertexPosition.numItems);
			}
		}
		else if (object.wireframe || buffersList[object.buffers].renderMode === "wireframe"){
			if(buffersList[object.buffers].useIndices) {
				_gl.drawElements(_gl.LINES, buffersList[object.buffers].vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.LINES, 0, buffersList[object.buffers].vertexPosition.numItems);
			}
		}
		else {
			if(buffersList[object.buffers].useIndices) {
				_gl.drawElements(_gl.POINTS, buffersList[object.buffers].vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.POINTS, 0, buffersList[object.buffers].vertexPosition.numItems);
			}
		}
		_mvPopMatrix();
	}

	function renderPlane(object) {
		if (!object.visible) return;
		var mvMatrix = mat4.create();
		var pMatrix = mat4.create();

		mat4.identity(pMatrix);
		mat4.identity(mvMatrix);

		mat4.translate(mvMatrix, object.position);

		mat4.multiply(mvMatrix, object.rotation, mvMatrix);

		if(object.size != [1,1]) mat4.scale(mvMatrix, [object.size[0],object.size[1],1], mvMatrix);

		// Enable Blending // TODO: Do this properly as part of the improves to the engine
		_gl.blendFunc(_gl.SRC_ALPHA, _gl.ONE_MINUS_SRC_ALPHA);
		_gl.enable(_gl.BLEND);
		_gl.disable(_gl.DEPTH_TEST);

		_gl.bindBuffer(_gl.ARRAY_BUFFER, buffersList[object.buffers].vertexPosition);
		_gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, buffersList[object.buffers].vertexPosition.itemSize, _gl.FLOAT, false, 0, 0);

		if (buffersList[object.buffers].useIndices) {
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, buffersList[object.buffers].vertexIndex);
		}

		_gl.uniform4fv(_shaderProgram.colorUniform, object.color);

		if (object.useTextures) {
			_gl.uniform1i(_shaderProgram.useTexturesUniform, true);
			_gl.enableVertexAttribArray(_shaderProgram.textureCoordAttribute);
			// Textures
			_gl.bindBuffer(_gl.ARRAY_BUFFER, buffersList[object.buffers].textureCoords);
			_gl.vertexAttribPointer(_shaderProgram.textureCoordAttribute, buffersList[object.buffers].textureCoords.itemSize, _gl.FLOAT, false, 0, 0);

			_gl.activeTexture(_gl.TEXTURE0);
			_gl.bindTexture(_gl.TEXTURE_2D, textureList[object.texture]);
			_gl.uniform1i(_shaderProgram.samplerUniform, 0);
		}
		else {
			// BUG: This does not result in full colour, but a reduced colour
			// This can be combatted by increasing the colour
			_gl.disableVertexAttribArray(_shaderProgram.textureCoordAttribute);
			_gl.uniform1i(_shaderProgram.useTexturesUniform, false);
		}


		// Disable Lights 
		_gl.uniform1i(_shaderProgram.useLightingUniform, false);
		_gl.disableVertexAttribArray(_shaderProgram.vertexNormalAttribute);

		_setMatrixUniforms(pMatrix, mvMatrix);

		if (!(object.wireframe || buffersList[object.buffers].renderMode === "wireframe") && !(object.points || buffersList[object.buffers].renderMode === "points")) {
			if(buffersList[object.buffers].useIndices) {
				_gl.drawElements(_gl.TRIANGLES, buffersList[object.buffers].vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.TRIANGLES, 0, buffersList[object.buffers].vertexPosition.numItems);
			}
		}
		else if (object.wireframe || buffersList[object.buffers].renderMode === "wireframe"){
			if(buffersList[object.buffers].useIndices) {
				_gl.drawElements(_gl.LINES, buffersList[object.buffers].vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.LINES, 0, buffersList[object.buffers].vertexPosition.numItems);
			}
		}
		else {
			if(buffersList[object.buffers].useIndices) {
				_gl.drawElements(_gl.POINTS, buffersList[object.buffers].vertexIndex.numItems, _gl.UNSIGNED_SHORT, 0);
			}
			else {
				_gl.drawArrays(_gl.POINTS, 0, buffersList[object.buffers].vertexPosition.numItems);
			}
		}
		_gl.enable(_gl.DEPTH_TEST);
		_gl.disable(_gl.BLEND);
	}

	// Buffers
	buffersList = []; 			// Stores the Buffers
	buffersNameList = []; 		// Stores what buffers have already been created
	modelLoadingInfo = [];		// An array to store what objects have requested what models and their callbacks

	// Buffer List Access Functions
	function addToBuffersList(name, buffers) {
		buffersNameList[name] = buffersList.push(buffers)-1;
	}
	
	function checkBufferList(name) {
		return isNaN(buffersNameList[name]);
	}
	
	function getBufferIndex(name) {
		return buffersNameList[name];
	}
	
	function loadModel(object, fileName){
		// Object loading
		object.visible = false;

		if (!isNaN(buffersNameList[fileName])) {
			if(buffersNameList[fileName] === -1) {
				// Model is Loading, add to the list
				modelLoadingInfo[fileName].objectsLoading.push(object);
				return;
			}
			// Else Object is loaded
			object.useTextures = true; // TODO: Check if model is textured at all!
			object.assignBuffer(buffersNameList[fileName]);
			object.visible = true;
			return;
		}

		// Model now loading
		increaseAssetsLoading();
		buffersNameList[fileName] = -1;
		// Create Object List and callbacks for use on model load
		modelLoadingInfo[fileName] = new Array();
		modelLoadingInfo[fileName]["objectsLoading"] = new Array();
		// Assign first object in array
		modelLoadingInfo[fileName].objectsLoading.push(object);
		//modelLoadingInfo[fileName].callsbacks.push(callback);

		var request = new XMLHttpRequest();
		request.open("GET", fileName);
		request.onreadystatechange = function () {
			if (request.readyState == 4) {
				_handleLoadedModel(fileName, JSON.parse(request.responseText));
			}
		};
		request.send();
	}

	// Textures
	var textureList = [];			// Stores the textures
	var textureFileList = [];		// Stores which textures have already been loaded

	function createTexture(fileName, quality) {
		if (!isNaN(textureFileList[fileName])) {
			return textureFileList[fileName];
		}
		else {
			increaseAssetsLoading();
			var texture;
			texture = _gl.createTexture();
			texture.image = new Image();
			texture.image.src = fileName;
			var index = textureList.push(texture)-1;
			textureList[index].image.onload = function() { _handleLoadedTexture(textureList[index], (quality)? quality : 3); };
			textureFileList[fileName] = index;
			return index;
		}
	}

	function createTextureFromCanvas(canvasId, callback) {
		increaseAssetsLoading();
		var texture = _gl.createTexture();
		texture.image = document.getElementById(canvasId);
		var index = textureList.push(texture)-1;
		_handleLoadedTexture(textureList[index], 3, callback);
		return index;
	}

	// Camera Functions 
	// TODO: These should probably not be for a specific camera!
	// Argueably we shouldn't be storing camera in engine, and should move to game code
	function movePlayerCamera(dx,dy,dz) {
		_playerCamera.moveCamera(dx, dy, dz);
	}
	function movePlayerCameraZX(dx,dy,dz) {
		_playerCamera.moveCameraZX(dx, dy, dz);
	}
	function setPlayerCamera(x,y,z) {
		_playerCamera.setCamera(x,y,z);
	}
	function setPlayerCameraRotation(yaw, pitch, roll) {
		_playerCamera.setRotation(yaw, pitch, roll);
	}
	function rotatePlayerCamera(dyaw, dpitch, droll) {
		_playerCamera.rotateCamera(dyaw, dpitch, droll);
	}
	function playerCameraPos(value) {
		value[0] = _playerCamera.x;
		value[1] = _playerCamera.y; 
		value[2] = _playerCamera.z;
	}
	function playerCameraRotation(vector) {
		_playerCamera.rotation(vector);
	}
	function playerCameraTransform(vector) {
		_playerCamera.transform(vector);
	}
	function playerCameraReverseRotation(vector) {
		_playerCamera.reverseRotation(vector);
	}
	function playerCameraReverseTransform(vector) {
		_playerCamera.reverseTransform(vector);
	}
	function pickPosition(x,y,d) {
		// d is the distance at which x & y coords is calculated

		var pickPos = vec3.create();
		pickPos[0] = (_gl.viewportWidth/_gl.viewportHeight)*((x - _gl.viewportWidth*0.5)/_gl.viewportWidth)*2*d*Math.tan(degToRad(45*0.5)); 
		pickPos[1] = -((y - _gl.viewportHeight*0.5)/_gl.viewportHeight)*2*d*Math.tan(degToRad(45*0.5));
		pickPos[2] = -d;
		// We now have pick coords in Camera Coord System - Need to Transform to Globals
		_playerCamera.reverseTransform(pickPos);

		return pickPos;
	}
	function reversePick(x,y,z, coords) {
		var position = [x,y,z];
		// We have coords in Globals, convert to Camera Coordinates
		_playerCamera.transform(position);

		if(position[2] > 0) {
			// Object is behind camera.
			return false;
		}

		// Now find x and y position - note finds in ortho coords not pixels.
		coords[0] = -(_gl.viewportHeight/_gl.viewportWidth)*position[0]/(position[2]*Math.tan(degToRad(45*0.5)));
		coords[1] = -position[1]/(position[2]*Math.tan(degToRad(45*0.5)));

		return true;		
	}
	// Maths Functions
	function degToRad(degrees) {
		return degrees * Math.PI / 180;
	}


	//              _            _       
	//   _ __  _ __(_)_   ____ _| |_ ___ 
	//  | '_ \| '__| \ \ / / _` | __/ _ \
	//  | |_) | |  | |\ V / (_| | ||  __/
	//  | .__/|_|  |_| \_/ \__,_|\__\___|
	//  |_| 

	// View Matrix
	var _mvMatrix = mat4.create();
	var _mvMatrixStack = [];
	// Perspective Matrix
	var _pMatrix = mat4.create();

	// Basic Camera Obj
	// TODO: May need an attach to camera function useable from the game code
	function Camera(x,y,z, yaw, pitch, roll) {
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
		this.setCamera = setCamera;
		this.rotation = rotation;
		this.transform = transform;
		this.reverseRotation = reverseRotation;
		this.reverseTransform = reverseTransform;

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
			this.x += this.rotationMatrix[0]*dx + this.rotationMatrix[1]*dy + this.rotationMatrix[2]*dz;
			this.y += this.rotationMatrix[4]*dx + this.rotationMatrix[5]*dy + this.rotationMatrix[6]*dz;
			this.z += this.rotationMatrix[8]*dx + this.rotationMatrix[9]*dy + this.rotationMatrix[10]*dz;
		}
		function moveCameraZX(dx,dy,dz) {
			// Moves Camera clamps to x-z axis
			this.x += this.rotationMatrix[0]*dx + this.rotationMatrix[2]*dz; // Probably need to normalise these
			this.y += dy;
			this.z += this.rotationMatrix[8]*dx + this.rotationMatrix[10]*dz; // Probably need to normalise these
		}
		function setCamera(x,y,z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}
		function rotation(vector) {
			mat4.multiplyVec3(this.rotationMatrix, vector, vector);
		}
		function transform(vector) { // Converts from Global to Camera Coordinates
			var cameraTransform = mat4.create(this.rotationMatrix);
			mat4.translate(cameraTransform, [-this.x, -this.y, -this.z]);
			mat4.multiplyVec3(cameraTransform, vector, vector);
		}
		function reverseRotation(vector) {
			var cameraRotation = mat4.create(this.rotationMatrix);
			mat4.transpose(cameraRotation);
			mat4.multiplyVec3(cameraRotation, vector, vector);
		}
		function reverseTransform(vector) { // Converts from Camera to Global Coordinates
			var cameraTranslation = mat4.create();
			mat4.identity(cameraTranslation);
			mat4.translate(cameraTranslation, [this.x, this.y, this.z]);
			var cameraRotation = mat4.create(this.rotationMatrix);
			mat4.transpose(cameraRotation);
			var cameraTransform = mat4.create();
			mat4.multiply(cameraTranslation, cameraRotation, cameraTransform);
			mat4.multiplyVec3(cameraTransform, vector, vector);
		}
	}

	var _playerCamera = new Camera(0,0,0, 0, 0, 0);

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
			_gl = WebGLDebugUtils.makeDebugContext(canvas.getContext("experimental-webgl"));
			_gl.viewportWidth = canvas.width;
			_gl.viewportHeight = canvas.height;
		} catch (e) {
		}
		if (!_gl) {
			alert("Could not initialise WebGL");
		}
	}

	// Assets (Buffers, Models, Textures)
	var assetsLoading = 0; 
	function increaseAssetsLoading() {
		if(!assetsLoading) { Game.setLoading(true); }
		assetsLoading++;
	}
	function decreaseAssetsLoading() {
		if(assetsLoading) { assetsLoading--; }
		if(!assetsLoading) { Game.setLoading(false); }
	}

	// Textures
	function _handleLoadedTexture(texture, quality, callback) {
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
		decreaseAssetsLoading();
		if (callback) { callback(); }
	}

	// Model Functions
	function _handleLoadedModel(fileName, modelData) {
		var buffers = [];

		var modelVertexNormalBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, modelVertexNormalBuffer);
		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(modelData.vertexNormals), _gl.STATIC_DRAW);
		modelVertexNormalBuffer.itemSize = 3;
		modelVertexNormalBuffer.numItems = modelData.vertexNormals.length / 3;

		buffers["vertexNormals"] = modelVertexNormalBuffer;

		var modelVertexTextureCoordBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, modelVertexTextureCoordBuffer);
		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(modelData.vertexTextureCoords), _gl.STATIC_DRAW);
		modelVertexTextureCoordBuffer.itemSize = 2;
		modelVertexTextureCoordBuffer.numItems = modelData.vertexTextureCoords.length / 2;

		buffers["textureCoords"] = modelVertexTextureCoordBuffer;

		var modelVertexPositionBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ARRAY_BUFFER, modelVertexPositionBuffer);
		_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(modelData.vertexPositions), _gl.STATIC_DRAW);
		modelVertexPositionBuffer.itemSize = 3;
		modelVertexPositionBuffer.numItems = modelData.vertexPositions.length / 3;

		buffers["vertexPosition"] = modelVertexPositionBuffer;

		var modelVertexIndexBuffer = _gl.createBuffer();
		_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, modelVertexIndexBuffer);
		_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelData.indices), _gl.STATIC_DRAW);
		modelVertexIndexBuffer.itemSize = 1;
		modelVertexIndexBuffer.numItems = modelData.indices.length;

		buffers["vertexIndex"] = modelVertexIndexBuffer;
		buffers["useIndices"] = true;

		var index = buffersList.push(buffers)-1;
		buffersNameList[fileName] = index;

		for(var i = 0; i < modelLoadingInfo[fileName].objectsLoading.length; i++) {
			modelLoadingInfo[fileName].objectsLoading[i].assignBuffer(index);
			modelLoadingInfo[fileName].objectsLoading[i].useTextures = true; // TODO: check that there were some tex-coords
			modelLoadingInfo[fileName].objectsLoading[i].visible = true;
		}
		// Delete Loading Info
		modelLoadingInfo[fileName].objectsLoading.splice(0,modelLoadingInfo[fileName].objectsLoading.length);
		decreaseAssetsLoading();
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

	// This should be grouped with the appropriate rendering code
	function _setMatrixUniforms(pMatrix, mvMatrix) {
		_gl.uniformMatrix4fv(_shaderProgram.pMatrixUniform, false, pMatrix);
		_gl.uniformMatrix4fv(_shaderProgram.mvMatrixUniform, false, mvMatrix);

		// TODO: Lighting Shader Only
		var normalMatrix = mat3.create();
		mat4.toInverseMat3(mvMatrix, normalMatrix);
		mat3.transpose(normalMatrix);
		_gl.uniformMatrix3fv(_shaderProgram.nMatrixUniform, false, normalMatrix);
	}

	// Shader Code
	// TODO: Move programs to a manager in render
	// TODO: Move shader specific stuff to it's own namespace
	var _shaderProgram;	
	var _shaderPrograms = [];

	function _getShader(gl, fileName) {
	   var request = new XMLHttpRequest();
		request.open("GET", fileName, false);
		request.send();
		return _handleLoadedShader(gl, JSON.parse(request.responseText));
	}

    function _getShaderById(gl, id) {
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

       return  _handleLoadedShader(gl, { type: shaderScript.type, script: str });
    }

	function _handleLoadedShader(gl, shaderScript) {
		var shader;
		if (shaderScript.type == "x-shader/x-fragment") {
			shader = gl.createShader(gl.FRAGMENT_SHADER);
		} else if (shaderScript.type == "x-shader/x-vertex") {
			shader = gl.createShader(gl.VERTEX_SHADER);
		} else {
			return null;
		}

		gl.shaderSource(shader, shaderScript.script);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			alert(gl.getShaderInfoLog(shader));
			return null;
		}

		return shader;
	}

	function _createShader(vertexShaderID, fragmentShaderID) {
		var fragmentShader = _getShader(_gl, fragmentShaderID);
		var vertexShader = _getShader(_gl, vertexShaderID);

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
		for(i=0; i<8; i++) { // Max 8 Spot Lights
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

	function _initShaders() {
        // shaders/name.json
		_shaderPrograms.Vertex = _createShader("shaders/vertex-shader-vs.json", "shaders/vertex-shader-fs.json");
		_shaderPrograms.Pixel = _createShader("shaders/pixel-shader-vs.json", "shaders/pixel-shader-fs.json");
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
		loadModel:					loadModel,
		createTexture:				createTexture,
		createTextureFromCanvas:	createTextureFromCanvas,
		setLightEnvironment:		setLightEnvironment,
		setLightingFlags:			setLightingFlags,
		addPointLight:				addPointLight,
		setPointLight:				setPointLight,
		updatePointLight:			updatePointLight,
		addSpotLight: 				addSpotLight,
		setSpotLight:				setSpotLight,
		updateSpotLight:			updateSpotLight,
		setLight: 					setLight,
		removeLight:				removeLight,
		removeLights:				removeLights,
		setShader:					setShader,
		prepareScene: 				prepareScene, 
		renderObject:				renderObject,
		renderPlane:				renderPlane,
		addToBuffersList: 			addToBuffersList,
		checkBufferList:			checkBufferList,
		getBufferIndex:				getBufferIndex,
		movePlayerCamera:			movePlayerCamera,
		movePlayerCameraZX:			movePlayerCameraZX,
		setPlayerCamera:			setPlayerCamera,
		setPlayerCameraRotation:	setPlayerCameraRotation,
		rotatePlayerCamera:			rotatePlayerCamera,
		playerCameraPos:			playerCameraPos,
		playerCameraRotation:		playerCameraRotation,
		playerCameraTransform:		playerCameraTransform,
		playerCameraReverseRotation:	playerCameraReverseRotation,
		playerCameraReverseTransform:	playerCameraReverseTransform,
		pickPosition:				pickPosition,
		reversePick:				reversePick,
		increaseAssetsLoading:      increaseAssetsLoading,
		decreaseAssetsLoading:      decreaseAssetsLoading,
		degToRad: 					degToRad 
	};
}();