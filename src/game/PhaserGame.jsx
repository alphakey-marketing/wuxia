import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { CombatScene } from './CombatScene.js';

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
    transition: 'background 0.2s'
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed'
  },
  btnUltimate: {
    background: '#3a1a00',
    borderColor: '#ff8800'
  },
  cooldownBar: {
    height: '3px',
    background: '#c8a96e',
    transition: 'width 0.1s',
    marginTop: '2px',
    borderRadius: '2px'
  }
};

export default function PhaserGame({ enemy, playerStats, weapon, onCombatEnd }) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [cooldowns, setCooldowns] = useState({ skill1: 0, skill1Max: 5, ultimate: 0, ultimateMax: 10 });
  const [combatStats, setCombatStats] = useState({ playerQi: 0, playerMaxQi: 100 });

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

    game.events.once('ready', () => {
      const scene = game.scene.getScene('CombatScene');
      sceneRef.current = scene;
      scene.scene.start('CombatScene', {
        playerHp: playerStats.hp,
        playerMaxHp: playerStats.maxHp,
        playerQi: playerStats.qi,
        playerAttack: playerStats.attack,
        critChance: playerStats.critChance,
        enemy,
        weapon,
        onCombatEnd: (result) => {
          game.destroy(true);
          onCombatEnd(result);
        }
      });
    });

    return () => {
      if (game && !game.isDestroyed) game.destroy(true);
    };
  }, []);

  const handleSkill1 = () => {
    const scene = sceneRef.current;
    if (scene && scene.useSkill1) scene.useSkill1();
  };

  const handleUltimate = () => {
    const scene = sceneRef.current;
    if (scene && scene.useUltimate) scene.useUltimate();
  };

  const handleDash = () => {
    const scene = sceneRef.current;
    if (scene && scene.useDash) scene.useDash();
  };

  const skill1Pct = cooldowns.skill1 > 0 ? ((cooldowns.skill1Max - cooldowns.skill1) / cooldowns.skill1Max) * 100 : 100;
  const ultPct = combatStats.playerQi / (combatStats.playerMaxQi || 100) * 100;

  return (
    <div style={STYLES.wrapper}>
      <div ref={containerRef} style={STYLES.canvas} />
      <div style={STYLES.controls}>
        <div style={{ textAlign: 'center' }}>
          <button
            style={{ ...STYLES.btn, ...(cooldowns.skill1 > 0 ? STYLES.btnDisabled : {}) }}
            onClick={handleSkill1}
            disabled={cooldowns.skill1 > 0}
          >
            {weapon?.skill?.name || 'Skill 1'}
            {cooldowns.skill1 > 0 && <span style={{ display: 'block', fontSize: '10px' }}>{cooldowns.skill1.toFixed(1)}s</span>}
          </button>
          <div style={{ ...STYLES.cooldownBar, width: `${skill1Pct}%` }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <button style={STYLES.btn} onClick={handleDash}>
            Dash
          </button>
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
