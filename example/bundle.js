/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	var Note = (function () {
	    function Note(options) {
	        this.ch = options.ch ? options.ch : 1;
	        this.note = options.note ? options.note : 0;
	        this.start = options.start ? options.start : 0;
	        this.end = options.end ? options.end : 1;
	    }
	    return Note;
	}());
	function NoteScale(xScale, yScale) {
	    return function (x, y, w, h) {
	        return {
	            x: x * xScale,
	            y: y * yScale,
	            w: xScale,
	            h: yScale
	        };
	    };
	}
	var audioContext = new AudioContext();
	function mtof(noteNumber) {
	    return 440 * Math.pow(2, (noteNumber - 69) / 12);
	}
	function playNote(e) {
	    var osc1 = audioContext.createOscillator();
	    var amp = audioContext.createGain();
	    osc1.frequency.value = mtof(e.noteNumber);
	    osc1.connect(amp);
	    amp.gain.value = 0.1;
	    osc1.start();
	    amp.connect(audioContext.destination);
	    setTimeout(function () {
	        osc1.disconnect();
	    }, 100);
	}
	var DrawingDriver = (function () {
	    function DrawingDriver(ctx, w, h) {
	        this.w = w;
	        this.h = h;
	        this.noteWidth = this.w / 32;
	        this.noteHeight = this.h / 48;
	        this.ctx = ctx;
	        this.scale = NoteScale(this.noteWidth, this.noteHeight);
	    }
	    DrawingDriver.prototype._drawRect = function (x, y, w, h, color) {
	        this.ctx.fillStyle = color;
	        this.ctx.fillRect(x, y, w, h);
	    };
	    DrawingDriver.prototype.drawNote = function (note, color) {
	        var t = this.scale(note.start, note.note, note.end, 1);
	        this._drawRect(t.x, this.h - t.y - t.h, t.w, t.h, color);
	    };
	    DrawingDriver.prototype.getY = function (y) {
	        return Math.floor((this.h - y) / this.noteHeight);
	    };
	    DrawingDriver.prototype.getX = function (x) {
	        return Math.floor(x / this.noteWidth);
	    };
	    DrawingDriver.prototype.clear = function () {
	        this.ctx.clearRect(0, 0, this.w, this.h);
	    };
	    DrawingDriver.prototype.createNote = function (ch, x, y, len) {
	        return new Note({
	            ch: ch,
	            start: this.getX(x),
	            note: this.getY(y),
	            end: len
	        });
	    };
	    DrawingDriver.prototype.hitTest = function (note, x, y) {
	        return (note.start <= this.getX(x) &&
	            note.start + note.end >= this.getX(x) &&
	            this.getY(y) === note.note);
	    };
	    return DrawingDriver;
	}());
	var PianoRoll = (function () {
	    function PianoRoll(options) {
	        var _this = this;
	        this.el = options.el;
	        this.notes = options.notes ? options.notes : [];
	        this.drv = new DrawingDriver(this.el.getContext("2d"), this.el.offsetWidth, this.el.offsetHeight);
	        this.hoverNote = null;
	        this.el.addEventListener("mousemove", function (e) {
	            _this.hoverNote = _this.drv.createNote(1, e.offsetX, e.offsetY, 1);
	            _this.draw();
	        });
	        this.el.addEventListener("mousedown", function (e) {
	            var note = _this.drv.createNote(1, e.offsetX, e.offsetY, 1);
	            playNote({
	                noteNumber: note.note + 48
	            });
	        });
	        this.el.addEventListener("click", function (e) {
	            var note = _this.drv.createNote(1, e.offsetX, e.offsetY, 1);
	            var matched = _this._hitTest(note);
	            if (matched >= 0) {
	                _this.notes.splice(matched, 1);
	            }
	            else {
	                _this.notes.push(note);
	            }
	        });
	    }
	    PianoRoll.prototype.draw = function () {
	        var _this = this;
	        this.drv.clear();
	        this.notes.forEach(function (note) {
	            _this.drv.drawNote(note, "#FFF");
	        });
	        if (this.hoverNote) {
	            this.drv.drawNote(this.hoverNote, "rgba(255,255,255,0.5)");
	        }
	    };
	    PianoRoll.prototype._hitTest = function (note) {
	        var matched = -1;
	        for (var i = 0; i < this.notes.length; i++) {
	            var n = this.notes[i];
	            if (n.note === note.note &&
	                n.start <= note.start &&
	                n.start + n.end - 1 >= note.start) {
	                matched = i;
	            }
	        }
	        return matched;
	    };
	    return PianoRoll;
	}());
	var el = document.querySelector(".canvas");
	var piano = new PianoRoll({
	    el: el,
	    notes: []
	});
	piano.draw();


/***/ }
/******/ ]);