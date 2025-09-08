import { useGame } from "@/context/GameContext";
import { useMusic } from "@/context/MusicContext";
import { NoteSpawner } from "@/utils/noteSpawner";
import React, { useCallback, useEffect, useRef } from "react";
import { Application, Filter, Graphics, Ticker, Sprite } from "pixi.js";

interface GameBoardProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  latency: number;
  appRef: React.RefObject<Application | null>;
  isPlaying: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  appRef,
  audioRef,
  latency,
  isPlaying,
}) => {
  const { track } = useMusic();
  const { level, laneKeys, leadTime, score, setScore } = useGame();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const spawnerRef = useRef<NoteSpawner | null>(null);
  const spawnYRef = useRef(-20);
  const spawnIndexRef = useRef(0);

  const activeNotesRef = useRef<{ sprite: any; time: number; lane: number }[]>(
    []
  );
  const allNotesRef = useRef<{ sprite: any; time: number; lane: number }[]>([]);
  const particlesRef = useRef<
    {
      gfx: any;
      vx: number;
      vy: number;
      life: number;
    }[]
  >([]);

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
    const app = appRef.current;
    if (!app || !track?.beatMaps) return;

    app.stage.removeChildren();
    allNotesRef.current = [];
    activeNotesRef.current = [];
    spawnIndexRef.current = 0;

    const beatMap = track.beatMaps[level];
    const laneWidth = app.canvas.width / laneKeys.length;

    const base = new Graphics();
    base.rect(0, 0, laneWidth, 20).fill(0x000000);
    const texture = app.renderer.generateTexture(base);
    base.destroy();

    const hitline = new Graphics();
    hitline
      .rect(0, app.canvas.height - 10, app.canvas.width, 10)
      .fill(0x000000);
    app.stage.addChild(hitline);

    const allNotes = allNotesRef.current;
    for (const note of beatMap.notes) {
      const sprite = new Sprite(texture);
      sprite.x = note.lane * laneWidth + 5;
      sprite.y = spawnYRef.current;
      sprite.visible = false;
      app.stage.addChild(sprite);
      allNotes.push({ sprite, time: note.time, lane: note.lane });
    }

    spawnerRef.current = new NoteSpawner(beatMap);

    return () => {
      if (app.stage) {
        app.stage.removeChildren();
      }
      allNotesRef.current = [];
      activeNotesRef.current = [];
      spawnerRef.current = null;
      spawnIndexRef.current = 0;
    };
  }, [appRef, track, level, laneKeys, leadTime]);

  useEffect(() => {
    const app = appRef.current;
    const audio = audioRef.current;

    if (!app || !audio || !spawnerRef.current) return;
    const allNotes = allNotesRef.current;
    const active = activeNotesRef.current;

    const Tick = () => {
      const current = audio.currentTime + latency;
      const spawner = spawnerRef.current;
      if (!spawner) return;

      const newNotes = spawner.update(current);
      for (let i = 0; i < newNotes.length; i++) {
        const note = allNotes[spawnIndexRef.current];
        note.sprite.visible = true;
        active.push(note);
        spawnIndexRef.current += 1;
      }

      const height = app.canvas.height;

      for (let i = active.length - 1; i >= 0; i--) {
        const note = active[i];
        const timeToHit = note.time - current;
        const progress = 1 - timeToHit / (leadTime / 1000);
        note.sprite.y =
          spawnYRef.current + (height - spawnYRef.current) * progress;
        if (progress >= 1) {
          note.sprite.visible = false;
          active.splice(i, 1);

          const particles = particlesRef.current;
          for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.gfx.x += p.vx;
            p.gfx.y += p.vy;
            p.life -= 0.02;
            p.gfx.alpha = p.life;
            if (p.life <= 0) {
              app.stage.removeChild(p.gfx);
              particles.splice(i, 1);
            }
          }
        }
      }
    };

    if (isPlaying) {
      app.ticker.add(Tick);
    }

    return () => {
      app.ticker.remove(Tick);
      particlesRef.current.forEach((p) => app.stage.removeChild(p.gfx));
      particlesRef.current.length = 0;
      setScore(0);
    };
  }, [appRef, audioRef, latency, leadTime, isPlaying]);

  return <div className="w-full h-200 border border-black" ref={canvasRef} />;
};
