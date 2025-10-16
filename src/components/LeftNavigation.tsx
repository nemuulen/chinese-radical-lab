import { motion } from 'motion/react';
import { Home, Palette, BookOpen, Trophy, Settings } from 'lucide-react';
import { AppScreen } from '../App';

interface LeftNavigationProps {
  currentScreen: AppScreen;
  onScreenChange: (screen: AppScreen) => void;
}

export function LeftNavigation({ currentScreen, onScreenChange }: LeftNavigationProps) {
  const navItems = [
    { 
      id: 'home' as AppScreen, 
      icon: Home, 
      label: 'Home',
      color: '#8b5cf6'
    },
    { 
      id: 'creative' as AppScreen, 
      icon: Palette, 
      label: 'Create',
      color: '#06b6d4'
    },
    { 
      id: 'learn' as AppScreen, 
      icon: BookOpen, 
      label: 'Learn',
      color: '#10b981'
    },
    { 
      id: 'trophies' as AppScreen, 
      icon: Trophy, 
      label: 'Trophies',
      color: '#f59e0b'
    },
    { 
      id: 'settings' as AppScreen, 
      icon: Settings, 
      label: 'Settings',
      color: '#6b7280'
    },
  ];

  // Don't show navigation on onboarding or welcome screens
  if (currentScreen === 'onboarding' || currentScreen === 'welcome') {
    return null;
  }

  // Get current screen index for vertical position indicator
  const currentIndex = navItems.findIndex(item => item.id === currentScreen);

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative h-full flex flex-col"
    >
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20" />
      
      {/* Navigation content */}
      <div className="relative h-full flex flex-col justify-center py-8 px-3 w-20">
        {/* Vertical position indicator */}
        <motion.div
          className="absolute left-1 w-1 h-12 rounded-full bg-gradient-to-b from-purple-500 to-purple-600 shadow-lg"
          animate={{ 
            y: currentIndex * 80 + 20,
            opacity: currentIndex >= 0 ? 1 : 0
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        <div className="flex flex-col items-center space-y-4">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onScreenChange(item.id)}
                className="flex flex-col items-center justify-center relative touch-optimized rounded-2xl"
                style={{ 
                  minWidth: '56px', 
                  minHeight: '72px',
                  padding: '8px 4px'
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Active indicator background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNavTab"
                    className="absolute inset-0 rounded-2xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${item.color}15, ${item.color}25)`,
                      boxShadow: `0 4px 12px ${item.color}20`
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Icon and label container */}
                <div className="relative z-10 flex flex-col items-center space-y-2">
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.15 : 1,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Icon
                      size={24}
                      className="transition-colors duration-200"
                      style={{ 
                        color: isActive ? item.color : '#9ca3af',
                        filter: isActive ? `drop-shadow(0 2px 8px ${item.color}40)` : 'none'
                      }}
                    />
                  </motion.div>
                  
                  {/* Label */}
                  <motion.span
                    className="text-xs font-medium transition-colors duration-200 text-center leading-tight"
                    style={{ 
                      color: isActive ? item.color : '#9ca3af',
                      fontSize: '10px',
                      maxWidth: '48px'
                    }}
                    animate={{ 
                      opacity: isActive ? 1 : 0.7,
                      scale: isActive ? 1 : 0.95
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {item.label}
                  </motion.span>
                </div>
                
                {/* Active dot indicator on the right */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  />
                )}
                
                {/* Haptic feedback area */}
                <div className="absolute inset-0 rounded-2xl" />
              </motion.button>
            );
          })}
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
          style={{ 
            background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981, #f59e0b)',
            opacity: 0.3
          }}
          animate={{ 
            scaleX: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}