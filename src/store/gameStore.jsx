import React, { createContext, useContext, useReducer } from 'react';
import { WEAPONS } from '../data/weapons.js';
import { INNER_ARTS } from '../data/innerArts.js';
import { MOVEMENT_ARTS } from '../data/movementArts.js';
import { generateNodeMap } from '../utils/nodeMap.js';
import { ENEMIES, BOSSES } from '../data/enemies.js';
import { EVENTS } from '../data/events.js';
import { generateRewardDraft } from '../utils/rewardDraft.js';

const DEFAULT_RUN_STATE = {
  hp: 120,
  maxHp: 120,
  attack: 10,
  defense: 4,
  speed: 5,
  critChance: 0.08,
  critPower: 1.5,
  qi: 0,
  maxQi: 100,
  silver: 50,
  legacyEssence: 0,
  weapon: null,
  innerArt: null,
  movementArt: null,
  techniques: [],
  relics: [],
  karma: { mercy: 0, honor: 0, ambition: 0, orthodoxy: 0, renown: 0 },
  currentNode: 0,
  phase: 1,
  nodeMap: [],
  qiBreakthroughs: 0,
  burningMeridianStacks: 0,
  run_flags: {},
  activeSynergies: [],
  stancePoints: 0,
  frozenHeartCooldown: 0,
  flowingRiverLastDodgeTime: 0,
  bloodWolfHitCounter: 0,
  combatStats: { enemiesDefeated: 0, bossesDefeated: 0, totalDamage: 0 }
};

const DEFAULT_META_STATE = {
  legacyEssence: 0,
  unlockedItems: ['sword', 'flowingRiver', 'swallowStep'],
  inheritedManual: null,
  inheritedTrait: null,
  fateImprint: null,
  memorySeal: null,
  manualCollection: {},
  reputationImprint: null,
  lifetimeStats: {
    totalEnemiesKilled: 0,
    totalBossesDefeated: 0,
    furthestNodeReached: 0,
    bestRunDamage: 0
  },
  runHistory: []
};

function loadMeta() {
  try {
    const saved = localStorage.getItem('wuxia_meta');
    return saved ? { ...DEFAULT_META_STATE, ...JSON.parse(saved) } : DEFAULT_META_STATE;
  } catch {
    return DEFAULT_META_STATE;
  }
}

function saveMeta(meta) {
  try {
    localStorage.setItem('wuxia_meta', JSON.stringify(meta));
  } catch {
    // Storage unavailable — continue without persisting
  }
}

