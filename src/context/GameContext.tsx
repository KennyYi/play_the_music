import { Difficulty, GameStatus } from "@/lib/types";
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

export const DEFAULT_LEADTIME = {
  [Difficulty.Easy]: 2000,
  [Difficulty.Normal]: 1500,
  [Difficulty.Hard]: 1000,
};

interface GameContextType {
  level: Difficulty;
  leadTime: number;
  setLevel: (level: Difficulty) => void;
  laneKeys: string[];
  setLaneKeys: (keyset: string[]) => void;
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}

const GameContext = createContext<GameContextType>({
  level: Difficulty.Easy,
  leadTime: DEFAULT_LEADTIME[Difficulty.Easy],
  setLevel: () => {},
  laneKeys: DEFAULT_KEYSET[Difficulty.Easy],
  setLaneKeys: () => {},
  status: GameStatus.Stop,
  setStatus: () => {},
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
  const [status, setStatus] = useState<GameStatus>(GameStatus.Stop);

  const leadTime = useMemo(() => DEFAULT_LEADTIME[level], [level]);

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
        leadTime,
        setLevel,
        laneKeys,
        setLaneKeys: handleSetLaneKeys,
        status,
        setStatus,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
