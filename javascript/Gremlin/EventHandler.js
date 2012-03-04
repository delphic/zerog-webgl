var EventHandler = function() {
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
	document.onkeydown = function(event) { onKeyDown(event); }
	document.onkeyup = function(event) { onKeyUp(event); }

	// May want to move this to canvas
	document.onmousemove = function(event) { onMouseMove(event); }
	document.onmousedown = function(event) { onMouseDown(event); }
	document.onmouseup = function(event) { onMouseUp(event); }

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
}();  