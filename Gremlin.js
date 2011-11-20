//     ___                    _ _                          _            
//    / _ \_ __ ___ _ __ ___ | (_)_ __     ___ _ __   __ _(_)_ __   ___ 
//   / /_\/ '__/ _ \ '_ ` _ \| | | '_ \   / _ \ '_ \ / _` | | '_ \ / _ \
//  / /_\\| | |  __/ | | | | | | | | | | |  __/ | | | (_| | | | | |  __/
//  \____/|_|  \___|_| |_| |_|_|_|_| |_|  \___|_| |_|\__, |_|_| |_|\___|
//                                                   |___/             
// 		A simultaneous learning WebGL & JavaScript Experiment!
//		v0.7
// 		Delph 2011

function _Gremlin() {

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
		
		mat4.translate(mvMatrix, [object.position[0], object.position[1],object.position[2]]);
		
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
	
	var Primitives = _Primitives(); // Primitive creation
	
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
		_increaseAssetsLoading();
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
        }
        request.send();
	}
	
	// Textures
	var textureList = [];			// Stores the textures
	var textureFileList = [];		// Stores which textures have already been loaded
	
	function createTexture(fileName) {
		if (!isNaN(textureFileList[fileName])) {
			return textureFileList[fileName];
		}
		else {
			_increaseAssetsLoading();
			var texture;
			texture = _gl.createTexture();
			texture.image = new Image();
			texture.image.src = fileName;
			var index = textureList.push(texture)-1;
			textureList[index].image.onload = function() { _handleLoadedTexture(textureList[index], 3); }
			textureFileList[fileName] = index;
			return index;
		}
	}
	
	function createTextureFromCanvas(canvasId) {
		_increaseAssetsLoading();
		var texture = _gl.createTexture();
		texture.image = document.getElementById(canvasId);
		var index = textureList.push(texture)-1;
		_handleLoadedTexture(textureList[index], 3); 
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
	
	// WebGL Obj
	var _gl;
	
	// View Matrix
    var _mvMatrix = mat4.create();
    var _mvMatrixStack = [];
    // Perspective Matrix
	var _pMatrix = mat4.create();
	
	// Basic Camera Obj
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
	
	var _playerCamera = new camera(0,0,0, 0, 0, 0);
	
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
	
	// Assets (Buffers, Models, Textures)
	var assetsLoading = 0; 
	function _increaseAssetsLoading() {
		if(!assetsLoading) { Game.setLoading(true); }
		assetsLoading++;
	}
	function _decreaseAssetsLoading() {
		if(assetsLoading) { assetsLoading--; }
		if(!assetsLoading) { Game.setLoading(false); }
	}
	
	// Textures
	function _handleLoadedTexture(texture, quality) {
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
		_decreaseAssetsLoading();
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
		_decreaseAssetsLoading();
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
		
	function _initShaders() {
		_shaderPrograms["Vertex"] = _createShader("vertex-shader-vs", "vertex-shader-fs");
		_shaderPrograms["Pixel"] = _createShader("pixel-shader-vs", "pixel-shader-fs");
		_shaderProgram = _shaderPrograms.Pixel;
		_gl.useProgram(_shaderProgram);
    }
    
    // Primitives Namespace
    function _Primitives() {
    	// Primitive Creation Functions
    	// NOTE: scale and offset should be used with caution
    	// it's usually better to adjust the position and scale of the object to which the buffer is attached.
		function createTetrahedron(parameters) {
			var scale = [1, 1, 1];
			var offset = [0, 0, 0];
			if(parameters && parameters.scale) { scale = parameters.scale; }
			if(parameters && parameters.offset) { offset = parameters.offset; }
			var key = "tetrahedron-scale:"+scale.toString()+"-offset:"+offset.toString();
			
			if (isNaN(buffersNameList[key])) {
				var buffers = [];
				
				function adjust(value, index) { return offset[index]+(value*scale[index]); }
								
				// TODO: Convert to use index buffer
				var tetrahedronVertexPositionBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, tetrahedronVertexPositionBuffer);
				var vertices = [
					// Bottom Side
					adjust(-0.5, 0), adjust(-0.27217, 1), adjust(-0.28868, 2),
					adjust(0.5, 0), adjust(-0.27217, 1), adjust(-0.28868, 2),			
					adjust(0.0, 0), adjust(-0.27217, 1), adjust(-0.57735, 2),
					 
					 // Rear Side
					adjust(-0.5, 0), adjust(-0.27217, 1), adjust(-0.28868, 2),
					adjust(0.0, 0), adjust(0.54433, 1), adjust(0.0, 2),
					adjust(0.5, 0), adjust(-0.27217, 1), adjust(-0.28868, 2),	
					 
					// Left Side
					adjust(0.0, 0), adjust(-0.27217, 1), adjust(0.57735, 2),
					adjust(0.0, 0), adjust(0.54433, 1), adjust(0.0, 2),
					adjust(-0.5, 0), adjust(-0.27217, 1), adjust(-0.28868, 2),
					
					// Right Side
					 adjust(0.5, 0), adjust(-0.27217, 1), adjust(-0.28868, 2),	
					 adjust(0.0, 0), adjust(0.54433, 1), adjust(0.0, 2),
					 adjust(0.0, 0), adjust(-0.27217, 1), adjust(0.57735, 2),
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
				tetrahedronVertexPositionBuffer.itemSize = 3;
				tetrahedronVertexPositionBuffer.numItems = 12;
				
				buffers["vertexPosition"] = tetrahedronVertexPositionBuffer;
				
				// TODO: Texture Buffer!
				
				// Normal Buffer
				// WARNING: This is dependant on shader program should make this more robust
				var tetrahedronVertexNormalBuffer;
				tetrahedronVertexNormalBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, tetrahedronVertexNormalBuffer);
				var vertexNormals = [
					// Ironically these haven't been normalised
					// Bottom Side	
					0, -1, 0,
					0, -1, 0,
					0, -1, 0,
					
					// Rear Side
					0, 0.57735, -0.81650,
					0, 0.57735, -0.81650,
					0, 0.57735, -0.81650,
					
					// Left Side
					-0.5, 0.81650, 0.28868,
					-0.5, 0.81650, 0.28868,
					-0.5, 0.81650, 0.28868,
					
					// Right Side
					0.5, 0.81650, 0.28868,
					0.5, 0.81650, 0.28868,
					0.5, 0.81650, 0.28868,
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexNormals), _gl.STATIC_DRAW);
				tetrahedronVertexNormalBuffer.itemSize = 3;
				tetrahedronVertexNormalBuffer.numItems = 12;
				
				buffers["vertexNormals"] = tetrahedronVertexNormalBuffer;
				
				buffers["useIndices"] = false;
				
				buffersNameList[key] = buffersList.push(buffers)-1;
			}
			return buffersNameList[key];
		}
		function createPyramid(parameters) {
			var scale = [1, 1, 1];
			var offset = [0, 0, 0];
			if(parameters && parameters.scale) { scale = parameters.scale; }
			if(parameters && parameters.offset) { offset = parameters.offset; }
			var key = "pyramid-scale:"+scale.toString()+"-offset:"+offset.toString();

			if (isNaN(buffersNameList[key])) {
				var buffers = [];
				
				function adjust(value, index) { return offset[index]+(value*scale[index]); }
				
				// TODO: Convert to use index buffer
				var pyramidVertexPositionBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
				var vertices = [
					// Front face
					adjust(0.0, 0), adjust(1.0, 1), adjust(0.0, 2),
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
		
					// Right face
					adjust(0.0, 0), adjust(1.0, 1), adjust(0.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
		
					// Back face
					adjust(0.0, 0), adjust(1.0, 1), adjust(0.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
		
					// Left face
					adjust(0.0, 0), adjust(1.0, 1), adjust(0.0, 2),
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
					
					// Bottom face
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
					
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
				pyramidVertexPositionBuffer.itemSize = 3;
				pyramidVertexPositionBuffer.numItems = 18;
				
				buffers["vertexPosition"] = pyramidVertexPositionBuffer;
				
				// TODO: Texture Buffer
				
				// Normal Buffer
				// WARNING: This is dependant on shader program should make this more robust
				var pyramidVertexNormalBuffer;
				pyramidVertexNormalBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, pyramidVertexNormalBuffer);
				var vertexNormals = [
				  // Front face
					 0.0, 0.447214,  0.89443,
					 0.0, 0.447214,  0.89443,
					 0.0, 0.447214,  0.89443,
		
					// Right face
					 0.89443, 0.447214,  0.0,
					 0.89443, 0.447214,  0.0,
					 0.89443, 0.447214,  0.0,
		
					// Back face
					 0.0, 0.447214, -0.89443,
					 0.0, 0.447214, -0.89443,
					 0.0, 0.447214, -0.89443,
		
					// Left face
					 -0.89443, 0.447214,  0.0,
					 -0.89443, 0.447214,  0.0,
					 -0.89443, 0.447214,  0.0,
					
					// Bottom face
					0.0, -1, 0.0,
					0.0, -1, 0.0,
					0.0, -1, 0.0,
					0.0, -1, 0.0,
					0.0, -1, 0.0,
					0.0, -1, 0.0
					
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexNormals), _gl.STATIC_DRAW);
				pyramidVertexNormalBuffer.itemSize = 3;
				pyramidVertexNormalBuffer.numItems = 18;
				
				buffers["vertexNormals"] = pyramidVertexNormalBuffer;
				
				buffers["useIndices"] = false;
				
				buffersNameList[key] = buffersList.push(buffers)-1;
			}
			return buffersNameList[key];
		}
		function createCube(parameters) {
			var scale = [1, 1, 1];
			var offset = [0, 0, 0];
			if(parameters && parameters.scale) { scale = parameters.scale; }
			if(parameters && parameters.offset) { offset = parameters.offset; }
			var key = "cube-scale:"+scale.toString()+"-offset:"+offset.toString();

			if (isNaN(buffersNameList[key])){
				var buffers = [];
				
				function adjust(value, index) { return offset[index]+(value*scale[index]); }
				
				// Vertex Buffer
				var cubeVertexPositionBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
				vertices = [
					// Front face
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
					adjust(1.0, 0), adjust(1.0, 1), adjust(1.0, 2),
					adjust(-1.0, 0), adjust(1.0, 1), adjust(1.0, 2),
		
					// Back face
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
					adjust(-1.0, 0), adjust(1.0, 1), adjust(-1.0, 2),
					adjust(1.0, 0), adjust(1.0, 1), adjust(-1.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
		
					// Top face
					adjust(-1.0, 0), adjust(1.0, 1), adjust(-1.0, 2),
					adjust(-1.0, 0), adjust(1.0, 1), adjust(1.0, 2),
					adjust(1.0, 0), adjust(1.0, 1), adjust(1.0, 2),
					adjust(1.0, 0), adjust(1.0, 1), adjust(-1.0, 2),
		
					// Bottom face
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
		
					// Right face
					adjust(1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
					adjust(1.0, 0), adjust(1.0, 1), adjust(-1.0, 2),
					adjust(1.0, 0), adjust(1.0, 1), adjust(1.0, 2),
					adjust(1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
		
					// Left face
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2),
					adjust(-1.0, 0), adjust(-1.0, 1), adjust(1.0, 2),
					adjust(-1.0, 0), adjust(1.0, 1), adjust(1.0, 2),
					adjust(-1.0, 0), adjust(1.0, 1), adjust(-1.0, 2)
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
				cubeVertexPositionBuffer.itemSize = 3;
				cubeVertexPositionBuffer.numItems = 24;
				
				buffers["vertexPosition"] = cubeVertexPositionBuffer;
			
				// Texture Buffer	
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
					
				buffers["textureCoords"] = cubeVertexTextureCoordBuffer;
				
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
				
				buffers["vertexNormals"] = cubeVertexNormalBuffer;
				
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
				
				buffers["vertexIndex"] = cubeVertexIndexBuffer;
				buffers["useIndices"] = true;
				
				buffersNameList[key] = buffersList.push(buffers)-1;
			}
			return buffersNameList[key];
		}
		function createSphere(parameters) {
			var latBands, longBands;
			var scale = [1, 1, 1];
			var offset = [0, 0, 0];
			
			if(!parameters) { throw new Error("latBands and longBands must be provided;"); }
			if(parameters.scale) { scale = parameters.scale; }
			if(parameters.offset) { offset = parameters.offset; }
			if(parameters.latBands) { latBands = parameters.latBands; }
			else { throw new Error("latBands must be provided"); }
			if (parameters.longBands) { longBands = parameters.longBands; }
			else { throw new Error("longBands must be provided"); }
			
			var key = "cube-latBands:"+latBands+"longBands:"+longBands+"-scale:"+scale.toString()+"-offset:"+offset.toString();
			
			if (isNaN(buffersNameList[key])) {
				var buffers = [];
				
				// Method taken from Lesson 11 of learningWebGL.com
				var latitudeBands = latBands;
				var longitudeBands = longBands;
						
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
						vertexPositionData.push(offset[0] + (scale[0] * x));
						vertexPositionData.push(offset[1] + (scale[1] * y));
						vertexPositionData.push(offset[2] + (scale[2] * z));
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
				
				buffers["vertexPosition"] = sphereVertexPositionBuffer;
				
				// Normals, WARNING: dependant on shaderProgram
				var sphereVertexNormalBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(normalData), _gl.STATIC_DRAW);
				sphereVertexNormalBuffer.itemSize = 3;
				sphereVertexNormalBuffer.numItems = normalData.length / 3;
				
				buffers["vertexNormals"] = sphereVertexNormalBuffer;
				
				var sphereVertexTextureCoordBuffer = _gl.createBuffer();
					
				_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(textureCoordData), _gl.STATIC_DRAW);
				sphereVertexTextureCoordBuffer.itemSize = 2;
				sphereVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;
				
				buffers["textureCoords"] = sphereVertexTextureCoordBuffer; 
				
				// Index Buffer
				var sphereVertexIndexBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
				_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), _gl.STATIC_DRAW);
				sphereVertexIndexBuffer.itemSize = 1;
				sphereVertexIndexBuffer.numItems = indexData.length;
				
				buffers["vertexIndex"] = sphereVertexIndexBuffer;
				buffers["useIndices"] = true;
		
				buffersNameList[key] = buffersList.push(buffers)-1;
			}
			return buffersNameList[key];
		}
		function createRay() {
			if (isNaN(buffersNameList["ray"])) {
				var buffers = [];
				
				buffers.renderMode = "wireframe";
				
				var rayVertexPositionBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, rayVertexPositionBuffer);
				var vertices = [
					 0.0,  0.0,  0,
					 0.0, 0.0,  1.0,				
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
				rayVertexPositionBuffer.itemSize = 3;
				rayVertexPositionBuffer.numItems = 2;
				
				buffers["vertexPosition"] = rayVertexPositionBuffer;
				buffers["useIndices"] = false;
				
				buffersNameList["ray"] = buffersList.push(buffers)-1;
			}
			return buffersNameList["ray"];
		}
	    function createPoint() {
			if (isNaN(buffersNameList["point"])) {
				var buffers = [];
				
				buffers.renderMode = "points"; 
					
				var pointVertexPositionBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, pointVertexPositionBuffer);
				var vertices = [0.0, 0.0, 0.0];
				
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
				pointVertexPositionBuffer.itemSize = 3;
				pointVertexPositionBuffer.numItems = 1;
				
				buffers["vertexPosition"] = pointVertexPositionBuffer;
				buffers["useIndices"] = false;
				
				buffersNameList["point"] = buffersList.push(buffers)-1;
			}
			return buffersNameList["point"];
		}
	
		// GUI objects
		function createSquare() {
			if (isNaN(buffersNameList["square"])){
				var buffers = [];
				// Vertex Buffer
				var squareVertexPositionBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, squareVertexPositionBuffer);
				vertices = [
					 -1.0, -1.0,  0.0,
					  1.0, -1.0,  0.0,
					  1.0,  1.0,  0.0,
					 -1.0,  1.0,  0.0
				];
				
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
				squareVertexPositionBuffer.itemSize = 3;
				squareVertexPositionBuffer.numItems = 4;
				
				buffers["vertexPosition"] = squareVertexPositionBuffer;
			
				// Texture Buffer
				var squareVertexTextureCoordBuffer;
				squareVertexTextureCoordBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, squareVertexTextureCoordBuffer);
				var textureCoords = [
				  0.0, 0.0,
				  1.0, 0.0,
				  1.0, 1.0,
				  0.0, 1.0
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(textureCoords), _gl.STATIC_DRAW);
				squareVertexTextureCoordBuffer.itemSize = 2;
				squareVertexTextureCoordBuffer.numItems = 4;
				
				buffers["textureCoords"] = squareVertexTextureCoordBuffer;
				
				// Normal Buffer
				// WARNING: This is dependant on shader program should make this more robust
				var squareVertexNormalBuffer;
				squareVertexNormalBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, squareVertexNormalBuffer);
				var vertexNormals = [
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexNormals), _gl.STATIC_DRAW);
				squareVertexNormalBuffer.itemSize = 3;
				squareVertexNormalBuffer.numItems = 4;
				
				buffers["vertexNormals"] = squareVertexNormalBuffer;
				
				// Index Buffer
				var squareVertexIndexBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
				var squareVertexIndices = [
					0, 1, 2,      0, 2, 3
				];
				_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(squareVertexIndices), _gl.STATIC_DRAW);
				squareVertexIndexBuffer.itemSize = 1;
				squareVertexIndexBuffer.numItems = 6;
				
				buffers["vertexIndex"] = squareVertexIndexBuffer;
				buffers["useIndices"] = true;
				
				buffersNameList["square"] = buffersList.push(buffers)-1;
			}			
			return buffersNameList["square"];
		}
		// GUI Wireframe objects
		function createBox() {
				if (isNaN(buffersNameList["box"])){
				var buffers = [];
				
				buffers.renderMode = "wireframe";
								
				// Vertex Buffer
				var squareVertexPositionBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, squareVertexPositionBuffer);
				vertices = [
					 -1.0, -1.0,  0.0,
					  1.0, -1.0,  0.0,
					  1.0,  1.0,  0.0,
					 -1.0,  1.0,  0.0
				];
				
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
				squareVertexPositionBuffer.itemSize = 3;
				squareVertexPositionBuffer.numItems = 4;
				
				buffers["vertexPosition"] = squareVertexPositionBuffer;
			
				// Normal Buffer
				// WARNING: This is dependant on shader program should make this more robust
				var squareVertexNormalBuffer;
				squareVertexNormalBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, squareVertexNormalBuffer);
				var vertexNormals = [
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexNormals), _gl.STATIC_DRAW);
				squareVertexNormalBuffer.itemSize = 3;
				squareVertexNormalBuffer.numItems = 4;
				
				buffers["vertexNormals"] = squareVertexNormalBuffer;
				
				// Index Buffer
				var squareVertexIndexBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, squareVertexIndexBuffer);
				var squareVertexIndices = [
					0, 1,   2, 1,
					2, 3,   3, 0,
				];
				_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(squareVertexIndices), _gl.STATIC_DRAW);
				squareVertexIndexBuffer.itemSize = 1;
				squareVertexIndexBuffer.numItems = 8;
				
				buffers["vertexIndex"] = squareVertexIndexBuffer;
				buffers["useIndices"] = true;
				
				buffersNameList["box"] = buffersList.push(buffers)-1;
			}
			return buffersNameList["box"];
		}
		function createCross() {
			if (isNaN(buffersNameList["cross"])){
				var buffers = [];
				
				buffers.renderMode  = "wireframe";
				
				// Vertex Buffer
				var crossVertexPositionBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, crossVertexPositionBuffer);
				vertices = [
					 -0.5,  0.0,  0.0,
					  0.0, -0.5,  0.0,
					  0.5,  0.0,  0.0,
					  0.0,  0.5,  0.0
				];
				
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
				crossVertexPositionBuffer.itemSize = 3;
				crossVertexPositionBuffer.numItems = 4;
				
				buffers["vertexPosition"] = crossVertexPositionBuffer;
			
				// Normal Buffer
				// WARNING: This is dependant on shader program should make this more robust
				var crossVertexNormalBuffer;
				crossVertexNormalBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, crossVertexNormalBuffer);
				var vertexNormals = [
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexNormals), _gl.STATIC_DRAW);
				crossVertexNormalBuffer.itemSize = 3;
				crossVertexNormalBuffer.numItems = 4;
				
				buffers["vertexNormals"] = crossVertexNormalBuffer;
				
				// Index Buffer
				var crossVertexIndexBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, crossVertexIndexBuffer);
				var vertexIndices = [
					0, 2, 1, 3
				];
				_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), _gl.STATIC_DRAW);
				crossVertexIndexBuffer.itemSize = 1;
				crossVertexIndexBuffer.numItems = 4;
				
				buffers["vertexIndex"] = crossVertexIndexBuffer;
				buffers["useIndices"] = true;
				
				buffersNameList["cross"] = buffersList.push(buffers)-1;
			}
			return buffersNameList["cross"];
		}
		function createBrace() {
			if (isNaN(buffersNameList["brace"])){
				var buffers = [];
	
				buffers.renderMode = "wireframe";
				
				// Vertex Buffer
				var braceVertexPositionBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, braceVertexPositionBuffer);
				vertices = [
					 -1.0, -1.0, 0.0,
					 -0.9, -1.0, 0.0,
					  0.9, -1.0, 0.0,
					  1.0, -1.0, 0.0,
					  1.0, 	1.0, 0.0,
					  0.9,  1.0, 0.0,
					 -0.9,  1.0, 0.0,
					 -1.0,  1.0, 0.0
				];
				
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertices), _gl.STATIC_DRAW);
				braceVertexPositionBuffer.itemSize = 3;
				braceVertexPositionBuffer.numItems = 8;
				
				buffers["vertexPosition"] = braceVertexPositionBuffer;
			
				// Normal Buffer
				// WARNING: This is dependant on shader program should make this more robust
				var braceVertexNormalBuffer;
				braceVertexNormalBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ARRAY_BUFFER, braceVertexNormalBuffer);
				var vertexNormals = [
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0,
				   0.0,  0.0,  1.0
				];
				_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexNormals), _gl.STATIC_DRAW);
				braceVertexNormalBuffer.itemSize = 3;
				braceVertexNormalBuffer.numItems = 8;
				
				buffers["vertexNormals"] = braceVertexNormalBuffer;
				
				// Index Buffer
				var braceVertexIndexBuffer = _gl.createBuffer();
				_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, braceVertexIndexBuffer);
				var vertexIndices = [
					0, 1, 	2, 3,
					3, 4,	4, 5,
					6, 7,	7, 0	
				];
				_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertexIndices), _gl.STATIC_DRAW);
				braceVertexIndexBuffer.itemSize = 1;
				braceVertexIndexBuffer.numItems = 12;
				
				buffers["vertexIndex"] = braceVertexIndexBuffer;
				buffers["useIndices"] = true;
				
				buffersNameList["brace"]= buffersList.push(buffers)-1;
			}
			return buffersNameList["brace"];
		}

		return {
			createTetrahedron:			createTetrahedron,
			createPyramid:				createPyramid,
			createCube:					createCube,
			createSphere:				createSphere,
			createRay:					createRay,
			createPoint:				createPoint,
			createSquare:				createSquare,
			createBox:					createBox,
			createCross:				createCross,
			createBrace:				createBrace
		}
    }
	
	//	 _                     _ _           
	//	| |__   __ _ _ __   __| | | ___  ___ 
	//	| '_ \ / _` | '_ \ / _` | |/ _ \/ __|
	//	| | | | (_| | | | | (_| | |  __/\__ \
	//	|_| |_|\__,_|_| |_|\__,_|_|\___||___/

	return { 
		init: 						init, 
		resize: 					resize,
		Primitives:					Primitives,
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
		degToRad: 					degToRad 
	};
}

