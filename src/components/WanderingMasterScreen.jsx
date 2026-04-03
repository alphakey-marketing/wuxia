import { useState } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { TECHNIQUES } from '../data/techniques.js';

const RARE_TECHNIQUES = Object.values(TECHNIQUES).filter(t => t.category === 'rare');
const ORTHODOX_TECHNIQUES = Object.values(TECHNIQUES).filter(t =>
  t.category !== 'rare' && (t.tags?.includes('Counter') || t.tags?.includes('Swift') || t.tags?.includes('Qi-Surge'))
);

function selectTeachings(runState) {
  const owned = new Set(runState.techniques.map(t => t.id));
  const available = [...ORTHODOX_TECHNIQUES, ...RARE_TECHNIQUES].filter(t => !owned.has(t.id));
  const picked = [];
  while (picked.length < 2 && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length);
    picked.push(available.splice(idx, 1)[0]);
  }
  return picked;
}

const S = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at center, #1a1208 0%, #0d0a06 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    fontFamily: 'serif',
    color: '#c8a96e'
  },
  title: { fontSize: '24px', color: '#e8c87e', letterSpacing: '0.2em', marginBottom: '4px' },
  subtitle: { fontSize: '12px', color: '#c8a96e66', letterSpacing: '0.15em', marginBottom: '24px' },
  narrative: {
    width: '100%',
    maxWidth: '560px',
    fontSize: '14px',
    color: '#c8a96e',
    lineHeight: '1.8',
    marginBottom: '28px',
    padding: '20px',
    background: '#1e1508',
    border: '1px solid #c8a96e22',
    borderRadius: '2px',
    fontStyle: 'italic'
  },
  techGrid: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '560px', marginBottom: '20px' },
  techCard: (selected, canLearn) => ({
    padding: '16px',
    background: selected ? '#2a3a1a' : canLearn ? '#2a1e10' : '#1a1208',
    border: `2px solid ${selected ? '#6abf6a' : canLearn ? '#c8a96e55' : '#c8a96e22'}`,
    borderRadius: '4px',
    cursor: canLearn ? 'pointer' : 'default',
    opacity: canLearn || selected ? 1 : 0.5,
    transition: 'all 0.2s'
  }),
  techName: { fontSize: '16px', color: '#e8c87e', marginBottom: '4px' },
  techTags: { display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' },
  tag: { fontSize: '10px', padding: '1px 6px', background: '#1a2a1a', border: '1px solid #4a8b4a44', borderRadius: '2px', color: '#6abf6a' },
  techDesc: { fontSize: '12px', color: '#c8a96e88' },
  karmaNote: { fontSize: '11px', color: '#4a8bcc88', marginTop: '6px', fontStyle: 'italic' },
  optionBtns: { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '560px' },
  optionBtn: (variant) => ({
    padding: '14px 20px',
    background: variant === 'primary' ? '#2a1e10' : 'transparent',
    border: `1px solid ${variant === 'primary' ? '#c8a96e' : '#c8a96e44'}`,
    color: variant === 'primary' ? '#e8c87e' : '#c8a96e88',
    fontFamily: 'serif',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: '2px',
    transition: 'background 0.2s'
  }),
  confirmBtn: {
    padding: '12px 40px',
    background: '#2a3a1a',
    border: '1px solid #6abf6a',
    color: '#6abf6a',
    fontFamily: 'serif',
    fontSize: '15px',
    cursor: 'pointer',
    letterSpacing: '0.1em',
    marginTop: '16px'
  }
};

const MASTER_NARRATIVES = [
  'An elderly woman sits cross-legged beneath a gnarled plum tree, her eyes closed, hands moving through a slow and impossibly precise form. She opens one eye as you approach.',
  'A white-bearded man laughs at the sky, his robes tattered, his footwork leaving impossible patterns in the dust. He seems drunk — or pretending to be.',
  'A middle-aged man in plain grey clothes tends a small fire. Beside him lies a worn manual, its cover faded beyond reading. He looks up at you without surprise.',
  'She is perhaps seventy years old. She is also the most dangerous person you have encountered in the jianghu. She knows this, and smiles gently.'
];

