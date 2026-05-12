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
  image?: string;
  desc: string;
  pills: string[];
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
    image: "projects/chill-cv.png",
    desc: "An interactive CV with a retro radio Home and a 3D project stack — the project you are reading right now.",
    pills: ["TYPESCRIPT", "TAILWIND v4", "VERCEL"],
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
    brand: "AGENT",
    hl: "Jarvis",
    artist: "Solo · Self-built",
    year: "2026",
    genre: "PYTHON · CLAUDE · GLM · OPENCLAW",
    coverQuery: "neural memory architecture",
    image: "projects/jarvis.png",
    desc: "A personal AI assistant exploring the leap from RAG to a real memory system — three-layer memory with confidence decay and a challenge loop.",
    pills: ["AGENT", "MEMORY", "LLM", "OPENCLAW"],
    story: {
      en: [
        "Jarvis treats RAG as a transitional form — search dressed up as memory. A real agent needs persistent, evolving, challengeable recollection. The project is a working bench for that thesis: a personal AI assistant whose memory layer is the product.",
        "Three layers — a user-model layer with per-fact confidence + decay + challenge cycles, a long-term MEMORY.md index, and dated daily journals under memory/YYYY-MM-DD.md. A two-stage extractor uses GLM-5-turbo to mine implicit preferences from dialogue, with an explicit confirmation loop before anything reaches long-term storage, guarded by a rule-based pre-filter to keep hallucinations out. Every ~10 interactions a challenge probe re-verifies a stored claim.",
        "A full lifecycle CLI — --extract / --sync / --compress / --challenge / --show / --why / --delete / --edit — covers every step from capture to revision. Built on the OpenClaw agent framework with Claude + GLM as dual-model collaborators. The architecture is the takeaway: memory is not a vector store, it is a contract that earns trust over time.",
      ],
      zh: [
        "Jarvis 把 RAG 视为过渡形态 —— 本质是用搜索冒充记忆。真正的 Agent 需要持久、可演化、可被挑战的记忆能力。项目是这一判断的工作台：一个个人 AI 助理，记忆层就是产品本身。",
        "三层架构 —— 用户模型层带置信度 + 衰减 + 挑战机制，长期记忆 MEMORY.md 索引，每日日记按 memory/YYYY-MM-DD.md 归档。两阶段抽取器用 GLM-5-turbo 挖掘对话中的隐性偏好，经过显式确认循环再写入长期记忆，叠加规则预过滤把幻觉挡在门外。每 ~10 次交互触发一次特征挑战，主动重新验证某条记忆。",
        "完整命令集 —— --extract / --sync / --compress / --challenge / --show / --why / --delete / --edit —— 覆盖记忆生命周期的每一步。基于 OpenClaw Agent 框架扩展，Claude + GLM 双模型协作。结论是架构本身：记忆不是向量库，是一份要靠时间换取信任的契约。",
      ],
    },
  },
  {
    bg: "#0d1a2e",
    tc: "#fff",
    ac: "#4a9fff",
    brand: "INFERENCE",
    hl: "IndexTTS Pipeline",
    artist: "焦点视界 · AI Engineer",
    year: "2025",
    genre: "VLLM · CUDA · 8-GPU · TTS",
    coverQuery: "tts spectrogram inference",
    image: "projects/indextts.png",
    desc: "End-to-end TTS inference service from zero — vLLM-backed IndexTTS 1.5/2.0, 8-GPU concurrent serving, fine-tuned on business corpus.",
    pills: ["VLLM", "INDEXTTS", "RTX 4090", "FINE-TUNE"],
    story: {
      en: [
        "焦点视界's TTS line needed a production inference stack — IndexTTS 1.5 and 2.0 both — with concurrency, voice fidelity, and an observable SLA. There was no service to inherit; the path was from zero, with the company's GPU pool as the canvas.",
        "Both IndexTTS variants were deployed on a vLLM-backed serving stack with 8-GPU concurrent inference and tuned for throughput. Source-level reading located and fixed latency-path bugs the upstream had not addressed, and business-corpus fine-tuning brought the voice to target. The TTS stage was wired into a wider pipeline — TTS → lip-sync → video composition for digital-avatar delivery — and into a video post-processing toolchain that strips subtitles and watermarks at scale.",
        "The result is stable business-grade QPS with full-dimension observability — inference latency, throughput, VRAM utilization — gated by Prometheus / Grafana alerts. The pipeline is now the production backbone for the company's digital-human product line, and the same patterns extend to BGM generation and other generative-audio workloads.",
      ],
      zh: [
        "焦点视界 TTS 业务线需要一套生产级推理基建 —— IndexTTS 1.5 和 2.0 都要 —— 兼顾并发、音色保真和可观测 SLA。没有可继承的服务，路径是从 0 到 1，公司的 GPU 池就是画布。",
        "在 vLLM 推理引擎上部署 IndexTTS 1.5 / 2.0，做 8 卡并发推理调优。深入源码定位并修复上游遗留的延迟链路 bug，基于业务语料做微调让音色贴合目标场景。TTS 之后串入更宽的链路 —— TTS → 唇形合成 → 视频合成 —— 完成数字人产品级交付，并接入字幕擦除 / 水印去除等批量视频后处理工具链。",
        "结果是稳定支撑业务级 QPS，全维度可观测 —— 推理延迟、吞吐、显存利用率 —— 由 Prometheus / Grafana 告警把关。目前是公司数字人产品线的生产骨干，同一套模式正在向 BGM 生成等生成式音频负载扩展。",
      ],
    },
  },
  {
    bg: "#1a0d0d",
    tc: "#fff",
    ac: "#ff6a6a",
    brand: "FULLSTACK",
    hl: "VDS",
    artist: "Solo · Self-built",
    year: "2026",
    genre: "FASTAPI · NEXT.JS · CELERY · DOCKER",
    coverQuery: "automation pipeline dashboard",
    image: "projects/vds.png",
    desc: "Cross-platform auto-delivery for virtual goods — Douyin / Kuaishou / Xiaohongshu / Xianyu / Video Account — fullstack, with Agent integration.",
    pills: ["FASTAPI", "NEXT.JS", "CELERY", "AGENT-SDK"],
    story: {
      en: [
        "Virtual-goods sellers run codes through five different platforms — Douyin, Kuaishou, Xiaohongshu, Xianyu, Video Account — most of which expose no clean delivery API. Manual fulfillment is the bottleneck. VDS exists to remove the human from the loop.",
        "A FastAPI backend with PostgreSQL + Redis + Celery async queues, orchestrated via Docker Compose, handles concurrent orders across platforms. A Next.js + Tailwind admin console unifies order monitoring, inventory, and per-platform account management. For Xianyu, which has no open API, XianYuAutoDeliveryX is wrapped as a Docker sidecar service. The whole system exposes itself to Jarvis through a vds-sdk with six Agent tools, plus a VDSPatrol daemon that handles routine order patrolling.",
        "The outcome is a one-person, end-to-end operating stack — backend, queue, dashboard, multi-platform integration, AI co-operation. The architectural win is treating the Agent not as an afterthought but as a first-class operator of the same system the humans use.",
      ],
      zh: [
        "虚拟商品兑换码业务横跨 5 个平台 —— 抖音、快手、小红书、闲鱼、视频号 —— 多数没有开放发货 API，人工兑换是瓶颈。VDS 的目标是把人从这条链路里拿掉。",
        "后端 FastAPI + PostgreSQL + Redis + Celery 异步任务队列，Docker Compose 编排，支撑多平台并发订单处理。管理面板用 Next.js + Tailwind CSS，把订单监控、库存、平台账号统一成一个控制台。闲鱼没有 API，就把 XianYuAutoDeliveryX 包成 Docker 边车服务。整个系统通过 vds-sdk 向 Jarvis 暴露 6 个 Agent 工具，再加 VDSPatrol 守护进程做日常订单巡检，让 AI 直接当运营。",
        "成果是一个人的端到端运营栈 —— 后端 / 任务队列 / 控制台 / 多平台对接 / AI 协同全在。结构上的真正胜利，是把 Agent 当成一等公民运营者，和人共用同一套系统，而不是事后接的外挂。",
      ],
    },
  },
  {
    bg: "#f5f0e8",
    tc: "#1a1a0d",
    ac: "#8b6914",
    brand: "INFRA",
    hl: "GPU Cluster · 184×4090",
    artist: "焦点视界 · AI Engineer",
    year: "2025",
    genre: "ANSIBLE · PCIE · PROMETHEUS",
    coverQuery: "gpu rack infrastructure",
    image: "projects/gpu-cluster.png",
    desc: "23-node × 8-card RTX 4090 cluster — 184 GPUs total. PCIe passthrough, Ansible-batched provisioning, Prometheus / Grafana end-to-end observability.",
    pills: ["RTX 4090", "ANSIBLE", "PROMETHEUS", "PCIE"],
    story: {
      en: [
        "The AI product line needed a GPU substrate sized for both training-adjacent experiments and round-the-clock inference. The brief: 23 nodes, 8 cards each — 184 RTX 4090s — with consistent OS images, predictable PCIe topology, and observable health from day one.",
        "PCIe passthrough was the baseline; nodes were provisioned and reconfigured in batch via Ansible to keep drift out. CUDA environments and inference-side dependencies (vLLM, IndexTTS, etc.) were templated rather than hand-rolled. A Prometheus + Grafana stack covered GPU utilization, memory pressure, temperature, and inference-service SLOs, with alerting wired into the on-call rotation.",
        "The outcome is a single-engineer-operable cluster supporting the IndexTTS pipeline, digital-human stack, BGM generation, NAS storage, and internal Agent monitoring. The same substrate underwrites every other entry in this archive — without it, none of the inference services would have a floor to stand on.",
      ],
      zh: [
        "AI 产品线需要一块 GPU 底座，既要承接训练相邻的实验，又要扛长期推理。任务定义清楚：23 节点 × 8 卡 = 184 张 RTX 4090，统一的系统镜像、可预期的 PCIe 拓扑、第一天起就要可观测。",
        "PCIe 直通是底线；通过 Ansible 批量化部署和重配置节点，把漂移挡在门外。CUDA 环境和推理侧依赖（vLLM、IndexTTS 等）走模板化分发，而不是手工搓。Prometheus + Grafana 覆盖 GPU 利用率、显存压力、温度、推理服务 SLO，告警接到值班 oncall。",
        "成果是一名工程师可操作的集群，支撑 IndexTTS 推理、数字人栈、BGM 生成、NAS 存储、内部 Agent 监控。它也是这份档案里其他条目的地基 —— 没有它，上面的推理服务都没有立足之地。",
      ],
    },
  },
  {
    bg: "#0d1a0d",
    tc: "#fff",
    ac: "#4aff8a",
    brand: "DEVOPS",
    hl: "Bastion Ops",
    artist: "思福迪 · DevOps Engineer",
    year: "2023–25",
    genre: "JUMPSERVER · PROMETHEUS · ELK",
    coverQuery: "server monitoring dashboard",
    image: "projects/bastion-ops.png",
    desc: "Two years on the operations side — bastion hosts, database audit, log pipelines — the engineering habits that later carried into the GPU cluster.",
    pills: ["JUMPSERVER", "GRAFANA", "FILEBEAT", "LOGSTASH"],
    story: {
      en: [
        "The pre-AI chapter — two years at 杭州思福迪信息技术 building and keeping operations infrastructure alive. The product surface was internal: bastion hosts and a database audit system that other teams depended on 24/7.",
        "Maintained JumpServer-based and in-house bastion clusters, kept the database audit system at 7×24 availability, wrote log-cleanup and query-optimization scripts that lifted daily query throughput by 30%+. Stood up the Prometheus + Grafana monitoring story and a Filebeat / Logstash log-collection pipeline so that incident response stopped relying on tribal knowledge.",
        "The visible win was uptime; the durable win was a set of engineering reflexes — measure before tuning, automate before scaling, alert before debugging — which transferred directly into the GPU cluster years later. The path from operations to AI engineering was deliberate, not accidental: AI infrastructure looks a lot more like ops than people admit.",
      ],
      zh: [
        "AI 之前的章节 —— 在杭州思福迪信息技术做了两年运维，把运维基建撑住。产品面是内部的：堡垒机，和一套支撑其他团队 7×24 的数据库审计系统。",
        "维护 JumpServer 和自研堡垒机集群，保数据库审计 7×24 稳态，写日志清理 / 查询优化脚本，把日均查询效率提升 30%+。把 Prometheus + Grafana 监控搭起来，叠加 Filebeat / Logstash 日志收集体系，让故障响应不再依赖部落知识。",
        "表面收益是可用性，更持久的收益是一组工程反射 —— 先度量再调参、先自动化再扩容、先告警再调试 —— 这些后来直接迁移到 GPU 集群。从运维到 AI 工程的路径是有意为之，不是偶然：AI 基建比人们承认的要更像 ops。",
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
  onImageError: () => void;
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
  onImageError,
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
        {coverUrl && <img src={coverUrl} alt="" className="card-cover-bg" referrerPolicy="no-referrer" onError={onImageError} />}
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
          </div>
        </div>
        <div className="card-body">
          <div className="cover-tile">
            {coverUrl ? (
              <img src={coverUrl} alt={`${album.hl} cover`} referrerPolicy="no-referrer" onError={onImageError} />
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
                  <img src={coverUrl} alt={`${album.hl} cover`} referrerPolicy="no-referrer" onError={onImageError} />
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
  const [imageErrors, setImageErrors] = useState<Set<string>>(() => new Set());
  const rafRef = useRef<number | null>(null);
  const coverCacheRef = useRef<Record<string, string>>({});

  const resolveCover = (album: Album): string | undefined => {
    if (album.image && !imageErrors.has(album.hl)) {
      return `${import.meta.env.BASE_URL}${album.image}`;
    }
    return coverMap[getCoverKey(album)];
  };

  const handleImageError = useCallback((albumKey: string) => {
    setImageErrors((prev) => {
      if (prev.has(albumKey)) return prev;
      const next = new Set(prev);
      next.add(albumKey);
      return next;
    });
  }, []);

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
      if (album.image) return;
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
    let lastWheelTime = 0;
    const handleWheel = (e: WheelEvent) => {
      if (activeMode === 'full') return;
      e.preventDefault();
      const dir = Math.sign(e.deltaY);
      if (dir === 0) return;
      const now = performance.now();
      if (now - lastWheelTime < 60) return;
      lastWheelTime = now;
      const nearestStep = Math.round(targetRef.current / STEP);
      targetRef.current = mod((nearestStep + dir) * STEP, N * STEP);
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
              coverUrl={resolveCover(album)}
              storyLang={storyLang}
              onActivate={handleActivate}
              onCollapse={handleCollapse}
              onLangChange={setStoryLang}
              onImageError={() => handleImageError(album.hl)}
            />
          );
        })}
      </div>
    </div>
  );
}
