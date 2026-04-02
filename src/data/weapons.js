export const WEAPONS = {
  sword: {
    id: 'sword', name: 'Sword', nameZh: '劍',
    attack: 10, critChance: 0.08,
    basicPattern: 'Fast 3-hit combo, close range, high crit chance',
    skill: { name: 'Sword Flash', description: 'Forward dash-strike that counts as 3 hits', cooldown: 5 },
    tags: ['Blade', 'Swift'],
    synergies: ['Crit-stack', 'multi-hit relics', 'Burning Meridian']
  },
  spear: {
    id: 'spear', name: 'Spear', nameZh: '槍',
    attack: 12, critChance: 0.05,
    basicPattern: 'Long reach, 2-hit sweep, knockback on second hit',
    skill: { name: 'Dragon Thrust', description: 'Unblockable charge that pierces through crowds', cooldown: 7 },
    tags: ['Pierce', 'AoE'],
    synergies: ['AoE techniques', 'disruption relics', 'Flowing River Qi']
  },
  fists: {
    id: 'fists', name: 'Fists', nameZh: '拳',
    attack: 8, critChance: 0.06,
    basicPattern: 'Very fast 5-hit combo, short range, on-hit procs',
    skill: { name: 'Iron Fist Chain', description: '8-hit burst that fills Qi meter rapidly', cooldown: 6 },
    tags: ['Strike'],
    synergies: ['On-hit effects', 'lifesteal', 'Blood Wolf Canon']
  }
};
