import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, BookOpen, Volume2, Bookmark, Star, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { UserProfile } from '../App';

interface LearningSectionProps {
  userProfile: UserProfile | null;
}

export function LearningSection({ userProfile }: LearningSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);

  const featuredCharacters = [
    {
      character: '爱',
      pronunciation: 'ài',
      meaning: 'love',
      difficulty: 2,
      story: 'The character 爱 combines the elements of acceptance, heart, and action, representing the complete nature of love.',
      radicals: ['爫', '冖', '心', '夂'],
      examples: ['爱心', '爱情', '可爱']
    },
    {
      character: '梦',
      pronunciation: 'mèng',
      meaning: 'dream',
      difficulty: 3,
      story: 'Dreams represented by 梦 combine the wood radical (木) and evening (夕), symbolizing thoughts that grow in the darkness of night.',
      radicals: ['木', '夕', '夂'],
      examples: ['梦想', '做梦', '美梦']
    },
    {
      character: '希',
      pronunciation: 'xī',
      meaning: 'hope',
      difficulty: 1,
      story: 'Hope 希 is shown as something sparse but precious, like the rare cloth that brings joy.',
      radicals: ['巾', '乂'],
      examples: ['希望', '希少', '希奇']
    },
    {
      character: '和',
      pronunciation: 'hé',
      meaning: 'harmony',
      difficulty: 2,
      story: 'Harmony 和 combines grain and mouth, representing the peace that comes from having enough to eat.',
      radicals: ['禾', '口'],
      examples: ['和平', '和谐', '温和']
    }
  ];

  const searchResults = [
    { character: '学', pronunciation: 'xué', meaning: 'study, learn' },
    { character: '书', pronunciation: 'shū', meaning: 'book' },
    { character: '写', pronunciation: 'xiě', meaning: 'write' },
    { character: '读', pronunciation: 'dú', meaning: 'read' },
  ];

  const recentlyLearned = userProfile?.learnedCharacters?.slice(-3) || [];

  return (
    <div className="h-full overflow-y-auto p-6 pb-safe">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header Section - Fixed spacing to prevent overlap */}
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
            Learning Hub
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gray-600"
          >
            Explore and learn new characters
          </motion.p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-medium text-gray-800">Search Characters</h2>
              </div>

              <div className="relative mb-4">
                <Input
                  placeholder="Search by character, pinyin, or meaning..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 border-green-200 focus:border-green-400"
                />
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              </div>

              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 max-h-48 overflow-y-auto"
                >
                  {searchResults.map((result, index) => (
                    <motion.button
                      key={result.character}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedCharacter(result)}
                      className="w-full p-3 bg-white/60 rounded-lg border border-green-200/50 hover:bg-green-50 transition-all duration-200 flex items-center gap-3 group"
                    >
                      <div className="text-2xl font-light text-gray-800">
                        {result.character}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-gray-800">
                          {result.pronunciation}
                        </p>
                        <p className="text-xs text-gray-600">
                          {result.meaning}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Character Detail Section */}
        <AnimatePresence mode="wait">
          {selectedCharacter && (
            <motion.div
              key={selectedCharacter.character}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50 shadow-lg">
                <div className="p-6">
                  <div className="text-center mb-6">
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
                      className="text-8xl font-light text-blue-700 mb-4 drop-shadow-lg"
                      style={{ fontFamily: 'serif' }}
                    >
                      {selectedCharacter.character}
                    </motion.div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <p className="text-xl text-blue-600 font-medium">
                          {selectedCharacter.pronunciation}
                        </p>
                      </div>
                      <p className="text-gray-700 font-medium">
                        {selectedCharacter.meaning}
                      </p>
                    </div>
                  </div>

                  {selectedCharacter.story && (
                    <div className="mb-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">Story</h3>
                      <div className="bg-white/60 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 leading-relaxed text-sm">
                          {selectedCharacter.story}
                        </p>
                      </div>

                      {selectedCharacter.examples && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">Examples</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCharacter.examples.map((example: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-blue-100 text-blue-700"
                              >
                                {example}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Add to Learning List
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Featured Characters Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-medium text-gray-800">Featured Characters</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {featuredCharacters.map((char, index) => (
                  <motion.button
                    key={char.character}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 200 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCharacter(char)}
                    className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50 hover:border-green-300 hover:shadow-md transition-all duration-200 group text-left"
                  >
                    <div className="text-4xl font-light text-green-700 mb-3 text-center">
                      {char.character}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-green-800">
                        {char.pronunciation}
                      </p>
                      <p className="text-xs text-green-600">
                        {char.meaning}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className="bg-green-100 text-green-700 text-xs"
                      >
                        Level {char.difficulty}
                      </Badge>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Learning Progress Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-medium text-gray-800">Learning Progress</h2>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1, type: "spring", stiffness: 200 }}
                    className="text-3xl font-bold text-green-600 mb-1"
                  >
                    {userProfile?.learnedCharacters?.length || 0}
                  </motion.div>
                  <p className="text-sm text-gray-600">Characters Learned</p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">This Week</span>
                    <span className="text-sm font-medium text-gray-800">5/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '50%' }}
                      transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Recently Learned Section */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-lg">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-medium text-gray-800">Recently Learned</h2>
              </div>

              <div className="space-y-3">
                {recentlyLearned.map((char, index) => (
                  <motion.div
                    key={char.character}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                    className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/50 flex items-center gap-3"
                  >
                    <div className="text-2xl font-light text-green-700" style={{ fontFamily: 'serif' }}>
                      {char.character}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        {char.pronunciation}
                      </p>
                      <p className="text-xs text-green-600">
                        {char.meaning}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {recentlyLearned.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">
                      Start learning to see your progress here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}