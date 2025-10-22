import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ZoneFloorplan {
  id: number;
  zone_id: number;
  image_path: string;
  created_at: string;
  public_url: string;
}

interface ZoneFloorplanModalProps {
  zoneName: string;
  floorplans: ZoneFloorplan[];
  isOpen: boolean;
  onClose: () => void;
}

export function ZoneFloorplanModal({ zoneName, floorplans, isOpen, onClose }: ZoneFloorplanModalProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || floorplans.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : floorplans.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < floorplans.length - 1 ? prev + 1 : 0));
  };

  const currentFloorplan = floorplans[currentIndex];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-7xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {zoneName} - {t('zone_floorplan') || 'Zone Floor Plan'}
            </h2>
            {floorplans.length > 1 && (
              <p className="text-sm text-gray-300 mt-1">
                {currentIndex + 1} of {floorplans.length}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 focus:outline-none p-2"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Container */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <div className="relative w-full" style={{ minHeight: '60vh', maxHeight: '80vh' }}>
            <img
              src={currentFloorplan.public_url}
              alt={`${zoneName} floor plan ${currentIndex + 1}`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>

          {/* Navigation Controls */}
          {floorplans.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                aria-label="Previous floor plan"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                aria-label="Next floor plan"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Navigation */}
        {floorplans.length > 1 && (
          <div className="mt-4 flex gap-2 justify-center overflow-x-auto pb-2">
            {floorplans.map((floorplan, index) => (
              <button
                key={floorplan.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 overflow-hidden transition-all ${
                  index === currentIndex
                    ? 'border-white ring-2 ring-white/50'
                    : 'border-white/30 hover:border-white/60'
                }`}
              >
                <img
                  src={floorplan.public_url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Close hint */}
        <p className="text-center text-gray-400 text-sm mt-4">
          {t('press_esc_or_click_outside') || 'Press ESC or click outside to close'}
        </p>
      </div>
    </div>
  );
}
