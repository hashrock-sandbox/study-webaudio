import {PianoRoll} from "./pianoroll"
import * as mml from "./mml"
import * as download from "./download"
import * as mml2smf from "mml2smf"
import Vue from 'vue'
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
    patternLength: "32"
  },
  mounted: function(){
    var el: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector(".canvas");
    piano = new PianoRoll({
      el: el,
      notes: [],
      patternLength: 32
    });
    piano.draw();
  },
  watch:{
    "patternLength": function(value: string){
      piano.patternLength = parseInt(value)
    }
  },
  methods: {
    exportJson: function(e: MouseEvent){
      this.hideMenu();
      this.isExportDialogVisible = true;
      this.source = JSON.stringify(piano.notes, null, 2)
    },
    exportMml: function(e: MouseEvent){
      this.hideMenu();
      this.isExportDialogVisible = true;
      this.source = mml.jsonToMML(piano.notes).join(";\n")
    },
    exportSmf: function(){
      //現在、ch1のみ。ボリューム指定は0-15を0-127に変換する必要があるが、対数にすべきか不明なのでとりあえず固定値にした
      let binary = mml2smf(mml.jsonToMML(piano.notes).map(line=>"C1"+line).join(";\n").replace(/v10/g, "v80"))
      download.downloadBlob(binary, 'minroll.mid', 'application/octet-stream');
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
