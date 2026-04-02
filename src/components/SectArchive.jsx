import { useGame } from '../store/gameStore.jsx';
import { SECT_ARCHIVE } from '../data/sectArchive.js';

const TIER_LABELS = {
  tier1: '第一層 · Tier I — Foundation Scrolls',
  tier2: '第二層 · Tier II — Advanced Paths',
  tier3: '第三層 · Tier III — Forbidden Knowledge'
};

const S = {
  container: {
    minHeight: '100vh',
    background: '#1a1208',
    padding: '30px 20px',
    fontFamily: 'serif',
    color: '#c8a96e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '26px', color: '#e8c87e', letterSpacing: '0.2em' },
  essenceDisplay: {
    marginTop: '8px',
    fontSize: '16px',
    color: '#c8a96e',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center'
  },
  essenceVal: { fontSize: '22px', color: '#e8c87e' },
  content: { width: '100%', maxWidth: '900px' },
  tierSection: { marginBottom: '30px' },
  tierTitle: { fontSize: '14px', color: '#c8a96e88', letterSpacing: '0.15em', marginBottom: '12px', borderBottom: '1px solid #c8a96e22', paddingBottom: '8px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' },
  card: (unlocked, affordable) => ({
    background: unlocked ? '#1a2a1a' : affordable ? '#1e1508' : '#1a1508',
    border: `1px solid ${unlocked ? '#4a8b4a' : affordable ? '#c8a96e44' : '#c8a96e22'}`,
    borderRadius: '4px',
    padding: '16px',
    opacity: unlocked ? 0.8 : 1
  }),
  cardName: (unlocked) => ({ fontSize: '14px', color: unlocked ? '#6abf6a' : '#e8c87e', marginBottom: '6px' }),
  cardEffect: { fontSize: '12px', color: '#c8a96eaa', lineHeight: '1.4', marginBottom: '10px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cost: (affordable, unlocked) => ({
    fontSize: '13px',
    color: unlocked ? '#4a8b4a' : affordable ? '#e8c87e' : '#8b4a4a'
  }),
  unlockBtn: (canAfford, unlocked) => ({
    padding: '6px 14px',
    background: 'transparent',
    border: `1px solid ${unlocked ? '#4a8b4a' : canAfford ? '#c8a96e' : '#333'}`,
    color: unlocked ? '#4a8b4a' : canAfford ? '#e8c87e' : '#555',
    fontSize: '11px',
    fontFamily: 'serif',
    cursor: canAfford && !unlocked ? 'pointer' : 'default',
    borderRadius: '2px',
    transition: 'all 0.2s'
  }),
  newLifeBtn: {
    marginTop: '20px',
    padding: '14px 48px',
    background: 'transparent',
    border: '1px solid #c8a96e',
    color: '#e8c87e',
    fontSize: '16px',
    fontFamily: 'serif',
    letterSpacing: '0.2em',
    cursor: 'pointer',
    display: 'block',
    margin: '20px auto 0'
  },
  backBtn: {
    display: 'block',
    margin: '10px auto',
    padding: '10px 32px',
    background: 'transparent',
    border: '1px solid #c8a96e44',
    color: '#c8a96e',
    fontSize: '13px',
    fontFamily: 'serif',
    cursor: 'pointer'
  }
};

export default function SectArchive() {
  const { state, actions } = useGame();
  const { metaState } = state;
  const { legacyEssence, unlockedItems } = metaState;

  const handleUnlock = (item) => {
    if (unlockedItems.includes(item.unlocks)) return;
    if (legacyEssence < item.cost) return;
    actions.unlockSectItem(item.unlocks, item.cost);
  };

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>宗門典籍 · Sect Archive</div>
        <div style={S.essenceDisplay}>
          <span>Legacy Essence:</span>
          <span style={S.essenceVal}>{legacyEssence}</span>
          <span style={{ fontSize: '12px', color: '#c8a96e66' }}>✦</span>
        </div>
      </div>

      <div style={S.content}>
        {Object.entries(SECT_ARCHIVE).map(([tier, items]) => (
          <div key={tier} style={S.tierSection}>
            <div style={S.tierTitle}>{TIER_LABELS[tier]}</div>
            <div style={S.grid}>
              {items.map(item => {
                const unlocked = unlockedItems.includes(item.unlocks);
                const affordable = legacyEssence >= item.cost;
                return (
                  <div key={item.id} style={S.card(unlocked, affordable)}>
                    <div style={S.cardName(unlocked)}>
                      {unlocked ? '✓ ' : ''}{item.name}
                    </div>
                    <div style={S.cardEffect}>{item.effect}</div>
                    <div style={S.cardFooter}>
                      <span style={S.cost(affordable, unlocked)}>
                        {unlocked ? 'Unlocked' : `${item.cost} Essence`}
                      </span>
                      {!unlocked && (
                        <button
                          style={S.unlockBtn(affordable, unlocked)}
                          onClick={() => handleUnlock(item)}
                          disabled={!affordable}
                        >
                          {affordable ? 'Unlock' : 'Need more'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        style={S.newLifeBtn}
        onMouseEnter={e => { e.target.style.background = '#c8a96e22'; }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; }}
        onClick={() => actions.setPhase('title')}
      >
        返回 · Return to Title
      </button>
      <button style={S.backBtn} onClick={() => actions.setPhase('lineageSelect')}>
        ⚔ Begin New Life
      </button>
    </div>
  );
}
