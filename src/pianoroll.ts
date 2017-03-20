import {DrawingDriver} from "./canvas"
import {Note} from "./note"
import * as audio from "./audio"

interface NoteEvent {
  noteNumber: number;
}

function playNote(e: NoteEvent) {
  audio.playNote(e.noteNumber, 100)
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

  constructor(options: PianoRollOptions) {
    this.el = options.el;
    this.notes = options.notes ? options.notes : [];
    this.drv = new DrawingDriver(this.el.getContext("2d"), this.el.offsetWidth, this.el.offsetHeight);
    this.hoverNote = null;
    this.clicked = false;
    this.nowNote = -1;


    this.el.addEventListener("mousemove", (e: MouseEvent) => {
      var note = this.drv.createNote(1, e.offsetX, e.offsetY, 1);
      if (this.clicked) {
        note = this.drv.createNoteWithLength(1, this.startPos, e.offsetY, e.offsetX);
        if (this.nowNote !== note.no) {
          playNote({
            noteNumber: note.no + 48
          });
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
      });
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
      this.clicked = false
    });
  }
  draw() {
    this.drv.clear();
    this.notes.forEach((note: Note) => {
      this.drv.drawNote(note, "#FFF")
    })
    if (this.hoverNote) {
      this.drv.drawNote(this.hoverNote, "rgba(255,255,255,0.5)");
    }
  }

  _hitTest(note: Note) {
    var matched = -1;
    for (var i = 0; i < this.notes.length; i++) {
      var n = this.notes[i];
      if (
        n.no === note.no &&
        n.start <= note.start &&
        n.start + n.length - 1 >= note.start
      ) {
        matched = i;
      }
    }
    return matched;
  }
}