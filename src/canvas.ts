import {Note} from "./note"

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
    var t = this.scale(note.start, note.no, note.length, 1);
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
      note.start + note.length >= this.getX(x) &&
      this.getY(y) === note.no
    )
  }
}