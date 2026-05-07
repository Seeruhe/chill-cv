/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type StoryLang = 'en' | 'zh';
type ActiveMode = 'idle' | 'peek' | 'full';
type StackTheme = 'light' | 'dark';

interface Album {
  bg: string;
  tc: string;
  ac: string;
  brand: string;
  hl: string;
  artist: string;
  year: string;
  genre: string;
  coverQuery: string;
  desc: string;
  pills: string[];
  cta: string;
  story: Record<StoryLang, string[]>;
}

interface WikiContext {
  sourceUrl: string;
  sourceLabel: string;
  notes: Record<StoryLang, string[]>;
}

const ALBUMS: Album[] = [
  {
    bg: "#0d0d1a",
    tc: "#fff",
    ac: "#2fffb4",
    brand: "PORTFOLIO",
    hl: "Chill CV",
    artist: "Solo Project",
    year: "2026",
    genre: "REACT 19 · VITE · LONGCAT",
    coverQuery: "minimalist retro radio interface",
    desc: "An interactive CV with a retro radio Home and a 3D project stack — the project you are reading right now.",
    pills: ["TYPESCRIPT", "TAILWIND v4", "VERCEL"],
    cta: "READ",
    story: {
      en: [
        "Chill CV ports the Chill FM frontend architecture into a self-hosted resume. The Home screen keeps the music interface as a brand vibe; the Stack screen replaces albums with personal projects, and the AI assistant becomes a resume archivist powered by LongCat.",
        "The design intent is to read like an archive terminal rather than a generic CV template. Each card is a curated case study: short pills for tech stack, dense paragraphs for the long-form story, and a single external link for verification.",
        "The project is open source on GitHub and deployed on Vercel. Visitors can ask the assistant questions about my experience, and the answers come from a server-side prompt that the owner controls — no provider keys ever leave the backend.",
      ],
      zh: [
        "Chill CV 把 Chill FM 的前端架构改造成一份自托管的个人简历。Home 屏保留电台界面作为品牌氛围；Stack 屏的卡片堆叠从专辑替换成个人项目；AI 助手则被改造成由 LongCat 驱动的 简历档案管理员。",
        "设计意图是让人觉得像一个档案终端，而不是通用的 CV 模板。每张卡片都是一个被精心整理过的案例：短 pill 标签用于技术栈，长段落用于深度故事，单一外链用于核实。",
        "项目开源在 GitHub，部署在 Vercel。访客可以向助手提问我的经验，回答来自服务端可控的 prompt —— provider key 从不进入前端 bundle。",
      ],
    },
  },
  {
    bg: "#1a0d2e",
    tc: "#fff",
    ac: "#b46aff",
    brand: "PRODUCT",
    hl: "Project Two",
    artist: "Tech Lead",
    year: "2025",
    genre: "REPLACE WITH YOUR STACK",
    coverQuery: "abstract gradient",
    desc: "Replace this card with a real project: one-line summary of what you built and the impact it had.",
    pills: ["REPLACE", "WITH", "YOUR TAGS"],
    cta: "READ",
    story: {
      en: [
        "Paragraph 1: context — what was the problem, who was the user, what was the constraint.",
        "Paragraph 2: approach — what did you ship, what was the key technical decision, what trade-offs were involved.",
        "Paragraph 3: outcome — measurable result, what you learned, what you would do differently.",
      ],
      zh: [
        "段落 1：背景 —— 问题是什么，用户是谁，受到什么约束。",
        "段落 2：方案 —— 你交付了什么，关键技术决策是什么，有什么取舍。",
        "段落 3：结果 —— 可衡量的成效，学到了什么，下次会有什么不同。",
      ],
    },
  },
  {
    bg: "#0d1a2e",
    tc: "#fff",
    ac: "#4a9fff",
    brand: "INFRA",
    hl: "Project Three",
    artist: "Solo / Pair",
    year: "2025",
    genre: "REPLACE WITH YOUR STACK",
    coverQuery: "infrastructure diagram",
    desc: "Replace this card with another real project — infra, internal tools, data pipeline, etc.",
    pills: ["REPLACE", "WITH", "YOUR TAGS"],
    cta: "READ",
    story: {
      en: [
        "Paragraph 1: context.",
        "Paragraph 2: approach and key decisions.",
        "Paragraph 3: outcome and reflections.",
      ],
      zh: [
        "段落 1：背景。",
        "段落 2：方案与关键决策。",
        "段落 3：结果与反思。",
      ],
    },
  },
  {
    bg: "#1a0d0d",
    tc: "#fff",
    ac: "#ff6a6a",
    brand: "OPEN SOURCE",
    hl: "Project Four",
    artist: "Contributor",
    year: "2024",
    genre: "REPLACE WITH YOUR STACK",
    coverQuery: "open source software",
    desc: "An open-source contribution or library you maintain — replace this placeholder.",
    pills: ["REPLACE", "WITH", "YOUR TAGS"],
    cta: "READ",
    story: {
      en: [
        "Paragraph 1: what the project does and why it matters.",
        "Paragraph 2: your contribution scope.",
        "Paragraph 3: traction or impact (stars, downloads, deployments).",
      ],
      zh: [
        "段落 1：项目做什么，为什么重要。",
        "段落 2：你的贡献范围。",
        "段落 3：影响力 (star 、下载 、部署量等)。",
      ],
    },
  },
  {
    bg: "#f5f0e8",
    tc: "#1a1a0d",
    ac: "#8b6914",
    brand: "AI",
    hl: "Project Five",
    artist: "Solo Project",
    year: "2024",
    genre: "REPLACE WITH YOUR STACK",
    coverQuery: "neural network art",
    desc: "An AI/ML or data project — replace this placeholder.",
    pills: ["REPLACE", "WITH", "YOUR TAGS"],
    cta: "READ",
    story: {
      en: [
        "Paragraph 1: dataset, problem framing.",
        "Paragraph 2: model / pipeline / prompt design.",
        "Paragraph 3: evaluation results.",
      ],
      zh: [
        "段落 1：数据集与问题定义。",
        "段落 2：模型 / pipeline / prompt 设计。",
        "段落 3：评估结果。",
      ],
    },
  },
  {
    bg: "#0d1a0d",
    tc: "#fff",
    ac: "#4aff8a",
    brand: "EARLY",
    hl: "Project Six",
    artist: "Junior Engineer",
    year: "2023",
    genre: "REPLACE WITH YOUR STACK",
    coverQuery: "first project",
    desc: "An earlier project showing your growth — replace this placeholder.",
    pills: ["REPLACE", "WITH", "YOUR TAGS"],
    cta: "READ",
    story: {
      en: [
        "Paragraph 1: when and why you built this.",
        "Paragraph 2: technical scope.",
        "Paragraph 3: what you learned that influenced later work.",
      ],
      zh: [
        "段落 1：什么时候 、为什么做了这个。",
        "段落 2：技术范围。",
        "段落 3：从中学到了什么 、如何影响了后续工作。",
      ],
    },
  },
];

