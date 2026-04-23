# Personal Portfolio Site — 实施方案

> 目标：面试用的个人网站，展示工程能力 + AI 技术栈。零成本部署。

---

## 1. 技术栈（全免费）

| 层 | 选择 | 理由 |
|---|---|---|
| 框架 | **Next.js 15 App Router + TS** | 简历标配，SSR/RSC |
| 样式 | **Tailwind + shadcn/ui** | 快速出精致 UI |
| AI SDK | **Vercel AI SDK v6** | 统一 provider，面试亮点 |
| 模型 | **Gemini 2.0 Flash** (Google AI Studio 免费 tier：1500 req/day) | 零成本 |
| 备用 | Groq (Llama 3.3 70B) 免费 tier | 演示 multi-provider fallback |
| 部署 | **Vercel Hobby** | 免费，自动 CI/CD |
| 包管理 | pnpm | |

**不用**：数据库（简历内容写在 MDX 文件里就够）、Auth（没必要）、付费 AI。

---

## 2. 页面结构

```
app/
├── (marketing)/
│   ├── page.tsx              — Hero + 自我介绍
│   ├── projects/page.tsx     — 项目卡片列表
│   ├── projects/[slug]/      — 每个项目详情（MDX）
│   └── blog/                 — 可选：技术博客
├── chat/
│   └── page.tsx              — "Ask me anything" AI 对话
├── api/
│   └── chat/route.ts         — AI 后端 (streaming)
content/
├── profile.md                — 简历 / 背景（RAG 语料）
├── projects/*.md             — 每个项目一个 md
└── skills.md
lib/
├── ai/
│   ├── provider.ts           — Gemini + Groq fallback
│   ├── retrieval.ts          — 简版 RAG
│   └── system-prompt.ts
└── content.ts                — 读 MDX / frontmatter
```

---

## 3. AI 功能设计（简历亮点）

### 核心：「Ask me anything about Yanpeng」

```
User: "他做过哪些 AI 项目？"
  ↓ 检索 content/projects/*.md（关键词 + 可选向量）
  ↓ 组装 context
  ↓ Gemini Flash streaming
  ↓ 打字机效果输出
```

### 实现要点（面试时可以讲）
1. **Streaming UI** — Vercel AI SDK 的 `useChat` + `streamText`
2. **RAG（简版）** — 简历 chunks + 关键词匹配。代码 < 50 行，但概念完整。想加分可以换成 `@vercel/blob` 存 embedding + 余弦相似度。
3. **Grounded answers** — system prompt 严格要求「只基于 context 回答，否则说不知道」，避免 AI 胡编简历。
4. **Multi-provider fallback** — Gemini 429 时自动切 Groq。代码里用 AI Gateway 或手写 try/catch。
5. **Rate limit** — Upstash Redis 免费 tier，按 IP 限流防止刷爆 quota。

---

## 4. 内容（你要准备的）

写到 `content/`：
- `profile.md` — 一段自我介绍 + 教育 + 工作经历
- `projects/admitly.md` — 重点写这个：RAG、multi-agent、model routing
- `projects/auto-apply-extension.md`
- `projects/study-abroad-platform.md`
- `skills.md` — 技术栈列表

**建议**：每个项目写 300-500 字，包含「做了什么 / 用了什么技术 / 解决了什么问题 / 学到什么」。这些直接成为 RAG 语料。

---

## 5. 实施步骤（建议顺序）

```
Phase 1 — 骨架（半天）
  [ ] pnpm create next-app + tailwind + shadcn init
  [ ] 搭首页 Hero + Projects 卡片（静态）
  [ ] 部署到 Vercel，拿到域名

Phase 2 — 内容（半天）
  [ ] 写 content/*.md
  [ ] MDX 渲染项目详情页
  [ ] 响应式调整

Phase 3 — AI Chat（1 天）— 重头戏
  [ ] Google AI Studio 拿 API key
  [ ] /api/chat streaming endpoint
  [ ] /chat 页面 + shadcn 对话 UI
  [ ] 简版 RAG：读所有 content/*.md → chunk → 关键词打分
  [ ] System prompt：grounded + 拒答无关问题

Phase 4 — 加分项（可选）
  [ ] Upstash rate limit
  [ ] Groq fallback
  [ ] 向量版 RAG（embedding + cosine）
  [ ] 简历 PDF 下载
  [ ] /api/chat 的 conversation 存 Vercel KV（演示有状态）
```

---

## 6. 环境变量

```
GOOGLE_GENERATIVE_AI_API_KEY=...    # https://aistudio.google.com/apikey
GROQ_API_KEY=...                    # 可选，fallback
UPSTASH_REDIS_REST_URL=...          # 可选，rate limit
UPSTASH_REDIS_REST_TOKEN=...
```

都用 `vercel env` 管理。

---

## 7. 面试时怎么讲

准备 3 句话版本：
> 「用 Next.js 15 + Vercel AI SDK 做了个人站，核心是一个基于简历内容的 RAG 对话机器人。用 Gemini Flash 免费 tier，加了 Groq fallback 和 Upstash rate limit。整站零成本运行，streaming + grounded answers，防止 AI 胡编我的经历。」

关键词打钩：**Next.js App Router / RSC / RAG / streaming / AI SDK / multi-provider / rate limiting / grounded generation**。

---

## 8. 风险 & 取舍

- **不做**：登录、评论、CMS、数据库。YAGNI。
- **向量 RAG vs 关键词**：内容就几千字，关键词够用。非要上向量就用 `@vercel/blob` 存 JSON，运行时加载到内存做 cosine —— 零基础设施。
- **Gemini 免费额度**：1500/day 完全够面试 demo。担心刷爆就加 rate limit。

---

## 下一步

确认方案后，我可以：
- A) 帮你跑 `pnpm create next-app` 并搭好 Phase 1 骨架
- B) 只写 `/api/chat` 和 RAG 逻辑（AI 部分），UI 你自己搭
- C) 生成内容模板（`profile.md` 等填空版）

你选哪个？
