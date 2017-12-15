import * as audio from "../model/audio"

export interface NoteOptions {
  ch: number,
  start: number,
  note: number,
  end: number
}

export class Note {
  ch: number;
  start: number;
  no: number;
  length: number;
  constructor(options: NoteOptions) {
    this.ch = options.ch ? options.ch : 1;
    this.no = options.note ? options.note : 0;
    this.start = options.start ? options.start : 0;
    this.length = options.end ? options.end : 1;
  }
}

interface NoteEvent {
  noteNumber: number;
}

function playNote(e: NoteEvent, length: number) {
  audio.playNote(e.noteNumber, length)
}

interface PianoRollOptions {
  el: HTMLCanvasElement,
  notes: Note[],
  patternLength: number
}

export class PianoRoll {
  el: HTMLCanvasElement;
  _notes: Note[];
  drv: DrawingDriver;
  hoverNote: Note | null;
  clicked: boolean;
  nowNote: number;
  startPos: number;
  playing: boolean;
  playingPos: number;
  bpm: number;

  tick() {
    if (this.playing) {
      this.playingPos++;
      this.drv.playPosition = this.playingPos
      if (this.playingPos >= this.drv.patternLength) {
        this.playingPos = 0;
      }
      this.notes.forEach((note) => {
        if (note.start === this.playingPos) {
          playNote({
            noteNumber: note.no + 48
          }, note.length * 60000 / this.bpm / 4)
        }
      })
      this.draw()
    }
  }

  set notes(notes) {
    this._notes = notes;
    this.drv = new DrawingDriver(this.el.getContext("2d"), this.el.offsetWidth, this.el.offsetHeight);
    this.draw()
  }
  get notes() {
    return this._notes;
  }

  constructor(options: PianoRollOptions) {
    this.el = options.el;
    this.notes = options.notes ? options.notes : [];
    this.patternLength = options.patternLength ? options.patternLength : 32;
    this.hoverNote = null;
    this.clicked = false;
    this.nowNote = -1;
    this.playing = false;
    this.playingPos = -1;
    this.bpm = 120;
    let timebase = 60000 / this.bpm / 4;

    setInterval(() => {
      this.tick();
    }, timebase)

    this.el.addEventListener("mousemove", (e: MouseEvent) => {
      this.onMouseMove(e.offsetX, e.offsetY)
    });

    this.el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.onMouseDown(e.offsetX, e.offsetY)
    })

    this.el.addEventListener("mouseup", (e: MouseEvent) => {
      e.preventDefault();
      this.onMouseUp(e.offsetX, e.offsetY)
    });

    this.el.addEventListener("touchmove", (e) => {
      let pos = convertTouchEvent(e)
      this.onMouseMove(pos.x, pos.y)
    })
    this.el.addEventListener("touchstart", (e) => {
      e.preventDefault();
      let pos = convertTouchEvent(e)
      this.onMouseDown(pos.x, pos.y)
    })
    this.el.addEventListener("touchend", (e) => {
      e.preventDefault();
      let pos = convertTouchEvent(e)
      this.onMouseUp(pos.x, pos.y)
    })
  }

  set patternLength(value: number) {
    if (this.drv) {
      this.drv.patternLength = value
      this.el.width = value * 32
      this.playingPos = 0;
      this.draw()
    }
  }

  onMouseDown(x: number, y: number) {
    var note = this.drv.createNote(1, x, y, 1);
    this.nowNote = note.no
    this.startPos = note.start

    // 0 = C3
    playNote({
      noteNumber: note.no + 48
    }, 100);
    this.draw();
    this.clicked = true
  }

  onMouseMove(x: number, y: number) {
    var note = this.drv.createNote(1, x, y, 1);
    if (this.clicked) {
      note = this.drv.createNoteWithLength(1, this.startPos, y, x);
      if (this.nowNote !== note.no) {
        playNote({
          noteNumber: note.no + 48
        }, 100);
        this.nowNote = note.no
      }
    }
    /*
    let ret = this.drv.toScreen(note)
    console.log(ret)
    */
    this.hoverNote = note
    this.draw();
  }

  onMouseUp(x: number, y: number) {
    var note = this.drv.createNoteWithLength(1, this.startPos, y, x);
    var matched = this._hitTest(note);
    if (matched >= 0) {
      this.notes.splice(matched, 1);
    } else {
      this.notes.push(note);
    }
    this.draw();
    this.clicked = false
  }


  _drawAllNotes() {
    this.notes.forEach((note: Note) => {
      this.drv.drawNote(note, "#FFF")
    })
  }

  _drawHoverNote() {
    this.drv.drawNote(this.hoverNote, "rgba(255,255,255,0.5)");
  }

  draw() {
    this.drv.clear();
    this._drawAllNotes()
    if (this.hoverNote) {
      this._drawHoverNote()
    }
  }

  _hitTest(note: Note) {
    var matched = -1;
    for (var i = 0; i < this.notes.length; i++) {
      var n = this.notes[i];
      if (_isHit(n, note)) {
        matched = i;
      }
    }
    return matched;
  }

  play() {
    this.playing = true
  }
  stop() {
    this.playing = false
  }
}

