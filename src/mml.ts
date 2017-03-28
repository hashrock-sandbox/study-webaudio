import { Note } from "./note"

export function toNoteName(index: number) {
  if (index < 0 || index > 11) {
    console.error("invalid note index")
    return null
  }
  return [
    "c", "d-", "d", "e-", "e", "f", "g-", "g", "a-", "a", "b-", "b"
  ][index]
}

export function noteToNote(note: Note) {
  let oct = Math.floor(note.no / 12) + 3
  let cde = toNoteName(note.no % 12)

  let lengthRemain = note.length
  let lengthArray = []
  while (lengthRemain > 0) {
    if (lengthRemain >= 16) {
      lengthRemain -= 16
      lengthArray.push("1")
      continue
    }
    if (lengthRemain >= 8) {
      lengthRemain -= 8
      lengthArray.push("2")
      continue
    }
    if (lengthRemain >= 4) {
      lengthRemain -= 4
      lengthArray.push("4")
      continue
    }
    if (lengthRemain >= 2) {
      lengthRemain -= 2
      lengthArray.push("8")
      continue
    }
    if (lengthRemain >= 1) {
      lengthRemain -= 1
      lengthArray.push("16")
      continue
    }
  }
  return `o${oct}${cde}${lengthArray.join("^")}`
}

export function jsonToMML(notes: Note[]) {
  let remainNotes = [...notes];
  let mmls: string[] = []

  let mml = "l16"

  //変換戦略：
  //1ステップずつノートがあるか見ていき、マッチしたノートをMMLに詰めて配列から削除し、発音長だけ飛ばす。
  //48ステップの走査終了後、まだノートが残っているようならもう一度走査。
  //最終的に同時発音数分のトラックが生成される。
  while (remainNotes.length > 0) {
    let i = 0;
    while (i < 48) {
      // 頭から走査する
      // find使いたい…
      let matchedIndex = -1;
      for (let j = 0; j < remainNotes.length; j++) {
        if (remainNotes[j].start === i) {
          matchedIndex = j
          break
        }
      }
      if (matchedIndex !== -1) {
        console.log(matchedIndex + " found")
        //マッチした要素を削除
        mml += noteToNote(remainNotes[matchedIndex])
        i += remainNotes[matchedIndex].length
        remainNotes.splice(matchedIndex, 1)
      } else {
        //なにもマッチしなかったので休符
        mml += "r"
        i += 1
      }
    }

    console.log(remainNotes)
    //まだNoteが残っているようなら、また最初から
    i = 0;
    mmls.push(mml)
    mml = ""
  }

  return mmls
}