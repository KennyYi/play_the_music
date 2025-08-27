import { Track } from "./types";

export function loadTrack(musicFile: File): Promise<Track> {
  const url = URL.createObjectURL(musicFile);

  // TODO

  return Promise.resolve({
    audioUrl: url,
    title: musicFile.name,
  });
}
