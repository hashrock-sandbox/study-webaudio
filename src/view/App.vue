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
      <div class="menu__logo">minroll</div>

      <div class="menu__inactive" v-if="user">Hello, {{user.displayName}}</div>
      <div class="menu__open" v-if="user" @click="logout">Logout</div>
      <div class="menu__open" v-if="!user" @click="login">Login with Twitter</div>
      <div class="menu__open" @click="showMenu">Export</div>
    </nav>
    <div class="editor">
      <div class="editor__left">
        <div v-if="user" class="editor__save" @click="save">SAVE</div>
        <div class="item" v-for="(post) in postsRev" :key="post.key" @click="load(post)">
          {{post.val().author.full_name}} {{post.val().timestamp | ymd}}
          <span
            @click="remove(post)"
          >×</span>
        </div>
      </div>
      <div class="editor__right">
        <canvas class="canvas" width="1024" height="600"></canvas>

        <div class="menu__inline">
          <button style="line-height: 2rem;" @click="play" class="button is-small">Play / Stop</button>
          <select style="height: 2rem;" v-model="patternLength">
            <option value="16">16</option>
            <option value="32">32</option>
            <option value="64">64</option>
            <option value="128">128</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PianoRoll } from "./pianoroll";
var piano: PianoRoll;
import * as mml from "../model/mml";
import * as mml2smf from "mml2smf";
import * as download from "../model/download";
import * as firebase from "firebase";

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
var auth: any;
var ref: any;

export default {
  data() {
    return {
      source: "",
      isMenuVisible: false,
      isExportDialogVisible: false,
      patternLength: "32",
      user: {},
      posts: []
    };
  },
  computed: {
    postsRev() {
      return this.posts.reverse();
    }
  },
  filters: {
    ymd(input) {
      var d = new Date(input);
      return `${d.getMonth() + 1}/${d.getDate()} ${("00" + d.getHours()).slice(
        -2
      )}:${("00" + d.getMinutes()).slice(-2)}`;
    }
  },
  mounted() {
    var config = {
      apiKey: "AIzaSyDSRghf9YylJhXTABL7GuTTxB5vsxWQrzA",
      authDomain: "minroll-online.firebaseapp.com",
      databaseURL: "https://minroll-online.firebaseio.com",
      projectId: "minroll-online",
      storageBucket: "",
      messagingSenderId: "1098262027992"
    };
    firebase.initializeApp(config);

    var el: HTMLCanvasElement = <HTMLCanvasElement>(
      document.querySelector(".canvas")
    );
    piano = new PianoRoll({
      el: el,
      notes: [],
      patternLength: 32
    });
    piano.draw();

    this.auth = firebase.auth();
    this.ref = firebase.database().ref("posts");
    this.auth.onAuthStateChanged((user: FirebaseUser) => {
      this.user = user;
    });
    this.ref.off();
    this.ref.limitToLast(30).on("child_added", (item: FirebaseItem) => {
      this.posts.push(item);
    });
  },
  watch: {
    patternLength(value: string) {
      console.log(value);
      piano.patternLength = parseInt(value);
      console.log("piano.patternLength", piano.patternLength);
    }
  },
  methods: {
    exportJson(e: MouseEvent) {
      this.hideMenu();
      this.isExportDialogVisible = true;
      this.source = JSON.stringify(piano.notes, null, 2);
    },
    exportMml(e: MouseEvent) {
      this.hideMenu();
      this.isExportDialogVisible = true;
      this.source = mml.jsonToMML(piano.notes).join(";\n");
    },
    exportSmf() {
      //現在、ch1のみ。ボリューム指定は0-15を0-127に変換する必要があるが、対数にすべきか不明なのでとりあえず固定値にした
      let binary = mml2smf.default(
        mml
          .jsonToMML(piano.notes)
          .map(line => "C1" + line)
          .join(";\n")
          .replace(/v10/g, "v80")
      );
      download.downloadBlob(binary, "minroll.mid", "application/octet-stream");
    },
    play() {
      togglePlaying();
    },
    hideMenu() {
      this.isMenuVisible = false;
      this.isExportDialogVisible = false;
    },
    showMenu() {
      this.isMenuVisible = true;
      this.isExportDialogVisible = false;
    },
    login() {
      this.auth.signInWithPopup(new firebase.auth.TwitterAuthProvider());
    },
    logout() {
      this.auth.signOut();
    },
    save() {
      var currentUser = this.auth.currentUser;
      var item: FirebaseItemBody = {
        author: {
          uid: this.auth.currentUser.uid,
          full_name: this.auth.currentUser.displayName
        },
        data: JSON.stringify(piano.notes),
        patternLength: this.patternLength,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      };
      this.ref.push(item).then(() => {
        console.log("Done");
      });
    },
    remove(post: FirebaseItem) {
      this.ref.child(post.key).remove();
      window.location.reload();
    },
    load(post: FirebaseItem) {
      var p = post.val();
      this.notes = JSON.parse(p.data);
      this.patternLength = p.patternLength;
      piano.notes = this.notes;
      piano.patternLength = this.patternLength;
      piano.draw();
    }
  }
};

export class FirebaseItemBody {
  author: {
    uid: string;
    full_name: string;
  };
  timestamp: Object;
  data: string;
  patternLength: number;
}
interface FirebaseItemValue {
  (): FirebaseItemBody;
}
export class FirebaseItem {
  key: string;
  val: FirebaseItemValue;
}

interface OnAuthStateChangedCallback {
  (user: FirebaseUser): void;
}
export class FirebaseUser {
  photoURL: string;
  displayName: string;
}
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
  background: #ffffff;
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
  display: flex;
}

.editor__left {
  width: 15rem;
  min-width: 15rem;
}
.editor__right {
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
  height: 300px;
}

.experimental {
  margin: 2rem;
  background: #666;
}

.editor__save {
  /* line-height: 2rem; */
  border: 1px solid white;
  margin: 0.4rem;
  padding: 0.5rem;
  border-radius: 0.2rem;
  text-align: center;
  cursor: pointer;
}
.editor__save:hover {
  background: #666;
}

.item {
  cursor: pointer;
  padding: 0 0.5rem;
  line-height: 2rem;
  font-size: 0.75rem;
  border-bottom: 1px solid #666;
}

.item:hover {
  background: #666;
}

.menu__inactive {
  padding: 0 1rem;
}
.menu__inline {
  padding: 0.5rem;
}
</style>
