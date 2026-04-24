import { readdir, readFile, stat } from 'fs/promises'
import path from 'path'

const CONTENT_ROOT = path.join(process.cwd(), 'content')
const MAX_FILE_BYTES = 50_000

function resolveContentPath(relativePath: string) {
  const normalized = path.normalize(relativePath || '.')
  const fullPath = path.resolve(CONTENT_ROOT, normalized)

  if (fullPath !== CONTENT_ROOT && !fullPath.startsWith(`${CONTENT_ROOT}${path.sep}`)) {
    throw new Error('Access denied')
  }

  return fullPath
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const op = searchParams.get('op')
  const inputPath = searchParams.get('path') ?? ''

  try {
    const targetPath = resolveContentPath(inputPath)

    if (op === 'list') {
      const targetStat = await stat(targetPath)
      if (!targetStat.isDirectory()) {
        return Response.json({ error: 'Path is not a directory' }, { status: 400 })
      }

      const entries = await readdir(targetPath, { withFileTypes: true })
      return Response.json({
        entries: entries
          .filter(entry => entry.isDirectory() || entry.name.endsWith('.md'))
          .map(entry => (entry.isDirectory() ? `${entry.name}/` : entry.name))
          .sort(),
      })
    }

    if (op === 'read') {
      const fileStat = await stat(targetPath)
      if (!fileStat.isFile() || fileStat.size > MAX_FILE_BYTES) {
        return Response.json({ error: 'File not allowed' }, { status: 400 })
      }

      const content = await readFile(targetPath, 'utf-8')
      return Response.json({ content })
    }

    return Response.json({ error: 'Unknown operation' }, { status: 400 })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Terminal FS error' },
      { status: 400 },
    )
  }
}
