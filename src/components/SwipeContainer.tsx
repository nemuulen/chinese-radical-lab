import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'motion/react';
import { AppScreen } from '../App';

interface SwipeContainerProps {
  currentScreen: AppScreen;
  onScreenChange: (screen: AppScreen, swipeDirection?: 'left' | 'right') => void;
  children: React.ReactNode;
}

const screenOrder: AppScreen[] = ['home', 'creative', 'learn', 'trophies', 'settings'];

export function SwipeContainer({ currentScreen, onScreenChange, children }: SwipeContainerProps) {
  const [dragX, setDragX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = screenOrder.indexOf(currentScreen);
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100; // Minimum swipe distance
    const velocity = info.velocity.x;
    const absOffsetX = Math.abs(info.offset.x);
    const absOffsetY = Math.abs(info.offset.y);
    
    // Only process horizontal swipes (x offset should be greater than y offset)
    if (absOffsetX > absOffsetY && (absOffsetX > threshold || Math.abs(velocity) > 500)) {
      if (info.offset.x > 0) {
        // Swipe right - go to previous screen (left in the array)
        if (currentIndex > 0) {
          onScreenChange(screenOrder[currentIndex - 1], 'right'); // Pass swipe direction
        }
      } else {
        // Swipe left - go to next screen (right in the array)
        if (currentIndex < screenOrder.length - 1) {
          onScreenChange(screenOrder[currentIndex + 1], 'left'); // Pass swipe direction
        }
      }
    }
    
    setDragX(0);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    const absOffsetX = Math.abs(info.offset.x);
    const absOffsetY = Math.abs(info.offset.y);
    
    // Only allow horizontal drag if x movement is greater than y movement
    if (absOffsetX > absOffsetY) {
      // Limit drag based on screen boundaries
      let newDragX = info.offset.x;
      
      if (currentIndex === 0 && newDragX > 0) {
        // At first screen, limit right drag
        newDragX = Math.min(newDragX, 50);
      } else if (currentIndex === screenOrder.length - 1 && newDragX < 0) {
        // At last screen, limit left drag
        newDragX = Math.max(newDragX, -50);
      }
      
      setDragX(newDragX);
    }
  };

  // Only enable swipe for main app screens (not onboarding or welcome)
  const isSwipeEnabled = screenOrder.includes(currentScreen);

  const getScreenDisplayName = (screen: AppScreen) => {
    switch (screen) {
      case 'home': return 'Home';
      case 'creative': return 'Creative Lab';
      case 'learn': return 'Learn';
      case 'trophies': return 'Trophies';
      case 'settings': return 'Settings';
      default: return screen;
    }
  };

  if (!isSwipeEnabled) {
    return <div className="soft-purple-background">{children}</div>;
  }

  return (
    <div className="soft-purple-background overflow-hidden">
      <motion.div
        ref={containerRef}
        className="swipe-container w-full h-full"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        dragDirectionLock={true}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={{ x: 0 }}
        style={{ x: dragX }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        {children}
      </motion.div>
      
      {/* Swipe indicator */}
      {Math.abs(dragX) > 30 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-32 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <p className="text-white text-sm font-medium">
              {dragX > 0 
                ? currentIndex > 0 ? `← ${getScreenDisplayName(screenOrder[currentIndex - 1])}` : 'Already at first screen'
                : currentIndex < screenOrder.length - 1 ? `${getScreenDisplayName(screenOrder[currentIndex + 1])} →` : 'Already at last screen'
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* Screen position indicator dots */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex space-x-2">
          {screenOrder.map((screen, index) => (
            <div
              key={screen}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white shadow-lg scale-125' 
                  : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}