export enum Difficulty {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
}

export interface Track {
  audioUrl: string;
  fileName: string;
  coverArtUrl: string | null;
}
