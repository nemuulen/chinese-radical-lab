import { motion } from 'motion/react';
import { Calendar, Star, User, Coins, Trophy, Send } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UserProfile } from '../App';
import { useState, useEffect } from 'react';
import { apiHelpers } from '../utils/api';

interface HomeScreenProps {
  userProfile: UserProfile | null;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export function HomeScreen({ userProfile, onUpdateProfile }: HomeScreenProps) {
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeAttempted, setChallengeAttempted] = useState(false);
  const [challengeResult, setChallengeResult] = useState<'correct' | 'incorrect' | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
  const [todaysCompletion, setTodaysCompletion] = useState<any>(null);

  // Load daily challenge from backend
  useEffect(() => {
    const loadDailyChallenge = async () => {
      try {
        setIsLoadingChallenge(true);
        const challenge = await apiHelpers.getTodaysChallenge();
        
        if (challenge) {
          setDailyChallenge(challenge);
        } else {
          // Fallback to local challenge
          setDailyChallenge({
            character: '桌',
            pronunciation: 'zhuō',
            meaning: 'table',
            acceptableMeanings: ['table', 'desk'],
            level: 'moderate',
            radicals: [
              { character: '木', meaning: 'wood, tree' },
              { character: '卓', meaning: 'tall, prominent, outstanding' }
            ],
            hint: 'This furniture piece is made from wood and stands at a height for people to work or eat at.',
            description: 'Look at the character above and the radical meanings below. What English word describes this object?',
            points: 50
          });
        }

        // Check if user has already completed today's challenge
        const today = new Date().toISOString().split('T')[0];
        const completion = userProfile?.dailyChallenges?.[today];
        if (completion) {
          setTodaysCompletion(completion);
          setChallengeAttempted(true);
          setChallengeResult(completion.isCorrect ? 'correct' : 'incorrect');
          setChallengeAnswer(completion.answer);
        }
      } catch (error) {
        console.error('Failed to load daily challenge:', error);
        // Use fallback challenge
        setDailyChallenge({
          character: '桌',
          pronunciation: 'zhuō',
          meaning: 'table',
          acceptableMeanings: ['table', 'desk'],
          level: 'moderate',
          radicals: [
            { character: '木', meaning: 'wood, tree' },
            { character: '卓', meaning: 'tall, prominent, outstanding' }
          ],
          hint: 'This furniture piece is made from wood and stands at a height for people to work or eat at.',
          description: 'Look at the character above and the radical meanings below. What English word describes this object?',
          points: 50
        });

        // Check completion even on error
        const today = new Date().toISOString().split('T')[0];
        const completion = userProfile?.dailyChallenges?.[today];
        if (completion) {
          setTodaysCompletion(completion);
          setChallengeAttempted(true);
          setChallengeResult(completion.isCorrect ? 'correct' : 'incorrect');
          setChallengeAnswer(completion.answer);
        }
      } finally {
        setIsLoadingChallenge(false);
      }
    };

    loadDailyChallenge();
  }, [userProfile]);

  const characterOfTheDay = {
    character: '智',
    pronunciation: 'zhì',
    meaning: 'wisdom, intelligence',
    story: `The character 智 (zhì) combines 知 (knowledge) and 日 (sun), representing the wisdom that comes from illuminating knowledge like the sun lights up the world. Ancient scholars believed true wisdom was like the sun - it not only enlightens oneself but also guides others.`,
    difficulty: 3,
    radicals: ['知', '日']
  };

