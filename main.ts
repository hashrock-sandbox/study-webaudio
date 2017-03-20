interface NoteOptions {
  ch: number,
  start: number,
  note: number,
  end: number
}

class Note {
  ch: number;
  start: number;
  note: number;
  end: number;
  constructor(options: NoteOptions) {
    this.ch = options.ch ? options.ch : 1;
    this.note = options.note ? options.note : 0;
    this.start = options.start ? options.start : 0;
    this.end = options.end ? options.end : 1;

  }
}

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

var audioContext = new AudioContext();
function mtof(noteNumber: number) {
  return 440 * Math.pow(2, (noteNumber - 69) / 12);
}

interface NoteEvent {
  noteNumber: number;
}

function playNote(e: NoteEvent) {
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

class DrawingDriver {
  w: number;
  h: number;
  noteWidth: number;
  noteHeight: number;
  ctx: CanvasRenderingContext2D;
  scale: (x: number, y: number, w: number, h: number) => NoteScaleData;

  constructor(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.w = w;
    this.h = h;
    this.noteWidth = this.w / 32;
    this.noteHeight = this.h / 48;
    this.ctx = ctx;
    this.scale = NoteScale(this.noteWidth, this.noteHeight);
  }
  _drawRect(x: number, y: number, w: number, h: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  drawNote(note: Note, color: string) {
    var t = this.scale(note.start, note.note, note.end, 1);
    this._drawRect(t.x, this.h - t.y - t.h, t.w, t.h, color);
  }
  getY(y: number) {
    return Math.floor((this.h - y) / this.noteHeight)
  }
  getX(x: number) {
    return Math.floor(x / this.noteWidth)
  }

  clear() {
    this.ctx.clearRect(0, 0, this.w, this.h);
  }
  createNoteWithLength(ch: number, x: number, y: number, x1: number) {
    return new Note({
      ch: ch,
      start: x,
      note: this.getY(y),
      end: this.getX(x1) - x + 1
    });
  }

  createNote(ch: number, x: number, y: number, len: number) {
    return new Note({
      ch: ch,
      start: this.getX(x),
      note: this.getY(y),
      end: len
    });
  }
  hitTest(note: Note, x: number, y: number) {
    return (
      note.start <= this.getX(x) &&
      note.start + note.end >= this.getX(x) &&
      this.getY(y) === note.note
    )
  }
}


interface PianoRollOptions {
  el: HTMLCanvasElement,
  notes: Note[]
}

class PianoRoll {
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
        if (this.nowNote !== note.note) {
          playNote({
            noteNumber: note.note + 48
          });
          this.nowNote = note.note
        }
      }
      this.hoverNote = note
      this.draw();
    });

    this.el.addEventListener("mousedown", (e) => {
      var note = this.drv.createNote(1, e.offsetX, e.offsetY, 1);
      this.nowNote = note.note
      this.startPos = note.start
      playNote({
        noteNumber: note.note + 48
      });
      this.clicked = true
    })

    this.el.addEventListener("mouseup", (e: MouseEvent) => {
      //var note = this.drv.createNote(1, e.offsetX, e.offsetY, 1);
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
        n.note === note.note &&
        n.start <= note.start &&
        n.start + n.end - 1 >= note.start
      ) {
        matched = i;
      }
    }
    return matched;
  }
}

var el: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector(".canvas");
var piano: PianoRoll = new PianoRoll({
  el: el,
  notes: []
});

piano.draw();
