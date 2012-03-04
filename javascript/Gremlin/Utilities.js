var Utilities = function() {
	function createUtilityCanvas() {
		var canvasId = "utilityCanvas-"+Math.random()/Math.random();
		$("body").append("<canvas id='"+canvasId+"' style='display: none;'></canvas>"); // TODO: Remove JQuery dependency
		return canvasId;
	}

	function destroyUtilityCanvas(id) {
		// This doesn't appear to work!
		$("#"+id).remove(); // TODO: Remove JQuery dependency
	}

	return {
		createUtilityCanvas:        createUtilityCanvas,
		destroyUtilityCanvas:       destroyUtilityCanvas
	}
}();