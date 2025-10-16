import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { UserProfile } from "../App";
import {
  Settings,
  User,
  Bell,
  Moon,
  Volume2,
  Smartphone,
  HelpCircle,
  LogOut,
  Edit,
  Shield,
  Globe,
  ChevronRight,
  Star,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";

interface SettingsScreenProps {
  userProfile: UserProfile | null;
  onUpdateProfile: (profile: UserProfile) => void;
}

export function SettingsScreen({
  userProfile,
  onUpdateProfile,
}: SettingsScreenProps) {
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("wision-user-profile");
    window.location.reload();
  };

  const resetDailyChallenges = () => {
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        dailyChallenges: {}
      };
      onUpdateProfile(updatedProfile);
    }
  };

  const resetAllProgress = () => {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
      localStorage.removeItem("wision-user-profile");
      window.location.reload();
    }
  };

  const settingsSections = [
    {
      title: "Account",
      icon: User,
      items: [
        {
          label: "Profile Information",
          description: "Update your name, age, and interests",
          icon: Edit,
          action: () => setShowProfile(!showProfile),
          hasArrow: true,
        },
        {
          label: "Learning Progress",
          description: `${userProfile?.learnedCharacters?.length || 0} characters learned`,
          icon: Star,
          hasArrow: true,
        },
      ],
    },
    {
      title: "Preferences",
      icon: Settings,
      items: [
        {
          label: "Notifications",
          description: "Daily learning reminders",
          icon: Bell,
          toggle: true,
          value: notifications,
          onChange: setNotifications,
        },
        {
          label: "Sound Effects",
          description: "Audio feedback and pronunciation",
          icon: Volume2,
          toggle: true,
          value: soundEffects,
          onChange: setSoundEffects,
        },
        {
          label: "Dark Mode",
          description: "Switch to dark theme",
          icon: Moon,
          toggle: true,
          value: darkMode,
          onChange: setDarkMode,
        },
      ],
    },
    {
      title: "Learning",
      icon: Smartphone,
      items: [
        {
          label: "Study Reminders",
          description: "Set daily learning goals",
          icon: Bell,
          hasArrow: true,
        },
        {
          label: "Difficulty Level",
          description: "Adjust character complexity",
          icon: Star,
          hasArrow: true,
        },
      ],
    },
    {
      title: "Support",
      icon: HelpCircle,
      items: [
        {
          label: "Help Center",
          description: "Get help and support",
          icon: HelpCircle,
          hasArrow: true,
        },
        {
          label: "Privacy Policy",
          description: "Learn about data handling",
          icon: Shield,
          hasArrow: true,
        },
        {
          label: "Language",
          description: "English",
          icon: Globe,
          hasArrow: true,
        },
      ],
    },
    {
      title: "Developer",
      icon: Settings,
      items: [
        {
          label: "Reset Daily Challenges",
          description: "Clear challenge completion history",
          icon: RotateCcw,
          action: resetDailyChallenges,
          hasArrow: false,
        },
        {
          label: "Reset All Progress",
          description: "Clear all user data and start over",
          icon: Trash2,
          action: resetAllProgress,
          hasArrow: false,
        },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 pb-safe">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-center space-y-4"
        >
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-2xl font-medium text-gray-800"
          >
            Settings
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gray-600"
          >
            Customize your learning experience
          </motion.p>
        </motion.div>

        {/* User Profile Card */}
        {userProfile && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium text-purple-900 text-lg">
                        {userProfile.name}
                      </h3>
                      <p className="text-sm text-purple-600">
                        Age {userProfile.age}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {userProfile.interests
                          .slice(0, 2)
                          .map((interest, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-purple-100 text-purple-700"
                            >
                              {interest}
                            </Badge>
                          ))}
                        {userProfile.interests.length > 2 && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-purple-100 text-purple-700"
                          >
                            +{userProfile.interests.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    Level {userProfile.proficiencyLevel}
                  </Badge>
                </div>

                {/* Learning Stats */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-white/60 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {userProfile.learnedCharacters?.length ||
                        0}
                    </div>
                    <p className="text-xs text-purple-600">
                      Characters
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {userProfile.score || 0}
                    </div>
                    <p className="text-xs text-blue-600">
                      Total Score
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.keys(userProfile.dailyChallenges || {}).length}
                    </div>
                    <p className="text-xs text-green-600">
                      Daily Challenges
                    </p>
                  </div>
                </div>

                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-purple-200 pt-4 mt-4 space-y-3"
                  >
                    <div>
                      <span className="font-medium text-purple-900">
                        All Interests:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {userProfile.interests.map(
                          (interest, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs bg-purple-100 text-purple-700"
                            >
                              {interest}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.6 + sectionIndex * 0.1,
                duration: 0.6,
              }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <section.icon className="w-5 h-5 text-purple-600" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <div key={item.label}>
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                          delay:
                            0.8 +
                            sectionIndex * 0.1 +
                            itemIndex * 0.05,
                          duration: 0.4,
                        }}
                        className={`flex items-center justify-between p-4 rounded-lg hover:bg-purple-50/50 transition-all duration-200 group ${
                          item.action ? "cursor-pointer" : ""
                        }`}
                        onClick={item.action}
                        whileTap={
                          item.action ? { scale: 0.98 } : {}
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                            <item.icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 group-hover:text-purple-900 transition-colors">
                              {item.label}
                            </div>
                            <div className="text-sm text-gray-600 group-hover:text-purple-700 transition-colors">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.toggle && item.onChange && (
                            <Switch
                              checked={item.value || false}
                              onCheckedChange={item.onChange}
                              className="data-[state=checked]:bg-purple-500"
                            />
                          )}
                          {item.hasArrow && (
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                          )}
                        </div>
                      </motion.div>
                      {itemIndex < section.items.length - 1 && (
                        <Separator className="ml-14 bg-purple-100/50" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* App Information */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <CardContent className="p-6 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <div className="text-2xl font-bold text-white">
                    W
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800">
                    Wision
                  </h3>
                  <p className="text-sm text-gray-600">
                    Version 1.0.0
                  </p>
                  <p className="text-xs text-gray-500">
                    Mandarin Learning Reimagined
                  </p>
                </div>
              </div>

              <Separator className="bg-purple-100/50" />

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Rate Wision
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bottom spacing for navigation */}
        <div className="h-4"></div>
      </div>
    </div>
  );
}