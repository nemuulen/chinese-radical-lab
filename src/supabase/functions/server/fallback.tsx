import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";

const app = new Hono();

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

// Simple in-memory store for fallback
const memoryStore = new Map();

// Health check endpoint
app.get("/make-server-5695837e/health", (c) => {
  return c.json({ status: "ok", mode: "fallback", timestamp: new Date().toISOString() });
});

// Daily challenge endpoint - returns hardcoded challenge
app.get("/make-server-5695837e/challenges/daily", (c) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Simple date-based character selection
  const characters = ['桌', '森', '明', '休', '炎'];
  const dayIndex = new Date().getDate() % characters.length;
  const selectedChar = characters[dayIndex];
  
  const challenges = {
    '桌': {
      character: '桌',
      pronunciation: 'zhuō',
      meaning: 'table',
      acceptableMeanings: ['table', 'desk'],
      radicals: [
        { character: '木', meaning: 'wood, tree' },
        { character: '卓', meaning: 'tall, prominent, outstanding' }
      ],
      hint: 'This furniture piece is made from wood and stands at a height for people to work or eat at.',
      points: 20
    },
    '森': {
      character: '森',
      pronunciation: 'sēn',
      meaning: 'forest',
      acceptableMeanings: ['forest', 'woods'],
      radicals: [
        { character: '木', meaning: 'wood, tree' },
        { character: '木', meaning: 'wood, tree' },
        { character: '木', meaning: 'wood, tree' }
      ],
      hint: 'Three trees growing together create this natural environment.',
      points: 15
    },
    '明': {
      character: '明',
      pronunciation: 'míng',
      meaning: 'bright',
      acceptableMeanings: ['bright', 'brilliant', 'luminous'],
      radicals: [
        { character: '日', meaning: 'sun' },
        { character: '月', meaning: 'moon' }
      ],
      hint: 'Sun and moon together bring complete illumination.',
      points: 25
    },
    '休': {
      character: '休',
      pronunciation: 'xiū',
      meaning: 'rest',
      acceptableMeanings: ['rest', 'relax'],
      radicals: [
        { character: '人', meaning: 'person' },
        { character: '木', meaning: 'wood, tree' }
      ],
      hint: 'A person leaning against a tree, taking a peaceful break.',
      points: 20
    },
    '炎': {
      character: '炎',
      pronunciation: 'yán',
      meaning: 'flame',
      acceptableMeanings: ['flame', 'fire'],
      radicals: [
        { character: '火', meaning: 'fire' },
        { character: '火', meaning: 'fire' }
      ],
      hint: 'Double fire creates intense heat that reaches for the sky.',
      points: 15
    }
  };

  const challenge = {
    id: `daily-${today}`,
    date: today,
    ...challenges[selectedChar as keyof typeof challenges]
  };

  return c.json({ challenge });
});

// Challenge submission endpoint
app.post("/make-server-5695837e/challenges/submit", async (c) => {
  try {
    const { answer, challengeDate } = await c.req.json();
    
    // Get today's challenge to check answer
    const characters = ['桌', '森', '明', '休', '炎'];
    const dayIndex = new Date(challengeDate).getDate() % characters.length;
    const selectedChar = characters[dayIndex];
    
    const meanings = {
      '桌': ['table', 'desk'],
      '森': ['forest', 'woods'],
      '明': ['bright', 'brilliant', 'luminous'],
      '休': ['rest', 'relax'],
      '炎': ['flame', 'fire']
    };
    
    const acceptableMeanings = meanings[selectedChar as keyof typeof meanings] || [];
    const isCorrect = acceptableMeanings.some(
      meaning => meaning.toLowerCase() === answer.toLowerCase().trim()
    );
    
    const pointsEarned = isCorrect ? 25 : 5;
    
    return c.json({
      success: true,
      isCorrect,
      pointsEarned,
      correctAnswer: acceptableMeanings[0],
      explanation: isCorrect 
        ? `Correct! ${selectedChar} means "${acceptableMeanings[0]}"`
        : `The correct answer is "${acceptableMeanings[0]}"`
    });
  } catch (error) {
    console.log('Challenge submission error:', error);
    return c.json({ error: 'Failed to submit challenge' }, 500);
  }
});

// Discovery recording endpoint
app.post("/make-server-5695837e/discoveries", async (c) => {
  try {
    const { character, radicals } = await c.req.json();
    
    // Simple discovery tracking
    const pointsEarned = radicals.length * 10;
    
    return c.json({
      success: true,
      isNew: true, // Assume all discoveries are new in fallback mode
      pointsEarned,
      totalDiscoveries: 1
    });
  } catch (error) {
    console.log('Discovery recording error:', error);
    return c.json({ error: 'Failed to record discovery' }, 500);
  }
});

// Leaderboard endpoint
app.get("/make-server-5695837e/leaderboard", (c) => {
  const mockLeaderboard = [
    { rank: 1, name: 'Alex Chen', score: 1500, discoveries: 25, level: 15 },
    { rank: 2, name: 'Sarah Kim', score: 1350, discoveries: 20, level: 13 },
    { rank: 3, name: 'Mike Zhang', score: 1200, discoveries: 18, level: 12 },
    { rank: 4, name: 'Emma Liu', score: 1100, discoveries: 15, level: 11 },
    { rank: 5, name: 'David Wang', score: 950, discoveries: 12, level: 9 }
  ];
  
  return c.json({ leaderboard: mockLeaderboard });
});

// Progress analytics endpoint
app.get("/make-server-5695837e/analytics/progress", (c) => {
  const mockProgress = {
    totalCharacters: 8,
    totalDiscoveries: 5,
    currentLevel: 3,
    pointsToNextLevel: 150,
    weeklyActivity: 4,
    totalScore: 350
  };
  
  return c.json({ progress: mockProgress });
});

// User endpoints (basic fallback)
app.get("/make-server-5695837e/users/profile", (c) => {
  return c.json({ error: 'Profile features require full backend' }, 501);
});

app.post("/make-server-5695837e/users/register", (c) => {
  return c.json({ error: 'Registration requires full backend' }, 501);
});

app.post("/make-server-5695837e/users/login", (c) => {
  return c.json({ error: 'Login requires full backend' }, 501);
});

Deno.serve(app.fetch);