import {PianoRoll} from "./pianoroll"

var el: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector(".canvas");
var piano: PianoRoll = new PianoRoll({
  el: el,
  notes: []
});

let playing = false;

var playButton = document.querySelector("#play")

function togglePlaying(){
  if(playing){
    piano.stop();
    playing = false
  }else{
    piano.play()
    playing = true
  }
}

playButton.addEventListener("click", ()=>{
  togglePlaying()
})

document.addEventListener("keypress", (e)=>{
  if(e.keyCode === 32){
    togglePlaying()
  }
})

piano.draw();
