export interface AnalyzeRequest {
  type: "analyze";
  samples: Float32Array;
  sampleRate: number;
}

export interface AnalysisResult {
  type: "analysisResult";
  rms: number;
  waveform: Float32Array;
  tempo: number;
  spectral: {
    centroid: number;
    rolloff: number;
  };
}

export type AnalysisWorkerRequest = AnalyzeRequest;
export type AnalysisWorkerResponse = AnalysisResult;
