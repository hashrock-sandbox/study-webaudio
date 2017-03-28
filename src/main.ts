import {PianoRoll} from "./pianoroll"
import * as mml from "./mml"

var el: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector(".canvas");
var piano: PianoRoll = new PianoRoll({
  el: el,
  notes: []
});

let playing = false;

let playButton = document.querySelector("#play")

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

let exportSource = <HTMLTextAreaElement>document.querySelector("#export-source")
document.querySelector("#export-json").addEventListener("click", ()=>{
  exportSource.value = JSON.stringify(piano.notes, null, 2)
})
document.querySelector("#export-mml").addEventListener("click", ()=>{
  exportSource.value = mml.jsonToMML(piano.notes).join(";\n")
})


document.addEventListener("keypress", (e)=>{
  if(e.keyCode === 32){
    togglePlaying()
  }
})

piano.draw();
