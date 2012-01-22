//     ___                    _ _           ___        _____ 
//    / _ \_ __ ___ _ __ ___ | (_)_ __     / _ \/\ /\  \_   \
//   / /_\/ '__/ _ \ '_ ` _ \| | | '_ \   / /_\/ / \ \  / /\/
//  / /_\\| | |  __/ | | | | | | | | | | / /_\\\ \_/ /\/ /_  
//  \____/|_|  \___|_| |_| |_|_|_|_| |_| \____/ \___/\____/  

/*
* GUI is created and controlled by a number of attributes:
* gui-role, gui-id & gui-target
* Essentially role defines what events to bind, and target and id tell you want to hide and show in these events
* role is also used to perform actions as well as navigate, e.g. starting the game, saving values, etc
*/

function _GUI() {
	var resolutionScale, lighting, lightingType, specularLighting;
	// Functions to be called on hover / click of links and buttons
	var onHover = function() { /*Blank*/ }
	var onClick = function() { /*Blank*/ }
	function setOnHover(func) { onHover = func; }
	function setOnClick(func) { onClick = func; }

	function startGame(val) {
		$("#menuContainer").hide();
		Game.unloadLevel();
		switch(val) {
			case "1":
				Game.loadLevel("levels/deepspace.js", "InGame");
				break;
			case "2":
				Game.loadLevel("levels/alone.js", "InGame");
				break;
			default:
				alert("Level not Found!");
				return;
		}
	}
	function endGame(message) {
		$('div[gui-role="menu"]').hide();
		$('div[gui-role="menu"][gui-id="endGameMenu"]').show();
		$("#endGameMessage").html(message);
		$("#menuContainer").show();
		Game.updateGameState("InMenu");
		Game.pause();
	}
	function resumeGame() {
		$("#menuContainer").hide();
		Game.updateGameState("InGame");
		Game.unpause();
	}
	function pauseGame() {
		$("#menuContainer").show();
		Game.updateGameState("InMenu");
		Game.pause();
	}
	function exitToMenu() {
		Game.unpause();
		Game.unloadLevel();
		Game.loadLevel("menu.js", "InMenu"); 
	}
	function applyOptions() {
		resolutionScale = document.getElementById("optionsResolution").value;
		lighting = document.getElementById("optionsLighting").value;
		if (lighting != "false") { lightingType = lighting; lighting = true; }
		else { lighting = false; }		
		specularLighting = document.getElementById("optionsSpecularLighting").value;
		Game.applyOptions(resolutionScale, lighting, lightingType, specularLighting);
	}

	function pause() {
		$('div[gui-role="menu"]').hide();
		$('div[gui-role="menu"][gui-id="pauseMenu"]').show();
		$('#menuContainer').show();
	}

	function setStyleSize() { 
		// Adds explicit height (and width for good measure) and font size for GUI scaling
		$("#menuContainer").css("width",window.innerWidth*1);
		$("#menuContainer").css("height",window.innerHeight*1);
		$("#menuContainer").css("font-size",window.innerHeight/20);
	}


	$(document).ready( function() {

		setStyleSize();

		$('div[gui-role="menu"]').addClass("menu").hide();
		$('div[gui-role="menu"][gui-id="mainMenu"]').show();
		$('[gui-role="links"]').addClass("links");
		$('[gui-role="links"] a').each(function() {
			$(this).click(function() { 
				$(this).parents('[gui-role="menu"]').hide();
				$('[gui-role="menu"][gui-id="'+$(this).attr("gui-target")+'"]').show();
				onClick();
			});
			$(this).mouseover(function(){
				onHover();
			});
		});

		$('[gui-role*="navButton"]').each(function() {
			$(this).click(function() {
				$(this).parents('[gui-role="menu"]').hide();
				$('[gui-role="menu"][gui-id="'+$(this).attr("gui-target")+'"]').show();
				onClick();
			});
			$(this).mouseover(function(){
				onHover();
			});
		});

		$('[gui-role*="resumeGame"]').each(function() {
			$(this).click(function() {
				resumeGame();
			});
		});
		$('[gui-role*="startGame"]').each(function() {
			$(this).click(function() {
				startGame($(this).attr("gui-level"));
			});
		});
		$('[gui-role*="applyOptions"]').each(function() {
			$(this).click(function() {
				applyOptions();
			});
		});
		// On exit we don't want the renderer to be paused.
		$('[gui-role*="menuResume"]').each(function() {
			$(this).click(function() {
				exitToMenu();
			});
		});

		// Value Visualiser for Resolution Slider
		$('#optionsResolution').change(function() { 
			var factor = parseFloat($(this).val(),10);
			$('#optionsResolutionOutput').html(factor.toFixed(1)); 
		});

		GremlinEventHandler.bindEvent("onresize", setStyleSize);
	});

	return { 
		setStyleSize: 	setStyleSize,
		setOnClick:     setOnClick,
		setOnHover:     setOnHover,
		pause: 			pause,
		endGame:		endGame
	}
}
var GremlinGUI = _GUI();

