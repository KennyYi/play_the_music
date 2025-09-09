import type {
  AnalyzeRequest,
  AnalysisResult,
  AnalysisWorkerResponse,
} from "./analysisMessage";
import type { BeatMapVariations } from "../beatmap/beatMapGenerator";

import { generateBeatMapVariations } from "../beatmap/beatMapGenerator";

import {
  saveBeatMap,
  saveAnalysisResult,
  loadAnalysisResult,
} from "../beatmap/beatMapStorage";
import { Difficulty } from "@/lib/types";

export const analysisSupported =
  typeof Worker !== "undefined" &&
  typeof WebAssembly !== "undefined" &&
  typeof SharedArrayBuffer !== "undefined";

export async function loadAnalyzers() {
  if (!analysisSupported) return;
  await Promise.all([import("meyda"), import("essentia.js")]);
}

let analysisWorker: Worker | null = null;

function getAnalysisWorker() {
  if (!analysisWorker) {
    analysisWorker = new Worker(
      new URL("./analysisWorker.ts", import.meta.url),
      { type: "module" }
    );
  }
  return analysisWorker;
}

export async function analyzeFile(
  file: File,
  level: Difficulty
): Promise<AnalysisResult & { beatMaps: BeatMapVariations }> {
  const id = `${file.name}-${file.size}-${file.lastModified}`;
  const cached = await loadAnalysisResult(id);
  if (cached) return cached;

  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const channelData = audioBuffer.getChannelData(0);
  const beatMaps = generateBeatMapVariations(
    channelData,
    audioBuffer.sampleRate,
    level
  );

  if (!analysisSupported) {
    const rms = computeRms(channelData);
    const waveform = downsample(channelData, 1000);
    const result: AnalysisResult & { beatMaps: BeatMapVariations } = {
      type: "analysisResult",
      rms,
      waveform,
      tempo: 0,
      spectral: { centroid: 0, rolloff: 0 },
      beatMaps,
    };
    await Promise.all([
      saveAnalysisResult(id, result),
      saveBeatMap(`${id}-easy`, beatMaps.easy),
      saveBeatMap(`${id}-normal`, beatMaps.normal),
      saveBeatMap(`${id}-hard`, beatMaps.hard),
    ]);
    return result;
  }

  const sharedBuffer = new SharedArrayBuffer(channelData.byteLength);
  const sharedArray = new Float32Array(sharedBuffer);
  sharedArray.set(channelData);
  const worker = getAnalysisWorker();
  const startTime = performance.now();
  return new Promise<AnalysisResult & { beatMaps: BeatMapVariations }>(
    (resolve, reject) => {
      const handleMessage = (event: MessageEvent<AnalysisWorkerResponse>) => {
        if (event.data.type !== "analysisResult") return;
        worker.removeEventListener("message", handleMessage);
        const elapsed = performance.now() - startTime;
        if (elapsed > 2500) {
          console.warn(
            `Analysis exceeded 2.5 s target by ${(elapsed - 2500).toFixed(
              0
            )} ms`
          );
        }
        const result: AnalysisResult & { beatMaps: BeatMapVariations } = {
          ...event.data,
          beatMaps,
        };
        Promise.all([
          saveAnalysisResult(id, result),
          saveBeatMap(`${id}-easy`, beatMaps.easy),
          saveBeatMap(`${id}-normal`, beatMaps.normal),
          saveBeatMap(`${id}-hard`, beatMaps.hard),
        ]).then(() => resolve(result));
      };
      const handleError = (event: ErrorEvent) => {
        worker.removeEventListener("error", handleError);
        reject(event);
      };
      const message: AnalyzeRequest = {
        type: "analyze",
        samples: sharedArray,
        sampleRate: audioBuffer.sampleRate,
      };
      worker.addEventListener("message", handleMessage);
      worker.addEventListener("error", handleError);
      worker.postMessage(message);
    }
  );
}

export function computeRms(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    sum += v * v;
  }
  return Math.sqrt(sum / samples.length);
}

export function downsample(
  samples: Float32Array,
  points: number
): Float32Array {
  const blockSize = Math.floor(samples.length / points);
  const waveform = new Float32Array(points);
  for (let i = 0; i < points; i++) {
    waveform[i] = samples[i * blockSize] || 0;
  }
  return waveform;
}
