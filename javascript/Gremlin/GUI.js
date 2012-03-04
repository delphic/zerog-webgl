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

var GUI = function() {
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

		EventHandler.bindEvent("onresize", setStyleSize);
	});

	return { 
		setStyleSize: 	setStyleSize,
		setOnClick:     setOnClick,
		setOnHover:     setOnHover,
		pause: 			pause,
		endGame:		endGame
	}
}();