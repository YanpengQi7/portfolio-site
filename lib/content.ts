import { readdir, readFile } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface Project {
  slug: string
  title: string
  subtitle: string
  tech: string[]
  status: string
  year: number
  featured: boolean
  contentHtml: string
}

// Simple markdown to HTML (no extra deps needed for basic formatting)
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded text-sm font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-3 space-y-1">$&</ul>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<[hul])(.+)$/gm, '<p class="mb-4">$1</p>')
    .replace(/<p class="mb-4"><\/p>/g, '')
}

export async function getAllProjects(): Promise<Project[]> {
  const dir = path.join(process.cwd(), 'content', 'projects')
  const files = await readdir(dir)
  const projects = await Promise.all(
    files.filter(f => f.endsWith('.md')).map(f => getProject(f.replace('.md', '')))
  )
  return (projects.filter(Boolean) as Project[]).sort((a, b) => b.year - a.year)
}

export async function getProject(slug: string): Promise<Project | null> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'projects', `${slug}.md`)
    const raw = await readFile(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return {
      slug: data.slug || slug,
      title: data.title,
      subtitle: data.subtitle,
      tech: data.tech || [],
      status: data.status || 'Completed',
      year: data.year || 2024,
      featured: data.featured || false,
      contentHtml: markdownToHtml(content),
    }
  } catch {
    return null
  }
}
