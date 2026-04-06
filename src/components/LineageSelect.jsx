import { useState } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { WEAPONS } from '../data/weapons.js';
import { INNER_ARTS } from '../data/innerArts.js';
import { MOVEMENT_ARTS } from '../data/movementArts.js';
import { TECHNIQUES } from '../data/techniques.js';

// Occupation signature starting techniques (must match gameStore START_NEW_RUN)
const WEAPON_START_TECH = { sword: 'T01', spear: 'T05', fists: 'T09' };

const LINEAGES = [
  {
    id: 'swift',
    name: 'Swift Blade Wanderer',
    nameZh: '游俠快劍',
    weapon: 'sword',
    innerArt: 'flowingRiver',
    movementArt: 'swallowStep',
    description: 'A swift fighter who flows between attacks and dodges. Excels at sustained combat and healing through movement.',
    flavor: '"Speed is the first virtue of the sword."'
  },
  {
    id: 'iron',
    name: 'Iron Spear Disciple',
    nameZh: '鐵槍弟子',
    weapon: 'spear',
    innerArt: 'burningMeridian',
    movementArt: 'swallowStep',
    description: 'A warrior who grows stronger with each kill, channeling battle fury into devastating power.',
    flavor: '"Victory feeds the fire within."',
    requires: 'spear'
  },
  {
    id: 'feral',
    name: 'Blood Wolf Fist',
    nameZh: '血狼拳',
    weapon: 'fists',
    innerArt: 'bloodWolf',
    movementArt: 'cloudLadder',
    description: 'A ferocious brawler who heals through relentless strikes. High risk, primal power.',
    flavor: '"Devour or be devoured."',
    requires: ['bloodWolf', 'cloudLadder']
  }
];

