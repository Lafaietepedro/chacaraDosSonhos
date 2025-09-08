import { Hero } from '@/components/hero'
import { Gallery } from '@/components/gallery'
import { About } from '@/components/about'
import { Pricing } from '@/components/pricing'
import { FAQ } from '@/components/faq'
import { Contact } from '@/components/contact'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <About />
      <Gallery />
      <Pricing />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  )
}