  const handleChallengeSubmit = async () => {
    if (!userProfile || !onUpdateProfile || challengeAttempted || !dailyChallenge) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Check if already completed today (extra safety check)
    if (userProfile.dailyChallenges?.[today]) {
      return;
    }

    try {
      const result = await apiHelpers.submitTodaysChallenge(challengeAnswer.trim());
      
      if (result.success) {
        setChallengeAttempted(true);
        setChallengeResult(result.isCorrect ? 'correct' : 'incorrect');

        // Create completion record
        const completion = {
          character: dailyChallenge.character,
          answer: challengeAnswer.trim(),
          isCorrect: result.isCorrect || false,
          pointsEarned: result.pointsEarned || 0,
          completedAt: new Date().toISOString()
        };

        setTodaysCompletion(completion);

        // Update user profile with completion and new score
        const updatedProfile = {
          ...userProfile,
          score: (userProfile.score || 0) + (result.pointsEarned || 0),
          dailyChallenges: {
            ...userProfile.dailyChallenges,
            [today]: completion
          }
        };

        onUpdateProfile(updatedProfile);
      } else {
        // Fallback to local logic if API fails
        const isCorrect = dailyChallenge.acceptableMeanings?.some((meaning: string) => 
          meaning.toLowerCase() === challengeAnswer.trim().toLowerCase()
        ) || false;
        
        const pointsEarned = isCorrect ? 25 : 5;

        setChallengeAttempted(true);
        setChallengeResult(isCorrect ? 'correct' : 'incorrect');

        // Create completion record
        const completion = {
          character: dailyChallenge.character,
          answer: challengeAnswer.trim(),
          isCorrect,
          pointsEarned,
          completedAt: new Date().toISOString()
        };

        setTodaysCompletion(completion);

        const updatedProfile = {
          ...userProfile,
          score: (userProfile.score || 0) + pointsEarned,
          dailyChallenges: {
            ...userProfile.dailyChallenges,
            [today]: completion
          }
        };

        onUpdateProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Failed to submit challenge:', error);
      // Fallback to local logic
      const isCorrect = dailyChallenge.acceptableMeanings?.some((meaning: string) => 
        meaning.toLowerCase() === challengeAnswer.trim().toLowerCase()
      ) || false;
      
      const pointsEarned = isCorrect ? 25 : 5;

      setChallengeAttempted(true);
      setChallengeResult(isCorrect ? 'correct' : 'incorrect');

      // Create completion record
      const completion = {
        character: dailyChallenge.character,
        answer: challengeAnswer.trim(),
        isCorrect,
        pointsEarned,
        completedAt: new Date().toISOString()
      };

      setTodaysCompletion(completion);

      const updatedProfile = {
        ...userProfile,
        score: (userProfile.score || 0) + pointsEarned,
        dailyChallenges: {
          ...userProfile.dailyChallenges,
          [today]: completion
        }
      };

      onUpdateProfile(updatedProfile);
    }
  };

  // Use actual user score if available
  const userStats = {
    score: userProfile?.score || 1250,
    tokensLeft: 15,
    rank: 'Scholar'
  };

  // Calculate challenge streak and stats
  const calculateChallengeStats = () => {
    const challenges = userProfile?.dailyChallenges || {};
    const today = new Date();
    let streak = 0;
    let weeklyCompleted = 0;
    
    // Calculate current streak (consecutive days with completed challenges)
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (challenges[dateStr]) {
        if (i === 0 || streak === i) {
          streak = i + 1;
        } else {
          break;
        }
      } else if (i === 0) {
        // No challenge today, but check if there's one from yesterday
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (challenges[yesterdayStr]) {
          streak = 1;
          // Continue checking backwards for the actual streak
          for (let j = 1; j < 30; j++) {
            const prevDate = new Date(today);
            prevDate.setDate(today.getDate() - 1 - j);
            const prevDateStr = prevDate.toISOString().split('T')[0];
            if (challenges[prevDateStr]) {
              streak = j + 1;
            } else {
              break;
            }
          }
        }
        break;
      } else {
        break;
      }
    }
    
    // Calculate weekly completed challenges (last 7 days)
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (challenges[dateStr]) {
        weeklyCompleted++;
      }
    }
    
