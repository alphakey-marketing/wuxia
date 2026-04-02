export const ENEMIES = {
  E01: { id:'E01', name:'Road Bandit', hp:40, attack:8, behavior:'Basic melee, no dodge', indicators:['yellow'], drop:'Silver, minor technique', type:'standard' },
  E02: { id:'E02', name:'Crossbow Soldier', hp:30, attack:12, behavior:'Ranged slow fire; runs from melee', indicators:['yellow','red'], drop:'Silver, pierce technique', type:'standard' },
  E03: { id:'E03', name:'Tavern Brawler', hp:60, attack:10, behavior:'Grapple attempt on 3rd hit; unblockable', indicators:['yellow','yellow','red'], drop:'Strike relic shard', type:'standard' },
  E04: { id:'E04', name:'Mountain Bandit Chief', hp:80, attack:14, behavior:'Buffs self after losing 50% HP', indicators:['orange'], drop:'Rare silver, minor manual page', type:'standard' },
  E05: { id:'E05', name:'River Pirate', hp:50, attack:11, behavior:'Dash-attack from range; retreats after', indicators:['red','yellow'], drop:'Swift technique', type:'standard' },
  E06: { id:'E06', name:'Corrupt Constable', hp:70, attack:13, behavior:'Blocks regularly; stance-break required to damage through guard', indicators:['purple'], drop:'Counter relic shard', type:'standard' },
  E07: { id:'E07', name:'Twin Blade Widow', hp:130, attack:18, behavior:'Splits into two after losing 60% HP; each half has 40 HP', indicators:['yellow','red','orange'], drop:'Phantom Blade technique; R05 Black Bone Fan', type:'elite' },
  E08: { id:'E08', name:'Iron Monk Disciple', hp:160, attack:16, behavior:'Phase 1: Block only (stance-break required). Phase 2: Frenzy attacks', indicators:['purple','orange'], drop:'Iron Bell Body upgrade; R10 Crimson Talisman', type:'elite' },
  E09: { id:'E09', name:'Drunken Swordsman', hp:120, attack:20, behavior:'Random dodge pattern; 30% chance to dodge any skill', indicators:['yellow','red'], drop:'Drunken Drift movement art; R19 Drunken God\'s Flask', type:'elite' },
  E10: { id:'E10', name:'Ghost Assassin', hp:110, attack:22, behavior:'Vanishes for 2s every 30s; attacks from stealth', indicators:['red','shadow'], drop:'Void Palm technique; R15 Assassin\'s Coal Dust', type:'elite' },
  E11: { id:'E11', name:'Poison Valley Witch', hp:140, attack:15, behavior:'Applies strong poison on each hit; cleanses slow/stun', indicators:['yellow','orange'], drop:'Five Poison Scripture fragment; R09 Frostglass Bangle', type:'elite' },
  E12: { id:'E12', name:'Wandering Iron Fist', hp:150, attack:19, behavior:'Every 5th hit is unblockable; immune to knockback', indicators:['yellow','yellow','yellow','yellow','red'], drop:'Thunder Fist Chain upgrade; R16 Thunder Bead Necklace', type:'elite' },
};

export const BOSSES = {
  B01: {
    id:'B01', name:'Iron Fan Widow', nameZh:'鐵扇寡婦', hp:350, attack:22, phases:2, type:'boss',
    phase1: 'Fan tornado AoE (Red, untelegraphed direction); Summon 2 Road Bandits; Stance-break vulnerability on 3rd attack',
    phase2: 'Faster attack rate; Fan counter-attack on each player dodge (Orange); Applies Widowmaker Curse: max HP −15 if hit twice',
    karmaLink: 'If Mercy ≥ +2: she reveals she was wronged — spare her for Memory Seal. Kill her for Reputation +2 with Beggar\'s Union',
    drops: { manual:'T02', relic:'R06', essence:60 }
  },
  B02: {
    id:'B02', name:'White Ape Elder', nameZh:'白猿老人', hp:450, attack:26, phases:3, type:'boss',
    phase1: 'Slow powerful slam (Red); Rock throw (Yellow); Leap AoE (Orange interrupt window)',
    phase2: 'Gains stone armor (+20 Defense); Must break armor with 3 stance-break hits; Also enrages at 50%, doubling attack speed for 5s',
    phase3: 'Drops stone armor; speed massively increased; begins 15s Berserk countdown — must kill within countdown or instant death',
    karmaLink: 'If Orthodoxy ≥ +2: he accepts defeat and offers a secret technique. If Unorthodox: he reveals a forbidden scroll location',
    drops: { manual:'T19', relic:'R20', essence:100 }
  }
};
