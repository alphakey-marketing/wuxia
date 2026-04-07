import { useState } from 'react';
import { useGame } from '../store/gameStore.jsx';

const KARMA_LEGEND = [
  { key: 'mercy',     label: '仁 Mercy',     color: '#6acc6a', desc: 'Affects boss spare dialogues & "Compassionate" Fate Imprint (≥+3). Required for some healing events.' },
  { key: 'honor',     label: '義 Honor',     color: '#cc9944', desc: 'Required for Sect Trial (≥0). High honor → "Righteous" Fate Imprint. Low honor closes orthodox paths.' },
  { key: 'ambition',  label: '志 Ambition',  color: '#cc4444', desc: 'Earned by challenging masters. High ambition → "Driven" Fate Imprint. Unlocks power at a cost.' },
  { key: 'orthodoxy', label: '道 Orthodoxy', color: '#4a88cc', desc: 'Required for Wandering Master teaching & Sect Trial (≥0). Low orthodoxy (≤-2) → forbidden techniques & "Forbidden" Imprint.' },
  { key: 'renown',    label: '名 Renown',    color: '#cc88cc', desc: 'Built by public deeds & duels. High renown → "Legend" Fate Imprint; very low → "Feared".' }
];

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
  if (outcome.technique) parts.push('+ Technique (requires open slot)');
  if (outcome.relic) parts.push('+ Relic (requires open slot)');
  if (outcome.memorySeal) parts.push('📌 Memory Seal (carries to next life)');
  if (outcome.techniqueShard) parts.push('+ Technique Shard (½ bonus next run)');
  if (outcome.shop) parts.push('🛒 Open Shop');
  if (outcome.karma) {
    const KARMA_SHORT = { mercy:'仁 Mercy', honor:'義 Honor', ambition:'志 Ambition', orthodoxy:'道 Orthodoxy', renown:'名 Renown' };
    Object.entries(outcome.karma).forEach(([k, v]) => parts.push(`${KARMA_SHORT[k] || k} ${v > 0 ? '+' : ''}${v}`));
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
  const runState = state.runState;
  const [showKarmaLegend, setShowKarmaLegend] = useState(false);

  if (!event) {
    return (
      <div style={S.container}>
        <p>No event loaded.</p>
        <button onClick={() => actions.setPhase('nodeMap')}>Return to Map</button>
      </div>
    );
  }

  const handleChoice = (choice) => {
    const outcome = { ...choice.outcome };
    // Karma requirement can be inside outcome.requiresKarma (E_FORBIDDEN_CAVE)
    // or at top-level choice.karmaRequirement (E_SECT_TRIAL)
    const karmaReq = choice.outcome?.requiresKarma || choice.karmaRequirement;
    if (karmaReq && runState?.karma) {
      const meetsReq = Object.entries(karmaReq).every(
        ([axis, minVal]) => (runState.karma[axis] || 0) >= minVal
      );
      if (!meetsReq) {
        const failOutcome = event.failureOutcome || { karma: { honor: -1 }, hpLoss: 20 };
        actions.completeEvent(failOutcome);
        return;
      }
    }
    actions.completeEvent(outcome);
  };

  return (
    <div style={S.container}>
      <div style={S.panel}>
        <span style={S.eventIcon}>{EVENT_ICONS[event.id] || '📜'}</span>
        <div style={S.title}>{event.name}</div>
        <div style={S.divider} />
        <p style={S.description}>{event.description}</p>
        <div style={S.choices}>
          {event.choices.map((choice, i) => {
            const karmaReq = choice.outcome?.requiresKarma || choice.karmaRequirement;
            const meetsKarma = !karmaReq || !runState?.karma || Object.entries(karmaReq).every(
              ([axis, minVal]) => (runState.karma[axis] || 0) >= minVal
            );
            const karmaHint = karmaReq && !meetsKarma
              ? Object.entries(karmaReq).map(([axis, val]) => `${axis} ≥ ${val}`).join(', ')
              : null;
            return (
              <button
                key={i}
                style={{ ...S.choiceBtn, ...(karmaHint ? { borderColor: '#8b4a4a66', opacity: 0.75 } : {}) }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = karmaHint ? '#8b4a4a' : '#c8a96e'; e.currentTarget.style.background = '#3a2a18'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = karmaHint ? '#8b4a4a66' : '#c8a96e44'; e.currentTarget.style.background = '#2a1e10'; }}
                onClick={() => handleChoice(choice)}
              >
                <span>{choice.text}{karmaHint && <span style={{ fontSize: '10px', color: '#bf6a6a', marginLeft: '6px' }}>⚠ requires {karmaHint}</span>}</span>
                <span style={S.outcomePreview}>{formatOutcome(choice.outcome)}</span>
              </button>

            );
          })}
        </div>

        {/* Karma legend toggle */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #c8a96e11', paddingTop: '10px' }}>
          <button
            style={{ background: 'none', border: 'none', color: '#c8a96e44', fontSize: '11px', cursor: 'pointer', fontFamily: 'serif', padding: '0' }}
            onClick={() => setShowKarmaLegend(s => !s)}
          >
            {showKarmaLegend ? '▲' : '▼'} What does karma do?
          </button>
          {showKarmaLegend && (
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {KARMA_LEGEND.map(k => (
                <div key={k.key} style={{ fontSize: '11px', color: '#c8a96e88', lineHeight: '1.5', borderLeft: `2px solid ${k.color}55`, paddingLeft: '8px' }}>
                  <span style={{ color: k.color, fontWeight: 'bold' }}>{k.label}</span>
                  <span style={{ display: 'block', fontSize: '10px', color: '#c8a96e55' }}>{k.desc}</span>
                </div>
              ))}
              <div style={{ fontSize: '10px', color: '#c8a96e44', fontStyle: 'italic', marginTop: '4px' }}>
                Memory Seal: choosing certain paths leaves a permanent mark. The seal carries to your next life and unlocks a unique event.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
