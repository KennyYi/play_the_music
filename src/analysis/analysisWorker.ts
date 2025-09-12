import Meyda from "meyda";
import type {
  AnalyzeRequest,
  AnalysisResult,
  AnalysisWorkerRequest,
} from "./analysisMessage";
import { estimateTempo } from "./tempo";

self.onmessage = (e: MessageEvent<AnalysisWorkerRequest>) => {
  const message = e.data;
  if (message.type !== "analyze") return;

  const { samples, sampleRate } = message as AnalyzeRequest;

  // configure Meyda for spectral feature extraction
  const bufferSize = 2048;
  Meyda.sampleRate = sampleRate;
  Meyda.bufferSize = bufferSize;

  const spectral = computeSpectralFeatures(samples, bufferSize);
  const rms = computeRms(samples);
  const tempo = estimateTempo(samples, sampleRate);
  const waveform = downsample(samples, 1000);

  const result: AnalysisResult = {
    type: "analysisResult",
    rms,
    waveform,
    tempo,
    spectral,
  };
  self.postMessage(result);
};

function computeRms(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    sum += v * v;
  }
  return Math.sqrt(sum / samples.length);
}

function downsample(samples: Float32Array, points: number): Float32Array {
  const blockSize = Math.floor(samples.length / points);
  const waveform = new Float32Array(points);
  for (let i = 0; i < points; i++) {
    waveform[i] = samples[i * blockSize] || 0;
  }
  return waveform;
}

function computeSpectralFeatures(
  samples: Float32Array,
  bufferSize: number
): { centroid: number; rolloff: number } {
  let centroidSum = 0;
  let rolloffSum = 0;
  let frames = 0;
  for (let i = 0; i + bufferSize <= samples.length; i += bufferSize) {
    const frame = samples.subarray(i, i + bufferSize);
    const features = Meyda.extract(
      ["spectralCentroid", "spectralRolloff"],
      frame
    );
    if (features) {
      if (typeof features.spectralCentroid === "number") {
        centroidSum += features.spectralCentroid;
      }
      if (typeof features.spectralRolloff === "number") {
        rolloffSum += features.spectralRolloff;
      }
      frames++;
    }
  }
  return {
    centroid: frames ? centroidSum / frames : 0,
    rolloff: frames ? rolloffSum / frames : 0,
  };
}

export {};
