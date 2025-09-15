import { AnalysisResult } from "@/analysis/analysisMessage";
import { BeatMapVariations } from "@/beatmap/beatMapGenerator";

export enum Difficulty {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
}

export interface Track {
  audioUrl: string;
  fileName: string;
  coverArtUrl: string | null;
  waveFormData?: Float32Array;
  analysisResult?: AnalysisResult;
  beatMaps?: BeatMapVariations;
}

export enum GameStatus {
  Stop = "stop",
  Playing = "playing",
  Pause = "pause",
  Ready = "ready",
}
