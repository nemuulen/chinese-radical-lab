import { motion } from 'motion/react';
import { Home, Palette, BookOpen, Trophy, Settings } from 'lucide-react';
import { AppScreen } from '../App';

interface BottomNavigationProps {
  currentScreen: AppScreen;
  onScreenChange: (screen: AppScreen) => void;
}

export function BottomNavigation({ currentScreen, onScreenChange }: BottomNavigationProps) {
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

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/20" />
      
      {/* Safe area background extension */}
      <div className="absolute -bottom-full left-0 right-0 h-full bg-white/80 dark:bg-gray-900/80" />
      
      {/* Navigation content */}
      <div className="relative px-2 py-2 pb-safe">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onScreenChange(item.id)}
                className="flex flex-col items-center justify-center relative touch-optimized"
                style={{ 
                  minWidth: '60px', 
                  minHeight: '60px',
                  padding: '8px'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {/* Active indicator background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-2xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${item.color}15, ${item.color}25)`,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                
                {/* Icon container */}
                <div className="relative z-10 flex flex-col items-center space-y-1">
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <Icon
                      size={22}
                      className="transition-colors duration-200"
                      style={{ 
                        color: isActive ? item.color : '#9ca3af',
                        filter: isActive ? `drop-shadow(0 2px 8px ${item.color}40)` : 'none'
                      }}
                    />
                  </motion.div>
                  
                  {/* Label */}
                  <motion.span
                    className="text-xs font-medium transition-colors duration-200"
                    style={{ 
                      color: isActive ? item.color : '#9ca3af',
                      fontSize: '11px'
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
                
                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 w-1 h-1 rounded-full"
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
      </div>
    </motion.div>
  );
}