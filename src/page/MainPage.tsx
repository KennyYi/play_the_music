import React, { useCallback, useEffect, useRef, useState } from "react";

import { Application } from "pixi.js";

import { SettingsIcon } from "lucide-react";

import logo from "@/assets/logo.png";
import { GenreEntry, GenreScriptFetcher } from "@/lib/GenreFetcher";
import { pickRandom } from "@/lib/utils";
import { useMusic } from "@/context/MusicContext";
import MusicController from "@/components/ui/musicController";
import { GameBoard } from "./GameBoard";
import { ControlButton } from "@/components/ui/ControlButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useGame } from "@/context/GameContext";
import { Difficulty } from "@/lib/types";
import { Input } from "@/components/ui/input";

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
    audioRef,
  } = useMusic();
  const { level, setLevel, laneKeys, setLaneKeys } = useGame();
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
          <Dialog>
            <DialogTrigger>
              <ControlButton onClick={() => {}} icon={<SettingsIcon />} />
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>Level</Label>
                  <Select
                    onValueChange={(value) => setLevel(value as Difficulty)}
                    value={level}
                  >
                    <SelectTrigger>{level}</SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value={Difficulty.Easy}>
                        {Difficulty.Easy}
                      </SelectItem>
                      <SelectItem value={Difficulty.Normal}>
                        {Difficulty.Normal}
                      </SelectItem>
                      <SelectItem value={Difficulty.Hard}>
                        {Difficulty.Hard}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Lane Keys</Label>
                  {laneKeys.map((key, index) => {
                    return (
                      <Input
                        key={index}
                        value={key}
                        onChange={(e) => {
                          const newKeys = [...laneKeys];
                          newKeys[index] = e.target.value
                            .toUpperCase()
                            .slice(-1);
                          setLaneKeys(newKeys);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {audioRef && isAppReady && (
        <GameBoard appRef={appRef} audioRef={audioRef} latency={0} />
      )}
    </div>
  );
};

export default MainPage;
