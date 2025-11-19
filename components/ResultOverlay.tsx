import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult } from '../types';

interface ResultOverlayProps {
  imageData: string;
  result: AnalysisResult | null;
}

export const ResultOverlay: React.FC<ResultOverlayProps> = ({ imageData, result }) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  // Updates the displayed image size for coordinate scaling
  const updateSize = () => {
    if (imgRef.current) {
      setImageSize({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
    }
  };

  useEffect(() => {
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div className="relative w-full flex justify-center bg-black">
      <img
        ref={imgRef}
        src={imageData}
        alt="Captured"
        className="max-w-full max-h-[70vh] object-contain select-none"
        onLoad={updateSize}
      />

      {/* SVG Overlay for Bounding Boxes */}
      {result && imageSize.width > 0 && (
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: imageSize.width,
            height: imageSize.height,
            // Centering the overlay over the image if the image is smaller than container
            left: imgRef.current?.offsetLeft, 
            top: imgRef.current?.offsetTop
          }}
        >
          {result.items.map((item) => {
            // Gemini returns [ymin, xmin, ymax, xmax] normalized 0-1
            const [ymin, xmin, ymax, xmax] = item.box_2d;
            
            const top = ymin * 100 + '%';
            const left = xmin * 100 + '%';
            const width = (xmax - xmin) * 100 + '%';
            const height = (ymax - ymin) * 100 + '%';

            return (
              <div
                key={item.id}
                className="absolute border-2 border-green-400 shadow-[0_0_4px_rgba(0,255,0,0.8)] flex items-start justify-start"
                style={{ top, left, width, height }}
              >
                <span className="bg-green-500 text-black text-[10px] font-bold px-1 leading-tight rounded-br-sm shadow-sm">
                  {item.id}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
