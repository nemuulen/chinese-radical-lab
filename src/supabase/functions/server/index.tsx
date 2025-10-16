import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client for database operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  {
    auth: { persistSession: false }
  }
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Types
interface UserProfile {
  name: string;
  age: number;
  interests: string[];
  proficiencyLevel: number;
  knownCharacters: number;
  score: number;
  learnedCharacters: Array<{
    character: string;
    pronunciation: string;
    meaning: string;
    datelearned: string;
    difficulty: number;
  }>;
}

interface CharacterData {
  character: string;
  pronunciation: string;
  meaning: string;
  radicals: string[];
  story: string;
  difficulty: number;
  category: string;
}

interface DailyChallenge {
  id: string;
  date: string;
  character: string;
  pronunciation: string;
  meaning: string;
  acceptableMeanings: string[];
  radicals: Array<{
    character: string;
    meaning: string;
  }>;
  hint: string;
  points: number;
}

// Health check endpoint
app.get("/make-server-5695837e/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// User Profile Endpoints
app.post("/make-server-5695837e/users/register", async (c) => {
  try {
    const { email, password, profile } = await c.req.json();
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: profile,
      email_confirm: true // Auto-confirm since no email server configured
    });

    if (authError) {
      console.log('Auth registration error:', authError);
      return c.json({ error: 'Registration failed', details: authError.message }, 400);
    }

    // Store additional profile data in KV store
    const userId = authData.user.id;
    await kv.set(`user_profile:${userId}`, {
      ...profile,
      userId,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      user: authData.user,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.log('Registration error:', error);
    return c.json({ error: 'Registration failed', details: error.message }, 500);
  }
});

app.post("/make-server-5695837e/users/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('Login error:', error);
      return c.json({ error: 'Login failed', details: error.message }, 401);
    }

    // Update last active timestamp
    const userId = data.user.id;
    const profile = await kv.get(`user_profile:${userId}`);
    if (profile) {
      await kv.set(`user_profile:${userId}`, {
        ...profile,
        lastActive: new Date().toISOString()
      });
    }

    return c.json({
      success: true,
      session: data.session,
      user: data.user
    });
  } catch (error) {
    console.log('Login error:', error);
    return c.json({ error: 'Login failed', details: error.message }, 500);
  }
});

app.get("/make-server-5695837e/users/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.put("/make-server-5695837e/users/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const updatedProfile = await c.req.json();
    
    await kv.set(`user_profile:${user.id}`, {
      ...updatedProfile,
      userId: user.id,
      updatedAt: new Date().toISOString()
    });

    return c.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Character Database Endpoints
app.get("/make-server-5695837e/characters", async (c) => {
  try {
    const category = c.req.query('category');
    const difficulty = c.req.query('difficulty');
    
    let characters = await kv.get('characters_database');
    
    // Initialize characters database if it doesn't exist
    if (!characters) {
      characters = await initializeCharactersDatabase();
    }

    // Filter by category and difficulty if specified
    let filteredCharacters = characters;
    if (category) {
      filteredCharacters = filteredCharacters.filter((char: CharacterData) => char.category === category);
    }
    if (difficulty) {
      filteredCharacters = filteredCharacters.filter((char: CharacterData) => char.difficulty === parseInt(difficulty));
    }

    return c.json({ characters: filteredCharacters });
  } catch (error) {
    console.log('Characters fetch error:', error);
    return c.json({ error: 'Failed to fetch characters' }, 500);
  }
});

app.get("/make-server-5695837e/characters/random", async (c) => {
  try {
    const count = parseInt(c.req.query('count') || '1');
    const difficulty = c.req.query('difficulty');
    
    let characters = await kv.get('characters_database');
    if (!characters) {
      characters = await initializeCharactersDatabase();
    }

    // Filter by difficulty if specified
    let filteredCharacters = characters;
    if (difficulty) {
      filteredCharacters = filteredCharacters.filter((char: CharacterData) => char.difficulty === parseInt(difficulty));
    }

    // Get random characters
    const shuffled = filteredCharacters.sort(() => Math.random() - 0.5);
    const randomCharacters = shuffled.slice(0, count);

    return c.json({ characters: randomCharacters });
  } catch (error) {
    console.log('Random characters error:', error);
    return c.json({ error: 'Failed to fetch random characters' }, 500);
  }
});

// Daily Challenge Endpoints
app.get("/make-server-5695837e/challenges/daily", async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let dailyChallenge = await kv.get(`daily_challenge:${today}`);

    if (!dailyChallenge) {
      // Generate new daily challenge
      dailyChallenge = await generateDailyChallenge(today);
      await kv.set(`daily_challenge:${today}`, dailyChallenge);
    }

    return c.json({ challenge: dailyChallenge });
  } catch (error) {
    console.log('Daily challenge error:', error);
    return c.json({ error: 'Failed to fetch daily challenge' }, 500);
  }
});

