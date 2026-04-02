import { useGame } from '../store/gameStore.jsx';

const S = {
  container: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse at center, #2a1a08 0%, #1a1208 60%, #0d0a06 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#c8a96e',
    fontFamily: 'serif',
    position: 'relative',
    overflow: 'hidden'
  },
  inkBorder: {
    position: 'absolute',
    inset: 0,
    border: '2px solid #c8a96e22',
    pointerEvents: 'none'
  },
  cornerTL: { position: 'absolute', top: 20, left: 20, fontSize: '32px', opacity: 0.3, color: '#c8a96e' },
  cornerTR: { position: 'absolute', top: 20, right: 20, fontSize: '32px', opacity: 0.3, color: '#c8a96e' },
  cornerBL: { position: 'absolute', bottom: 20, left: 20, fontSize: '32px', opacity: 0.3, color: '#c8a96e' },
  cornerBR: { position: 'absolute', bottom: 20, right: 20, fontSize: '32px', opacity: 0.3, color: '#c8a96e' },
  mainTitle: {
    fontSize: 'clamp(48px, 8vw, 80px)',
    color: '#e8c87e',
    textShadow: '0 0 30px #c8a96e66, 0 2px 4px #000',
    letterSpacing: '0.15em',
    marginBottom: '8px',
    fontWeight: 'normal'
  },
  subtitle: {
    fontSize: 'clamp(14px, 2.5vw, 18px)',
    color: '#c8a96e',
    letterSpacing: '0.3em',
    marginBottom: '60px',
    opacity: 0.85
  },
  divider: {
    width: '200px',
    height: '1px',
    background: 'linear-gradient(to right, transparent, #c8a96e, transparent)',
    marginBottom: '60px'
  },
  startBtn: {
    padding: '16px 48px',
    background: 'transparent',
    border: '1px solid #c8a96e',
    color: '#e8c87e',
    fontSize: '18px',
    fontFamily: 'serif',
    letterSpacing: '0.2em',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative'
  },
  archiveBtn: {
    marginTop: '20px',
    padding: '10px 32px',
    background: 'transparent',
    border: '1px solid #c8a96e44',
    color: '#c8a96e',
    fontSize: '14px',
    fontFamily: 'serif',
    letterSpacing: '0.15em',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  versionText: {
    position: 'absolute',
    bottom: 30,
    color: '#c8a96e44',
    fontSize: '11px',
    letterSpacing: '0.1em'
  },
  flavorText: {
    color: '#c8a96e66',
    fontSize: '13px',
    letterSpacing: '0.2em',
    marginTop: '80px',
    fontStyle: 'italic'
  }
};

export default function TitleScreen() {
  const { actions } = useGame();

  return (
    <div style={S.container}>
      <div style={S.inkBorder} />
      <span style={S.cornerTL}>╔</span>
      <span style={S.cornerTR}>╗</span>
      <span style={S.cornerBL}>╚</span>
      <span style={S.cornerBR}>╝</span>

      <h1 style={S.mainTitle}>重生江湖</h1>
      <p style={S.subtitle}>一生一劍 · One Life, One Blade</p>
      <div style={S.divider} />

      <button
        style={S.startBtn}
        onMouseEnter={e => {
          e.target.style.background = '#c8a96e22';
          e.target.style.boxShadow = '0 0 20px #c8a96e44';
        }}
        onMouseLeave={e => {
          e.target.style.background = 'transparent';
          e.target.style.boxShadow = 'none';
        }}
        onClick={() => actions.setPhase('lineageSelect')}
      >
        踏入江湖 · Begin Your Life
      </button>

      <button
        style={S.archiveBtn}
        onMouseEnter={e => { e.target.style.borderColor = '#c8a96e'; e.target.style.color = '#e8c87e'; }}
        onMouseLeave={e => { e.target.style.borderColor = '#c8a96e44'; e.target.style.color = '#c8a96e'; }}
        onClick={() => actions.setPhase('sectArchive')}
      >
        宗門典籍 · Sect Archive
      </button>

      <p style={S.flavorText}>Every life ends. Every scar is inherited.</p>
      <p style={S.versionText}>Rebirth of Jianghu · v0.1</p>
    </div>
  );
}
