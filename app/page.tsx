import { getAllProjects } from '@/lib/content'
import HomePageClient from '@/components/home-page-client'

export default async function HomePage() {
  const projects = await getAllProjects()
  const featured = projects.filter(p => p.featured)

  return <HomePageClient featured={featured} />
}
