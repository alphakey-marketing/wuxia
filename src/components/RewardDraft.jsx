import { useState } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { detectSynergies } from '../utils/synergies.js';
import { TECHNIQUES } from '../data/techniques.js';

const TYPE_ICONS = {
  newTechnique: '📜',
  techniqueUpgrade: '⬆️',
  relic: '💎',
  qiBreakthrough: '✨',
  healing: '💊'
};

const TYPE_COLORS = {
  newTechnique: '#c8a96e',
  techniqueUpgrade: '#6a9ec0',
  relic: '#9e6ac0',
  qiBreakthrough: '#6ac09e',
  healing: '#6abf6a'
};

const S = {
  container: {
    minHeight: '100vh',
    background: '#1a1208',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    fontFamily: 'serif',
    color: '#c8a96e'
  },
  title: { fontSize: '24px', color: '#e8c87e', letterSpacing: '0.2em', marginBottom: '8px' },
  subtitle: { fontSize: '13px', color: '#c8a96e66', marginBottom: '40px', letterSpacing: '0.1em' },
  grid: { display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px', marginBottom: '20px' },
  card: (selected, color) => ({
    width: '220px',
    background: selected ? '#2a1e10' : '#1e1508',
    border: `1px solid ${selected ? color : '#c8a96e44'}`,
    borderRadius: '4px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: selected ? `0 0 16px ${color}44` : 'none'
  }),
  cardIcon: { fontSize: '28px', marginBottom: '8px', display: 'block' },
  cardType: (color) => ({ fontSize: '10px', color, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }),
  cardName: { fontSize: '16px', color: '#e8c87e', marginBottom: '8px' },
  cardDesc: { fontSize: '12px', color: '#c8a96eaa', lineHeight: '1.5' },
  tag: (synergy) => ({
    display: 'inline-block',
    padding: '2px 7px',
    background: synergy ? '#1a2a1a' : '#2a1a00',
    border: `1px solid ${synergy ? '#4a8b4a' : '#c8a96e33'}`,
    borderRadius: '2px',
    fontSize: '10px',
    color: synergy ? '#6abf6a' : '#c8a96e',
    marginRight: '3px',
    marginTop: '4px'
  }),
  chooseBtn: (selected) => ({
    padding: '12px 40px',
    background: selected ? '#c8a96e22' : 'transparent',
    border: `1px solid ${selected ? '#c8a96e' : '#c8a96e44'}`,
    color: selected ? '#e8c87e' : '#c8a96e88',
    fontSize: '15px',
    fontFamily: 'serif',
    letterSpacing: '0.2em',
    cursor: selected ? 'pointer' : 'default',
    transition: 'all 0.2s'
  })
};

export default function RewardDraft() {
  const { state, actions } = useGame();
  const { pendingRewards, runState } = state;
  const [selected, setSelected] = useState(null);

  if (!pendingRewards || pendingRewards.length === 0) {
    return (
      <div style={S.container}>
        <p>No rewards available.</p>
        <button onClick={() => actions.setPhase('nodeMap')} style={{ color: '#e8c87e', background: 'none', border: '1px solid #c8a96e', padding: '10px 20px', cursor: 'pointer', fontFamily: 'serif' }}>
          Continue
        </button>
      </div>
    );
  }

  const existingTags = runState.techniques.flatMap(t => t.tags);
  const synergies = detectSynergies(runState.techniques);
  const synergyTagNames = synergies.map(s => s.name);

  const hasSynergyTag = (reward) => {
    if (reward.type !== 'newTechnique' || !reward.data?.tags) return false;
    return reward.data.tags.some(tag => existingTags.includes(tag));
  };

  const handleChoose = () => {
    if (selected === null) return;
    actions.chooseReward(pendingRewards[selected]);
  };

  return (
    <div style={S.container}>
      <div style={S.title}>獲得傳承 · Claim Your Reward</div>
      <div style={S.subtitle}>Choose one reward to continue</div>

      <div style={S.grid}>
        {pendingRewards.map((reward, i) => {
          const color = TYPE_COLORS[reward.type] || '#c8a96e';
          const isSynergy = hasSynergyTag(reward);
          return (
            <div
              key={i}
              style={S.card(selected === i, color)}
              onClick={() => setSelected(i)}
            >
              <span style={S.cardIcon}>{TYPE_ICONS[reward.type] || '❓'}</span>
              <div style={S.cardType(color)}>{reward.label}</div>
              <div style={S.cardName}>{reward.data?.name || reward.label}</div>
              <div style={S.cardDesc}>{reward.description}</div>
              {reward.data?.tags && (
                <div style={{ marginTop: '8px' }}>
                  {reward.data.tags.map(tag => (
                    <span key={tag} style={S.tag(existingTags.includes(tag))}>
                      {existingTags.includes(tag) ? '✦ ' : ''}{tag}
                    </span>
                  ))}
                </div>
              )}
              {isSynergy && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#6abf6a' }}>
                  ✦ Synergy bonus available!
                </div>
              )}
              {reward.type === 'newTechnique' && reward.data?.upgradeI && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#c8a96e66', borderTop: '1px solid #c8a96e22', paddingTop: '6px' }}>
                  Upgrade I: {reward.data.upgradeI}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        style={S.chooseBtn(selected !== null)}
        onClick={handleChoose}
        disabled={selected === null}
      >
        擇此路 · Choose
      </button>
    </div>
  );
}
