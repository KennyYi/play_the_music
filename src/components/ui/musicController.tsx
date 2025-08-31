import { cn } from "@/lib/utils";
import React from "react";

import {
  UndoDotIcon,
  RedoDotIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  ShuffleIcon,
} from "lucide-react";

interface MusicControllerProps {
  isPlaying: boolean;
  disabled: boolean;
  random: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  skipForward: () => void;
  skipBack: () => void;
}

const ControlButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
}> = ({ onClick, icon, disabled }) => {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        "inline-flex p-2 rounded-md border",
        disabled
          ? "cursor-not-allowed bg-gray-100"
          : "cursor-pointer hover:bg-slate-50"
      )}
    >
      {icon}
    </div>
  );
};

const MusicController = React.memo<MusicControllerProps>(
  ({
    isPlaying,
    disabled,
    random,
    play,
    pause,
    stop,
    skipForward,
    skipBack,
  }) => {
    return (
      <div className="flex items-center space-x-4 gap-4">
        <ControlButton
          onClick={skipBack}
          icon={<UndoDotIcon />}
          disabled={disabled}
        />
        <ControlButton
          onClick={random}
          icon={<ShuffleIcon />}
          disabled={false}
        />
        {isPlaying ? (
          <ControlButton
            onClick={pause}
            icon={<PauseCircleIcon />}
            disabled={disabled}
          />
        ) : (
          <ControlButton
            onClick={play}
            icon={<PlayCircleIcon />}
            disabled={disabled}
          />
        )}
        <ControlButton
          onClick={stop}
          icon={<StopCircleIcon />}
          disabled={disabled}
        />
        <ControlButton
          onClick={skipForward}
          icon={<RedoDotIcon />}
          disabled={disabled}
        />
      </div>
    );
  }
);

export default MusicController;
