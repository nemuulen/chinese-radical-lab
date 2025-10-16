import { useEffect, useState } from 'react';
import { motion, PanInfo } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import wisionLogo from 'figma:asset/096bffd95fa8da2758660b22756a92608e820fd1.png';

interface WelcomeScreenProps {
  userName: string;
  onSwipeUp: () => void;
}

export function WelcomeScreen({ userName, onSwipeUp }: WelcomeScreenProps) {
  const [showLogo, setShowLogo] = useState(false);
  const [showHello, setShowHello] = useState(false);
  const [showSwipe, setShowSwipe] = useState(false);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    // Staggered Apple-style animations
    const logoTimer = setTimeout(() => setShowLogo(true), 300);
    const helloTimer = setTimeout(() => setShowHello(true), 800);
    const swipeTimer = setTimeout(() => setShowSwipe(true), 1400);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(helloTimer);
      clearTimeout(swipeTimer);
    };
  }, []);

  const handleDrag = (event: any, info: PanInfo) => {
    // Only allow upward drag (negative Y values)
    if (info.offset.y < 0) {
      setDragY(info.offset.y);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = -150; // Minimum upward swipe distance (negative)
    const velocity = info.velocity.y;
    
    // If swipe up is strong enough or distance is above threshold
    if (info.offset.y < threshold || velocity < -500) {
      onSwipeUp();
    } else {
      setDragY(0);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center blue-purple-gradient overflow-hidden"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ y: dragY }}
      animate={{ y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      // Exit animation - slide up
      exit={{ y: "-100vh", transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }}
    >
      <div className="text-center space-y-20 relative z-10">
        {/* Wision Logo Image */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -15 }}
          animate={{ 
            scale: showLogo ? 1 : 0.5, 
            opacity: showLogo ? 1 : 0,
            rotateY: showLogo ? 0 : -15
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
          className="perspective-1000"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.02, 1],
              rotateZ: [0, 1, 0, -1, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <img
              src={wisionLogo}
              alt="Wision Logo"
              className="w-80 h-auto object-contain drop-shadow-2xl apple-text"
              style={{ 
                filter: 'drop-shadow(0 8px 32px rgba(255, 255, 255, 0.3)) drop-shadow(0 4px 16px rgba(139, 92, 246, 0.4))',
                transformStyle: 'preserve-3d',
                transform: 'translateZ(10px)',
                maxWidth: '400px'
              }}
            />
            
            {/* Enhanced glow effect behind logo */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-60"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(139, 92, 246, 0.1) 50%, transparent 100%)',
                filter: 'blur(20px)',
                transform: 'scale(1.2)',
                zIndex: -1
              }}
            />
          </motion.div>
        </motion.div>

        {/* 3D Glass Hello Greeting */}
        <motion.div
          initial={{ y: 30, opacity: 0, rotateX: -15 }}
          animate={{ 
            y: showHello ? 0 : 30, 
            opacity: showHello ? 1 : 0,
            rotateX: showHello ? 0 : -15
          }}
          transition={{ 
            duration: 1.2, 
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 120,
            damping: 25
          }}
          className="perspective-1000"
        >
          <div className="glass-3d inline-block">
            <motion.h1 
              className="text-6xl text-sunshine-3d apple-text"
              style={{ 
                transformStyle: 'preserve-3d',
                transform: 'translateZ(20px)'
              }}
            >
              Hello
            </motion.h1>
          </div>
        </motion.div>

        {/* Swipe Up Instruction */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ 
            y: showSwipe ? 0 : 30, 
            opacity: showSwipe ? 1 : 0 
          }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.46, 0.45, 0.94],
            type: "spring",
            stiffness: 140,
            damping: 30
          }}
          className="space-y-6"
        >
          <motion.div
            animate={{ 
              y: [-5, 5, -5],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex justify-center"
          >
            <div className="bg-white/15 backdrop-blur-sm rounded-full p-4 border border-white/20 shadow-lg">
              <ChevronUp className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </motion.div>

          {/* Progress indicator based on drag - now for upward swipes */}
          {dragY < -30 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <div className="bg-white/15 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 shadow-lg">
                <p className="text-white text-sm font-medium">
                  {dragY < -150 ? 'Release to continue' : 'Keep swiping up...'}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Enhanced background orbs that complement the logo colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/3 left-1/4 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 40, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-teal-400/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
          className="absolute top-2/3 left-2/3 w-24 h-24 bg-green-400/20 rounded-full blur-2xl"
        />
      </div>
    </motion.div>
  );
}