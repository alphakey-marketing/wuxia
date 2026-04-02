export function generateNodeMap() {
  const nodes = [
    // Phase 1
    { id: 0, type: 'combat', phase: 1, label: 'Road Ambush', x: 0, y: 0 },
    { id: 1, type: Math.random() < 0.5 ? 'event' : 'healer', phase: 1, label: Math.random() < 0.5 ? 'Crossroads Event' : 'Village Healer', x: 1, y: 0 },
    { id: 2, type: 'combat', phase: 1, label: 'Border Fight', x: 2, y: 0, fork: true },
    // Phase 2
    { id: 3, type: 'elite', phase: 2, label: 'Elite Encounter', x: 3, y: 0 },
    { id: 4, type: Math.random() < 0.6 ? 'wanderingMaster' : 'sectTrial', phase: 2, label: Math.random() < 0.6 ? 'Wandering Master' : 'Sect Trial', x: 4, y: 0 },
    { id: 5, type: 'elite', phase: 2, label: 'Elite Encounter', x: 5, y: 0 },
    { id: 6, type: Math.random() < 0.5 ? 'hiddenCave' : 'ambush', phase: 2, label: Math.random() < 0.5 ? 'Forbidden Cave' : 'Mountain Ambush', x: 6, y: 0, fork: true },
    // Phase 3
    { id: 7, type: 'majorEvent', phase: 3, label: 'Jianghu Crossroads', x: 7, y: 0 },
    { id: 8, type: Math.random() < 0.5 ? 'healer' : 'manualPage', phase: 3, label: Math.random() < 0.5 ? 'Mountain Healer' : 'Ancient Manual', x: 8, y: 0 },
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
    manualPage: '📖'
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
    manualPage: '#1a3a4a'
  };
  return colors[type] || '#333';
}