app.post("/make-server-5695837e/challenges/submit", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { challengeId, answer, challengeDate } = await c.req.json();
    
    // Get the challenge
    const challenge = await kv.get(`daily_challenge:${challengeDate}`);
    if (!challenge) {
      return c.json({ error: 'Challenge not found' }, 404);
    }

    // Check if user already submitted today
    const submissionKey = `challenge_submission:${user.id}:${challengeDate}`;
    const existingSubmission = await kv.get(submissionKey);
    if (existingSubmission) {
      return c.json({ error: 'Challenge already submitted today' }, 400);
    }

    // Check answer
    const isCorrect = challenge.acceptableMeanings.some(
      (meaning: string) => meaning.toLowerCase() === answer.toLowerCase().trim()
    );

    const pointsEarned = isCorrect ? 25 : 5;

    // Record submission
    await kv.set(submissionKey, {
      challengeId,
      answer,
      isCorrect,
      pointsEarned,
      submittedAt: new Date().toISOString()
    });

    // Update user profile score
    const profile = await kv.get(`user_profile:${user.id}`);
    if (profile) {
      profile.score = (profile.score || 0) + pointsEarned;
      await kv.set(`user_profile:${user.id}`, profile);
    }

    return c.json({
      success: true,
      isCorrect,
      pointsEarned,
      correctAnswer: challenge.meaning,
      explanation: challenge.story || `${challenge.character} (${challenge.pronunciation}) means "${challenge.meaning}"`
    });
  } catch (error) {
    console.log('Challenge submission error:', error);
    return c.json({ error: 'Failed to submit challenge' }, 500);
  }
});

// Creative Lab Discovery Endpoints
app.post("/make-server-5695837e/discoveries", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const { character, radicals, method } = await c.req.json();
    
    // Get user's discoveries
    const userDiscoveries = await kv.get(`discoveries:${user.id}`) || [];
    
    // Check if already discovered
    const alreadyDiscovered = userDiscoveries.find((d: any) => d.character === character);
    
    if (!alreadyDiscovered) {
      const discovery = {
        character,
        radicals,
        method, // 'creative_lab' or 'learning'
        discoveredAt: new Date().toISOString(),
        points: radicals.length * 10 // 10 points per radical used
      };

      userDiscoveries.push(discovery);
      await kv.set(`discoveries:${user.id}`, userDiscoveries);

      // Update user profile
      const profile = await kv.get(`user_profile:${user.id}`);
      if (profile) {
        profile.score = (profile.score || 0) + discovery.points;
        await kv.set(`user_profile:${user.id}`, profile);
      }

      return c.json({
        success: true,
        isNew: true,
        pointsEarned: discovery.points,
        totalDiscoveries: userDiscoveries.length
      });
    }

    return c.json({
      success: true,
      isNew: false,
      pointsEarned: 0,
      totalDiscoveries: userDiscoveries.length
    });
  } catch (error) {
    console.log('Discovery submission error:', error);
    return c.json({ error: 'Failed to record discovery' }, 500);
  }
});

