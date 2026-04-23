import { readdir, readFile } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

interface Chunk {
  source: string
  text: string
  score: number
}

// Simple keyword-based retrieval (< 50 lines, complete RAG concept)
export async function retrieveContext(query: string, topK = 4): Promise<string> {
  const contentDir = path.join(process.cwd(), 'content')
  const chunks = await loadChunks(contentDir)

  const queryTerms = tokenize(query)

  const scored: Chunk[] = chunks.map(chunk => ({
    ...chunk,
    score: scoreChunk(chunk.text, queryTerms),
  }))

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(c => c.score > 0)

  if (top.length === 0) {
    // Return all content if no strong match (fallback for general questions)
    return chunks.map(c => `[${c.source}]\n${c.text}`).join('\n\n---\n\n')
  }

  return top.map(c => `[${c.source}]\n${c.text}`).join('\n\n---\n\n')
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
        const { content } = matter(raw)
        // Split into paragraphs as chunks
        const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50)
        const source = path.relative(process.cwd(), fullPath).replace(/^content\//, '')
        for (const para of paragraphs) {
          chunks.push({ source, text: para.trim() })
        }
      }
    }
  }

  await walk(dir)
  return chunks
}

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/\W+/).filter(t => t.length > 2)
}

function scoreChunk(text: string, queryTerms: string[]): number {
  const lowerText = text.toLowerCase()
  return queryTerms.reduce((score, term) => {
    const matches = (lowerText.match(new RegExp(term, 'g')) || []).length
    return score + matches
  }, 0)
}
