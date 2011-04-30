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

	// Public
	function init() {
		var canvas = document.getElementById("gremlinCanvas");
		_initGL(canvas);        
		_initShaders();
		_initBuffers();
		

		_gl.clearColor(0.0, 0.0, 0.0, 1.0);
        _gl.enable(_gl.DEPTH_TEST);
	}
	
	// Maths Functions
    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

	// Draw Scene
    function drawScene() {
        _gl.viewport(0, 0, _gl.viewportWidth, _gl.viewportHeight);
        _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, _gl.viewportWidth / _gl.viewportHeight, 0.1, 100.0, _pMatrix);

		// TODO : Add Render Object Method
		// Render Object
        mat4.identity(_mvMatrix);

        mat4.translate(_mvMatrix, [-1.5, 0.0, -8.0]);

        _mvPushMatrix();
        mat4.rotate(_mvMatrix, degToRad(rPyramid), [0, 1, 0]);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
        _gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, _gl.FLOAT, false, 0, 0);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
        _gl.vertexAttribPointer(_shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, _gl.FLOAT, false, 0, 0);

        _setMatrixUniforms();
		// NB: Debug objects to be drawn depedent on flag (render as - wireframe or solid)
        _gl.drawArrays(_gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);

        _mvPopMatrix();
		// End Render Object

		// TODO: Switch to rendering relative to origin rather than last object, these two objects are independant.
		// Render Object
        mat4.translate(_mvMatrix, [3.0, 0.0, 0.0]);

        _mvPushMatrix();
        mat4.rotate(_mvMatrix, degToRad(rCube), [1, 1, 1]);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
        _gl.vertexAttribPointer(_shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, _gl.FLOAT, false, 0, 0);

        _gl.bindBuffer(_gl.ARRAY_BUFFER, cubeVertexColorBuffer);
        _gl.vertexAttribPointer(_shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, _gl.FLOAT, false, 0, 0);

        _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
        _setMatrixUniforms();
        _gl.drawElements(_gl.TRIANGLES, cubeVertexIndexBuffer.numItems, _gl.UNSIGNED_SHORT, 0);

        _mvPopMatrix();
		// End Render Object
    }
	
	// Animate Function
	function animate(elapsed) {
		rPyramid += (90 * elapsed) / 1000.0;
		rCube -= (75 * elapsed) / 1000.0;
	}
	
	// TODO: Place in an  array in a manager
    var pyramidVertexPositionBuffer;
    var pyramidVertexColorBuffer;
    var cubeVertexPositionBuffer;
    var cubeVertexColorBuffer;
    var cubeVertexIndexBuffer;
	
	// Again should be in a manager
    var rPyramid = 0;
    var rCube = 0;	
	
	// Private
	// WebGL Obj
	var _gl;
	
	// View Matrix
    var _mvMatrix = mat4.create();
    var _mvMatrixStack = [];
    // Perspective Matrix
	var _pMatrix = mat4.create();

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
	
	// TODO: Alter to use manager
	// Vertices for Debug Shapes to be stored in engine
	// Debug shapes to have a single colour
	// TODO: Include element buffers
    function _initBuffers() {
        pyramidVertexPositionBuffer = _gl.createBuffer();
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

        pyramidVertexColorBuffer = _gl.createBuffer();
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


        cubeVertexPositionBuffer = _gl.createBuffer();
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

        cubeVertexColorBuffer = _gl.createBuffer();
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

        cubeVertexIndexBuffer = _gl.createBuffer();
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
	
	// Return
	return { init: init, drawScene: drawScene, animate: animate, degToRad: degToRad };
}

var Gremlin = _Gremlin();