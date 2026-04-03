import { useGame } from '../store/gameStore.jsx';

const IMPRINT_FLAVOUR = {
  compassionate: '"A merciful heart left footprints on the jianghu. Even the winds grew gentle in your wake."',
  blood_handed: '"The rivers ran red with remembered debts. Your name is spoken quietly, and doors are locked."',
  righteous: '"A righteous blade — even the heavens bowed. Your name is carved in the stones of righteous halls."',
  schemer: '"Every shadow held a hidden move. The jianghu respects power, and cunning is its sharpest edge."',
  driven: '"Ambition carved its name into legend. The mountain yields to those who refuse to be stopped."',
  grandmaster: '"The old ways endure through those who honour them. The masters nod from the other side of the veil."',
  forbidden: '"What the sects forbade, this fist remembered. The forbidden path leaves marks that cannot be washed away."',
  legend: '"Songs were sung of this swordsman for three generations. Even enemies hummed the melody."',
  feared: '"Even the wind stepped aside on this road. Your shadow was enough to empty a village square."'
};

function getKarmaFlavour(karma, fateImprint) {
  if (fateImprint && IMPRINT_FLAVOUR[fateImprint]) return IMPRINT_FLAVOUR[fateImprint];
  const { mercy, honor, ambition, orthodoxy } = karma;
  if (mercy >= 3) return '"Your kindness left marks on the road — even stones remember."';
  if (mercy <= -2) return '"A warrior who abandons the fallen walks alone."';
  if (honor >= 3) return '"Your name is spoken with reverence in halls you never entered."';
  if (ambition >= 3) return '"Hunger for greatness is also a fire that can burn you."';
  if (orthodoxy <= -2) return '"The forbidden path leaves its mark. The jianghu whispers your name with fear."';
  return '"Every life is a brushstroke on the canvas of the jianghu."';
}

