import { useCallback, useEffect, useState } from "react";

import { Dice4Icon, Dice5Icon, Dice6Icon } from "lucide-react";
import React from "react";
import { GenreEntry, GenreScriptFetcher } from "@/lib/GenreFetcher";
import { Button } from "@/components/ui/button";
import { pickRandom } from "@/lib/utils";
import { useMusic } from "@/context/MusicContext";
import MusicController from "@/components/ui/musicController";

const SelectPage: React.FC = () => {
  const { track, fetchMusic, play, pause, stop, isPlaying } = useMusic();

  const [genres, setGenres] = useState<GenreEntry[]>([]);

  useEffect(() => {
    const fetcher = new GenreScriptFetcher();
    fetcher.fetch().then((data) => {
      if (data.length > 0) {
        setGenres(data);
      }
    });
  }, []);

  const handleGenreChange = useCallback(async (genre: GenreEntry) => {
    const music = pickRandom(genre.songs);
    if (music) {
      await fetchMusic(music.id);
    }
  }, []);

  return (
    <div className="p-6 items-center justify-center flex flex-col gap-10">
      <div className="flex flex-col flex-1 gap-2">
        <div className="text-lg text-gray-500">Play random music</div>
        <div className="w-inherit justify-items-center">
          <Button
            onClick={() => {
              if (genres.length > 0) {
                const randomGenre = pickRandom(genres);
                if (randomGenre) handleGenreChange(randomGenre);
              }
            }}
          >
            <Dice6Icon />
            <Dice4Icon />
            <Dice5Icon />
          </Button>
        </div>
      </div>
      {track && (
        <MusicController
          isPlaying={isPlaying ?? false}
          pause={pause}
          play={play}
          stop={stop}
          skipBack={() => {}}
          skipForward={() => {}}
        />
      )}
    </div>
  );
};

export default SelectPage;
