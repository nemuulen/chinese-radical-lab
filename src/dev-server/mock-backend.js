/* Minimal mock backend for local development
   - Node + Express
   - In-memory KV store
   - Implements endpoints used by the frontend API client
   - Start with: node src/dev-server/mock-backend.js
*/

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 54321;

// In-memory KV store
const kv = new Map();

function kvSet(key, value) {
  kv.set(key, value);
}
function kvGet(key) {
  return kv.has(key) ? kv.get(key) : null;
}
function kvGetByPrefix(prefix) {
  const res = [];
  for (const [k, v] of kv.entries()) {
    if (k.startsWith(prefix)) res.push({ key: k, value: v });
  }
  return res;
}

// Simple user store and token map
const users = new Map(); // email -> { id, email, password, profile }
const tokens = new Map(); // token -> userId

function createUser(email, password, profile) {
  const id = crypto.randomUUID();
  users.set(email, { id, email, password, profile: { ...profile, userId: id, score: 0, learnedCharacters: [] } });
  return users.get(email);
}

function authenticateToken(req, res, next) {
  const auth = req.header('Authorization');
  if (!auth) return res.status(401).json({ error: 'Authorization required' });
  const token = auth.split(' ')[1];
  const userId = tokens.get(token);
  if (!userId) return res.status(401).json({ error: 'Invalid token' });
  req.userId = userId;
  next();
}

