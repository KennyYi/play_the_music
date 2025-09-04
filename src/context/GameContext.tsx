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
  laneKeys: string[];
  setLaneKeys: (keyset: string[]) => void;
  score: number | null;
  setScore: (score: number | null) => void;
}

const GameContext = createContext<GameContextType>({
  level: Difficulty.Easy,
  setLevel: () => {},
  laneKeys: DEFAULT_KEYSET[Difficulty.Easy],
  setLaneKeys: () => {},
  score: null,
  setScore: () => {},
});

export function useGame(): GameContextType {
  return useContext(GameContext);
}

export const GameContextProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [level, setLevel] = useState<Difficulty>(Difficulty.Easy);
  const [laneKeys, setLaneKeys] = useState<string[]>(
    DEFAULT_KEYSET[Difficulty.Easy]
  );
  const [score, setScore] = useState<number | null>(null);

  return (
    <GameContext.Provider
      value={{ level, setLevel, laneKeys, setLaneKeys, score, setScore }}
    >
      {children}
    </GameContext.Provider>
  );
};
