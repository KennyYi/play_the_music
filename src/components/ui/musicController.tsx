import React from "react";

import {
  UndoDotIcon,
  RedoDotIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  StopCircleIcon,
  Music4Icon,
  LoaderCircleIcon,
} from "lucide-react";
import { ControlButton } from "./ControlButton";

interface MusicControllerProps {
  isPlaying: boolean;
  disabled: boolean;
  loading: boolean;
  pickRandomMusic: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  skipForward: () => void;
  skipBack: () => void;
}

const MusicController = React.memo<MusicControllerProps>(
  ({
    isPlaying,
    disabled,
    loading,
    pickRandomMusic,
    play,
    pause,
    stop,
    skipForward,
    skipBack,
  }) => {
    return (
      <div className="flex items-center justify-between gap-1 lg:gap-2">
        <ControlButton
          onClick={pickRandomMusic}
          icon={<Music4Icon />}
          loadingIcon={<LoaderCircleIcon />}
          disabled={false}
          loading={loading}
          variant="primary"
        />
        <ControlButton
          onClick={skipBack}
          icon={<UndoDotIcon />}
          disabled={disabled}
          loading={loading}
        />
        {isPlaying ? (
          <ControlButton
            onClick={pause}
            icon={<PauseCircleIcon />}
            disabled={disabled}
            loading={loading}
          />
        ) : (
          <ControlButton
            onClick={play}
            icon={<PlayCircleIcon />}
            disabled={disabled}
            loading={loading}
          />
        )}
        <ControlButton
          onClick={stop}
          icon={<StopCircleIcon />}
          disabled={disabled}
          loading={loading}
        />
        <ControlButton
          onClick={skipForward}
          icon={<RedoDotIcon />}
          disabled={disabled}
          loading={loading}
        />
      </div>
    );
  }
);

export default MusicController;
