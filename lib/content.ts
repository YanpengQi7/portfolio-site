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
  demoUrl?: string
  contentHtml: string
}

export interface BlogPost {
  slug: string
  title: string
  subtitle: string
  date: string
  readingTime: string
  tags: string[]
  featured: boolean
  contentHtml: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// Simple markdown to HTML (no extra deps needed for basic formatting)
function markdownToHtml(markdown: string): string {
  const codeBlocks: string[] = []
  const htmlBlocks: string[] = []

  const stashHtml = (block: string) => {
    const token = `__HTML_BLOCK_${htmlBlocks.length}__`
    htmlBlocks.push(block)
    return token
  }

  const html = markdown
    .replace(/```([\w-]+)?\n([\s\S]*?)```/g, (_, language: string | undefined, code: string) => {
      const block = [
        '<pre class="code-block"><code>',
        language ? `<span class="code-language">${escapeHtml(language)}</span>` : '',
        escapeHtml(code.trimEnd()),
        '</code></pre>',
      ].join('')

      const token = `__CODE_BLOCK_${codeBlocks.length}__`
      codeBlocks.push(block)
      return token
    })
    // Stash block-level raw HTML (figure, svg, blockquote) so paragraph wrapping leaves it alone
    .replace(/^<(figure|svg|blockquote|aside)[\s\S]*?<\/\1>\s*$/gm, match => stashHtml(match))
    // Markdown images on their own line → <figure>
    .replace(/^!\[([^\]]*)\]\(([^)]+?)(?:\s+"([^"]*)")?\)\s*$/gm, (_, alt: string, src: string, title?: string) => {
      const caption = title || alt
      const fig = [
        '<figure class="my-8">',
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="rounded-xl border border-white/8 bg-white/[0.02] w-full" loading="lazy" />`,
        caption ? `<figcaption class="text-xs text-muted-foreground mt-2 text-center">${escapeHtml(caption)}</figcaption>` : '',
        '</figure>',
      ].join('')
      return stashHtml(fig)
    })
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-cyan-300 hover:text-cyan-200 underline underline-offset-2">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 rounded text-sm font-mono">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul class="my-3 space-y-1">$&</ul>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<[hul]|__HTML_BLOCK_|__CODE_BLOCK_)(.+)$/gm, '<p class="mb-4">$1</p>')
    .replace(/<p class="mb-4"><\/p>/g, '')
    .replace(/<p class="mb-4">(__HTML_BLOCK_\d+__)<\/p>/g, '$1')

  return html
    .replace(/__HTML_BLOCK_(\d+)__/g, (_, idx: string) => htmlBlocks[Number(idx)] ?? '')
    .replace(/<p class="mb-4">(__CODE_BLOCK_\d+__)<\/p>|(__CODE_BLOCK_\d+__)/g, (_, tokenA: string | undefined, tokenB: string | undefined) => {
      const token = tokenA ?? tokenB
      if (!token) return ''
      const index = Number(token.replace('__CODE_BLOCK_', '').replace('__', ''))
      return codeBlocks[index] ?? ''
    })
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
      demoUrl: data.demoUrl,
      contentHtml: markdownToHtml(content),
    }
  } catch {
    return null
  }
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const dir = path.join(process.cwd(), 'content', 'blog')
  const files = await readdir(dir)
  const posts = await Promise.all(
    files.filter(f => f.endsWith('.md')).map(f => getBlogPost(f.replace('.md', '')))
  )
  return (posts.filter(Boolean) as BlogPost[]).sort((a, b) => b.date.localeCompare(a.date))
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`)
    const raw = await readFile(filePath, 'utf-8')
    const { data, content } = matter(raw)
    return {
      slug: data.slug || slug,
      title: data.title,
      subtitle: data.subtitle,
      date: typeof data.date === 'string' ? data.date : new Date(data.date).toISOString().slice(0, 10),
      readingTime: data.readingTime || '5 min read',
      tags: data.tags || [],
      featured: data.featured || false,
      contentHtml: markdownToHtml(content),
    }
  } catch {
    return null
  }
}