const N = ALBUMS.length;
const CARD_W = 560;
const FULL_CARD_W = 870;
const CARD_H = 160;
const FULL_CARD_H = 620;
const GAP = -110;
const STEP = CARD_H + GAP;
const TILT = -34;
const STAGE_H = 660;
const SLOTS = 18;
const SHIFT_AMOUNT_PEEK = 60;
const SHIFT_AMOUNT_FULL = 210;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

const transitionConfig = {
  type: "tween" as const,
  ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
  duration: 0.45,
};

const WIKI_CONTEXT: Record<string, WikiContext> = {
  "Chill CV": {
    sourceUrl: "https://github.com/Seeruhe/chill-cv",
    sourceLabel: "GitHub: Seeruhe/chill-cv",
    notes: {
      en: [
        "Source code is available on GitHub under the link above. The deployment runs on Vercel and uses LongCat for the resume assistant — see /api/ask-resume for the server boundary.",
      ],
      zh: [
        "源码托管在 GitHub ，部署在 Vercel ；简历助手使用 LongCat ，调用走 /api/ask-resume 服务端边界。",
      ],
    },
  },
  // Add one entry per project to expose external links (repo, demo, paper, etc.).
  // Keys must match the project's `hl` field exactly. Example shape:
  // "Project Two": {
  //   sourceUrl: "https://example.com",
  //   sourceLabel: "Project page",
  //   notes: { en: ["..."], zh: ["..."] },
  // },
};

