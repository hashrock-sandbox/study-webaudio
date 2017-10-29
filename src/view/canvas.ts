import {Note} from "../model/note"

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

  set patternLength(value: number){
    this._patternLength = value
    this.w = value * 32
    this.clear()
  }
  get patternLength(){
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
  toScreen(n: Note){
    return {
      x: n.start * this.noteWidth,
      y: this.h - (n.no + 1) * this.noteHeight,
      h: this.noteHeight,
      w: this.noteWidth
    }
  }

  drawKeyboard(){
    this.ctx.fillStyle = "#BBBBBB"
    for(let i = 0; i < NOTE_RANGE; i++){
      if(
        i % 12 === 1 || 
        i % 12 === 3 || 
        i % 12 === 6 || 
        i % 12 === 8 || 
        i % 12 === 10
      ){
        this.ctx.fillRect(0, this.h - i * this.noteHeight, this.w, -this.noteHeight)
      }
    }
  }

  drawGridLines(){
    this.ctx.save()
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = "#AAAAAA";
    for(let i = 0; i < this._patternLength; i++){
      this.ctx.beginPath();
      if(i % 4 === 0){
        this.ctx.strokeStyle = "#777777";
      }else{
        this.ctx.strokeStyle = "#AAAAAA";
      }
      this.ctx.moveTo(i * this.noteWidth, 0)
      this.ctx.lineTo(i * this.noteWidth, this.h)
      this.ctx.stroke()
    }
    for(let i = 0; i < NOTE_RANGE; i++){
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