export const MOVEMENT_ARTS = {
  swallowStep: {
    id: 'swallowStep', name: 'Swallow Step', nameZh: '燕式輕功',
    dash: 'Double-dash; second dash within 1.5s costs no cooldown',
    passive: '+15% Speed',
    cooldown: 3,
    bonuses: { speed: 0.15, doubleDash: true }
  },
  cloudLadder: {
    id: 'cloudLadder', name: 'Cloud Ladder', nameZh: '雲梯踏',
    dash: 'Short blink-teleport (ignores terrain)',
    passive: 'Immune to damage during dash frames',
    cooldown: 2.5,
    bonuses: { dashImmunity: true }
  },
  drunkenDrift: {
    id: 'drunkenDrift', name: 'Drunken Drift', nameZh: '醉步',
    dash: 'Wide arc sway-dodge; during dodge, basic attack does +40% damage',
    passive: '+10% Crit Chance',
    cooldown: 4,
    bonuses: { critChance: 0.10, dodgeAttack: 0.40 }
  }
};
