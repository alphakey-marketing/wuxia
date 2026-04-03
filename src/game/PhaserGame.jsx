import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { CombatScene } from './CombatScene.js';
import { detectSynergies } from '../utils/synergies.js';

const STYLES = {
  wrapper: {
    position: 'relative',
    width: '100%',
    maxWidth: '600px',
    margin: '0 auto'
  },
  canvas: {
    display: 'block',
    width: '100%'
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px',
    background: 'rgba(26,18,8,0.95)',
    borderTop: '1px solid #c8a96e44'
  },
  btn: {
    padding: '10px 18px',
    background: '#2a1e10',
    border: '1px solid #c8a96e',
    color: '#e8c87e',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'serif',
    minWidth: '80px',
    minHeight: '44px',
    transition: 'background 0.2s'
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed'
  },
  btnSkill2: {
    background: '#1a2a3a',
    borderColor: '#4a8bcc'
  },
  btnUltimate: {
    background: '#3a1a00',
    borderColor: '#ff8800'
  },
  btnDash: {
    background: '#1a2a1a',
    borderColor: '#4a8b4a'
  },
  cooldownBar: {
    height: '3px',
    background: '#c8a96e',
    transition: 'width 0.1s',
    marginTop: '2px',
    borderRadius: '2px'
  },
  bossDialogue: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(10,6,2,0.92)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    padding: '30px'
  },
  dialogueTitle: { fontSize: '18px', color: '#e8c87e', marginBottom: '12px', letterSpacing: '0.15em' },
  dialogueText: { fontSize: '13px', color: '#c8a96e', lineHeight: '1.7', textAlign: 'center', marginBottom: '24px', fontStyle: 'italic' },
  dialogueBtn: (variant) => ({
    padding: '12px 28px',
    background: variant === 'spare' ? '#1a2a1a' : '#2a1a1a',
    border: `1px solid ${variant === 'spare' ? '#6abf6a' : '#bf6a6a'}`,
    color: variant === 'spare' ? '#6abf6a' : '#bf6a6a',
    fontFamily: 'serif',
    fontSize: '13px',
    cursor: 'pointer',
    margin: '4px',
    minWidth: '140px',
    minHeight: '44px'
  })
};

