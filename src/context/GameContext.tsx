import { Difficulty } from "@/lib/types";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

export const DEFAULT_KEYSET = {
  [Difficulty.Easy]: ["A", "S", "D", "F"],
  [Difficulty.Normal]: ["A", "S", "D", "F"],
  [Difficulty.Hard]: ["A", "S", "D", "J", "K", "L"],
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
  const [laneKeyMap, setLaneKeyMap] =
    useState<{ [key in Difficulty]: string[] }>(DEFAULT_KEYSET);

  const [score, setScore] = useState<number | null>(null);

  const handleSetLaneKeys = useCallback(
    (keys: string[]) => {
      setLaneKeyMap((prev) => {
        const updated = { ...prev };
        updated[level] = keys;
        return updated;
      });
    },
    [level, laneKeyMap]
  );

  const laneKeys = useMemo(() => laneKeyMap[level], [laneKeyMap, level]);

  return (
    <GameContext.Provider
      value={{
        level,
        setLevel,
        laneKeys,
        setLaneKeys: handleSetLaneKeys,
        score,
        setScore,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
