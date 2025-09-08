import { loadTrack } from "@/lib/TrackLoader";
import { Track } from "@/lib/types";
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { useGame } from "./GameContext";

interface MusicContextType {
  track: Track | null;
  fetchMusic: (musicId: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  skipBack: () => void;
  skipForward: () => void;
  onPlaybackStatusChange: (callback: (isPlaying: boolean) => void) => void;
  onMusicEnd: (callback: () => void) => void;
  volume: number;
  setVolume: (volume: number) => void;
  mute: () => void;
  isPlaying?: boolean;
  duration: number;
  currentTime: number;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

const MusicContext = createContext<MusicContextType>({
  track: null,
  fetchMusic: async () => {},
  play: () => {},
  pause: () => {},
  stop: () => {},
  skipBack: () => {},
  skipForward: () => {},
  onPlaybackStatusChange: () => {},
  onMusicEnd: () => {},
  volume: 1.0,
  setVolume: () => {},
  mute: () => {},
  duration: 0,
  currentTime: 0,
});

export function useMusic(): MusicContextType {
  return useContext(MusicContext);
}

export const MusicContextProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [volume, setVolume] = useState(1.0);
  const [track, setTrack] = useState<Track | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const { level } = useGame();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    if (!audioCtxRef.current) {
      const context = new AudioContext();
      const source = context.createMediaElementSource(audio);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(context.destination);
      audioCtxRef.current = context;
      analyserRef.current = analyser;
    }
  }, [track]);

  const handleMusicFetch = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`https://cdn1.suno.ai/${id}.mp3`);
        if (!response.ok) throw new Error("Failed to fetch Suno track");
        const blob = await response.blob();
        const file = new File([blob], `${id}.mp3`, { type: "audio/mpeg" });
        await loadTrack(file, level).then((loadedTrack) => {
          setTrack(loadedTrack);
        });
      } catch (err) {
        console.error("Failed to load Suno track", err);
      }
    },
    [level, setTrack]
  );

  const handleMetaDataLoaded = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, [setDuration]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [setCurrentTime]);

  const handleVolumeChange = useCallback(
    (volume: number) => {
      if (audioRef.current) {
        audioRef.current.volume = volume;
        setVolume(volume);
      }
    },
    [setVolume]
  );

  return (
    <MusicContext.Provider
      value={
        {
          track,
          fetchMusic: handleMusicFetch,
          play: () => {
            audioCtxRef.current?.resume();
            audioRef.current?.play();
          },
          pause: () => audioRef.current?.pause(),
          stop: () => {
            const audio = audioRef.current;
            if (audio) {
              audio.pause();
              audio.currentTime = 0;
            }
          },
          skipBack: () => {
            const audio = audioRef.current;
            if (audio) {
              audio.currentTime = Math.max(0, audio.currentTime - 10);
            }
          },
          skipForward: () => {
            const audio = audioRef.current;
            if (audio) {
              audio.currentTime = Math.min(
                audio.duration,
                audio.currentTime + 10
              );
            }
          },
          onPlaybackStatusChange: () => {},
          onMusicEnd: () => {},
          volume,
          setVolume: handleVolumeChange,
          mute: () => handleVolumeChange(0),
          isPlaying: !!(audioRef.current && !audioRef.current.paused),
          duration,
          currentTime,
          audioRef,
        } as MusicContextType
      }
    >
      {track && (
        <audio
          ref={audioRef}
          src={track.audioUrl}
          hidden
          onLoadedMetadata={handleMetaDataLoaded}
          onTimeUpdate={handleTimeUpdate}
        />
      )}
      {children}
    </MusicContext.Provider>
  );
};