const S = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at center, #1a1208 0%, #0d0a06 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    fontFamily: 'serif',
    color: '#c8a96e'
  },
  title: { fontSize: '32px', color: '#e8c87e', letterSpacing: '0.3em', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#c8a96e66', letterSpacing: '0.2em', marginBottom: '40px' },
  panel: {
    width: '100%',
    maxWidth: '700px',
    background: '#1e1508',
    border: '1px solid #c8a96e44',
    borderRadius: '4px',
    padding: '30px',
    marginBottom: '24px'
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statBox: { textAlign: 'center', padding: '12px', background: '#1a1208', borderRadius: '2px' },
  statVal: { fontSize: '24px', color: '#e8c87e', display: 'block' },
  statLabel: { fontSize: '11px', color: '#c8a96e88', letterSpacing: '0.1em' },
  sectionTitle: { fontSize: '13px', color: '#c8a96e88', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' },
  divider: { height: '1px', background: '#c8a96e22', marginBottom: '20px', marginTop: '20px' },
  inheritSlot: (hasItem) => ({
    padding: '12px 16px',
    background: hasItem ? '#2a1e10' : '#1a1208',
    border: `1px solid ${hasItem ? '#c8a96e44' : '#c8a96e22'}`,
    borderRadius: '2px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  }),
  slotIcon: { fontSize: '18px' },
  slotName: { fontSize: '13px', color: '#e8c87e' },
  slotDesc: { fontSize: '11px', color: '#c8a96e88' },
  karmaGrid: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  karmaItem: (val) => ({
    padding: '6px 12px',
    background: val > 0 ? '#1a2a1a' : val < 0 ? '#2a1a1a' : '#1a1208',
    border: `1px solid ${val > 0 ? '#4a8b4a44' : val < 0 ? '#8b4a4a44' : '#c8a96e22'}`,
    borderRadius: '2px',
    fontSize: '12px',
    color: val > 0 ? '#6abf6a' : val < 0 ? '#bf6a6a' : '#c8a96e66',
    textAlign: 'center'
  }),
  flavorText: { fontSize: '13px', color: '#c8a96e88', fontStyle: 'italic', textAlign: 'center', padding: '16px', borderTop: '1px solid #c8a96e22', marginTop: '16px' },
  nextLifeBtn: {
    padding: '16px 48px',
    background: 'transparent',
    border: '1px solid #c8a96e',
    color: '#e8c87e',
    fontSize: '18px',
    fontFamily: 'serif',
    letterSpacing: '0.2em',
    cursor: 'pointer',
    marginBottom: '12px',
    transition: 'all 0.2s'
  },
  archiveBtn: {
    padding: '10px 32px',
    background: 'transparent',
    border: '1px solid #c8a96e44',
    color: '#c8a96e',
    fontSize: '13px',
    fontFamily: 'serif',
    cursor: 'pointer'
  }
};

export default function LegacyScreen() {
  const { state, actions } = useGame();
  const { runState, metaState } = state;

  const inheritedTechnique = runState.techniques.length > 0 ? runState.techniques[0] : null;

  const handleNextLife = () => {
    actions.chooseInheritance(inheritedTechnique, null);
  };

  const handleArchive = () => {
    actions.endRun();
  };

  return (
    <div style={S.container}>
      <div style={S.title}>此生終結</div>
      <div style={S.subtitle}>This Life Has Ended · The Jianghu Remembers</div>

      <div style={S.panel}>
        <div style={S.statsGrid}>
          {[
            ['⚔', runState.combatStats.enemiesDefeated, 'Enemies Defeated'],
            ['💀', runState.combatStats.bossesDefeated, 'Bosses Slain'],
            ['💥', runState.combatStats.totalDamage, 'Total Damage'],
            ['📜', runState.techniques.length, 'Techniques'],
            ['💎', runState.relics.length, 'Relics'],
            ['🌟', runState.legacyEssence, 'Essence Earned']
          ].map(([icon, val, label]) => (
            <div key={label} style={S.statBox}>
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <span style={S.statVal}>{val}</span>
              <span style={S.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div style={S.divider} />

        <div style={S.sectionTitle}>Karma Legacy</div>
        <div style={S.karmaGrid}>
          {Object.entries(runState.karma).map(([k, v]) => (
            <div key={k} style={S.karmaItem(v)}>
              <div style={{ fontSize: '11px', textTransform: 'capitalize' }}>{k}</div>
              <div style={{ fontSize: '16px' }}>{v > 0 ? '+' : ''}{v}</div>
            </div>
          ))}
        </div>

        <div style={S.divider} />

        <div style={S.sectionTitle}>Inheritance — What Passes to the Next Life</div>
        <div style={S.inheritSlot(!!inheritedTechnique)}>
          <span style={S.slotIcon}>📜</span>
          <div>
            <div style={S.slotName}>{inheritedTechnique ? inheritedTechnique.name : 'No technique to inherit'}</div>
            <div style={S.slotDesc}>{inheritedTechnique ? inheritedTechnique.description : 'Study harder in your next life'}</div>
          </div>
        </div>
        <div style={S.inheritSlot(false)}>
          <span style={S.slotIcon}>⭐</span>
          <div>
            <div style={S.slotName}>Sect Archive Essence: +{runState.legacyEssence}</div>
            <div style={S.slotDesc}>Will be added to your Sect Archive</div>
          </div>
        </div>

        {runState.weapon && (
          <div style={S.inheritSlot(true)}>
            <span style={S.slotIcon}>⚔</span>
            <div>
              <div style={S.slotName}>This Life's Path: {runState.weapon.name}</div>
              <div style={S.slotDesc}>Enemies defeated: {runState.combatStats.enemiesDefeated}</div>
            </div>
          </div>
        )}

        {metaState?.fateImprint && (
          <div style={{ ...S.inheritSlot(true), background: '#2a1a2a', border: '1px solid #6b2a6b44' }}>
            <span style={S.slotIcon}>🌟</span>
            <div>
              <div style={{ ...S.slotName, color: '#c88bcc' }}>
                Fate Imprint: {metaState.fateImprint.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div style={S.slotDesc}>This imprint carries into your next life</div>
            </div>
          </div>
        )}

        <div style={S.flavorText}>{getKarmaFlavour(runState.karma, metaState?.fateImprint)}</div>
      </div>

      <button
        style={S.nextLifeBtn}
        onClick={handleNextLife}
        onMouseEnter={e => { e.target.style.background = '#c8a96e22'; }}
        onMouseLeave={e => { e.target.style.background = 'transparent'; }}
      >
        再入江湖 · Begin the Next Life
      </button>
      <button style={S.archiveBtn} onClick={handleArchive}>
        宗門典籍 · Visit Sect Archive
      </button>
    </div>
  );
}
