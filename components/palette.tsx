'use client';

import { useCallback, useEffect, useState } from 'react';

import { generatePalette } from '@/utils/colors';
import { ArrowLeft, ArrowRight, Space } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import ColorColumn from './color-column';

export default function Palette() {
  const [colors, setColors] = useState<string[]>([]);
  const [isChanging, setIsChanging] = useState(false);
  const [paletteHistory, setPaletteHistory] = useState<string[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Generate a new palette and add it to history
  const generateNewPalette = useCallback(() => {
    setIsChanging(true);
    setTimeout(() => {
      const newPalette = generatePalette();
      setColors(newPalette);

      // Add to history and navigate
      const newHistory = [
        ...paletteHistory.slice(0, historyIndex + 1),
        newPalette,
      ];
      setPaletteHistory(newHistory);
      const newIndex = newHistory.length - 1;
      setHistoryIndex(newIndex);
      router.push(`/?palette=${newIndex}`);

      setIsChanging(false);
    }, 300);
  }, [paletteHistory, historyIndex, router]);

  // Go to a specific palette by history index
  const goToPalette = useCallback(
    (index: number) => {
      if (index >= 0 && index < paletteHistory.length) {
        setIsChanging(true);
        setTimeout(() => {
          setColors(paletteHistory[index]);
          setHistoryIndex(index);
          router.push(`/?palette=${index}`);
          setIsChanging(false);
        }, 300);
      }
    },
    [paletteHistory, router],
  );

  // Go to previous palette
  const goToPrevious = useCallback(() => {
    if (historyIndex > 0) {
      goToPalette(historyIndex - 1);
    }
  }, [historyIndex, goToPalette]);

  // Go to next palette
  const goToNext = useCallback(() => {
    if (historyIndex < paletteHistory.length - 1) {
      goToPalette(historyIndex + 1);
    }
  }, [historyIndex, paletteHistory, goToPalette]);

  // Check viewport size when component mounts and on resize
  useEffect(() => {
    const checkViewport = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkViewport();

    // Add event listener for window resize
    window.addEventListener('resize', checkViewport);

    // Cleanup
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Initialize palette and handle URL parameters
  useEffect(() => {
    // Check for palette parameter in URL
    const paletteParam = searchParams.get('palette');

    // Initialize history with first palette if empty
    if (paletteHistory.length === 0) {
      const initialPalette = generatePalette();
      setColors(initialPalette);
      setPaletteHistory([initialPalette]);

      // Set URL if not already set
      if (!paletteParam) {
        router.push('/?palette=0');
      }
    }

    // Load specific palette from history if parameter exists
    if (paletteParam && paletteHistory.length > 0) {
      const index = parseInt(paletteParam, 10);
      if (!isNaN(index) && index >= 0 && index < paletteHistory.length) {
        setColors(paletteHistory[index]);
        setHistoryIndex(index);
      }
    }
  }, [searchParams, paletteHistory.length, router]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Get the active element and check if it's a form element
      const activeElement = document.activeElement;
      const isFormElement =
        activeElement instanceof HTMLElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT' ||
          activeElement.isContentEditable);

      // Skip shortcut handling if user is typing in a form element
      if (isFormElement) {
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        generateNewPalette();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [generateNewPalette, goToPrevious, goToNext]);

  return (
    <div className="h-full w-full relative">
      <div
        className={`h-full w-full flex md:flex-row flex-col transition-opacity duration-300 ${isChanging ? 'opacity-0' : 'opacity-100'}`}
      >
        {colors.map((color, index) => (
          <ColorColumn
            key={`${color}-${index}`}
            color={color}
            index={index}
            total={colors.length}
          />
        ))}
      </div>

      {/* Navigation controls - repositioned for mobile */}
      {isMobileView ? (
        // Mobile navigation controls at bottom
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-10 flex space-x-4">
          <button
            onClick={goToPrevious}
            disabled={historyIndex <= 0}
            className={`p-3 rounded-full bg-black/20 backdrop-blur-md text-white 
                    ${historyIndex <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/30'}`}
            aria-label="Previous palette"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            onClick={generateNewPalette}
            className="p-3 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/30"
            aria-label="Generate new palette"
          >
            <Space className="h-5 w-5" />
          </button>

          <button
            onClick={goToNext}
            disabled={historyIndex >= paletteHistory.length - 1}
            className={`p-3 rounded-full bg-black/20 backdrop-blur-md text-white 
                    ${historyIndex >= paletteHistory.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/30'}`}
            aria-label="Next palette"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      ) : (
        // Desktop navigation controls on sides
        <>
          <div className="fixed top-1/2 left-4 transform -translate-y-1/2 z-10">
            <button
              onClick={goToPrevious}
              disabled={historyIndex <= 0}
              className={`p-3 rounded-full bg-black/20 backdrop-blur-md text-white 
                        ${historyIndex <= 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/30'}`}
              aria-label="Previous palette"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-10">
            <button
              onClick={goToNext}
              disabled={historyIndex >= paletteHistory.length - 1}
              className={`p-3 rounded-full bg-black/20 backdrop-blur-md text-white 
                        ${historyIndex >= paletteHistory.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/30'}`}
              aria-label="Next palette"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </>
      )}

      {/* Instruction overlay - responsive design */}
      <div className="fixed left-1/2 transform -translate-x-1/2 bottom-8 flex flex-col items-center space-y-2 animate-fade-in">
        {isMobileView ? (
          <div className="bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-center">
            <span className="text-xs font-medium">Swipe for navigation</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-md text-white px-4 py-2 rounded-full">
            <span className="text-sm font-medium">Press</span>
            <kbd className="px-2 py-0.5 bg-white/20 rounded text-sm">Space</kbd>
            <span className="text-sm font-medium">for new palette</span>
            <span className="mx-1">|</span>
            <kbd className="px-2 py-0.5 bg-white/20 rounded text-sm">←</kbd>
            <span className="text-sm font-medium">Previous</span>
            <span className="mx-1">|</span>
            <kbd className="px-2 py-0.5 bg-white/20 rounded text-sm">→</kbd>
            <span className="text-sm font-medium">Next</span>
          </div>
        )}
      </div>
    </div>
  );
}
