// ZeroG.Game.PauseController
var PauseController = function() {
    var running = true;
    var windowPaused = false;

    function handlePause() {
        if(running) {
            _pause();
        }
        else {
            _unpause();
        }
    }

    function handleUnpause() {
        if(!running) {
            _unpause();
        }
    }

    function handleWindowBlur() {
        if(running) {
            windowPaused = true;
            _pause();
        }
    }

    function handleWindowFocus() {
        if(windowPaused) {
            windowPaused = false;
            _unpause();
        }
    }
    function isRunning() { return running; }
    function _pause() { running = false; }
    // TODO: if/when the game timer moves to an object adjust this
    function _unpause() { running = true; lastTime = new Date().getTime(); requestAnimFrame(tick); }

    return { 
        isRunning: isRunning,
        handlePause: handlePause,
        handleUnpause: handleUnpause,
        handleWindowBlur: handleWindowBlur,
        handleWindowFocus: handleWindowFocus
    };
}();
