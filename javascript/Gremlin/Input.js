var Input = function() {

	// This may need to go in an init function
	EventHandler.bindEvent("onmousemove", handleMouseMove);
	EventHandler.bindEvent("onmousedown", handleMouseDown, true);
	EventHandler.bindEvent("onmouseup", handleMouseUp);
	EventHandler.bindEvent("onkeyup", handleKeyUp);
	EventHandler.bindEvent("onkeydown", handleKeyDown);

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
}();