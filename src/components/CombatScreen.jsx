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
  }
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
          onCombatEnd={handleCombatEnd}
        />
      </div>
      <div style={{ marginTop: '10px', fontSize: '11px', color: '#c8a96e44', textAlign: 'center' }}>
        {currentEnemy.behavior}
      </div>
    </div>
  );
}
