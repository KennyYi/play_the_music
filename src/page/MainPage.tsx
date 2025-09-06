import React, { useCallback, useEffect, useRef, useState } from "react";

import { Application } from "pixi.js";

import { SettingsIcon } from "lucide-react";

import logo from "@/assets/logo.png";
import { GenreEntry, GenreScriptFetcher } from "@/lib/GenreFetcher";
import { formatDuration, pickRandom } from "@/lib/utils";
import { useMusic } from "@/context/MusicContext";
import MusicController from "@/components/ui/musicController";
import { GameBoard } from "./GameBoard";
import { ControlButton } from "@/components/ui/ControlButton";

const MainPage: React.FC = () => {
  const {
    fetchMusic,
    play,
    pause,
    stop,
    isPlaying,
    skipBack,
    skipForward,
    track,
    currentTime,
    duration,
    audioRef,
  } = useMusic();
  const [genres, setGenres] = useState<GenreEntry[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const appRef = useRef<Application | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const fetcher = new GenreScriptFetcher();
    fetcher.fetch().then((data) => {
      if (data.length > 0) {
        setGenres(data);
      }
    });
  }, []);

  const handleRandomPlay = useCallback(async () => {
    const randomGenre = pickRandom(genres);
    if (randomGenre) {
      const music = pickRandom(randomGenre.songs);
      if (music) {
        if (isPlaying) {
          stop();
        }
        setIsFetching(true);
        await fetchMusic(music.id).then(() => play());
        setIsFetching(false);
      }
    }
  }, [genres, isPlaying, stop, play, setIsFetching]);

  useEffect(() => {
    const initializeApp = async () => {
      const app = new Application();
      await app.init({ background: "white" });

      appRef.current = app;
      setIsAppReady(true);
    };

    initializeApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
      setIsAppReady(false);
    };
  }, []);

  return (
    <div className="items-center flex flex-col gap-10">
      <div className="flex flex-row w-full items-center gap-4">
        <img src={logo} className="h-16" />
        <div className="flex-1 items-center justify-center flex">
          <MusicController
            isPlaying={isPlaying ?? false}
            disabled={!track || isFetching}
            loading={isFetching}
            pickRandomMusic={handleRandomPlay}
            pause={pause}
            play={play}
            stop={stop}
            skipBack={skipBack}
            skipForward={skipForward}
          />
        </div>
        <div>
          <ControlButton onClick={() => {}} icon={<SettingsIcon />} />
        </div>
      </div>
      {audioRef && isAppReady && (
        <GameBoard appRef={appRef} audioRef={audioRef} latency={0} />
      )}
    </div>
  );
};

export default MainPage;
