# Portfolio Site — 进度记录

> 最后更新：2026-04-23（+ 实时 RAG 可视化 & View Transitions）

---

## 🌐 线上地址

| 项目 | URL |
|------|-----|
| **生产站点** | https://portfolio-site-chi-sooty.vercel.app |
| **GitHub 仓库** | https://github.com/YanpengQi7/portfolio-site |
| **Vercel Dashboard** | https://vercel.com/yanpengqi7s-projects/portfolio-site |

---

## ✅ 已完成

### Phase 1 — 骨架 & 部署

- [x] `pnpm create next-app` — Next.js 16 + TypeScript strict + Tailwind CSS
- [x] 安装 shadcn/ui（Button、Badge、Separator 等组件）
- [x] 搭首页 Hero + Projects 卡片（静态）
- [x] 部署到 Vercel Hobby（自动 CI/CD，每次 `git push main` 自动重部署）
- [x] 创建 GitHub 仓库 `YanpengQi7/portfolio-site`，自动 push

### Phase 2 — 内容（基于真实简历）

内容文件全部参考 `Desktop/Interview/resume.tex` 和 `Resume_Deep_Dive.md` 撰写：

- [x] `content/profile.md` — 真实经历：Amazon SDE（2021–至今）、U Penn MS、Sun Yat-Sen BS
- [x] `content/skills.md` — 完整技术栈（Java/Python/TS、AWS、Claude API、pgvector、MCP 等）
- [x] `content/projects/admitly.md` — 含真实指标（16 task-tagged ops、92% RAG precision、54% cost reduction、78% eval pass rate）
- [x] `content/projects/ai-financial-agent.md` — 多工具推理 Agent、embedding 聚类、< 3s 延迟
- [x] `content/projects/auto-apply-extension.md` — Chrome MV3、Claude function calling
- [x] `content/projects/study-abroad-platform.md` — WeChat Mini Program + Node.js + WeChat Pay
- [x] MDX 渲染项目详情页（`/projects/[slug]`，静态生成）
- [x] 响应式布局

### Phase 3 — AI Chat（核心功能）

- [x] Google AI Studio API Key 配置（Gemini 2.5 Flash）
- [x] `/api/chat` — 流式 SSE endpoint，Vercel AI SDK v6 `streamText` + `toUIMessageStreamResponse`
- [x] `/chat` 页面 — `useChat` hook，打字机效果，建议问题卡片
- [x] **简版 RAG**：读取所有 `content/*.md` → 段落级 chunking → 关键词打分 → top-k 注入 system prompt
- [x] **Grounded system prompt**：严格要求「只基于 context 回答，否则告知无法回答」，防止 AI 胡编简历
- [x] **Multi-provider fallback**：Gemini 2.5 Flash → Groq Llama 3.3 70B（自动降级）
- [x] `next.config.ts` 配置 `outputFileTracingIncludes`，确保 `content/` 目录打包进 serverless 函数
- [x] **Markdown 渲染**：`react-markdown` 渲染 AI 回答中的 **粗体**、列表、代码块

### 视觉设计升级

- [x] **暗色主题**（全站默认深色，`oklch` 色彩空间）
- [x] **背景光晕**：3个动态渐变 orb（青/紫/粉），CSS `glow-pulse` 动画
- [x] **网格/点阵背景**：`grid-bg` / `dot-bg` utility class
- [x] **Shimmer Logo**：`YQ` 彩虹渐变扫光动画
- [x] **Hero 标题**：渐变文字（青→紫→粉）
- [x] **浮动头像卡片**：发光圆环 + 3个角标（RAG / Multi-Agent / AWS），`float` 动画
- [x] **Stats 行**：4块数据卡（5 年 SDE / 1M+ 用户 / 54% 降本 / 92% 精准率），fade-up 动画
- [x] **项目卡片**：每个项目独立渐变头图 + Emoji，hover 发光 + 箭头动画
- [x] **终端风格预览区**：首页底部展示 chat 效果
- [x] **Chat UI**：玻璃气泡、青色送出按钮、带 emoji 的建议问题
- [x] **自定义滚动条**、`glass` / `glow-card` / `neon-border` 工具类
- [x] CSS 动画库：`fade-up` / `fade-in` / `float` / `glow-pulse` / `shimmer` / `slide-left`，支持 `delay-*` 错落
- [x] **页面 Title/描述**更新为真实信息（移除默认 "Create Next App"）
- [x] **prose-custom** 样式：项目详情页 Markdown 渲染（h1/h2/h3、strong、code、list）

