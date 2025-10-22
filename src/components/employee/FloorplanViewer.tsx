import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Floorplan {
  id: number;
  site_id: number;
  image_path: string;
  created_at: string;
  public_url: string;
}

interface FloorplanViewerProps {
  floorplans: Floorplan[];
}

export function FloorplanViewer({ floorplans }: FloorplanViewerProps) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!floorplans || floorplans.length === 0) {
    return null; // Don't render anything if there are no floorplans
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : floorplans.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < floorplans.length - 1 ? prev + 1 : 0));
  };

  const currentFloorplan = floorplans[currentIndex];

  return (
    <>
      {/* Main Viewer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-3 sm:mb-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 sm:px-4 py-2.5 sm:py-3">
          <h2 className="text-lg sm:text-xl font-bold text-white">
            {t('site_floorplan') || 'Site Floor Plan'}
          </h2>
          {floorplans.length > 1 && (
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
              {currentIndex + 1} of {floorplans.length}
            </p>
          )}
        </div>

        <div className="relative bg-gray-50">
          {/* Image Container */}
          <div className="relative w-full aspect-video bg-gray-100 flex items-center justify-center">
            <img
              src={currentFloorplan.public_url}
              alt={`Floor plan ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain cursor-pointer"
              onClick={() => setSelectedImage(currentFloorplan.public_url)}
              loading="lazy"
            />
          </div>

          {/* Navigation Controls */}
          {floorplans.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                aria-label="Previous floor plan"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-white transition-colors"
                aria-label="Next floor plan"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Zoom Hint */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            {t('click_to_enlarge') || 'Click to enlarge'}
          </div>
        </div>

        {/* Thumbnail Navigation for Multiple Images */}
        {floorplans.length > 1 && (
          <div className="p-2 sm:p-3 bg-white border-t border-gray-200">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {floorplans.map((floorplan, index) => (
                <button
                  key={floorplan.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded border-2 overflow-hidden transition-all ${
                    index === currentIndex
                      ? 'border-blue-600 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-blue-400'
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
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Floor plan enlarged"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
