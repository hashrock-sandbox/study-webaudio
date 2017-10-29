import {PianoRoll} from "./pianoroll"
var piano: PianoRoll
import * as mml from "./mml"
import * as mml2smf from "mml2smf"
import * as download from "./download"

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

export default {
  template: `
<div id="#app">
  <div class="fade" v-if="isMenuVisible || isExportDialogVisible" @click="hideMenu">
  <div class="rightmenu" v-if="isMenuVisible">
    <div class="rightmenu__item" @click.stop="exportJson">Export to JSON</div>
    <div class="rightmenu__item" @click.stop="exportMml">Export to MML</div>
    <div class="rightmenu__item" @click="exportSmf">Export to MIDI File</div>
  </div>

  <div class="export-dialog" v-if="isExportDialogVisible" @click.stop>
    <textarea v-model="source"></textarea>
    <a href="http://d.hatena.ne.jp/aike/20160822">TSS Ctrl-C MML Player</a> 互換のMMLを出力します。

  </div>
  </div>


  <nav class="menu">
  <div class="menu__logo">
    minroll
  </div>

  <div class="menu__open" @click="showMenu">
    Menu
  </div>
  </nav>
  <div class="editor">
  <div>
    <canvas class="canvas" width="1024" height="600"></canvas>
  </div>
  <div class="bottom-nav">
    <button @click="play" class="button is-small">Play / Stop</button>
  </div>

  Length: <select v-model="patternLength">
    <option value="16">16</option>
    <option value="32">32</option>
    <option value="64">64</option>
    <option value="128">128</option>
  </select>
  </div>
</div>

  `,

  data: function (){
    return {
      source: "",
      isMenuVisible: false,
      isExportDialogVisible: false,
      patternLength: "32"
    }
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
}