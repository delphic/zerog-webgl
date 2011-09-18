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
	// TODO: Move controller functions
	var resolutionScale, lighting, lightingType, specularLighting;
	
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
		// TODO: Unpause
		$("#menuContainer").hide();
		Game.updateGameState("InGame");
		Game.unpause();
	}
	function pauseGame() {
		// TODO: Pause
		$("#menuContainer").show();
		Game.updateGameState("InMenu");
		Game.pause();
	}
	function exitToMenu() {
		Game.unpause();
		Game.unloadLevel();
		Game.loadLevel("menu.js", "InMenu"); 
	}
	function applyOptions() { // TODO: Move controller functions
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
		$("#menuContainer").css("width",window.innerWidth*1); // TODO: need factor as variable
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
			});
		});
		
		$('[gui-role*="navButton"]').each(function() {
			$(this).click(function() {
				$(this).parents('[gui-role="menu"]').hide();
				$('[gui-role="menu"][gui-id="'+$(this).attr("gui-target")+'"]').show();
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
		
		// Value Visulater for Resolution Slider
		$('#optionsResolution').change(function() { 
			var factor = parseFloat($(this).val(),10);
			$('#optionsResolutionOutput').html(factor.toFixed(1)); 
		});
		
		GremlinEventHandler.bindEvent("onresize", setStyleSize);
	});
	
	return { 
		setStyleSize: 	setStyleSize,
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
	
	// Note: Position is of centre of Rect to draw, where x=-1 is left side and x=+1 is right side, y = +1 is top and y=-1 is bottom.
	//       z ~= z-index, the depth buffer takes care of what appears atop other things.
	// Note: Size is amount of the screen to take up x=1 & y=1 will cover the screen.
	function hudElement(position, size, color) {
		this.position = [position[0],position[1],position[2]]; 
		this.size = [size[0],size[1]];
		this.color = [color[0],color[1],color[2],color[3]];
		
		this.buffers = [];
		this.texture;
		
		this.setPosition = function(position) { this.position = [position[0],position[1],position[2]]; }
		this.setSize = function(size) { this.size = [size[0],size[1]]; }
		this.setColor = function(color) { this.color = [color[0],color[1],color[2],color[3]]; }
		this.assignBuffer = function(index) { this.buffers = index; }

		// Render Flags
		this.visible = true;
		this.wireframe = false;
		this.points = false; // TODO: Combine this and wireframe into a render type (triangles / lines / points etc)
		this.useIndices = false;
		this.useTextures = false;
	}
	
	function createElement(position, size, color, textureName) {
		var element = new hudElement(position,[size[0]/viewPortRatio,size[1]],color);
		var textured;
		
		if (textureName) { 
			textured = true;
		}
		else {
			textured = false;
		}
		
		Gremlin.createSquare(element, textured);
		
		if(textured) {
			element.texture = Gremlin.createTexture(textureName);
		}
				
		return hudElements.push(element)-1;
	}
	
	function createWireframe(type, position, size, color) {
		var element = new hudElement(position,[size[0]/viewPortRatio,size[1]],color);
		
		element.updateValue = function(value) {
			// Updates Position
			this.position = value;
		}
		
		switch(type) {
			case "Cross":
				Gremlin.createCross(element);
				break;
			case "Brace":
				Gremlin.createBrace(element);
				break;
			case "Box":
				Gremlin.createBox(element);
				break;
			default:
				throw("Unknown wireframe type "+type);
				break;
		}
		
		return hudElements.push(element)-1;
	}
	
	function createBar(position, size, barColor, boxColor, alignment, textureName) {
		// Create Containing Box
		var boxElement = new hudElement([position[0],position[1], -1],[size[0]/viewPortRatio,size[1]],boxColor);

		Gremlin.createBox(boxElement);
		
		var boxIndex = 	hudElements.push(boxElement)-1;
		
		// Create Bar
		var barElement = new hudElement([position[0],position[1], -0.5],[size[0]/viewPortRatio,size[1]],barColor);
		
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
			var adjsutedSize = [size[0]/viewPortRatio,size[1]];
			// Update Box
			hudElements[this.boxIndex].setSize(adjsutedSize);

			// Update Bar
			this.size = adjsutedSize;
			// Update maxSize
			if (this.alignment == "Horizontal") {
				this.maxSize = size[0]/viewPortRatio;
			}
			else {
				this.maxSize = size[1];
			}
			this.updateValue(this.currentValue);
		}
		
		barElement.setColor = function(boxColor, barColor) {
			hudElements[this.boxIndex].setColor(boxColor);
			this.color = [barColor[0],barColor[1],barColor[2],barColor[3]];
		}
		
		// Get on with creating the render object
		var textured;
				
		if (textureName) { 
			textured = true;
		}
		else {
			textured = false;
		}
		
		Gremlin.createSquare(barElement, textured);
		
		if(textured) {
			barElement.texture = Gremlin.createTexture(textureName);
		}
				
		return hudElements.push(barElement)-1;;
	}
	
	function renderHud() {
		for (element in hudElements) {
			Gremlin.renderPlane(hudElements[element]);
		}
	}
	
	function rescaleHud() {
		var canvasSize = Game.getCanvasSize();
		var newRatio = canvasSize[0]/canvasSize[1];
		
		for(i in hudElements) {
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
	}
	
	function updateHud(items) {
		for(item in items) {
			hudElements[items[item].index].updateValue(items[item].value);
		}		
	}
	
	function updateElement(index, position, size) {
		hudElements[index].setPosition(position);
		hudElements[index].setSize([size[0]/viewPortRatio, size[1]]);	
	}
		
	function showElement(index) {
		hudElements[index].visible = true;
	}
	function hideElement(index) {
		hudElements[index].visible = false;
	}
	
	return {
		createElement:		createElement,
		createBar:			createBar,
		createWireframe:	createWireframe,
		clearHud:			clearHud,
		renderHud:			renderHud,	
		rescaleHud:			rescaleHud,
		updateHud:			updateHud,
		updateElement:		updateElement,
		showElement:		showElement,
		hideElement:		hideElement
	}	
}
var GremlinHUD = _HUD(); 