import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dice4Icon, Dice5Icon, Dice6Icon } from "lucide-react";
import React from "react";
import { GenreEntry, GenreScriptFetcher } from "@/lib/GenreFetcher";
import { Button } from "@/components/ui/button";
import { pickRandom } from "@/lib/utils";
import { useMusic } from "@/context/MusicContext";

const SelectPage: React.FC = () => {
  const { fetchMusic } = useMusic();

  const [genres, setGenres] = useState<GenreEntry[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<GenreEntry | undefined>();

  useEffect(() => {
    const fetcher = new GenreScriptFetcher();
    fetcher.fetch().then((data) => {
      if (data.length > 0) {
        setGenres(data);
      }
    });
  }, []);

  const handleGenreChange = useCallback(
    async (genre: GenreEntry) => {
      setSelectedGenre(genre);
      const music = pickRandom(genre.songs);
      if (music) {
        await fetchMusic(music.id);
      }
    },
    [setSelectedGenre]
  );

  return (
    <div className="p-6 items-center justify-center flex flex-col">
      <div className="flex flex-row gap-4 w-full justify-items-end">
        <div className="flex-1 justify-items-end">
          <Select
            value={selectedGenre?.genre ?? ""}
            onValueChange={(value) => {
              const selected = genres.find((genre) => genre.genre === value);
              if (selected) handleGenreChange(selected);
            }}
          >
            <div className="flex flex-col gap-2 items-start">
              <div className="text-lg text-gray-500">Select a genre</div>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a music genre" />
              </SelectTrigger>
            </div>
            <SelectContent>
              <SelectGroup>
                {genres.map((genre) => (
                  <SelectItem key={genre.genre} value={genre.genre}>
                    {genre.genre}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="w-[1px] h-8 bg-gray-300" />
          <div className="text-lg">or</div>
          <div className="w-[1px] h-10 bg-gray-300" />
        </div>
        <div className="flex flex-col flex-1 gap-2 items-start justify-items-start">
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
        </div>
      </div>
    </div>
  );
};

export default SelectPage;
