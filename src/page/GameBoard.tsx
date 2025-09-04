import { useGame } from "@/context/GameContext";
import { useMusic } from "@/context/MusicContext";
import React from "react";

interface GameBoardProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  latency: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ audioRef, latency }) => {
  const { track } = useMusic();
  const { level, laneKeys, score, setScore } = useGame();

  // TODO
  return <></>;
};
