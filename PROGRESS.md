# Portfolio Site — 进度记录

> 最后更新：2026-04-23

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
- [x] **Stats 行**：4块数据卡（4+ 年 / 1M+ 用户 / 54% 降本 / 92% 精准率），fade-up 动画
- [x] **项目卡片**：每个项目独立渐变头图 + Emoji，hover 发光 + 箭头动画
- [x] **终端风格预览区**：首页底部展示 chat 效果
- [x] **Chat UI**：玻璃气泡、青色送出按钮、带 emoji 的建议问题
- [x] **自定义滚动条**、`glass` / `glow-card` / `neon-border` 工具类
- [x] CSS 动画库：`fade-up` / `fade-in` / `float` / `glow-pulse` / `shimmer` / `slide-left`，支持 `delay-*` 错落
- [x] **页面 Title/描述**更新为真实信息（移除默认 "Create Next App"）
- [x] **prose-custom** 样式：项目详情页 Markdown 渲染（h1/h2/h3、strong、code、list）

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
- [ ] **Upstash Rate Limit** — 按 IP 限流（5次/分钟），防止 API quota 被打空
  - 申请：https://upstash.com（免费 tier）
  - 需要环境变量：`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

### 🟡 P1 — 技术深度
- [ ] **向量 RAG**（Embedding + 余弦相似度）
  - 用 Google Embedding API 生成向量，内存内做 cosine search
  - 比关键词匹配更准确，面试故事更完整
- [ ] **Groq API Key** — 去 https://console.groq.com 申请，加到 Vercel env，fallback 即生效

### 🟢 P2 — 实用
- [ ] **简历 PDF 下载** — 把 `Yanpeng Qi_resume.pdf` 放入 `public/`，首页加下载按钮
- [ ] **Vercel Analytics** — 一行代码，免费，能看访客数据
- [ ] **OG Image** — 社交分享预览图（LinkedIn / 微信）
- [ ] **自定义域名** — 在 Vercel Dashboard 绑定（如 `yanpengqi.dev`）
