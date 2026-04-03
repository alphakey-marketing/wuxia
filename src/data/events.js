export const EVENTS = [
  {
    id: 'E_PHYSICIAN',
    name: 'The Fallen Physician',
    description: 'A physician lies beaten on the road. Her medicine chest has been ransacked. She asks you to escort her to the next town. A pursuer will intercept you.',
    choices: [
      { text: 'Escort her (+1 fight)', outcome: { healHp: 30, karma: { mercy: 1 }, note: 'Opens Wandering Master event variant' } },
      { text: 'Give her your silver (−30 silver)', outcome: { silver: -30, hpMax: 5, karma: { mercy: 1 } } },
      { text: 'Leave her', outcome: { silver: 10, karma: { mercy: -1 } } }
    ]
  },
  {
    id: 'E_MANUAL_THIEF',
    name: 'The Manual Thief',
    description: 'You catch a young student who stole a page from your inherited manual.',
    choices: [
      { text: 'Take it back by force', outcome: { karma: { mercy: -1 }, note: 'Student becomes enemy in later node' } },
      { text: 'Let him keep it', outcome: { karma: { honor: 1 }, memorySeal: 'The Student You Spared' } },
      { text: 'Teach him instead', outcome: { silver: -5, techniqueShard: true, karma: { renown: 1 } } }
    ]
  },
  {
    id: 'E_SECT_INVITATION',
    name: 'The Sect Invitation',
    description: 'The Black Cliff Manor offers you membership — protection, resources, and a powerful relic. But they demand you report all wandering masters you encounter.',
    choices: [
      { text: 'Accept', outcome: { relic: 'R01', karma: { honor: -1 }, flag: 'joined_black_cliff', note: 'Wandering Master events become hostile' } },
      { text: 'Decline politely', outcome: {} },
      { text: 'Decline and warn masters', outcome: { karma: { honor: 1, renown: 1 }, note: 'Black Cliff becomes rival faction' } }
    ]
  },
  {
    id: 'E_FORBIDDEN_CAVE',
    name: 'The Forbidden Cave',
    description: 'A sealed cave bears a warning: the cultivation method inside drives practitioners to madness.',
    choices: [
      { text: 'Enter (requires Unorthodox ≥ 0)', outcome: { technique: 'T18', karma: { orthodoxy: -2 }, hpMax: -20, requiresKarma: { orthodoxy: 0 }, flag: 'entered_forbidden_cave' } },
      { text: 'Seal it further', outcome: { karma: { orthodoxy: 1 }, essence: 15 } },
      { text: 'Mark it for the Archive', outcome: { memorySeal: "Location of the Madman's Cave", note: '+1 forbidden relic next run' } }
    ]
  },
  {
    id: 'E_WANDERING_BEGGAR',
    name: 'The Wandering Beggar',
    description: 'A beggar in ragged clothes offers to share a "secret of the jianghu" in exchange for silver.',
    choices: [
      { text: 'Give 20 silver', outcome: { silver: -20, technique: 'T03', karma: { mercy: 1 } } },
      { text: 'Ignore him', outcome: {} },
      { text: 'Rob him', outcome: { silver: 5, karma: { mercy: -2, honor: -1 } } }
    ]
  },
  {
    id: 'E_RIVAL_ENCOUNTER',
    name: 'The Old Rival',
    description: 'A martial artist from your past blocks the road. "This path belongs to the Flying Hawk Sect," he warns.',
    choices: [
      { text: 'Fight through (+1 combat)', outcome: { karma: { ambition: 1 }, silver: 25 } },
      { text: 'Find another way (lose 1 node progress)', outcome: { karma: { mercy: 1 } } },
      { text: 'Challenge them to a duel (formal)', outcome: { karma: { honor: 1, renown: 1 }, technique: 'T05' } }
    ]
  },
  {
    id: 'E_BURNING_VILLAGE',
    name: 'The Burning Village',
    description: 'A village is under attack by bandits. You can intervene or pass by.',
    choices: [
      { text: 'Defend the village (+2 fights)', outcome: { karma: { mercy: 2, renown: 1 }, silver: 40, healHp: 20 } },
      { text: 'Pass by quietly', outcome: { karma: { mercy: -1 } } },
      { text: 'Loot the chaos', outcome: { silver: 60, karma: { mercy: -2, honor: -2 } } }
    ]
  },
  {
    id: 'E_WANDERING_MASTER',
    name: 'The Wandering Master',
    description: 'An elderly martial artist sits beneath a tree, practicing a form you have never seen before.',
    choices: [
      { text: 'Ask to be taught (Orthodox path)', outcome: { technique: 'T19', karma: { orthodoxy: 1 } } },
      { text: 'Observe from afar and learn what you can', outcome: { techniqueShard: true } },
      { text: 'Challenge them to prove your worth', outcome: { karma: { ambition: 1, honor: 1 }, note: '+1 combat, rare technique on win' } }
    ]
  },
  {
    id: 'E_BLACK_MARKET',
    name: 'The Hidden Merchant',
    description: 'A secretive merchant reveals a stall of unusual wares.',
    choices: [
      { text: 'Browse relics (spend silver)', outcome: { shop: 'relics' } },
      { text: 'Browse techniques (spend silver)', outcome: { shop: 'techniques' } },
      { text: 'Ask about forbidden arts', outcome: { karma: { orthodoxy: -1 }, note: 'Unlocks forbidden event chain' } }
    ]
  },
  {
    id: 'E_PRISONER',
    name: 'The Condemned Prisoner',
    description: 'Constables are about to execute a prisoner who claims to be innocent.',
    choices: [
      { text: 'Intervene (+1 combat vs. constables)', outcome: { karma: { mercy: 1, honor: 1 }, memorySeal: 'The Prisoner You Freed' } },
      { text: 'Bribe the constables (−40 silver)', outcome: { silver: -40, karma: { mercy: 1 } } },
      { text: 'Walk past', outcome: { karma: { mercy: -1 } } }
    ]
  },
  {
    id: 'E_GHOST_STORY',
    name: 'The Ghost on the Road',
    description: 'A spirit confronts you: the ghost of someone from your past life. It offers a gift — or a curse.',
    choices: [
      { text: 'Accept the gift (unknown)', outcome: { random: true, note: 'Random: technique, relic, or HP loss' } },
      { text: 'Refuse and banish it', outcome: { karma: { orthodoxy: 1 }, essence: 20 } },
      { text: 'Listen to its story', outcome: { memorySeal: 'The Ghost You Heard', essence: 10 } }
    ]
  },
  {
    id: 'E_SECT_TRIAL',
    name: 'The Sect Trial',
    description: 'You arrive at a sect outpost. They offer to test your martial skill and assess your path.',
    failureOutcome: { karma: { honor: -1 }, hpLoss: 20 },
    choices: [
      { text: 'Accept the orthodox trial', outcome: { karma: { honor: 1, orthodoxy: 1 }, relic: 'R11', note: 'Pass requires Orthodoxy ≥ 0' }, karmaRequirement: { orthodoxy: 0 } },
      { text: 'Attempt the trial anyway', outcome: { karma: { honor: -1 }, hpLoss: 20, note: 'Without orthodox standing, you fail and take a penalty' } },
      { text: 'Decline respectfully', outcome: {} },
      { text: 'Cheat using a forbidden technique', outcome: { karma: { orthodoxy: -2, honor: -1 }, silver: 30 } }
    ]
  },
  {
    id: 'E_PAST_LIFE_WIDOW',
    name: 'A Familiar Face',
    requiresSeal: 'spared_iron_fan_widow',
    description: 'On a dusty road, you recognize a woman in plain clothes. It is the Iron Fan Widow — alive, reformed, running a small medicine stall. She meets your eyes. She remembers.',
    choices: [
      { text: 'Speak with her (she gives you a gift)', outcome: { healHp: 30, karma: { mercy: 1 }, technique: 'T02', note: 'She teaches you a technique from her late husband\'s school' } },
      { text: 'Walk past without engaging', outcome: { essence: 10, karma: { honor: 1 } } },
      { text: 'Report her location to the constables', outcome: { silver: 50, karma: { mercy: -3, honor: -2 } } }
    ]
  }
];
