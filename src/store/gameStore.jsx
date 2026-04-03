import React, { createContext, useContext, useReducer } from 'react';
import { WEAPONS } from '../data/weapons.js';
import { INNER_ARTS } from '../data/innerArts.js';
import { MOVEMENT_ARTS } from '../data/movementArts.js';
import { RELICS } from '../data/relics.js';
import { TECHNIQUES } from '../data/techniques.js';
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
  maxTechniques: 6,
  karma: { mercy: 0, honor: 0, ambition: 0, orthodoxy: 0, renown: 0 },
  currentNode: -1,
  phase: 1,
  nodeMap: [],
  activeNodeIndex: null,
  qiBreakthroughs: 0,
  burningMeridianStacks: 0,
  run_flags: {},
  techniqueShards: 0,
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
      const imprint = state.metaState.fateImprint;
      // Apply Fate Imprint effects — §11.3
      if (imprint === 'compassionate') maxHp += 10;
      if (imprint === 'legend') maxHp += 15;
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
        maxTechniques: 6,
        techniques: state.metaState.inheritedManual ? [state.metaState.inheritedManual] : [],
        relics: [],
        run_flags: {}
      };
      // blood_handed: +5 attack, flag reduces healer count on map
      if (imprint === 'blood_handed') {
        runState.attack += 5;
        runState.run_flags.blood_handed_start = true;
      }
      // righteous: start with 1 random honor-tagged relic (use R11 Empty Hand Bell as honor relic)
      if (imprint === 'righteous') {
        const honorRelic = RELICS['R11'];
        if (honorRelic && runState.relics.length < 4) runState.relics = [honorRelic];
      }
      // schemer: +20 silver at start
      if (imprint === 'schemer') {
        runState.silver += 20;
      }
      // driven: boss HP boost — stored as flag, applied in generateEnemy
      if (imprint === 'driven') {
        runState.run_flags.driven_boss_boost = true;
      }
      // grandmaster: guaranteed wandering master node — stored as flag
      if (imprint === 'grandmaster') {
        runState.run_flags.guaranteed_wandering_master = true;
      }
      // forbidden: unlock 7th technique slot
      if (imprint === 'forbidden') {
        runState.maxTechniques = 7;
      }
      // legend: enemy +5% ATK — stored as flag, applied in generateEnemy
      if (imprint === 'legend') {
        runState.run_flags.legend_enemy_boost = true;
      }
      // feared: enemy +10% ATK but +20% silver — stored as flags
      if (imprint === 'feared') {
        runState.run_flags.feared_start = true;
      }
      return { ...state, runState, gamePhase: 'nodeMap' };
    }
    case 'TRAVEL_TO_NODE': {
      const { nodeIndex } = action.payload;
      const node = state.runState.nodeMap[nodeIndex];
      if (!node) return state;
      // Fork nodes: stay on nodeMap and mark as activeNodeIndex so branch UI renders
      if (node.type === 'fork') {
        return { ...state, runState: { ...state.runState, activeNodeIndex: nodeIndex }, gamePhase: 'nodeMap', currentEnemy: null, pendingEvent: null };
      }
      const newRunState = { ...state.runState, activeNodeIndex: nodeIndex };
      let gamePhase = state.gamePhase;
      let currentEnemy = null;
      let pendingEvent = null;
      if (node.type === 'combat' || node.type === 'elite' || node.type === 'boss' || node.type === 'ambush') {
        gamePhase = 'combat';
        currentEnemy = generateEnemy(node.type, state.runState, state.metaState);
      } else if (node.type === 'wanderingMaster') {
        gamePhase = 'wanderingMaster';
      } else if (node.type === 'event' || node.type === 'majorEvent' || node.type === 'sectTrial' || node.type === 'hiddenCave') {
        gamePhase = 'event';
        pendingEvent = selectEvent(node.type, state.runState, state.metaState);
      } else if (node.type === 'healer') {
        gamePhase = 'healer';
      } else if (node.type === 'blackMarket') {
        gamePhase = 'blackMarket';
      } else if (node.type === 'manualPage') {
        gamePhase = 'reward';
      }
      return { ...state, runState: newRunState, gamePhase, currentEnemy, pendingEvent };
    }
    case 'CHOOSE_FORK': {
      const { nodeIndex, branchIndex } = action.payload;
      const node = state.runState.nodeMap[nodeIndex];
      if (!node || node.type !== 'fork' || !node.branches?.[branchIndex]) return state;
      const chosenBranch = node.branches[branchIndex];
      // Resolve the fork node to the chosen branch type in the map
      const newNodeMap = state.runState.nodeMap.map((n, i) =>
        i === nodeIndex ? { ...n, type: chosenBranch.type, label: chosenBranch.label, resolved: true } : n
      );
      const newRunState = {
        ...state.runState,
        nodeMap: newNodeMap,
        activeNodeIndex: nodeIndex,
        run_flags: { ...state.runState.run_flags, [`fork_${nodeIndex}`]: branchIndex }
      };
      // Route based on chosen branch type
      let gamePhase = state.gamePhase;
      let currentEnemy = null;
      let pendingEvent = null;
      if (chosenBranch.type === 'combat' || chosenBranch.type === 'elite' || chosenBranch.type === 'boss' || chosenBranch.type === 'ambush') {
        gamePhase = 'combat';
        currentEnemy = generateEnemy(chosenBranch.type, newRunState, state.metaState);
      } else if (chosenBranch.type === 'wanderingMaster') {
        gamePhase = 'wanderingMaster';
      } else if (chosenBranch.type === 'event' || chosenBranch.type === 'majorEvent' || chosenBranch.type === 'sectTrial' || chosenBranch.type === 'hiddenCave') {
        gamePhase = 'event';
        pendingEvent = selectEvent(chosenBranch.type, newRunState, state.metaState);
      } else if (chosenBranch.type === 'healer') {
        gamePhase = 'healer';
      } else if (chosenBranch.type === 'blackMarket') {
        gamePhase = 'blackMarket';
      }
      return { ...state, runState: newRunState, gamePhase, currentEnemy, pendingEvent };
    }
    case 'COMPLETE_COMBAT': {
      const { victory, damageDealt, silverGained, essenceGained, remainingHp, burningMeridianStacks, karmaBonus, bossId } = action.payload;
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
      let karma = state.runState.karma;
      if (karmaBonus) {
        karma = { ...karma };
        Object.entries(karmaBonus).forEach(([k, v]) => { karma[k] = (karma[k] || 0) + v; });
      }
      // Feared imprint: +20% silver from combat
      const silverMultiplier = state.runState.run_flags?.feared_start ? 1.2 : 1.0;
      const totalSilver = state.runState.silver + Math.floor((silverGained || 0) * silverMultiplier);
      // Driven imprint: ×2 essence on boss victory
      const essenceMultiplier = (bossId && state.runState.run_flags?.driven_boss_boost) ? 2 : 1;
      const totalEssence = state.runState.legacyEssence + (essenceGained || 0) * essenceMultiplier;
      const isBoss = !!bossId;
      const clearedNode = state.runState.activeNodeIndex;
      const newRunState = {
        ...state.runState,
        hp: remainingHp !== undefined ? remainingHp : state.runState.hp,
        silver: totalSilver,
        legacyEssence: totalEssence,
        karma,
        burningMeridianStacks: newStacks,
        currentNode: clearedNode !== null && clearedNode !== undefined ? clearedNode : state.runState.currentNode,
        activeNodeIndex: null,
        combatStats: {
          ...state.runState.combatStats,
          enemiesDefeated: state.runState.combatStats.enemiesDefeated + 1,
          bossesDefeated: (state.runState.combatStats.bossesDefeated || 0) + (isBoss ? 1 : 0),
          totalDamage: state.runState.combatStats.totalDamage + (damageDealt || 0)
        }
      };
      const rewards = generateRewards(newRunState);
      return { ...state, runState: newRunState, gamePhase: 'reward', pendingRewards: rewards };
    }
    case 'COMPLETE_EVENT': {
      const { outcome } = action.payload;
      let newRunState = { ...state.runState };
      const maxTech = newRunState.maxTechniques || 6;
      // Commit the active node as completed
      const clearedNode = state.runState.activeNodeIndex;
      if (clearedNode !== null && clearedNode !== undefined) {
        newRunState.currentNode = clearedNode;
        newRunState.activeNodeIndex = null;
      }
      // Handle random outcome for E_GHOST_STORY
      let resolvedOutcome = outcome;
      if (outcome.random) {
        const allTechs = Object.values(TECHNIQUES).filter(t => !newRunState.techniques.find(tt => tt.id === t.id) && t.category !== 'rare');
        const allRelics = Object.values(RELICS).filter(r => !newRunState.relics.find(rr => rr.id === r.id));
        const roll = Math.random();
        if (roll < 0.33 && allTechs.length > 0) {
          const tech = allTechs[Math.floor(Math.random() * allTechs.length)];
          resolvedOutcome = { technique: tech.id };
        } else if (roll < 0.66 && allRelics.length > 0 && newRunState.relics.length < 4) {
          const relic = allRelics[Math.floor(Math.random() * allRelics.length)];
          resolvedOutcome = { relic: relic.id };
        } else {
          resolvedOutcome = { hpLoss: 30 };
        }
      }
      if (resolvedOutcome.healHp) newRunState.hp = Math.min(newRunState.maxHp, newRunState.hp + resolvedOutcome.healHp);
      if (resolvedOutcome.hpMax) newRunState.maxHp = newRunState.maxHp + resolvedOutcome.hpMax;
      if (resolvedOutcome.hpLoss) newRunState.hp = Math.max(1, newRunState.hp - resolvedOutcome.hpLoss);
      if (resolvedOutcome.silver) newRunState.silver = newRunState.silver + resolvedOutcome.silver;
      if (resolvedOutcome.essence) newRunState.legacyEssence = newRunState.legacyEssence + resolvedOutcome.essence;
      if (resolvedOutcome.karma) {
        newRunState.karma = { ...newRunState.karma };
        Object.entries(resolvedOutcome.karma).forEach(([k, v]) => { newRunState.karma[k] = (newRunState.karma[k] || 0) + v; });
      }
      if (resolvedOutcome.technique) {
        const tech = TECHNIQUES[resolvedOutcome.technique];
        if (tech && !newRunState.techniques.find(t => t.id === tech.id) && newRunState.techniques.length < maxTech) {
          newRunState.techniques = [...newRunState.techniques, tech];
        }
      }
      if (resolvedOutcome.relic) {
        const relic = RELICS[resolvedOutcome.relic];
        if (relic && !newRunState.relics.find(r => r.id === relic.id) && newRunState.relics.length < 4) {
          newRunState.relics = [...newRunState.relics, relic];
        }
      }
      if (resolvedOutcome.techniqueShard) {
        newRunState.techniqueShards = (newRunState.techniqueShards || 0) + 1;
      }
      if (resolvedOutcome.memorySeal) {
        newRunState.run_flags = { ...newRunState.run_flags, latestMemorySeal: resolvedOutcome.memorySeal };
      }
      if (resolvedOutcome.flag) {
        newRunState.run_flags = { ...newRunState.run_flags, [resolvedOutcome.flag]: true };
      }
      // shop outcome: route to blackMarket screen instead of returning to the map
      if (resolvedOutcome.shop) {
        return { ...state, runState: newRunState, gamePhase: 'blackMarket', pendingEvent: null };
      }
      return { ...state, runState: newRunState, gamePhase: 'nodeMap', pendingEvent: null };
    }
    case 'CHOOSE_REWARD': {
      const { reward } = action.payload;
      let newRunState = { ...state.runState };
      const maxTech = newRunState.maxTechniques || 6;
      if (reward.type === 'newTechnique' && newRunState.techniques.length < maxTech) {
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
      // Memory Seal: most significant choice flag from this run
      const flags = state.runState.run_flags || {};
      let memorySeal = state.metaState.memorySeal; // carry forward by default
      if (flags.spared_iron_fan_widow) memorySeal = 'spared_iron_fan_widow';
      else if (flags.entered_forbidden_cave) memorySeal = 'entered_forbidden_cave';
      else if (flags.joined_black_cliff) memorySeal = 'joined_black_cliff';
      const newMeta = {
        ...state.metaState,
        legacyEssence: state.metaState.legacyEssence + state.runState.legacyEssence,
        fateImprint,
        memorySeal,
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
      const clearedNode = state.runState.activeNodeIndex;
      const newRunState = {
        ...state.runState,
        silver: state.runState.silver - cost,
        hp: Math.min(state.runState.maxHp, state.runState.hp + healAmount),
        currentNode: clearedNode !== null && clearedNode !== undefined ? clearedNode : state.runState.currentNode,
        activeNodeIndex: null
      };
      return { ...state, runState: newRunState, gamePhase: 'nodeMap' };
    }
    case 'BUY_FROM_MARKET': {
      const { item, cost, itemType } = action.payload;
      if (state.runState.silver < cost) return state;
      let newRunState = { ...state.runState, silver: state.runState.silver - cost };
      const maxTech = newRunState.maxTechniques || 6;
      if (itemType === 'relic' && newRunState.relics.length < 4) {
        newRunState.relics = [...newRunState.relics, item];
        if (item.id === 'R01') newRunState.maxHp += 25;
      } else if (itemType === 'technique' && newRunState.techniques.length < maxTech) {
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

function generateEnemy(nodeType, runState, metaState) {
  // Phase-based difficulty multipliers
  const node = runState.activeNodeIndex !== null && runState.activeNodeIndex !== undefined
    ? runState.activeNodeIndex
    : (runState.currentNode + 1);
  let hpMult = 1.0;
  let atkMult = 1.0;
  if (node <= 2) { hpMult = 1.0; atkMult = 1.0; }
  else if (node <= 6) { hpMult = 1.4; atkMult = 1.3; }
  else { hpMult = 1.8; atkMult = 1.6; }
  // Sect Archive scaling: +5% if 3+ items unlocked, +10% if 8+
  const unlockedCount = (metaState?.unlockedItems || []).length;
  if (unlockedCount >= 8) { hpMult *= 1.10; atkMult *= 1.10; }
  else if (unlockedCount >= 3) { hpMult *= 1.05; atkMult *= 1.05; }
  // Fate Imprint: legend +5% ATK, feared +10% ATK
  const flags = runState.run_flags || {};
  if (flags.legend_enemy_boost) atkMult *= 1.05;
  if (flags.feared_start) atkMult *= 1.10;
  const scale = (enemy) => ({
    ...enemy,
    hp: Math.round(enemy.hp * hpMult),
    attack: Math.round(enemy.attack * atkMult)
  });
  if (nodeType === 'boss') {
    // Randomly pick B01 or B02; B02 requires SA09 unlock
    const hasBossUnlock = (metaState?.unlockedItems || []).includes('B02');
    const bossPool = hasBossUnlock ? ['B01', 'B02'] : ['B01'];
    const pick = bossPool[Math.floor(Math.random() * bossPool.length)];
    const boss = BOSSES[pick];
    let bossHpMult = 3.0;
    let bossAtkMult = 2.0;
    if (flags.driven_boss_boost) bossHpMult *= 1.10;
    return { ...boss, hp: Math.round(boss.hp * bossHpMult), attack: Math.round(boss.attack * bossAtkMult) };
  }
  if (nodeType === 'elite' || nodeType === 'ambush') {
    const elites = Object.values(ENEMIES).filter(e => e.type === 'elite');
    return scale(elites[Math.floor(Math.random() * elites.length)]);
  }
  const standards = Object.values(ENEMIES).filter(e => e.type === 'standard');
  return scale(standards[Math.floor(Math.random() * standards.length)]);
}

function selectEvent(nodeType, runState, metaState) {
  const flags = runState?.run_flags || {};
  const seal = metaState?.memorySeal || null;
  let pool = [...EVENTS];
  // Remove events that require a memory seal the player doesn't have
  pool = pool.filter(e => !e.requiresSeal || e.requiresSeal === seal);
  // Remove events blocked by run flags
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
    chooseFork: (nodeIndex, branchIndex) => dispatch({ type: 'CHOOSE_FORK', payload: { nodeIndex, branchIndex } }),
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
