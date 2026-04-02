import { useGame } from '../store/gameStore.jsx';
import { detectSynergies } from '../utils/synergies.js';

const S = {
  container: {
    width: '100%',
    maxWidth: '900px',
    background: '#1e1508',
    border: '1px solid #c8a96e33',
    borderRadius: '4px',
    padding: '16px',
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  section: { flex: 1, minWidth: '160px' },
  sectionTitle: { fontSize: '11px', color: '#c8a96e66', letterSpacing: '0.15em', marginBottom: '8px', textTransform: 'uppercase' },
  item: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  itemName: { fontSize: '13px', color: '#e8c87e' },
  itemSub: { fontSize: '11px', color: '#c8a96e88' },
  tag: {
    display: 'inline-block',
    padding: '1px 6px',
    background: '#2a1a00',
    border: '1px solid #c8a96e33',
    borderRadius: '2px',
    fontSize: '10px',
    color: '#c8a96e',
    marginRight: '3px'
  },
  synergyTag: {
    display: 'inline-block',
    padding: '2px 8px',
    background: '#1a2a1a',
    border: '1px solid #4a8b4a',
    borderRadius: '2px',
    fontSize: '11px',
    color: '#6abf6a',
    marginRight: '4px',
    marginBottom: '4px'
  },
  stats: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  stat: { textAlign: 'center' },
  statVal: { fontSize: '16px', color: '#e8c87e', display: 'block' },
  statLabel: { fontSize: '10px', color: '#c8a96e66' },
  karmaRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' },
  karmaItem: (val) => ({
    fontSize: '11px',
    color: val > 0 ? '#6abf6a' : val < 0 ? '#bf4a4a' : '#c8a96e66',
    padding: '2px 6px',
    background: val > 0 ? '#1a2a1a' : val < 0 ? '#2a1a1a' : '#1a1508',
    border: `1px solid ${val > 0 ? '#4a8b4a33' : val < 0 ? '#8b4a4a33' : '#c8a96e22'}`,
    borderRadius: '2px'
  })
};

export default function BuildSummary() {
  const { state } = useGame();
  const { runState } = state;
  const synergies = detectSynergies(runState.techniques);

  return (
    <div style={S.container}>
      <div style={S.section}>
        <div style={S.sectionTitle}>Stats</div>
        <div style={S.stats}>
          {[
            ['HP', `${runState.hp}/${runState.maxHp}`],
            ['ATK', runState.attack],
            ['DEF', runState.defense],
            ['CRIT', `${Math.round(runState.critChance * 100)}%`],
            ['Silver', runState.silver]
          ].map(([label, val]) => (
            <div key={label} style={S.stat}>
              <span style={S.statVal}>{val}</span>
              <span style={S.statLabel}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '8px' }}>
          <div style={S.sectionTitle}>Karma</div>
          <div style={S.karmaRow}>
            {Object.entries(runState.karma).map(([k, v]) => (
              <span key={k} style={S.karmaItem(v)}>{k}: {v > 0 ? '+' : ''}{v}</span>
            ))}
          </div>
        </div>
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Build</div>
        {runState.weapon && (
          <div style={S.item}>
            <span>⚔</span>
            <div>
              <div style={S.itemName}>{runState.weapon.name} ({runState.weapon.nameZh})</div>
              <div style={S.itemSub}>{runState.weapon.tags.map(t => <span key={t} style={S.tag}>{t}</span>)}</div>
            </div>
          </div>
        )}
        {runState.innerArt && (
          <div style={S.item}>
            <span>🌊</span>
            <div style={S.itemName}>{runState.innerArt.name}</div>
          </div>
        )}
        {runState.movementArt && (
          <div style={S.item}>
            <span>🦋</span>
            <div style={S.itemName}>{runState.movementArt.name}</div>
          </div>
        )}
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Techniques ({runState.techniques.length}/6)</div>
        {runState.techniques.length === 0 && <div style={S.itemSub}>None yet</div>}
        {runState.techniques.map(t => (
          <div key={t.id} style={{ marginBottom: '4px' }}>
            <span style={S.itemName}>{t.name}</span>
            <span style={{ marginLeft: '6px' }}>{t.tags.map(tag => <span key={tag} style={S.tag}>{tag}</span>)}</span>
          </div>
        ))}
        {synergies.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={S.sectionTitle}>Active Synergies</div>
            {synergies.map((s, i) => <span key={i} style={S.synergyTag}>✦ {s.name}</span>)}
          </div>
        )}
      </div>

      <div style={S.section}>
        <div style={S.sectionTitle}>Relics ({runState.relics.length}/4)</div>
        {runState.relics.length === 0 && <div style={S.itemSub}>None yet</div>}
        {runState.relics.map(r => (
          <div key={r.id} style={{ marginBottom: '4px' }}>
            <div style={S.itemName}>{r.name}</div>
            <div style={S.itemSub}>{r.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
