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
	var mml = __webpack_require__(6);
	var download = __webpack_require__(11);
	var mml2smf = __webpack_require__(7);
	var piano;
	var playing = false;
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
	document.addEventListener("keypress", function (e) {
	    if (e.keyCode === 32) {
	        togglePlaying();
	    }
	});
	new Vue({
	    el: "#app",
	    data: {
	        source: "",
	        isMenuVisible: false,
	        isExportDialogVisible: false,
	        patternLength: "32"
	    },
	    mounted: function () {
	        var el = document.querySelector(".canvas");
	        piano = new pianoroll_1.PianoRoll({
	            el: el,
	            notes: [],
	            patternLength: 32
	        });
	        piano.draw();
	    },
	    watch: {
	        "patternLength": function (value) {
	            piano.patternLength = parseInt(value);
	        }
	    },
	    methods: {
	        exportJson: function (e) {
	            this.hideMenu();
	            this.isExportDialogVisible = true;
	            this.source = JSON.stringify(piano.notes, null, 2);
	        },
	        exportMml: function (e) {
	            this.hideMenu();
	            this.isExportDialogVisible = true;
	            this.source = mml.jsonToMML(piano.notes).join(";\n");
	        },
	        exportSmf: function () {
	            //現在、ch1のみ。ボリューム指定は0-15を0-127に変換する必要があるが、対数にすべきか不明なのでとりあえず固定値にした
	            var binary = mml2smf(mml.jsonToMML(piano.notes).map(function (line) { return "C1" + line; }).join(";\n").replace(/v10/g, "v80"));
	            download.downloadBlob(binary, 'minroll.mid', 'application/octet-stream');
	        },
	        play: function () {
	            togglePlaying();
	        },
	        hideMenu: function () {
	            this.isMenuVisible = false;
	            this.isExportDialogVisible = false;
	        },
	        showMenu: function () {
	            this.isMenuVisible = true;
	            this.isExportDialogVisible = false;
	        }
	    }
	});


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
	        this.patternLength = options.patternLength ? options.patternLength : 32;
	        this.drv = new canvas_1.DrawingDriver(this.el.getContext("2d"), this.el.offsetWidth, this.el.offsetHeight);
	        this.hoverNote = null;
	        this.clicked = false;
	        this.nowNote = -1;
	        this.playing = false;
	        this.playingPos = -1;
	        this.drv.patternLength = options.patternLength;
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
	            _this.onMouseMove(e.offsetX, e.offsetY);
	        });
	        this.el.addEventListener("mousedown", function (e) {
	            e.preventDefault();
	            _this.onMouseDown(e.offsetX, e.offsetY);
	        });
	        this.el.addEventListener("mouseup", function (e) {
	            e.preventDefault();
	            _this.onMouseUp(e.offsetX, e.offsetY);
	        });
	        this.el.addEventListener("touchmove", function (e) {
	            var pos = convertTouchEvent(e);
	            _this.onMouseMove(pos.x, pos.y);
	        });
	        this.el.addEventListener("touchstart", function (e) {
	            e.preventDefault();
	            var pos = convertTouchEvent(e);
	            _this.onMouseDown(pos.x, pos.y);
	        });
	        this.el.addEventListener("touchend", function (e) {
	            e.preventDefault();
	            var pos = convertTouchEvent(e);
	            _this.onMouseUp(pos.x, pos.y);
	        });
	    }
	    Object.defineProperty(PianoRoll.prototype, "patternLength", {
	        set: function (value) {
	            if (this.drv) {
	                this.drv.patternLength = value;
	                this.el.width = value * 32;
	            }
	        },
	        enumerable: true,
	        configurable: true
	    });
	    PianoRoll.prototype.onMouseDown = function (x, y) {
	        var note = this.drv.createNote(1, x, y, 1);
	        this.nowNote = note.no;
	        this.startPos = note.start;
	        // 0 = C3
	        playNote({
	            noteNumber: note.no + 48
	        }, 100);
	        this.draw();
	        this.clicked = true;
	    };
	    PianoRoll.prototype.onMouseMove = function (x, y) {
	        var note = this.drv.createNote(1, x, y, 1);
	        if (this.clicked) {
	            note = this.drv.createNoteWithLength(1, this.startPos, y, x);
	            if (this.nowNote !== note.no) {
	                playNote({
	                    noteNumber: note.no + 48
	                }, 100);
	                this.nowNote = note.no;
	            }
	        }
	        /*
	        let ret = this.drv.toScreen(note)
	        console.log(ret)
	        */
	        this.hoverNote = note;
	        this.draw();
	    };
	    PianoRoll.prototype.onMouseUp = function (x, y) {
	        var note = this.drv.createNoteWithLength(1, this.startPos, y, x);
	        var matched = this._hitTest(note);
	        if (matched >= 0) {
	            this.notes.splice(matched, 1);
	        }
	        else {
	            this.notes.push(note);
	        }
	        this.draw();
	        this.clicked = false;
	    };
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
	function convertTouchEvent(e) {
	    var dom = e.target;
	    var rect = dom.getBoundingClientRect();
	    var x = e.targetTouches[0].pageX - rect.left;
	    var y = e.targetTouches[0].pageY - rect.top;
	    return {
	        x: x,
	        y: y
	    };
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
	        //    this.noteWidth = this.w / PATTERN_LENGTH;
	        this.noteWidth = 32;
	        this.noteHeight = this.h / NOTE_RANGE;
	        this.ctx = ctx;
	        this.scale = NoteScale(this.noteWidth, this.noteHeight);
	    }
	    DrawingDriver.prototype._drawRect = function (x, y, w, h, color) {
	        this.ctx.fillStyle = color;
	        this.ctx.fillRect(x, y, w, h);
	    };
	    Object.defineProperty(DrawingDriver.prototype, "patternLength", {
	        set: function (value) {
	            this._patternLength = value;
	            this.w = value * 32;
	            this.clear();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    DrawingDriver.prototype.drawNote = function (note, color) {
	        var t = this.scale(note.start, note.no, note.length, 1);
	        this._drawRect(t.x, this.h - t.y - t.h, t.w, t.h, color);
	    };
	    DrawingDriver.prototype.getNoteY = function (y) {
	        return Math.floor((this.h - y) / this.noteHeight);
	    };
	    DrawingDriver.prototype.getNoteX = function (x) {
	        return Math.floor(x / this.noteWidth);
	    };
	    DrawingDriver.prototype.toScreen = function (n) {
	        return {
	            x: n.start * this.noteWidth,
	            y: this.h - (n.no + 1) * this.noteHeight,
	            h: this.noteHeight,
	            w: this.noteWidth
	        };
	    };
	    DrawingDriver.prototype.drawKeyboard = function () {
	        this.ctx.fillStyle = "#BBBBBB";
	        for (var i = 0; i < NOTE_RANGE; i++) {
	            if (i % 12 === 1 ||
	                i % 12 === 3 ||
	                i % 12 === 6 ||
	                i % 12 === 8 ||
	                i % 12 === 10) {
	                this.ctx.fillRect(0, this.h - i * this.noteHeight, this.w, -this.noteHeight);
	            }
	        }
	    };
	    DrawingDriver.prototype.drawGridLines = function () {
	        this.ctx.save();
	        this.ctx.lineWidth = 1;
	        this.ctx.strokeStyle = "#AAAAAA";
	        for (var i = 0; i < this._patternLength; i++) {
	            this.ctx.beginPath();
	            if (i % 4 === 0) {
	                this.ctx.strokeStyle = "#777777";
	            }
	            else {
	                this.ctx.strokeStyle = "#AAAAAA";
	            }
	            this.ctx.moveTo(i * this.noteWidth, 0);
	            this.ctx.lineTo(i * this.noteWidth, this.h);
	            this.ctx.stroke();
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
	    DrawingDriver.prototype.clear = function () {
	        this.ctx.clearRect(0, 0, this.w, this.h);
	        this.drawKeyboard();
	        this.drawGridLines();
	    };
	    DrawingDriver.prototype.createNoteWithLength = function (ch, x, y, x1) {
	        return new note_1.Note({
	            ch: ch,
	            start: x,
	            note: this.getNoteY(y),
	            end: this.getNoteX(x1) - x + 1
	        });
	    };
	    DrawingDriver.prototype.createNote = function (ch, x, y, len) {
	        return new note_1.Note({
	            ch: ch,
	            start: this.getNoteX(x),
	            note: this.getNoteY(y),
	            end: len
	        });
	    };
	    DrawingDriver.prototype.hitTest = function (note, x, y) {
	        return (note.start <= this.getNoteX(x) &&
	            note.start + note.length >= this.getNoteX(x) &&
	            this.getNoteY(y) === note.no);
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
	    var release = 0.05;
	    osc1.frequency.value = util.mtof(noteNumber);
	    osc1.connect(amp);
	    amp.gain.value = 0.1;
	    osc1.start();
	    amp.connect(audioContext.destination);
	    setTimeout(function () {
	        var now = audioContext.currentTime;
	        amp.gain.setValueAtTime(amp.gain.value, now);
	        amp.gain.linearRampToValueAtTime(0, now + release);
	        //osc1.disconnect();
	        osc1.stop(now + release);
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


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	function toNoteName(index) {
	    if (index < 0 || index > 11) {
	        console.error("invalid note index");
	        return null;
	    }
	    return [
	        "c", "d-", "d", "e-", "e", "f", "g-", "g", "a-", "a", "b-", "b"
	    ][index];
	}
	exports.toNoteName = toNoteName;
	function noteToNote(note) {
	    var oct = Math.floor(note.no / 12) + 3;
	    var cde = toNoteName(note.no % 12);
	    var lengthRemain = note.length;
	    var lengthArray = [];
	    while (lengthRemain > 0) {
	        if (lengthRemain >= 16) {
	            lengthRemain -= 16;
	            lengthArray.push("1");
	            continue;
	        }
	        if (lengthRemain >= 8) {
	            lengthRemain -= 8;
	            lengthArray.push("2");
	            continue;
	        }
	        if (lengthRemain >= 4) {
	            lengthRemain -= 4;
	            lengthArray.push("4");
	            continue;
	        }
	        if (lengthRemain >= 2) {
	            lengthRemain -= 2;
	            lengthArray.push("8");
	            continue;
	        }
	        if (lengthRemain >= 1) {
	            lengthRemain -= 1;
	            lengthArray.push("16");
	            continue;
	        }
	    }
	    return "o" + oct + cde + lengthArray.join("^");
	}
	exports.noteToNote = noteToNote;
	var mmlTemplate = "l16v10";
	function jsonToMML(notes) {
	    var remainNotes = notes.slice();
	    var mmls = [];
	    var mml = mmlTemplate;
	    //変換戦略：
	    //1ステップずつノートがあるか見ていき、マッチしたノートをMMLに詰めて配列から削除し、発音長だけ飛ばす。
	    //48ステップの走査終了後、まだノートが残っているようならもう一度走査。
	    //最終的に同時発音数分のトラックが生成される。
	    while (remainNotes.length > 0) {
	        var i = 0;
	        while (i < 48) {
	            // 頭から走査する
	            // find使いたい…
	            var matchedIndex = -1;
	            for (var j = 0; j < remainNotes.length; j++) {
	                if (remainNotes[j].start === i) {
	                    matchedIndex = j;
	                    break;
	                }
	            }
	            if (matchedIndex !== -1) {
	                console.log(matchedIndex + " found");
	                //マッチした要素を削除
	                mml += noteToNote(remainNotes[matchedIndex]);
	                i += remainNotes[matchedIndex].length;
	                remainNotes.splice(matchedIndex, 1);
	            }
	            else {
	                //なにもマッチしなかったので休符
	                mml += "r";
	                i += 1;
	            }
	        }
	        //まだNoteが残っているようなら、また最初から
	        i = 0;
	        mmls.push(mml);
	        mml = mmlTemplate;
	    }
	    return mmls;
	}
	exports.jsonToMML = jsonToMML;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports["default"] = mml2smf;

	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

	var _parserParser = __webpack_require__(8);

	var parser = _interopRequireWildcard(_parserParser);

	function mml2smf(mml, opts) {
	    var startTick = 0;
	    var timebase = 480;

	    if (opts && opts.timebase) {
	        timebase = opts.timebase;
	    }

	    var trackDataArray = [];

	    var tracks = parser.parse(mml + ";");
	    // console.dir(tracks);

	    var channel = 0;
	    for (var i = 0; i < tracks.length; i++) {
	        trackDataArray.push(createTrackData(tracks[i]));
	        channel++;

	        if (channel > 15) {
	            throw new Error("Exceeded maximum MIDI channel (16)");
	        }
	    }

	    var format = tracks.length > 1 ? 1 : 0;

	    var smf = [0x4d, 0x54, 0x68, 0x64];

	    function write2bytes(value) {
	        smf.push(value >> 8 & 0xff, value & 0xff);
	    }

	    function write4bytes(value) {
	        smf.push(value >> 24 & 0xff, value >> 16 & 0xff, value >> 8 & 0xff, value & 0xff);
	    }

	    write4bytes(6);
	    write2bytes(format);
	    write2bytes(tracks.length);
	    write2bytes(timebase);

	    for (var i = 0; i < tracks.length; i++) {
	        smf.push(0x4d, 0x54, 0x72, 0x6b);
	        write4bytes(trackDataArray[i].length);
	        smf = smf.concat(trackDataArray[i]);
	    }

	    if (opts) {
	        opts.startTick = startTick;
	    }

	    return new Uint8Array(smf);

	    function createTrackData(tokens) {
	        var trackData = [];
	        var baseLength = timebase;

	        var currentTick = 0;

	        var restTick = 0;

	        var OCTAVE_MIN = -1;
	        var OCTAVE_MAX = 10;
	        var octave = 4;

	        var velocity = 100;

	        var q = 6;
	        var keyShift = 0;

	        var p = 0;

	        function write() {
	            for (var _len = arguments.length, data = Array(_len), _key = 0; _key < _len; _key++) {
	                data[_key] = arguments[_key];
	            }

	            trackData = trackData.concat(data);
	        }

	        function error(message) {
	            throw new Error("" + message);
	        }

	        function calcNoteLength(length, numDots) {
	            var noteLength = baseLength;
	            if (length) {
	                noteLength = timebase * 4 / length;
	            }

	            var dottedTime = noteLength;
	            for (var i = 0; i < numDots; i++) {
	                dottedTime /= 2;
	                noteLength += dottedTime;
	            }
	            return noteLength;
	        }

	        function writeDeltaTick(tick) {
	            if (tick < 0 || tick > 0xfffffff) {
	                error("illegal length");
	            }

	            var stack = [];

	            do {
	                stack.push(tick & 0x7f);
	                tick >>>= 7;
	            } while (tick > 0);

	            while (stack.length > 0) {
	                var b = stack.pop();

	                if (stack.length > 0) {
	                    b |= 0x80;
	                }
	                write(b);
	            }
	        }

	        while (p < tokens.length) {
	            var token = tokens[p];
	            // console.dir(token);

	            switch (token.command) {
	                case "note":
	                    {
	                        var abcdefg = [9, 11, 0, 2, 4, 5, 7];
	                        var n = "abcdefg".indexOf(token.tone);

	                        var note = (octave + 1) * 12 + abcdefg[n] + keyShift;

	                        for (var i = 0; i < token.accidentals.length; i++) {
	                            if (token.accidentals[i] === "+") {
	                                note++;
	                            }
	                            if (token.accidentals[i] === "-") {
	                                note--;
	                            }
	                        }

	                        if (note < 0 || note > 127) {
	                            error("illegal note number (0-127)");
	                        }

	                        var _stepTime = calcNoteLength(token.length, token.dots.length);
	                        while (tokens[p + 1] && tokens[p + 1].command === "tie") {
	                            p++;
	                            _stepTime += calcNoteLength(tokens[p].length, tokens[p].dots.length);
	                        }

	                        var gateTime = Math.round(_stepTime * q / 8);

	                        writeDeltaTick(restTick);
	                        write(0x90 | channel, note, velocity);
	                        writeDeltaTick(gateTime);
	                        write(0x80 | channel, note, 0);
	                        restTick = _stepTime - gateTime;

	                        currentTick += _stepTime;
	                        break;
	                    }
	                case "rest":
	                    var stepTime = calcNoteLength(token.length, token.dots.length);

	                    restTick += stepTime;
	                    currentTick += stepTime;
	                    break;

	                case "octave":
	                    octave = token.number;
	                    break;

	                case "octave_up":
	                    octave++;
	                    break;

	                case "octave_down":
	                    octave--;
	                    break;

	                case "note_length":
	                    baseLength = calcNoteLength(token.length, token.dots.length);
	                    break;

	                case "gate_time":
	                    q = token.quantity;
	                    break;

	                case "velocity":
	                    velocity = token.value;
	                    break;

	                case "volume":
	                    writeDeltaTick(restTick);
	                    write(0xb0 | channel, 7, token.value);
	                    break;

	                case "pan":
	                    writeDeltaTick(restTick);
	                    write(0xb0 | channel, 10, token.value + 64);
	                    break;

	                case "expression":
	                    writeDeltaTick(restTick);
	                    write(0xb0 | channel, 11, token.value);
	                    break;

	                case "control_change":
	                    writeDeltaTick(restTick);
	                    write(0xb0 | channel, token.number, token.value);
	                    break;

	                case "program_change":
	                    writeDeltaTick(restTick);
	                    write(0xc0 | channel, token.number);
	                    break;

	                case "channel_aftertouch":
	                    writeDeltaTick(restTick);
	                    write(0xd0 | channel, token.value);
	                    break;

	                case "tempo":
	                    {
	                        var quarterMicroseconds = 60 * 1000 * 1000 / token.value;
	                        if (quarterMicroseconds < 1 || quarterMicroseconds > 0xffffff) {
	                            error("illegal tempo");
	                        }

	                        writeDeltaTick(restTick);
	                        write(0xff, 0x51, 0x03, quarterMicroseconds >> 16 & 0xff, quarterMicroseconds >> 8 & 0xff, quarterMicroseconds & 0xff);
	                        break;
	                    }

	                case "start_point":
	                    {
	                        startTick = currentTick;
	                        break;
	                    }

	                case "key_shift":
	                    {
	                        keyShift = token.value;
	                        break;
	                    }

	                case "set_midi_channel":
	                    {
	                        channel = token.channel - 1;
	                        break;
	                    }
	            }

	            if (octave < OCTAVE_MIN || octave > OCTAVE_MAX) {
	                error("octave is out of range");
	            }

	            p++;
	        }

	        return trackData;
	    }
	}

	module.exports = exports["default"];

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = (function() {
	  /*
	   * Generated by PEG.js 0.8.0.
	   *
	   * http://pegjs.majda.cz/
	   */

	  function peg$subclass(child, parent) {
	    function ctor() { this.constructor = child; }
	    ctor.prototype = parent.prototype;
	    child.prototype = new ctor();
	  }

	  function SyntaxError(message, expected, found, offset, line, column) {
	    this.message  = message;
	    this.expected = expected;
	    this.found    = found;
	    this.offset   = offset;
	    this.line     = line;
	    this.column   = column;

	    this.name     = "SyntaxError";
	  }

	  peg$subclass(SyntaxError, Error);

	  function parse(input) {
	    var options = arguments.length > 1 ? arguments[1] : {},

	        peg$FAILED = {},

	        peg$startRuleFunctions = { start: peg$parsestart },
	        peg$startRuleFunction  = peg$parsestart,

	        peg$c0 = [],
	        peg$c1 = peg$FAILED,
	        peg$c2 = function(commands) { return commands; },
	        peg$c3 = ";",
	        peg$c4 = { type: "literal", value: ";", description: "\";\"" },
	        peg$c5 = function() { return null; },
	        peg$c6 = /^[ \t\r\n]/,
	        peg$c7 = { type: "class", value: "[ \\t\\r\\n]", description: "[ \\t\\r\\n]" },
	        peg$c8 = "/*",
	        peg$c9 = { type: "literal", value: "/*", description: "\"/*\"" },
	        peg$c10 = void 0,
	        peg$c11 = "*/",
	        peg$c12 = { type: "literal", value: "*/", description: "\"*/\"" },
	        peg$c13 = { type: "any", description: "any character" },
	        peg$c14 = function() { return { command: "comment" }; },
	        peg$c15 = "//",
	        peg$c16 = { type: "literal", value: "//", description: "\"//\"" },
	        peg$c17 = /^[^\n]/,
	        peg$c18 = { type: "class", value: "[^\\n]", description: "[^\\n]" },
	        peg$c19 = /^[cdefgab]/,
	        peg$c20 = { type: "class", value: "[cdefgab]", description: "[cdefgab]" },
	        peg$c21 = /^[\-+]/,
	        peg$c22 = { type: "class", value: "[\\-+]", description: "[\\-+]" },
	        peg$c23 = /^[0-9]/,
	        peg$c24 = { type: "class", value: "[0-9]", description: "[0-9]" },
	        peg$c25 = ".",
	        peg$c26 = { type: "literal", value: ".", description: "\".\"" },
	        peg$c27 = function(tone, accidentals, length, dots) { return { command: "note", tone: tone, accidentals: accidentals, length: +length, dots: dots }; },
	        peg$c28 = "^",
	        peg$c29 = { type: "literal", value: "^", description: "\"^\"" },
	        peg$c30 = function(length, dots) { return { command: "tie", length: +length, dots: dots }; },
	        peg$c31 = "r",
	        peg$c32 = { type: "literal", value: "r", description: "\"r\"" },
	        peg$c33 = function(length, dots) { return { command: "rest", length: +length, dots: dots }; },
	        peg$c34 = "o",
	        peg$c35 = { type: "literal", value: "o", description: "\"o\"" },
	        peg$c36 = null,
	        peg$c37 = "-",
	        peg$c38 = { type: "literal", value: "-", description: "\"-\"" },
	        peg$c39 = function(number) {
	                if (number < -1 || number > 10) {
	                    error("octave number is out of range");
	                }
	                return {
	                    command: "octave",
	                    number: +number,
	                    line: line(),
	                    column: column()
	                };
	            },
	        peg$c40 = "<",
	        peg$c41 = { type: "literal", value: "<", description: "\"<\"" },
	        peg$c42 = function() { return { command: "octave_up" }; },
	        peg$c43 = ">",
	        peg$c44 = { type: "literal", value: ">", description: "\">\"" },
	        peg$c45 = function() { return { command: "octave_down" }; },
	        peg$c46 = "l",
	        peg$c47 = { type: "literal", value: "l", description: "\"l\"" },
	        peg$c48 = function(length, dots) { return { command: "note_length", length: +length, dots: dots }; },
	        peg$c49 = "q",
	        peg$c50 = { type: "literal", value: "q", description: "\"q\"" },
	        peg$c51 = /^[1-8]/,
	        peg$c52 = { type: "class", value: "[1-8]", description: "[1-8]" },
	        peg$c53 = function(quantity) { return { command: "gate_time", quantity: +quantity }; },
	        peg$c54 = "u",
	        peg$c55 = { type: "literal", value: "u", description: "\"u\"" },
	        peg$c56 = function(value) {
	                value = +value;
	                if (value < 0 || value > 127) {
	                    error("velocity is out of range (0-127)");
	                }
	                return { command: "velocity", value: value };
	            },
	        peg$c57 = "v",
	        peg$c58 = { type: "literal", value: "v", description: "\"v\"" },
	        peg$c59 = function(value) {
	                value = +value;
	                if (value < 0 || value > 127) {
	                    error("volume is out of range (0-127)");
	                }
	                return { command: "volume", value: value };
	            },
	        peg$c60 = "p",
	        peg$c61 = { type: "literal", value: "p", description: "\"p\"" },
	        peg$c62 = function(value) {
	                value = +value;
	                if (value < -64 || value > 63) {
	                    error("pan is out of range (-64-63)");
	                }
	                return { command: "pan", value: value };
	            },
	        peg$c63 = "E",
	        peg$c64 = { type: "literal", value: "E", description: "\"E\"" },
	        peg$c65 = function(value) {
	                value = +value;
	                if (value < 0 || value > 127) {
	                    error("expression is out of range (0-127)");
	                }
	                return { command: "expression", value: value };
	            },
	        peg$c66 = "B",
	        peg$c67 = { type: "literal", value: "B", description: "\"B\"" },
	        peg$c68 = ",",
	        peg$c69 = { type: "literal", value: ",", description: "\",\"" },
	        peg$c70 = function(number, value) {
	                if (number < 0 || number > 119) {
	                    error("control number is out of range (0-127)");
	                }
	                if (value < 0 || value > 127) {
	                    error("control value is out of range (0-127)");
	                }
	                return { command: "control_change", number: number, value: value };
	            },
	        peg$c71 = "@",
	        peg$c72 = { type: "literal", value: "@", description: "\"@\"" },
	        peg$c73 = function(number) {
	                number = +number;
	                if (number < 0 || number > 127) {
	                    error("program number is out of range (0-127)");
	                }
	                return { command: "program_change", number: number };
	            },
	        peg$c74 = "D",
	        peg$c75 = { type: "literal", value: "D", description: "\"D\"" },
	        peg$c76 = function(value) {
	                value = +value;
	                if (value < 0 || value > 127) {
	                    error("channel aftertouch is out of range (0-127)");
	                }
	                return { command: "channel_aftertouch", value: value };
	            },
	        peg$c77 = "t",
	        peg$c78 = { type: "literal", value: "t", description: "\"t\"" },
	        peg$c79 = function(value) { return { command: "tempo", value: +value }; },
	        peg$c80 = "?",
	        peg$c81 = { type: "literal", value: "?", description: "\"?\"" },
	        peg$c82 = function() { return { command: "start_point" }; },
	        peg$c83 = "k",
	        peg$c84 = { type: "literal", value: "k", description: "\"k\"" },
	        peg$c85 = function(value) {
	                value = +value;
	                if (value < -127 || value > 127) {
	                    error("key shift is out of range (-127-127)");
	                } 
	                return { command: "key_shift", value: value };
	            },
	        peg$c86 = "C",
	        peg$c87 = { type: "literal", value: "C", description: "\"C\"" },
	        peg$c88 = function(channel) {
	                channel = +channel;
	                if (channel < 1 || channel > 16) {
	                    error("MIDI channel is out of range (1-16)");
	                }
	                return { command: "set_midi_channel", channel: channel };
	            },

	        peg$currPos          = 0,
	        peg$reportedPos      = 0,
	        peg$cachedPos        = 0,
	        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
	        peg$maxFailPos       = 0,
	        peg$maxFailExpected  = [],
	        peg$silentFails      = 0,

	        peg$result;

	    if ("startRule" in options) {
	      if (!(options.startRule in peg$startRuleFunctions)) {
	        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
	      }

	      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
	    }

	    function text() {
	      return input.substring(peg$reportedPos, peg$currPos);
	    }

	    function offset() {
	      return peg$reportedPos;
	    }

	    function line() {
	      return peg$computePosDetails(peg$reportedPos).line;
	    }

	    function column() {
	      return peg$computePosDetails(peg$reportedPos).column;
	    }

	    function expected(description) {
	      throw peg$buildException(
	        null,
	        [{ type: "other", description: description }],
	        peg$reportedPos
	      );
	    }

	    function error(message) {
	      throw peg$buildException(message, null, peg$reportedPos);
	    }

	    function peg$computePosDetails(pos) {
	      function advance(details, startPos, endPos) {
	        var p, ch;

	        for (p = startPos; p < endPos; p++) {
	          ch = input.charAt(p);
	          if (ch === "\n") {
	            if (!details.seenCR) { details.line++; }
	            details.column = 1;
	            details.seenCR = false;
	          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
	            details.line++;
	            details.column = 1;
	            details.seenCR = true;
	          } else {
	            details.column++;
	            details.seenCR = false;
	          }
	        }
	      }

	      if (peg$cachedPos !== pos) {
	        if (peg$cachedPos > pos) {
	          peg$cachedPos = 0;
	          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
	        }
	        advance(peg$cachedPosDetails, peg$cachedPos, pos);
	        peg$cachedPos = pos;
	      }

	      return peg$cachedPosDetails;
	    }

	    function peg$fail(expected) {
	      if (peg$currPos < peg$maxFailPos) { return; }

	      if (peg$currPos > peg$maxFailPos) {
	        peg$maxFailPos = peg$currPos;
	        peg$maxFailExpected = [];
	      }

	      peg$maxFailExpected.push(expected);
	    }

	    function peg$buildException(message, expected, pos) {
	      function cleanupExpected(expected) {
	        var i = 1;

	        expected.sort(function(a, b) {
	          if (a.description < b.description) {
	            return -1;
	          } else if (a.description > b.description) {
	            return 1;
	          } else {
	            return 0;
	          }
	        });

	        while (i < expected.length) {
	          if (expected[i - 1] === expected[i]) {
	            expected.splice(i, 1);
	          } else {
	            i++;
	          }
	        }
	      }

	      function buildMessage(expected, found) {
	        function stringEscape(s) {
	          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

	          return s
	            .replace(/\\/g,   '\\\\')
	            .replace(/"/g,    '\\"')
	            .replace(/\x08/g, '\\b')
	            .replace(/\t/g,   '\\t')
	            .replace(/\n/g,   '\\n')
	            .replace(/\f/g,   '\\f')
	            .replace(/\r/g,   '\\r')
	            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
	            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
	            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
	            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
	        }

	        var expectedDescs = new Array(expected.length),
	            expectedDesc, foundDesc, i;

	        for (i = 0; i < expected.length; i++) {
	          expectedDescs[i] = expected[i].description;
	        }

	        expectedDesc = expected.length > 1
	          ? expectedDescs.slice(0, -1).join(", ")
	              + " or "
	              + expectedDescs[expected.length - 1]
	          : expectedDescs[0];

	        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

	        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
	      }

	      var posDetails = peg$computePosDetails(pos),
	          found      = pos < input.length ? input.charAt(pos) : null;

	      if (expected !== null) {
	        cleanupExpected(expected);
	      }

	      return new SyntaxError(
	        message !== null ? message : buildMessage(expected, found),
	        expected,
	        found,
	        pos,
	        posDetails.line,
	        posDetails.column
	      );
	    }

	    function peg$parsestart() {
	      var s0, s1;

	      s0 = [];
	      s1 = peg$parsetrack();
	      if (s1 !== peg$FAILED) {
	        while (s1 !== peg$FAILED) {
	          s0.push(s1);
	          s1 = peg$parsetrack();
	        }
	      } else {
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsetrack() {
	      var s0, s1, s2;

	      s0 = peg$currPos;
	      s1 = [];
	      s2 = peg$parsecommand();
	      while (s2 !== peg$FAILED) {
	        s1.push(s2);
	        s2 = peg$parsecommand();
	      }
	      if (s1 !== peg$FAILED) {
	        s2 = peg$parsenext_track();
	        if (s2 !== peg$FAILED) {
	          peg$reportedPos = s0;
	          s1 = peg$c2(s1);
	          s0 = s1;
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsenext_track() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 59) {
	          s2 = peg$c3;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c4); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            peg$reportedPos = s0;
	            s1 = peg$c5();
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parse_() {
	      var s0, s1;

	      s0 = [];
	      if (peg$c6.test(input.charAt(peg$currPos))) {
	        s1 = input.charAt(peg$currPos);
	        peg$currPos++;
	      } else {
	        s1 = peg$FAILED;
	        if (peg$silentFails === 0) { peg$fail(peg$c7); }
	      }
	      while (s1 !== peg$FAILED) {
	        s0.push(s1);
	        if (peg$c6.test(input.charAt(peg$currPos))) {
	          s1 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s1 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c7); }
	        }
	      }

	      return s0;
	    }

	    function peg$parsecommand() {
	      var s0;

	      s0 = peg$parsecomment();
	      if (s0 === peg$FAILED) {
	        s0 = peg$parsenote();
	        if (s0 === peg$FAILED) {
	          s0 = peg$parsetie();
	          if (s0 === peg$FAILED) {
	            s0 = peg$parserest();
	            if (s0 === peg$FAILED) {
	              s0 = peg$parseoctave();
	              if (s0 === peg$FAILED) {
	                s0 = peg$parseoctave_up();
	                if (s0 === peg$FAILED) {
	                  s0 = peg$parseoctave_down();
	                  if (s0 === peg$FAILED) {
	                    s0 = peg$parsenote_length();
	                    if (s0 === peg$FAILED) {
	                      s0 = peg$parsegate_time();
	                      if (s0 === peg$FAILED) {
	                        s0 = peg$parsevelocity();
	                        if (s0 === peg$FAILED) {
	                          s0 = peg$parsevolume();
	                          if (s0 === peg$FAILED) {
	                            s0 = peg$parsepan();
	                            if (s0 === peg$FAILED) {
	                              s0 = peg$parseexpression();
	                              if (s0 === peg$FAILED) {
	                                s0 = peg$parsecontrol_change();
	                                if (s0 === peg$FAILED) {
	                                  s0 = peg$parseprogram_change();
	                                  if (s0 === peg$FAILED) {
	                                    s0 = peg$parsechannel_aftertouch();
	                                    if (s0 === peg$FAILED) {
	                                      s0 = peg$parsetempo();
	                                      if (s0 === peg$FAILED) {
	                                        s0 = peg$parsestart_point();
	                                        if (s0 === peg$FAILED) {
	                                          s0 = peg$parsekey_shift();
	                                          if (s0 === peg$FAILED) {
	                                            s0 = peg$parseset_midi_channel();
	                                          }
	                                        }
	                                      }
	                                    }
	                                  }
	                                }
	                              }
	                            }
	                          }
	                        }
	                      }
	                    }
	                  }
	                }
	              }
	            }
	          }
	        }
	      }

	      return s0;
	    }

	    function peg$parsecomment() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.substr(peg$currPos, 2) === peg$c8) {
	          s2 = peg$c8;
	          peg$currPos += 2;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c9); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$currPos;
	          s4 = [];
	          s5 = peg$currPos;
	          s6 = peg$currPos;
	          peg$silentFails++;
	          if (input.substr(peg$currPos, 2) === peg$c11) {
	            s7 = peg$c11;
	            peg$currPos += 2;
	          } else {
	            s7 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c12); }
	          }
	          peg$silentFails--;
	          if (s7 === peg$FAILED) {
	            s6 = peg$c10;
	          } else {
	            peg$currPos = s6;
	            s6 = peg$c1;
	          }
	          if (s6 !== peg$FAILED) {
	            if (input.length > peg$currPos) {
	              s7 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s7 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c13); }
	            }
	            if (s7 !== peg$FAILED) {
	              s6 = [s6, s7];
	              s5 = s6;
	            } else {
	              peg$currPos = s5;
	              s5 = peg$c1;
	            }
	          } else {
	            peg$currPos = s5;
	            s5 = peg$c1;
	          }
	          while (s5 !== peg$FAILED) {
	            s4.push(s5);
	            s5 = peg$currPos;
	            s6 = peg$currPos;
	            peg$silentFails++;
	            if (input.substr(peg$currPos, 2) === peg$c11) {
	              s7 = peg$c11;
	              peg$currPos += 2;
	            } else {
	              s7 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c12); }
	            }
	            peg$silentFails--;
	            if (s7 === peg$FAILED) {
	              s6 = peg$c10;
	            } else {
	              peg$currPos = s6;
	              s6 = peg$c1;
	            }
	            if (s6 !== peg$FAILED) {
	              if (input.length > peg$currPos) {
	                s7 = input.charAt(peg$currPos);
	                peg$currPos++;
	              } else {
	                s7 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c13); }
	              }
	              if (s7 !== peg$FAILED) {
	                s6 = [s6, s7];
	                s5 = s6;
	              } else {
	                peg$currPos = s5;
	                s5 = peg$c1;
	              }
	            } else {
	              peg$currPos = s5;
	              s5 = peg$c1;
	            }
	          }
	          if (s4 !== peg$FAILED) {
	            s4 = input.substring(s3, peg$currPos);
	          }
	          s3 = s4;
	          if (s3 !== peg$FAILED) {
	            if (input.substr(peg$currPos, 2) === peg$c11) {
	              s4 = peg$c11;
	              peg$currPos += 2;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c12); }
	            }
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c14();
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }
	      if (s0 === peg$FAILED) {
	        s0 = peg$currPos;
	        s1 = peg$parse_();
	        if (s1 !== peg$FAILED) {
	          if (input.substr(peg$currPos, 2) === peg$c15) {
	            s2 = peg$c15;
	            peg$currPos += 2;
	          } else {
	            s2 = peg$FAILED;
	            if (peg$silentFails === 0) { peg$fail(peg$c16); }
	          }
	          if (s2 !== peg$FAILED) {
	            s3 = [];
	            if (peg$c17.test(input.charAt(peg$currPos))) {
	              s4 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c18); }
	            }
	            while (s4 !== peg$FAILED) {
	              s3.push(s4);
	              if (peg$c17.test(input.charAt(peg$currPos))) {
	                s4 = input.charAt(peg$currPos);
	                peg$currPos++;
	              } else {
	                s4 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c18); }
	              }
	            }
	            if (s3 !== peg$FAILED) {
	              s4 = peg$parse_();
	              if (s4 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c14();
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      }

	      return s0;
	    }

	    function peg$parsenote() {
	      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (peg$c19.test(input.charAt(peg$currPos))) {
	          s2 = input.charAt(peg$currPos);
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c20); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = [];
	            if (peg$c21.test(input.charAt(peg$currPos))) {
	              s5 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s5 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c22); }
	            }
	            while (s5 !== peg$FAILED) {
	              s4.push(s5);
	              if (peg$c21.test(input.charAt(peg$currPos))) {
	                s5 = input.charAt(peg$currPos);
	                peg$currPos++;
	              } else {
	                s5 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c22); }
	              }
	            }
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                s6 = peg$currPos;
	                s7 = [];
	                if (peg$c23.test(input.charAt(peg$currPos))) {
	                  s8 = input.charAt(peg$currPos);
	                  peg$currPos++;
	                } else {
	                  s8 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                }
	                while (s8 !== peg$FAILED) {
	                  s7.push(s8);
	                  if (peg$c23.test(input.charAt(peg$currPos))) {
	                    s8 = input.charAt(peg$currPos);
	                    peg$currPos++;
	                  } else {
	                    s8 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                  }
	                }
	                if (s7 !== peg$FAILED) {
	                  s7 = input.substring(s6, peg$currPos);
	                }
	                s6 = s7;
	                if (s6 !== peg$FAILED) {
	                  s7 = peg$parse_();
	                  if (s7 !== peg$FAILED) {
	                    s8 = [];
	                    if (input.charCodeAt(peg$currPos) === 46) {
	                      s9 = peg$c25;
	                      peg$currPos++;
	                    } else {
	                      s9 = peg$FAILED;
	                      if (peg$silentFails === 0) { peg$fail(peg$c26); }
	                    }
	                    while (s9 !== peg$FAILED) {
	                      s8.push(s9);
	                      if (input.charCodeAt(peg$currPos) === 46) {
	                        s9 = peg$c25;
	                        peg$currPos++;
	                      } else {
	                        s9 = peg$FAILED;
	                        if (peg$silentFails === 0) { peg$fail(peg$c26); }
	                      }
	                    }
	                    if (s8 !== peg$FAILED) {
	                      s9 = peg$parse_();
	                      if (s9 !== peg$FAILED) {
	                        peg$reportedPos = s0;
	                        s1 = peg$c27(s2, s4, s6, s8);
	                        s0 = s1;
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$c1;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$c1;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$c1;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$c1;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsetie() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 94) {
	          s2 = peg$c28;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c29); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            while (s6 !== peg$FAILED) {
	              s5.push(s6);
	              if (peg$c23.test(input.charAt(peg$currPos))) {
	                s6 = input.charAt(peg$currPos);
	                peg$currPos++;
	              } else {
	                s6 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c24); }
	              }
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                s6 = [];
	                if (input.charCodeAt(peg$currPos) === 46) {
	                  s7 = peg$c25;
	                  peg$currPos++;
	                } else {
	                  s7 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c26); }
	                }
	                while (s7 !== peg$FAILED) {
	                  s6.push(s7);
	                  if (input.charCodeAt(peg$currPos) === 46) {
	                    s7 = peg$c25;
	                    peg$currPos++;
	                  } else {
	                    s7 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c26); }
	                  }
	                }
	                if (s6 !== peg$FAILED) {
	                  s7 = peg$parse_();
	                  if (s7 !== peg$FAILED) {
	                    peg$reportedPos = s0;
	                    s1 = peg$c30(s4, s6);
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$c1;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$c1;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parserest() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 114) {
	          s2 = peg$c31;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c32); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            while (s6 !== peg$FAILED) {
	              s5.push(s6);
	              if (peg$c23.test(input.charAt(peg$currPos))) {
	                s6 = input.charAt(peg$currPos);
	                peg$currPos++;
	              } else {
	                s6 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c24); }
	              }
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                s6 = [];
	                if (input.charCodeAt(peg$currPos) === 46) {
	                  s7 = peg$c25;
	                  peg$currPos++;
	                } else {
	                  s7 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c26); }
	                }
	                while (s7 !== peg$FAILED) {
	                  s6.push(s7);
	                  if (input.charCodeAt(peg$currPos) === 46) {
	                    s7 = peg$c25;
	                    peg$currPos++;
	                  } else {
	                    s7 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c26); }
	                  }
	                }
	                if (s6 !== peg$FAILED) {
	                  s7 = peg$parse_();
	                  if (s7 !== peg$FAILED) {
	                    peg$reportedPos = s0;
	                    s1 = peg$c33(s4, s6);
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$c1;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$c1;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parseoctave() {
	      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 111) {
	          s2 = peg$c34;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c35); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = peg$currPos;
	            if (input.charCodeAt(peg$currPos) === 45) {
	              s6 = peg$c37;
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c38); }
	            }
	            if (s6 === peg$FAILED) {
	              s6 = peg$c36;
	            }
	            if (s6 !== peg$FAILED) {
	              s7 = [];
	              if (peg$c23.test(input.charAt(peg$currPos))) {
	                s8 = input.charAt(peg$currPos);
	                peg$currPos++;
	              } else {
	                s8 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c24); }
	              }
	              if (s8 !== peg$FAILED) {
	                while (s8 !== peg$FAILED) {
	                  s7.push(s8);
	                  if (peg$c23.test(input.charAt(peg$currPos))) {
	                    s8 = input.charAt(peg$currPos);
	                    peg$currPos++;
	                  } else {
	                    s8 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                  }
	                }
	              } else {
	                s7 = peg$c1;
	              }
	              if (s7 !== peg$FAILED) {
	                s6 = [s6, s7];
	                s5 = s6;
	              } else {
	                peg$currPos = s5;
	                s5 = peg$c1;
	              }
	            } else {
	              peg$currPos = s5;
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c39(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parseoctave_up() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 60) {
	          s2 = peg$c40;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c41); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            peg$reportedPos = s0;
	            s1 = peg$c42();
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parseoctave_down() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 62) {
	          s2 = peg$c43;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c44); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            peg$reportedPos = s0;
	            s1 = peg$c45();
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsenote_length() {
	      var s0, s1, s2, s3, s4, s5, s6, s7;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 108) {
	          s2 = peg$c46;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c47); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            if (s6 !== peg$FAILED) {
	              while (s6 !== peg$FAILED) {
	                s5.push(s6);
	                if (peg$c23.test(input.charAt(peg$currPos))) {
	                  s6 = input.charAt(peg$currPos);
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                }
	              }
	            } else {
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                s6 = [];
	                if (input.charCodeAt(peg$currPos) === 46) {
	                  s7 = peg$c25;
	                  peg$currPos++;
	                } else {
	                  s7 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c26); }
	                }
	                while (s7 !== peg$FAILED) {
	                  s6.push(s7);
	                  if (input.charCodeAt(peg$currPos) === 46) {
	                    s7 = peg$c25;
	                    peg$currPos++;
	                  } else {
	                    s7 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c26); }
	                  }
	                }
	                if (s6 !== peg$FAILED) {
	                  s7 = peg$parse_();
	                  if (s7 !== peg$FAILED) {
	                    peg$reportedPos = s0;
	                    s1 = peg$c48(s4, s6);
	                    s0 = s1;
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$c1;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$c1;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsegate_time() {
	      var s0, s1, s2, s3, s4, s5;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 113) {
	          s2 = peg$c49;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c50); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            if (peg$c51.test(input.charAt(peg$currPos))) {
	              s4 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s4 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c52); }
	            }
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c53(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsevelocity() {
	      var s0, s1, s2, s3, s4, s5, s6;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 117) {
	          s2 = peg$c54;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c55); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            if (s6 !== peg$FAILED) {
	              while (s6 !== peg$FAILED) {
	                s5.push(s6);
	                if (peg$c23.test(input.charAt(peg$currPos))) {
	                  s6 = input.charAt(peg$currPos);
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                }
	              }
	            } else {
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c56(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsevolume() {
	      var s0, s1, s2, s3, s4, s5, s6;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 118) {
	          s2 = peg$c57;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c58); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            if (s6 !== peg$FAILED) {
	              while (s6 !== peg$FAILED) {
	                s5.push(s6);
	                if (peg$c23.test(input.charAt(peg$currPos))) {
	                  s6 = input.charAt(peg$currPos);
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                }
	              }
	            } else {
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c59(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsepan() {
	      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 112) {
	          s2 = peg$c60;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c61); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = peg$currPos;
	            if (input.charCodeAt(peg$currPos) === 45) {
	              s6 = peg$c37;
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c38); }
	            }
	            if (s6 === peg$FAILED) {
	              s6 = peg$c36;
	            }
	            if (s6 !== peg$FAILED) {
	              s7 = [];
	              if (peg$c23.test(input.charAt(peg$currPos))) {
	                s8 = input.charAt(peg$currPos);
	                peg$currPos++;
	              } else {
	                s8 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c24); }
	              }
	              if (s8 !== peg$FAILED) {
	                while (s8 !== peg$FAILED) {
	                  s7.push(s8);
	                  if (peg$c23.test(input.charAt(peg$currPos))) {
	                    s8 = input.charAt(peg$currPos);
	                    peg$currPos++;
	                  } else {
	                    s8 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                  }
	                }
	              } else {
	                s7 = peg$c1;
	              }
	              if (s7 !== peg$FAILED) {
	                s6 = [s6, s7];
	                s5 = s6;
	              } else {
	                peg$currPos = s5;
	                s5 = peg$c1;
	              }
	            } else {
	              peg$currPos = s5;
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c62(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parseexpression() {
	      var s0, s1, s2, s3, s4, s5, s6;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 69) {
	          s2 = peg$c63;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c64); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            if (s6 !== peg$FAILED) {
	              while (s6 !== peg$FAILED) {
	                s5.push(s6);
	                if (peg$c23.test(input.charAt(peg$currPos))) {
	                  s6 = input.charAt(peg$currPos);
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                }
	              }
	            } else {
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c65(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsecontrol_change() {
	      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 66) {
	          s2 = peg$c66;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c67); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            if (s6 !== peg$FAILED) {
	              while (s6 !== peg$FAILED) {
	                s5.push(s6);
	                if (peg$c23.test(input.charAt(peg$currPos))) {
	                  s6 = input.charAt(peg$currPos);
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                }
	              }
	            } else {
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                if (input.charCodeAt(peg$currPos) === 44) {
	                  s6 = peg$c68;
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c69); }
	                }
	                if (s6 !== peg$FAILED) {
	                  s7 = peg$parse_();
	                  if (s7 !== peg$FAILED) {
	                    s8 = peg$currPos;
	                    s9 = [];
	                    if (peg$c23.test(input.charAt(peg$currPos))) {
	                      s10 = input.charAt(peg$currPos);
	                      peg$currPos++;
	                    } else {
	                      s10 = peg$FAILED;
	                      if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                    }
	                    if (s10 !== peg$FAILED) {
	                      while (s10 !== peg$FAILED) {
	                        s9.push(s10);
	                        if (peg$c23.test(input.charAt(peg$currPos))) {
	                          s10 = input.charAt(peg$currPos);
	                          peg$currPos++;
	                        } else {
	                          s10 = peg$FAILED;
	                          if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                        }
	                      }
	                    } else {
	                      s9 = peg$c1;
	                    }
	                    if (s9 !== peg$FAILED) {
	                      s9 = input.substring(s8, peg$currPos);
	                    }
	                    s8 = s9;
	                    if (s8 !== peg$FAILED) {
	                      s9 = peg$parse_();
	                      if (s9 !== peg$FAILED) {
	                        peg$reportedPos = s0;
	                        s1 = peg$c70(s4, s8);
	                        s0 = s1;
	                      } else {
	                        peg$currPos = s0;
	                        s0 = peg$c1;
	                      }
	                    } else {
	                      peg$currPos = s0;
	                      s0 = peg$c1;
	                    }
	                  } else {
	                    peg$currPos = s0;
	                    s0 = peg$c1;
	                  }
	                } else {
	                  peg$currPos = s0;
	                  s0 = peg$c1;
	                }
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parseprogram_change() {
	      var s0, s1, s2, s3, s4, s5, s6;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 64) {
	          s2 = peg$c71;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c72); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            if (s6 !== peg$FAILED) {
	              while (s6 !== peg$FAILED) {
	                s5.push(s6);
	                if (peg$c23.test(input.charAt(peg$currPos))) {
	                  s6 = input.charAt(peg$currPos);
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                }
	              }
	            } else {
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c73(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsechannel_aftertouch() {
	      var s0, s1, s2, s3, s4, s5, s6;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 68) {
	          s2 = peg$c74;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c75); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            if (s6 !== peg$FAILED) {
	              while (s6 !== peg$FAILED) {
	                s5.push(s6);
	                if (peg$c23.test(input.charAt(peg$currPos))) {
	                  s6 = input.charAt(peg$currPos);
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                }
	              }
	            } else {
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c76(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsetempo() {
	      var s0, s1, s2, s3, s4, s5, s6;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 116) {
	          s2 = peg$c77;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c78); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            if (s6 !== peg$FAILED) {
	              while (s6 !== peg$FAILED) {
	                s5.push(s6);
	                if (peg$c23.test(input.charAt(peg$currPos))) {
	                  s6 = input.charAt(peg$currPos);
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                }
	              }
	            } else {
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c79(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsestart_point() {
	      var s0, s1, s2, s3;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 63) {
	          s2 = peg$c80;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c81); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            peg$reportedPos = s0;
	            s1 = peg$c82();
	            s0 = s1;
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parsekey_shift() {
	      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 107) {
	          s2 = peg$c83;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c84); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = peg$currPos;
	            if (input.charCodeAt(peg$currPos) === 45) {
	              s6 = peg$c37;
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c38); }
	            }
	            if (s6 === peg$FAILED) {
	              s6 = peg$c36;
	            }
	            if (s6 !== peg$FAILED) {
	              s7 = [];
	              if (peg$c23.test(input.charAt(peg$currPos))) {
	                s8 = input.charAt(peg$currPos);
	                peg$currPos++;
	              } else {
	                s8 = peg$FAILED;
	                if (peg$silentFails === 0) { peg$fail(peg$c24); }
	              }
	              if (s8 !== peg$FAILED) {
	                while (s8 !== peg$FAILED) {
	                  s7.push(s8);
	                  if (peg$c23.test(input.charAt(peg$currPos))) {
	                    s8 = input.charAt(peg$currPos);
	                    peg$currPos++;
	                  } else {
	                    s8 = peg$FAILED;
	                    if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                  }
	                }
	              } else {
	                s7 = peg$c1;
	              }
	              if (s7 !== peg$FAILED) {
	                s6 = [s6, s7];
	                s5 = s6;
	              } else {
	                peg$currPos = s5;
	                s5 = peg$c1;
	              }
	            } else {
	              peg$currPos = s5;
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c85(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    function peg$parseset_midi_channel() {
	      var s0, s1, s2, s3, s4, s5, s6;

	      s0 = peg$currPos;
	      s1 = peg$parse_();
	      if (s1 !== peg$FAILED) {
	        if (input.charCodeAt(peg$currPos) === 67) {
	          s2 = peg$c86;
	          peg$currPos++;
	        } else {
	          s2 = peg$FAILED;
	          if (peg$silentFails === 0) { peg$fail(peg$c87); }
	        }
	        if (s2 !== peg$FAILED) {
	          s3 = peg$parse_();
	          if (s3 !== peg$FAILED) {
	            s4 = peg$currPos;
	            s5 = [];
	            if (peg$c23.test(input.charAt(peg$currPos))) {
	              s6 = input.charAt(peg$currPos);
	              peg$currPos++;
	            } else {
	              s6 = peg$FAILED;
	              if (peg$silentFails === 0) { peg$fail(peg$c24); }
	            }
	            if (s6 !== peg$FAILED) {
	              while (s6 !== peg$FAILED) {
	                s5.push(s6);
	                if (peg$c23.test(input.charAt(peg$currPos))) {
	                  s6 = input.charAt(peg$currPos);
	                  peg$currPos++;
	                } else {
	                  s6 = peg$FAILED;
	                  if (peg$silentFails === 0) { peg$fail(peg$c24); }
	                }
	              }
	            } else {
	              s5 = peg$c1;
	            }
	            if (s5 !== peg$FAILED) {
	              s5 = input.substring(s4, peg$currPos);
	            }
	            s4 = s5;
	            if (s4 !== peg$FAILED) {
	              s5 = peg$parse_();
	              if (s5 !== peg$FAILED) {
	                peg$reportedPos = s0;
	                s1 = peg$c88(s4);
	                s0 = s1;
	              } else {
	                peg$currPos = s0;
	                s0 = peg$c1;
	              }
	            } else {
	              peg$currPos = s0;
	              s0 = peg$c1;
	            }
	          } else {
	            peg$currPos = s0;
	            s0 = peg$c1;
	          }
	        } else {
	          peg$currPos = s0;
	          s0 = peg$c1;
	        }
	      } else {
	        peg$currPos = s0;
	        s0 = peg$c1;
	      }

	      return s0;
	    }

	    peg$result = peg$startRuleFunction();

	    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
	      return peg$result;
	    } else {
	      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
	        peg$fail({ type: "end", description: "end of input" });
	      }

	      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
	    }
	  }

	  return {
	    SyntaxError: SyntaxError,
	    parse:       parse
	  };
	})();


/***/ },
/* 9 */,
/* 10 */,
/* 11 */
/***/ function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	function downloadBlob(data, fileName, mimeType) {
	    var blob = new Blob([data], {
	        type: mimeType
	    });
	    var url = window.URL.createObjectURL(blob);
	    downloadURL(url, fileName);
	    setTimeout(function () {
	        return window.URL.revokeObjectURL(url);
	    }, 1000);
	}
	exports.downloadBlob = downloadBlob;
	;
	function downloadURL(data, fileName) {
	    var a;
	    a = document.createElement('a');
	    a.href = data;
	    a.download = fileName;
	    document.body.appendChild(a);
	    a.style.display = 'none';
	    a.click();
	    a.remove();
	}
	exports.downloadURL = downloadURL;
	;


/***/ }
/******/ ]);