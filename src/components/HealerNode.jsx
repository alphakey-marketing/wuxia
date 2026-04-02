import { useGame } from '../store/gameStore.jsx';

const S = {
  container: {
    minHeight: '100vh',
    background: '#1a1208',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: 'serif',
    color: '#c8a96e'
  },
  panel: {
    width: '100%',
    maxWidth: '480px',
    background: '#1e1508',
    border: '1px solid #2d5a2744',
    borderRadius: '4px',
    padding: '32px',
    textAlign: 'center'
  },
  icon: { fontSize: '48px', marginBottom: '16px', display: 'block' },
  title: { fontSize: '22px', color: '#e8c87e', marginBottom: '8px' },
  subtitle: { fontSize: '13px', color: '#c8a96e88', marginBottom: '24px' },
  hpDisplay: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '24px',
    fontSize: '16px'
  },
  hpBar: { height: '8px', background: '#1a1208', borderRadius: '4px', margin: '8px 0', overflow: 'hidden', border: '1px solid #c8a96e33' },
  hpFill: (pct) => ({ width: `${pct}%`, height: '100%', background: '#2d5a27', transition: 'width 0.3s' }),
  healOption: {
    padding: '16px 20px',
    background: '#2a1e10',
    border: '1px solid #c8a96e44',
    borderRadius: '2px',
    marginBottom: '10px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s',
    width: '100%',
    fontFamily: 'serif',
    color: '#e8c87e',
    fontSize: '14px'
  },
  costLabel: { fontSize: '12px', color: '#c8a96e88' },
  passBtn: {
    marginTop: '10px',
    padding: '10px 32px',
    background: 'transparent',
    border: '1px solid #c8a96e44',
    color: '#c8a96e',
    fontSize: '13px',
    fontFamily: 'serif',
    cursor: 'pointer'
  }
};

const HEAL_OPTIONS = [
  { label: 'Light Treatment', costPct: 0, cost: 20, healPct: 0.3, description: 'Restore 30% max HP' },
  { label: 'Full Mending', costPct: 0, cost: 45, healPct: 0.7, description: 'Restore 70% max HP' }
];

export default function HealerNode() {
  const { state, actions } = useGame();
  const { runState } = state;
  const hpPct = (runState.hp / runState.maxHp) * 100;

  return (
    <div style={S.container}>
      <div style={S.panel}>
        <span style={S.icon}>💊</span>
        <div style={S.title}>山中醫士 · Mountain Healer</div>
        <div style={S.subtitle}>An old physician tends to wanderers on this path</div>

        <div style={S.hpDisplay}>
          <span>HP: <strong style={{ color: '#e8c87e' }}>{runState.hp}/{runState.maxHp}</strong></span>
          <span style={{ color: '#c8a96e88' }}>Silver: {runState.silver}</span>
        </div>
        <div style={S.hpBar}>
          <div style={S.hpFill(hpPct)} />
        </div>

        <div style={{ marginTop: '24px', marginBottom: '8px', fontSize: '13px', color: '#c8a96e88' }}>Choose a treatment:</div>

        {HEAL_OPTIONS.map(option => {
          const canAfford = runState.silver >= option.cost;
          return (
            <button
              key={option.label}
              style={{ ...S.healOption, opacity: canAfford ? 1 : 0.5, cursor: canAfford ? 'pointer' : 'not-allowed' }}
              onClick={() => canAfford && actions.healAtHealer(option.cost)}
              onMouseEnter={e => { if (canAfford) e.currentTarget.style.borderColor = '#2d5a27'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#c8a96e44'; }}
              disabled={!canAfford}
            >
              <div style={{ textAlign: 'left' }}>
                <div>{option.label}</div>
                <div style={{ fontSize: '11px', color: '#c8a96eaa', marginTop: '2px' }}>{option.description}</div>
              </div>
              <span style={S.costLabel}>{option.cost} silver</span>
            </button>
          );
        })}

        <button style={S.passBtn} onClick={() => actions.setPhase('nodeMap')}>
          Continue without treatment
        </button>
      </div>
    </div>
  );
}
