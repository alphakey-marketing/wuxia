import { TECHNIQUES } from '../data/techniques.js';
import { RELICS } from '../data/relics.js';

export function generateRewardDraft(runState, count = 3) {
  const axes = ['newTechnique', 'relic', 'healing'];
  const rewards = [];
  for (const axis of axes) {
    rewards.push(generateRewardOfType(axis, runState));
  }
  return rewards;
}

export function generateRewardOfType(type, runState) {
  if (type === 'newTechnique') {
    const available = Object.values(TECHNIQUES).filter(t => !runState.techniques.find(rt => rt.id === t.id) && t.category !== 'rare');
    const t = available[Math.floor(Math.random() * available.length)] || Object.values(TECHNIQUES)[0];
    return { type: 'newTechnique', data: t, label: 'New Technique', description: t.description };
  }
  if (type === 'relic') {
    const available = Object.values(RELICS).filter(r => !runState.relics.find(rr => rr.id === r.id));
    const r = available[Math.floor(Math.random() * available.length)] || Object.values(RELICS)[0];
    return { type: 'relic', data: r, label: 'Relic', description: r.description };
  }
  if (type === 'healing') {
    const amount = 20 + Math.floor(Math.random() * 20);
    return { type: 'healing', label: 'Healing', description: `Restore ${amount} HP`, data: { amount } };
  }
  if (type === 'qiBreakthrough') {
    const options = ['hp', 'attack', 'critChance'];
    const stat = options[Math.floor(Math.random() * options.length)];
    return { type: 'qiBreakthrough', label: 'Qi Breakthrough', description: `Increase ${stat}`, data: { stat } };
  }
  if (type === 'techniqueUpgrade') {
    if (runState.techniques.length === 0) return generateRewardOfType('newTechnique', runState);
    const t = runState.techniques[Math.floor(Math.random() * runState.techniques.length)];
    return { type: 'techniqueUpgrade', label: 'Technique Upgrade', description: `Upgrade: ${t.name}`, data: { techniqueId: t.id } };
  }
  return generateRewardOfType('healing', runState);
}
