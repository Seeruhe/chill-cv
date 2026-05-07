const LONGCAT_API_URL =
  process.env.LONGCAT_API_URL ||
  "https://api.longcat.chat/openai/v1/chat/completions";
const LONGCAT_MODEL = process.env.LONGCAT_MODEL || "LongCat-Flash-Chat";

// ── Resume context ─────────────────────────────────────────────────────────
// Authoritative grounding for visitor questions. The model is instructed not
// to invent facts beyond what is documented here. Update this when the
// underlying CV (docs/简历 杨家乐 AI Agent工程师.docx) changes.
const OWNER_NAME = "杨家乐 (Yang Jiale)";

const RESUME_SUMMARY = `
姓名 / Name: 杨家乐 (Yang Jiale)
年龄: 27
工作经验: 3 年
城市: 杭州
个人网站 / Site: i.world.je
求职定位 / Target roles: AI Agent 工程师 / LLM 应用工程师 / AI 全栈工程师 / 大模型推理工程师

个人简介 (one-line):
运维背景出身的 AI 工程师，专注 LLM 应用开发、Agent 系统与记忆架构。在生产环境管理 23 节点 × 184 张 RTX 4090 GPU 集群，落地 IndexTTS / 数字人 / vLLM 推理服务全链路。同时在个人项目中深入探索 Agent 与记忆系统 (Jarvis 项目)，搭建三层记忆架构 + 置信度衰减 + 挑战机制，推动从 RAG 到真正记忆系统的工程实践。

核心技能 / Core skills:
- AI / LLM 应用: Agent 编排、记忆系统设计、RAG 工程化、Prompt 工程、LLM 工具调用、长上下文管理
- 推理与部署: vLLM、SGLang、IndexTTS、PagedAttention、CUDA Graph、ONNX Runtime、模型量化（进阶）
- 后端: Python (异步 / async/await)、FastAPI、NestJS、Go、PostgreSQL、Redis、Celery
- 前端: TypeScript、Vue、Next.js、React、ECharts、Tailwind CSS
- 运维 / 基建: Linux、Docker、Docker Compose、Ansible、Nginx、Prometheus、Grafana、Kubernetes (基础)
- GPU / 硬件: RTX 4090 集群运维、PCIe 直通、NVLink、CUDA 环境
- AI 工具栈 (重度自费用户，月度个人投入约 ¥2K): Claude Opus 4.7 (Max)、GPT Plus、智谱 GLM Max、Cursor —— 自建多模型协同开发流

工作经历 / Experience:
1) 焦点视界 (杭州) 人工智能有限公司 · AI 工程师 · 2025.06 — 至今
   - GPU 集群基建: 搭建并运维 23 节点 × 8 卡 RTX 4090 (共 184 张卡), PCIe 直通 + Ansible 批量化部署 + Prometheus/Grafana 全链路监控告警
   - IndexTTS 推理服务: 落地 1.5 / 2.0 语音合成, 8 卡并发推理调优, 修复源码 bug, 完成业务语料微调, 稳定支撑业务级 QPS
   - 数字人 Pipeline: 硅基数字人模型部署上线, 串联 TTS → 唇形合成 → 视频合成完整推理链路, 完成产品级业务接入
   - 视频后处理工具链: 字幕擦除 / 水印去除等批量处理工具, 集成业务流水线, 显著降低人工后期成本
   - 管理后台: Vue + ECharts 数据大屏, IndexTTS 1.5/2.0 一键切换面板, Mock 与真实数据共存调度
   - Agent 基建: 完成 OpenClaw Agent 框架部署与业务集成, 作为公司内部 Agent 应用基座
   - 其他: 部署 NAS 存储、Agent 监控、BGM 音乐生成模型工程化落地等

2) 杭州思福迪信息技术有限公司 · 运维工程师 · 2023.05 — 2025.05
   - 维护 JumpServer / 自研堡垒机集群, 数据库审计系统 7×24 稳定运行
   - 编写日志清理 / 查询优化脚本, 日均查询效率提升 30%+
   - Prometheus + Grafana 监控搭建 + Filebeat / Logstash 日志收集体系, 故障响应时效大幅提升

重点项目 / Key projects:

- Jarvis · 个人 AI 助理 (Agent + 记忆系统) · 2026.03 — 至今 (自研)
  探索从 RAG 到真正记忆系统的工程实践. 设计动机: RAG 是过渡形态 (本质是搜索代替记忆), 下一代 Agent 必须具备持久、可演化、可挑战的记忆能力.
  · 三层记忆架构: 用户模型层 (置信度 + 衰减 + 挑战机制) + 长期记忆 MEMORY.md + 每日日记 memory/YYYY-MM-DD.md, 跨会话语义闭环
  · LLM 驱动洞察: GLM-5-turbo 提取用户对话中的隐性偏好与事实, 显式确认验证循环后写入长期记忆, 避免 LLM 幻觉污染
  · 两层提问引擎: 规则预过滤 + LLM 语义判断, 每 10 次交互触发一次特征挑战, 主动验证记忆准确性
  · 命令系统: --extract / --sync / --compress / --challenge / --show / --why / --delete / --edit, 完整覆盖记忆生命周期管理
  · 技术栈: Python + Claude API + GLM API + 文件系统 + JSON 持久化 / 基于 OpenClaw Agent 框架扩展

- VDS · 跨平台虚拟商品自动发货系统 · 2026.04 (自研全栈)
  抖音 / 快手 / 小红书 / 闲鱼 / 视频号兑换码自动化.
  · 后端: FastAPI + PostgreSQL + Redis + Celery 异步任务队列, Docker Compose 编排, 支撑多平台并发订单处理
  · 管理面板: Next.js + Tailwind CSS, 订单监控 / 库存管理 / 平台账号管理一体化控制台
  · Jarvis 集成: 封装 vds-sdk 提供 6 个 Agent 工具, VDSPatrol 后台守护进程实现订单巡检自动化, AI 协同处理
  · 闲鱼对接: 集成 XianYuAutoDeliveryX 作为 Docker 服务, 解决无开放 API 平台的发货难题

- IndexTTS 推理工程化 · 焦点视界 · 2025.07 — 至今 (公司核心业务, TTS 推理服务从 0 到 1)
  · 模型部署: 基于 vLLM 推理引擎部署 IndexTTS 1.5 / 2.0, 8 卡并发推理调优
  · Bug 修复与微调: 深入源码定位并修复推理阶段 bug, 完成业务语料微调与音色适配
  · 链路集成: 与数字人模型、唇形合成、视频后处理串联, 完成完整数字人产品 pipeline
  · 监控与可观测性: 推理延迟 / 吞吐 / 显存利用率全维度监控, 保障线上服务 SLA

个人优势 / Strengths:
- 运维基建底子扎实: 堡垒机 / 监控 / 日志 / GPU 集群全链路实战, 系统稳定性意识根植于工程习惯
- AI 工具深度使用者: 把 AI 协同做成生产力, 而非概念
- 前沿方向有判断: 关注 vLLM / SGLang / Mamba / Memory Systems / Agent 框架, 不跟风但有方向感
- 全栈交付能力: 能独立完成"模型部署 + 后端 + 管理面板 + 监控告警"端到端交付, 不依赖团队配合
- 自驱学习能力强: 从运维转 AI 工程, 自发建立系统化学习路线, 在工作之外坚持个人项目演进

求职意向 / Job preferences:
- 意向岗位: AI Agent 工程师 / LLM 应用工程师 / AI 全栈工程师 / 大模型推理工程师
- 意向城市: 杭州 (优先) / 新加坡
- 期望薪资: 面议 (参考行业水平)
- 到岗时间: 一周内可到岗
`.trim();

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function GET() {
  return jsonResponse({error: "Method not allowed"}, 405);
}

