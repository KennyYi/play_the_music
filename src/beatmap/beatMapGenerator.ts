// @ts-ignore - TypeScript resolves this import during build
import { Difficulty } from "@/lib/types";
import { detectBeats, mapBeatsToLanes, applyOffset } from "./beatMapDetector";
import type { BeatMap } from "./beatMapSchema";

/**
 * Generate a BeatMap from raw PCM samples.
 * @param samples PCM samples from a single channel.
 * @param sampleRate Sample rate of the audio.
 * @param offset Optional offset in seconds to align notes.
 */
export function generateBeatMap(
  samples: Float32Array,
  sampleRate: number,
  level: Difficulty,
  offset = 0,
  rng: () => number = Math.random
): BeatMap {
  const numberOfLanes = level === Difficulty.Hard ? 6 : 4;
  // const start = performance.now();
  const beats = detectBeats(samples, sampleRate);
  const notes = applyOffset(mapBeatsToLanes(beats, numberOfLanes, rng), offset);
  // const elapsed = performance.now() - start;
  return { version: 1, offset, notes };
}

export interface BeatMapVariations {
  easy: BeatMap;
  normal: BeatMap;
  hard: BeatMap;
}

/**
 * Generate easy, normal, and hard beat-map variations from raw samples.
 * The easy chart keeps every other beat, while the hard chart inserts
 * additional notes halfway between detected beats.
 */
export function generateBeatMapVariations(
  samples: Float32Array,
  sampleRate: number,
  level: Difficulty,
  offset = 0,
  rng: () => number = Math.random
): BeatMapVariations {
  const beats = detectBeats(samples, sampleRate);

  const numberOfLanes = level === Difficulty.Hard ? 6 : 4;

  const normal = applyOffset(
    mapBeatsToLanes(beats, numberOfLanes, rng),
    offset
  );

  const easyBeats: number[] = beats.filter(
    (_: number, i: number) => i % 2 === 0
  );
  const easy = applyOffset(
    mapBeatsToLanes(easyBeats, numberOfLanes, rng),
    offset
  );

  const hardBeats = [...beats];
  for (let i = 0; i < beats.length - 1; i++) {
    hardBeats.push((beats[i] + beats[i + 1]) / 2);
  }
  hardBeats.sort((a, b) => a - b);
  const hard = applyOffset(
    mapBeatsToLanes(hardBeats, numberOfLanes, rng),
    offset
  );

  return {
    easy: { version: 1, offset, notes: easy },
    normal: { version: 1, offset, notes: normal },
    hard: { version: 1, offset, notes: hard },
  };
}
