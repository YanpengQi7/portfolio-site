'use client'

import { useEffect, useRef, useState } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import { THEME_EVENT } from '@/lib/theme-client'

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform float u_theme;
uniform float u_scroll;

varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
    (c - a) * u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;

  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = p * 2.02 + vec2(13.4, 7.1);
    amplitude *= 0.52;
  }

  return value;
}

void main() {
  vec2 uv = vUv;
  vec2 mouse = u_mouse;
  vec2 centered = uv - 0.5;

  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  centered.x *= aspect;

  float scrollShift = u_scroll * 0.28;
  vec2 flowUv = centered * 1.85;
  flowUv += vec2(u_time * 0.038, -u_time * 0.016);
  flowUv += vec2(scrollShift, -scrollShift * 0.42);

  float base = fbm(flowUv);
  float detail = fbm(flowUv * 1.8 + vec2(4.2, -2.7) + u_time * 0.04);
  float swirl = fbm(vec2(base + flowUv.y, detail - flowUv.x) * 1.6);

  vec3 darkA = vec3(0.08, 0.29, 0.52);
  vec3 darkB = vec3(0.19, 0.25, 0.38);
  vec3 lightA = vec3(0.93, 0.96, 0.99);
  vec3 lightB = vec3(0.82, 0.88, 0.95);

  vec3 colorA = mix(darkA, lightA, u_theme);
  vec3 colorB = mix(darkB, lightB, u_theme);
  vec3 color = mix(colorA, colorB, smoothstep(0.2, 0.85, base + detail * 0.35));

  float ridge = smoothstep(0.25, 0.95, swirl);
  color += ridge * mix(vec3(0.04, 0.06, 0.10), vec3(0.16, 0.18, 0.21), u_theme);

  vec2 glowPoint = vec2(mouse.x, 1.0 - mouse.y);
  vec2 glowDelta = uv - glowPoint;
  glowDelta.x *= aspect;
  float glow = exp(-length(glowDelta) * 7.4);
  color += glow * mix(vec3(0.06, 0.18, 0.30), vec3(0.22, 0.30, 0.40), u_theme);

  float vignette = smoothstep(1.26, 0.12, length(centered));
  color *= vignette;

  float alpha = mix(0.68, 0.28, u_theme);
  gl_FragColor = vec4(color, alpha);
}
`

function readThemeValue() {
  if (typeof document === 'undefined') {
    return 0
  }

  return document.documentElement.dataset.theme === 'light' ? 1 : 0
}

export default function ShaderHeroBg() {
  const rootRef = useRef<HTMLDivElement>(null)
  const mountRef = useRef<HTMLDivElement>(null)
  const visibleRef = useRef(true)
  const [shaderReady, setShaderReady] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    const mount = mountRef.current

    if (!root || !mount) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let renderer: Renderer | null = null
    let frame = 0
    let disposed = false

    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        dpr: Math.min(window.devicePixelRatio || 1, 1.8),
      })

      const gl = renderer.gl
      gl.clearColor(0, 0, 0, 0)
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      gl.canvas.style.display = 'block'
      mount.appendChild(gl.canvas)

      const mouse = { value: [0.52, 0.48] as [number, number] }
      const resolution = { value: [1, 1] as [number, number] }
      const theme = { value: readThemeValue() }
      const scroll = { value: 0 }

      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          u_time: { value: 0 },
          u_mouse: mouse,
          u_resolution: resolution,
          u_theme: theme,
          u_scroll: scroll,
        },
      })

      const mesh = new Mesh(gl, {
        geometry: new Triangle(gl),
        program,
      })

      const resize = () => {
        const width = root.clientWidth || window.innerWidth
        const height = root.clientHeight || Math.max(window.innerHeight * 0.7, 1)
        renderer?.setSize(width, height)
        resolution.value = [gl.canvas.width, gl.canvas.height]
      }

      const updateMouse = (event: PointerEvent) => {
        const rect = root.getBoundingClientRect()
        const x = (event.clientX - rect.left) / Math.max(rect.width, 1)
        const y = (event.clientY - rect.top) / Math.max(rect.height, 1)
        mouse.value = [
          Math.min(Math.max(x, 0.0), 1.0),
          Math.min(Math.max(y, 0.0), 1.0),
        ]
      }

      const updateTheme = () => {
        theme.value = readThemeValue()
      }

      const updateScroll = () => {
        scroll.value = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.6)
      }

      const observer = new IntersectionObserver(
        entries => {
          visibleRef.current = entries[0]?.isIntersecting ?? true
        },
        { threshold: 0.05 },
      )

      observer.observe(root)
      resize()
      updateScroll()
      updateTheme()
      window.requestAnimationFrame(() => {
        setShaderReady(true)
      })

      window.addEventListener('resize', resize)
      window.addEventListener('pointermove', updateMouse, { passive: true })
      window.addEventListener('scroll', updateScroll, { passive: true })
      window.addEventListener(THEME_EVENT, updateTheme as EventListener)

      const start = performance.now()
      const loop = (now: number) => {
        if (disposed) return

        frame = window.requestAnimationFrame(loop)
        if (!visibleRef.current) return

        program.uniforms.u_time.value = (now - start) / 1000
        renderer?.render({ scene: mesh })
      }

      frame = window.requestAnimationFrame(loop)

      return () => {
        disposed = true
        observer.disconnect()
        window.cancelAnimationFrame(frame)
        window.removeEventListener('resize', resize)
        window.removeEventListener('pointermove', updateMouse)
        window.removeEventListener('scroll', updateScroll)
        window.removeEventListener(THEME_EVENT, updateTheme as EventListener)
        mount.innerHTML = ''
        renderer?.gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
    } catch {
      mount.innerHTML = ''
      return () => {}
    }
  }, [])

  return (
    <div ref={rootRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden>
      <div ref={mountRef} className={shaderReady ? 'opacity-100' : 'opacity-0'} />

      <div className={`absolute inset-0 transition-opacity duration-500 ${shaderReady ? 'opacity-0' : 'opacity-100'}`}>
        <div
          className="animate-glow animate-ambient absolute -top-32 -left-24 h-[460px] w-[460px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.52 0.10 235 / 14%) 0%, transparent 72%)' }}
        />
        <div
          className="animate-glow animate-ambient delay-500 absolute top-1/4 right-[-8rem] h-[420px] w-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.84 0.03 245 / 9%) 0%, transparent 72%)' }}
        />
        <div
          className="animate-glow animate-ambient delay-300 absolute bottom-[-10rem] left-1/3 h-[360px] w-[360px] rounded-full"
          style={{ background: 'radial-gradient(circle, oklch(0.78 0.04 215 / 8%) 0%, transparent 72%)' }}
        />
      </div>

      <div className="absolute inset-0 grid-bg opacity-16" />
    </div>
  )
}
