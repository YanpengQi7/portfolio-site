'use client'

import LandingSplash from '@/components/home/landing-splash'
import TopNav from '@/components/home/top-nav'
import Hero from '@/components/home/hero'
import StatsBar from '@/components/home/stats-bar'
import TileGrid from '@/components/home/tile-grid'
import ProjectCards from '@/components/home/project-cards'
import AIChat from '@/components/home/ai-chat'
import Continuity from '@/components/home/continuity'
import Footer from '@/components/home/footer'
import type { Project } from '@/lib/content'

export default function HomePageClient({ featured }: { featured: Project[] }) {
  return (
    <>
      <LandingSplash />
      <TopNav />
      <main style={{ background: 'var(--bg-apple)', color: 'var(--ink)' }}>
        <Hero variant="keynote" />
        <StatsBar />
        <TileGrid />
        <ProjectCards featured={featured} />
        <AIChat />
        <Continuity />
      </main>
      <Footer />
    </>
  )
}
