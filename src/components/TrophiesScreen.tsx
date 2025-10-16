import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Crown, Star, Medal, Award, TrendingUp, Calendar, Target } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { UserProfile } from '../App';
import { api } from '../utils/api';

interface TrophiesScreenProps {
  userProfile: UserProfile | null;
}

export function TrophiesScreen({ userProfile }: TrophiesScreenProps) {
  const [activeLeaderboard, setActiveLeaderboard] = useState<'score' | 'discoveries' | 'streak'>('score');
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        const response = await api.getLeaderboard(activeLeaderboard, 10);
        setLeaderboardData(response.leaderboard || []);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        // Generate mock leaderboard for demo
        setLeaderboardData([
          { rank: 1, name: userProfile?.name || 'You', score: userProfile?.score || 1250, discoveries: userProfile?.learnedCharacters?.length || 3, level: Math.floor((userProfile?.score || 1250) / 100) + 1 },
          { rank: 2, name: 'Sarah Chen', score: 1180, discoveries: 15, level: 12 },
          { rank: 3, name: 'Mike Johnson', score: 1050, discoveries: 12, level: 11 },
          { rank: 4, name: 'Emma Li', score: 980, discoveries: 10, level: 10 },
          { rank: 5, name: 'David Park', score: 920, discoveries: 8, level: 10 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [activeLeaderboard, userProfile]);

  // Load user progress analytics
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const response = await api.getProgressAnalytics();
        setUserProgress(response.progress);
      } catch (error) {
        console.error('Failed to load progress:', error);
        // Use local data as fallback
        setUserProgress({
          totalCharacters: userProfile?.learnedCharacters?.length || 3,
          totalDiscoveries: 5,
          currentLevel: Math.floor((userProfile?.score || 1250) / 100) + 1,
          pointsToNextLevel: 50,
          weeklyActivity: 3,
          totalScore: userProfile?.score || 1250
        });
      }
    };

    if (api.isAuthenticated()) {
      loadProgress();
    } else {
      // Use mock data for local-only mode
      setUserProgress({
        totalCharacters: userProfile?.learnedCharacters?.length || 3,
        totalDiscoveries: 5,
        currentLevel: Math.floor((userProfile?.score || 1250) / 100) + 1,
        pointsToNextLevel: 50,
        weeklyActivity: 3,
        totalScore: userProfile?.score || 1250
      });
    }
  }, [userProfile, api]);

  const achievements = [
    {
      id: 'first_discovery',
      title: 'First Discovery',
      description: 'Made your first character discovery',
      icon: Star,
      unlocked: (userProfile?.learnedCharacters?.length || 0) > 0,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      id: 'explorer',
      title: 'Explorer',
      description: 'Discovered 5 characters',
      icon: Trophy,
      unlocked: (userProfile?.learnedCharacters?.length || 0) >= 5,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'scholar',
      title: 'Scholar',
      description: 'Reached level 10',
      icon: Award,
      unlocked: Math.floor((userProfile?.score || 0) / 100) + 1 >= 10,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 'master',
      title: 'Character Master',
      description: 'Discovered 20 characters',
      icon: Crown,
      unlocked: (userProfile?.learnedCharacters?.length || 0) >= 20,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-medium">#{rank}</span>;
    }
  };

  const getLeaderboardValue = (entry: any) => {
    switch (activeLeaderboard) {
      case 'discoveries':
        return `${entry.discoveries} chars`;
      case 'streak':
        return `${entry.streak || 0} days`;
      default:
        return `${entry.score} pts`;
    }
  };

  // Mock data for demo purposes
  const weeklyStats = [
    { day: 'Mon', characters: 3 },
    { day: 'Tue', characters: 2 },
    { day: 'Wed', characters: 4 },
    { day: 'Thu', characters: 1 },
    { day: 'Fri', characters: 3 },
    { day: 'Sat', characters: 0 },
    { day: 'Sun', characters: 2 },
  ];

  const recentCharacters = userProfile?.learnedCharacters?.slice(-6) || [];
  const totalCharacters = userProfile?.learnedCharacters?.length || 0;

  return (
    <div className="h-full overflow-y-auto p-6 pb-safe">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center space-y-4"
        >
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-2xl font-medium text-gray-800"
          >
            My Trophies
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gray-600"
          >
            Celebrate your learning achievements
          </motion.p>
        </motion.div>

        {/* Overall Stats */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200/50 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-medium text-gray-800">Learning Stats</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                    className="text-3xl font-bold text-purple-600 mb-1"
                  >
                    {userProgress?.totalCharacters || 0}
                  </motion.div>
                  <p className="text-sm text-gray-600">Characters Learned</p>
                </div>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                    className="text-3xl font-bold text-orange-600 mb-1"
                  >
                    {userProgress?.weeklyActivity || 0}
                  </motion.div>
                  <p className="text-sm text-gray-600">Day Streak</p>
                </div>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    className="text-3xl font-bold text-green-600 mb-1"
                  >
                    {userProgress?.totalDiscoveries || 0}
                  </motion.div>
                  <p className="text-sm text-gray-600">Trophies Earned</p>
                </div>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                    className="text-3xl font-bold text-blue-600 mb-1"
                  >
                    {Math.round(((userProgress?.totalDiscoveries || 0) / achievements.length) * 100)}%
                  </motion.div>
                  <p className="text-sm text-gray-600">Completion</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <h2 className="text-lg font-medium text-gray-800">Achievements</h2>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 ml-auto">
                  {userProgress?.totalDiscoveries || 0}/{achievements.length}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  const isUnlocked = achievement.unlocked;
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        delay: 0.8 + index * 0.1, 
                        type: "spring", 
                        stiffness: 200 
                      }}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <motion.div
                          animate={isUnlocked ? {
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: isUnlocked ? Infinity : 0,
                            repeatDelay: 3
                          }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                            isUnlocked ? 'shadow-lg' : ''
                          }`}
                          style={{ 
                            backgroundColor: isUnlocked ? `${achievement.color}20` : '#f3f4f6',
                          }}
                        >
                          <Icon
                            className="w-6 h-6"
                            style={{ 
                              color: isUnlocked ? achievement.color : '#9ca3af'
                            }}
                          />
                        </motion.div>

                        <h3 className={`font-medium mb-2 text-sm ${
                          isUnlocked ? 'text-gray-800' : 'text-gray-500'
                        }`}>
                          {achievement.title}
                        </h3>

                        <p className={`text-xs mb-3 ${
                          isUnlocked ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {achievement.description}
                        </p>

                        {isUnlocked ? (
                          <Badge 
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${achievement.color}20`,
                              color: achievement.color,
                              border: `1px solid ${achievement.color}40`
                            }}
                          >
                            Unlocked!
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-xs">
                            Locked
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Weekly Progress Chart */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.8 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-medium text-gray-800">This Week's Progress</h2>
              </div>

              <div className="space-y-4">
                {weeklyStats.map((stat, index) => (
                  <motion.div
                    key={stat.day}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-10 text-sm text-gray-600 font-medium">
                      {stat.day}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.characters / 5) * 100}%` }}
                        transition={{ delay: 1.2 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <div className="w-6 text-sm text-gray-700 font-medium text-right">
                      {stat.characters}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Character Collection */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Medal className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-medium text-gray-800">Character Collection</h2>
              </div>

              {recentCharacters.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {recentCharacters.map((char, index) => (
                      <motion.div
                        key={char.character}
                        initial={{ scale: 0, rotateY: 180 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        transition={{ 
                          delay: 1.2 + index * 0.1, 
                          type: "spring", 
                          stiffness: 200 
                        }}
                        className="aspect-square bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200/50 flex flex-col items-center justify-center p-2 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                      >
                        <div 
                          className="text-2xl font-light text-purple-700 mb-1 group-hover:scale-110 transition-transform duration-200"
                          style={{ fontFamily: 'serif' }}
                        >
                          {char.character}
                        </div>
                        <div className="text-xs text-purple-600 text-center">
                          {char.pronunciation}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                    className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200/50"
                  >
                    <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-800 mb-1">
                      Character Master
                    </p>
                    <p className="text-xs text-purple-600">
                      {totalCharacters} characters collected
                    </p>
                  </motion.div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Medal className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    Start Your Collection
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Learn characters to build your trophy collection
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 1.2 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-medium text-gray-800">Recent Activity</h2>
              </div>

              <div className="space-y-3">
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Achievement Unlocked!
                    </span>
                  </div>
                  <p className="text-xs text-green-600">
                    Creative Master - Yesterday
                  </p>
                </motion.div>

                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                  className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Learned 3 characters
                    </span>
                  </div>
                  <p className="text-xs text-blue-600">
                    2 days ago
                  </p>
                </motion.div>

                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200/50"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">
                      7-day streak reached
                    </span>
                  </div>
                  <p className="text-xs text-orange-600">
                    1 week ago
                  </p>
                </motion.div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Bottom spacing for navigation */}
        <div className="h-4"></div>
      </div>
    </div>
  );
}