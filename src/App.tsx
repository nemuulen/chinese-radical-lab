import { useState, useEffect } from "react";
import { Onboarding } from "./components/Onboarding";
import { HomeScreen } from "./components/HomeScreen";
import { CreativeLab } from "./components/CreativeLab";
import { LearningSection } from "./components/LearningSection";
import { TrophiesScreen } from "./components/TrophiesScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { BottomNavigation } from "./components/BottomNavigation";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { SwipeContainer } from "./components/SwipeContainer";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { BackendStatus } from "./components/BackendStatus";
import { motion, AnimatePresence } from "motion/react";

export type UserProfile = {
  name: string;
  age: number;
  interests: string[];
  proficiencyLevel: number;
  knownCharacters: number;
  score: number; // Add score tracking
  learnedCharacters: Array<{
    character: string;
    pronunciation: string;
    meaning: string;
    datelearned: string;
    difficulty: number;
  }>;
  dailyChallenges?: {
    [date: string]: {
      character: string;
      answer: string;
      isCorrect: boolean;
      pointsEarned: number;
      completedAt: string;
    };
  };
};

export type AppScreen =
  | "onboarding"
  | "welcome"
  | "home"
  | "creative"
  | "learn"
  | "trophies"
  | "settings";

export default function App() {
  const [currentScreen, setCurrentScreen] =
    useState<AppScreen>("onboarding");
  const [userProfile, setUserProfile] =
    useState<UserProfile | null>(null);
  const [isWelcomeActive, setIsWelcomeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<
    "left" | "right" | null
  >(null);
  const [previousScreen, setPreviousScreen] =
    useState<AppScreen>("home");
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Mobile app initialization
  useEffect(() => {
    // Prevent default mobile behaviors
    const preventDefaultBehavior = (e: Event) => {
      e.preventDefault();
    };

    // Prevent pull-to-refresh
    document.addEventListener("touchstart", (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });

    document.addEventListener("touchend", (e) => {
      const now = Date.now();
      if (e.timeStamp - now < 500) {
        e.preventDefault();
      }
    });

    // Prevent zoom on double-tap
    let lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      },
      false,
    );

    // Set app height to match device height
    const setAppHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty(
        "--vh",
        `${vh}px`,
      );
    };

    setAppHeight();
    window.addEventListener("resize", setAppHeight);
    window.addEventListener("orientationchange", setAppHeight);

    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.removeEventListener(
        "orientationchange",
        setAppHeight,
      );
    };
  }, []);

  // Check if user has already completed onboarding
  useEffect(() => {
    const savedProfile = localStorage.getItem(
      "wision-user-profile",
    );
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      // Add learnedCharacters if it doesn't exist (for backward compatibility)
      if (!profile.learnedCharacters) {
        profile.learnedCharacters = [
          {
            character: "学",
            pronunciation: "xué",
            meaning: "to study",
            datelearned: "2024-08-01",
            difficulty: 2,
          },
          {
            character: "水",
            pronunciation: "shuǐ",
            meaning: "water",
            datelearned: "2024-08-02",
            difficulty: 1,
          },
          {
            character: "森",
            pronunciation: "sēn",
            meaning: "forest",
            datelearned: "2024-08-03",
            difficulty: 3,
          },
        ];
      }
      // Add score if it doesn't exist (for backward compatibility)
      if (typeof profile.score !== 'number') {
        profile.score = 1250; // Default starting score
      }
      // Add dailyChallenges if it doesn't exist (for backward compatibility)
      if (!profile.dailyChallenges) {
        profile.dailyChallenges = {};
      }
      localStorage.setItem(
        "wision-user-profile",
        JSON.stringify(profile),
      );
      setUserProfile(profile);
      setIsWelcomeActive(true);
      setCurrentScreen("welcome");
    }
    
    // App is loaded after checking localStorage
    setTimeout(() => setIsAppLoading(false), 500);
  }, []);

  // Reset swipe direction after animation completes
  useEffect(() => {
    if (swipeDirection) {
      const timer = setTimeout(() => {
        setSwipeDirection(null);
      }, 500); // Reset after animation duration
      return () => clearTimeout(timer);
    }
  }, [swipeDirection]);

  // EVENT HANDLERS
  const handleOnboardingComplete = (profile: UserProfile) => {
    // Add some default learned characters for demo purposes
    const enhancedProfile = {
      ...profile,
      score: 0, // Start new users with 0 score
      dailyChallenges: {}, // Initialize daily challenges tracking
      learnedCharacters: [
        {
          character: "学",
          pronunciation: "xué",
          meaning: "to study",
          datelearned: new Date().toISOString().split("T")[0],
          difficulty: 2,
        },
      ],
    };

    setUserProfile(enhancedProfile);
    // Save profile to localStorage
    localStorage.setItem(
      "wision-user-profile",
      JSON.stringify(enhancedProfile),
    );
    setIsWelcomeActive(true);
    setCurrentScreen("welcome");
  };

  const handleWelcomeSwipeUp = () => {
    setIsWelcomeActive(false);
    setSwipeDirection(null); // Reset swipe direction
    setCurrentScreen("home");
  };

  const handleScreenChange = (
    screen: AppScreen,
    direction?: "left" | "right",
  ) => {
    // Don't allow navigation back to welcome from main screens
    if (screen === "welcome") return;

    // Store previous screen and swipe direction
    setPreviousScreen(currentScreen);
    setSwipeDirection(direction || null);
    setCurrentScreen(screen);
  };

  const updateUserProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    localStorage.setItem(
      "wision-user-profile",
      JSON.stringify(updatedProfile),
    );
  };

  const renderMainScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen userProfile={userProfile} onUpdateProfile={updateUserProfile} />;
      case "creative":
        return <CreativeLab userProfile={userProfile} onUpdateProfile={updateUserProfile} />;
      case "learn":
        return <LearningSection userProfile={userProfile} />;
      case "trophies":
        return <TrophiesScreen userProfile={userProfile} />;
      case "settings":
        return (
          <SettingsScreen
            userProfile={userProfile}
            onUpdateProfile={updateUserProfile}
          />
        );
      default:
        return <HomeScreen userProfile={userProfile} onUpdateProfile={updateUserProfile} />;
    }
  };

  // CONDITIONAL RENDERS (after all hooks)

  // Show loading screen while app initializes
  if (isAppLoading) {
    return (
      <div className="mobile-app-container soft-purple-background">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading Wision...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle special screens (onboarding and welcome)
  if (currentScreen === "onboarding") {
    return (
      <div className="mobile-app-container bg-white">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  if (currentScreen === "welcome" && isWelcomeActive) {
    return (
      <div className="mobile-app-container">
        <AnimatePresence>
          <WelcomeScreen
            userName={userProfile?.name || "Student"}
            onSwipeUp={handleWelcomeSwipeUp}
          />
        </AnimatePresence>
      </div>
    );
  }

  // Main app screens with horizontal swipe functionality and bottom navigation
  return (
    <div className="mobile-app-container soft-purple-background">
      <OfflineIndicator />
      <BackendStatus />
      <div className="mobile-safe-area h-full flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          <SwipeContainer
            currentScreen={currentScreen}
            onScreenChange={handleScreenChange}
          >
            <AnimatePresence
              mode="wait"
              custom={swipeDirection}
            >
              <motion.div
                key={currentScreen}
                custom={swipeDirection}
                initial={(
                  direction: "left" | "right" | null,
                ) => {
                  // Welcome to home transition - slide up from bottom
                  if (!direction) {
                    return { y: "100vh", opacity: 1 };
                  }
                  // Horizontal swipe animations - CORRECTED LOGIC
                  // When user swipes LEFT, new screen should come from RIGHT
                  // When user swipes RIGHT, new screen should come from LEFT
                  return {
                    x:
                      direction === "left" ? "100vw" : "-100vw",
                    opacity: 1,
                  };
                }}
                animate={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                exit={(direction: "left" | "right" | null) => {
                  // Never exit when transitioning from welcome
                  if (!direction) return { opacity: 1 };

                  // Exit in same direction as swipe - CORRECTED LOGIC
                  // When user swipes LEFT, current screen should exit LEFT
                  // When user swipes RIGHT, current screen should exit RIGHT
                  return {
                    x:
                      direction === "left" ? "-100vw" : "100vw",
                    opacity: 1,
                  };
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.4,
                }}
                className="h-full w-full absolute inset-0 touch-optimized"
              >
                {renderMainScreen()}
              </motion.div>
            </AnimatePresence>
          </SwipeContainer>
        </div>

        {/* Bottom Navigation */}
        <div className="shrink-0">
          <BottomNavigation
            currentScreen={currentScreen}
            onScreenChange={(screen) =>
              handleScreenChange(screen)
            }
          />
        </div>
      </div>
    </div>
  );
}