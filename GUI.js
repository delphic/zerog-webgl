/*
* GUI is created and controlled by a number of attributes:
* gui-role, gui-id & gui-target
* Essentially role defines what events to bind, and target and id tell you want to hide and show in these events
* role is also used to perform actions as well as navigate, e.g. starting the game, saving values, etc
*/

function _GUI() {
	// TODO: Move controller functions
	var gameState = "InMenu";
	var resolutionScale, lighting, lightingType, specularLighting, textureFiltering;
	
	function startGame(val) {
		// TODO: Start Game with val
		$("#menuContainer").hide();
		$("#gameContainer").show();
		gameState = "InGame";
	}
	function resumeGame() {
		// TODO: Unpause
		$("#menuContainer").hide();
		$("#gameContainer").show();
		gameState = "InGame";
	}
	function pauseGame() {
		// TODO: Pause
		$("#gameContainer").hide();
		$("#menuContainer").show();
		gameState = "InMenu";
	}
	function applyOptions() {
		resolutionScale = document.getElementById(optionsResolution).value;
		lighting = document.getElementById(optionsLighting);
		if (lighting) { lightingType = lighting; lighting = true; } 
		textureFiltering = document.getElementById(optionsTextureFiltering);
		specularLighting = document.getElementById(optionsSpecularLighting);
	}
	
	function setStyleSize() { 
		// Adds explicit height and font size for GUI scaling
		$("#menuContainer").css("height",window.innerHeight*0.8);
		$("#menuContainer").css("font-size",window.innerHeight/20);
	}
		
		
	$(document).ready( function() {
		
		setStyleSize();
		window.onresize = function() { setStyleSize(); }
	
		$('div[gui-role="menu"]').addClass("menu").hide();
		$('div[gui-role]"menu"][gui-id="mainMenu"]').show();
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
		
		// Value Visulater for Resolution Slider
		$('#optionsResolution').change(function() { 
			var factor = parseFloat($(this).val(),10);
			$('#optionsResolutionOutput').html(factor.toFixed(1)); });
	});
	$(window).jkey('esc', function() { if(gameState === "InGame") pauseGame(); });
}
var GUI = _GUI();