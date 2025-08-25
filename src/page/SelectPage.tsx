import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { GenreEntry, GenreScriptFetcher } from "@/lib/GenreFetcher";

const SelectPage: React.FC = () => {
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

  return (
    <div className="p-6 items-center justify-center flex flex-col">
      <Select
        value={selectedGenre?.genre ?? ""}
        onValueChange={(value) => {
          const selected = genres.find((genre) => genre.genre === value);
          if (selected) setSelectedGenre(selected);
        }}
      >
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a music genre" />
        </SelectTrigger>
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
  );
};

export default SelectPage;
