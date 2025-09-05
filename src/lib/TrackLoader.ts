import { extractCoverArt } from "@/utils/extractCoverArt";
import { Track } from "./types";
import { analyzeFile } from "@/analysis/audioAnalysis";

export async function loadTrack(musicFile: File): Promise<Track> {
  const url = URL.createObjectURL(musicFile);

  const reader = new FileReader();
  reader.onload = () => console.log("File loaded");
  reader.readAsDataURL(musicFile);
  const coverArtUrl = await extractCoverArt(musicFile);
  const analysisResult = await analyzeFile(musicFile);

  return Promise.resolve({
    audioUrl: url,
    fileName: musicFile.name,
    coverArtUrl: coverArtUrl,
    analysisResult: analysisResult,
    beatMaps: analysisResult.beatMaps,
  });
}
