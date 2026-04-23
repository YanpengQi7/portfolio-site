import { readdir, readFile } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface Chunk {
  source: string
  text: string
  score: number
  kind: 'project' | 'profile' | 'skills' | 'blog' | 'other'
}

export interface RagResult {
  context: string
  chunks: Chunk[]
  fallback: boolean
}

// Simple keyword-based retrieval (< 50 lines, complete RAG concept)
export async function retrieveContext(query: string, topK = 4): Promise<string> {
  const { context } = await retrieveRag(query, topK)
  return context
}

export async function retrieveRag(query: string, topK = 4): Promise<RagResult> {
  const contentDir = path.join(process.cwd(), 'content')
  const chunks = await loadChunks(contentDir)

  const queryTerms = tokenize(query)

  const scored: Chunk[] = chunks.map(chunk => ({
    ...chunk,
    score: scoreChunk(chunk, queryTerms),
  }))

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(c => c.score > 0)

  if (top.length === 0) {
    // Fallback: use all content, but surface a small preview set
    const preview = scored.slice(0, topK).map(c => ({ ...c, score: 0 }))
    return {
      context: chunks.map(c => `[${c.source}]\n${c.text}`).join('\n\n---\n\n'),
      chunks: preview,
      fallback: true,
    }
  }

  return {
    context: top.map(c => `[${c.source}]\n${c.text}`).join('\n\n---\n\n'),
    chunks: top,
    fallback: false,
  }
}

async function loadChunks(dir: string): Promise<Omit<Chunk, 'score'>[]> {
  const chunks: Omit<Chunk, 'score'>[] = []

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (entry.name.endsWith('.md')) {
        const raw = await readFile(fullPath, 'utf-8')
        const { data, content } = matter(raw)
        // Split into paragraphs as chunks
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50)
        const source = path.relative(process.cwd(), fullPath).replace(/^content\//, '')
        const kind = inferKind(source)
        const title = typeof data.title === 'string' ? data.title : ''
        const subtitle = typeof data.subtitle === 'string' ? data.subtitle : ''
        const tech = Array.isArray(data.tech) ? data.tech.join(' ') : ''
        const lead = [title, subtitle, tech].filter(Boolean).join('\n')

        for (const para of paragraphs) {
          const text = [lead, para.trim()].filter(Boolean).join('\n')
          chunks.push({ source, text, kind })
        }
      }
    }
  }

  await walk(dir)
  return chunks
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(t => t.length > 2)
    .filter(t => !STOPWORDS.has(t))
}

function scoreChunk(chunk: Omit<Chunk, 'score'>, queryTerms: string[]): number {
  const lowerText = chunk.text.toLowerCase()
  const phraseBoost = lowerText.includes('what it is') ? 1 : 0
  const projectBoost =
    chunk.kind === 'project' && queryTerms.some(term => term === 'project' || term === 'projects' || term === 'built')
      ? 3
      : 0

  const keywordScore = queryTerms.reduce((score, term) => {
    const escaped = escapeRegExp(term)
    const matches = lowerText.match(new RegExp(`\\b${escaped}\\b`, 'g')) || []
    return score + matches.length
  }, 0)

  return keywordScore + phraseBoost + projectBoost
}

function inferKind(source: string): Chunk['kind'] {
  if (source.startsWith('projects/')) return 'project'
  if (source === 'profile.md') return 'profile'
  if (source === 'skills.md') return 'skills'
  if (source.startsWith('blog/')) return 'blog'
  return 'other'
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const STOPWORDS = new Set([
  'what', 'which', 'about', 'have', 'has', 'with', 'from', 'into', 'than', 'that',
  'this', 'those', 'their', 'them', 'they', 'your', 'were', 'been', 'being', 'build',
  'built', 'yanpeng',
])
