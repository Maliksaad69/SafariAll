'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: Array<{ url: string; caption?: string }>;
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div>
      {/* Thumbnail Strip */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.slice(0, 4).map((img, idx) => (
          <div
            key={idx}
            onClick={() => openLightbox(idx)}
            className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group border border-[#E5E0D8] shadow-sm"
          >
            <img
              src={img.url}
              alt={img.caption || `Safari photo ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            {idx === 3 && images.length > 4 && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xs">
                +{images.length - 4} Photos
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].caption || 'Safari detail'}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />
            {images[currentIndex].caption && (
              <p className="text-white text-xs mt-4 text-center bg-black/40 px-4 py-2 rounded-full border border-white/10">
                {images[currentIndex].caption}
              </p>
            )}
            <span className="text-gray-400 text-[10px] mt-2 font-mono">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          <button
            onClick={nextImage}
            className="absolute right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
