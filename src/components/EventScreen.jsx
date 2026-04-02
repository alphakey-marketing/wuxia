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
    maxWidth: '600px',
    background: '#1e1508',
    border: '1px solid #c8a96e44',
    borderRadius: '4px',
    padding: '32px',
    position: 'relative'
  },
  eventIcon: { fontSize: '32px', marginBottom: '16px', display: 'block', textAlign: 'center' },
  title: { fontSize: '22px', color: '#e8c87e', textAlign: 'center', marginBottom: '20px', letterSpacing: '0.1em' },
  divider: { height: '1px', background: 'linear-gradient(to right, transparent, #c8a96e, transparent)', marginBottom: '20px' },
  description: { fontSize: '14px', color: '#c8a96ecc', lineHeight: '1.7', marginBottom: '30px', textAlign: 'center' },
  choices: { display: 'flex', flexDirection: 'column', gap: '10px' },
  choiceBtn: {
    padding: '14px 20px',
    background: '#2a1e10',
    border: '1px solid #c8a96e44',
    color: '#e8c87e',
    fontSize: '14px',
    fontFamily: 'serif',
    cursor: 'pointer',
    borderRadius: '2px',
    textAlign: 'left',
    transition: 'all 0.2s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  outcomePreview: { fontSize: '11px', color: '#c8a96e88' }
};

function formatOutcome(outcome) {
  const parts = [];
  if (outcome.healHp) parts.push(`+${outcome.healHp} HP`);
  if (outcome.silver) parts.push(`${outcome.silver > 0 ? '+' : ''}${outcome.silver} silver`);
  if (outcome.essence) parts.push(`+${outcome.essence} essence`);
  if (outcome.hpMax) parts.push(`+${outcome.hpMax} max HP`);
  if (outcome.technique) parts.push('+ Technique');
  if (outcome.relic) parts.push('+ Relic');
  if (outcome.memorySeal) parts.push('Memory Seal');
  if (outcome.karma) {
    Object.entries(outcome.karma).forEach(([k, v]) => parts.push(`${k} ${v > 0 ? '+' : ''}${v}`));
  }
  return parts.join(' · ');
}

const EVENT_ICONS = {
  E_PHYSICIAN: '🏥', E_MANUAL_THIEF: '📜', E_SECT_INVITATION: '🏯',
  E_FORBIDDEN_CAVE: '🕳️', E_WANDERING_BEGGAR: '🧓', E_RIVAL_ENCOUNTER: '⚔️',
  E_BURNING_VILLAGE: '🔥', E_WANDERING_MASTER: '🧙', E_BLACK_MARKET: '🛒',
  E_PRISONER: '⛓️', E_SECT_TRIAL: '🎯', E_GHOST_STORY: '👻'
};

export default function EventScreen() {
  const { state, actions } = useGame();
  const event = state.pendingEvent;

  if (!event) {
    return (
      <div style={S.container}>
        <p>No event loaded.</p>
        <button onClick={() => actions.setPhase('nodeMap')}>Return to Map</button>
      </div>
    );
  }

  const handleChoice = (choice) => {
    actions.completeEvent(choice.outcome);
  };

  return (
    <div style={S.container}>
      <div style={S.panel}>
        <span style={S.eventIcon}>{EVENT_ICONS[event.id] || '📜'}</span>
        <div style={S.title}>{event.name}</div>
        <div style={S.divider} />
        <p style={S.description}>{event.description}</p>
        <div style={S.choices}>
          {event.choices.map((choice, i) => (
            <button
              key={i}
              style={S.choiceBtn}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c8a96e'; e.currentTarget.style.background = '#3a2a18'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#c8a96e44'; e.currentTarget.style.background = '#2a1e10'; }}
              onClick={() => handleChoice(choice)}
            >
              <span>{choice.text}</span>
              <span style={S.outcomePreview}>{formatOutcome(choice.outcome)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
