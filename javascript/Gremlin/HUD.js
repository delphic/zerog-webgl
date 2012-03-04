var HUD = function() {
	var viewPortRatio = 1.6; // Height is used to calculate size of elements, so horizonal sizes need to be resized.
	var hudActive = false; // TODO: Actually use this!

	// List of HUD elements
	var hudElements = [];
	var hudGroups = [];

	// Note: Position is of centre of Rect to draw, where x=-1 is left side and x=+1 is right side, y = +1 is top and y=-1 is bottom.
	//       z ~= z-index, the depth buffer takes care of what appears atop other things.
	// Note: Size is amount of the screen to take up x=1 & y=1 will cover the screen.
	function HudElement(position, size, color) {
		if(!(this instanceof HudElement)) {
			return new HudElement(position, size, color);
		}

		this.position = [position[0],position[1],position[2]];
		this.rotation = mat4.identity(mat4.create());
		this.size = [size[0],size[1]];
		this.color = [color[0],color[1],color[2],color[3]];

		this.buffers;
		this.texture;

		this.setPosition = function(position) { this.position = [position[0],position[1],position[2]]; }
		this.setSize = function(size) { this.size = [size[0],size[1]]; }
		this.getPosition = function() { return [this.position[0], this.position[1], this.position[2]]; }
		this.getSize = function() { return [this.size[0],this.size[1]]; }
		this.setColor = function(color) { this.color = [color[0],color[1],color[2],color[3]]; }
		this.assignBuffer = function(index) { this.buffers = index; }
		this.setVisibility = function(value) { this.visible = value; }

		this.rotate = function(amount, X, Y, Z) { mat4.rotate(this.rotation, Gizmo.degToRad(amount), [X, Y, Z]); }
		this.setRotation = function(yaw, pitch, roll) {
			mat4.identity(this.rotation);
			mat4.rotate(this.rotation, Gizmo.degToRad(yaw), [0,1,0]);
			mat4.rotate(this.rotation, Gizmo.degToRad(pitch), [1,0,0]);
			mat4.rotate(this.rotation, Gizmo.degToRad(roll), [0,0,1]);
		}
		this.getRotation = function() {
			return mat4.create(this.rotation);
		}

		// Render Flags
		this.visible = true;
		this.useIndices = false;
		this.useTextures = false;
	}

	// Groups a set of elements onto a rectangle with element position as described above now being position on the rectangle.
	// Elements should be added as normal in master list, then attached to a group, then group can be manipulated and elements
	// separately.

	function HudGroup(position, size) {
		if(!(this instanceof HudGroup)) {
			return new HudGroup(position, size);
		}

		this.elements = [];
		this.position = [position[0],position[1],position[2]];
		this.size = [size[0],size[1]];

		this.attachElementToGroup = function(element) {
			this.resizeElementToGroup(this.elements.push(element)-1);
		}

		this.resizeElementToGroup = function(index) {
			// Move and Scale the object according to group
			var targetElement = this.elements[index];
			var currentSize = targetElement.getSize();
			var currentPosition = targetElement.getPosition();
			targetElement.setSize([currentSize[0]*this.size[0], currentSize[1]*this.size[1]]);
			targetElement.setPosition([this.position[0]+currentPosition[0]*this.size[0], this.position[1]+currentPosition[1]*this.size[1], currentPosition[2]]);
		}

		this.unresizeElementToGroup = function(index) {
			var targetElement = this.elements[index];
			var currentSize = targetElement.getSize();
			var currentPosition = targetElement.getPosition();
			targetElement.setSize([currentSize[0]/this.size[0], currentSize[1]/this.size[1]]);
			targetElement.setPosition([(currentPosition[0]-this.position[0])/this.size[0], (currentPosition[1]-this.position[1])/this.size[1], currentPosition[2]]);
		}
		// Move Group - reverse calculation of above for all elements, then resize group, then run function above for all elements
		this.moveGroup = function(position) {
			for(key in this.elements) {
				if(this.elements.hasOwnProperty(key)) { this.unresizeElementToGroup(key); }
			}
			this.position = [position[0],position[1],position[2]];
			for(key in this.elements) {
				if(this.elements.hasOwnProperty(key)) { this.resizeElementToGroup(key); }
			}
		}
		// Resize Group - same as move but for scale
		this.resizeGroup = function(size) {
			for(key in this.elements) {
				if(this.elements.hasOwnProperty(key)) { this.unresizeElementToGroup(key); }
			}
			this.size = [size[0],size[1]];
			for(key in this.elements) {
				if(this.elements.hasOwnProperty(key)) { this.resizeElementToGroup(key); }
			}
		}

		this.hideElements = function() {
			for(key in this.elements) {
				if(this.elements.hasOwnProperty(key)) { this.elements[key].setVisibility(false); }
			}
		}

		this.showElements = function() {
			for(key in this.elements) {
				if(this.elements.hasOwnProperty(key)) { this.elements[key].setVisibility(true); }
			}
		}

	}

	function createGroup(position, size) {
		return hudGroups.push(new HudGroup(position,size))-1;
	}

	// Attach Element To Group
	function attachElementToGroup(groupIndex, elementIndex){
		hudGroups[groupIndex].attachElementToGroup(hudElements[elementIndex]);
	}
	// Move Group Function
	function setGroupPosition(groupIndex, position){
		hudGroups[groupIndex].moveGroup(position);
	}
	// Resize Group Function
	function setGroupSize(groupIndex, size){
		hudGroups[groupIndex].resizeGroup(size);
	}
	function hideGroupElements(groupIndex) {
		hudGroups[groupIndex].hideElements();
	}
	function showGroupElements(groupIndex) {
		hudGroups[groupIndex].showElements();
	}

	// Element Functions
	function createElement(position, size, color, textureName) {
		var element = new HudElement(position,[size[0]/viewPortRatio,size[1]],color);

		if (textureName) { 
			element.useTextures = true;
		}
		else {
			element.useTextures = false;
		}

		element.assignBuffer(Primitives.createSquare());

		if(textureName) {
			element.texture = Gizmo.createTexture(textureName, 1);
		}

		return hudElements.push(element)-1;
	}

	function createTextElement(position, text, textSize, colour, alignment, font, maxWidth) {
		maxWidth = maxWidth || 0;

		var textureCanvas = Utilities.createUtilityCanvas();
		var size = TextWriter.drawText(text, textSize, alignment, colour, font, maxWidth, textureCanvas);
		var textureId = Gizmo.createTextureFromCanvas(textureCanvas, function() { Utilities.destroyUtilityCanvas(textureCanvas); });

		// convert size to faction of canvas
		var canvasSize = Game.getCanvasSize();
		size = [2*size[0]/canvasSize[0], 2*size[1]/canvasSize[1]];

		var element = new HudElement(position, size, [1,1,1,1]);
		element.assignBuffer(Gremlin.Primitives.createSquare());
		element.useTextures = true;
		element.texture = textureId;

		return hudElements.push(element)-1;
	}

	function createWireframe(type, position, size, color) {
		var element = new HudElement(position,[size[0]/viewPortRatio,size[1]],color);

		element.updateValue = function(value) {
			// Updates Position
			this.position = value;
		}

		switch(type) {
			case "Cross":
				element.assignBuffer(Primitives.createCross());
				break;
			case "Brace":
				element.assignBuffer(Primitives.createBrace());
				break;
			case "Box":
				element.assignBuffer(Primitives.createBox());
				break;
			default:
				throw("Unknown wireframe type "+type);
				break;
		}

		return hudElements.push(element)-1;
	}

	function createBar(position, size, barColor, boxColor, alignment, textureName) {
		// Create Containing Box
		var boxElement = new HudElement([position[0],position[1], -1],[size[0]/viewPortRatio,size[1]],boxColor);

		boxElement.assignBuffer(Primitives.createBox());

		var boxIndex = 	hudElements.push(boxElement)-1;

		// Create Bar
		var barElement = new HudElement([position[0],position[1], -0.5],[size[0]/viewPortRatio,size[1]],barColor);

		// Set up bar specific variables and functions
		if(alignment != "Horizontal" && alignment != "Vertical") {
			throw("Invalid Bar Alignment");
		}
		barElement.alignment = alignment;
		barElement.currentValue = 1.0;

		if (alignment == "Horizontal") {
			barElement.maxSize = size[0]/viewPortRatio;
			barElement.normalOffset = position[0];
		}
		else {
			barElement.maxSize = size[1];
			barElement.normalOffset = position[1];
		}

		barElement.updateValue = function(value) {
			this.currentValue = value;
			var index = 0;
			if (this.alignment == "Vertical") index = 1;

			this.size[index] = this.currentValue*this.maxSize;
			this.position[index] =  this.normalOffset-(this.maxSize - this.size[index]);
		}

		// Add link to boxIndex
		barElement.boxIndex = boxIndex;

		// Override .setPosition, .setSize, .setColor to change both box and bar
		barElement.setPosition = function(position) {
			// Update Box
			hudElements[this.boxIndex].setPosition(position);

			// Update Bar
			this.position = [position[0],position[1],this.position[2]];
			// Update Offset
			if (this.alignment == "Horizontal") {
				this.normalOffset = position[0];
			}
			else {
				this.normalOffset = position[1];
			}
			this.updateValue(this.currentValue);
		}

		barElement.setSize = function(size) {
			var adjsutedSize = [size[0],size[1]];
			// Update Box
			hudElements[this.boxIndex].setSize(adjsutedSize);

			// Update Bar
			this.size = adjsutedSize;
			// Update maxSize
			if (this.alignment == "Horizontal") {
				this.maxSize = size[0];
			}
			else {
				this.maxSize = size[1];
			}
			this.updateValue(this.currentValue);
		}

		barElement.getPosition = function() {
			return [hudElements[this.boxIndex].position[0], hudElements[this.boxIndex].position[1], hudElements[this.boxIndex].position[2]];
		}
		barElement.getSize = function() {
			return [hudElements[this.boxIndex].size[0], hudElements[this.boxIndex].size[1]];
		}

		barElement.setVisibility = function(value) {
			hudElements[this.boxIndex].setVisibility(value);
			this.visible = value;
		}

		barElement.setColor = function(boxColor, barColor) {
			hudElements[this.boxIndex].setColor(boxColor);
			this.color = [barColor[0],barColor[1],barColor[2],barColor[3]];
		}

		// Get on with creating the render object
		if (textureName) { 
			barElement.useTextures = true;
		}
		else {
			barElement.useTextures = false;
		}

		barElement.assignBuffer(Primitives.createSquare());

		if(textureName) {
			barElement.texture = Gizmo.createTexture(textureName);
		}

		return hudElements.push(barElement)-1;
	}

	function renderHud() {
		var hudElementsMax = hudElements.length;

		// TODO: Move this to the engine.
		var renderQueue = hudElements.slice(0); // Copy hudElements Array
		renderQueue.sort(function(a,b){ return b.position[2] - a.position[2]; }); // Render deepest first

		for (var i=0; i < hudElementsMax; i++) {
			Gizmo.renderPlane(renderQueue[i]);
		}
	}

	function rescaleHud() {
		var canvasSize = Game.getCanvasSize();
		var newRatio = canvasSize[0]/canvasSize[1];

		var hudElementsMax = hudElements.length;
		for(var i=0; i < hudElementsMax; i++) {
			hudElements[i].size[0] *= (viewPortRatio)/(newRatio);
			if(hudElements[i].maxSize && hudElements[i].alignment == "Horizontal") {
				hudElements[i].maxSize *= (viewPortRatio)/(newRatio);
			}
		}
		viewPortRatio = newRatio;
	}

	EventHandler.bindEvent("onresize", rescaleHud); // TODO: This should probably go in an init

	function clearHud() {
		hudElements.splice(0, hudElements.length);
		hudGroups.splice(0, hudGroups.length);
	}

	function updateHud(items) {
		for(key in items) {
			if(items.hasOwnProperty(key)) {
				hudElements[items[key].index].updateValue(items[key].value);
			}
		}		
	}

	function updateElement(index, position, size, rotation) {
		if (position) { hudElements[index].setPosition(position); }
		if (size) { hudElements[index].setSize([size[0]/viewPortRatio, size[1]]); }
		if(rotation) { hudElements[index].setRotation(rotation[0],rotation[1], rotation[2]); }
	}

	function showElement(index) {
		hudElements[index].setVisibility(true);
	}

	function hideElement(index) {
		hudElements[index].setVisibility(false);
	}

	function transformToHudCoords(coords) {
		var result = [0,0];
		var canvasSize = Game.getCanvasSize();
		for(var i = 0; i<2; i++) {
			result[i] = (coords[i]-(canvasSize[i]/2))/(canvasSize[i]/2);
		}
		return result;
	}

	return {
		createGroup:		createGroup,
		attachElementToGroup:	attachElementToGroup,
		setGroupPosition:	setGroupPosition,
		setGroupSize:		setGroupSize,
		showGroupElements:	showGroupElements,
		hideGroupElements:	hideGroupElements,
		createElement:		createElement,
		createBar:			createBar,
		createTextElement:	createTextElement,
		createWireframe:	createWireframe,
		clearHud:			clearHud,
		renderHud:			renderHud,	
		rescaleHud:			rescaleHud,
		transformToHudCoords:   transformToHudCoords,
		updateHud:			updateHud,
		updateElement:		updateElement,
		showElement:		showElement,
		hideElement:		hideElement
	}	
}(); 