export default function PhaserGame({ enemy, playerStats, weapon, innerArt, movementArt, techniques, relics, burningMeridianStacks, onCombatEnd }) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const onCombatEndRef = useRef(onCombatEnd);
  useEffect(() => { onCombatEndRef.current = onCombatEnd; }, [onCombatEnd]);
  const [cooldowns, setCooldowns] = useState({ skill1: 0, skill1Max: 5, skill2: 0, skill2Max: 8, ultimate: 0, ultimateMax: 10, dash: 0, dashMax: 3, burningStacks: 0, interruptWindow: false });
  const [combatStats, setCombatStats] = useState({ playerQi: 0, playerMaxQi: 100 });
  const [pendingBossResult, setPendingBossResult] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config = {
      type: Phaser.AUTO,
      width: 600,
      height: 400,
      parent: containerRef.current,
      backgroundColor: '#1a1208',
      scene: [CombatScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    game.events.on('cooldownUpdate', (data) => setCooldowns(data));
    game.events.on('statsUpdate', (data) => setCombatStats(data));

    // Boss karma dialogue intercept
    game.events.on('bossDefeated', (result) => {
      const karma = playerStats?.karma || {};
      // B01: mercy ≥ 2 opens spare dialogue
      if (result.bossId === 'B01' && (karma.mercy || 0) >= 2) {
        setPendingBossResult(result);
      } else {
        // No karma link applicable — proceed directly
        game.destroy(true);
        onCombatEndRef.current(result);
      }
    });

    const activeSynergies = techniques ? detectSynergies(techniques) : [];

    game.events.once('ready', () => {
      const scene = game.scene.getScene('CombatScene');
      sceneRef.current = scene;
      scene.scene.start('CombatScene', {
        playerHp: playerStats.hp,
        playerMaxHp: playerStats.maxHp,
        playerQi: playerStats.qi,
        playerAttack: playerStats.attack,
        playerDefense: playerStats.defense,
        critChance: playerStats.critChance,
        critPower: playerStats.critPower,
        enemy,
        weapon,
        innerArt,
        movementArt,
        techniques: techniques || [],
        relics: relics || [],
        activeSynergies,
        burningMeridianStacks: burningMeridianStacks || 0,
        karma: playerStats?.karma || {},
        onCombatEnd: null  // not used — bossDefeated event handles boss; non-boss uses onCombatEnd directly
      });
      // Wire non-boss onCombatEnd for standard/elite victories
      scene.onCombatEnd = (result) => {
        if (!result.bossId) {
          game.destroy(true);
          onCombatEndRef.current(result);
        }
        // Boss victories handled via bossDefeated event
      };
    });

    return () => {
      if (game && !game.isDestroyed) game.destroy(true);
    };
  }, []);

  const handleSkill1 = () => {
    const scene = sceneRef.current;
    if (scene && scene.useSkill1) scene.useSkill1();
  };

  const handleSkill2 = () => {
    const scene = sceneRef.current;
    if (scene && scene.useSkill2) scene.useSkill2();
  };

  const handleUltimate = () => {
    const scene = sceneRef.current;
    if (scene && scene.useUltimate) scene.useUltimate();
  };

  const handleDash = () => {
    const scene = sceneRef.current;
    if (scene && scene.useDash) scene.useDash();
  };

  const handleSpare = () => {
    if (!pendingBossResult) return;
    const result = { ...pendingBossResult, sparedBoss: true };
    setPendingBossResult(null);
    if (gameRef.current && !gameRef.current.isDestroyed) gameRef.current.destroy(true);
    onCombatEndRef.current(result);
  };

  const handleExecute = () => {
    if (!pendingBossResult) return;
    const result = { ...pendingBossResult, sparedBoss: false };
    setPendingBossResult(null);
    if (gameRef.current && !gameRef.current.isDestroyed) gameRef.current.destroy(true);
    onCombatEndRef.current(result);
  };

  const skill1Pct = cooldowns.skill1 > 0 ? ((cooldowns.skill1Max - cooldowns.skill1) / cooldowns.skill1Max) * 100 : 100;
  const skill2Pct = cooldowns.skill2 > 0 ? ((cooldowns.skill2Max - cooldowns.skill2) / cooldowns.skill2Max) * 100 : 100;
  const dashPct = cooldowns.dash > 0 ? ((cooldowns.dashMax - cooldowns.dash) / cooldowns.dashMax) * 100 : 100;
  const ultPct = combatStats.playerQi / (combatStats.playerMaxQi || 100) * 100;
  const skill2Name = innerArt?.ultimate?.name || 'Skill 2';
  const skill2Disabled = cooldowns.skill2 > 0;

  return (
    <div style={STYLES.wrapper}>
      <div ref={containerRef} style={STYLES.canvas} />
      {pendingBossResult && (
        <div style={STYLES.bossDialogue}>
          <div style={STYLES.dialogueTitle}>⚖ A Moment of Choice</div>
          <div style={STYLES.dialogueText}>
            {pendingBossResult.bossId === 'B01'
              ? 'Iron Fan Widow kneels in the dust, her fan shattered. She looks up at you — her eyes hold no more fury, only exhaustion. Your merciful heart stirs. She wronged you, but perhaps she was also wronged.\n\nDo you spare her life?'
              : 'Your enemy is defeated. What is your choice?'}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button style={STYLES.dialogueBtn('spare')} onClick={handleSpare}>
              🕊 Spare Her
              <span style={{ display: 'block', fontSize: '10px', opacity: 0.7 }}>Sets Memory Seal · +Mercy</span>
            </button>
            <button style={STYLES.dialogueBtn('execute')} onClick={handleExecute}>
              ⚔ Execute Her
              <span style={{ display: 'block', fontSize: '10px', opacity: 0.7 }}>+Renown · Beggar's Union favour</span>
            </button>
          </div>
        </div>
      )}
      <div style={STYLES.controls}>
        <div style={{ textAlign: 'center' }}>
          <button
            style={{ ...STYLES.btn, ...(cooldowns.skill1 > 0 ? STYLES.btnDisabled : {}), ...(cooldowns.interruptWindow ? { borderColor: '#ff8800', boxShadow: '0 0 6px #ff880088' } : {}) }}
            onClick={handleSkill1}
            disabled={cooldowns.skill1 > 0}
          >
            {weapon?.skill?.name || 'Skill 1'}
            {cooldowns.skill1 > 0 && <span style={{ display: 'block', fontSize: '10px' }}>{cooldowns.skill1.toFixed(1)}s</span>}
          </button>
          <div style={{ ...STYLES.cooldownBar, width: `${skill1Pct}%` }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            style={{ ...STYLES.btn, ...STYLES.btnSkill2, ...(skill2Disabled ? STYLES.btnDisabled : {}) }}
            onClick={handleSkill2}
            disabled={skill2Disabled}
          >
            {skill2Name}
            {cooldowns.skill2 > 0 && <span style={{ display: 'block', fontSize: '10px' }}>{cooldowns.skill2.toFixed(1)}s</span>}
            {innerArt?.id === 'burningMeridian' && <span style={{ display: 'block', fontSize: '10px', color: '#ff8800' }}>🔥×{cooldowns.burningStacks}</span>}
          </button>
          <div style={{ ...STYLES.cooldownBar, background: '#4a8bcc', width: `${skill2Pct}%` }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            style={{ ...STYLES.btn, ...STYLES.btnDash, ...(cooldowns.dash > 0 ? STYLES.btnDisabled : {}) }}
            onClick={handleDash}
            disabled={cooldowns.dash > 0}
          >
            {movementArt?.name || 'Dash'}
            {cooldowns.dash > 0 && <span style={{ display: 'block', fontSize: '10px' }}>{cooldowns.dash.toFixed(1)}s</span>}
          </button>
          <div style={{ ...STYLES.cooldownBar, background: '#4a8b4a', width: `${dashPct}%` }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <button
            style={{
              ...STYLES.btn,
              ...STYLES.btnUltimate,
              ...(combatStats.playerQi < 80 || cooldowns.ultimate > 0 ? STYLES.btnDisabled : {})
            }}
            onClick={handleUltimate}
            disabled={combatStats.playerQi < 80 || cooldowns.ultimate > 0}
          >
            Ultimate
            <span style={{ display: 'block', fontSize: '10px' }}>
              {Math.round(combatStats.playerQi || 0)}/{combatStats.playerMaxQi || 100} Qi
            </span>
          </button>
          <div style={{ ...STYLES.cooldownBar, background: '#ff8800', width: `${ultPct}%` }} />
        </div>
      </div>
    </div>
  );
}