var Gremlin = _Gremlin();

function _GremlinEventHandler() {
	
	//               _     _ _      
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
	
	//	            _            _       
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
		for(key in blur)
		{
			if (blur.hasOwnProperty[key]) { blur[key](); }
		}
		if (overrides["onblur"]) { return false; }
	}
	function onFocus() {
		for(key in focus)
		{
			if (focus.hasOwnProperty(key)) { focus[key](); }
		}
		if (overrides["onfocus"]) { return false; }
	}
	function onResize() {
		for(key in resize)
		{
			if (resize.hasOwnProperty(key)) { resize[key](); }
		}
		if (overrides["onresize"]) { return false; }
	}
	
	function onMouseMove(e) {
		for(key in mousemove)
		{
			if (mousemove.hasOwnProperty(key)) { mousemove[key](e); }
		}
		if (overrides["onmousemove"]) { return false; }
	}
	function onMouseDown(e) {
		for(key in mousedown)
		{
			if (mousedown.hasOwnProperty(key)) { mousedown[key](e); }
		}
		if (overrides["onmousedown"]) { return false; }
	}
	function onMouseUp(e) {
		for(key in mouseup)
		{
			if (mouseup.hasOwnProperty(key)) { mouseup[key](e); }
		}
		if (overrides["onmouseup"]) { return false; }
	}
	function onKeyUp(e) {
		for(key in keyup)
		{
			if (keyup.hasOwnProperty(key)) { keyup[key](e); }
		}
		if (overrides["onkeyup"]) { return false; }
	}
	function onKeyDown(e) {
		for(key in keydown)
		{
			if (keydown.hasOwnProperty(key)) { keydown[key](e); }
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
	
	//	             _     _ _      
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
		if (!isNaN(key) && !key.length) {
			return currentlyPressedKeys[key];
		}
		else if (key) {
			var map = descriptionToKeyCode(key);
			return (map) ? currentlyPressedKeys[map] : false;
		}
		else {
			return false;
		}
	}
	
	function mouseDown(button) {
		if (!isNaN(button) && !button.length) {
			return mouseState[button];
		}
		else if (button) {
			var map = descriptionToMouseButton(button);
			return (!isNaN(map)) ? mouseState[map] : false;
		}
		else {
			return false;
		}
	}
	
	function descriptionToMouseButton(button) {
		var map;
		switch(button) {
			case "LeftMouseButton":
				map = 0;
				break;
			case "MiddleMouseButton":
				map = 1;
				break;
			case "RightMouseButton":
				map = 2;
				break;
			default:
			 	map = false;
		}
		return map;
	}
	function mouseButtonToDescription(button) {
		var map;
		switch(button) {
			case 0:
				map = "LeftMouseButton";
				break;
			case 1:
				map = "MiddleMouseButton";
				break;
			case 2:
				map = "RightMouseButton";
				break;
			default:
				map = false;
		}
		return map;
	}
	
	function descriptionToKeyCode(key) {
		var map;
		switch(key) {
			case "a":
				map = 65;
				break;
			case "b":
				map = 66;
				break;
			case "c":
				map = 67;
				break;
			case "d":
				map = 68;
				break;
			case "e":
				map = 69;
				break;
			case "f":
				map = 70;
				break;
			case "g":
				map = 71;
				break;
			case "h":
				map = 72;
				break;
			case "i":
				map = 73;
				break;
			case "j":
				map = 74;
				break;
			case "k":
				map = 75;
				break;
			case "l":
				map = 76;
				break;
			case "m":
				map = 77;
				break;
			case "n":
				map = 78;
				break;
			case "o":
				map = 79;
				break;
			case "p":
				map = 80;
				break;
			case "q":
				map = 81;
				break;
			case "r":
				map = 82;
				break;
			case "s":
				map = 83;
				break;
			case "t":
				map = 84;
				break;
			case "u":
				map = 85;
				break;
			case "v":
				map = 86;
				break;
			case "w":
				map = 87;
				break;
			case "x":
				map = 88;
				break;
			case "y":
				map = 89;
				break;
			case "z":
				map = 90;
				break;
				
			case "Backspace":
				map = 8;
				break;
			case "Tab":
				map = 9;
				break;
			case "Enter":
				map = 13;
				break;
			case "Shift":
				map = 16;
				break;
			case "Ctrl":
				map = 17;
				break;
			case "Alt":
				map = 18;
				break;
			case "PauseBreak":
				map = 19;
				break;
			case "Caps":
				map = 20;
				break;
			case "Esc":
				map = 27;
				break;
			case "Space":
				map = 32;
				break;
			case "PageUp":
				map = 33;
				break;
			case "PageDown":
				map = 34;
				break;
			case "End":
				map = 35;
				break;
			case "Home":
				map = 36;
				break;
			case "Left":
				map = 37;
				break;
			case "Up":
				map = 38;
				break;
			case "Right":
				map = 39;
				break;
			case "Down":
				map = 40;
				break;
			case "Insert":
				map = 45;
				break;
			case "Delete":
				map = 46;
				break;
			case "0":
				map = 48;
				break;
			case "1":
				map = 49;
				break;
			case "2":
				map = 50;
				break;
			case "3":
				map = 51;
				break;
			case "4":
				map = 52;
				break;
			case "5":
				map = 53;
				break;
			case "6":
				map = 54;
				break;
			case "7":
				map = 55;
				break;
			case "8":
				map = 56;
				break;
			case "9":
				map = 57;
				break;
			case ";":
				map = 59;
				break;
			case "=":
				map = 61;
				break;
			case "-":
				map = 189;
				break;
			case ",":
				map = 188;
				break;
			case ".":
				map = 190;
				break;
			case "/":
				map = 191;
				break;
			case "|":
				map = 220;
				break;
			case "[":
				map = 219;
				break;
			case "]":
				map = 221;
				break;
			case "`":
				map = 223;
				break;
			case "'":
				map = 192;
				break;
			case "#":
				map = 222;
				break;
				
			// TODO: Add Num Pad
			
			default: 
				map = false;
			}
		return map;
	}
	
	function keyCodeToDescription(keyCode) {
		var map;
		switch(keyCode) {
			case 65:
				map = "a";
				break;
			case 66:
				map = "b";
				break;
			case 67:
				map = "c";
				break;
			case 68:
				map = "d";
				break;
			case 69:
				map = "e";
				break;
			case 70:
				map = "f";
				break;
			case 71:
				map = "g";
				break;
			case 72:
				map = "h";
				break;
			case 73:
				map = "i";
				break;
			case 74:
				map = "j";
				break;
			case 75:
				map = "k";
				break;
			case 76:
				map = "l";
				break;
			case 77:
				map = "m";
				break;
			case 78:
				map = "n";
				break;
			case 79:
				map = "o";
				break;
			case 80:
				map = "p";
				break;
			case 81:
				map = "q";
				break;
			case 82:
				map = "r";
				break;
			case 83:
				map = "s";
				break;
			case 84:
				map = "t";
				break;
			case 85:
				map = "u";
				break;
			case 86:
				map = "v";
				break;
			case 87:
				map = "w";
				break;
			case 88:
				map = "x";
				break;
			case 89:
				map = "y";
				break;
			case 90:
				map = "z";
				break;
				
			case 8:
				map = "Backspace";
				break;
			case 9:
				map = "Tab";
				break;
			case 13:
				map = "Enter";
				break;
			case 16:
				map = "Shift";
				break;
			case 17:
				map = "Ctrl";
				break;
			case 18:
				map = "Alt";
				break;
			case 19:
				map = "PauseBreak";
				break;
			case 20:
				map = "Caps";
				break;
			case 27:
				map = "Esc";
				break;
			case 32:
				map = "Space";
				break;
			case 33:
				map = "PageUp";
				break;
			case 34:
				map = "PageDown";
				break;
			case 35:
				map = "End";
				break;
			case 36:
				map = "Home";
				break;
			case 37:
				map = "Left";
				break;
			case 38:
				map = "Up";
				break;
			case 39:
				map = "Right";
				break;
			case 40:
				map = "Down";
				break;
			case 45:
				map = "Insert";
				break;
			case 46:
				map = "Delete";
				break;
			case 48:
				map = "0";
				break;
			case 49:
				map = "1";
				break;
			case 50:
				map = "2";
				break;
			case 51:
				map = "3";
				break;
			case 52:
				map = "4";
				break;
			case 53:
				map = "5";
				break;
			case 54:
				map = "6";
				break;
			case 55:
				map = "7";
				break;
			case 56:
				map = "8";
				break;
			case 57:
				map = "9";
				break;
			case 59:
				map = ";";
				break;
			case 61:
				map = "=";
				break;
			case 189:
				map = "-";
				break;
			case 188:
				map = ",";
				break;
			case 190:
				map = ".";
				break;
			case 191:
				map = "/";
				break;
			case 220:
				map = "|";
				break;
			case 219:
				map = "[";
				break;
			case 221:
				map = "]";
				break;
			case 223:
				map = "`";
				break;
			case 192:
				map = "'";
				break;
			case 222:
				map = "#";
				break;
				
			// TODO: Add Num Pad
			
			default: 
				map = false;
		}
		return map;
	}
	
	//	            _            _       
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
		getMousePos:				getMousePos,
		keyDown:					keyDown,
		mouseDown:					mouseDown,
		descriptionToKeyCode:		descriptionToKeyCode,
		keyCodeToDescription:		keyCodeToDescription,
		descriptionToMouseButton:	descriptionToMouseButton,
		mouseButtonToDescription:	mouseButtonToDescription
	}
}

