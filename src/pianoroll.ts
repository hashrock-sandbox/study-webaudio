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
  notes: Note[]
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
    this.drv = new DrawingDriver(this.el.getContext("2d"), this.el.offsetWidth, this.el.offsetHeight);
    this.hoverNote = null;
    this.clicked = false;
    this.nowNote = -1;
    this.playing = false;
    this.playingPos = 0;

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
      var note = this.drv.createNote(1, e.offsetX, e.offsetY, 1);
      if (this.clicked) {
        note = this.drv.createNoteWithLength(1, this.startPos, e.offsetY, e.offsetX);
        if (this.nowNote !== note.no) {
          playNote({
            noteNumber: note.no + 48
          }, 100);
          this.nowNote = note.no
        }
      }
      this.hoverNote = note
      this.draw();
    });

    this.el.addEventListener("mousedown", (e) => {
      var note = this.drv.createNote(1, e.offsetX, e.offsetY, 1);
      this.nowNote = note.no
      this.startPos = note.start
      playNote({
        noteNumber: note.no + 48
      }, 100);
      this.draw();
      this.clicked = true
    })

    this.el.addEventListener("mouseup", (e: MouseEvent) => {
      var note = this.drv.createNoteWithLength(1, this.startPos, e.offsetY, e.offsetX);
      var matched = this._hitTest(note);
      if (matched >= 0) {
        this.notes.splice(matched, 1);
      } else {
        this.notes.push(note);
      }
      this.draw();
      this.clicked = false
    });
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