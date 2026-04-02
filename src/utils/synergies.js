const SYNERGY_EFFECTS = {
  'Blade+Blade': { name: 'Blade Sync', description: '+15% Sword basic attack speed', bonus: { attackSpeed: 0.15 } },
  'Frost+Frost': { name: 'Deep Freeze', description: 'Slow effect duration +2s', bonus: { slowDuration: 2 } },
  'Swift+Swift+Swift': { name: 'Wind Step', description: '+20% Dash cooldown reduction', bonus: { dashCooldown: -0.20 } },
  'Blade+Counter': { name: 'Counter Blade', description: 'Sword Flash triggers automatic counter after a dodge' },
  'Fire+Qi-Surge': { name: 'Flame Surge', description: 'Burning Meridian stacks gain bonus on Qi ultimate activation' },
  'Pierce+Pierce': { name: 'Shield Breaker', description: 'Spear thrust pierces shields; stance-break chance +20%', bonus: { stanceBreak: 0.20 } }
};

export function detectSynergies(techniques) {
  const tagCounts = {};
  techniques.forEach(t => t.tags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }));
  const active = [];
  if (tagCounts['Blade'] >= 2) active.push(SYNERGY_EFFECTS['Blade+Blade']);
  if (tagCounts['Frost'] >= 2) active.push(SYNERGY_EFFECTS['Frost+Frost']);
  if (tagCounts['Swift'] >= 3) active.push(SYNERGY_EFFECTS['Swift+Swift+Swift']);
  if (tagCounts['Blade'] >= 1 && tagCounts['Counter'] >= 1) active.push(SYNERGY_EFFECTS['Blade+Counter']);
  if (tagCounts['Fire'] >= 1 && tagCounts['Qi-Surge'] >= 1) active.push(SYNERGY_EFFECTS['Fire+Qi-Surge']);
  if (tagCounts['Pierce'] >= 2) active.push(SYNERGY_EFFECTS['Pierce+Pierce']);
  return active;
}
