var audioContext = new AudioContext();
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
}