const initialState = {
  runState: DEFAULT_RUN_STATE,
  metaState: loadMeta(),
  gamePhase: 'title',
  pendingRewards: null,
  pendingEvent: null,
  currentEnemy: null
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_NEW_RUN': {
      const { weapon, innerArt, movementArt } = action.payload;
      const weaponData = WEAPONS[weapon];
      const innerArtData = INNER_ARTS[innerArt];
      const movArtData = MOVEMENT_ARTS[movementArt];
      const nodeMap = generateNodeMap();
      let maxHp = 120;
      if (state.metaState.unlockedItems.includes('healerBloodline')) maxHp += 30;
      if (state.metaState.unlockedItems.includes('R01')) maxHp += 25;
      // Fate Imprint effects
      const imprint = state.metaState.fateImprint;
      if (imprint === 'compassionate') {
        // One extra healer node — handled in node generation; give HP bonus here
        maxHp += 10;
      }
      const runState = {
        ...DEFAULT_RUN_STATE,
        maxHp,
        hp: maxHp,
        attack: weaponData.attack,
        critChance: weaponData.critChance + (movArtData?.bonuses?.critChance || 0),
        weapon: weaponData,
        innerArt: innerArtData,
        movementArt: movArtData,
        silver: 50,
        nodeMap,
        techniques: state.metaState.inheritedManual ? [state.metaState.inheritedManual] : [],
        relics: [],
        run_flags: {}
      };
      return { ...state, runState, gamePhase: 'nodeMap' };
    }
    case 'TRAVEL_TO_NODE': {
      const { nodeIndex } = action.payload;
      const node = state.runState.nodeMap[nodeIndex];
      if (!node) return state;
      const newRunState = { ...state.runState, currentNode: nodeIndex };
      let gamePhase = state.gamePhase;
      let currentEnemy = null;
      let pendingEvent = null;
      if (node.type === 'combat' || node.type === 'elite' || node.type === 'boss' || node.type === 'ambush') {
        gamePhase = 'combat';
        currentEnemy = generateEnemy(node.type, state.runState);
      } else if (node.type === 'event' || node.type === 'majorEvent' || node.type === 'wanderingMaster' || node.type === 'sectTrial' || node.type === 'hiddenCave') {
        gamePhase = 'event';
        pendingEvent = selectEvent(node.type, state.runState);
      } else if (node.type === 'healer') {
        gamePhase = 'healer';
      } else if (node.type === 'blackMarket') {
        gamePhase = 'blackMarket';
      } else if (node.type === 'manualPage') {
        gamePhase = 'reward';
      }
      return { ...state, runState: newRunState, gamePhase, currentEnemy, pendingEvent };
    }
    case 'COMPLETE_COMBAT': {
      const { victory, damageDealt, silverGained, essenceGained, remainingHp, burningMeridianStacks } = action.payload;
      if (!victory) {
        const newMeta = {
          ...state.metaState,
          runHistory: [...state.metaState.runHistory, { ...state.runState.combatStats, defeated: true }]
        };
        saveMeta(newMeta);
        return { ...state, metaState: newMeta, gamePhase: 'legacy' };
      }
      const newStacks = burningMeridianStacks !== undefined ? burningMeridianStacks :
        (state.runState.innerArt?.id === 'burningMeridian'
          ? Math.min((state.runState.burningMeridianStacks || 0) + 1, 10) : state.runState.burningMeridianStacks);
      const newRunState = {
        ...state.runState,
        hp: remainingHp !== undefined ? remainingHp : state.runState.hp,
        silver: state.runState.silver + (silverGained || 0),
        legacyEssence: state.runState.legacyEssence + (essenceGained || 0),
        burningMeridianStacks: newStacks,
        combatStats: {
          ...state.runState.combatStats,
          enemiesDefeated: state.runState.combatStats.enemiesDefeated + 1,
          totalDamage: state.runState.combatStats.totalDamage + (damageDealt || 0)
        }
      };
      const rewards = generateRewards(newRunState);
      return { ...state, runState: newRunState, gamePhase: 'reward', pendingRewards: rewards };
    }
    case 'COMPLETE_EVENT': {
      const { outcome } = action.payload;
      let newRunState = { ...state.runState };
      if (outcome.healHp) newRunState.hp = Math.min(newRunState.maxHp, newRunState.hp + outcome.healHp);
      if (outcome.hpMax) newRunState.maxHp = newRunState.maxHp + outcome.hpMax;
      if (outcome.silver) newRunState.silver = newRunState.silver + outcome.silver;
      if (outcome.essence) newRunState.legacyEssence = newRunState.legacyEssence + outcome.essence;
      if (outcome.karma) {
        newRunState.karma = { ...newRunState.karma };
        Object.entries(outcome.karma).forEach(([k, v]) => { newRunState.karma[k] = (newRunState.karma[k] || 0) + v; });
      }
      return { ...state, runState: newRunState, gamePhase: 'nodeMap', pendingEvent: null };
    }
    case 'CHOOSE_REWARD': {
      const { reward } = action.payload;
      let newRunState = { ...state.runState };
      if (reward.type === 'newTechnique' && newRunState.techniques.length < 6) {
        newRunState.techniques = [...newRunState.techniques, reward.data];
      } else if (reward.type === 'relic' && newRunState.relics.length < 4) {
        newRunState.relics = [...newRunState.relics, reward.data];
        if (reward.data.id === 'R01') newRunState.maxHp += 25;
      } else if (reward.type === 'healing') {
        newRunState.hp = Math.min(newRunState.maxHp, newRunState.hp + reward.data.amount);
      } else if (reward.type === 'qiBreakthrough' && newRunState.qiBreakthroughs < 3) {
        newRunState.qiBreakthroughs += 1;
        if (reward.data.stat === 'hp') { newRunState.maxHp += 20; newRunState.hp += 20; }
        else if (reward.data.stat === 'attack') newRunState.attack += 3;
        else if (reward.data.stat === 'critChance') newRunState.critChance += 0.05;
      }
      const nextNode = newRunState.currentNode + 1;
      const atEnd = nextNode >= newRunState.nodeMap.length;
      return { ...state, runState: newRunState, gamePhase: atEnd ? 'legacy' : 'nodeMap', pendingRewards: null };
    }
    case 'END_RUN': {
      const runRecord = { ...state.runState.combatStats, karma: state.runState.karma, silver: state.runState.silver };
      // Fate Imprint: dominant karma axis at ≥ +2 or ≤ -2
      const karma = state.runState.karma;
      let fateImprint = null;
      if (karma.mercy >= 2) fateImprint = 'compassionate';
      else if (karma.mercy <= -2) fateImprint = 'blood_handed';
      else if (karma.honor >= 2) fateImprint = 'righteous';
      else if (karma.honor <= -2) fateImprint = 'schemer';
      else if (karma.ambition >= 2) fateImprint = 'driven';
      else if (karma.orthodoxy >= 2) fateImprint = 'grandmaster';
      else if (karma.orthodoxy <= -2) fateImprint = 'forbidden';
      else if (karma.renown >= 2) fateImprint = 'legend';
      else if (karma.renown <= -2) fateImprint = 'feared';
      const lifetimeStats = {
        totalEnemiesKilled: (state.metaState.lifetimeStats?.totalEnemiesKilled || 0) + state.runState.combatStats.enemiesDefeated,
        totalBossesDefeated: (state.metaState.lifetimeStats?.totalBossesDefeated || 0) + (state.runState.combatStats.bossesDefeated || 0),
        furthestNodeReached: Math.max(state.metaState.lifetimeStats?.furthestNodeReached || 0, state.runState.currentNode),
        bestRunDamage: Math.max(state.metaState.lifetimeStats?.bestRunDamage || 0, state.runState.combatStats.totalDamage)
      };
      const newMeta = {
        ...state.metaState,
        legacyEssence: state.metaState.legacyEssence + state.runState.legacyEssence,
        fateImprint,
        lifetimeStats,
        runHistory: [...state.metaState.runHistory, runRecord]
      };
      saveMeta(newMeta);
      return { ...state, metaState: newMeta, gamePhase: 'sectArchive' };
    }
    case 'CHOOSE_INHERITANCE': {
      const { manual, trait } = action.payload;
      // Track manual collection for Chapter II promotion
      let manualCollection = { ...state.metaState.manualCollection };
      if (manual) {
        const prev = state.metaState.inheritedManual;
        const existing = manualCollection[manual.id] || { chapter: 1, consecutiveCount: 0 };
        const isSame = prev && prev.id === manual.id;
        const newCount = isSame ? existing.consecutiveCount + 1 : 1;
        let chapter = existing.chapter;
        let resolvedManual = manual;
        if (newCount >= 3 && chapter < 2 && state.metaState.unlockedItems.includes('manualTierII')) {
          chapter = 2;
          // Promote technique to Chapter II by marking it
          resolvedManual = { ...manual, chapter: 2, name: manual.name + ' II', description: (manual.upgradeII || manual.description) };
        }
        manualCollection[manual.id] = { chapter, consecutiveCount: newCount };
        const newMeta = { ...state.metaState, inheritedManual: resolvedManual, inheritedTrait: trait, manualCollection };
        saveMeta(newMeta);
        return { ...state, metaState: newMeta, gamePhase: 'title' };
      }
      const newMeta = { ...state.metaState, inheritedManual: manual, inheritedTrait: trait, manualCollection };
      saveMeta(newMeta);
      return { ...state, metaState: newMeta, gamePhase: 'title' };
    }
    case 'UNLOCK_SECT_ITEM': {
      const { item, cost } = action.payload;
      if (state.metaState.legacyEssence < cost) return state;
      const newMeta = {
        ...state.metaState,
        legacyEssence: state.metaState.legacyEssence - cost,
        unlockedItems: [...state.metaState.unlockedItems, item]
      };
      saveMeta(newMeta);
      return { ...state, metaState: newMeta };
    }
    case 'HEAL_AT_HEALER': {
      const { cost } = action.payload;
      if (state.runState.silver < cost) return state;
      const healAmount = Math.floor(state.runState.maxHp * 0.4);
      const newRunState = {
        ...state.runState,
        silver: state.runState.silver - cost,
        hp: Math.min(state.runState.maxHp, state.runState.hp + healAmount)
      };
      return { ...state, runState: newRunState, gamePhase: 'nodeMap' };
    }
    case 'BUY_FROM_MARKET': {
      const { item, cost, itemType } = action.payload;
      if (state.runState.silver < cost) return state;
      let newRunState = { ...state.runState, silver: state.runState.silver - cost };
      if (itemType === 'relic' && newRunState.relics.length < 4) {
        newRunState.relics = [...newRunState.relics, item];
        if (item.id === 'R01') newRunState.maxHp += 25;
      } else if (itemType === 'technique' && newRunState.techniques.length < 6) {
        newRunState.techniques = [...newRunState.techniques, item];
      }
      return { ...state, runState: newRunState };
    }
    case 'SET_RUN_FLAG': {
      const newRunState = {
        ...state.runState,
        run_flags: { ...state.runState.run_flags, [action.payload.flag]: action.payload.value }
      };
      return { ...state, runState: newRunState };
    }
    case 'SET_PHASE': {
      return { ...state, gamePhase: action.payload };
    }
    case 'UPDATE_HP': {
      const newRunState = { ...state.runState, hp: Math.max(0, Math.min(state.runState.maxHp, action.payload)) };
      if (newRunState.hp <= 0) {
        const runRecord = { ...state.runState.combatStats, karma: state.runState.karma, silver: state.runState.silver };
        const newMeta = {
          ...state.metaState,
          legacyEssence: state.metaState.legacyEssence + state.runState.legacyEssence,
          runHistory: [...state.metaState.runHistory, runRecord]
        };
        saveMeta(newMeta);
        return { ...state, runState: newRunState, metaState: newMeta, gamePhase: 'legacy' };
      }
      return { ...state, runState: newRunState };
    }
    case 'UPDATE_QI': {
      const newRunState = { ...state.runState, qi: Math.max(0, Math.min(state.runState.maxQi, action.payload)) };
      return { ...state, runState: newRunState };
    }
    default:
      return state;
  }
}

