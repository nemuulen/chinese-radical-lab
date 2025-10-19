// Simple local "AI" story generator for mnemonic/funny stories.
export function generateFunnyStoryFromRadicals(radicals: Array<string | { meaning?: string; character?: string }>): string {
  const meanings = radicals.map(r => (typeof r === 'string' ? r : (r.meaning || r.character || 'something')));
  const chars = radicals.map(r => (typeof r === 'string' ? r : (r.character || '?'))).join(' + ');
  const seed = meanings.join('-').length;
  const templates = [
    `Imagine ${meanings.join(' and ')} staging a tiny parade — they tripped, bumped together, and poof! ${chars} was born. You'll remember the stumble.`,
    `Once, ${meanings.join(' and ')} tried to open a bakery. Their signature dish accidentally spelled ${chars}. Remember the cake and you'll remember the character.`,
    `A rumor says ${meanings.join(', ')} solved a mystery by forming ${chars}. The detective was a tree. That's memorable, right?`,
    `If ${meanings.join(' and ')} were in a band, their hit single would be called "${chars}" — catchy and oddly educational.`
  ];
  return templates[seed % templates.length];
}
