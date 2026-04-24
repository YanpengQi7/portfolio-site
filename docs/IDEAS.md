# Ideas — 还可以加的 feature

> 不是实现手册，是选题清单。每个条目 = 一段介绍 + 实现草图 + 工作量 + 为什么值得做。
> 具体哪两个要不要动手，参考 `FUTURE_FEATURES.md`。
> 最后更新：2026-04-23

## 目录

- [🧠 AI 技术深度（对 AI 岗最加分）](#-ai-技术深度对-ai-岗最加分)
  - [A1 向量 RAG 升级](#a1-向量-rag-升级)
  - [A2 Evals Dashboard](#a2-evals-dashboard)
  - [A3 多 Agent Playground](#a3-多-agent-playground)
  - ["A4 Why Hire Me" RAG Scorecard](#a4-why-hire-me-rag-scorecard)
  - [A5 Conversation Memory 可视化](#a5-conversation-memory-可视化)
  - [A6 Prompt Caching 指标面板](#a6-prompt-caching-指标面板)
- [✨ 视觉 & 交互](#-视觉--交互)
  - [V1 Magnetic Cursor + Trail](#v1-magnetic-cursor--trail)
  - [V2 Scroll-Linked Reveals（Framer Motion）](#v2-scroll-linked-reveals-framer-motion)
  - [V3 3D Neural Network Hero（R3F）](#v3-3d-neural-network-hero-r3f)
  - [V4 Dynamic OG Images](#v4-dynamic-og-images)
  - [V5 Keyboard Shortcuts Overlay（? 键）](#v5-keyboard-shortcuts-overlay-键)
- [👀 访客 / 招聘方体验](#-访客--招聘方体验)
  - [U1 Contact Form（Resend）](#u1-contact-formresend)
  - [U2 Cal.com 预约](#u2-calcom-预约)
  - [U3 GitHub 活动流](#u3-github-活动流)
  - [U4 中英双语 i18n](#u4-中英双语-i18n)
  - [U5 AI 自动生成 Blog 摘要](#u5-ai-自动生成-blog-摘要)
  - [U6 Reading Progress Bar](#u6-reading-progress-bar)
- [📚 内容 & 结构](#-内容--结构)
  - [C1 Project Lineage Graph](#c1-project-lineage-graph)
  - [C2 Career Timeline](#c2-career-timeline)
  - [C3 "Now" 页面](#c3-now-页面)
  - [C4 Case Study 深度模板](#c4-case-study-深度模板)
- [优先级 Top 5 推荐](#优先级-top-5-推荐)

---

## 🧠 AI 技术深度（对 AI 岗最加分）

### A1 向量 RAG 升级

**做什么**
把现在的关键词打分换成真正的 embedding + cosine similarity。
- 构建时：`content/*.md` → chunk → Google `text-embedding-004` → 存 JSON
- 运行时：query → embed → 内存 cosine 排序 → top-k
- 结果：同义词、语义匹配能命中（用户问 "machine learning"，能匹配到写着 "LLM" 的 chunk）

**工作量**：~150 行，半天

**实现要点**
- `scripts/build-embeddings.ts` — build hook，产出 `public/embeddings.json`
- `lib/ai/retrieval.ts` 新增 `retrieveRagVector()`
- chunk 大小 ~500 tokens，overlap 50
- 保留现有关键词版本做 A/B

**为什么值得做**
- PROGRESS.md 已列为 P1
- 面试必考题："你的 RAG 是真实的吗？" — 现在的版本其实是倒排索引
- 可以写文章：已经有一篇 `rag-quality-is-mostly-retrieval-design.md` 可以补实验数据

---

### A2 Evals Dashboard

**做什么**
做一个 `/evals` 页面，展示 AI chat 回答质量的评估矩阵。
- 20–30 条真实问题（写进 `content/evals/questions.json`）
- 每条标 ground-truth 关键信息点
- Nightly CI job 跑全量 → 比对 → 生成 `public/evals-results.json`
- 页面展示：通过率、失败 case、耗时分布、成本估算

**工作量**：~400 行 + GitHub Actions，1–2 天

**实现要点**
- `lib/evals/runner.ts` — 跑问题集，调 `/api/chat`，用另一个 LLM 做 judge
- `.github/workflows/nightly-evals.yml` — 每晚跑一次，结果 commit 回仓库
- 页面可视化：hit rate heatmap、按问题类型分组、失败 case 可点开看完整对话

**为什么值得做**
- AI 工程界现在最稀缺的技能就是 evals
- 博客 `agent-systems-need-evals-before-they-need-more-tools.md` 直接对应
- 面试时说 "我对自己的 RAG 有自动化 evals" 是降维打击
- Admitly 项目也能复用

---

### A3 多 Agent Playground

**做什么**
一个 `/playground/agents` 页面，让访客看到多个 agent 协作解一个真实问题。
- 例子："Review my SDE resume" → Extract Agent（parse） → Critic Agent（找问题） → Rewrite Agent（改写）
- 可视化：左边是 DAG 图，节点随执行亮起；右边是每个 agent 的 I/O

**工作量**：~500 行，2 天

**实现要点**
- `lib/agents/` 目录，每个 agent 一个文件，走 `router.ts`
- 前端用 `react-flow` 或手写 SVG DAG
- SSE stream：每个 agent 完成时 push 一个 event
- 限制：只让跑 3 个预设场景，防止滥用 + 成本

**为什么值得做**
- "我用多 agent 编排"是简历关键词
- 结合 Admitly 的多 agent 架构，一鱼两吃
- 访客有交互感，不只是"看"

---

### A4 "Why Hire Me" RAG Scorecard

**做什么**
首页/about 页面加一块 "Why Hire Me"。页面加载时**并发**对 RAG 发 3 个固定问题：
1. "What are Yanpeng's AI engineering strengths?"
2. "What's Yanpeng's experience at production scale?"
3. "Why would Yanpeng be a strong hire?"

每个答案在独立卡片里流式渲染出来，带一个小 "regenerate" 按钮。

**工作量**：~120 行，3–4 小时

**实现要点**
- `app/_components/hire-me-cards.tsx` 客户端组件
- 用现有的 `useChat` 三个独立实例
- 用 `<Suspense>` 骨架屏
- `no-store` 但加 localStorage 缓存 1 小时（省 quota）
- 刻意让回答不一样：每个问题用不同 system prompt variation

**为什么值得做**
- 招聘方 3 秒内就有一份"为什么"
- **展示 AI 可以"销售"你**，而不是只是"回答"
- 低工作量高 visibility

---

### A5 Conversation Memory 可视化

**做什么**
`/chat` 的多轮对话，显示 AI 记住了什么：侧栏里显示"mental model"——从用户历史消息里抽取的 entity / intent。

例子：
```
👤 You mentioned:
  • Working in Seattle
  • Interested in AI engineer roles
  • Has ML background

🎯 Current intent:
  Evaluating Yanpeng's fit for a specific role
```

**工作量**：~200 行，半天

**实现要点**
- 新增 `lib/ai/extract-memory.ts`，每 3 轮调一次 Haiku 抽取
- 结构化输出（Zod schema + tool use）
- 存在 conversation metadata 里
- 侧栏 sticky 显示

**为什么值得做**
- "有状态对话" 是大部分 chatbot 缺的
- Claude SDK 最近主推 context engineering，这是个小 demo
- 解释"为什么我的 chat 越用越懂你"

---

### A6 Prompt Caching 指标面板

**做什么**
一个 admin-only 页面 `/admin/metrics`，显示：
- 每 provider 的 cache hit rate
- 每个任务 tag（profile 查询 / project 查询 / eval）的平均延迟
- Token 消耗趋势

**工作量**：~250 行，半天～1 天

**实现要点**
- 写入点：`api/chat/route.ts` 在 `onFinish` 里把 usage/cache 信息存 Upstash
- 用简单 Basic Auth 保护 `/admin`
- 前端用 `recharts` 画 2 张趋势图

**为什么值得做**
- "你知道自己的 AI 多贵吗？" 是所有 AI startup 面试必问
- 博客 `model-routing-is-a-product-decision.md` 直接对应
- 真实数字比"我懂成本优化"更有说服力

---

## ✨ 视觉 & 交互

### V1 Magnetic Cursor + Trail

**做什么**
自定义鼠标：
- 普通状态：小圆点 + 8px 拖尾
- hover 到交互元素：圆点膨胀变成圆环，跟随元素"吸附"
- 点击：粒子爆裂

**工作量**：~100 行

**实现要点**
- 全局 `cursor: none`（或只 desktop）
- `<CustomCursor />` 客户端组件，`requestAnimationFrame` 跟随
- 用现有 `magnetic-button` class 识别 hover target
- mobile 完全关掉

**为什么值得做**
- 设计系 portfolio 标配，凸显审美
- 和现有 `magnetic-button` 天然衔接

---

### V2 Scroll-Linked Reveals（Framer Motion）

**做什么**
首页滚动时元素**真实响应滚动位置**：
- 项目卡片：进入视口时从右边 slide in，每张错开 100ms
- Stats 数字：进视口时从 0 animate 到目标数（`useMotionValue` + spring）
- 区块标题：在视口 50% 位置时 scale / opacity 变化

**工作量**：~150 行（大部分是替换现有 `animate-fade-up`）

**实现要点**
- 装 `framer-motion`（~40KB）
- 把所有 `animate-fade-up` + `delay-*` 替换成 `whileInView` + `viewport={{ once: true }}`
- Stats 数字：`<CountUp>` 组件，进视口触发

**为什么值得做**
- 现在的 fade-up 是"一次性播放"，滚回去再下来没动画
- Framer Motion 比 CSS 可控得多
- **⚠️ 风险**：包大小从 ~110KB → ~150KB，可能需要权衡

---

### V3 3D Neural Network Hero（R3F）

**做什么**
首页 hero 左/右半边放一个 3D 神经网络图：
- 节点浮在空间里，半透明球
- 边连接，数据在边上作为粒子流动
- 鼠标 drag 可旋转，auto-rotate 缓慢
- 层对应你简历里的能力（Frontend / AI / Infra）

**工作量**：~300 行，1 天

**实现要点**
- `@react-three/fiber` + `@react-three/drei`（~200KB ）
- 用 `instancedMesh` 画节点，`<Line>` 画连接
- 粒子：`<Points>` + shader
- 降级：`prefers-reduced-motion` → 静态 SVG

**为什么值得做**
- "AI-themed"视觉最直接的表达
- **⚠️ 风险**：很吃包大小（+250KB）、很吃 GPU，对招聘方没直接信息量
- 更像"技术展示"而不是"信息传递"
- 跟 `#4 Shader 背景` 二选一，别都做

---

### V4 Dynamic OG Images

**做什么**
每个页面分享到微信/LinkedIn/Twitter 时，显示**自动生成的卡片**：
- 首页：头像 + "Yanpeng Qi — AI Builder & SDE"
- 项目页：项目图标 + 标题 + tech stack
- 博客页：文章标题 + 发布日期 + 阅读时间

**工作量**：~80 行

**实现要点**
- Next.js 内置：`app/og/route.tsx` 用 `ImageResponse` from `next/og`
- 对每个动态路由写一个 `opengraph-image.tsx`
- metadata 里加 `openGraph: { images }`

**为什么值得做**
- 零运行时成本（在 build + edge 生成）
- 分享链接视觉提升巨大
- 朋友圈/LinkedIn 直接展示"这是个精心做的站"

---

### V5 Keyboard Shortcuts Overlay（? 键）

**做什么**
按 `?` 弹一个浮层，列出所有快捷键：
```
G H    → Home
G P    → Projects
G B    → Blog
G C    → Chat
⌘ K    → Command palette
⌘ J    → Theme toggle
?      → This help
```

**工作量**：~80 行

**实现要点**
- 全局 `keydown` + 状态机（等 G 后再等第二个字母）
- `next/navigation` router.push
- 用 base-ui 的 Dialog

**为什么值得做**
- GitHub / Linear / Vercel 都有这个
- **极低成本，极高"懂的人会爱"信号**
- 和 ⌘K 终端是配套

---

## 👀 访客 / 招聘方体验

### U1 Contact Form（Resend）

**做什么**
`/contact` 页面简单表单（name + email + message）→ 发邮件到 `qyanpeng1995@gmail.com`。

**工作量**：~100 行

**实现要点**
- `pnpm add resend`，注册 resend.com 免费 3000 封/月
- server action 处理提交
- 加 honeypot + 现有 rate limit
- 成功后显示 "I'll reply within 48h"

**为什么值得做**
- 不是每个人都有 LinkedIn/GitHub 账号
- 比 `mailto:` 更正式
- 可以收集 referrer 做分析

---

### U2 Cal.com 预约

**做什么**
在首页或 CV 页嵌入一个 Cal.com iframe，访客直接选 15min coffee chat 时间。

**工作量**：30 分钟（注册 + 嵌入）

**实现要点**
- 注册 cal.com 免费号
- 连接 Google Calendar
- `@calcom/embed-react` 一行嵌入

**为什么值得做**
- 招聘方最讨厌 "email tag"，能直接约时间就约
- 信号："我 serious 对话 opportunities"

---

### U3 GitHub 活动流

**做什么**
`/repositories` 或首页底部加一块实时 GitHub 数据：
- 最近 5 条 commit
- 本月活跃天数 heatmap
- 公开仓库 star 数总和

**工作量**：~150 行

**实现要点**
- GitHub REST API（公开数据不需 auth，但建议加 token 提高限流）
- ISR：`revalidate: 3600`
- Heatmap：用 `react-activity-calendar` 或手写 7×52 grid

**为什么值得做**
- "我还在 coding" 的被动证明
- 展示 Admitly 的 commit 频率 → 对面看得出这是 real project

---

### U4 中英双语 i18n

**做什么**
所有页面 + blog 双语切换，URL 从 `/blog/foo` → `/zh/blog/foo`。

**工作量**：~400 行 + 内容翻译，2 天

**实现要点**
- Next.js 14+ 内置 i18n routing（App Router 要自己做 `[locale]` segment）
- `next-intl` 库
- blog 内容：每篇写两份 `.md` 或用 frontmatter 分语言
- language toggle UI 放在 nav

**为什么值得做**
- 你在找中/美两边 AI 岗位 → 对应两边招聘方
- **⚠️ 维护成本翻倍**，想清楚是否值得
- 如果只面北美岗，不必做

---

### U5 AI 自动生成 Blog 摘要

**做什么**
每篇 blog 顶部加一块"AI TL;DR"：
- Build time 用 Haiku 生成 2 句话摘要
- 不是 frontmatter 里的手写 summary，是 AI 读完全文产出
- 访客看到会好奇"诶这个站的 AI 真的读了所有内容"

**工作量**：~80 行

**实现要点**
- `scripts/generate-summaries.ts`：build 时跑一次
- 结果写进 `content/blog/_summaries.json`
- page 里读取渲染

**为什么值得做**
- 微型 "AI workflow" demo
- 可以做 A/B：人写的 vs AI 写的，展示你的 judgement

---

### U6 Reading Progress Bar

**做什么**
blog / project 详情页顶部一条 2px 高的 progress bar，跟随滚动。

**工作量**：30 行

**实现要点**
- `window.scrollY / (docHeight - windowHeight)`
- CSS `transform: scaleX()` 动画
- `requestAnimationFrame` throttle

**为什么值得做**
- 微交互，但**几乎每个人都喜欢**
- Medium / Substack 标配

---

## 📚 内容 & 结构

### C1 Project Lineage Graph

**做什么**
`/projects` 页面顶部加一个力导向图：
- 节点 = project
- 边 = 共享的 tech（React、Claude API、AWS）
- hover 节点高亮相关项目
- 侧面图例列出所有 tech

**工作量**：~250 行

**实现要点**
- `d3-force` + SVG，或 `@xyflow/react`
- 从 `project.tech` 字段动态构造 graph
- 配色用 `PROJECT_VISUALS` 保持统一

**为什么值得做**
- 让招聘方"一眼看全"你的技术栈分布
- 比列表有视觉记忆点
- 写博客"我怎么复用技术栈"很好的配图素材

---

### C2 Career Timeline

**做什么**
`/cv` 或独立 `/timeline` 页面：横向时间轴。
- 2013–2017 B.S. Sun Yat-Sen
- 2018–2020 M.S. U Penn
- 2021– Amazon SDE
- 项目节点插在对应时间上
- Blog 节点插在发布时间上
- 鼠标 hover 时间点显示详情

**工作量**：~200 行

**实现要点**
- 数据：把现有 content 加时间字段后聚合
- 用 SVG 手画，响应式（手机上转竖向）

**为什么值得做**
- 一页展示"你的 story arc"
- 比 CV 更有叙事性
- 可以把 Admitly 的milestones 放进去

---

### C3 "Now" 页面

**做什么**
一个 `/now` 页面（借鉴 nownownow.com 概念）：
- "This week I'm working on:..."
- "Currently reading:..."
- "Recent win:..."
- 手动维护，每 1–2 周更新

**工作量**：30 行 + 每周 10 分钟维护

**实现要点**
- 就是一个 markdown 文件
- 首页 footer 加链接

**为什么值得做**
- 招聘方看到"这个人在活"
- 比 "last updated 2023" 好 1000 倍
- 省力，纯内容

---

### C4 Case Study 深度模板

**做什么**
选 1 个项目（建议 Admitly），把 `/projects/admitly` 从现在的 "简介 + 功能列表" 升级成**真正的 case study**：
- Context（为什么做）
- Users（谁要用）
- Architecture diagram（一张图）
- Hard decisions（3 个技术取舍 + 为什么那样选）
- Results / metrics（数字）
- Lessons learned（诚实列失败）

**工作量**：~4 小时（主要是写）

**实现要点**
- 新增 frontmatter field：`caseStudy: true`
- 用现有 `prose-custom` 样式
- diagram 用 excalidraw 或 mermaid

**为什么值得做**
- Stripe / Linear / Figma 的招聘页都要 "tell me about one project deeply"
- 这是现成的回答
- Case study 的**质量**比项目**数量**重要

---

## 优先级 Top 5 推荐

| # | Feature | 类别 | 工作量 | 回报 |
|---|---------|------|--------|------|
| 1 | **A4 Why Hire Me Scorecard** | AI | 3–4h | 🔥🔥🔥🔥🔥 首屏即 demo |
| 2 | **A2 Evals Dashboard** | AI | 1–2d | 🔥🔥🔥🔥🔥 AI 岗杀手锏 |
| 3 | **A1 向量 RAG 升级** | AI | 半天 | 🔥🔥🔥🔥 面试必考 |
| 4 | **V4 Dynamic OG Images** | 视觉 | 80 行 | 🔥🔥🔥🔥 分享链接必备 |
| 5 | **C4 Admitly Case Study** | 内容 | 4h | 🔥🔥🔥🔥 招聘 deep dive |

**避坑**：
- V3 3D 神经网络：好看但吃 250KB，除非面设计岗别做
- U4 i18n：维护翻倍，除非真的两边都面
- V2 Framer Motion：先评估包大小