function _isHit(n: Note, note: Note) {
  return (
    n.no === note.no &&
    n.start <= note.start &&
    n.start + n.length - 1 >= note.start
  )
}

function convertTouchEvent(e: TouchEvent) {
  var dom = <HTMLElement>e.target
  var rect = dom.getBoundingClientRect();
  var x = e.targetTouches[0].pageX - rect.left;
  var y = e.targetTouches[0].pageY - rect.top;
  return {
    x: x,
    y: y
  }
}


const PATTERN_LENGTH = 32;
const NOTE_RANGE = 48;

interface NoteScaleData {
  x: number,
  y: number,
  w: number,
  h: number
}

function NoteScale(xScale: number, yScale: number): (x: number, y: number, w: number, h: number) => NoteScaleData {
  return function (x: number, y: number, w: number, h: number) {
    return {
      x: x * xScale,
      y: y * yScale,
      w: w * xScale,
      h: yScale
    }
  }
}

export class DrawingDriver {
  w: number;
  h: number;
  noteWidth: number;
  noteHeight: number;
  ctx: CanvasRenderingContext2D;
  scale: (x: number, y: number, w: number, h: number) => NoteScaleData;
  playPosition: number
  _patternLength: number

  constructor(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.w = w;
    this.h = h;
    //    this.noteWidth = this.w / PATTERN_LENGTH;
    this.noteWidth = 32;
    this.noteHeight = this.h / NOTE_RANGE;
    this.ctx = ctx;
    this.scale = NoteScale(this.noteWidth, this.noteHeight);
  }
  _drawRect(x: number, y: number, w: number, h: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  set patternLength(value: number) {
    this._patternLength = value
    this.w = value * 32
    this.clear()
  }
  get patternLength() {
    return this._patternLength
  }

  drawNote(note: Note, color: string) {
    var t = this.scale(note.start, note.no, note.length, 1);
    this._drawRect(t.x, this.h - t.y - t.h, t.w, t.h, color);
  }
  getNoteY(y: number) {
    return Math.floor((this.h - y) / this.noteHeight)
  }
  getNoteX(x: number) {
    return Math.floor(x / this.noteWidth)
  }
  toScreen(n: Note) {
    return {
      x: n.start * this.noteWidth,
      y: this.h - (n.no + 1) * this.noteHeight,
      h: this.noteHeight,
      w: this.noteWidth
    }
  }

  drawKeyboard() {
    this.ctx.fillStyle = "#BBBBBB"
    for (let i = 0; i < NOTE_RANGE; i++) {
      if (
        i % 12 === 1 ||
        i % 12 === 3 ||
        i % 12 === 6 ||
        i % 12 === 8 ||
        i % 12 === 10
      ) {
        this.ctx.fillRect(0, this.h - i * this.noteHeight, this.w, -this.noteHeight)
      }
    }
  }

  drawGridLines() {
    this.ctx.save()
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#AAAAAA";
    for (let i = 0; i < this._patternLength; i++) {
      this.ctx.beginPath();
      if (i % 4 === 0) {
        this.ctx.strokeStyle = "#777777";
      } else {
        this.ctx.strokeStyle = "#AAAAAA";
      }
      this.ctx.moveTo(i * this.noteWidth, 0)
      this.ctx.lineTo(i * this.noteWidth, this.h)
      this.ctx.stroke()
    }
    for (let i = 0; i < NOTE_RANGE; i++) {
      this.ctx.moveTo(0, i * this.noteHeight)
      this.ctx.lineTo(this.w, i * this.noteHeight)
    }
    this.ctx.stroke()

    this.ctx.strokeStyle = "#AA6666";
    this.ctx.beginPath();
    this.ctx.moveTo(this.playPosition * this.noteWidth, 0)
    this.ctx.lineTo(this.playPosition * this.noteWidth, this.h)
    this.ctx.stroke()

    this.ctx.restore();
  }

  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h);

    this.drawKeyboard()
    this.drawGridLines()
  }

  createNoteWithLength(ch: number, x: number, y: number, x1: number) {
    return new Note({
      ch: ch,
      start: x,
      note: this.getNoteY(y),
      end: this.getNoteX(x1) - x + 1
    });
  }

  createNote(ch: number, x: number, y: number, len: number) {
    return new Note({
      ch: ch,
      start: this.getNoteX(x),
      note: this.getNoteY(y),
      end: len
    });
  }
  hitTest(note: Note, x: number, y: number) {
    return (
      note.start <= this.getNoteX(x) &&
      note.start + note.length >= this.getNoteX(x) &&
      this.getNoteY(y) === note.no
    )
  }
}