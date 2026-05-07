import { useEffect, useRef, useState } from 'react';
import { Heart, Maximize2, Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import type { Track } from '../types/music';
import { formatTime } from '../utils/time';

type StackTheme = 'light' | 'dark';

type StackScreenProps = {
  currentDuration: number;
  currentTime: number;
  isPlaying: boolean;
  onBack: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onPrev: () => void;
  track: Track;
};

export const StackScreen = ({
  currentDuration,
  currentTime,
  isPlaying,
  onBack,
  onNext,
  onPlayPause,
  onPrev,
  track,
}: StackScreenProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [stackTheme, setStackTheme] = useState<StackTheme>('light');
  const progress = currentDuration > 0 ? Math.min(100, Math.max(0, (currentTime / currentDuration) * 100)) : 0;
  const isDarkStack = stackTheme === 'dark';

  const syncStackTheme = () => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        type: 'STACK_THEME',
        theme: stackTheme,
      },
      '*',
    );
  };

  useEffect(() => {
    syncStackTheme();
  }, [stackTheme]);

  return (
  <div className={`relative isolate h-screen w-screen overflow-hidden transition-colors duration-500 ${isDarkStack ? 'bg-[#090a0d]' : 'bg-[#eeece7]'}`}>
    <div className={`pointer-events-none absolute inset-0 z-0 transition-colors duration-500 ${isDarkStack ? 'bg-[#090a0d]' : 'bg-[#eeece7]'}`} />
    <button
      type="button"
      onClick={onBack}
      className="absolute left-5 top-5 z-40 rounded-lg border border-white/20 bg-black/50 px-4 py-2 font-mono text-[10px] tracking-[0.12em] uppercase text-white shadow-[0_10px_28px_rgba(0,0,0,0.55)] backdrop-blur-md transition-all hover:bg-black/70"
      aria-label="Back to Chill FM"
      title="Back to Chill FM"
    >
      Back to Chill FM
    </button>
    <button
      type="button"
      onClick={() => setStackTheme((theme) => (theme === 'light' ? 'dark' : 'light'))}
      className={`absolute right-5 top-5 z-40 rounded-lg border px-4 py-2 font-mono text-[10px] tracking-[0.12em] uppercase shadow-[0_10px_28px_rgba(0,0,0,0.28)] backdrop-blur-md transition-all ${
        isDarkStack
          ? 'border-white/15 bg-white/10 text-white hover:bg-white/16'
          : 'border-black/10 bg-white/70 text-[#171717] hover:bg-white'
      }`}
      aria-label={`Switch to ${isDarkStack ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkStack ? 'light' : 'dark'} mode`}
    >
      {isDarkStack ? 'Light Mode' : 'Dark Mode'}
    </button>
    <iframe
      ref={iframeRef}
      src="/3d-album-stack/index.html"
      title="3D Album Stack"
      className={`absolute inset-0 z-10 h-full w-full border-0 transition-colors duration-500 ${isDarkStack ? 'bg-[#090a0d]' : 'bg-[#eeece7]'}`}
      loading="lazy"
      onLoad={syncStackTheme}
    />
    <div className="pointer-events-none absolute bottom-5 left-5 z-40 px-0 max-md:left-4 max-md:right-4 max-md:bottom-4">
      <div className="pointer-events-auto relative h-[220px] w-[220px] overflow-hidden rounded-[1.55rem] border border-white/12 bg-[#07070a] p-3.5 text-white shadow-[0_18px_56px_rgba(0,0,0,0.58)] ring-6 ring-black/[0.04] max-md:w-full">
        <div className="absolute inset-0 opacity-36">
          <img
            src={track.cover}
            alt=""
            aria-hidden="true"
            className="h-full w-full scale-125 object-cover blur-[1px] brightness-[0.32] saturate-[0.85]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_55%,rgba(255,255,255,0.08),rgba(0,0,0,0.78)_62%)]" />
        </div>

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/12 bg-[#16161b]">
              <img
                src={track.cover}
                alt={track.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold leading-tight">{track.artist}</div>
              <div className="mt-0.5 truncate text-[9px] leading-tight text-white/58">{track.title}</div>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/8 text-white transition hover:bg-white/14"
              aria-label="Back to Chill FM"
              title="Back to Chill FM"
            >
              <Maximize2 size={12} />
            </button>
            <button
              type="button"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/8 text-white transition hover:bg-white/14"
              aria-label="Favorite track"
              title="Favorite"
            >
              <Heart size={12} fill="currentColor" />
            </button>
          </div>

          <div className="mt-auto">
            <div className="mb-3.5 flex items-center justify-between font-mono text-[10px] text-white/90">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(Math.max(0, currentDuration - currentTime))}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/22">
              <div className="h-full rounded-full bg-[#D64550]" style={{ width: `${progress}%` }} />
            </div>

            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={onPrev}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/16"
                aria-label="Previous track"
              >
                <SkipBack size={19} fill="currentColor" />
              </button>
              <button
                type="button"
                onClick={onPlayPause}
                className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white shadow-[0_14px_34px_rgba(0,0,0,0.4)] transition hover:bg-white/16"
                aria-label={isPlaying ? 'Pause track' : 'Play track'}
              >
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
              </button>
              <button
                type="button"
                onClick={onNext}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/16"
                aria-label="Next track"
              >
                <SkipForward size={19} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
