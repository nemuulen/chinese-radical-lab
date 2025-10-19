import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, Sparkles, Star, RotateCcw, Archive, Beaker } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { UserProfile } from '../App';
import { apiHelpers } from '../utils/api';
import { generateFunnyStoryFromRadicals } from '../utils/storyGen';

interface CreativeLabProps {
  userProfile: UserProfile | null;
  onUpdateProfile?: (profile: UserProfile) => void;
}

interface Radical {
  id: string;
  character: string;
  meaning: string;
  pinyin: string;
  category: string;
}

interface CharacterCombination {
  character: string;
  pronunciation: string;
  meaning: string;
  radicals: string[];
  story: string;
  difficulty: number;
}

interface DiscoveredCharacter extends CharacterCombination {
  dateDiscovered: string;
  isNew: boolean;
}

export function CreativeLab({ userProfile, onUpdateProfile }: CreativeLabProps) {
  const [availableRadicals, setAvailableRadicals] = useState<Radical[]>([]);
  const [workspaceRadicals, setWorkspaceRadicals] = useState<Radical[]>([]);
  const [discoveredCharacters, setDiscoveredCharacters] = useState<DiscoveredCharacter[]>([]);
  const [currentResult, setCurrentResult] = useState<DiscoveredCharacter | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [draggedRadical, setDraggedRadical] = useState<Radical | null>(null);

  // Comprehensive radicals database
  const radicalsDatabase: Radical[] = [
    // Nature & Elements
    { id: '1', character: '氵', meaning: 'water', pinyin: 'shuǐ', category: 'nature' },
    { id: '2', character: '木', meaning: 'wood', pinyin: 'mù', category: 'nature' },
    { id: '3', character: '火', meaning: 'fire', pinyin: 'huǒ', category: 'nature' },
    { id: '4', character: '土', meaning: 'earth', pinyin: 'tǔ', category: 'nature' },
    { id: '5', character: '金', meaning: 'metal', pinyin: 'jīn', category: 'nature' },
    { id: '6', character: '石', meaning: 'stone', pinyin: 'shí', category: 'nature' },
    { id: '7', character: '山', meaning: 'mountain', pinyin: 'shān', category: 'nature' },
    { id: '8', character: '艹', meaning: 'grass', pinyin: 'cǎo', category: 'nature' },
    
    // Celestial
    { id: '9', character: '日', meaning: 'sun', pinyin: 'rì', category: 'celestial' },
    { id: '10', character: '月', meaning: 'moon', pinyin: 'yuè', category: 'celestial' },
    { id: '11', character: '星', meaning: 'star', pinyin: 'xīng', category: 'celestial' },
    { id: '12', character: '雨', meaning: 'rain', pinyin: 'yǔ', category: 'celestial' },
    
    // Human & Body
    { id: '13', character: '人', meaning: 'person', pinyin: 'rén', category: 'human' },
    { id: '14', character: '心', meaning: 'heart', pinyin: 'xīn', category: 'human' },
    { id: '15', character: '手', meaning: 'hand', pinyin: 'shǒu', category: 'human' },
    { id: '16', character: '口', meaning: 'mouth', pinyin: 'kǒu', category: 'human' },
    { id: '17', character: '目', meaning: 'eye', pinyin: 'mù', category: 'human' },
    { id: '18', character: '耳', meaning: 'ear', pinyin: 'ěr', category: 'human' },
    { id: '19', character: '足', meaning: 'foot', pinyin: 'zú', category: 'human' },
    
    // Animals
    { id: '20', character: '犬', meaning: 'dog', pinyin: 'quǎn', category: 'animal' },
    { id: '21', character: '鸟', meaning: 'bird', pinyin: 'niǎo', category: 'animal' },
    { id: '22', character: '虫', meaning: 'insect', pinyin: 'chóng', category: 'animal' },
    { id: '23', character: '鱼', meaning: 'fish', pinyin: 'yú', category: 'animal' },
    
    // Abstract
    { id: '24', character: '大', meaning: 'big', pinyin: 'dà', category: 'abstract' },
    { id: '25', character: '小', meaning: 'small', pinyin: 'xiǎo', category: 'abstract' },
    { id: '26', character: '立', meaning: 'stand', pinyin: 'lì', category: 'abstract' },
    { id: '27', character: '卓', meaning: 'outstanding', pinyin: 'zhuō', category: 'abstract' },
    { id: '28', character: '力', meaning: 'strength', pinyin: 'lì', category: 'abstract' },
  ];

  // Character combinations database
  const characterCombinations: CharacterCombination[] = [
    {
      character: '森',
      pronunciation: 'sēn',
      meaning: 'forest',
      radicals: ['木', '木', '木'],
      story: 'Three trees growing together create a dense forest',
      difficulty: 1
    },
    {
      character: '炎',
      pronunciation: 'yán',
      meaning: 'flame',
      radicals: ['火', '火'],
      story: 'Double fire creates intense flames that reach for the sky',
      difficulty: 1
    },
    {
      character: '明',
      pronunciation: 'míng',
      meaning: 'bright',
      radicals: ['日', '月'],
      story: 'Sun and moon together bring complete illumination',
      difficulty: 2
    },
    {
      character: '休',
      pronunciation: 'xiū',
      meaning: 'rest',
      radicals: ['人', '木'],
      story: 'A person leaning against a tree, taking a peaceful rest',
      difficulty: 2
    },
    {
      character: '桌',
      pronunciation: 'zhuō',
      meaning: 'table',
      radicals: ['木', '卓'],
      story: 'Outstanding wood crafted into a fine table',
      difficulty: 2
    },
    {
      character: '淋',
      pronunciation: 'lín',
      meaning: 'pour',
      radicals: ['氵', '木'],
      story: 'Water flowing down like rain through trees',
      difficulty: 2
    },
    {
      character: '想',
      pronunciation: 'xiǎng',
      meaning: 'think',
      radicals: ['心', '木', '目'],
      story: 'The heart and eyes working together in contemplation',
      difficulty: 3
    },
    {
      character: '看',
      pronunciation: 'kàn',
      meaning: 'look',
      radicals: ['手', '目'],
      story: 'Using hand to shield eyes while looking into the distance',
      difficulty: 2
    },
    {
      character: '听',
      pronunciation: 'tīng',
      meaning: 'listen',
      radicals: ['口', '耳'],
      story: 'Opening mouth slightly to hear more clearly',
      difficulty: 2
    },
    {
      character: '跑',
      pronunciation: 'pǎo',
      meaning: 'run',
      radicals: ['足', '火'],
      story: 'Feet moving with the speed and energy of fire',
      difficulty: 2
    }
  ];

  const randomizeRadicals = useCallback(() => {
    const shuffled = [...radicalsDatabase].sort(() => Math.random() - 0.5);
    setAvailableRadicals(shuffled.slice(0, 12));
  }, []);

  // Initialize with some random radicals
  useEffect(() => {
    randomizeRadicals();
  }, [randomizeRadicals]);

  const handleDragStart = (radical: Radical) => {
    setDraggedRadical(radical);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedRadical && workspaceRadicals.length < 4) {
      if (!workspaceRadicals.find((r: Radical) => r.id === draggedRadical.id)) {
        setWorkspaceRadicals([...workspaceRadicals, draggedRadical]);
      }
    }
    setDraggedRadical(null);
  };

  const removeFromWorkspace = (radicalId: string) => {
    setWorkspaceRadicals(workspaceRadicals.filter((r: Radical) => r.id !== radicalId));
    setCurrentResult(null);
  };

  const combineRadicals = useCallback(() => {
    if (workspaceRadicals.length < 2) return;

    setIsAnimating(true);
    
    setTimeout(async () => {
  const workspaceChars = workspaceRadicals.map((r: Radical) => r.character).sort();
      
      // Find matching combination
      const combination = characterCombinations.find(combo => {
        const comboChars = combo.radicals.sort();
        return comboChars.length === workspaceChars.length && 
               comboChars.every((char, index) => char === workspaceChars[index]);
      });

      if (combination) {
        // Check if already discovered
        const alreadyDiscovered = discoveredCharacters.find(
          (d: DiscoveredCharacter) => d.character === combination.character
        );

        const newDiscovery: DiscoveredCharacter = {
          ...combination,
          dateDiscovered: new Date().toISOString().split('T')[0],
          isNew: !alreadyDiscovered
        };

        setCurrentResult(newDiscovery);
        
        if (!alreadyDiscovered) {
              setDiscoveredCharacters((prev: DiscoveredCharacter[]) => [newDiscovery, ...prev]);
          
          // Try to record discovery on backend
          try {
            const result = await apiHelpers.recordCreativeDiscovery(
              combination.character, 
              workspaceChars
            );
            
            if (result.success && userProfile && onUpdateProfile) {
              // Update profile with backend response
              const updatedProfile = {
                ...userProfile,
                score: (userProfile.score || 0) + result.pointsEarned
              };

              // Add to learned characters if new discovery
              if (result.isNew) {
                const learnedCharacter = {
                  character: combination.character,
                  pronunciation: combination.pronunciation,
                  meaning: combination.meaning,
                  datelearned: new Date().toISOString().split('T')[0],
                  difficulty: combination.difficulty
                };

                updatedProfile.learnedCharacters = [...userProfile.learnedCharacters, learnedCharacter];
              }

              onUpdateProfile(updatedProfile);
            }
          } catch (error) {
            console.error('Failed to record discovery on backend:', error);
            
            // Fallback to local scoring if backend fails
            if (userProfile && onUpdateProfile) {
              const learnedCharacter = {
                character: combination.character,
                pronunciation: combination.pronunciation,
                meaning: combination.meaning,
                datelearned: new Date().toISOString().split('T')[0],
                difficulty: combination.difficulty
              };

              const updatedProfile = {
                ...userProfile,
                learnedCharacters: [...userProfile.learnedCharacters, learnedCharacter],
                score: (userProfile.score || 0) + (combination.difficulty * 10)
              };

              onUpdateProfile(updatedProfile);
            }
          }
        }
      } else {
        // Create a custom character from radicals (prototype behaviour)
  const charRepresentation = workspaceRadicals.map((r: Radical) => r.character).join('');
        const meaning = 'Custom creation';
        const pronunciation = '?';
        const difficulty = Math.min(3, Math.max(1, Math.ceil(workspaceRadicals.length)));

  const generatedStory = generateFunnyStoryFromRadicals(workspaceRadicals.map((r: Radical) => ({ character: r.character, meaning: r.meaning })));

        const customDiscovery: DiscoveredCharacter = {
          character: charRepresentation,
          pronunciation,
          meaning,
          radicals: workspaceChars,
          story: generatedStory,
          difficulty,
          dateDiscovered: new Date().toISOString().split('T')[0],
          isNew: true
        };

        setCurrentResult(customDiscovery);
  setDiscoveredCharacters((prev: DiscoveredCharacter[]) => [customDiscovery, ...prev]);

        // Try to record discovery on backend (best-effort)
        try {
          await apiHelpers.recordCreativeDiscovery(customDiscovery.character, workspaceChars);

          if (userProfile && onUpdateProfile) {
            const learnedCharacter = {
              character: customDiscovery.character,
              pronunciation: customDiscovery.pronunciation,
              meaning: customDiscovery.meaning,
              datelearned: new Date().toISOString().split('T')[0],
              difficulty: customDiscovery.difficulty
            };

            const updatedProfile = {
              ...userProfile,
              learnedCharacters: [...(userProfile.learnedCharacters || []), learnedCharacter],
              score: (userProfile.score || 0) + (customDiscovery.radicals.length * 10)
            };

            onUpdateProfile(updatedProfile);
          }
        } catch (error) {
          console.error('Failed to record custom discovery on backend:', error);
          // Fallback: update local profile if available
          if (userProfile && onUpdateProfile) {
            const learnedCharacter = {
              character: customDiscovery.character,
              pronunciation: customDiscovery.pronunciation,
              meaning: customDiscovery.meaning,
              datelearned: new Date().toISOString().split('T')[0],
              difficulty: customDiscovery.difficulty
            };

            const updatedProfile = {
              ...userProfile,
              learnedCharacters: [...(userProfile.learnedCharacters || []), learnedCharacter],
              score: (userProfile.score || 0) + (customDiscovery.radicals.length * 10)
            };

            onUpdateProfile(updatedProfile);
          }
        }
      }
      
      setIsAnimating(false);
    }, 1500);
  }, [workspaceRadicals, discoveredCharacters, characterCombinations, userProfile, onUpdateProfile]);

  const resetWorkspace = () => {
    setWorkspaceRadicals([]);
    setCurrentResult(null);
  };

  // Generate a funny mnemonic-style story locally to help memorizing
  function generateFunnyStory(radicals: Radical[]) {
    // Create a stable-ish sentence based on radicals' meanings
    const meanings = radicals.map(r => r.meaning);
    const chars = radicals.map(r => r.character).join(' + ');
    const seed = meanings.join('-').length;
    const templates = [
      `Imagine ${meanings.join(' and ')} getting together for a wild tea party — they accidentally formed ${chars} and everyone laughed.`,
      `When ${meanings.join(' met ')}, they realized forming ${chars} was the only way to solve their snack crisis — so they became a character.`,
      `Legend says ${meanings.join(', ')} once tried karaoke and the song merged them into ${chars}. It's not elegant, but you'll never forget it.`,
      `If ${meanings.join(' and ')} were superheroes, their team-up move would be ${chars} — dramatic, loud, and oddly memorable.`
    ];

    return templates[seed % templates.length];
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      nature: 'bg-green-100 border-green-300 text-green-700',
      celestial: 'bg-blue-100 border-blue-300 text-blue-700',
      human: 'bg-orange-100 border-orange-300 text-orange-700',
      animal: 'bg-purple-100 border-purple-300 text-purple-700',
      abstract: 'bg-gray-100 border-gray-300 text-gray-700'
    };
    return colors[category as keyof typeof colors] || colors.abstract;
  };

  return (
    <div className="h-full overflow-y-auto p-6 pb-safe">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-2"
        >
          <h1 className="text-2xl font-medium text-gray-800 flex items-center justify-center gap-2">
            <Beaker className="w-6 h-6 text-purple-600" />
            Character Alchemy
          </h1>
          <p className="text-sm text-gray-600">
            Drag radicals to the workspace and discover new characters!
          </p>
        </motion.div>

        {/* Workspace - Drop Zone */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Alchemy Workspace</h2>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      // Demo: preload 日 + 月 into available radicals and workspace then combine
                      const demo = radicalsDatabase.filter(r => r.character === '日' || r.character === '月');
                      setAvailableRadicals(prev => {
                        // ensure demo radicals are present in the available list
                        const others = prev.filter(p => p.character !== '日' && p.character !== '月');
                        return [...demo, ...others].slice(0, 12);
                      });
                      // put them into workspace and trigger combine shortly after
                      setWorkspaceRadicals(demo);
                      setTimeout(() => {
                        try {
                          combineRadicals();
                        } catch (e) {
                          // ignore if combine needs state propagation
                        }
                      }, 250);
                    }}
                    size="sm"
                    className="bg-yellow-400 hover:bg-yellow-500 text-white"
                  >
                    Demo 明
                  </Button>
                  <Button
                    onClick={combineRadicals}
                    disabled={workspaceRadicals.length < 2 || isAnimating}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isAnimating ? (
                      <Sparkles className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                  <Button onClick={resetWorkspace} variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`min-h-24 p-4 border-2 border-dashed rounded-lg transition-colors ${
                  draggedRadical
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-purple-300 bg-white/50'
                }`}
              >
                <div className="flex gap-3 justify-center items-center flex-wrap">
                  <AnimatePresence>
                    {workspaceRadicals.map((radical, index) => (
                      <motion.div
                        key={radical.id}
                        initial={{ scale: 0, rotateY: 180 }}
                        animate={{ scale: 1, rotateY: 0 }}
                        exit={{ scale: 0, rotateY: -180 }}
                        transition={{ type: "spring", delay: index * 0.1 }}
                        onClick={() => removeFromWorkspace(radical.id)}
                        className="w-16 h-16 bg-white rounded-xl border-2 border-purple-200 flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 transition-colors"
                      >
                        <span className="text-2xl font-light">{radical.character}</span>
                        <span className="text-xs text-gray-500">{radical.meaning}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {workspaceRadicals.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm">
                        Drag radicals here to combine them
                      </p>
                      <p className="text-gray-400 text-xs">
                        (2-3 radicals needed)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Combination Result */}
              <AnimatePresence>
                {currentResult && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mt-4 p-4 bg-white rounded-lg border"
                  >
                    <div className="text-center">
                      <div className="text-6xl font-light mb-2" style={{ fontFamily: 'serif' }}>
                        {currentResult.character}
                      </div>
                          {currentResult.character !== '?' && (
                        <>
                          <div className="text-lg text-purple-600 font-medium">
                            {currentResult.pronunciation}
                          </div>
                          <div className="text-gray-700 font-medium mb-2">
                            {currentResult.meaning}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {currentResult.story}
                          </p>
                          {/* Show radicals used to form this character */}
                          {currentResult.radicals && currentResult.radicals.length > 0 && (
                            <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                              {currentResult.radicals.map((r: any, idx: number) => {
                                const symbol = typeof r === 'string' ? r : (r.character || r[0] || '?');
                                const meaning = typeof r === 'string' ? '' : (r.meaning ? ` — ${r.meaning}` : '');
                                return (
                                  <div key={`${symbol}-${idx}`} className="px-3 py-1 bg-gray-100 rounded-full border text-sm text-gray-700 flex items-center gap-2">
                                    <span className="text-lg">{symbol}</span>
                                    {meaning && <span className="text-xs text-gray-500">{meaning}</span>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {currentResult.isNew && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              New Discovery!
                            </Badge>
                          )}
                          {/* Save button for custom creations */}
                          {currentResult.isNew && (
                            <div className="mt-3 flex justify-center">
                              <Button
                                onClick={async () => {
                                  // Save has already attempted to persist, but this gives explicit control
                                  try {
                                    await apiHelpers.recordCreativeDiscovery(currentResult.character, currentResult.radicals || []);
                                    if (userProfile && onUpdateProfile) {
                                      const learnedCharacter = {
                                        character: currentResult.character,
                                        pronunciation: currentResult.pronunciation,
                                        meaning: currentResult.meaning,
                                        datelearned: new Date().toISOString().split('T')[0],
                                        difficulty: currentResult.difficulty
                                      };
                                      onUpdateProfile({
                                        ...userProfile,
                                        learnedCharacters: [...(userProfile.learnedCharacters || []), learnedCharacter]
                                      });
                                    }
                                  } catch (e) {
                                    console.warn('Save failed', e);
                                  }
                                }}
                                size="sm"
                                className="ml-3 bg-purple-600 text-white"
                              >
                                Save
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                      {currentResult.character === '?' && (
                        <p className="text-sm text-gray-500 mt-2">
                          {currentResult.story}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Available Radicals */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-800">Radical Collection</h2>
                <Button
                  onClick={randomizeRadicals}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Shuffle className="w-4 h-4" />
                  Randomize
                </Button>
              </div>

              <ScrollArea className="h-64">
                <div className="grid grid-cols-3 gap-3 pr-4">
                  {availableRadicals.map((radical, index) => (
                    <motion.div
                      key={radical.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.05, type: "spring" }}
                      draggable
                      onDragStart={() => handleDragStart(radical)}
                      className={`p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing transition-all hover:scale-105 ${getCategoryColor(radical.category)}`}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-light mb-1">
                          {radical.character}
                        </div>
                        <div className="text-xs font-medium">
                          {radical.meaning}
                        </div>
                        <div className="text-xs opacity-75">
                          {radical.pinyin}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </motion.div>

        {/* Discovery Log */}
        {discoveredCharacters.length > 0 && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Archive className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-medium text-gray-800">Discovery Log</h2>
                  <Badge variant="secondary">{discoveredCharacters.length}</Badge>
                </div>

                <ScrollArea className="h-48">
                  <div className="space-y-3 pr-4">
                    {discoveredCharacters.slice(0, 5).map((discovery, index) => (
                      <motion.div
                        key={`${discovery.character}-${index}`}
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="text-2xl font-light" style={{ fontFamily: 'serif' }}>
                          {discovery.character}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-green-800">
                            {discovery.meaning} ({discovery.pronunciation})
                          </div>
                          <div className="text-xs text-green-600">
                            {discovery.radicals.join(' + ')}
                          </div>
                        </div>
                        {discovery.isNew && (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            New!
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Bottom spacing */}
        <div className="h-4"></div>
      </div>
    </div>
  );
}