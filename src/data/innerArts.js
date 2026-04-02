export const INNER_ARTS = {
  flowingRiver: {
    id: 'flowingRiver', name: 'Flowing River Qi', nameZh: '流水內功',
    passive: 'Each dodge within 2s of an enemy attack restores 8 HP',
    ultimate: { name: 'Tidal Surge', description: 'Heal 40 HP and slow all enemies for 4s' },
    risk: 'Low risk, sustain-focused',
    bonuses: { dodgeHeal: 8, ultimateHeal: 40, slowDuration: 4 }
  },
  burningMeridian: {
    id: 'burningMeridian', name: 'Burning Meridian', nameZh: '燃脈功',
    passive: 'Each kill stacks +3% Attack (up to +30%); taking damage loses 1 stack',
    ultimate: { name: 'Inferno Ignition', description: 'Releases all stacks as an AoE explosion' },
    risk: 'High reward, fragile stack management',
    bonuses: { stackAttack: 0.03, maxStacks: 10 }
  },
  frozenHeart: {
    id: 'frozenHeart', name: 'Frozen Heart Sutra', nameZh: '冰心訣',
    passive: 'Taking a hit triggers a 0.8s freeze bubble on attacker (6s cooldown)',
    ultimate: { name: 'Absolute Zero', description: 'Freeze all enemies for 3s; next 3 hits do 2.5× damage' },
    risk: 'Defensive, punish-focused',
    bonuses: { freezeDuration: 0.8, freezeCooldown: 6 }
  },
  bloodWolf: {
    id: 'bloodWolf', name: 'Blood Wolf Canon', nameZh: '血狼經',
    passive: 'Every 5th basic attack hits twice and restores 5 HP',
    ultimate: { name: 'Savage Feast', description: 'Channel 2s; heal 15% max HP per enemy in range' },
    risk: 'Lifesteal-focused, dangerous vs. ranged',
    bonuses: { lifestealHp: 5, lifestealHit: 5 }
  }
};