export default function WanderingMasterScreen() {
  const { state, actions } = useGame();
  const { runState } = state;
  const [teachings] = useState(() => selectTeachings(runState));
  const [selected, setSelected] = useState(null);
  const [choice, setChoice] = useState(null);
  const [narrative] = useState(() => MASTER_NARRATIVES[Math.floor(Math.random() * MASTER_NARRATIVES.length)]);

  const canLearnFree = runState.techniques.length < (runState.maxTechniques || 6);
  const isOrthodox = runState.karma.orthodoxy >= 0;

  const handleLearnFree = (tech) => {
    if (!canLearnFree) return;
    setSelected(tech);
  };

  const handleConfirmLearn = () => {
    if (!selected) return;
    actions.chooseReward({ type: 'newTechnique', data: selected });
    actions.completeEvent({ outcome: { karma: { orthodoxy: 1 } } });
  };

  const handleObserve = () => {
    // Observe: gain a technique shard (treat as healing + small karma)
    actions.completeEvent({ outcome: { healHp: 5, karma: { renown: 1 } } });
  };

  const handleChallenge = () => {
    // Challenge: +ambition + honor, leads to combat
    actions.completeEvent({ outcome: { karma: { ambition: 1, honor: 1 } } });
  };

  const handleLeave = () => {
    actions.completeEvent({ outcome: {} });
  };

  if (choice === 'learn') {
    return (
      <div style={S.container}>
        <div style={S.title}>傳授技藝 · Teaching a Technique</div>
        <div style={S.subtitle}>Choose what you wish to learn</div>
        {!canLearnFree && (
          <div style={{ ...S.narrative, background: '#2a1a1a', border: '1px solid #8b1a1a44' }}>
            "Your mind is already full," the master says. "You cannot hold another technique until you have mastered what you carry." (Max {runState.maxTechniques || 6} techniques equipped)
          </div>
        )}
        <div style={S.techGrid}>
          {teachings.map(tech => (
            <div
              key={tech.id}
              style={S.techCard(selected?.id === tech.id, canLearnFree)}
              onClick={() => handleLearnFree(tech)}
            >
              <div style={S.techName}>{tech.name}</div>
              <div style={S.techTags}>
                {tech.tags?.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}
                {tech.category === 'rare' && <span style={{ ...S.tag, background: '#2a1a2a', border: '1px solid #6b2a6b44', color: '#c88bcc' }}>Rare</span>}
              </div>
              <div style={S.techDesc}>{tech.description}</div>
              {tech.upgradeI && <div style={S.karmaNote}>Chapter I upgrade: {tech.upgradeI}</div>}
            </div>
          ))}
        </div>
        {selected && (
          <button style={S.confirmBtn} onClick={handleConfirmLearn}>
            學習 · Learn "{selected.name}"
          </button>
        )}
        <button style={{ ...S.optionBtn('secondary'), marginTop: '12px', maxWidth: '560px', width: '100%' }} onClick={handleLeave}>
          ← Back away respectfully
        </button>
      </div>
    );
  }

  return (
    <div style={S.container}>
      <div style={S.title}>奇遇 · Wandering Master</div>
      <div style={S.subtitle}>A rare encounter on the road</div>
      <div style={S.narrative}>{narrative}</div>
      <div style={S.optionBtns}>
        <button style={S.optionBtn('primary')} onClick={() => setChoice('learn')}>
          🙏 Ask to be taught — "I seek to walk the orthodox path."
          {isOrthodox
            ? ' (Orthodox — technique taught freely)'
            : ' (Your path is unorthodox — master will teach at the cost of +1 Orthodoxy karma)'}
        </button>
        <button style={S.optionBtn('secondary')} onClick={handleObserve}>
          👁 Observe from a distance and learn what you can
          <span style={{ display: 'block', fontSize: '11px', color: '#c8a96e55', marginTop: '3px' }}>Gain a small insight (+1 Renown)</span>
        </button>
        <button style={S.optionBtn('secondary')} onClick={handleChallenge}>
          ⚔ Challenge them to prove your worth
          <span style={{ display: 'block', fontSize: '11px', color: '#c8a96e55', marginTop: '3px' }}>+1 Ambition, +1 Honor — a fight awaits, with a rare technique as reward on victory</span>
        </button>
        <button style={{ ...S.optionBtn('secondary'), opacity: 0.5 }} onClick={handleLeave}>
          Walk past without engaging
        </button>
      </div>
    </div>
  );
}
