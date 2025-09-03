import { Difficulty } from "@/lib/types";
import React, { createContext, useContext, useState } from "react";

export const DEFAULT_KEYSET = {
  [Difficulty.Easy]: ["A", "S", "D", "F"],
  [Difficulty.Normal]: ["A", "S", "D", "F"],
  [Difficulty.Hard]: ["A", "S", "D", "F", "J", "K", "L", ";"],
};

interface GameContextType {
  level: Difficulty;
  setLevel: (level: Difficulty) => void;
  keyset: string[];
  setKeyset: (keyset: string[]) => void;
}

const GameContext = createContext<GameContextType>({
  level: Difficulty.Easy,
  setLevel: () => {},
  keyset: DEFAULT_KEYSET[Difficulty.Easy],
  setKeyset: () => {},
});

export function useGame(): GameContextType {
  return useContext(GameContext);
}

export const GameContextProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [level, setLevel] = useState<Difficulty>(Difficulty.Easy);
  const [keyset, setKeyset] = useState<string[]>(
    DEFAULT_KEYSET[Difficulty.Easy]
  );

  return (
    <GameContext.Provider value={{ level, setLevel, keyset, setKeyset }}>
      {children}
    </GameContext.Provider>
  );
};
