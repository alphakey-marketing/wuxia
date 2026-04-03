import { useGame } from '../store/gameStore.jsx';
import PhaserGame from '../game/PhaserGame.jsx';

const S = {
  container: {
    minHeight: '100vh',
    background: '#1a1208',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'serif',
    color: '#c8a96e'
  },
  header: {
    width: '100%',
    maxWidth: '600px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  enemyTitle: { fontSize: '18px', color: '#e8c87e' },
  enemyType: (type) => ({
    fontSize: '12px',
    color: type === 'boss' ? '#8b1a1a' : type === 'elite' ? '#6b2a6b' : '#c8a96e88',
    letterSpacing: '0.1em'
  }),
  gameWrapper: {
    width: '100%',
    maxWidth: '600px',
    border: '1px solid #c8a96e44',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  relicStrip: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
    padding: '6px',
    background: 'rgba(26,18,8,0.8)',
    borderTop: '1px solid #c8a96e22'
  },
  relicIcon: {
    fontSize: '16px',
    padding: '2px 4px',
    background: '#2a1e10',
    border: '1px solid #c8a96e33',
    borderRadius: '2px',
    cursor: 'default',
    minWidth: '28px',
    textAlign: 'center'
  },
  karmaBar: {
    display: 'flex',
    gap: '8px',
    justifyContent: 'center',
    padding: '4px 8px',
    background: 'rgba(26,18,8,0.8)'
  },
  karmaDot: (val) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: val > 0 ? '#6abf6a' : val < 0 ? '#bf6a6a' : '#555',
    border: `1px solid ${val > 0 ? '#4a8b4a' : val < 0 ? '#8b4a4a' : '#444'}`,
    display: 'inline-block'
  }),
  karmaLabel: { fontSize: '9px', color: '#c8a96e55', letterSpacing: '0.05em' }
};

const KARMA_LABELS = { mercy: '仁', honor: '義', ambition: '志', orthodoxy: '道', renown: '名' };
const RELIC_TYPE_ICONS = {
  Offensive: '⚔', Defensive: '🛡', Sustain: '💚', Counter: '↩', Technique: '📜',
  Economy: '💰', Frost: '❄', Fire: '🔥', Shadow: '👤', AoE: '💥',
  Thunder: '⚡', Pierce: '🔱', Utility: '✨', Manual: '📖', Meta: '🌟'
};

export default function CombatScreen() {
  const { state, actions } = useGame();
  const { runState, currentEnemy } = state;

  if (!currentEnemy) {
    return (
      <div style={S.container}>
        <p>No enemy encountered. Something went wrong.</p>
        <button onClick={() => actions.setPhase('nodeMap')} style={{ color: '#e8c87e', background: 'none', border: '1px solid #c8a96e', padding: '10px 20px', cursor: 'pointer', fontFamily: 'serif' }}>
          Return to Map
        </button>
      </div>
    );
  }

  const handleCombatEnd = (result) => {
    // Handle boss spare dialogue result — set run flag before completing combat
    if (result.sparedBoss && result.bossId === 'B01') {
      actions.setRunFlag('spared_iron_fan_widow', true);
      // Karma reward for sparing
      result.karmaBonus = { mercy: 1 };
    } else if (result.sparedBoss === false && result.bossId === 'B01') {
      result.karmaBonus = { renown: 1 };
    }
    actions.completeCombat(result);
  };

  const typeLabel = currentEnemy.type === 'boss' ? '— BOSS —' : currentEnemy.type === 'elite' ? '— Elite —' : '— Standard —';

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div>
          <div style={S.enemyTitle}>{currentEnemy.name}</div>
          <div style={S.enemyType(currentEnemy.type)}>{typeLabel}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#c8a96e88' }}>
          <div>Node {runState.currentNode + 1}</div>
          <div style={{ color: '#e8c87e' }}>HP: {runState.hp}/{runState.maxHp}</div>
        </div>
      </div>
      <div style={S.gameWrapper}>
        <PhaserGame
          enemy={currentEnemy}
          playerStats={runState}
          weapon={runState.weapon}
          innerArt={runState.innerArt}
          movementArt={runState.movementArt}
          techniques={runState.techniques}
          relics={runState.relics}
          burningMeridianStacks={runState.burningMeridianStacks}
          onCombatEnd={handleCombatEnd}
        />
        {runState.relics.length > 0 && (
          <div style={S.relicStrip}>
            {runState.relics.map(r => (
              <div key={r.id} style={S.relicIcon} title={`${r.name}: ${r.description}`}>
                {RELIC_TYPE_ICONS[r.type] || '💎'}
              </div>
            ))}
          </div>
        )}
        <div style={S.karmaBar}>
          {Object.entries(runState.karma).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={S.karmaDot(v)} title={`${k}: ${v > 0 ? '+' : ''}${v}`} />
              <span style={S.karmaLabel}>{KARMA_LABELS[k] || k}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#c8a96e44', textAlign: 'center' }}>
        {currentEnemy.behavior}
      </div>
    </div>
  );
}
