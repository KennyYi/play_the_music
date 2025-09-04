import { useCallback, useEffect, useState } from "react";

import React from "react";
import { GenreEntry, GenreScriptFetcher } from "@/lib/GenreFetcher";
import { pickRandom } from "@/lib/utils";
import { useMusic } from "@/context/MusicContext";
import MusicController from "@/components/ui/musicController";

const SelectPage: React.FC = () => {
  const { fetchMusic, play, pause, stop, isPlaying, skipBack, skipForward } =
    useMusic();
  const [genres, setGenres] = useState<GenreEntry[]>([]);
  const [isFetching, setIsFetching] = useState(false);

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

  return (
    <div className="p-6 items-center justify-center flex flex-col gap-10">
      <MusicController
        isPlaying={isPlaying ?? false}
        disabled={isFetching}
        random={handleRandomPlay}
        pause={pause}
        play={play}
        stop={stop}
        skipBack={skipBack}
        skipForward={skipForward}
      />
    </div>
  );
};

export default SelectPage;
