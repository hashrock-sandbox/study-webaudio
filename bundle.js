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
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var pianoroll_1 = __webpack_require__(1);
	var el = document.querySelector(".canvas");
	var piano = new pianoroll_1.PianoRoll({
	    el: el,
	    notes: []
	});
	var playing = false;
	var playButton = document.querySelector("#play");
	function togglePlaying() {
	    if (playing) {
	        piano.stop();
	        playing = false;
	    }
	    else {
	        piano.play();
	        playing = true;
	    }
	}
	playButton.addEventListener("click", function () {
	    togglePlaying();
	});
	document.addEventListener("keypress", function (e) {
	    if (e.keyCode === 32) {
	        togglePlaying();
	    }
	});
	piano.draw();


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var canvas_1 = __webpack_require__(2);
	var audio = __webpack_require__(4);
	function playNote(e, length) {
	    audio.playNote(e.noteNumber, length);
	}
	var PianoRoll = (function () {
	    function PianoRoll(options) {
	        var _this = this;
	        this.el = options.el;
	        this.notes = options.notes ? options.notes : [];
	        this.drv = new canvas_1.DrawingDriver(this.el.getContext("2d"), this.el.offsetWidth, this.el.offsetHeight);
	        this.hoverNote = null;
	        this.clicked = false;
	        this.nowNote = -1;
	        this.playing = false;
	        this.playingPos = 0;
	        var bpm = 120;
	        var timebase = 60000 / bpm / 4;
	        setInterval(function () {
	            if (_this.playing) {
	                _this.playingPos++;
	                _this.drv.playPosition = _this.playingPos;
	                if (_this.playingPos > 32) {
	                    _this.playingPos = 0;
	                }
	                _this.notes.forEach(function (note) {
	                    if (note.start === _this.playingPos) {
	                        playNote({
	                            noteNumber: note.no + 48
	                        }, note.length * 60000 / bpm / 4);
	                    }
	                });
	                _this.draw();
	            }
	        }, timebase);
	        this.el.addEventListener("mousemove", function (e) {
	            var note = _this.drv.createNote(1, e.offsetX, e.offsetY, 1);
	            if (_this.clicked) {
	                note = _this.drv.createNoteWithLength(1, _this.startPos, e.offsetY, e.offsetX);
	                if (_this.nowNote !== note.no) {
	                    playNote({
	                        noteNumber: note.no + 48
	                    }, 100);
	                    _this.nowNote = note.no;
	                }
	            }
	            _this.hoverNote = note;
	            _this.draw();
	        });
	        this.el.addEventListener("mousedown", function (e) {
	            var note = _this.drv.createNote(1, e.offsetX, e.offsetY, 1);
	            _this.nowNote = note.no;
	            _this.startPos = note.start;
	            playNote({
	                noteNumber: note.no + 48
	            }, 100);
	            _this.draw();
	            _this.clicked = true;
	        });
	        this.el.addEventListener("mouseup", function (e) {
	            var note = _this.drv.createNoteWithLength(1, _this.startPos, e.offsetY, e.offsetX);
	            var matched = _this._hitTest(note);
	            if (matched >= 0) {
	                _this.notes.splice(matched, 1);
	            }
	            else {
	                _this.notes.push(note);
	            }
	            _this.draw();
	            _this.clicked = false;
	        });
	    }
	    PianoRoll.prototype._drawAllNotes = function () {
	        var _this = this;
	        this.notes.forEach(function (note) {
	            _this.drv.drawNote(note, "#FFF");
	        });
	    };
	    PianoRoll.prototype._drawHoverNote = function () {
	        this.drv.drawNote(this.hoverNote, "rgba(255,255,255,0.5)");
	    };
	    PianoRoll.prototype.draw = function () {
	        this.drv.clear();
	        this._drawAllNotes();
	        if (this.hoverNote) {
	            this._drawHoverNote();
	        }
	    };
	    PianoRoll.prototype._hitTest = function (note) {
	        var matched = -1;
	        for (var i = 0; i < this.notes.length; i++) {
	            var n = this.notes[i];
	            if (_isHit(n, note)) {
	                matched = i;
	            }
	        }
	        return matched;
	    };
	    PianoRoll.prototype.play = function () {
	        this.playing = true;
	    };
	    PianoRoll.prototype.stop = function () {
	        this.playing = false;
	    };
	    return PianoRoll;
	}());
	exports.PianoRoll = PianoRoll;
	function _isHit(n, note) {
	    return (n.no === note.no &&
	        n.start <= note.start &&
	        n.start + n.length - 1 >= note.start);
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var note_1 = __webpack_require__(3);
	var PATTERN_LENGTH = 32;
	var NOTE_RANGE = 48;
	function NoteScale(xScale, yScale) {
	    return function (x, y, w, h) {
	        return {
	            x: x * xScale,
	            y: y * yScale,
	            w: w * xScale,
	            h: yScale
	        };
	    };
	}
	var DrawingDriver = (function () {
	    function DrawingDriver(ctx, w, h) {
	        this.w = w;
	        this.h = h;
	        this.noteWidth = this.w / PATTERN_LENGTH;
	        this.noteHeight = this.h / NOTE_RANGE;
	        this.ctx = ctx;
	        this.scale = NoteScale(this.noteWidth, this.noteHeight);
	    }
	    DrawingDriver.prototype._drawRect = function (x, y, w, h, color) {
	        this.ctx.fillStyle = color;
	        this.ctx.fillRect(x, y, w, h);
	    };
	    DrawingDriver.prototype.drawNote = function (note, color) {
	        var t = this.scale(note.start, note.no, note.length, 1);
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
	        this.ctx.save();
	        this.ctx.lineWidth = 1;
	        this.ctx.strokeStyle = "#AAAAAA";
	        this.ctx.beginPath();
	        for (var i = 0; i < PATTERN_LENGTH; i++) {
	            this.ctx.moveTo(i * this.noteWidth, 0);
	            this.ctx.lineTo(i * this.noteWidth, this.h);
	        }
	        for (var i = 0; i < NOTE_RANGE; i++) {
	            this.ctx.moveTo(0, i * this.noteHeight);
	            this.ctx.lineTo(this.w, i * this.noteHeight);
	        }
	        this.ctx.stroke();
	        this.ctx.strokeStyle = "#AA6666";
	        this.ctx.beginPath();
	        this.ctx.moveTo(this.playPosition * this.noteWidth, 0);
	        this.ctx.lineTo(this.playPosition * this.noteWidth, this.h);
	        this.ctx.stroke();
	        this.ctx.restore();
	    };
	    DrawingDriver.prototype.createNoteWithLength = function (ch, x, y, x1) {
	        return new note_1.Note({
	            ch: ch,
	            start: x,
	            note: this.getY(y),
	            end: this.getX(x1) - x + 1
	        });
	    };
	    DrawingDriver.prototype.createNote = function (ch, x, y, len) {
	        return new note_1.Note({
	            ch: ch,
	            start: this.getX(x),
	            note: this.getY(y),
	            end: len
	        });
	    };
	    DrawingDriver.prototype.hitTest = function (note, x, y) {
	        return (note.start <= this.getX(x) &&
	            note.start + note.length >= this.getX(x) &&
	            this.getY(y) === note.no);
	    };
	    return DrawingDriver;
	}());
	exports.DrawingDriver = DrawingDriver;


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var Note = (function () {
	    function Note(options) {
	        this.ch = options.ch ? options.ch : 1;
	        this.no = options.note ? options.note : 0;
	        this.start = options.start ? options.start : 0;
	        this.length = options.end ? options.end : 1;
	    }
	    return Note;
	}());
	exports.Note = Note;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var audioContext = new AudioContext();
	var util = __webpack_require__(5);
	function playNote(noteNumber, length) {
	    var osc1 = audioContext.createOscillator();
	    var amp = audioContext.createGain();
	    osc1.frequency.value = util.mtof(noteNumber);
	    osc1.connect(amp);
	    amp.gain.value = 0.1;
	    osc1.start();
	    amp.connect(audioContext.destination);
	    setTimeout(function () {
	        osc1.disconnect();
	    }, length);
	}
	exports.playNote = playNote;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	function mtof(noteNumber) {
	    return 440 * Math.pow(2, (noteNumber - 69) / 12);
	}
	exports.mtof = mtof;


/***/ }
/******/ ]);