var GremlinInput = _GremlinInput();

function _GremlinBindings() {
	var bindings = {};
	
	function Bind(parameters) {
		if (!parameters.Name) {
			throw new Error("No binding name provided");
		}
		var binding = GetBinding(parameters.Name);
	    if(parameters.PrimaryKey) {
	    	binding.PrimaryKey = parameters.PrimaryKey;
	    }
	    if(parameters.SecondaryKey) {
	    	binding.SecondaryKey = parameters.SecondaryKey;
	    }
	    if(!binding.hasOwnProperty("Enabled")) {
	    	binding.Enabled = true;
	    }
	    bindings[parameters.Name] = binding;
	}
	
	function Unbind(name) {
		if(bindings.hasOwnProperty(name)) {
			delete bindings[name];
		}
	}
	
	function GetBinding(name) {
		return (bindings.hasOwnProperty(name)) ? bindings[name] : {};
	}
	
	function GetAllBindings() {
		return bindings;
	}
	
	function EnableBinding(name) {
		if (bindings.hasOwnProperty(name)) {
			bindings[name].Enabled = true;
		}
	}
	
	function DisableBinding(name) {
		if (bindings.hasOwnProperty(name)) {
			bindings[name].Enabled = false;
		}
	}
	
	return {
		Bind:			Bind,
		Unbind:			Unbind,
		GetBinding:		GetBinding,
		GetAllBindigns:	GetAllBindings,
		EnableBinding:	EnableBinding,
		DisableBinding:	DisableBinding
	}
}

