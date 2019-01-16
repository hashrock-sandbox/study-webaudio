export interface NoteOptions {
  ch: number;
  start: number;
  note: number;
  end: number;
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