export async function POST(request) {
  const apiKey = process.env.LONGCAT_API_KEY;

  if (!apiKey) {
    return jsonResponse({error: "LongCat API key is not configured."}, 500);
  }

  const body = await request.json().catch(() => ({}));
  const question = cleanText(body?.question, 1000);
  const language = cleanText(body?.language, 40) || "English";
  const topic = cleanText(body?.topic, 80);

  if (!question) {
    return jsonResponse({error: "Question is required."}, 400);
  }

  const topicLine = topic ? `Topic hint: ${topic}.\n` : "";

  const prompt = `You are the resume archivist for ${OWNER_NAME}, a Chinese engineer positioning toward AI Agent / LLM application / AI full-stack / LLM inference engineering roles.
A visitor is browsing an interactive CV called "Chill CV" and asks a question.
Use the resume summary below as the authoritative ground truth. Do not invent facts that are not in the summary; if the answer is not present, say so briefly and suggest what is documented instead. When the question is technical (Agent architecture, memory systems, vLLM/IndexTTS, GPU cluster ops), prefer concrete details from the summary over generic explanations.

${topicLine}Visitor question: "${question}"

IMPORTANT: Reply in ${language}. Keep the response under 200 words. Tone: archivist — concise, factual, slightly literary, no marketing fluff. Use the owner's real terminology (e.g. "三层记忆架构", "RTX 4090 集群", "vLLM").

--- RESUME SUMMARY ---
${RESUME_SUMMARY}
--- END SUMMARY ---`;

  try {
    const response = await fetch(LONGCAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: LONGCAT_MODEL,
        messages: [
          {
            role: "system",
            content:
              "You are Chill CV's resume archivist assistant. Give concise, accurate, archive-style responses grounded only in the provided resume summary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 360,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        "LongCat API Error:",
        data?.error?.message || response.statusText,
      );
      return jsonResponse({error: "Error connecting to the archive."}, 502);
    }

    const answer = data?.choices?.[0]?.message?.content?.trim();

    return jsonResponse({
      answer:
        answer ||
        "The archive is currently unresponsive. Please try again later.",
    });
  } catch (error) {
    console.error("LongCat API Error:", error);
    return jsonResponse({error: "Error connecting to the archive."}, 502);
  }
}
