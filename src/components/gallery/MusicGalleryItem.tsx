import { useState } from 'react';
import type { Track } from '../../types/music';
import { GALLERY_CARD_HEIGHT, GALLERY_CARD_WIDTH, GALLERY_TRANSITION } from './galleryConstants';

type MusicGalleryItemProps = {
  track: Track;
  index: number;
  isActive: boolean;
  onSelect: (idx: number) => void;
  isDarkMode: boolean;
  setItemRef: (node: HTMLButtonElement | null) => void;
};

export const MusicGalleryItem = ({
  track,
  index,
  isActive,
  onSelect,
  isDarkMode,
  setItemRef,
}: MusicGalleryItemProps) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <button
      type="button"
      ref={setItemRef}
      onClick={() => onSelect(index)}
      aria-label={`Center ${track.title}`}
      className="group relative flex-shrink-0 overflow-hidden rounded-[1.7rem] border border-transparent bg-transparent"
      style={{
        width: `${GALLERY_CARD_WIDTH}px`,
        height: `${GALLERY_CARD_HEIGHT}px`,
        transform: `scale(${isActive ? 1 : 0.68})`,
        opacity: isActive ? 1 : 0.35,
        filter: `blur(${isActive ? 0 : 1.5}px)`,
        transition: GALLERY_TRANSITION,
        boxShadow: isActive ? '0 18px 34px rgba(94, 62, 48, 0.22)' : 'none',
      }}
    >
      {!imageFailed && (
        <img
          src={track.cover}
          alt={track.title}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {imageFailed && (
        <div className={`absolute inset-0 ${
          isDarkMode ? 'bg-[linear-gradient(135deg,#2e3138,#17191d)]' : 'bg-[linear-gradient(135deg,#f4d6c8,#d8a995)]'
        }`} />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[36%] flex flex-col items-center justify-end pb-5 px-4 text-center">
        <div className="text-[1.08rem] leading-tight font-semibold tracking-tight text-white drop-shadow-[0_2px_5px_rgba(0,0,0,0.28)] line-clamp-2">
          {track.title}
        </div>
        <div className="mt-1 text-[0.82rem] leading-tight font-medium text-white/88 tracking-[0.01em] line-clamp-1">
          {track.artist}
        </div>
      </div>
    </button>
  );
};
