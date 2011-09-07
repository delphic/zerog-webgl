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
			default:
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
	
	// Old HUD
	function showHud() {
		if(hudActive) return;
		else hudActive = true;
		setHudValues(100,100,100,100);
		$("#hudContainer").show();
	}
	
	function hideHud() {
		$("#hudContainer").hide();
		hudActive = false;
	}
	
	function setHudValues(health, shield, energy) {
		$("#playerHUD .health").css("width", health+"%");
		$("#playerHUD .shield").css("width", shield+"%");
		$("#playerHUD .energy").css("width", energy+"%");
	}
	
	
	var hudActive = false;
	
	// New HUD
	var hudElements = [];
	
	function hudElement(position, size, color) {
		this.position = position; 
		this.size = size;
		this.color = color;
		
		this.buffers = [];
		this.texture;
		
		this.setPosition = function(position) { this.position = position; }
		this.setSize = function(size) { this.size = size; }
		this.setColor = function(color) { this.color = color; }
		this.assignBuffer = function(index) { this.buffers = index; }

		// Render Flags
		this.visible = true;
		this.wireframe = false;
		this.points = false; // TODO: Combine this and wireframe into a render type (triangles / lines / points etc)
		this.useIndices = false;
		this.useTextures = false;
	}
	
	function createHudElement(position,size,color,textureName) {
		var element = new hudElement(position,size,color);
		var textured;
		
		if (textureName) { 
			textured = true;
		}
		else {
			textured = false;
		}
		
		// Create Object
		
		if(textured) {
			element.texture = Gremlin.createTexture(textureName);
		}
				
		hudElements.push(element);
		
		return element;
	}
	
	function renderHud() {
		for (element in hudElements) {
			// Render
		}
	}
	
	function clearHud() {
		hudElements.splice(0, hudElements.length);
	}
	
	function updateHud() {
		// TODO: link any variables by function to get so we can set values accordingly
	}
	
	return {
		showHud:			showHud,
		hideHud:			hideHud,
		setHudValues:		setHudValues,
		createHudElement:	createHudElement,
		clearHud:			clearHud,
		renderHud:			renderHud,
		updateHud:			updateHud
	}	
}
var GremlinHUD = _HUD(); 