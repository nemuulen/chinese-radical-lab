import { useRef, useEffect } from 'react';
import { PanInfo, useDragControls } from 'motion/react';
import { AppScreen } from '../App';

interface VerticalSwipeContainerProps {
  children: React.ReactNode;
  currentScreen: AppScreen;
  onScreenChange: (screen: AppScreen, direction: 'up' | 'down') => void;
}

// Screen order for vertical navigation
const screenOrder: AppScreen[] = ['home', 'creative', 'learn', 'trophies', 'settings'];

export function VerticalSwipeContainer({ 
  children, 
  currentScreen, 
  onScreenChange 
}: VerticalSwipeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  const getCurrentIndex = () => screenOrder.indexOf(currentScreen);
  
  const getNextScreen = (direction: 'up' | 'down'): AppScreen | null => {
    const currentIndex = getCurrentIndex();
    
    if (direction === 'up' && currentIndex < screenOrder.length - 1) {
      return screenOrder[currentIndex + 1];
    } else if (direction === 'down' && currentIndex > 0) {
      return screenOrder[currentIndex - 1];
    }
    
    return null;
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 100; // Minimum distance for a swipe
    const velocityThreshold = 300; // Minimum velocity for a quick swipe

    // Determine swipe direction and strength
    const isUpSwipe = offset.y < -swipeThreshold || velocity.y < -velocityThreshold;
    const isDownSwipe = offset.y > swipeThreshold || velocity.y > velocityThreshold;

    if (isUpSwipe) {
      const nextScreen = getNextScreen('up');
      if (nextScreen) {
        onScreenChange(nextScreen, 'up');
      }
    } else if (isDownSwipe) {
      const nextScreen = getNextScreen('down');
      if (nextScreen) {
        onScreenChange(nextScreen, 'down');
      }
    }
  };

  // Touch event handlers for mobile optimization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length > 0) return; // Multi-touch, ignore

      const endY = e.changedTouches[0].clientY;
      const deltaY = startY - endY;
      const deltaTime = Date.now() - startTime;
      const velocity = Math.abs(deltaY) / deltaTime;

      // Swipe detection thresholds
      const minDistance = 50;
      const maxTime = 300;
      const minVelocity = 0.3;

      if (Math.abs(deltaY) > minDistance && (deltaTime < maxTime || velocity > minVelocity)) {
        if (deltaY > 0) {
          // Swiped up (finger moved up, content should go up)
          const nextScreen = getNextScreen('up');
          if (nextScreen) {
            onScreenChange(nextScreen, 'up');
          }
        } else {
          // Swiped down (finger moved down, content should go down)
          const nextScreen = getNextScreen('down');
          if (nextScreen) {
            onScreenChange(nextScreen, 'down');
          }
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default scroll behavior during swipe detection
      const currentY = e.touches[0].clientY;
      const deltaY = Math.abs(startY - currentY);
      
      if (deltaY > 10) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [currentScreen, onScreenChange]);

  return (
    <div 
      ref={containerRef}
      className="h-full w-full relative overflow-hidden swipe-container"
      style={{ 
        touchAction: 'pan-y',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none'
      }}
    >
      {children}
    </div>
  );
}