// Health check
app.get('/make-server-5695837e/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Users
app.post('/make-server-5695837e/users/register', (req, res) => {
  const { email, password, profile } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
  if (users.has(email)) return res.status(400).json({ error: 'User already exists' });
  const user = createUser(email, password, profile || {});
  // create token for convenience
  const token = crypto.randomUUID();
  tokens.set(token, user.id);
  kvSet(`user_profile:${user.id}`, user.profile);
  res.json({ success: true, user: { id: user.id, email: user.email }, token });
});

app.post('/make-server-5695837e/users/login', (req, res) => {
  const { email, password } = req.body;
  const record = users.get(email);
  if (!record || record.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  const token = crypto.randomUUID();
  tokens.set(token, record.id);
  // update last active
  const profile = kvGet(`user_profile:${record.id}`) || record.profile;
  profile.lastActive = new Date().toISOString();
  kvSet(`user_profile:${record.id}`, profile);
  res.json({ success: true, session: { access_token: token }, user: { id: record.id, email: record.email } });
});

app.get('/make-server-5695837e/users/profile', authenticateToken, (req, res) => {
  const userId = req.userId;
  const profile = kvGet(`user_profile:${userId}`);
  if (!profile) return res.status(404).json({ error: 'Profile not found' });
  res.json({ profile });
});

app.put('/make-server-5695837e/users/profile', authenticateToken, (req, res) => {
  const userId = req.userId;
  const updated = req.body;
  const profile = { ...updated, userId, updatedAt: new Date().toISOString() };
  kvSet(`user_profile:${userId}`, profile);
  res.json({ success: true, message: 'Profile updated successfully' });
});

// Characters database
app.get('/make-server-5695837e/characters', (req, res) => {
  const category = req.query.category;
  const difficulty = req.query.difficulty ? parseInt(req.query.difficulty) : undefined;
  let characters = kvGet('characters_database');
  if (!characters) {
    characters = initializeCharactersDatabase();
    kvSet('characters_database', characters);
  }
  let filtered = characters;
  if (category) filtered = filtered.filter(c => c.category === category);
  if (difficulty) filtered = filtered.filter(c => c.difficulty === difficulty);
  res.json({ characters: filtered });
});

app.get('/make-server-5695837e/characters/random', (req, res) => {
  const count = parseInt(req.query.count || '1');
  const difficulty = req.query.difficulty ? parseInt(req.query.difficulty) : undefined;
  let characters = kvGet('characters_database');
  if (!characters) {
    characters = initializeCharactersDatabase();
    kvSet('characters_database', characters);
  }
  let filtered = characters;
  if (difficulty) filtered = filtered.filter(c => c.difficulty === difficulty);
  // shuffle
  filtered = filtered.sort(() => Math.random() - 0.5);
  res.json({ characters: filtered.slice(0, count) });
});

// Daily challenge
function generateDailyChallenge(date) {
  const characters = kvGet('characters_database') || initializeCharactersDatabase();
  const dateNum = new Date(date).getTime();
  const seededRandom = (dateNum * 9301 + 49297) % 233280;
  const idx = Math.floor((seededRandom / 233280) * characters.length);
  const selected = characters[idx];
  return {
    id: `daily-${date}`,
    date,
    character: selected.character,
    pronunciation: selected.pronunciation,
    meaning: selected.meaning,
    acceptableMeanings: [selected.meaning, ...(getAlternateMeanings(selected.meaning))],
    radicals: selected.radicals.map(r => ({ character: r, meaning: getRadicalMeaning(r) })),
    hint: selected.story,
    points: selected.difficulty * 10
  };
}

app.get('/make-server-5695837e/challenges/daily', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  let challenge = kvGet(`daily_challenge:${today}`);
  if (!challenge) {
    challenge = generateDailyChallenge(today);
    kvSet(`daily_challenge:${today}`, challenge);
  }
  res.json({ challenge });
});

app.post('/make-server-5695837e/challenges/submit', authenticateToken, (req, res) => {
  const userId = req.userId;
  const { challengeId, answer, challengeDate } = req.body;
  const challenge = kvGet(`daily_challenge:${challengeDate}`);
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
  const submissionKey = `challenge_submission:${userId}:${challengeDate}`;
  if (kvGet(submissionKey)) return res.status(400).json({ error: 'Challenge already submitted today' });
  const isCorrect = (challenge.acceptableMeanings || []).some(m => m.toLowerCase() === answer.toLowerCase().trim());
  const pointsEarned = isCorrect ? 25 : 5;
  kvSet(submissionKey, { challengeId, answer, isCorrect, pointsEarned, submittedAt: new Date().toISOString() });
  const profile = kvGet(`user_profile:${userId}`) || {};
  profile.score = (profile.score || 0) + pointsEarned;
  kvSet(`user_profile:${userId}`, profile);
  res.json({ success: true, isCorrect, pointsEarned, correctAnswer: challenge.meaning });
});

// Discoveries
app.post('/make-server-5695837e/discoveries', authenticateToken, (req, res) => {
  const userId = req.userId;
  const { character, radicals, method } = req.body;
  const userDiscoveries = kvGet(`discoveries:${userId}`) || [];
  const already = userDiscoveries.find(d => d.character === character);
  if (!already) {
    const discovery = { character, radicals, method, discoveredAt: new Date().toISOString(), points: (radicals || []).length * 10 };
    userDiscoveries.push(discovery);
    kvSet(`discoveries:${userId}`, userDiscoveries);
    const profile = kvGet(`user_profile:${userId}`) || {};
    profile.score = (profile.score || 0) + discovery.points;
    kvSet(`user_profile:${userId}`, profile);
    res.json({ success: true, isNew: true, pointsEarned: discovery.points, totalDiscoveries: userDiscoveries.length });
  } else {
    res.json({ success: true, isNew: false, pointsEarned: 0, totalDiscoveries: userDiscoveries.length });
  }
});

app.get('/make-server-5695837e/discoveries', authenticateToken, (req, res) => {
  const userId = req.userId;
  const discoveries = kvGet(`discoveries:${userId}`) || [];
  res.json({ discoveries });
});

// Leaderboard
app.get('/make-server-5695837e/leaderboard', (req, res) => {
  const type = req.query.type || 'score';
  const limit = parseInt(req.query.limit || '10');
  const profiles = kvGetByPrefix('user_profile:').map(e => e.value);
  let sorted;
  switch (type) {
    case 'discoveries':
      sorted = profiles.sort((a, b) => (b.learnedCharacters?.length || 0) - (a.learnedCharacters?.length || 0));
      break;
    case 'streak':
      sorted = profiles.sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));
      break;
    default:
      sorted = profiles.sort((a, b) => (b.score || 0) - (a.score || 0));
  }
  const leaderboard = sorted.slice(0, limit).map((p, i) => ({ rank: i + 1, name: p.name, score: p.score || 0, discoveries: p.learnedCharacters?.length || 0, level: Math.floor((p.score || 0) / 100) + 1 }));
  res.json({ leaderboard, type });
});

