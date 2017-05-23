var audioContext = new AudioContext();
import * as util from "./util"
declare const MIDI:any

MIDI.loadPlugin({
  instrument: "electric_piano_1",
  onsuccess: function () {
    MIDI.setEffects([
      {
        type: "Tremolo",
        intensity: 0.9,    //0 to 1
        rate: 4,         //0.001 to 8
        stereoPhase: 90,    //0 to 180
        bypass: 0
      }
    ]);

    MIDI.programChange(0, 4, 0)
    MIDI.setVolume(0, 127);
  }
});

export function playNote(noteNumber: number, length: number) {
  MIDI.noteOn(0, noteNumber, 100, 0);
  setTimeout(function () {
    MIDI.noteOff(0, noteNumber, 0);
  }, length);
  /*
  var osc1 = audioContext.createOscillator();
  var amp = audioContext.createGain();
  var release = 0.05;
  osc1.frequency.value = util.mtof(noteNumber);
  osc1.connect(amp);
  amp.gain.value = 0.1;
  osc1.start();
  amp.connect(audioContext.destination);
  setTimeout(function () {
    var now = audioContext.currentTime;
    amp.gain.setValueAtTime(amp.gain.value, now);
    amp.gain.linearRampToValueAtTime(0, now + release);
    //osc1.disconnect();
    osc1.stop(now + release);
  }, length);
  */
}