var GremlinBindings = _GremlinBindings();

function _GremlinCollision() {
	// TODO: Should proabably introduce bounding volumes and save those to objects and do comparisions on those, for now we'll just feed all the data in.
	function isPointInsideSphere(spherePosition, radius, point) {
		var difference = [];
		vec3.subtract(spherePosition, radius, difference);
		var separation = vec3.length(diffference);
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
}

var GremlinCollision = _GremlinCollision();

// GremlinMaths
function _GremlinMaths() {
	
	// Calculates the time at which two objects will collide for a known separation
	// one object has known velocity other has known velocity magnitude.
	function calculateCollisionTime(separation, targetVelocity, projectileSpeed) {
		// Calculation the solution to a quadratic for T.
		// a = magnitude of Relative Velocity squared - magnitude of Projectile Velocity squared
		// b = 2 * dot product of Relative Velocity and Separaation
		// c = magnitude of separation squared
		var a = (targetVelocity[0]*targetVelocity[0] + targetVelocity[1]*targetVelocity[1] + targetVelocity[2]*targetVelocity[0]) - projectileSpeed*projectileSpeed;
		var b = 2*vec3.dot(targetVelocity, separation);
		var c = (separation[0]*separation[0] + separation[1]*separation[1] + separation[2]*separation[2]);
		
		var results = _solveQuadratic(a,b,c);
		
		if (results) {			
			if (results.length == 1) {
				// Single Root
				// This implies that the objects are on top of each other... should never happen, but do not want to explictly forbid it.
				return results[0];
			}
			else {
				// Two Roots
				// One should be in the future and one in the past, we return the future result.
				if(results[0] > 0 && results[1] <= 0) {
					return results[0];
				}
				else if (results[0] <= 0 && results[1] > 0) {
					return results[1];
				}
				else {
					if (results[0] > 0 && results[1] > 0) {
						throw ("Both solutions to projectile calculation positive, check arguments");
					}
					else {
						throw ("Both solutions to projectile calculation negative, check arguments");
					}
				}
			}
		}
		else {
			// No Solution, return 0
			return 0;
		}
	}
	
	/**
	 * Returns false if it is not possible to hit target with given projectile speed.
	 * Else returns true and sets projectile velocity to velocity required to hit target
	 */
	function calculateProjectileVelocity(separation, targetVelocity, projectileSpeed, projectileVelocity){
		var collisionTime = calculateCollisionTime(separation, targetVelocity, projectileSpeed);	
		if (collisionTime != 0) {
			var separationScaled = vec3.create();
			vec3.scale(separation, 1/collisionTime, separationScaled);
			vec3.add(targetVelocity, separationScaled, projectileVelocity);
			return true;
		}
		else {
			return false;
		}
	}
	
	// Returns false if no real roots
	// Returns array with single or multiple roots
	function _solveQuadratic(a,b,c) {
		var results = [];
		var quadDet;
		
		if (b*b > 4*a*c) { 
			quadDet = Math.sqrt(b*b - 4*a*c);
		}
		else {
			// No Real Roots
			return false;
		}
		if(quadDet == 0) {
			// Single Root
			results[0] = (-b/(2*a));
		}
		else {
			// Two Real Roots
			results[0] = (-b + quadDet)/(2*a);
			results[1] = (-b - quadDet)/(2*a);
		}
		
		return results;
	}
	
	return {
		calculateCollisionTime: 		calculateCollisionTime,
		calculateProjectileVelocity: 	calculateProjectileVelocity
	}
}

var GremlinMaths = _GremlinMaths();
