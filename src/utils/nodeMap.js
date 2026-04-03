export function generateNodeMap() {
  const nodes = [
    // Phase 1
    { id: 0, type: 'combat', phase: 1, label: 'Road Ambush', x: 0, y: 0 },
    { id: 1, ...(() => { const r = Math.random() < 0.5; return { type: r ? 'event' : 'healer', label: r ? 'Crossroads Event' : 'Village Healer' }; })(), phase: 1, x: 1, y: 0 },
    {
      id: 2, type: 'fork', phase: 1, label: 'Crossroads Fork', x: 2, y: 0,
      branches: [
        { type: 'event', label: 'Mountain Hermit', description: 'A karmic choice awaits on the high road' },
        { type: 'combat', label: 'Bandit Territory', description: 'A faster route through dangerous lands' }
      ]
    },
    // Phase 2
    { id: 3, type: 'elite', phase: 2, label: 'Elite Encounter', x: 3, y: 0 },
    { id: 4, ...(() => { const r = Math.random() < 0.6; return { type: r ? 'wanderingMaster' : 'sectTrial', label: r ? 'Wandering Master' : 'Sect Trial' }; })(), phase: 2, x: 4, y: 0 },
    { id: 5, type: 'elite', phase: 2, label: 'Elite Encounter', x: 5, y: 0 },
    {
      id: 6, type: 'fork', phase: 2, label: 'Mountain Fork', x: 6, y: 0,
      branches: [
        { type: 'hiddenCave', label: 'Forbidden Cave', description: 'A sealed cave bearing an ominous warning' },
        { type: 'blackMarket', label: 'Black Market', description: 'A hidden merchant with rare and dangerous goods' }
      ]
    },
    // Phase 3
    { id: 7, type: 'majorEvent', phase: 3, label: 'Jianghu Crossroads', x: 7, y: 0 },
    { id: 8, ...(() => { const r = Math.random() < 0.5; return { type: r ? 'healer' : 'manualPage', label: r ? 'Mountain Healer' : 'Ancient Manual' }; })(), phase: 3, x: 8, y: 0 },
    { id: 9, type: 'boss', phase: 3, label: 'Final Confrontation', x: 9, y: 0 }
  ];
  return nodes;
}

export function getNodeIcon(type) {
  const icons = {
    combat: '⚔️',
    elite: '💀',
    boss: '👑',
    event: '📜',
    healer: '💊',
    wanderingMaster: '🧙',
    sectTrial: '🏯',
    hiddenCave: '🕳️',
    ambush: '🗡️',
    majorEvent: '⭐',
    manualPage: '📖',
    fork: '⑂',
    blackMarket: '🏮'
  };
  return icons[type] || '❓';
}

export function getNodeColor(type) {
  const colors = {
    combat: '#8b4513',
    elite: '#8b1a1a',
    boss: '#4a0000',
    event: '#2d4a2d',
    healer: '#2d5a27',
    wanderingMaster: '#4a3a6e',
    sectTrial: '#3a4a6e',
    hiddenCave: '#3a2d1a',
    ambush: '#6e3a1a',
    majorEvent: '#6e5a1a',
    manualPage: '#1a3a4a',
    fork: '#5a4a1a',
    blackMarket: '#4a2a1a'
  };
  return colors[type] || '#333';
}