app.get("/make-server-5695837e/discoveries", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const discoveries = await kv.get(`discoveries:${user.id}`) || [];
    return c.json({ discoveries });
  } catch (error) {
    console.log('Discoveries fetch error:', error);
    return c.json({ error: 'Failed to fetch discoveries' }, 500);
  }
});

// Leaderboard Endpoints
app.get("/make-server-5695837e/leaderboard", async (c) => {
  try {
    const type = c.req.query('type') || 'score'; // 'score', 'discoveries', 'streak'
    const limit = parseInt(c.req.query('limit') || '10');

    // Get all user profiles (in a real app, you'd want pagination)
    const profileKeys = await kv.getByPrefix('user_profile:');
    const profiles = profileKeys.map((entry: any) => entry.value);

    // Sort based on type
    let sortedProfiles;
    switch (type) {
      case 'discoveries':
        sortedProfiles = profiles.sort((a: any, b: any) => (b.learnedCharacters?.length || 0) - (a.learnedCharacters?.length || 0));
        break;
      case 'streak':
        // This would need streak tracking implementation
        sortedProfiles = profiles.sort((a: any, b: any) => (b.currentStreak || 0) - (a.currentStreak || 0));
        break;
      default:
        sortedProfiles = profiles.sort((a: any, b: any) => (b.score || 0) - (a.score || 0));
    }

    // Remove sensitive data and limit results
    const leaderboard = sortedProfiles.slice(0, limit).map((profile: any, index: number) => ({
      rank: index + 1,
      name: profile.name,
      score: profile.score || 0,
      discoveries: profile.learnedCharacters?.length || 0,
      level: Math.floor((profile.score || 0) / 100) + 1
    }));

    return c.json({ leaderboard, type });
  } catch (error) {
    console.log('Leaderboard error:', error);
    return c.json({ error: 'Failed to fetch leaderboard' }, 500);
  }
});

// Analytics Endpoints
app.get("/make-server-5695837e/analytics/progress", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization required' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (!user || error) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    const profile = await kv.get(`user_profile:${user.id}`);
    const discoveries = await kv.get(`discoveries:${user.id}`) || [];
    
    // Calculate progress metrics
    const totalCharacters = profile?.learnedCharacters?.length || 0;
    const totalDiscoveries = discoveries.length;
    const currentLevel = Math.floor((profile?.score || 0) / 100) + 1;
    const pointsToNextLevel = (currentLevel * 100) - (profile?.score || 0);

    // Weekly activity (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const recentDiscoveries = discoveries.filter((d: any) => 
      new Date(d.discoveredAt) > weekAgo
    ).length;

    return c.json({
      progress: {
        totalCharacters,
        totalDiscoveries,
        currentLevel,
        pointsToNextLevel,
        weeklyActivity: recentDiscoveries,
        totalScore: profile?.score || 0
      }
    });
  } catch (error) {
    console.log('Progress analytics error:', error);
    return c.json({ error: 'Failed to fetch progress analytics' }, 500);
  }
});

