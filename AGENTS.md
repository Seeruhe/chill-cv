# AGENTS.md

本文件面向进入本仓库协作的代理或开发者，帮助你快速理解项目、减少误改，并用尽量小的改动完成任务。

## 1. 项目概览

- 项目名称：`chill-cv`
- 类型：Vite + React 19 + TypeScript 单页前端，含 `3d-album-stack` npm workspace（用于 Stack 屏的 3D 卡片堆叠）
- 性质：交互式个人简历 / 作品集，以 Chill FM 复古电台界面作为视觉风格
- 上游来源：fork 自 `chill-fm` 项目，完整保留 Home 屏的音乐播放台作为品牌氛围
- AI 能力：通过后端 API 调用 LongCat `LongCat-Flash-Chat`（OpenAI 兼容协议），扮演简历档案管理员，回答访客关于本人经验、技能、项目的问题

两屏结构：

- **Home 屏（screenIndex 0）**：FM 电台界面 + 音乐播放台 + 艺人故事面板。这部分是品牌气氛，不要随意拆。
- **Stack 屏（screenIndex 1）**：iframe 加载 `3d-album-stack` 子项目，呈现 3D 项目卡片堆叠。

## 2. 关键文件

- `src/App.tsx`
  主应用状态协调位置。除非任务明确要求重构，否则优先做局部、小范围修改。

- `api/ask-resume.js`
  Vercel serverless API。读取服务端 `LONGCAT_API_KEY`、把 `RESUME_SUMMARY` 与访客问题合成 prompt、调用 LongCat、只把 AI 回复返回给前端。**简历内容（`OWNER_NAME`、`RESUME_SUMMARY`）需要本人手填**。

- `src/services/aiService.ts`
  浏览器端 AI 请求封装。只能调用 `/api/ask-resume`，不要在这里直接访问 LongCat 或读取真实 API key。

- `src/index.css`
  全局样式、主题 token、动画 keyframes。视觉修改优先复用现有变量。

- `vite.config.ts`
  Vite、React、Tailwind 与路径别名配置。**不要在这里注入 `LONGCAT_API_KEY` 或其它真实 provider key。**

- `3d-album-stack/`
  独立 3D 项目卡片堆叠 workspace，通过 iframe 在主应用中加载。
  - 卡片数据在 `3d-album-stack/src/App.tsx` 的 `ALBUMS` 常量（变量名是历史遗留，承载的是项目数据，可后续按需重命名为 `PROJECTS`）。
  - 外链 / 补充信息在同文件的 `WIKI_CONTEXT` 对象，按 `hl`（项目名）做 key。
  - 字段说明：`brand` 项目类别、`hl` 项目名、`artist` 角色 / 上下文、`year` 年份、`genre` 技术栈短标签、`pills` 短 tag、`story.en/zh` 长叙事。

- `README.md`
  项目入口说明。

## 3. 运行方式

常用命令：

- `npm install`
- `npm run dev`（仅前端 vite，不含 `/api/ask-resume`）
- `npm run build`（先 build 子项目到 `public/3d-album-stack/`，再 build 主应用）
- `npm run lint`（实际跑 `tsc --noEmit`）
- `npm run lint:stack`

完整本地体验（含 AI 路由）：

```fish
npm install
npm run build:stack
vercel dev --listen 0.0.0.0:43100
```

如果只改主 `src/`，HMR 正常。如果改了 `3d-album-stack/src/`，需要重新 `npm run build:stack` 并把产物拷到 `public/3d-album-stack/`，然后浏览器刷新 iframe。

## 4. 环境变量与安全

- 本地和 Vercel 需要服务端环境变量 `LONGCAT_API_KEY`（可选 `LONGCAT_API_URL`、`LONGCAT_MODEL`）
- 示例见 `.env.example`
- 不要把真实密钥写入源码、提交仓库或硬编码到组件中
- 不要用 Vite `define`、`VITE_` 前缀或其它方式把 provider key 注入前端 bundle
- LongCat 调用必须通过 `/api/ask-resume` 服务端边界完成

## 5. 简历内容怎么填

简历助手只会基于 `api/ask-resume.js` 的 `RESUME_SUMMARY` 回答。建议保持精简、事实化、可核验，避免营销腔。例如：

```js
const OWNER_NAME = "Your Name";
const RESUME_SUMMARY = `
Role: Senior Frontend Engineer @ Acme
Years: 6
Stack: TypeScript, React, Node.js, ...
Notable projects:
  - Project A — built X for Y, reduced Z by N%.
  - Project B — open source CLI used by N teams.
Education: BSc CS, Some University, 2020
Languages: English, 中文
Contact: you@example.com / github.com/you
`.trim();
```

模型被指示不得编造未在 summary 里出现的内容；如果访客问到 summary 之外的内容，模型会说没有记录。

## 6. 编辑建议

- 小改优于大改
- 修改 AI 相关能力时，同时检查：
  - `api/ask-resume.js`
  - `src/services/aiService.ts`
  - `src/App.tsx` 中发起请求与展示响应的部分
- 修改 stack 项目卡时，同时检查：
  - `3d-album-stack/src/App.tsx` 的 `ALBUMS` 与 `WIKI_CONTEXT`
  - 如果改了卡片渲染结构，记得 `npm run build:stack` + 拷到 `public/3d-album-stack/`
- 修改视觉样式时，同时检查 `src/index.css` + `src/App.tsx` 中的 Tailwind class

## 7. 验证标准

- `npm run lint` 与 `npm run build`
- 如改了 `3d-album-stack/`，多跑 `npm run lint:stack`
- 涉及 UI 时浏览器手动确认：
  - Home 屏正常加载，"Browse My Projects →" 按钮可切到 Stack 屏
  - Stack 屏 iframe 正常加载，卡片可点击展开
  - AI 弹窗可打开 / 关闭，提问得到合理回复

## 8. 上游差异（与 chill-fm 的区别）

| 维度 | chill-fm | chill-cv |
|---|---|---|
| 用途 | 音乐电台体验 | 个人简历 / 作品集 |
| Home 屏 | 音乐播放台 | 同上（保留作为品牌氛围）|
| Stack 屏 | 3D 专辑堆叠 | 3D 项目卡片堆叠 |
| AI 路由 | `/api/ask-artist` | `/api/ask-resume` |
| AI 角色 | 音乐档案管理员 | 简历档案管理员 |

## 9. 一句话总结

这是一个把音乐电台架构改造成"会说话的简历"的项目。Home 是氛围，Stack 是项目，AI 是档案管理员。优先保护视觉语言、播放连续性和服务端边界。
