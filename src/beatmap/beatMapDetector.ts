import type { BeatNote, Lane } from "./beatMapSchema";

export function detectBeats(
  samples: Float32Array,
  sampleRate: number
): number[] {
  const threshold = 0.3;
  const minInterval = sampleRate * 0.2; // 200ms between beats
  const beats: number[] = [];
  let prevAbove = false;
  let lastBeatSample = -Infinity;
  for (let i = 0; i < samples.length; i++) {
    const val = Math.abs(samples[i]);
    const above = val > threshold;
    if (above && !prevAbove && i - lastBeatSample >= minInterval) {
      beats.push(i / sampleRate);
      lastBeatSample = i;
    }
    prevAbove = above;
  }
  return beats;
}

export function mapBeatsToLanes(
  beats: number[],
  numberOfLanes: number,
  rng: () => number = Math.random
): BeatNote[] {
  return beats.map((time) => ({
    time,
    lane: Math.floor(rng() * numberOfLanes) as Lane,
  }));
}

export function applyOffset(notes: BeatNote[], offset: number): BeatNote[] {
  return notes.map((note) => ({ ...note, time: note.time + offset }));
}
