import { Note } from "./model/note"
import * as mml from "./model/mml"

let cmajor = [
  {
    "ch": 1,
    "no": 0,
    "start": 0,
    "length": 8
  },
  {
    "ch": 1,
    "no": 4,
    "start": 0,
    "length": 8
  },
  {
    "ch": 1,
    "no": 7,
    "start": 0,
    "length": 8
  }
]

console.log(cmajor)

let o3c2 = {
  "ch": 1,
  "no": 0,
  "start": 0,
  "length": 8
}

if (mml.noteToNote(o3c2) === "o3c2") {
  console.log("o");
} else {
  console.error("MML Conversion Fail!");
  console.error(mml.noteToNote(o3c2))
}

console.log(mml.jsonToMML(cmajor))