    return { streak, weeklyCompleted };
  };

  const challengeStats = calculateChallengeStats();

  const todayStats = {
    streak: challengeStats.streak,
    charactersLearned: userProfile?.learnedCharacters?.length || 0,
    weeklyGoal: 20,
    completed: 15
  };

  const weeklyGoals = [
    { label: 'Characters Learned', current: todayStats.charactersLearned, target: 15, color: '#8b5cf6' },
    { label: 'Daily Challenges', current: challengeStats.weeklyCompleted, target: 7, color: '#10b981' },
    { label: 'Creative Creations', current: 3, target: 5, color: '#06b6d4' },
  ];

  // Calculate challenge completion rate
  const totalDays = Object.keys(userProfile?.dailyChallenges || {}).length;
  const correctChallenges = Object.values(userProfile?.dailyChallenges || {}).filter(c => c.isCorrect).length;
  const challengeAccuracy = totalDays > 0 ? Math.round((correctChallenges / totalDays) * 100) : 0;

  // Don't render if daily challenge is still loading
  if (isLoadingChallenge || !dailyChallenge) {
    return (
      <div className="h-full overflow-y-auto p-6 pb-safe">
        <div className="max-w-md mx-auto space-y-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading daily challenge...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 pb-safe">
      <div className="max-w-md mx-auto space-y-8">
        {/* User Profile Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-white/50 shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 border-2 border-purple-200">
                    <AvatarImage src="" alt={userProfile?.name || 'User'} />
                    <AvatarFallback className="bg-purple-100 text-purple-700 text-lg font-medium">
                      {(userProfile?.name || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-lg font-medium text-gray-800">{userProfile?.name || 'Student'}</h1>
                    <p className="text-sm text-gray-600">{userStats.rank}</p>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="font-medium">{userStats.score}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-700">
                    <Coins className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{userStats.tokensLeft} tokens</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Welcome Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center space-y-4"
        >
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl font-medium text-gray-800"
          >
            Ready to continue your Mandarin journey?
          </motion.h2>
        </motion.div>

        {/* Character of the Day */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200/50 shadow-lg">
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Character of the Day</h2>
                
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 1, 0, -1, 0]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-8xl font-light text-purple-700 mb-4 drop-shadow-lg"
                  style={{ fontFamily: 'serif' }}
                >
                  {characterOfTheDay.character}
                </motion.div>
                
                <div className="space-y-2">
                  <p className="text-xl text-purple-600 font-medium">
                    {characterOfTheDay.pronunciation}
                  </p>
                  <p className="text-gray-700 font-medium">
                    {characterOfTheDay.meaning}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className="bg-purple-100 text-purple-700"
                  >
                    Level {characterOfTheDay.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Story Section */}
              <div className="bg-white/60 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Story</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {characterOfTheDay.story}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Challenge of the Day */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200/50 shadow-lg">
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Challenge of the Day</h2>
                
                {/* Character Display */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-3">What does this character mean in English?</p>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 1, 0, -1, 0]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-8xl font-light text-green-700 mb-4 drop-shadow-lg"
                    style={{ fontFamily: 'serif' }}
                  >
                    {dailyChallenge?.character || '?'}
                  </motion.div>
                  <div className="text-lg text-green-600 font-medium mb-2">
                    {dailyChallenge?.pronunciation || '?'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-lg text-green-600 font-medium">
                    ? ? ?
                  </p>
                  <p className="text-gray-700 font-medium">
                    Enter the English meaning below
                  </p>
                  <Badge 
                    variant="secondary" 
                    className="bg-green-100 text-green-700"
                  >
                    Level {dailyChallenge?.level || 'unknown'}
                  </Badge>
                </div>
              </div>

              {/* Challenge Input */}
              {!challengeAttempted && (
                <div className="bg-white/80 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-800 mb-3">Your Answer</h3>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter the English meaning..."
                      value={challengeAnswer}
                      onChange={(e) => setChallengeAnswer(e.target.value)}
                      className="flex-1 text-center text-lg"
                      maxLength={20}
                    />
                    <Button 
                      onClick={handleChallengeSubmit}
                      disabled={!challengeAnswer.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    +5 points for trying • +20 bonus if correct
                  </p>
                </div>
              )}

              {/* Already Completed Message */}
              {challengeAttempted && !challengeResult && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">✅</div>
                    <h3 className="font-medium text-blue-800 mb-2">
                      Challenge Already Completed!
                    </h3>
                    <p className="text-sm text-blue-700">
                      You've already completed today's challenge. Come back tomorrow for a new one!
                    </p>
                  </div>
                </div>
              )}

              {/* Challenge Result */}
              {challengeAttempted && challengeResult && (
                <div className={`rounded-lg p-4 mb-4 ${challengeResult === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {challengeResult === 'correct' ? '🎉' : '💪'}
                    </div>
                    <h3 className={`font-medium mb-2 ${challengeResult === 'correct' ? 'text-green-800' : 'text-orange-800'}`}>
                      {challengeResult === 'correct' ? 'Excellent!' : 'Good try!'}
                    </h3>
                    <p className={`text-sm mb-3 ${challengeResult === 'correct' ? 'text-green-700' : 'text-orange-700'}`}>
                      {challengeResult === 'correct' 
                        ? `Correct! ${dailyChallenge?.character || '?'} (${dailyChallenge?.pronunciation || '?'}) means "${dailyChallenge?.meaning || 'unknown'}"`
                        : `The correct answer is "${dailyChallenge?.meaning || 'unknown'}". ${dailyChallenge?.character || '?'} (${dailyChallenge?.pronunciation || '?'}) means "${dailyChallenge?.meaning || 'unknown'}"`
                      }
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <Badge variant="secondary" className={challengeResult === 'correct' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                        +{todaysCompletion?.pointsEarned || (challengeResult === 'correct' ? '25' : '5')} points earned
                      </Badge>
                      {todaysCompletion && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Completed today
                        </Badge>
                      )}
                    </div>
                    {todaysCompletion && (
                      <p className="text-xs text-gray-500 mt-2">
                        Your answer: "{todaysCompletion.answer}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Hint Section */}
              <div className="bg-white/60 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">💡 Hint</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {dailyChallenge?.hint || 'No hint available'}
                </p>
              </div>

              {/* Radical Meanings */}
              <div className="bg-white/60 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">📚 Radical Meanings</h3>
                <div className="space-y-2">
                  {(dailyChallenge?.radicals || []).map((radical, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-2xl font-light" style={{ fontFamily: 'serif' }}>
                        {radical.character}
                      </span>
                      <span className="text-sm text-gray-700">
                        {radical.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white/60 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Challenge</h3>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {dailyChallenge?.description || 'Complete the challenge to learn more about this character'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Today's Progress */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-medium text-gray-800">Today's Progress</h2>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                    className="text-3xl font-bold text-orange-600 mb-1"
                  >
                    {todayStats.streak}
                  </motion.div>
                  <p className="text-sm text-gray-600">Day Streak</p>
                </div>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
                    className="text-3xl font-bold text-purple-600 mb-1"
                  >
                    {todayStats.charactersLearned}
                  </motion.div>
                  <p className="text-sm text-gray-600">Characters Learned</p>
                </div>
              </div>

              {/* Challenge Accuracy Stats */}
              {totalDays > 0 && (
                <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-white/40 rounded-lg">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.0, type: "spring", stiffness: 200 }}
                      className="text-2xl font-bold text-green-600 mb-1"
                    >
                      {challengeAccuracy}%
                    </motion.div>
                    <p className="text-xs text-gray-600">Challenge Accuracy</p>
                  </div>

                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                      className="text-2xl font-bold text-blue-600 mb-1"
                    >
                      {totalDays}
                    </motion.div>
                    <p className="text-xs text-gray-600">Total Challenges</p>
                  </div>
                </div>
              )}

              {/* Weekly Goals Progress */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-800">Weekly Goals</h3>
                {weeklyGoals.map((goal, index) => (
                  <div key={goal.label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{goal.label}</span>
                      <span className="text-sm font-medium text-gray-800">
                        {goal.current}/{goal.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: goal.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(goal.current / goal.target) * 100}%` }}
                        transition={{ delay: 1 + index * 0.1, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Achievement Badge */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200/50 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800 mb-1">
                    {todayStats.streak > 0 ? 'Amazing Progress!' : 'Ready to Start?'}
                  </h3>
                  <p className="text-sm text-yellow-600">
                    {todayStats.streak > 0 
                      ? `You're on a ${todayStats.streak}-day challenge streak! Keep up the excellent work 🔥`
                      : `Complete today's challenge to start your learning streak! 🌟`
                    }
                  </p>
                </div>
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