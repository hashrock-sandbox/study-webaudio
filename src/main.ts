import {PianoRoll} from "./pianoroll"

var el: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector(".canvas");
var piano: PianoRoll = new PianoRoll({
  el: el,
  notes: []
});

piano.draw();
