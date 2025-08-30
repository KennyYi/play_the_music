import React from "react";

import {
  UndoDotIcon,
  RedoDotIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
} from "lucide-react";

interface MusicControllerProps {
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  stop: () => void;
  skipForward: () => void;
  skipBack: () => void;
}

const ControlButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ onClick, icon }) => {
  return (
    <div
      onClick={onClick}
      className="inline-flex cursor-pointer p-2 rounded-md border hover:bg-accent"
    >
      {icon}
    </div>
  );
};

const MusicController = React.memo<MusicControllerProps>(
  ({ isPlaying, play, pause, stop, skipForward, skipBack }) => {
    return (
      <div className="flex items-center space-x-4 gap-4">
        <ControlButton onClick={skipBack} icon={<UndoDotIcon />} />
        {isPlaying ? (
          <ControlButton onClick={pause} icon={<PauseCircleIcon />} />
        ) : (
          <ControlButton onClick={play} icon={<PlayCircleIcon />} />
        )}
        <ControlButton onClick={stop} icon={<StopCircleIcon />} />
        <ControlButton onClick={skipForward} icon={<RedoDotIcon />} />
      </div>
    );
  }
);

export default MusicController;
