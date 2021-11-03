const b2t = (beats: number, tempo: number) => 60 / (beats * tempo);

const noteFrequency: Record<string, number> = {
  C0: 16.35,
  D0: 18.35,
  E0: 20.6,
  F0: 21.83,
  G0: 24.5,
  A0: 27.5,
  B0: 30.87,
  C1: 32.7,
  D1: 36.71,
  E1: 41.2,
  F1: 43.65,
  G1: 49,
  A1: 55,
  B1: 61.74,
  C2: 65.41,
  D2: 73.42,
  E2: 82.41,
  F2: 87.31,
  G2: 98,
  A2: 110,
  B2: 123.47,
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196,
  A3: 220,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392,
  A4: 440,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880,
  B5: 987.77,
  C6: 1046.5,
  D6: 1174.66,
  E6: 1318.51,
  F6: 1396.91,
  G6: 1567.98,
  A6: 1760,
  B6: 1975.53,
  C7: 2093,
  D7: 2349.32,
  E7: 2637.02,
  F7: 2793.83,
  G7: 3135.96,
  A7: 3520,
  B7: 3951.07,
  C8: 4186.01,
  D8: 4698.63,
  E8: 5274.04,
  F8: 5587.65,
  G8: 6271.93,
  A8: 7040,
  B8: 7902.13,
  Db0: 17.32,
  'C#0': 17.32,
  Eb0: 19.45,
  'D#0': 19.45,
  Gb0: 23.12,
  'F#0': 23.12,
  Ab0: 25.96,
  'G#0': 25.96,
  Bb0: 29.14,
  'A#0': 29.14,
  Db1: 34.65,
  'C#1': 34.65,
  Eb1: 38.89,
  'D#1': 38.89,
  Gb1: 46.25,
  'F#1': 46.25,
  Ab1: 51.91,
  'G#1': 51.91,
  Bb1: 58.27,
  'A#1': 58.27,
  Db2: 69.3,
  'C#2': 69.3,
  Eb2: 77.78,
  'D#2': 77.78,
  Gb2: 92.5,
  'F#2': 92.5,
  Ab2: 103.83,
  'G#2': 103.83,
  Bb2: 116.54,
  'A#2': 116.54,
  Db3: 138.59,
  'C#3': 138.59,
  Eb3: 155.56,
  'D#3': 155.56,
  Gb3: 185,
  'F#3': 185,
  Ab3: 207.65,
  'G#3': 207.65,
  Bb3: 233.08,
  'A#3': 233.08,
  Db4: 277.18,
  'C#4': 277.18,
  Eb4: 311.13,
  'D#4': 311.13,
  Gb4: 369.99,
  'F#4': 369.99,
  Ab4: 415.3,
  'G#4': 415.3,
  Bb4: 466.16,
  'A#4': 466.16,
  Db5: 554.37,
  'C#5': 554.37,
  Eb5: 622.25,
  'D#5': 622.25,
  Gb5: 739.99,
  'F#5': 739.99,
  Ab5: 830.61,
  'G#5': 830.61,
  Bb5: 932.33,
  'A#5': 932.33,
  Db6: 1108.73,
  'C#6': 1108.73,
  Eb6: 1244.51,
  'D#6': 1244.51,
  Gb6: 1479.98,
  'F#6': 1479.98,
  Ab6: 1661.22,
  'G#6': 1661.22,
  Bb6: 1864.66,
  'A#6': 1864.66,
  Db7: 2217.46,
  'C#7': 2217.46,
  Eb7: 2489.02,
  'D#7': 2489.02,
  Gb7: 2959.96,
  'F#7': 2959.96,
  Ab7: 3322.44,
  'G#7': 3322.44,
  Bb7: 3729.31,
  'A#7': 3729.31,
  Db8: 4434.92,
  'C#8': 4434.92,
  Eb8: 4978.03,
  'D#8': 4978.03,
  Gb8: 5919.91,
  'F#8': 5919.91,
  Ab8: 6644.88,
  'G#8': 6644.88,
  Bb8: 7458.62,
  'A#8': 7458.62,
};

type Key = string | number;

const toFreq = (key: Key = 0) =>
  typeof key === 'number'
    ? key
    : noteFrequency[`${key.slice(0, 1).toUpperCase()}${key.slice(1)}`] ?? 0;

function initNodes(
  type: PeriodicWave | Omit<OscillatorType, 'custom'>,
  outputNode: AudioNode,
  stopTime: number,
  resolve: () => void
) {
  const audioContext = outputNode.context;
  /* oscillator */
  const oscillator = audioContext.createOscillator();
  if (type instanceof PeriodicWave) {
    oscillator.setPeriodicWave(type);
  } else {
    oscillator.type = type as OscillatorType;
  }
  oscillator.start();
  oscillator.stop(stopTime);
  /* gain */
  const gain = audioContext.createGain();
  /* connect: oscillator -> gain -> outputNode */
  oscillator.connect(gain);
  gain.connect(outputNode);
  oscillator.onended = () => {
    gain.disconnect();
    oscillator.disconnect();
    resolve();
  };
  return { oscillator, gain };
}

function oscillate(
  oscillator: OscillatorNode,
  gain: GainNode,
  frequency: number,
  from: number,
  volume = 1,
  detune = 0
) {
  oscillator.frequency.setValueAtTime(frequency, from);
  oscillator.detune.setValueAtTime(detune, from);
  gain.gain.setValueAtTime(volume, from);
}

export namespace Chime {
  export function playNotes(
    notes: (
      | [Key, number]
      | [Key, number, number]
      | [Key, number, number, number]
    )[],
    tempo: number,
    type: PeriodicWave | Omit<OscillatorType, 'custom'>,
    outputNode: AudioNode
  ) {
    return new Promise<void>((resolve) => {
      if (!notes.length) return resolve();
      const { oscillator, gain } = initNodes(
        type,
        outputNode,
        notes.reduce((acc, [_, beats]) => acc + b2t(beats, tempo), 0),
        resolve
      );
      notes.reduce((from, [frequency, beats, volume, detune]) => {
        const to = from + b2t(beats, tempo);
        oscillate(oscillator, gain, toFreq(frequency), from, volume, detune);
        oscillate(oscillator, gain, 0, to, volume, detune);
        return to;
      }, 0);
    });
  }

  export function playData(
    data: (
      | [Key, number, number]
      | [Key, number, number, number]
      | [Key, number, number, number, number]
    )[],
    type: PeriodicWave | Omit<OscillatorType, 'custom'>,
    outputNode: AudioNode,
    absolute = false
  ) {
    return new Promise<void>((resolve) => {
      if (!data.length) return resolve();
      const { oscillator, gain } = initNodes(
        type,
        outputNode,
        Math.max(...data.map(([_, time]) => time)),
        resolve
      );
      data.forEach(
        ([frequency, startTime, durationOrEndTime, volume, detune]) => {
          oscillate(
            oscillator,
            gain,
            toFreq(frequency),
            startTime,
            volume,
            detune
          );
          oscillate(
            oscillator,
            gain,
            0,
            absolute ? durationOrEndTime : startTime + durationOrEndTime,
            volume,
            detune
          );
        }
      );
    });
  }
}