---

## 🆕 本次会话改动（2026-04-23 晚）

> 主题：**「用 Claude design 把站点变得更酷」**
> 两个 commit 已推送到 `main`：`58438ad` + `d3e83ee`

### 1. 实时 RAG 可视化（Live RAG Visualization）

把 `/chat` 里原本黑盒的检索步骤变成可视化演示。每条 AI 回答下面多了一个
「**RAG · N chunks retrieved**」折叠面板，点开能看到 LLM 实际看到的原始内容。

**改动文件：**

| 文件 | 改动 |
|------|------|
| `lib/ai/retrieval.ts` | 新增 `retrieveRag()`，返回 `{context, chunks, fallback}`；保留旧 `retrieveContext()` 兼容 |
| `app/api/chat/route.ts` | 调用 `retrieveRag()`，通过 AI SDK v6 的 `messageMetadata` 回调在 `start` part 注入 chunk 预览（source + kind + score + snippet） |
| `lib/ai/conversation-store.ts` | `SaveConversationInput` 新增 `ragChunks` 字段，持久化到 Upstash |
| `app/chat/page.tsx` | 新增 `<RagPanel>` 组件：折叠按钮 + 按 kind 配色的 chunk 卡片（project 紫 / profile 青 / skills 绿 / blog 琥珀）+ 归一化得分进度条（青→紫渐变）+ 260 字符 snippet 预览；检测 `m.metadata.rag` 自动渲染 |

**可视化内容：**
- Source 文件名（monospace，例如 `projects/admitly.md`）
- Chunk kind（带颜色标签）
- 关键词匹配得分 + 相对百分比进度条
- 原始文本片段（最多 260 字符，`line-clamp-4`）
- `fallback` 标签：当无强匹配、使用全量 corpus 时显示

**技术亮点：**
用的是 AI SDK v6 的 `messageMetadata({part})` 回调，在 `part.type === 'start'`
时返回元数据，走在同一个 SSE 流里，无需额外请求。

### 2. View Transitions（路由跳转动画）

**改动文件：**

| 文件 | 改动 |
|------|------|
| `components/view-transition-link.tsx` | **新增**。包装 `next/link`，拦截 click 调用 `document.startViewTransition`；支持 `transitionName` prop 做 shared-element morph；非支持浏览器（Firefox）自动降级为普通 Link |
| `components/project-card.tsx` | 项目标题 `<h3>` + 「Case Study」按钮改用 `<ViewTransitionLink>`；标题传 `transitionName={\`project-title-${slug}\`}` |
| `app/projects/[slug]/page.tsx` | 详情页 `<h1>` 加上匹配的 `style={{viewTransitionName: \`project-title-${slug}\`}}` — 从卡片 morph 到详情页标题 |
| `app/globals.css` | 新增 `::view-transition-old/new(root)` 关键帧：360ms cross-fade + Y 轴微滑动；shared-element 标题 morph 500ms；`prefers-reduced-motion` 守卫 |

**效果：**
- 任何卡片/按钮点击跳转：全页 cross-fade + 轻微下滑（不是硬切）
- 从 `/projects` 点卡片进详情页：项目标题会**平滑放大移动**到详情页的大标题位置
- 零新依赖，零 Next 实验性 flag

### 3. 文档更新
- `PROGRESS.md`（本文件）新增本小节

### Commit 记录
```
d3e83ee feat: live RAG visualization in chat + View Transitions for project routes
58438ad feat: blog, CV page, repositories, theme toggle, analytics, rate limit
```

