import Instruments from 'webaudio-instruments'
var player = new Instruments()

var audioContext = new AudioContext();

export function playNote(noteNumber: number, length: number) {
  player.play(
    24,        // instrument: 24 is "Acoustic Guitar (nylon)" 
    noteNumber,        // note: midi number or frequency in Hz (if > 127) 
    0.5,       // velocity: 0..1 
    0,         // delay in seconds 
    length / 1000,       // duration in seconds 
    0,         // (optional - specify channel for tinysynth to use) 
    0.05       // (optional - override envelope "attack" parameter) 
  )
}