const S = {
  container: {
    minHeight: '100vh',
    background: '#1a1208',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
    color: '#c8a96e',
    fontFamily: 'serif'
  },
  title: { fontSize: '28px', color: '#e8c87e', letterSpacing: '0.2em', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#c8a96e66', letterSpacing: '0.15em', marginBottom: '40px' },
  grid: { display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '30px', maxWidth: '900px' },
  card: (selected, locked) => ({
    width: '260px',
    background: selected ? '#2a1e10' : '#1e1508',
    border: `1px solid ${selected ? '#c8a96e' : locked ? '#333' : '#c8a96e44'}`,
    borderRadius: '4px',
    padding: '20px',
    cursor: locked ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: locked ? 0.5 : 1,
    boxShadow: selected ? '0 0 20px #c8a96e33' : 'none'
  }),
  cardTitle: { fontSize: '18px', color: '#e8c87e', marginBottom: '4px' },
  cardSubtitle: { fontSize: '12px', color: '#c8a96e66', marginBottom: '12px', letterSpacing: '0.1em' },
  tag: {
    display: 'inline-block',
    padding: '2px 8px',
    background: '#2a1a00',
    border: '1px solid #c8a96e44',
    borderRadius: '2px',
    fontSize: '11px',
    color: '#c8a96e',
    marginRight: '4px',
    marginBottom: '4px'
  },
  statRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' },
  statLabel: { color: '#c8a96e88' },
  statValue: { color: '#e8c87e' },
  description: { fontSize: '12px', color: '#c8a96eaa', lineHeight: '1.5', marginTop: '10px', marginBottom: '10px' },
  flavor: { fontSize: '11px', color: '#c8a96e55', fontStyle: 'italic', borderTop: '1px solid #c8a96e22', paddingTop: '10px' },
  lockedMsg: { fontSize: '11px', color: '#8b1a1a', marginTop: '8px' },
  detailPanel: {
    width: '100%',
    maxWidth: '700px',
    background: '#1e1508',
    border: '1px solid #c8a96e44',
    borderRadius: '4px',
    padding: '20px',
    marginBottom: '20px'
  },
  startBtn: {
    padding: '14px 48px',
    background: 'transparent',
    border: '1px solid #c8a96e',
    color: '#e8c87e',
    fontSize: '16px',
    fontFamily: 'serif',
    letterSpacing: '0.2em',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginBottom: '12px'
  },
  backBtn: {
    padding: '10px 32px',
    background: 'transparent',
    border: '1px solid #c8a96e44',
    color: '#c8a96e',
    fontSize: '13px',
    fontFamily: 'serif',
    cursor: 'pointer'
  }
};

export default function LineageSelect() {
  const { state, actions } = useGame();
  const { unlockedItems } = state.metaState;
  const [selected, setSelected] = useState(null);

  const isLocked = (lineage) => {
    if (!lineage.requires) return false;
    const reqs = Array.isArray(lineage.requires) ? lineage.requires : [lineage.requires];
    return reqs.some(r => !unlockedItems.includes(r));
  };

  const selectedLineage = LINEAGES.find(l => l.id === selected);

  const handleStart = () => {
    if (!selectedLineage || isLocked(selectedLineage)) return;
    actions.startNewRun(selectedLineage.weapon, selectedLineage.innerArt, selectedLineage.movementArt);
  };

  return (
    <div style={S.container}>
      <h2 style={S.title}>選擇傳承 · Choose Your Lineage</h2>
      <p style={S.subtitle}>Your weapon, inner art, and movement art define this life</p>

      <div style={S.grid}>
        {LINEAGES.map(lineage => {
          const locked = isLocked(lineage);
          const weaponData = WEAPONS[lineage.weapon];
          const artData = INNER_ARTS[lineage.innerArt];
          const movData = MOVEMENT_ARTS[lineage.movementArt];
          const startTech = TECHNIQUES[WEAPON_START_TECH[lineage.weapon]];
          return (
            <div
              key={lineage.id}
              style={S.card(selected === lineage.id, locked)}
              onClick={() => !locked && setSelected(lineage.id)}
            >
              <div style={S.cardTitle}>{lineage.name}</div>
              <div style={S.cardSubtitle}>{lineage.nameZh}</div>
              <div style={{ marginBottom: '10px' }}>
                <span style={S.tag}>⚔ {weaponData.nameZh}</span>
                <span style={S.tag}>🌊 {artData.nameZh}</span>
                <span style={S.tag}>🦋 {movData.nameZh}</span>
              </div>
              <div style={S.statRow}>
                <span style={S.statLabel}>Attack</span>
                <span style={S.statValue}>{weaponData.attack}</span>
              </div>
              <div style={S.statRow}>
                <span style={S.statLabel}>Crit</span>
                <span style={S.statValue}>{Math.round(weaponData.critChance * 100)}%</span>
              </div>
              <div style={S.statRow}>
                <span style={S.statLabel}>Style</span>
                <span style={S.statValue}>{artData.risk.split(',')[0]}</span>
              </div>
              <p style={S.description}>{lineage.description}</p>
              <p style={S.flavor}>{lineage.flavor}</p>
              {startTech && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #c8a96e22', fontSize: '11px' }}>
                  <span style={{ color: '#c8a96e88' }}>Signature Technique: </span>
                  <span style={{ color: '#e8c87e' }}>{startTech.name}</span>
                </div>
              )}
              {locked && (
                <p style={S.lockedMsg}>🔒 Unlock in Sect Archive</p>
              )}
            </div>
          );
        })}
      </div>

      {selectedLineage && !isLocked(selectedLineage) && (
        <div style={S.detailPanel}>
          <h3 style={{ color: '#e8c87e', marginBottom: '12px' }}>
            {selectedLineage.name} — Build Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <div style={{ color: '#c8a96e', fontSize: '13px', marginBottom: '6px' }}>⚔ Weapon</div>
              <div style={{ color: '#e8c87e', fontSize: '14px' }}>{WEAPONS[selectedLineage.weapon].name}</div>
              <div style={{ color: '#c8a96eaa', fontSize: '11px', marginTop: '4px' }}>
                {WEAPONS[selectedLineage.weapon].basicPattern}
              </div>
              <div style={{ color: '#e8c87e', fontSize: '12px', marginTop: '8px' }}>
                Skill: {WEAPONS[selectedLineage.weapon].skill.name}
              </div>
            </div>
            <div>
              <div style={{ color: '#c8a96e', fontSize: '13px', marginBottom: '6px' }}>📜 Signature Technique</div>
              {(() => {
                const t = TECHNIQUES[WEAPON_START_TECH[selectedLineage.weapon]];
                return t ? (
                  <>
                    <div style={{ color: '#e8c87e', fontSize: '14px' }}>{t.name}</div>
                    <div style={{ color: '#c8a96eaa', fontSize: '11px', marginTop: '4px' }}>{t.description}</div>
                    <div style={{ marginTop: '6px' }}>
                      {t.tags.map(tag => (
                        <span key={tag} style={{ ...S.tag, fontSize: '10px', marginRight: '3px' }}>{tag}</span>
                      ))}
                    </div>
                  </>
                ) : null;
              })()}
            </div>
            <div>
              <div style={{ color: '#c8a96e', fontSize: '13px', marginBottom: '6px' }}>🌊 Inner Art</div>
              <div style={{ color: '#e8c87e', fontSize: '14px' }}>{INNER_ARTS[selectedLineage.innerArt].name}</div>
              <div style={{ color: '#c8a96eaa', fontSize: '11px', marginTop: '4px' }}>
                {INNER_ARTS[selectedLineage.innerArt].passive}
              </div>
            </div>
            <div>
              <div style={{ color: '#c8a96e', fontSize: '13px', marginBottom: '6px' }}>🦋 Movement Art</div>
              <div style={{ color: '#e8c87e', fontSize: '14px' }}>{MOVEMENT_ARTS[selectedLineage.movementArt].name}</div>
              <div style={{ color: '#c8a96eaa', fontSize: '11px', marginTop: '4px' }}>
                {MOVEMENT_ARTS[selectedLineage.movementArt].passive}
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        style={{ ...S.startBtn, opacity: (selected && selectedLineage && !isLocked(selectedLineage)) ? 1 : 0.4 }}
        onClick={handleStart}
        onMouseEnter={e => { if (selected) e.target.style.background = '#c8a96e22'; }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; }}
        disabled={!selected || !selectedLineage || isLocked(selectedLineage)}
      >
        踏上征途 · Begin This Life
      </button>
      <button style={S.backBtn} onClick={() => actions.setPhase('title')}>← Return</button>
    </div>
  );
}