const getCoverKey = (album: Album) => `${album.artist}-${album.hl}`;

const Card: React.FC<{
  albumIndex: number;
  slotIndex: number;
  scrollOff: number;
  activeCardId: number | null;
  activeMode: ActiveMode;
  coverUrl?: string;
  storyLang: StoryLang;
  onActivate: (slotIndex: number) => void;
  onCollapse: (e: React.MouseEvent) => void;
  onLangChange: (lang: StoryLang) => void;
}> = ({
  albumIndex,
  slotIndex,
  scrollOff,
  activeCardId,
  activeMode,
  coverUrl,
  storyLang,
  onActivate,
  onCollapse,
  onLangChange,
}) => {
  const album = ALBUMS[albumIndex];
  const isPeek = activeCardId === slotIndex && activeMode === 'peek';
  const isFull = activeCardId === slotIndex && activeMode === 'full';
  const isActive = activeCardId === slotIndex;

  const frac = mod(scrollOff, STEP);
  const y = slotIndex * STEP - frac;

  let finalY = y;
  if (activeCardId !== null && !isActive) {
    const shift = activeMode === 'peek' ? SHIFT_AMOUNT_PEEK : SHIFT_AMOUNT_FULL;
    if (slotIndex < activeCardId) {
      finalY -= shift;
    } else {
      finalY += shift;
    }
  }

  const normY = Math.max(0, Math.min(1, y / STAGE_H));
  const scaleX = 0.52 + normY * 0.48;
  const scaleY = 0.70 + normY * 0.30;
  const bright = Math.max(0.32, 0.4 + normY * 0.6);
  const vis = y > -CARD_H - 10 && y < STAGE_H + 10;

  const lightBg = ['#f5f0e8', '#e8e8f5', '#f0f5e8'].includes(album.bg);
  const ctaFg = lightBg ? '#fff' : album.bg;
  const wikiContext = WIKI_CONTEXT[album.hl];
  const story = [
    ...album.story[storyLang],
    ...(wikiContext?.notes[storyLang] ?? []),
  ];

  return (
    <motion.div
      className={`card ${isFull ? 'expanded' : ''} ${isPeek ? 'peeking' : ''}`}
      initial={false}
      animate={{
        top: isFull ? (STAGE_H - FULL_CARD_H) / 2 : (isPeek ? finalY - 30 : finalY),
        left: isFull ? (CARD_W - FULL_CARD_W) / 2 : 0,
        width: isFull ? FULL_CARD_W : CARD_W,
        height: isFull ? FULL_CARD_H : CARD_H,
        rotateX: isFull ? 0 : (isPeek ? -25 : TILT),
        rotateZ: isFull ? 0 : (isPeek ? -6 : 0),
        scaleX: isFull ? 1 : (isPeek ? 1.04 : scaleX),
        scaleY: isFull ? 1 : (isPeek ? 1.04 : scaleY),
        filter: isFull ? 'brightness(1.08)' : (isPeek ? 'brightness(1.08)' : `brightness(${bright})`),
        opacity: vis ? 1 : 0,
        zIndex: isFull ? 1000 : (isPeek ? 999 : slotIndex),
        x: isFull ? 0 : (isPeek ? 12 : 0),
      }}
      transition={transitionConfig}
      onClick={(e) => {
        e.stopPropagation();
        if (activeCardId === null || (isActive && activeMode === 'peek')) {
          onActivate(slotIndex);
        }
      }}
      style={{
        pointerEvents: activeCardId !== null && !isActive ? 'none' : 'all',
      }}
    >
      <div className="card-face" style={{ background: album.bg, color: album.tc }}>
        {coverUrl && <img src={coverUrl} alt="" className="card-cover-bg" referrerPolicy="no-referrer" />}
        <div className="card-shade" />
        <div className="card-nav">
          <div className="nav-dots">
            <div className="nav-dot"></div>
            <div className="nav-dot"></div>
            <div className="nav-dot"></div>
          </div>
          <span className="nav-brand" style={{ color: album.ac }}>{album.brand}</span>
          <div className="nav-r">
            <span className="nav-lnk">About</span>
            <span className="nav-lnk">Tracks</span>
            <span className="nav-lnk">Story</span>
            <span className="nav-btn" style={{ background: album.ac, color: ctaFg }}>{album.cta}</span>
          </div>
        </div>
        <div className="card-body">
          <div className="cover-tile">
            {coverUrl ? (
              <img src={coverUrl} alt={`${album.hl} cover`} referrerPolicy="no-referrer" />
            ) : (
              <span>{album.brand.slice(0, 2)}</span>
            )}
          </div>
          <div className="card-copy">
            <div className="card-hl" style={{ color: album.tc }}>{album.hl}</div>
            <div className="card-artist" style={{ color: album.tc }}>{album.artist}</div>
            <div className="card-sub" style={{ color: album.ac }}>{album.year} · {album.genre}</div>
          </div>
        </div>
        {isPeek && (
          <div className="peek-strip">
            <span>{storyLang === 'en' ? 'Preview' : '偷看'}</span>
            <p>{album.desc}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isFull && (
          <motion.div
            className="card-exp"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <div className="article-bar">
              <span>Chill FM Archive</span>
              <strong>{album.artist}</strong>
              <div className="article-actions" onClick={(e) => e.stopPropagation()}>
                <button className={storyLang === 'en' ? 'active' : ''} onClick={() => onLangChange('en')}>EN</button>
                <button className={storyLang === 'zh' ? 'active' : ''} onClick={() => onLangChange('zh')}>中文</button>
                <button className="article-close" onClick={(e) => { e.stopPropagation(); onCollapse(e); }}>x</button>
              </div>
            </div>

            <div className="article-scroll" onClick={(e) => e.stopPropagation()}>
              <figure className="article-hero">
                {coverUrl ? (
                  <img src={coverUrl} alt={`${album.hl} cover`} referrerPolicy="no-referrer" />
                ) : (
                  <div className="article-hero-fallback" style={{ background: album.bg, color: album.tc }}>
                    {album.brand}
                  </div>
                )}
                <div className="article-play">READ</div>
              </figure>

              <header className="article-head">
                <p className="article-kicker" style={{ color: album.ac }}>{album.genre} / {album.year}</p>
                <h1>{album.hl}: {storyLang === 'en' ? 'the sound behind the myth' : '神话背后的声音'}</h1>
                <p className="article-deck">{album.desc}</p>
                <p className="article-meta">
                  {storyLang === 'en' ? 'Saturday, April 25th, 2026' : '2026年4月25日，星期六'} — Chill FM Library
                </p>
              </header>

              <article className="article-body">
                {story.map((paragraph, idx) => (
                  <React.Fragment key={paragraph}>
                    {idx === 3 && (
                      <h2>{storyLang === 'en' ? 'Archive Notes' : '档案笔记'}</h2>
                    )}
                    <p>{paragraph}</p>
                  </React.Fragment>
                ))}

                <aside className="article-sidebar">
                  <h3>{storyLang === 'en' ? 'Related Listening' : '延伸聆听'}</h3>
                  <div className="exp-pills">
                    <div className="exp-pill ac" style={{ background: album.ac, color: ctaFg }}>{album.cta}</div>
                    {album.pills.map((p, idx) => (
                      <div key={idx} className="exp-pill">{p}</div>
                    ))}
                  </div>
                </aside>

                {wikiContext && (
                  <a
                    className="story-source"
                    href={wikiContext.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {storyLang === 'en' ? 'Source' : '资料来源'}: {wikiContext.sourceLabel}
                  </a>
                )}
              </article>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function App() {
  const [scrollOff, setScrollOff] = useState(0);
  const scrollRef = useRef(0);
  const targetRef = useRef(0);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [activeMode, setActiveMode] = useState<ActiveMode>('idle');
  const [storyLang, setStoryLang] = useState<StoryLang>('en');
  const [stackTheme, setStackTheme] = useState<StackTheme>('light');
  const [coverMap, setCoverMap] = useState<Record<string, string>>({});
  const rafRef = useRef<number | null>(null);
  const coverCacheRef = useRef<Record<string, string>>({});

  const handleActivate = (slotIdx: number) => {
    if (activeCardId === slotIdx && activeMode === 'peek') {
      setActiveMode('full');
    } else {
      setActiveCardId(slotIdx);
      setActiveMode('peek');
    }
  };

  const handleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCardId(null);
    setActiveMode('idle');
  };

  useEffect(() => {
    const handleThemeMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'STACK_THEME') return;
      if (event.data.theme === 'light' || event.data.theme === 'dark') {
        setStackTheme(event.data.theme);
      }
    };

    window.addEventListener('message', handleThemeMessage);
    return () => window.removeEventListener('message', handleThemeMessage);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controllers: AbortController[] = [];

    const loadCover = async (album: Album) => {
      const key = getCoverKey(album);
      if (coverCacheRef.current[key]) return;

      const controller = new AbortController();
      controllers.push(controller);

      try {
        const response = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(album.coverQuery)}&entity=album&limit=1`,
          { signal: controller.signal },
        );
        if (!response.ok) return;

        const data = await response.json();
        const artwork = data?.results?.[0]?.artworkUrl100 as string | undefined;
        if (!artwork) return;

        const largeArtwork = artwork.replace('100x100bb.jpg', '600x600bb.jpg');
        coverCacheRef.current[key] = largeArtwork;
        if (!cancelled) {
          setCoverMap((prev) => ({ ...prev, [key]: largeArtwork }));
        }
      } catch {
        // Cover loading is progressive; color cards remain as fallback.
      }
    };

    ALBUMS.forEach((album) => {
      void loadCover(album);
    });

    return () => {
      cancelled = true;
      controllers.forEach((controller) => controller.abort());
    };
  }, []);

  useEffect(() => {
    const handleOutside = () => {
      if (activeMode !== 'idle') {
        setActiveCardId(null);
        setActiveMode('idle');
      }
    };
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, [activeMode]);

  const smoothLoop = useCallback(() => {
    const diff = targetRef.current - scrollRef.current;
    let d = mod(diff, N * STEP);
    if (d > (N * STEP) / 2) d -= N * STEP;

    scrollRef.current += d * 0.13;
    scrollRef.current = mod(scrollRef.current, N * STEP);
    setScrollOff(scrollRef.current);

    if (Math.abs(d) > 0.4) {
      rafRef.current = requestAnimationFrame(smoothLoop);
    } else {
      scrollRef.current = mod(targetRef.current, N * STEP);
      setScrollOff(scrollRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (activeMode === 'full') return;
      e.preventDefault();
      targetRef.current = mod(targetRef.current + e.deltaY * 0.7, N * STEP);
      if (!rafRef.current) rafRef.current = requestAnimationFrame(smoothLoop);
    };

    let ty0 = 0;
    const handleTouchStart = (e: TouchEvent) => {
      ty0 = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (activeMode === 'full') return;
      e.preventDefault();
      const dy = ty0 - e.touches[0].clientY;
      ty0 = e.touches[0].clientY;
      targetRef.current = mod(targetRef.current + dy * 1.1, N * STEP);
      if (!rafRef.current) rafRef.current = requestAnimationFrame(smoothLoop);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [activeMode, smoothLoop]);

  const baseIdx = Math.floor(scrollOff / STEP);
  const slots = Array.from({ length: SLOTS }, (_, s) => s);

  return (
    <div id="wrap" data-theme={stackTheme}>
      <div id="stage">
        {slots.map((s) => {
          const albumIndex = mod(baseIdx + s, N);
          const album = ALBUMS[albumIndex];
          return (
            <Card
              key={s}
              slotIndex={s}
              albumIndex={albumIndex}
              scrollOff={scrollOff}
              activeCardId={activeCardId}
              activeMode={activeMode}
              coverUrl={coverMap[getCoverKey(album)]}
              storyLang={storyLang}
              onActivate={handleActivate}
              onCollapse={handleCollapse}
              onLangChange={setStoryLang}
            />
          );
        })}
      </div>
    </div>
  );
}
