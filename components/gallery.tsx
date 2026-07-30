'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'

const images = [
  {
    id: 1,
    src: '/gallery/venue-exterior.jpg',
    alt: 'Espaço contemporâneo com piscina e área externa',
    category: 'Exterior',
  },
  {
    id: 2,
    src: '/gallery/reception-hall.jpg',
    alt: 'Salão preparado para uma recepção elegante',
    category: 'Eventos',
  },
  {
    id: 3,
    src: '/gallery/pool-garden.jpg',
    alt: 'Piscina integrada ao jardim e à área de convivência',
    category: 'Lazer',
  },
]

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const nextImage = () => {
    if (selectedImage !== null) setSelectedImage((selectedImage + 1) % images.length)
  }

  const prevImage = () => {
    if (selectedImage !== null) setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)
  }

  return (
    <section id="gallery" className="bg-stone-50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-emerald-700">Conheça o espaço</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Imagens que vendem o espaço antes da conversa.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            Explore os ambientes pensados para receber celebrações, encontros corporativos e produções com conforto.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={`group relative overflow-hidden rounded-md bg-slate-200 text-left ${
                index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
              }`}
            >
              <div className={`relative ${index === 0 ? 'aspect-[1.12/1]' : 'aspect-[1.12/0.82]'}`}>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes={index === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, 100vw'}
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-white">
                <div>
                  <span className="rounded-md bg-white/15 px-2 py-1 text-xs font-medium backdrop-blur">
                    {image.category}
                  </span>
                  <p className="mt-2 text-sm font-medium">{image.alt}</p>
                </div>
                <Expand className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </button>
          ))}
        </div>

        {selectedImage !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Visualização ampliada da galeria"
          >
            <div className="relative max-h-full max-w-5xl">
              <Image
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                width={1400}
                height={1000}
                sizes="100vw"
                className="max-h-[86vh] w-auto max-w-full rounded-md object-contain"
                priority
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute right-3 top-3 rounded-md bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
                aria-label="Fechar imagem"
              >
                <X className="h-6 w-6" />
              </button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
