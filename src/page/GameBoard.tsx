import { useGame } from "@/context/GameContext";
import { useMusic } from "@/context/MusicContext";
import { NoteSpawner } from "@/utils/noteSpawner";
import React, { useEffect, useRef } from "react";
import { Application, Filter, Graphics, Ticker } from "pixi.js";

interface GameBoardProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  latency: number;
  appRef: React.RefObject<Application | null>;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  appRef,
  audioRef,
  latency,
}) => {
  const { track } = useMusic();
  const { level, laneKeys, score, setScore } = useGame();
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const spawnerRef = useRef<NoteSpawner | null>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const app = appRef.current;
    if (canvasElement && app) {
      app.resizeTo = canvasElement;
      canvasElement.appendChild(app.canvas);

      return () => {
        if (app.canvas.parentNode === canvasElement) {
          canvasElement.removeChild(app.canvas);
        }
      };
    }
  }, [canvasRef, appRef]);

  useEffect(() => {
    if (track?.beatMaps) {
      const beatMap = track.beatMaps[level];
      spawnerRef.current = new NoteSpawner(beatMap);
    }
  }, [track, level]);

  // TODO
  return <div className="w-full h-200 border border-black" ref={canvasRef} />;
};
