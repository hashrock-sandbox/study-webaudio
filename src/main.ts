declare var require:any
declare var Vue:any

import {PianoRoll} from "./pianoroll"
import * as mml from "./mml"
const mml2smf = require("mml2smf")

var piano: PianoRoll

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

document.querySelector("#export-smf").addEventListener("click", ()=>{
  //現在、ch1のみ。ボリューム指定は0-15を0-127に変換する必要があるが、対数にすべきか不明なのでとりあえず固定値にした
  let binary = mml2smf(mml.jsonToMML(piano.notes).map(line=>"C1"+line).join(";\n").replace(/v10/g, "v80"))
  downloadBlob(binary, 'minroll.mid', 'application/octet-stream');
})

function downloadBlob(data : Uint8Array, fileName: string, mimeType :string) {
  let blob = new Blob([data], {
    type: mimeType
  });
  let url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

function downloadURL(data:string, fileName:string) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style.display = 'none';
  a.click();
  a.remove();
};

document.addEventListener("keypress", (e)=>{
  if(e.keyCode === 32){
    togglePlaying()
  }
})


new Vue({
  el: "#app",
  mounted: function(){
    var el: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector(".canvas");
    piano = new PianoRoll({
      el: el,
      notes: []
    });
    piano.draw();
  },
  methods: {
    exportJson: function(){
      
    }
  }
})
