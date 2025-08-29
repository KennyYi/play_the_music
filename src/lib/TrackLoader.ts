import { extractCoverArt } from "@/utils/extractCoverArt";
import { Track } from "./types";

export async function loadTrack(musicFile: File): Promise<Track> {
  const url = URL.createObjectURL(musicFile);

  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result as string;
    console.log("Data URL:", dataUrl);
  };
  reader.readAsDataURL(musicFile);
  const coverArtUrl = await extractCoverArt(musicFile);

  // TODO

  console.log("Audio URL:", url);
  console.log("File Name:", musicFile.name);
  console.log("Cover Art URL:", coverArtUrl);

  return Promise.resolve({
    audioUrl: url,
    fileName: musicFile.name,
    coverArtUrl: coverArtUrl,
  });
}