function _HUD() {
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

		this.rotate = function(amount, X, Y, Z) { mat4.rotate(this.rotation, Gremlin.degToRad(amount), [X, Y, Z]); }
		this.setRotation = function(yaw, pitch, roll) {
			mat4.identity(this.rotation);
			mat4.rotate(this.rotation, Gremlin.degToRad(yaw), [0,1,0]);
			mat4.rotate(this.rotation, Gremlin.degToRad(pitch), [1,0,0]);
			mat4.rotate(this.rotation, Gremlin.degToRad(roll), [0,0,1]);
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

		element.assignBuffer(Gremlin.Primitives.createSquare());

		if(textureName) {
			element.texture = Gremlin.createTexture(textureName);
		}

		return hudElements.push(element)-1;
	}

	function createTextElement(position, text, textSize, colour, alignment, font, maxWidth) {
		maxWidth = maxWidth || 0;

		var textureCanvas = GremlinUtilities.createUtilityCanvas();
		var size = GremlinTextWriter.drawText(text, textSize, alignment, colour, font, maxWidth, textureCanvas);
		var textureId = Gremlin.createTextureFromCanvas(textureCanvas, function() { GremlinUtilities.destroyUtilityCanvas(textureCanvas); });

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
				element.assignBuffer(Gremlin.Primitives.createCross());
				break;
			case "Brace":
				element.assignBuffer(Gremlin.Primitives.createBrace());
				break;
			case "Box":
				element.assignBuffer(Gremlin.Primitives.createBox());
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

		boxElement.assignBuffer(Gremlin.Primitives.createBox());

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

		barElement.assignBuffer(Gremlin.Primitives.createSquare());

		if(textureName) {
			barElement.texture = Gremlin.createTexture(textureName);
		}

		return hudElements.push(barElement)-1;
	}

	function renderHud() {
		var hudElementsMax = hudElements.length;

		// TODO: Move this to the engine.
		var renderQueue = hudElements.slice(0); // Copy hudElements Array
		renderQueue.sort(function(a,b){ return b.position[2] - a.position[2]; }); // Render deepest first

		for (var i=0; i < hudElementsMax; i++) {
			Gremlin.renderPlane(renderQueue[i]);
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

	GremlinEventHandler.bindEvent("onresize", rescaleHud); // TODO: This should probably go in an init

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
}
var GremlinHUD = _HUD(); 

function _TextWriter() {
	function _getPowerOfTwo(value, pow) {
		var pow = pow || 1;
		while(pow<value) {
			pow *= 2;
		}
		return pow;
	}

	function _measureText(ctx, textToMeasure) {
		return ctx.measureText(textToMeasure).width;
	}

	function _createMultilineText(ctx, textToWrite, maxWidth, text) {
		// TODO: take account of new line / carriage returns in splitting lines
		var currentText = textToWrite;
		var futureText;
		var subWidth = 0;
		var maxLineWidth = 0;

		var wordArray = textToWrite.split(" ");
		var wordsInCurrent, wordArrayLength;
		wordsInCurrent = wordArrayLength = wordArray.length;

		while (_measureText(ctx, currentText) > maxWidth && wordsInCurrent > 1) {
			wordsInCurrent--;
			var linebreak = false;

			currentText = futureText = "";
			for(var i = 0; i < wordArrayLength; i++) {
				if (i < wordsInCurrent) {
					currentText += wordArray[i];
					if (i+1 < wordsInCurrent) { currentText += " "; }
				}
				else {
					futureText += wordArray[i];
					if( i+1 < wordArrayLength) { futureText += " "; }
				}
			}
		}
		text.push(currentText);
		maxLineWidth = _measureText(ctx, currentText);

		if(futureText) {
			subWidth = _createMultilineText(ctx, futureText, maxWidth, text);
			if (subWidth > maxLineWidth) { 
				maxLineWidth = subWidth;
			}
		}

		return maxLineWidth;
	}

	function drawText(textToWrite, textHeight, textAlignment, textColour, fontFamily, maxWidth, canvasId) {
		var canvasX, canvasY;
		var textX, textY;

		var text = [];

		var canvas = document.getElementById(canvasId);
		var ctx = canvas.getContext('2d');

		ctx.font = textHeight+"px "+fontFamily;
		if (maxWidth && _measureText(ctx, textToWrite) > maxWidth ) {
			maxWidth = _createMultilineText(ctx, textToWrite, maxWidth, text);
			canvasX = _getPowerOfTwo(maxWidth);
		} else {
			text.push(textToWrite);
			canvasX = _getPowerOfTwo(ctx.measureText(textToWrite).width);
		}
		canvasY = _getPowerOfTwo(textHeight*(text.length+1));

		canvas.width = canvasX;
		canvas.height = canvasY;

		switch(textAlignment) {
			case "left":
				textX = 0;
				break;
			case "center":
				textX = canvasX/2;
				break;
			case "right":
				textX = canvasX;
				break;
		}
		textY = canvasY/2;	

		ctx.fillStyle = "rgba(0,0,0,0)"; //TODO: Argument
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		ctx.fillStyle = textColour;
		ctx.textAlign = textAlignment;

		ctx.textBaseline = 'middle'; // top, middle, bottom
		ctx.font = textHeight+"px "+fontFamily;

		var offset = (canvasY - textHeight*(text.length+1)) * 0.5;

		for(var i = 0; i < text.length; i++) {
			if(text.length > 1) {
				textY = (i+1)*textHeight + offset;
			}
			ctx.fillText(text[i], textX,  textY);
		}

		return [canvasX, canvasY];
	}

	return {
		drawText: 		drawText
	}
}
var GremlinTextWriter = _TextWriter();
