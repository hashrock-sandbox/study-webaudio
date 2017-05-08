import { DrawingDriver } from "./canvas"
import { Note } from "./note"
import * as audio from "./audio"

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
  notes: Note[];
  drv: DrawingDriver;
  hoverNote: Note | null;
  clicked: boolean;
  nowNote: number;
  startPos: number;
  playing: boolean;
  playingPos: number;

  constructor(options: PianoRollOptions) {
    this.el = options.el;
    this.notes = options.notes ? options.notes : [];
    this.patternLength = options.patternLength ? options.patternLength : 32;
    this.drv = new DrawingDriver(this.el.getContext("2d"), this.el.offsetWidth, this.el.offsetHeight);
    this.hoverNote = null;
    this.clicked = false;
    this.nowNote = -1;
    this.playing = false;
    this.playingPos = -1;
    this.drv.patternLength = options.patternLength

    let bpm = 120
    let timebase = 60000 / bpm / 4;

    setInterval(() => {
      if (this.playing) {
        this.playingPos++;
        this.drv.playPosition = this.playingPos
        if (this.playingPos > 32) {
          this.playingPos = 0;
        }
        this.notes.forEach((note) => {
          if (note.start === this.playingPos) {
            playNote({
              noteNumber: note.no + 48
            }, note.length * 60000 / bpm / 4)
          }
        })
        this.draw()
      }
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

  set patternLength(value: number){
    if(this.drv){
      this.drv.patternLength = value
      this.el.width = value * 32
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

