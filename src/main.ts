declare var require:any
declare var Vue:any

import {PianoRoll} from "./pianoroll"
import * as mml from "./mml"
const mml2smf = require("mml2smf")

var piano: PianoRoll

let playing = false;

function togglePlaying(){
  if(playing){
    piano.stop();
    playing = false
  }else{
    piano.play()
    playing = true
  }
}

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
  data: {
    source: "",
    isMenuVisible: false,
    isExportDialogVisible: false,
  },
  mounted: function(){
    var el: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector(".canvas");
    piano = new PianoRoll({
      el: el,
      notes: [],
    });
    piano.draw();
  },
  methods: {
    exportJson: function(e: MouseEvent){
      e.stopPropagation()
      this.hideMenu();
      this.isExportDialogVisible = true;
      this.source = JSON.stringify(piano.notes, null, 2)
    },
    exportMml: function(e: MouseEvent){
      e.stopPropagation()
      this.hideMenu();
      this.isExportDialogVisible = true;
      this.source = mml.jsonToMML(piano.notes).join(";\n")
    },
    exportSmf: function(){
      //現在、ch1のみ。ボリューム指定は0-15を0-127に変換する必要があるが、対数にすべきか不明なのでとりあえず固定値にした
      let binary = mml2smf(mml.jsonToMML(piano.notes).map(line=>"C1"+line).join(";\n").replace(/v10/g, "v80"))
      downloadBlob(binary, 'minroll.mid', 'application/octet-stream');
    },
    play: function(){
      togglePlaying()
    },
    hideMenu: function(){
      this.isMenuVisible = false;
      this.isExportDialogVisible = false;
    },
    showMenu: function(){
      this.isMenuVisible = true;
      this.isExportDialogVisible = false;
    }
  }
})
