import { useState, useRef, useCallback, useEffect } from 'react';

export function useAudioPlayer(src) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    let resolvingDuration = false;

    const onLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      } else {
        // webm from MediaRecorder often has Infinity duration.
        // Seek to a large time to force the browser to resolve it.
        resolvingDuration = true;
        audio.currentTime = 1e10;
      }
    };

    const onTimeUpdate = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setCurrentTime(audio.currentTime);
    };

    const onSeeked = () => {
      if (resolvingDuration && isFinite(audio.duration) && audio.duration > 0) {
        // Duration trick complete — reset to start, only once
        resolvingDuration = false;
        setDuration(audio.duration);
        audio.currentTime = 0;
      }
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('seeked', onSeeked);
    audio.addEventListener('ended', () => setPlaying(false));

    if (src) audio.src = src;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [src]);

  const play = useCallback(() => {
    audioRef.current?.play();
    setPlaying(true);
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const seek = useCallback((time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) pause();
    else play();
  }, [playing, play, pause]);

  return { playing, currentTime, duration, play, pause, seek, togglePlay };
}
