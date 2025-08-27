import { loadTrack } from "@/lib/TrackLoader";
import { Track } from "@/lib/types";
import React, { createContext, useCallback, useContext, useState } from "react";

interface MusicContextType {
  fetchMusic: (musicId: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  onPlaybackStatusChange: (callback: (isPlaying: boolean) => void) => void;
  onMusicEnd: (callback: () => void) => void;
  volume: number;
  setVolume: (volume: number) => void;
  mute: () => void;
}

const MusicContext = createContext<MusicContextType>({
  fetchMusic: async () => {},
  play: () => {},
  pause: () => {},
  stop: () => {},
  onPlaybackStatusChange: () => {},
  onMusicEnd: () => {},
  volume: 1.0,
  setVolume: () => {},
  mute: () => {},
});

export function useMusic(): MusicContextType {
  return useContext(MusicContext);
}

export const MusicContextProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [volume, setVolume] = useState(1.0);
  const [track, setTrack] = useState<Track | null>(null);

  const handleMusicFetch = useCallback(async (id: string) => {
    try {
      const response = await fetch(`https://cdn1.suno.ai/${id}.mp3`);
      if (!response.ok) throw new Error("Failed to fetch Suno track");
      const blob = await response.blob();
      const file = new File([blob], `${id}.mp3`, { type: "audio/mpeg" });
      await loadTrack(file).then((loadedTrack) => {
        setTrack(loadedTrack);
      });
    } catch (err) {
      console.error("Failed to load Suno track", err);
    }
  }, []);

  return (
    <MusicContext.Provider
      value={
        {
          fetchMusic: handleMusicFetch,
          play: () => {},
          pause: () => {},
          stop: () => {},
          onPlaybackStatusChange: () => {},
          onMusicEnd: () => {},
          volume,
          setVolume,
          mute: () => setVolume(0),
        } as MusicContextType
      }
    >
      {children}
    </MusicContext.Provider>
  );
};
