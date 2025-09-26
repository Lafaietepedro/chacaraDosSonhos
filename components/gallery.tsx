'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const images = [
    {
      id: 1,
      src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      alt: 'Vista frontal da chácara',
      category: 'Exterior'
    },
    {
      id: 2,
      src: 'https://images.unsplash.com/photo-1664490591674-97cc38de245f?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Área de eventos',
      category: 'Eventos'
    },
    {
      id: 3,
      src: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop',
      alt: 'Churrasqueira',
      category: 'Lazer'
    },
    {
      id: 4,
      src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      alt: 'Casa principal',
      category: 'Interior'
    },
    {
      id: 5,
      src: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600&fit=crop',
      alt: 'Jardim',
      category: 'Exterior'
    },
    {
      id: 6,
      src: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
      alt: 'Piscina',
      category: 'Lazer'
    },
    {
      id: 7,
      src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      alt: 'Sala de estar',
      category: 'Interior'
    },
    {
      id: 8,
      src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
      alt: 'Área verde',
      category: 'Exterior'
    }
  ]

  const categories = ['Todas', 'Exterior', 'Interior', 'Eventos', 'Lazer']
  const [activeCategory, setActiveCategory] = useState('Todas')

  const filteredImages = activeCategory === 'Todas' 
    ? images 
    : images.filter(img => img.category === activeCategory)

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? filteredImages.length - 1 : selectedImage - 1)
    }
  }

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Galeria de Fotos
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conheça cada cantinho da nossa chácara e imagine seu evento perfeito
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => (
            <Card 
              key={image.id} 
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedImage(index)}
            >
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 rounded-full p-2">
                        <span className="text-sm font-medium">Ver detalhes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={filteredImages[selectedImage].src}
                alt={filteredImages[selectedImage].alt}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Navigation buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Image info */}
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-lg font-medium">{filteredImages[selectedImage].alt}</p>
                <p className="text-sm opacity-75">{filteredImages[selectedImage].category}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
