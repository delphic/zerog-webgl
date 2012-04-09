var Audio = function() {
	var _audioContext;
	var _buffers = [];
	var _masterGain = 0.25;
	var _fxGain = 1.0;
	var _musicGain = 1.0;
	var _distanceFactor = 1.0;

	function init() {
		try {
			_audioContext = new webkitAudioContext();
		}
		catch(e) {
			alert('Web Audio API is not supported in this browser');
		}
	}

	function Sound(url) {
		if(!(this instanceof Sound)) {
			return new Sound(url);
		}

		this.url = url;
		this.volume = 1.0;
		this.isLoading = false;
		this.enqueued = false;
		this.music = false;
		this.instance;
		this.position;
		this.velocity;

		this.onLoad = function(request, callback) {
			// This is a little bit nasty
			var that = this;
			function metaCallback(buffer) {
				callback(buffer);
				that.isLoading = false;
			}
			_audioContext.decodeAudioData(request.response, metaCallback, null); // Takes time to decode data, hence the extra callback
		}
		// Perhaps Music should be set as a property in onLoad?
		this.play = function(time, loop) {
			var time = time || 0;
			var loop = loop || false;

			if(this.isLoading) {
				return false;
			}

			if(loop && this.instance) {
				this.instance.stop(0);
			}

			this.instance = new SoundInstance(this.url, this.music, this.volume, this.position, this.velocity);
			this.instance.play(time, loop);
			return true;
		}

		this.stop = function(time) {
            if(this.instance) { this.instance.stop(time); }
		}

		this.setVolume = function(value) {
			if(this.instance) {
				this.instance.setVolume(value);
			}
			this.volume = value;
			return this;
		}
		this.setPosition = function(value) {
			if(this.instance) { this.instance.setPosition(value); }
			this.position = value;
			return this;
		}
		this.setVelocity = function(value) {
			if(this.instance) { this.instance.setVelocity(value); }
			this.velocity = value;
			return this;
		}
		this.setMusic = function(value) {
			this.music = (value)? true : false;
			return this;
		}
	}

	function SoundInstance(bufferId, music, volume, position, velocity) {
		// TODO: Convert to use internal vars
		// Check new instance
		if(!(this instanceof SoundInstance)) {
			return new SoundInstance(bufferId, music, volume, position, velocity);
		}
		// Check Parameters
		this.is3D = (position || velocity);
		this.startTime = this.endTime = -1;

		// Create Source
		this.source = _audioContext.createBufferSource();
		this.source.buffer = _buffers[bufferId];
		this.source.gain.value = volume;

		// Create, Set and connect gain nodes
		this.masterGain = _audioContext.createGainNode();
		this.masterGain.gain.value = _masterGain;
		this.source.connect(this.masterGain);
		this.gainNode = _audioContext.createGainNode();
		this.gainNode.gain.value = (music) ? _musicGain : _fxGain;
		this.masterGain.connect(this.gainNode);

		if(this.is3D) {
			// Set up 3D Values
			this.panner = _audioContext.createPanner();
			this.panner.setPosition((position)
				? [_distanceFactor*position[0], _distanceFactor*position[1], _distanceFactor*position[2]]
				: [0,0,0]);
			this.panner.setVelocity((velocity)
				? [_distanceFactor*velocity[0], _distanceFactor*velocity[1],_distanceFactor*velocity[2]]
				: [0,0,0]);
			// Connect to destination
			this.gainNode.connect(this.panner);
			this.panner.connect(_audioContext.destination);
		} else {
			// Connect to destination
			this.gainNode.connect(_audioContext.destination);
		}

		// TODO: Move to prototype
		this.setPosition = function(s) {
			if(this.is3D) {
				this.panner.setPosition([_distanceFactor*s[0], _distanceFactor*s[1], _distanceFactor*s[2]]);
			}
			return this;
		}
		this.setVelocity = function(v) {
			if(this.is3D) {
				this.panner.setVelocity([_distanceFactor*v[0], _distanceFactor*v[1], _distanceFactor*v[2]]);
			}
			return this;
		}
		this.play = function(time, loop) {
			this.source.loop = loop || false;

			this.startTime = _audioContext.currentTime + (time || 0);
			this.endTime = this.startTime + this.source.duration;

			this.source.noteOn((time || 0));
		}
		this.stop = function(time) {
			this.source.noteOff((time || 0));
		}

		// TODO: Add loop function with cross-fade option
		// TODO: Add fadeIn and fadeOut options

		this.isPlaying = function() { return (_audioContext.currentTime > this.startTime && _audioContext.currentTime < this.endTime); }
		this.setVolume = function(value) { this.source.gain.value = value; }
	}

	function load(url, music) {
		var sound = new Sound(url);
		sound.setMusic(music);

		if(_buffers[url]) {
			return sound;
		}

		sound.isLoading = true;
		function callback(buffer) {
			_buffers[url] = buffer;
		}

		// TODO: Use Gremlin Assets Loading
		var request = new XMLHttpRequest();
		request.open('GET', url);
		request.responseType = 'arraybuffer';
		request.onreadystatechange = function () { if (request.readyState == 4) { sound.onLoad(request, callback); } }
		request.send();

		return sound;
	}

	return {
		init:       init,
		load:       load
	}
}();