function generateEnemy(nodeType, runState) {
  // Phase-based difficulty multipliers
  const node = runState.currentNode || 0;
  let hpMult = 1.0;
  let atkMult = 1.0;
  if (node <= 2) { hpMult = 1.0; atkMult = 1.0; }
  else if (node <= 6) { hpMult = 1.4; atkMult = 1.3; }
  else { hpMult = 1.8; atkMult = 1.6; }
  // Sect Archive scaling: +5% per phase if 3+ items unlocked, +10% if 8+
  const unlockedCount = (runState.unlockedItems || []).length;
  if (unlockedCount >= 8) { hpMult *= 1.10; atkMult *= 1.10; }
  else if (unlockedCount >= 3) { hpMult *= 1.05; atkMult *= 1.05; }
  const scale = (enemy) => ({
    ...enemy,
    hp: Math.round(enemy.hp * hpMult),
    attack: Math.round(enemy.attack * atkMult)
  });
  if (nodeType === 'boss') {
    // Randomly pick B01 or B02; B02 requires SA09 unlock
    const hasBossUnlock = (runState.unlockedItems || []).includes('B02');
    const bossPool = hasBossUnlock ? ['B01', 'B02'] : ['B01'];
    const pick = bossPool[Math.floor(Math.random() * bossPool.length)];
    const boss = BOSSES[pick];
    return { ...boss, hp: Math.round(boss.hp * 3.0), attack: Math.round(boss.attack * 2.0) };
  }
  if (nodeType === 'elite' || nodeType === 'ambush') {
    const elites = Object.values(ENEMIES).filter(e => e.type === 'elite');
    return scale(elites[Math.floor(Math.random() * elites.length)]);
  }
  const standards = Object.values(ENEMIES).filter(e => e.type === 'standard');
  return scale(standards[Math.floor(Math.random() * standards.length)]);
}

