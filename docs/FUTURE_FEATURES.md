# Future Features — 实现手册

> 两个还没动工的高价值改动。本文档是实现草案，照着做就能落地。
> 最后更新：2026-04-23

---

## 目录

- [#4 WebGL Shader Hero 背景](#4-webgl-shader-hero-背景)
- [#8 ⌘K 终端彩蛋](#8-k-终端彩蛋)
- [对比与执行顺序](#对比与执行顺序)

---

## #4 WebGL Shader Hero 背景

### 目标
把首页 hero 区的 CSS 径向渐变（`animate-glow` / `animate-ambient`）换成
一块实时 GLSL shader 渲染的流动背景，跟鼠标 / 滚动联动，视觉明显区别于
"普通 portfolio"。

### 现状
- 现在首页背景：`app/page.tsx` → `components/home-page-client.tsx` 里
  有两三块 `radial-gradient` orb + `dot-bg` + CSS keyframe `animate-glow`
- 属于静态美化层级

### 技术选型

| 库 | 体积 | 何时选 |
|---|------|--------|
| **OGL** | ~15 KB gzip | ✅ 只要 shader，不要 3D mesh |
| `@react-three/fiber` + `three` | ~150 KB | 要 3D 物体（粒子球、神经网络）才值 |

**推荐 OGL。** 只贴一个全屏 quad + fragment shader 就够了。

安装：
```bash
pnpm add ogl
```

### 文件结构

```
components/
├── shader-hero-bg.tsx        ← 新建。客户端组件，挂载 <canvas>
└── home-page-client.tsx      ← 替换掉现有 CSS orb 背景块
lib/
└── shaders/
    ├── hero.frag.glsl        ← fragment shader（主要逻辑）
    └── hero.vert.glsl        ← vertex shader（全屏 quad 几乎不变）
```

### 组件骨架

```tsx
// components/shader-hero-bg.tsx
'use client'

import { useEffect, useRef } from 'react'
import { Renderer, Program, Mesh, Triangle } from 'ogl'
import fragSource from '@/lib/shaders/hero.frag.glsl?raw'
import vertSource from '@/lib/shaders/hero.vert.glsl?raw'

export default function ShaderHeroBg() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Respect user preference
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    el.appendChild(gl.canvas)

    const mouse = [0.5, 0.5]
    const onMove = (e: PointerEvent) => {
      mouse[0] = e.clientX / window.innerWidth
      mouse[1] = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener('pointermove', onMove)

    const program = new Program(gl, {
      vertex: vertSource,
      fragment: fragSource,
      uniforms: {
        u_time: { value: 0 },
        u_mouse: { value: mouse },
        u_resolution: { value: [1, 1] },
      },
    })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program })

    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight)
      program.uniforms.u_resolution.value = [gl.canvas.width, gl.canvas.height]
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      program.uniforms.u_time.value = (now - start) / 1000
      renderer.render({ scene: mesh })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
      gl.canvas.remove()
    }
  }, [])

  return (
    <div
      ref={ref}
      className="absolute inset-0 -z-10 opacity-60"
      aria-hidden
    />
  )
}
```

### Fragment shader（核心效果）

```glsl
// lib/shaders/hero.frag.glsl
precision highp float;

uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_resolution;

// Simplex / perlin noise (paste a standard implementation — ~30 lines)
float noise(vec2 p) { /* ... */ }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv * 3.0;
  p.x += u_time * 0.05;

  // Two layers of noise → soft "aurora"
  float n = noise(p) * 0.6 + noise(p * 2.0 + 10.0) * 0.4;

  // Brand palette (cyan → purple)
  vec3 cyan   = vec3(0.22, 0.70, 0.90);
  vec3 purple = vec3(0.55, 0.30, 0.85);
  vec3 color  = mix(cyan, purple, n);

  // Mouse-tracked glow
  float d = length(uv - u_mouse);
  color += 0.25 * exp(-d * 6.0) * vec3(0.4, 0.9, 1.0);

  // Vignette toward edges
  color *= smoothstep(1.2, 0.4, length(uv - 0.5));

  // Very low overall brightness so content sits on top comfortably
  gl_FragColor = vec4(color * 0.35, 1.0);
}
```

> GLSL 噪声函数直接用 Stefan Gustavson 的 classic simplex noise，GitHub 上搜 `glsl-noise` 复制粘贴即可。

### 接入点

```tsx
// components/home-page-client.tsx
import ShaderHeroBg from './shader-hero-bg'

// 删掉现有 animate-glow / animate-ambient 两个 <div>，替换成：
<ShaderHeroBg />
```

### Next.js 导入 `.glsl?raw`

需要让 webpack/turbopack 把 `.glsl` 当字符串读。两种方式：

**方式 A — 最简单：** 把 shader 写成 `export const FRAG = \`...\`` 的 ts 文件
而不是 `.glsl`。零配置。

**方式 B — 更干净：** 加 webpack loader 或 turbopack rule：
```ts
// next.config.ts
export default {
  turbopack: {
    rules: {
      '*.glsl': { loaders: ['raw-loader'], as: '*.js' },
    },
  },
}
```

本文档推荐 A（零配置、易读）。

### 降级策略

- `matchMedia('(prefers-reduced-motion: reduce)')` → 直接不挂 canvas，保留 CSS 背景
- WebGL context 创建失败 → catch 后 fallback
- IntersectionObserver：canvas 离开视口时 `cancelAnimationFrame` 停渲染，省电

### 测试清单

- [ ] 桌面 Chrome：流动颜色随鼠标扭曲
- [ ] Safari：没有 context lost
- [ ] 移动端：fps 不低于 30（低端机可加 `dpr = 1`）
- [ ] `prefers-reduced-motion: reduce` 下不渲染
- [ ] 离开视口 CPU / GPU 掉到 0

### 代码量估算
- `shader-hero-bg.tsx`：~60 行
- `hero.frag.glsl`：~50 行（大半是 noise 函数）
- 接入改动：~5 行
- **总计 ~120 行**

### 面试故事
> "I replaced the static CSS gradient background with a WebGL shader.
> It runs a simplex-noise flow field in a fragment shader, tied to
> mouse position and time uniforms. I kept bundle impact under 20 KB
> using OGL instead of three.js, and gated it behind
> `prefers-reduced-motion` for accessibility."

---

## #8 ⌘K 终端彩蛋

### 目标
按 `⌘K` / `Ctrl+K` 弹出一个假终端浮层。可以执行：
- `ls` / `cat` 读 `content/*.md`
- `ask "<question>"` 走 `/api/chat`（流式返回）
- `open <route>` 路由跳转
- `theme dark|light` 切主题
- `whoami`、`help`、`clear` 等小命令

**核心卖点：自然语言问题可以直接 pipe 进 RAG 管道**——
```
$ cat projects/admitly.md | ask "summarize in one sentence"
```

### 为什么适合你
80% 基建已经有：

| 需求 | 复用的现有模块 |
|------|----------------|
| 读文件 | `lib/content.ts` 的 `getAll*` / 新增 `getRawMarkdown(path)` |
| 跑 AI | `/api/chat` streaming endpoint |
| 路由跳转 | `next/navigation` `useRouter` |
| 切主题 | `components/theme-toggle.tsx` 逻辑 |

几乎不写新业务逻辑。

### 文件结构

```
components/
├── command-palette.tsx       ← 浮层 UI + 输入框 + 输出区
└── terminal-trigger.tsx      ← 右下角小按钮（移动端用，desktop 也可选）
lib/
├── terminal/
│   ├── run.ts                ← 主调度：输入一行 → 返回异步 iterable of output lines
│   ├── commands/
│   │   ├── ls.ts
│   │   ├── cat.ts
│   │   ├── ask.ts            ← 通过 fetch('/api/chat') 拿 stream
│   │   ├── open.ts
│   │   ├── theme.ts
│   │   ├── whoami.ts
│   │   ├── help.ts
│   │   └── clear.ts
│   └── registry.ts           ← 命令名 → handler 的映射
└── hooks/
    └── use-keyboard-shortcut.ts  ← 监听 ⌘K / Ctrl+K
```

### 命令 handler 接口

```ts
// lib/terminal/run.ts
export interface CommandContext {
  args: string[]
  stdin?: string                 // 前一段管道的输出
  router: AppRouter              // next/navigation
  setTheme: (t: 'dark' | 'light') => void
  abortSignal: AbortSignal
}

export interface CommandOutput {
  // Async iterable so streaming commands (`ask`) can yield line-by-line
  [Symbol.asyncIterator](): AsyncIterator<string>
}

export type CommandHandler = (ctx: CommandContext) => CommandOutput | Promise<CommandOutput>
```

### 示例 handler

```ts
// lib/terminal/commands/ls.ts
import fs from 'fs/promises'
import path from 'path'

export const ls: CommandHandler = async ({ args }) => {
  const target = args[0] ?? ''
  const dir = path.join(process.cwd(), 'content', target)
  // NOTE: server-only. Expose via a /api/fs route that whitelists content/
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const lines = entries.map(e => e.isDirectory() ? `${e.name}/` : e.name)
  return toIterable(lines.join('  '))
}
```

```ts
// lib/terminal/commands/ask.ts
export const ask: CommandHandler = async function* ({ args, stdin, abortSignal }) {
  const question = args.join(' ')
  const prompt = stdin ? `Given this context:\n${stdin}\n\nQuestion: ${question}` : question

  const res = await fetch('/api/chat', {
    method: 'POST',
    signal: abortSignal,
    body: JSON.stringify({ messages: [{ role: 'user', parts: [{ type: 'text', text: prompt }] }] }),
  })
  // Parse SSE stream from AI SDK v6, yield text deltas as they arrive
  // (use existing @ai-sdk/react parsing helpers or read stream manually)
  for await (const chunk of parseStream(res.body!)) {
    yield chunk
  }
}
```

> **重要：** `ls` / `cat` 不能直接在浏览器里读 `content/` 目录。需要加一个
> **server action** 或 `/api/terminal/fs` 路由，白名单只允许读 `content/**`，
> 防止路径穿越攻击 (`../../etc/passwd` etc.)。

### 安全清单

- [ ] `/api/terminal/fs` 只接受相对 `content/` 的路径
- [ ] `path.normalize()` 后检查是否仍在 `content/` 下
- [ ] 限制文件大小（如 50KB）
- [ ] `ask` 复用现有 rate limit

### 浮层 UI 要点

```tsx
// components/command-palette.tsx
'use client'

// 快捷键：⌘K / Ctrl+K 开关
useKeyboardShortcut(['mod+k'], () => setOpen(o => !o))

// 结构：
// <Dialog> 背景模糊 + 居中浮层
//   <div className="font-mono text-green-400 bg-black/90 border border-white/10 rounded-xl">
//     <History />         // 之前的命令 + 输出，滚动区域
//     <Prompt>
//       $ <Input />       // 当前行
//     </Prompt>
//   </div>
// </Dialog>
```

### 高阶功能（可选）

| 功能 | 实现点 |
|------|--------|
| **历史记录 `↑/↓`** | localStorage 存 string[]，keydown 切换 index |
| **Tab 补全** | 命令名 + `content/` 目录结构，前缀匹配 |
| **管道 `\|`** | `run.ts` 把命令字符串按 `\|` 分段，依次执行，上一个的输出作为下一个的 stdin |
| **启动动画** | 第一次打开时假装 booting："Loading yanpeng.os ... ✓" |
| **ANSI 颜色** | 用 `<span className="text-cyan-400">` 模拟，别真的跑 ANSI parser |
| **Copy 当前 session** | 右上角按钮复制全部输出到剪贴板 |

### ASCII Boot 动画（第一次开）

```
╔══════════════════════════════════╗
║   yanpeng.os v2026.4.23          ║
╚══════════════════════════════════╝

[✓] Mounting /content
[✓] Loading RAG pipeline (4 sources)
[✓] Connecting to Gemini 2.5 Flash
[✓] Ready.

Type `help` to see available commands.
Try: ask "What AI projects has Yanpeng built?"

$ _
```

### 测试清单

- [ ] `⌘K` 在 Mac Chrome / Safari 打开
- [ ] `Ctrl+K` 在 Win Firefox 打开
- [ ] `ls` 列出 content 目录
- [ ] `cat profile.md` 渲染完整 markdown 原文
- [ ] `ask "..."` 流式打字
- [ ] `cat profile.md | ask "summarize"` pipe 生效
- [ ] `open blog` 跳转 + 关闭浮层
- [ ] `theme dark/light` 立即生效
- [ ] 路径穿越 `cat ../../package.json` 被拒绝
- [ ] Rate limit 命中后 `ask` 返回友好错误
- [ ] 手机上右下角小按钮能触发

### 代码量估算

| 文件 | 行数 |
|------|------|
| `command-palette.tsx` | ~150 |
| `run.ts` + pipe parser | ~60 |
| 每个 command handler | ~20 × 7 = 140 |
| `/api/terminal/fs` route | ~40 |
| `use-keyboard-shortcut.ts` | ~20 |
| **总计** | **~400 行** |

### 面试故事
> "I built a terminal emulator as an easter egg in my portfolio.
> The interesting part: commands are composable with Unix-style pipes,
> so you can do `cat projects/admitly.md | ask \"summarize in one sentence\"`.
> The `ask` command pipes through my existing RAG endpoint, streams
> Gemini's output token-by-token, and respects the same rate limiting
> as the regular chat UI. Took me about 400 lines because I reused
> the content loader and AI pipeline — the terminal is mostly a UI
> shell over infrastructure I already had."

---

## 对比与执行顺序

| 维度 | #4 Shader 背景 | #8 ⌘K 终端 |
|------|----------------|------------|
| 视觉冲击（首屏） | 🔥🔥🔥🔥🔥 | 🔥 |
| 技术深度（面试可讲） | 🔥🔥🔥 GLSL / GPU | 🔥🔥🔥🔥 RAG pipe + UX |
| 复用现有代码 | ❌ 全新 | ✅ 复用 `/api/chat` + `content/` |
| 代码量 | ~120 行 | ~400 行 |
| 手机体验 | ✅ 好 | ⚠️ 需要触发按钮 |
| 发现成本 | 0（被动看到） | 中（需要按 ⌘K） |
| 独特性 | 设计 portfolio 常见 | **罕见** |

### 推荐顺序

1. **先做 #8** — ROI 最高，复用现有架构，和整体 AI 定位一致
2. **后做 #4** — 纯视觉收尾，没有 blocker

### 执行时 checklist（共用）

- [ ] 新分支 `feat/shader-bg` or `feat/terminal`
- [ ] 本地 `pnpm build` 通过
- [ ] 手机 + 桌面各测一遍
- [ ] `prefers-reduced-motion` 降级（#4）/ 手机触发按钮（#8）
- [ ] PROGRESS.md 写入改动
- [ ] Commit 消息注明面试故事关键词
