import { useRef, useCallback, useEffect } from 'react';

interface UseSoundOptions {
  volume?: number;
  loop?: boolean;
}

export function useSound(src: string, options: UseSoundOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { volume = 1, loop = false } = options;

  useEffect(() => {
    audioRef.current = new Audio(src);
    audioRef.current.volume = volume;
    audioRef.current.loop = loop;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src, volume, loop]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // 瀏覽器可能阻擋自動播放
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  return { play, pause, stop, setVolume };
}
