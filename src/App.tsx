/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, type MouseEvent, type PointerEvent, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Quote, Send, Terminal, History, Loader2, X } from 'lucide-react';
import { IntroOverlay } from './components/IntroOverlay';
import { StackScreen } from './components/StackScreen';
import { MusicGalleryItem } from './components/gallery/MusicGalleryItem';
import { GALLERY_EDGE_PADDING, GALLERY_HEIGHT } from './components/gallery/galleryConstants';
import { ARTISTS, TRACKS } from './data/musicLibrary';
import { drawMatrixText, SEG } from './lib/dotMatrix';
import { loadYouTubeIframeApi } from './lib/youtubeIframeApi';
import { askAboutResume } from './services/aiService';
import type { ArtistProfile, Track } from './types/music';
import { formatTime } from './utils/time';

// --- App ---

export default function App() {
  const [hasLaunched, setHasLaunched] = useState(false);
  const [screenIndex, setScreenIndex] = useState<0 | 1>(() => (typeof window !== 'undefined' && window.location.hash === '#stack' ? 1 : 0));
  const [trackCatalog, setTrackCatalog] = useState<Track[]>(TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(TRACKS[0].duration);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isChillMode, setIsChillMode] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lang, setLang] = useState<'EN' | 'CN'>('EN');
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  
  // AI Assistant State
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showAiConsole, setShowAiConsole] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const playerHostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const playerReadyRef = useRef(false);
  const currentTrackIndexRef = useRef(0);
  const invalidTrackSkipCountRef = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const coverImageRef = useRef<HTMLImageElement | null>(null);
  const trackCount = TRACKS.length;
  const currentTrack = trackCatalog[currentTrackIndex] ?? TRACKS[currentTrackIndex];

  useEffect(() => {
    let cancelled = false;

    const enrichTrackCovers = async () => {
      const nextCatalog = await Promise.all(
        TRACKS.map(async (track) => {
          try {
            const term = encodeURIComponent(`${track.artist} ${track.title}`);
            const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=1`);
            if (!response.ok) return track;
            const data = await response.json();
            const artwork = data?.results?.[0]?.artworkUrl100 as string | undefined;
            if (!artwork) return track;
            return {
              ...track,
              cover: artwork.replace('100x100bb.jpg', '600x600bb.jpg'),
            };
          } catch {
            return track;
          }
        }),
      );

      if (!cancelled) {
        setTrackCatalog(nextCatalog);
      }
    };

    enrichTrackCovers();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashChange = () => {
      setScreenIndex(window.location.hash === '#stack' ? 1 : 0);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const nextHash = screenIndex === 1 ? '#stack' : '#home';
    const nextUrl = `/${nextHash}`;
    if (window.location.pathname !== '/' || window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextUrl);
    }
  }, [screenIndex]);

  const findNextPlayableIndex = (startIndex: number) => {
    for (let step = 0; step < trackCatalog.length; step++) {
      const index = (startIndex + step) % trackCatalog.length;
      if (trackCatalog[index]?.youtubeVideoId?.trim()) {
        return index;
      }
    }
    return -1;
  };

  const setPlayerVolume = (nextVolume: number) => {
    const safeVolume = Math.max(0, Math.min(1, nextVolume));
    setVolume(safeVolume);
    if (playerRef.current && playerReadyRef.current) {
      playerRef.current.setVolume(Math.round(safeVolume * 100));
    }
  };

  const goToStackScreen = () => {
    setScreenIndex(1);
    setIsAiModalOpen(false);
    setSelectedArtist(null);
  };

  const goToHomeScreen = () => {
    setScreenIndex(0);
  };

  const handleLaunch = () => {
    setScreenIndex(0);
    setHasLaunched(true);
    setIsPlaying(true);
  };

  const scrollGalleryItemToCenter = (index: number) => {
    const container = galleryRef.current;
    const item = itemRefs.current[index];
    if (!container || !item) return;

    const targetTop = item.offsetTop - container.clientHeight / 2 + item.clientHeight / 2;
    container.scrollTo({
      top: targetTop,
      behavior: 'smooth',
    });

    setActiveGalleryIndex(index);
    setCurrentTrackIndex(index);
    setCurrentTime(0);
  };

  useEffect(() => {
    const container = galleryRef.current;
    if (!container) return;

    const updateActiveFromCenter = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenterY = containerRect.top + containerRect.height / 2;
      let nearestIndex = -1;
      let nearestDistance = Number.POSITIVE_INFINITY;

      itemRefs.current.forEach((item, index) => {
        if (!item) return;
        const itemRect = item.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(itemCenterY - containerCenterY);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      if (nearestIndex === -1) return;

      setActiveGalleryIndex((prev) => {
        if (prev === nearestIndex) return prev;
        setCurrentTrackIndex(nearestIndex);
        return nearestIndex;
      });
    };

    const handleScroll = () => {
      updateActiveFromCenter();
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateActiveFromCenter);
    const rafId = window.requestAnimationFrame(updateActiveFromCenter);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateActiveFromCenter);
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Load Cover Image for Canvas (Fallback/Initial)
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentTrack.cover;
    img.onload = () => {
      // Only set if dynamic one hasn't finished loading yet or as a baseline
      if (!coverImageRef.current || coverImageRef.current.src !== img.src) {
        coverImageRef.current = img;
      }
    };
  }, [currentTrack.cover]);

  useEffect(() => {
    if (!hasLaunched) return;

    let cancelled = false;

    const bootstrapYouTubePlayer = async () => {
      try {
        await loadYouTubeIframeApi();
        if (cancelled || !playerHostRef.current || playerRef.current) return;

        playerRef.current = new window.YT.Player(playerHostRef.current, {
          width: '0',
          height: '0',
          videoId: TRACKS[currentTrackIndexRef.current].youtubeVideoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            fs: 0,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              playerReadyRef.current = true;
              playerRef.current?.setVolume(Math.round(volume * 100));
              setCurrentDuration(playerRef.current?.getDuration?.() || TRACKS[currentTrackIndexRef.current].duration);
            },
            onStateChange: (event: { data: number }) => {
              const ytState = event.data;
              if (ytState === window.YT.PlayerState.PLAYING) {
                invalidTrackSkipCountRef.current = 0;
                setIsPlaying(true);
                setCurrentDuration(playerRef.current?.getDuration?.() || TRACKS[currentTrackIndexRef.current].duration);
              } else if (ytState === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (ytState === window.YT.PlayerState.ENDED) {
                const nextIndex = (currentTrackIndexRef.current + 1) % trackCount;
                setCurrentTrackIndex(nextIndex);
              }
            },
            onError: () => {
              invalidTrackSkipCountRef.current += 1;
              if (invalidTrackSkipCountRef.current >= trackCount) {
                setIsPlaying(false);
                return;
              }
              const nextIndex = (currentTrackIndexRef.current + 1) % trackCount;
              setCurrentTrackIndex(nextIndex);
            },
          },
        });
      } catch (error) {
        console.error('YouTube Player Init Error:', error);
      }
    };

    bootstrapYouTubePlayer();
    return () => {
      cancelled = true;
    };
  }, [hasLaunched, volume]);

  useEffect(() => {
    if (!hasLaunched) return;

    const player = playerRef.current;
    const track = TRACKS[currentTrackIndex];
    if (!track) return;

    setActiveGalleryIndex(currentTrackIndex);
    setCurrentTime(0);
    setCurrentDuration(track.duration);

    if (!track.youtubeVideoId?.trim()) {
      const nextPlayable = findNextPlayableIndex((currentTrackIndex + 1) % trackCount);
      if (nextPlayable !== -1 && nextPlayable !== currentTrackIndex) {
        setCurrentTrackIndex(nextPlayable);
      }
      return;
    }

    if (!player || !playerReadyRef.current) return;

    player.loadVideoById({
      videoId: track.youtubeVideoId,
      startSeconds: 0,
    });
    player.seekTo(0, true);
    player.playVideo();
    setIsPlaying(true);
  }, [currentTrackIndex, hasLaunched]);

  useEffect(() => {
    if (!hasLaunched) return;

    const interval = window.setInterval(() => {
      if (!playerRef.current || !playerReadyRef.current) return;
      const nextTime = Number(playerRef.current.getCurrentTime?.() || 0);
      const nextDuration = Number(playerRef.current.getDuration?.() || 0);
      if (Number.isFinite(nextTime)) {
        setCurrentTime(nextTime);
      }
      if (Number.isFinite(nextDuration) && nextDuration > 0) {
        setCurrentDuration(nextDuration);
      }
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [hasLaunched]);

  useEffect(() => {
    return () => {
      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
      }
      playerRef.current = null;
      playerReadyRef.current = false;
    };
  }, []);

  // Clock & Visualizer Drawing Logic
  useEffect(() => {
    if (!hasLaunched) return;

    let animationFrameId: number;
    let waveOffset = 0;

    const draw = () => {
      const cv = canvasRef.current;
      if (!cv) return;
      const ctx = cv.getContext('2d');
      if (!ctx) return;

      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const timeStr = `${h}:${m}`;

      ctx.clearRect(0, 0, cv.width, cv.height);

      const PADDING = 15;
      const ART_SIZE = 70;
      
      // Draw Album Cover Thumbnail (Left Side)
      if (coverImageRef.current) {
        ctx.save();
        // Subtle Border for the art
        ctx.strokeStyle = '#D64550';
        ctx.lineWidth = 1;
        ctx.strokeRect(PADDING, (cv.height - ART_SIZE) / 2 - 5, ART_SIZE, ART_SIZE);
        
        // The Image itself
        ctx.globalAlpha = 0.8;
        ctx.filter = 'grayscale(100%) contrast(120%) brightness(1.1)';
        ctx.drawImage(coverImageRef.current, PADDING, (cv.height - ART_SIZE) / 2 - 5, ART_SIZE, ART_SIZE);
        
        // Scanline effect over art
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = '#000';
        for (let i = 0; i < ART_SIZE; i += 2) {
          ctx.fillRect(PADDING, (cv.height - ART_SIZE) / 2 - 5 + i, ART_SIZE, 1);
        }
        ctx.restore();
      }

      const dotSize = 5; // Reduced from 6 for side layout
      const gap = 2;
      const RIGHT_CONTENT_X = PADDING + ART_SIZE + 25;

      // Draw Title "CHILL"
      const titleDotSize = 1.5;
      const titleGap = 1;
      drawMatrixText(ctx, "CHILL FM", RIGHT_CONTENT_X, 12, titleDotSize, titleGap, '#D64550');

      // Draw Time (Shifted Right)
      const timeOffY = 28; 
      let currentX = RIGHT_CONTENT_X;
      timeStr.split('').forEach((d) => {
        if (d === ':') {
          const cx = currentX + dotSize / 2;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(cx, timeOffY + dotSize + gap + dotSize / 2, dotSize / 2 - 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(cx, timeOffY + 3 * dotSize + 2 * gap + dotSize / 2, dotSize / 2 - 1, 0, Math.PI * 2);
          ctx.fill();
          currentX += dotSize + gap + 4;
          return;
        }
        
        const grid = SEG[d];
        if (!grid) return;

        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 3; col++) {
            ctx.fillStyle = grid[row][col] ? '#ffffff' : 'rgba(255, 255, 255, 0.05)';
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(currentX + col * (dotSize + gap), timeOffY + row * (dotSize + gap), dotSize, dotSize, 1);
            } else {
              ctx.rect(currentX + col * (dotSize + gap), timeOffY + row * (dotSize + gap), dotSize, dotSize);
            }
            ctx.fill();
          }
        }
        currentX += 3 * (dotSize + gap) + 6;
      });

      // Draw Audio Wave (Right Bottom)
      if (isPlaying) {
        waveOffset += isChillMode ? 0.01 : 0.03;
        const waveX = RIGHT_CONTENT_X;
        const waveY = timeOffY + (5 * (dotSize + gap)) + 12;
        const barWidth = 2;
        const barGap = 2;

        for (let i = 0; i < 35; i++) {
          const height = Math.abs(Math.sin(waveOffset + i * 0.2)) * 12 + 2;
          ctx.fillStyle = i % 2 === 0 ? '#D64550' : 'rgba(214, 69, 80, 0.3)';
          ctx.fillRect(waveX + i * (barWidth + barGap), waveY + (14 - height) / 2, barWidth, height);
        }
      }

      // Draw Mode Labels at bottom
      const modeDotSize = 1.2;
      const modeGap = 1;
      const modeY = cv.height - 12;
      
      const darkColor = isDarkMode ? '#ffffff' : 'rgba(255,255,255,0.2)';
      const chillColor = isChillMode ? '#D64550' : 'rgba(255,255,255,0.2)';
      const lightColor = !isDarkMode ? (isDarkMode ? '#ffffff' : '#FFE5D9') : 'rgba(255,255,255,0.2)';
      
      drawMatrixText(ctx, "DK", 15, modeY, modeDotSize, modeGap, darkColor);
      drawMatrixText(ctx, lang === 'EN' ? "CHL" : "LX", (cv.width - 25) / 2 + 35, modeY, modeDotSize, modeGap, chillColor);
      drawMatrixText(ctx, lang === 'EN' ? "LT" : "BY", cv.width - 30, modeY, modeDotSize, modeGap, lightColor);
      

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasLaunched, isDarkMode, isPlaying]);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % trackCount);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + trackCount) % trackCount);
  };

  const handlePlayPause = () => {
    if (!playerRef.current || !playerReadyRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !playerReadyRef.current || currentDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const seekTime = percentage * currentDuration;
    playerRef.current.seekTo(seekTime, true);
    setCurrentTime(seekTime);
  };

  const updateVolumeFromPointer = (clientX: number) => {
    const volumeBar = volumeBarRef.current;
    if (!volumeBar) return;
    const rect = volumeBar.getBoundingClientRect();
    const x = clientX - rect.left;
    const nextVolume = Math.max(0, Math.min(1, x / rect.width));
    setPlayerVolume(nextVolume);
  };

  const handleVolumePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsVolumeDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateVolumeFromPointer(e.clientX);
  };

  const handleVolumePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!isVolumeDragging) return;
    updateVolumeFromPointer(e.clientX);
  };

  const handleVolumePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsVolumeDragging(false);
    updateVolumeFromPointer(e.clientX);
  };

  const handleAiConsult = async (artistOverride?: string) => {
    const targetArtist = artistOverride || selectedArtist?.name || currentTrack.artist;
    if (!targetArtist || !aiQuery.trim()) return;
    
    setIsAiLoading(true);
    setAiResponse("");
    if (!isAiModalOpen) setIsAiModalOpen(true);
    
    try {
      const result = await askAboutResume(aiQuery, lang === 'CN' ? 'Chinese' : 'English', targetArtist);
      setAiResponse(result);
    } catch (err) {
      setAiResponse(lang === 'CN' ? "档案流已中断。连接丢失。" : "The archive stream is interrupted. Connection lost.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div
        className={`absolute inset-0 z-10 overflow-hidden transition-all duration-[450ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          screenIndex === 0 ? 'pointer-events-auto opacity-100 translate-x-0 scale-100' : 'pointer-events-none opacity-0 -translate-x-6 scale-[0.985]'
        }`}
        aria-hidden={screenIndex !== 0}
      >
    <div 
      className={`flex flex-col items-center min-h-screen font-sans transition-all duration-1000 relative overflow-hidden ${isChillMode ? 'sepia-[0.15] contrast-[0.95]' : ''} ${isDarkMode ? 'text-white bg-black' : 'text-[#1a1a1a] bg-[#FFE5D9]'}`}
    >
      <div
        ref={playerHostRef}
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden"
      />

      {/* Dynamic Background Elements for Dark Mode */}
      {isDarkMode && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#D6455022,transparent_60%)]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#D6455011] blur-[120px] rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
      )}
      {/* Background Texture Overlay (Desk/Knees vibes) */}
      <div 
        className={`absolute inset-x-0 bottom-0 h-1/2 bg-[url('https://picsum.photos/seed/wood-texture/1920/1080?blur=10')] bg-cover transition-opacity duration-1000 mix-blend-multiply ${isChillMode ? 'opacity-20' : 'opacity-10'} pointer-events-none`}
        style={{ maskImage: 'linear-gradient(to top, black, transparent)' }}
      />
      
      {/* Dynamic Ambient Glow */}
      <AnimatePresence>
        {isChillMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(47, 255, 180, 0.05) 0%, transparent 70%)'
            }}
          />
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-[#3e2723] opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
      
      <IntroOverlay hasLaunched={hasLaunched} lang={lang} onLaunch={handleLaunch} />

      {/* --- Main Content Layout --- */}
      <div className="relative z-10 flex min-h-screen w-full max-w-[1180px] origin-center scale-[0.9] transform-gpu flex-col items-center justify-center px-4 py-2 2xl:scale-[0.92]">
        {/* --- Main Player --- */}
        <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={hasLaunched ? { 
          opacity: 1, 
          y: 0,
          rotateX: isChillMode ? [0, -2, 0] : [0, 8, 0],
          translateY: isChillMode ? [0, -3, 0] : [0, -6, 0]
        } : {}}
        transition={{ 
          opacity: { duration: 1 },
          y: { duration: 1 },
          rotateX: { duration: isChillMode ? 8 : 4.5, repeat: Infinity, ease: "easeInOut" },
          translateY: { duration: isChillMode ? 10 : 5, repeat: Infinity, ease: "easeInOut" }
        }}
        className="w-full max-w-[390px] py-1 relative group px-2 mt-0 will-change-transform"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        <div 
          className={`border-2 rounded-[28px] overflow-hidden relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-colors duration-700 ${isDarkMode ? 'bg-black text-white border-white/20 ring-1 ring-white/5' : 'bg-white text-text border-gray-200 bg-card'}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          
          {/* Modified Screen (Clock Zone) */}
          <div 
            className={`screen-container py-3 px-5 text-center border-b flex flex-col items-center justify-center relative transition-colors duration-700 ${isMinimized ? 'min-h-[140px] cursor-pointer hover:brightness-105' : 'min-h-[140px]'} ${isDarkMode ? 'border-white/10' : 'border-border'}`}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            {isMinimized && (
              <div className="absolute top-2 left-4 z-30">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
                  className="font-mono text-[8px] tracking-[4px] text-accent animate-pulse uppercase"
                >
                  [ Show Full ]
                </button>
              </div>
            )}
            <div className="screen-glow" />
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
              <canvas ref={canvasRef} width="300" height="96" className="block drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
              
              <div className="mt-1 text-[10px] font-mono tracking-[0.2em] opacity-40 uppercase text-white">
                {days[now.getDay()]} — {now.getDate()} {months[now.getMonth()]}
              </div>

              {/* Clickable Area Overlays for Dark/Light/Chill */}
              <div className="absolute inset-0 z-20 pointer-events-none">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsDarkMode(true); }}
                  className="absolute bottom-1 left-4 w-12 h-6 pointer-events-auto cursor-pointer"
                  title="Dark Mode"
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsChillMode(prev => !prev); }}
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-6 pointer-events-auto cursor-pointer"
                  title="Chill Mode"
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsDarkMode(false); }}
                  className="absolute bottom-1 right-4 w-12 h-6 pointer-events-auto cursor-pointer"
                  title="Light Mode"
                />
                <button 
                  onClick={(e) => { e.stopPropagation(); setLang(prev => prev === 'EN' ? 'CN' : 'EN'); }}
                  className={`absolute top-2 right-2 pointer-events-auto cursor-pointer z-30 flex items-center gap-1.5 px-2 py-1.5 rounded-md border transition-all ${isDarkMode ? 'bg-black border-white/20' : 'bg-white/60 border-gray-200 shadow-sm'}`}
                  title="Switch Language / 切换语言"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${lang === 'EN' ? (isDarkMode ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.3)]') : 'bg-current opacity-10'}`} />
                    <span className="text-[6px] font-mono font-bold opacity-60">EN</span>
                  </div>
                  <div className="w-[1px] h-4 bg-border/20 mx-0.5" />
                  <div className="flex flex-col items-center gap-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${lang === 'CN' ? (isDarkMode ? 'bg-[#D64550] shadow-[0_0_8px_#D64550]' : 'bg-[#D64550] shadow-[0_0_8px_#D64550]') : 'bg-current opacity-10'}`} />
                    <span className="text-[6px] font-mono font-bold opacity-60">CN</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                key="radio-body-controls"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                {/* Now Playing */}
          <div className={`flex items-center gap-2.5 px-3 py-2.5 border-b transition-colors ${isDarkMode ? 'bg-black border-white/5' : 'bg-white border-border'}`}>
            <div className={`flex items-end gap-0.5 h-4 min-w-[20px] ${!isPlaying && 'opacity-30'}`}>
              {[0.35, 0.55, 0.4, 0.65, 0.3].map((d, i) => (
                <div 
                  key={i} 
                  className="w-[3px] rounded-sm bg-accent animate-eq" 
                  style={{ '--d': `${d}s`, animationPlayState: isPlaying ? 'running' : 'paused' } as CSSProperties}
                />
              ))}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="relative flex whitespace-nowrap">
                <div className={`text-[15px] leading-tight font-semibold tracking-[-0.02em] transition-all ${currentTrack.title.length > 20 ? 'animate-marquee-text pr-12' : 'truncate'}`} style={{ '--speed': `${Math.max(8, currentTrack.title.length * 0.4)}s` } as CSSProperties}>
                  {currentTrack.title}
                  {currentTrack.title.length > 20 && <span className="ml-12">{currentTrack.title}</span>}
                </div>
              </div>
              <div className="font-mono text-[10px] text-accent tracking-[2.5px] mt-0.5 uppercase">
                {isPlaying ? (lang === 'EN' ? 'PLAYING' : '正在播放') : (lang === 'EN' ? 'PAUSED' : '已暂停')}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1.5 p-1 rounded-full border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-bg-alt/50 border-border/40'}`}>
                <button onClick={handlePrev} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'text-white/60 hover:text-white' : 'text-muted hover:text-accent'}`}>
                  <SkipBack size={10} fill="currentColor" />
                </button>
                <button 
                  onClick={handlePlayPause}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isDarkMode ? 'text-white/80 hover:text-white' : 'text-muted hover:text-accent'}`}
                >
                  {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                </button>
                <button onClick={handleNext} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'text-white/60 hover:text-white' : 'text-muted hover:text-accent'}`}>
                  <SkipForward size={10} fill="currentColor" />
                </button>
              </div>
              <button 
                onClick={() => setIsMinimized(true)}
                className={`font-mono text-[8px] tracking-wider border px-2 py-1.5 rounded-md transition-all uppercase ${isDarkMode ? 'text-white border-white/20 hover:bg-white/5' : 'text-muted border-border hover:text-text hover:bg-bg-alt/50'}`}
              >
                {lang === 'EN' ? 'HIDE' : '隐藏'}
              </button>
              
              <div className="flex items-center gap-1.5 ml-1">
                <span className={`font-mono text-[9px] tracking-wider ${isDarkMode ? 'text-white/40' : 'text-muted'}`}>VOL</span>
                <div 
                  ref={volumeBarRef}
                  className={`w-[46px] md:w-[62px] h-[3px] rounded-sm relative cursor-pointer group ${isDarkMode ? 'bg-white/10' : 'bg-muted-deep'}`}
                  onPointerDown={handleVolumePointerDown}
                  onPointerMove={handleVolumePointerMove}
                  onPointerUp={handleVolumePointerUp}
                  onPointerCancel={handleVolumePointerUp}
                >
                  <div 
                    className={`h-full rounded-sm ${isDarkMode ? 'bg-white' : 'bg-accent'}`} 
                    style={{ width: `${volume * 100}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm ring-2 ring-transparent group-hover:ring-accent/20" 
                    style={{ left: `${volume * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Progress Row */}
          <div className={`px-5 py-3 border-b border-border/50 ${isDarkMode ? 'bg-black' : 'bg-black/5'}`}>
            <div className="flex items-center gap-4">
              <span className={`font-mono text-[11px] min-w-[35px] ${isDarkMode ? 'text-white' : 'text-gray-400'}`}>{formatTime(currentTime)}</span>
              <div className={`flex-1 h-[2px] rounded-full cursor-pointer relative group ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`} onClick={handleSeek}>
                <div 
                  className={`h-full rounded-full transition-[width] duration-300 relative ${isDarkMode ? 'bg-white' : 'bg-black'}`} 
                  style={{ width: `${currentDuration > 0 ? (currentTime / currentDuration) * 100 : 0}%` }}
                >
                  {/* Progress Glow */}
                  <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 blur-[2px] rounded-full scale-150 ${isDarkMode ? 'bg-white shadow-[0_0_8px_#fff]' : 'bg-black'}`} />
                </div>
              </div>
              <span className={`font-mono text-[11px] min-w-[35px] ${isDarkMode ? 'text-white' : 'text-gray-400'}`}>{formatTime(currentDuration)}</span>
            </div>
          </div>

          <div className={`px-3 py-2 border-b border-border/20 ${isDarkMode ? 'bg-black/80' : 'bg-[#fff9f6]'}`}>
            <button
              type="button"
              onClick={goToStackScreen}
              className={`w-full rounded-xl border px-3 py-2 text-left transition-all ${isDarkMode ? 'border-white/15 bg-white/5 text-white hover:bg-white/10' : 'border-[#f0d4ca] bg-white text-[#6c2b30] hover:bg-[#fff3ee]'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase">
                  Browse My Projects →
                </span>
              </div>
            </button>
          </div>

          {/* Queue with scroll limit to reduce height */}
          <div className="overflow-y-auto max-h-[126px] border-b border-border/10 custom-scrollbar">
            {trackCatalog.map((track, i) => (
              <div 
                key={i} 
                onClick={() => { setCurrentTrackIndex(i); setCurrentTime(0); setIsPlaying(true); }}
                className={`flex items-center px-3 py-1.5 cursor-pointer transition-colors border-l-4 border-transparent ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100'} ${i === currentTrackIndex ? (isDarkMode ? 'bg-white/10 border-l-white' : 'bg-[#fff5f0] border-l-[#D64550]') : ''}`}
              >
                <div className="w-4 font-mono text-[10px] opacity-40">{i + 1}</div>
                <div className={`flex-1 mx-2 text-[12px] font-medium truncate ${i !== currentTrackIndex ? (isDarkMode ? 'text-white/40' : 'text-gray-400') : (isDarkMode ? 'text-white' : 'text-black')}`}>
                  {track.title}
                </div>
                <div 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedArtist(ARTISTS[track.artist] || null); 
                    setAiQuery("");
                    setAiResponse("");
                  }}
                  className={`font-mono text-[9px] opacity-60 uppercase transition-colors py-1 px-2 -mr-2 cursor-help ${isDarkMode ? 'hover:text-white' : 'hover:text-accent'}`}
                >
                  {track.artist}
                </div>
              </div>
            ))}
          </div>

          {/* Musician Story Section */}
          <div 
            className={`p-3 transition-colors ${isDarkMode ? 'bg-black border-b border-white/10' : 'bg-gray-50/50 border-b border-border'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 opacity-60">
                <Quote size={12} className={isDarkMode ? 'text-white' : 'text-black'} />
                <div className="text-[9px] font-mono tracking-[3px] uppercase">
                  {lang === 'EN' ? 'Musician Story' : '音乐人故事'}
                </div>
              </div>
              <div 
                className="text-[7px] font-mono tracking-widest opacity-40 uppercase cursor-pointer hover:opacity-100 transition-opacity"
                onClick={() => setIsStoryExpanded(!isStoryExpanded)}
              >
                {isStoryExpanded ? (lang === 'EN' ? '[ Show Less ]' : '[ 收起 ]') : (lang === 'EN' ? '[ Read More ]' : '[ 查看更多 ]')}
              </div>
            </div>
            
            <div className="relative">
              <motion.div
                initial={false}
                animate={{ height: isStoryExpanded ? 'auto' : '2.8em' }}
                className="overflow-hidden"
              >
                <div className={`text-[11px] leading-snug italic ${isDarkMode ? 'text-white/60' : 'text-gray-500'}`}>
                  <span className={`not-italic mr-1 font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{currentTrack.artist}:</span>
                  {currentTrack.story}
                  
                  {isStoryExpanded && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 pt-3 border-t border-white/10 not-italic"
                    >
                      <div className="text-[8px] font-mono uppercase tracking-[2px] mb-2 opacity-40">
                        {lang === 'EN' ? 'About Artist' : '关于艺人'}
                      </div>
                      <div className="not-italic opacity-90">
                        {ARTISTS[currentTrack.artist]?.bio}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2">
              <div className="flex items-center gap-1.5 font-mono text-[8px] text-muted tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                LIVE
              </div>
              <div className="text-[8px] font-mono text-muted uppercase tracking-tighter">
                Chill FM
              </div>
            </div>

            {/* AI Assistant Console Trigger */}
            <div className={`mt-3 p-3 rounded-xl border border-dashed transition-all duration-500 cursor-pointer ${isDarkMode ? 'bg-black border-white/10 hover:bg-white/5' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                 onClick={() => setIsAiModalOpen(true)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal size={10} className={isDarkMode ? 'text-white' : 'text-accent'} />
                    <span className={`text-[9px] font-mono uppercase tracking-[2px] ${isDarkMode ? 'text-white/80' : 'text-gray-500'}`}>
                      {lang === 'EN' ? 'Archivist Terminal' : '档案管理员终端'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-40">
                    <span className="text-[7px] font-mono uppercase tracking-widest">{lang === 'EN' ? '[ OPEN ]' : '[ 开启 ]'}</span>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </motion.div>

      {/* --- Music Discovery Wall (Carousel) --- */}
      <motion.div 
        initial={{ opacity: 0, x: 40 }}
        animate={hasLaunched ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 1, delay: 0.8 }}
        className="hidden xl:flex xl:absolute xl:right-12 w-64 h-[560px] mt-0 pt-0 z-20 items-center"
      >
        <div 
          ref={galleryRef}
          className="w-full overflow-y-scroll no-scrollbar px-6"
          style={{
            height: `${GALLERY_HEIGHT}px`,
            paddingTop: `${GALLERY_EDGE_PADDING}px`,
            paddingBottom: `${GALLERY_EDGE_PADDING}px`,
          }}
        >
          <div className="flex flex-col items-center gap-3">
            {trackCatalog.map((track, idx) => (
              <MusicGalleryItem 
                key={`wall-${idx}`} 
                track={track} 
                index={idx} 
                isActive={activeGalleryIndex === idx}
                onSelect={scrollGalleryItemToCenter}
                isDarkMode={isDarkMode}
                setItemRef={(node: HTMLButtonElement | null) => {
                  itemRefs.current[idx] = node;
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div> {/* --- End of Main Content Layout --- */}

      {/* --- AI Assistant Modal --- */}
      <AnimatePresence>
        {isAiModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 px-6"
            onClick={() => setIsAiModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-[480px] rounded-[32px] overflow-hidden border transition-all duration-500 flex flex-col shadow-2xl ${
                isDarkMode ? 'bg-black/80 border-white/10 text-white' : 'bg-white/90 border-gray-200 text-black'
              }`}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/5' : 'bg-accent/10'}`}>
                    <Terminal size={18} className={isDarkMode ? 'text-white' : 'text-accent'} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">{lang === 'EN' ? 'Archivist Assistant' : '档案检索助手'}</h3>
                    <p className="text-[10px] font-mono opacity-40 uppercase tracking-[2px] mt-0.5">
                      {lang === 'EN' ? 'AI Personnel Interface' : '人工智能交互接口'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAiModalOpen(false)}
                  className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-black/5'}`}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Content Area */}
              <div className="flex-1 overflow-y-auto p-6 min-h-[240px] max-h-[400px] custom-scrollbar">
                {!aiResponse && !isAiLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-4">
                    <Quote size={40} />
                    <p className="text-xs font-mono tracking-widest leading-loose">
                      {lang === 'EN' 
                        ? `AWAITING QUERY REGARDING: ${currentTrack.artist}` 
                        : `正在等待关于 ${currentTrack.artist} 的查询`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1 items-end">
                      <div className={`max-w-[85%] rounded-[20px] rounded-tr-none px-4 py-3 text-xs leading-relaxed ${
                        isDarkMode ? 'bg-white/10 text-white' : 'bg-black/5 text-black'
                      }`}>
                        {aiQuery}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1 items-start">
                      <div className={`max-w-[90%] rounded-[20px] rounded-tl-none px-4 py-3 text-xs leading-relaxed border transition-all ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/10 text-white/90' 
                          : 'bg-accent/5 border-accent/10 text-accent/80'
                      }`}>
                        {isAiLoading ? (
                          <div className="flex items-center gap-3 py-2">
                            <Loader2 size={14} className="animate-spin opacity-40" />
                            <span className="font-mono text-[10px] uppercase tracking-widest opacity-40">
                              {lang === 'EN' ? 'Accessing Data...' : '数据调取中...'}
                            </span>
                          </div>
                        ) : (
                          aiResponse
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-6 pt-2">
                <div className="relative">
                  <input 
                    autoFocus
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && aiQuery.trim() && handleAiConsult()}
                    placeholder={lang === 'EN' ? `Ask me about ${currentTrack.artist}...` : `询问关于 ${currentTrack.artist} 的信息...`}
                    className={`w-full bg-transparent border-2 rounded-2xl py-3 pl-4 pr-12 text-sm transition-all focus:outline-none ${
                       isDarkMode 
                        ? 'border-white/10 focus:border-white/30 text-white placeholder:text-white/20' 
                        : 'border-black/5 focus:border-black/20 text-black placeholder:text-black/40'
                    }`}
                  />
                  <button 
                    onClick={() => aiQuery.trim() && handleAiConsult()}
                    disabled={!aiQuery.trim() || isAiLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-accent text-white disabled:opacity-20 shadow-lg shadow-accent/20"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedArtist(null);
              setAiQuery("");
              setAiResponse("");
            }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-end"
          >
            <motion.div
              initial={{ x: '100%', skewX: -5 }}
              animate={{ x: 0, skewX: 0 }}
              exit={{ x: '100%', skewX: 5 }}
              transition={{ type: 'spring', damping: 30, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-[420px] h-full shadow-2xl overflow-y-auto border-l border-border/20 ${isDarkMode ? 'bg-[#0b0d1e] text-[#e8eaf6]' : 'bg-[#f8f9fc] text-[#1a1a1a]'}`}
            >
              {/* Header with Radio Screen Aesthetic */}
              <div className="relative h-[360px] w-full overflow-hidden p-6">
                <div className={`relative w-full h-full rounded-[24px] overflow-hidden border-2 scroll-mt-20 ${isDarkMode ? 'border-[#1e2140]' : 'border-gray-200'} screen-container`}>
                  <motion.img 
                    initial={{ scale: 1.2, filter: 'grayscale(100%) blur(10px)' }}
                    animate={{ scale: 1, filter: 'grayscale(100%) blur(0px)' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    src={selectedArtist.image} 
                    alt={selectedArtist.name} 
                    className="w-full h-full object-cover contrast-125"
                    referrerPolicy="no-referrer"
                  />
                  <div className="screen-glow opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                      <p className="text-accent font-mono text-[10px] tracking-[0.4em] uppercase">Archive Source</p>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tighter text-white leading-none">{selectedArtist.name}</h2>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setSelectedArtist(null);
                    setAiQuery("");
                    setAiResponse("");
                  }}
                  className="absolute top-10 right-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-black/70 transition-colors z-20"
                >
                   <span className="font-mono text-xs">ESC</span>
                </button>
              </div>

              <div className="px-8 pb-12 space-y-10">
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-border/20" />
                    <h3 className={`text-[11px] uppercase tracking-[0.4em] font-mono ${isDarkMode ? 'text-accent/60' : 'text-gray-400'}`}>Biography</h3>
                    <div className="h-px flex-1 bg-border/20" />
                  </div>
                  <p className={`text-[14px] leading-relaxed font-light ${isDarkMode ? 'text-[#a0a5cc]' : 'text-gray-600'}`}>
                    {selectedArtist.bio}
                  </p>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-px flex-1 bg-border/20" />
                    <h3 className={`text-[11px] uppercase tracking-[0.4em] font-mono ${isDarkMode ? 'text-accent/60' : 'text-gray-400'}`}>Discography</h3>
                    <div className="h-px flex-1 bg-border/20" />
                  </div>
                  <div className="grid gap-3">
                    {selectedArtist.topTracks.map((trackName, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + (idx * 0.05) }}
                        className={`group flex items-center gap-4 p-4 rounded-2xl border border-transparent transition-all cursor-pointer ${isDarkMode ? 'bg-[#15172b] hover:bg-[#1a1d3a] hover:border-accent/20' : 'bg-white hover:bg-gray-50 border-gray-100 shadow-sm'}`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] border ${isDarkMode ? 'bg-[#0f1126] border-white/5 text-accent' : 'bg-gray-100 border-gray-200'}`}>
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <span className="text-[13px] font-medium tracking-tight flex-1">{trackName}</span>
                        <Play size={14} className="text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>

                <motion.footer 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-8 border-t border-border/10"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 rounded-full bg-accent/30" />)}
                    </div>
                    <p className="font-mono text-[9px] opacity-30 uppercase tracking-[.5em]">Jazz Hop Collective · 2026</p>
                  </div>
                </motion.footer>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div>
      <div
        className={`fixed inset-0 z-30 transition-all duration-[450ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
          screenIndex === 1 ? 'pointer-events-auto opacity-100 translate-x-0' : 'pointer-events-none opacity-0 translate-x-full'
        }`}
        aria-hidden={screenIndex !== 1}
      >
        <StackScreen
          currentDuration={currentDuration}
          currentTime={currentTime}
          isPlaying={isPlaying}
          onBack={goToHomeScreen}
          onNext={handleNext}
          onPlayPause={handlePlayPause}
          onPrev={handlePrev}
          track={currentTrack}
        />
      </div>
    </div>
  );
}

