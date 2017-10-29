<template>
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
</template>

<script lang="ts">
/// <reference path="./mml2smf.d.ts" />

//import Vue from 'vue'
import { PianoRoll } from "./pianoroll";
var piano: PianoRoll;
import * as mml from "./mml";
import * as mml2smf from "mml2smf";
import * as download from "./download";

let playing = false;

function togglePlaying() {
  if (playing) {
    piano.stop();
    playing = false;
  } else {
    piano.play();
    playing = true;
  }
}

document.addEventListener("keypress", e => {
  if (e.keyCode === 32) {
    togglePlaying();
  }
});

export default {
  data: function() {
    return {
      source: "",
      isMenuVisible: false,
      isExportDialogVisible: false,
      patternLength: "32"
    };
  },
  mounted: function() {
    var el: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector(
      ".canvas"
    );
    piano = new PianoRoll({
      el: el,
      notes: [],
      patternLength: 32
    });
    piano.draw();
  },
  watch: {
    patternLength: function(value: string) {
      piano.patternLength = parseInt(value);
    }
  },
  methods: {
    exportJson: function(e: MouseEvent) {
      this.hideMenu();
      this.isExportDialogVisible = true;
      this.source = JSON.stringify(piano.notes, null, 2);
    },
    exportMml: function(e: MouseEvent) {
      this.hideMenu();
      this.isExportDialogVisible = true;
      this.source = mml.jsonToMML(piano.notes).join(";\n");
    },
    exportSmf: function() {
      //現在、ch1のみ。ボリューム指定は0-15を0-127に変換する必要があるが、対数にすべきか不明なのでとりあえず固定値にした
      let binary = mml2smf(
        mml
          .jsonToMML(piano.notes)
          .map(line => "C1" + line)
          .join(";\n")
          .replace(/v10/g, "v80")
      );
      download.downloadBlob(binary, "minroll.mid", "application/octet-stream");
    },
    play: function() {
      togglePlaying();
    },
    hideMenu: function() {
      this.isMenuVisible = false;
      this.isExportDialogVisible = false;
    },
    showMenu: function() {
      this.isMenuVisible = true;
      this.isExportDialogVisible = false;
    }
  }
};
</script>

<style>
#app {
  position: relative;
}

.fade {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
}

.rightmenu {
  position: absolute;
  right: 0;
  top: 3rem;
}
.rightmenu__item {
  background: black;
  line-height: 3rem;
  padding: 0 1rem;
}
.rightmenu__item:hover {
  background: #222;
  cursor: pointer;
}

canvas {
  background: #ccc;
}

body {
  user-select: none;
  font-family: "Raleway", sans-serif;
  background: #3a3a3a;
  color: white;
  margin: 0;
}

.bottom-nav {
  margin: 1rem;
}

a {
  color: white;
}

nav.menu {
  line-height: 3rem;
  background: #666;
  display: flex;
}

.menu__logo {
  flex: 1;
  margin: 0 1rem;
}

.menu__open {
  padding: 0 1rem;
  background: #888;
  cursor: pointer;
}

.menu__open:hover {
  background: #999;
}

.editor {
  margin: 1rem;
}

.export-dialog {
  padding: 1rem;
  margin: 2rem;
  background: dimgrey;
  flex-direction: column;
  display: flex;
}

textarea {
  font-size: 15px;
  flex: 1;
  height: 300px;
}
</style>