function selectEvent(nodeType, runState) {
  const flags = runState?.run_flags || {};
  let pool = [...EVENTS];
  // Filter out events blocked by run flags
  if (flags.joined_black_cliff) pool = pool.filter(e => e.id !== 'E_SECT_INVITATION');
  if (nodeType === 'wanderingMaster') return pool.find(e => e.id === 'E_WANDERING_MASTER') || pool[0];
  if (nodeType === 'sectTrial') return pool.find(e => e.id === 'E_SECT_TRIAL') || pool[0];
  if (nodeType === 'hiddenCave') return pool.find(e => e.id === 'E_FORBIDDEN_CAVE') || pool[0];
  if (nodeType === 'majorEvent') {
    const major = pool.filter(e => ['E_BURNING_VILLAGE', 'E_RIVAL_ENCOUNTER', 'E_PRISONER'].includes(e.id));
    return major[Math.floor(Math.random() * major.length)] || pool[0];
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateRewards(runState) {
  return generateRewardDraft(runState);
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = {
    startNewRun: (weapon, innerArt, movementArt) =>
      dispatch({ type: 'START_NEW_RUN', payload: { weapon, innerArt, movementArt } }),
    travelToNode: (nodeIndex) =>
      dispatch({ type: 'TRAVEL_TO_NODE', payload: { nodeIndex } }),
    completeCombat: (result) =>
      dispatch({ type: 'COMPLETE_COMBAT', payload: result }),
    completeEvent: (outcome) =>
      dispatch({ type: 'COMPLETE_EVENT', payload: { outcome } }),
    chooseReward: (reward) =>
      dispatch({ type: 'CHOOSE_REWARD', payload: { reward } }),
    endRun: () => dispatch({ type: 'END_RUN' }),
    chooseInheritance: (manual, trait) =>
      dispatch({ type: 'CHOOSE_INHERITANCE', payload: { manual, trait } }),
    unlockSectItem: (item, cost) =>
      dispatch({ type: 'UNLOCK_SECT_ITEM', payload: { item, cost } }),
    healAtHealer: (cost) =>
      dispatch({ type: 'HEAL_AT_HEALER', payload: { cost } }),
    setPhase: (phase) => dispatch({ type: 'SET_PHASE', payload: phase }),
    setRunFlag: (flag, value) => dispatch({ type: 'SET_RUN_FLAG', payload: { flag, value } }),
    buyFromMarket: (item, cost, itemType) => dispatch({ type: 'BUY_FROM_MARKET', payload: { item, cost, itemType } }),
    updateHp: (hp) => dispatch({ type: 'UPDATE_HP', payload: hp }),
    updateQi: (qi) => dispatch({ type: 'UPDATE_QI', payload: qi })
  };

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
