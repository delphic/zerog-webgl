var Primitives = function() {
	// Primitive Creation Functions
	// NOTE: scale and offset should be used with caution
	// it's usually better to adjust the position and scale of the object to which the buffer is attached.
	function createTetrahedron(parameters) {
		var scale = [1, 1, 1];
		var offset = [0, 0, 0];
		if(parameters && parameters.scale) { scale = parameters.scale; }
		if(parameters && parameters.offset) { offset = parameters.offset; }
		var key = "tetrahedron-scale:"+scale.toString()+"-offset:"+offset.toString();

		if (Gizmo.checkBufferList(key)) {
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
				 adjust(0.0, 0), adjust(-0.27217, 1), adjust(0.57735, 2)
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
				0.5, 0.81650, 0.28868
			];
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexNormals), _gl.STATIC_DRAW);
			tetrahedronVertexNormalBuffer.itemSize = 3;
			tetrahedronVertexNormalBuffer.numItems = 12;

			buffers["vertexNormals"] = tetrahedronVertexNormalBuffer;

			buffers["useIndices"] = false;

			Gizmo.addToBuffersList(key, buffers);
		}
		
		return Gizmo.getBufferIndex(key);
	}
	function createPyramid(parameters) {
		var scale = [1, 1, 1];
		var offset = [0, 0, 0];
		if(parameters && parameters.scale) { scale = parameters.scale; }
		if(parameters && parameters.offset) { offset = parameters.offset; }
		var key = "pyramid-scale:"+scale.toString()+"-offset:"+offset.toString();

		if (Gizmo.checkBufferList(key)) {
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
				adjust(1.0, 0), adjust(-1.0, 1), adjust(-1.0, 2)

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

			Gizmo.addToBuffersList(key, buffers);
		}
		return Gizmo.getBufferIndex(key);
	}
	function createCube(parameters) {
		var scale = [1, 1, 1];
		var offset = [0, 0, 0];
		if(parameters && parameters.scale) { scale = parameters.scale; }
		if(parameters && parameters.offset) { offset = parameters.offset; }

		var key = "cube-scale:"+scale.toString()+"-offset:"+offset.toString();

		if (Gizmo.checkBufferList(key) || (parameters && parameters.jsonOut)){
			var buffers = [];
			var jsonOut = {};

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

			if(parameters && parameters.jsonOut) { jsonOut.vertexPositions = vertices; }
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
			  0.0, 1.0
			];

			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(textureCoords), _gl.STATIC_DRAW);
			cubeVertexTextureCoordBuffer.itemSize = 2;
			cubeVertexTextureCoordBuffer.numItems = 24;

			if(parameters && parameters.jsonOut) { jsonOut.vertexTextureCoords = textureCoords; }
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
			  -1.0,  0.0,  0.0
			];
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexNormals), _gl.STATIC_DRAW);
			cubeVertexNormalBuffer.itemSize = 3;
			cubeVertexNormalBuffer.numItems = 24;

			if(parameters && parameters.jsonOut) { jsonOut.vertexNormals = vertexNormals; }
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

			if(parameters && parameters.jsonOut) { jsonOut.indices = cubeVertexIndices; }
			buffers["vertexIndex"] = cubeVertexIndexBuffer;
			buffers["useIndices"] = true;

			if(isNaN(buffersList[key])) { Gizmo.addToBuffersList(key, buffers); }
			if(parameters && parameters.jsonOut) { parameters.jsonOut = jsonOut; }
		}
		return Gizmo.getBufferIndex(key);
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

		var key = "sphere-latBands:"+latBands+"-longBands:"+longBands+"-scale:"+scale.toString()+"-offset:"+offset.toString();

		if (Gizmo.checkBufferList(key) || parameters.jsonOut) {
			var buffers = [];
			var jsonOut = {};

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

			if(parameters.jsonOut) { jsonOut.vertexPositions = vertexPositionData; }
			buffers["vertexPosition"] = sphereVertexPositionBuffer;

			// Normals, WARNING: dependant on shaderProgram
			var sphereVertexNormalBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexNormalBuffer);
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(normalData), _gl.STATIC_DRAW);
			sphereVertexNormalBuffer.itemSize = 3;
			sphereVertexNormalBuffer.numItems = normalData.length / 3;

			if(parameters.jsonOut) { jsonOut.vertexNormals = normalData; }
			buffers["vertexNormals"] = sphereVertexNormalBuffer;

			var sphereVertexTextureCoordBuffer = _gl.createBuffer();

			_gl.bindBuffer(_gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(textureCoordData), _gl.STATIC_DRAW);
			sphereVertexTextureCoordBuffer.itemSize = 2;
			sphereVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

			if(parameters.jsonOut) { jsonOut.vertexTextureCoords = textureCoordData; }
			buffers["textureCoords"] = sphereVertexTextureCoordBuffer; 

			// Index Buffer
			var sphereVertexIndexBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, sphereVertexIndexBuffer);
			_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), _gl.STATIC_DRAW);
			sphereVertexIndexBuffer.itemSize = 1;
			sphereVertexIndexBuffer.numItems = indexData.length;

			if(parameters.jsonOut) { jsonOut.indices = indexData; }
			buffers["vertexIndex"] = sphereVertexIndexBuffer;
			buffers["useIndices"] = true;

			if(parameters.jsonOut) { parameters.jsonOut = jsonOut; }
			if(isNaN(buffersList[key])) { Gizmo.addToBuffersList(key, buffers); }
		}
		return Gizmo.getBufferIndex(key);
	}
	function createRing(parameters) {
		var innerRadius, outerRadius, thickness, sides;
		var scale = [1, 1, 1];
		var offset = [0, 0, 0];

		if(!parameters) { throw new Error("innerRadius, outRadius, thickness and numberOfSides must be provided."); }
		if(parameters.scale) { scale = parameters.scale; }
		if(parameters.offset) { offset = parameters.offset; }
		if(parameters.innerRadius) { innerRadius = parameters.innerRadius; }
		else { throw new Error("innerRadius must be provided"); }
		if(parameters.outerRadius) { outerRadius = parameters.outerRadius; }
		else { throw new Error("outerRadius must be provided"); }
		if(parameters.thickness) { thickness = parameters.thickness; }
		else { throw new Error("thickness must be provided"); }
		if(parameters.numberOfSides) { sides = parameters.numberOfSides; }
		else { throw new Error("numberOfSides must be provided"); }

		var key = "ring-innerRadius:"+innerRadius+"-outerRadius:"+outerRadius+"-thickness:"+thickness+"-sides:"+sides+"-scale:"+scale.toString()+"-offset:"+offset.toString();

		if (Gizmo.checkBufferList(key) || parameters.jsonOut) {
			var buffers = [];
			var jsonOut = {};

			var vertexPositionData = [];
			var normalData = [];
			var textureCoordData = [];
			var offset = thickness / 2;
			var i, j;
			// Create vertex, normal, textureCoord data, for each ring of vertices
			for(i = 0; i <= sides; i++) {
				var theta = (i/sides)*2*Math.PI;
				var sinTheta = Math.sin(theta);
				var cosTheta = Math.cos(theta);

				var x, y, z, nx, ny, nz, u, v;
				function pushVertices() { vertexPositionData.push(x); vertexPositionData.push(y); vertexPositionData.push(z); }
				function pushNormals() { normalData.push(nx); normalData.push(ny); normalData.push(nz); }
				function pushTextureCoords() { textureCoordData.push(u); textureCoordData.push(v); }

				// Outer Back
				x = outerRadius*sinTheta;
				y = outerRadius*cosTheta;
				z = -offset;
				pushVertices();
				nx = sinTheta;
				ny = cosTheta;
				nz = 0;
				pushNormals();
				u = 0;
				v = i/(2*sides);
				pushTextureCoords();

				// Outer Front
				z = +offset;
				pushVertices();
				pushNormals();
				u = 0.5;
				pushTextureCoords();

				// Front Outer
				pushVertices();
				nx = 0;
				ny = 0;
				nz = 1;
				pushNormals();
				u = 0.25*sinTheta+ 0.75;
				v = 0.25*cosTheta + 0.25;
				pushTextureCoords();

				// Front Inner
				x = innerRadius*sinTheta;
				y = innerRadius*cosTheta;
				pushVertices();
				pushNormals();
				u = 0.25*(innerRadius/outerRadius)*sinTheta + 0.75;
				v = 0.25*(innerRadius/outerRadius)*cosTheta + 0.25;
				pushTextureCoords();

				// Inner Front
				pushVertices();
				nx = -sinTheta;
				ny = -cosTheta;
				nz = 0;
				pushNormals();
				u = 0;
				v = 0.5 + i/(2*sides);
				pushTextureCoords();

				// Inner Back
				z = -offset;
				pushVertices();
				pushNormals();
				u = 0.5;
				pushTextureCoords();

				// Back Inner
				pushVertices();
				nx = 0;
				ny = 0;
				nz = -1;
				pushNormals();
				u = 0.25*sinTheta + 0.75;
				v = 0.25*cosTheta + 0.75;
				pushTextureCoords();

				// Back Outer
				x = outerRadius*sinTheta;
				y = outerRadius*cosTheta;
				z = -offset;
				pushVertices();
				pushNormals();
				u = 0.25*(innerRadius/outerRadius)*sinTheta + 0.75;
				v = 0.25*(innerRadius/outerRadius)*cosTheta + 0.75;
				pushTextureCoords();
			}

			var indexData = [];
			// Create index buffer
			for(i = 1; i <= sides; i++) {
				// Push each quad
				for(j = -8; j < 0; j+=2)
				{
					// First Triangle
					indexData.push(8*i+j);
					indexData.push(8*i+(j+1));
					indexData.push(8*i+(j+8));
					// Second Triangle
					indexData.push(8*i+(j+8));
					indexData.push(8*i+(j+1));
					indexData.push(8*i+(j+9));
				}
			}

			// Bind Buffers
			// Vertex Buffer
			var ringVertexPositionBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, ringVertexPositionBuffer);
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), _gl.STATIC_DRAW);
			ringVertexPositionBuffer.itemSize = 3;
			ringVertexPositionBuffer.numItems = vertexPositionData.length / 3;

			if(parameters.jsonOut) { jsonOut.vertexPositions = vertexPositionData; }
			buffers["vertexPosition"] = ringVertexPositionBuffer;

			// Normals, WARNING: dependant on shaderProgram
			var ringVertexNormalBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, ringVertexNormalBuffer);
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(normalData), _gl.STATIC_DRAW);
			ringVertexNormalBuffer.itemSize = 3;
			ringVertexNormalBuffer.numItems = normalData.length / 3;

			if(parameters.jsonOut) { jsonOut.vertexNormals = normalData; }
			buffers["vertexNormals"] = ringVertexNormalBuffer;

			var ringVertexTextureCoordBuffer = _gl.createBuffer();

			_gl.bindBuffer(_gl.ARRAY_BUFFER, ringVertexTextureCoordBuffer);
			_gl.bufferData(_gl.ARRAY_BUFFER, new Float32Array(textureCoordData), _gl.STATIC_DRAW);
			ringVertexTextureCoordBuffer.itemSize = 2;
			ringVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

			if(parameters.jsonOut) { jsonOut.vertexTextureCoords = textureCoordData; }
			buffers["textureCoords"] = ringVertexTextureCoordBuffer;

			// Index Buffer
			var ringVertexIndexBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, ringVertexIndexBuffer);
			_gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), _gl.STATIC_DRAW);
			ringVertexIndexBuffer.itemSize = 1;
			ringVertexIndexBuffer.numItems = indexData.length;

			if(parameters.jsonOut) { jsonOut.indices = indexData; }
			buffers["vertexIndex"] = ringVertexIndexBuffer;
			buffers["useIndices"] = true;

			if(parameters.jsonOut) { parameters.jsonOut = jsonOut; }
			if(isNaN(buffersList[key])) { Gizmo.addToBuffersList(key, buffers); }
		}

		return Gizmo.getBufferIndex(key);
	}

	function createRay() {
		if (isNaN(buffersNameList["ray"])) {
			var buffers = [];

			buffers.renderMode = "wireframe";

			var rayVertexPositionBuffer = _gl.createBuffer();
			_gl.bindBuffer(_gl.ARRAY_BUFFER, rayVertexPositionBuffer);
			var vertices = [
				 0.0,  0.0,  0,
				 0.0, 0.0,  1.0
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
				2, 3,   3, 0
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
		createRing:                 createRing,
		createRay:					createRay,
		createPoint:				createPoint,
		createSquare:				createSquare,
		createBox:					createBox,
		createCross:				createCross,
		createBrace:				createBrace
	}
}();