// Analytics
app.get('/make-server-5695837e/analytics/progress', authenticateToken, (req, res) => {
  const userId = req.userId;
  const profile = kvGet(`user_profile:${userId}`) || {};
  const discoveries = kvGet(`discoveries:${userId}`) || [];
  const totalCharacters = profile.learnedCharacters?.length || 0;
  const totalDiscoveries = discoveries.length;
  const currentLevel = Math.floor((profile.score || 0) / 100) + 1;
  const pointsToNextLevel = (currentLevel * 100) - (profile.score || 0);
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentDiscoveries = discoveries.filter(d => new Date(d.discoveredAt) > weekAgo).length;
  res.json({ progress: { totalCharacters, totalDiscoveries, currentLevel, pointsToNextLevel, weeklyActivity: recentDiscoveries, totalScore: profile.score || 0 } });
});

// Helpers
function initializeCharactersDatabase() {
  const characters = [
    { character: '森', pronunciation: 'sēn', meaning: 'forest', radicals: ['木', '木', '木'], story: 'Three trees growing together create a dense forest', difficulty: 1, category: 'nature' },
    { character: '炎', pronunciation: 'yán', meaning: 'flame', radicals: ['火', '火'], story: 'Double fire creates intense flames that reach for the sky', difficulty: 1, category: 'nature' },
    { character: '明', pronunciation: 'míng', meaning: 'bright', radicals: ['日', '月'], story: 'Sun and moon together bring complete illumination', difficulty: 2, category: 'celestial' },
    { character: '休', pronunciation: 'xiū', meaning: 'rest', radicals: ['人', '木'], story: 'A person leaning against a tree, taking a peaceful rest', difficulty: 2, category: 'human' },
    { character: '桌', pronunciation: 'zhuō', meaning: 'table', radicals: ['木', '卓'], story: 'Outstanding wood crafted into a fine table', difficulty: 2, category: 'objects' },
    { character: '淋', pronunciation: 'lín', meaning: 'pour', radicals: ['氵', '木'], story: 'Water flowing down like rain through trees', difficulty: 2, category: 'nature' },
    { character: '想', pronunciation: 'xiǎng', meaning: 'think', radicals: ['心', '目'], story: 'The heart and eyes working together in contemplation', difficulty: 3, category: 'abstract' },
    { character: '看', pronunciation: 'kàn', meaning: 'look', radicals: ['手', '目'], story: 'Using hand to shield eyes while looking into the distance', difficulty: 2, category: 'actions' },
    { character: '听', pronunciation: 'tīng', meaning: 'listen', radicals: ['口', '耳'], story: 'Opening mouth slightly to hear more clearly', difficulty: 2, category: 'actions' },
    { character: '跑', pronunciation: 'pǎo', meaning: 'run', radicals: ['足', '火'], story: 'Feet moving with the speed and energy of fire', difficulty: 2, category: 'actions' }
  ];
  kvSet('characters_database', characters);
  return characters;
}

function getAlternateMeanings(meaning) {
  const alternates = { table: ['desk'], forest: ['woods'], bright: ['brilliant', 'luminous'], rest: ['relax'], think: ['contemplate'], look: ['see', 'watch'], listen: ['hear'], run: ['jog'] };
  return alternates[meaning] || [];
}

function getRadicalMeaning(radical) {
  const meanings = { '木': 'wood', '火': 'fire', '日': 'sun', '月': 'moon', '人': 'person', '心': 'heart', '手': 'hand', '口': 'mouth', '目': 'eye', '耳': 'ear', '足': 'foot', '氵': 'water', '卓': 'outstanding' };
  return meanings[radical] || 'unknown';
}

app.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
});
