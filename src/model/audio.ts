const audioContext = new AudioContext();
import * as util from "../util/util";

export function playNote(noteNumber: number, length: number) {
  const osc1 = audioContext.createOscillator();
  const amp = audioContext.createGain();
  const release = 0.05;
  osc1.frequency.value = util.mtof(noteNumber);
  osc1.connect(amp);
  amp.gain.value = 0.1;
  osc1.start();
  amp.connect(audioContext.destination);
  setTimeout(function() {
    const now = audioContext.currentTime;
    amp.gain.setValueAtTime(amp.gain.value, now);
    amp.gain.linearRampToValueAtTime(0, now + release);
    //osc1.disconnect();
    osc1.stop(now + release);
  }, length);
}
