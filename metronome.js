/* Web-based metronome.
 * Uses Javascript and CSS / HTML, not Flash, to create an adjustable metronome.
 *
 */
 
var Metronome = Metronome || {};

Metronome = function (element) {
	var self = this,
		buff = null,
		context;

	//Default config options go in here
	this.config = {
		tempo : 90,
		clickSound : 'beep.mp3'
	};
	
	this.bpmToMs = function (tempo) {
		var ms;
		if (parseInt(tempo, 10) >= 0) {
			ms = parseInt((60000 / tempo), 10);
		} else {
			ms = 90;
		}
		return ms;
	};
	
	this.msToBpm = function (ms) {
		var bpm;
		if (parseInt(bpm, 10) >= 0) {
			bpm = parseInt(ms * 6000, 10);
		}
	};
	
	this.init = function () {
		this.bar =  document.getElementById('swinger');
		this.tempo = this.config.tempo;
		this.tempoMS = this.bpmToMs(this.config.tempo);
		//Create the <audio> element to play the beep
		this.beeper = document.createElement('div');
		this.beeper.innerHTML = '<audio style="display: none;" controls preload="auto" ><source src="' + this.config.clickSound + '" /><source src="beep.wav"></source></audio>';
		
		
		//Create the 'flasher'
		this.flasher = document.createElement('div');
		this.flasher.id = 'flasher';

		//Create tempo text
		this.tempoText = this.createTempoText();

		
		document.body.appendChild(this.flasher);
		this.addControls();
		
		this.setupAudio();

	};
	
	this.setupAudio = function() {
		var request;

		try{
			context = new webkitAudioContext();
		} catch(e) {
			console.log("Web Audio API needs Webkit, possibly Chrome, to work");
			/* Fall back to an <audio element maybe????

			//Click sound - <audio> element - can we just dynamically change the src in the DOM?
			this.sound = this.config.clickSound;
			//Create the <audio> element to play the beep
			this.beeper = document.createElement('div');
			this.beeper.innerHTML = '<audio style="display: none;" controls preload="auto" ><source src="' + this.sound + '" /><source src="beep.wav"></source></audio>'
			this.beeper = this.beeper.getElementsByTagName('audio')[0];
			document.body.appendChild(this.beeper);
			*/
		}


		request = new XMLHttpRequest();
		request.open('GET', this.config.clickSound, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			context.decodeAudioData(request.response, function(buffer) {
				buff = buffer;
			});
		};
		request.send();

	};

	this.playSound = function(buffer) {
		var source = context.createBufferSource(); // creates a sound source
		source.buffer = buffer;                    // tell the source which sound to play
		source.connect(context.destination);       // connect the source to the context's destination (the speakers)
		source.noteOn(0);                          // play the source now
		//	this.beeper.play();
	};

	//Start 'ticking'
	this.start = function () {
		//this.soundTick();
		this.swingRight = true;
		this.ticking = window.setInterval(function () {
			self.soundTick();
		}, self.tempoMS);
	};
	
	//Stop 'ticking'
	this.stop = function (restart) {
		this.ticking = window.clearInterval(this.ticking);
		if(!restart) {
			this.bar.style.webkitTransform = 'rotate(0deg) translateY(20px)';
		}
		this.swingRight = true;
	};
	
	//'Play' the 'tick'
	this.soundTick = function () {
		this.moveBar();
		this.flash();
		this.playSound(buff);
	};
	
	//Flash the 'light'
	this.flash = function() {
		this.flasher.style.visibility = 'visible';
		setTimeout(function() {
			self.flasher.style.visibility = 'hidden';
			}, 100);
	};

	//Change the po
	this.setTempo = function (newTempo) {
		this.tempo = newTempo;
		this.tempoMS = this.bpmToMs(newTempo);
		console.info('Tempo set at ' + this.tempo + 'bpm' + ' (' + this.tempoMS + 'ms interval)');
		this.tempoText.innerHTML = this.tempo + 'bpm';
		//Set transition speed
		this.bar.style.webkitTransition = 'all '+ (this.tempoMS / 1000)  + 's ease-in-out';
		console.info(this.bar.style.webkitTransition);
		this.stop(true);
		this.start();
	};
	
	
	//Create / add controls to the page
	this.addControls = function () {
		var controls = document.createElement('div'),
			plus = document.createElement('div'),
			minus = document.createElement('div'),
			startStop = document.createElement('div');
	
		controls.setAttribute('id','controls');
		plus.setAttribute('id','plus');
		plus.innerHTML = '+';
		minus.setAttribute('id','minus');
		minus.innerHTML = '-';
		startStop.setAttribute('id','startStop');
		startStop.innerHTML = 'Start';
		
		plus.addEventListener('click', this.upTempo, false);
		minus.addEventListener('click', this.downTempo, false);
		startStop.addEventListener('click', this.toggleStart, false);
		controls.appendChild(plus);
		controls.appendChild(minus);
		controls.appendChild(startStop);
		document.body.appendChild(controls);
	};
	
	this.createTempoText = function() {
		var el = document.createElement('div'),
			text = document.createTextNode(self.tempo + 'bpm');

		el.appendChild(text);
		document.body.appendChild(el);

		return el;
	};

	this.upTempo = function (e) {
		self.setTempo(self.tempo + 10);
		e.preventDefault();
	};
	
	this.downTempo = function (e) {
		var newTempo = self.tempo - 10;
		if(newTempo <= 0) {
			newTempo = 1;
		}
		
		self.setTempo(newTempo);
		e.preventDefault();
	};
	
	
	this.toggleStart = function(e) {
		if (self.ticking) {
			self.stop();
		} else {
			self.bar.style.webkitTransform = 'rotate(-45deg) translateY(20px)';
			self.start();
		}
	};
	
	this.moveBar = function () {
		var tf = this.bar.style.webkitTransform,
			angle;
		console.log(tf);
		if (this.swingRight) {
			angle = '45';
		} else {
			angle = '-45';
		}
		this.bar.style.webkitTransform = 'rotate('+ angle + 'deg) translateY(20px)';
		this.swingRight = !this.swingRight;
	};

	this.init();

};
	/*
	Reqs
	
	Have start / stop button(s?)
	Adjustable tempo (+/- buttons as well as a free text input)
		Graphically slide the weight up and down
	- bpm to ms function
	OPTIONAL: Change the click sound
	
	
	
	*/
	
	
	