### 为什么这两个改动对「作品集」有价值
- **RAG 可视化**：招聘方看到的是「AI 说了什么」，现在还能看到「AI 为什么这么说」——把系统的工程细节暴露给面试官，直接当 demo 用
- **View Transitions**：零依赖展示对 Web 新标准的掌握（Next.js 16 + React 19.2 + 浏览器原生 API），比 Framer Motion 更「浏览器原生」的加分项

---

## 技术栈

| 层 | 选择 |
|----|------|
| 框架 | Next.js 16 App Router + TypeScript strict |
| 样式 | Tailwind CSS v4 + shadcn/ui + 自定义 CSS 动画 |
| AI SDK | Vercel AI SDK v6（`@ai-sdk/react` + `ai`） |
| 主力模型 | Gemini 2.5 Flash（Google AI Studio 免费 tier） |
| 备用模型 | Groq Llama 3.3 70B（fallback） |
| RAG | 关键词匹配 + 段落 chunking（`content/*.md`） |
| Markdown | `react-markdown` |
| 内容 | gray-matter 解析 frontmatter |
| 部署 | Vercel Hobby（自动 CI/CD） |
| 包管理 | pnpm |

---

## 页面结构

```
/                        首页：Hero + Stats + 项目卡片 + Chat CTA
/projects                项目列表（全部）
/projects/[slug]         项目详情（静态生成）
  /projects/admitly
  /projects/ai-financial-agent
  /projects/auto-apply-extension
  /projects/study-abroad-platform
/chat                    AI 对话页面
/api/chat                Streaming chat API（POST）
```

---

## 文件结构

```
portfolio-site/
├── app/
│   ├── layout.tsx               页面元数据 + 全局样式
│   ├── globals.css              暗色主题 + 所有自定义动画/工具类
│   ├── page.tsx                 首页
│   ├── projects/
│   │   ├── page.tsx             项目列表
│   │   └── [slug]/page.tsx      项目详情
│   ├── chat/page.tsx            AI 对话页面
│   └── api/chat/route.ts        Streaming API endpoint
├── components/
│   ├── project-card.tsx         项目卡片组件
│   └── ui/                      shadcn 组件
├── lib/
│   ├── content.ts               读取 content/*.md，解析 frontmatter
│   └── ai/
│       ├── provider.ts          Gemini + Groq fallback
│       ├── retrieval.ts         关键词 RAG（< 50 行）
│       └── system-prompt.ts     Grounded system prompt
├── content/
│   ├── profile.md               真实简历内容
│   ├── skills.md                技术栈
│   └── projects/
│       ├── admitly.md
│       ├── ai-financial-agent.md
│       ├── auto-apply-extension.md
│       └── study-abroad-platform.md
├── next.config.ts               outputFileTracingIncludes（RAG 文件打包）
└── .env.local                   GOOGLE_GENERATIVE_AI_API_KEY（不提交）
```

---

## 待完成（优先级排序）

### 🔴 P0 — 安全
- [x] **Upstash Rate Limit** — 按 IP 限流（5次/分钟），防止 API quota 被打空
  - 代码已接入 `/api/chat`；补齐环境变量后即可在本地/Vercel 生效
  - 申请：https://upstash.com（免费 tier）
  - 需要环境变量：`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

### 🟡 P1 — 技术深度
- [ ] **向量 RAG**（Embedding + 余弦相似度）
  - 用 Google Embedding API 生成向量，内存内做 cosine search
  - 比关键词匹配更准确，面试故事更完整
- [ ] **Groq API Key** — 去 https://console.groq.com 申请，加到 Vercel env，fallback 即生效

### 🟢 P2 — 实用
- [ ] **简历 PDF 下载** — 把 `Yanpeng Qi_resume.pdf` 放入 `public/`，首页加下载按钮
- [x] **Vercel Analytics** — 一行代码，免费，能看访客数据
- [ ] **OG Image** — 社交分享预览图（LinkedIn / 微信）
- [ ] **自定义域名** — 在 Vercel Dashboard 绑定（如 `yanpengqi.dev`）
