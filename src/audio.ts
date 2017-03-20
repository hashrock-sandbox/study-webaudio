var audioContext = new AudioContext();
import * as util from "./util"

export function playNote(noteNumber: number, length: number){
  var osc1 = audioContext.createOscillator();
  var amp = audioContext.createGain();
  osc1.frequency.value = util.mtof(noteNumber);
  osc1.connect(amp);
  amp.gain.value = 0.1;
  osc1.start();
  amp.connect(audioContext.destination);
  setTimeout(function () {
    osc1.disconnect();
  }, length);
}