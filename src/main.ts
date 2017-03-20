import {PianoRoll} from "./pianoroll"

var el: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector(".canvas");
var piano: PianoRoll = new PianoRoll({
  el: el,
  notes: []
});

let playing = false;

var playButton = document.querySelector("#play")
playButton.addEventListener("click", ()=>{
  if(playing){
    piano.stop();
    playing = false
  }else{
    piano.play()
    playing = true
  }
})

piano.draw();