// Helper Functions
async function initializeCharactersDatabase(): Promise<CharacterData[]> {
  const characters: CharacterData[] = [
    {
      character: '森',
      pronunciation: 'sēn',
      meaning: 'forest',
      radicals: ['木', '木', '木'],
      story: 'Three trees growing together create a dense forest',
      difficulty: 1,
      category: 'nature'
    },
    {
      character: '炎',
      pronunciation: 'yán',
      meaning: 'flame',
      radicals: ['火', '火'],
      story: 'Double fire creates intense flames that reach for the sky',
      difficulty: 1,
      category: 'nature'
    },
    {
      character: '明',
      pronunciation: 'míng',
      meaning: 'bright',
      radicals: ['日', '月'],
      story: 'Sun and moon together bring complete illumination',
      difficulty: 2,
      category: 'celestial'
    },
    {
      character: '休',
      pronunciation: 'xiū',
      meaning: 'rest',
      radicals: ['人', '木'],
      story: 'A person leaning against a tree, taking a peaceful rest',
      difficulty: 2,
      category: 'human'
    },
    {
      character: '桌',
      pronunciation: 'zhuō',
      meaning: 'table',
      radicals: ['木', '卓'],
      story: 'Outstanding wood crafted into a fine table',
      difficulty: 2,
      category: 'objects'
    },
    {
      character: '淋',
      pronunciation: 'lín',
      meaning: 'pour',
      radicals: ['氵', '木'],
      story: 'Water flowing down like rain through trees',
      difficulty: 2,
      category: 'nature'
    },
    {
      character: '想',
      pronunciation: 'xiǎng',
      meaning: 'think',
      radicals: ['心', '目'],
      story: 'The heart and eyes working together in contemplation',
      difficulty: 3,
      category: 'abstract'
    },
    {
      character: '看',
      pronunciation: 'kàn',
      meaning: 'look',
      radicals: ['手', '目'],
      story: 'Using hand to shield eyes while looking into the distance',
      difficulty: 2,
      category: 'actions'
    },
    {
      character: '听',
      pronunciation: 'tīng',
      meaning: 'listen',
      radicals: ['口', '耳'],
      story: 'Opening mouth slightly to hear more clearly',
      difficulty: 2,
      category: 'actions'
    },
    {
      character: '跑',
      pronunciation: 'pǎo',
      meaning: 'run',
      radicals: ['足', '火'],
      story: 'Feet moving with the speed and energy of fire',
      difficulty: 2,
      category: 'actions'
    }
  ];

  await kv.set('characters_database', characters);
  return characters;
}

async function generateDailyChallenge(date: string): Promise<DailyChallenge> {
  // Get characters database
  let characters = await kv.get('characters_database');
  if (!characters) {
    characters = await initializeCharactersDatabase();
  }

  // Use date as seed for consistent daily challenges
  const dateNum = new Date(date).getTime();
  const seededRandom = (dateNum * 9301 + 49297) % 233280;
  const randomIndex = Math.floor((seededRandom / 233280) * characters.length);
  
  const selectedCharacter = characters[randomIndex];

  return {
    id: `daily-${date}`,
    date,
    character: selectedCharacter.character,
    pronunciation: selectedCharacter.pronunciation,
    meaning: selectedCharacter.meaning,
    acceptableMeanings: [selectedCharacter.meaning, ...getAlternateMeanings(selectedCharacter.meaning)],
    radicals: selectedCharacter.radicals.map((radical: string) => ({
      character: radical,
      meaning: getRadicalMeaning(radical)
    })),
    hint: selectedCharacter.story,
    points: selectedCharacter.difficulty * 10
  };
}

function getAlternateMeanings(meaning: string): string[] {
  const alternates: { [key: string]: string[] } = {
    'table': ['desk'],
    'forest': ['woods'],
    'bright': ['brilliant', 'luminous'],
    'rest': ['relax'],
    'think': ['contemplate'],
    'look': ['see', 'watch'],
    'listen': ['hear'],
    'run': ['jog']
  };
  return alternates[meaning] || [];
}

function getRadicalMeaning(radical: string): string {
  const meanings: { [key: string]: string } = {
    '木': 'wood',
    '火': 'fire',
    '日': 'sun',
    '月': 'moon',
    '人': 'person',
    '心': 'heart',
    '手': 'hand',
    '口': 'mouth',
    '目': 'eye',
    '耳': 'ear',
    '足': 'foot',
    '氵': 'water',
    '卓': 'outstanding'
  };
  return meanings[radical] || 'unknown';
}

Deno.serve(app.fetch);