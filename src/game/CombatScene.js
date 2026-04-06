import Phaser from 'phaser';
import { calculateDamage, calculateCrit, calculateStanceBreak, rollCrit } from '../utils/combat.js';
import heroImg from '../assets/hero.png';

export class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CombatScene' });
    this.playerHp = 120;
    this.playerMaxHp = 120;
    this.playerQi = 0;
    this.playerMaxQi = 100;
    this.playerDefense = 4;
    this.critChance = 0.08;
    this.critPower = 1.5;
    this.enemyHp = 100;
    this.enemyMaxHp = 100;
    this.playerAttack = 10;
    this.enemyAttack = 8;
    this.enemyAttackTimer = null;
    this.autoAttackTimer = null;
    this.onCombatEnd = null;
    this.combatEnded = false;
    this.hitCount = 0;
    // Build
    this.weapon = null;
    this.innerArt = null;
    this.movementArt = null;
    this.techniques = [];
    this.relics = [];
    this.activeSynergies = [];
    this.burningMeridianStacks = 0;
    // Dash / iframe
    this.isDashing = false;
    this.dashCooldownTimer = 0;
    this.dashCooldownValue = 3;
    this.timeSinceLastEnemyAttack = 999;
    this.dodgeAttackWindow = false;
    // Skill 2
    this.skill2Timer = 0;
    this.skill2CooldownValue = 8;
    this.frozenHitBonus = 0; // Absolute Zero next-3-hits bonus
    this.frozenHitCount = 0;
    this.frozenHeartCooldown = 0;
    this.enemyFrozen = false;
    this.enemyFreezeTimer = 0;
    // Enemy attack sequence
    this.attackSequenceIndex = 0;
    this.pendingInterrupt = false;
    this.interruptWindow = false;
    this.interruptTimer = 0;
    this.pendingUnblockable = false;
    // Phase
    this.enemyPhase = 1;
    this.phaseTransitioned = false;
    // Stance break
    this.enemyStanceHealth = 0;
    this.enemyStanceBroken = false;
    this.enemyStanceBlockActive = false;
    // Totals
    this.totalDamage = 0;
  }

  init(data) {
    this.playerHp = data.playerHp || 120;
    this.playerMaxHp = data.playerMaxHp || 120;
    this.playerQi = data.playerQi || 0;
    this.playerAttack = data.playerAttack || 10;
    this.playerDefense = data.playerDefense || 4;
    this.critChance = data.critChance || 0.08;
    this.critPower = data.critPower || 1.5;
    this.enemyData = data.enemy || { hp: 100, attack: 8, name: 'Enemy' };
    this.enemyHp = this.enemyData.hp;
    this.enemyMaxHp = this.enemyData.hp;
    this.enemyAttack = this.enemyData.attack;
    this.onCombatEnd = data.onCombatEnd;
    this.combatEnded = false;
    this.weapon = data.weapon || null;
    this.innerArt = data.innerArt || null;
    this.movementArt = data.movementArt || null;
    this.techniques = data.techniques || [];
    this.relics = data.relics || [];
    this.activeSynergies = data.activeSynergies || [];
    this.burningMeridianStacks = data.burningMeridianStacks || 0;
    this.totalDamage = 0;
    this.skill1CooldownValue = data.weapon?.skill?.cooldown || 5;
    this.skill1Timer = 0;
    this.ultimateTimer = 0;
    this.ultimateCooldownValue = 10;
    this.skill2Timer = 0;
    this.skill2CooldownValue = this.innerArt?.ultimate?.cooldown || 8;
    this.hitCount = 0;
    this.dashCooldownTimer = 0;
    this.dashCooldownValue = this.movementArt?.cooldown || 3;
    this.attackSequenceIndex = 0;
    this.enemyPhase = 1;
    this.phaseTransitioned = false;
    this.frozenHitBonus = 0;
    this.frozenHitCount = 0;
    this.frozenHeartCooldown = 0;
    this.enemyFrozen = false;
    this.enemyFreezeTimer = 0;
    this.timeSinceLastEnemyAttack = 999;
    this.isDashing = false;
    this.dodgeAttackWindow = false;
    // Stance break: enemies with purple indicators have a stance health pool
    const hasStance = (this.enemyData.indicators || []).includes('purple');
    this.enemyStanceHealth = hasStance ? 3 : 0;
    this.enemyStanceBroken = false;
    this.enemyStanceBlockActive = hasStance;
    // R12 relic: heal 10% at fight start
    if (this.relics.some(r => r.id === 'R12')) {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + Math.floor(this.playerMaxHp * 0.1));
    }
    // Ghost Assassin vanish tracking
    this.ghostVanishTimer = 0;
    this.ghostIsVanished = false;
    this.pendingInterrupt = false;
    this.interruptWindow = false;
    this.interruptTimer = 0;
    this.pendingUnblockable = false;
    // Combat readiness — set to true after intro animation completes
    this.combatReady = false;
    // Twin Blade Widow split tracking
    this.splitOccurred = false;
    // Drunken Drift dodge window tracking
    this.dodgeAttackWindow = false;
    // R06 relic: low HP counter bonus tracking
    this.vengefulRibbonReady = this.relics.some(r => r.id === 'R06');
    // R05 relic: dodge stack
    this.blackBoneFanDodges = 0;
    // R18 relic: once-per-run lethal save
    this.foxCharmUsed = false;
    // Drunken Swordsman dodge tracking
    this.drunkenSwordsDodgeChance = this.enemyData.id === 'E09' ? 0.30 : 0;
    // Boss karma links
    this.initKarma = data.karma || {};
  }

  preload() {
    this.load.image('hero', heroImg);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.combatReady = false;

    // ── BACKGROUND ────────────────────────────────────────────────
    // Main dark base
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a1208);
    // Sky gradient layers
    this.add.rectangle(W / 2, H * 0.1, W, H * 0.2, 0x110b05, 1);
    this.add.rectangle(W / 2, H * 0.88, W, H * 0.24, 0x0d0904, 1);

    // Distant mountain silhouettes
    const mtns = this.add.graphics();
    mtns.fillStyle(0x0f0c07, 1);
    mtns.fillTriangle(60, H * 0.58, 190, H * 0.22, 310, H * 0.58);
    mtns.fillTriangle(230, H * 0.58, 380, H * 0.26, 510, H * 0.58);
    mtns.fillTriangle(380, H * 0.58, 530, H * 0.30, 640, H * 0.58);

    // Ground / floor
    const ground = this.add.graphics();
    ground.fillStyle(0x221508, 1);
    ground.fillRect(0, H * 0.56, W, H * 0.44);
    ground.lineStyle(1, 0xc8a96e, 0.35);
    ground.lineBetween(0, H * 0.56, W, H * 0.56);
    // Subtle floor-tile lines
    const tiles = this.add.graphics();
    tiles.lineStyle(1, 0xc8a96e, 0.08);
    for (let i = 0; i <= 8; i++) tiles.lineBetween(i * (W / 7), H * 0.56, i * (W / 7) + 60, H);

    // Enemy platform ellipse
    const plat = this.add.graphics();
    plat.fillStyle(0x3a2810, 0.55);
    plat.fillEllipse(W / 2, H * 0.56, W * 0.45, 18);
    plat.lineStyle(1, 0xc8a96e, 0.3);
    plat.strokeEllipse(W / 2, H * 0.56, W * 0.45, 18);

    // Ink-brush border + corner ornaments
    const border = this.add.graphics();
    border.lineStyle(2, 0xc8a96e, 0.6);
    border.strokeRect(10, 10, W - 20, H - 20);
    border.lineStyle(1, 0xc8a96e, 0.35);
    [[16, 16], [W - 36, 16], [16, H - 36], [W - 36, H - 36]].forEach(([bx, by]) => border.strokeRect(bx, by, 20, 20));

    // ── ENEMY HEADER ─────────────────────────────────────────────
    const typeLabel = this.enemyData.type === 'boss' ? '★ BOSS ★' : this.enemyData.type === 'elite' ? '◆ ELITE' : '';
    if (typeLabel) {
      this.add.text(W / 2, 18, typeLabel, {
        fontSize: '10px', color: this.enemyData.type === 'boss' ? '#ff6666' : '#cc88ff', fontFamily: 'serif'
      }).setOrigin(0.5, 0);
    }
    this.add.text(W / 2, typeLabel ? 30 : 20, this.enemyData.name, {
      fontSize: '17px', color: '#e8c87e', fontFamily: 'serif'
    }).setOrigin(0.5, 0);

    // Enemy HP bar
    const eHpW = 240;
    this.enemyHpBg = this.add.rectangle(W / 2, H * 0.13, eHpW, 14, 0x111111);
    this.enemyHpBg.setStrokeStyle(1, 0xc8a96e, 0.4);
    this.enemyHpBar = this.add.rectangle(W / 2 - eHpW / 2, H * 0.13, eHpW, 14, 0x8b1a1a).setOrigin(0, 0.5);
    this.add.text(W / 2 - eHpW / 2 - 5, H * 0.13, '◆', { fontSize: '10px', color: '#8b1a1a' }).setOrigin(1, 0.5);
    this.enemyHpText = this.add.text(W / 2, H * 0.13, `${this.enemyHp}/${this.enemyMaxHp}`, {
      fontSize: '10px', color: '#e8c87e'
    }).setOrigin(0.5);

    // ── STANCE DOTS ───────────────────────────────────────────────
    this.stanceDots = [];
    if (this.enemyStanceHealth > 0) {
      for (let i = 0; i < this.enemyStanceHealth; i++) {
        const dot = this.add.circle(W / 2 - 20 + i * 20, H * 0.19, 5, 0xaa44aa);
        dot.setStrokeStyle(1, 0xcc88cc, 0.8);
        this.stanceDots.push(dot);
      }
      this.add.text(W / 2, H * 0.23, 'STANCE', { fontSize: '9px', color: '#aa44aa' }).setOrigin(0.5);
    }

    // Attack indicator ring
    this.attackIndicator = this.add.circle(W / 2, H * 0.38, 54, 0xffff00, 0);
    this.attackIndicator.setStrokeStyle(3, 0xffff00, 0);

    // Burning Meridian stacks label
    this.stackLabel = null;
    if (this.innerArt?.id === 'burningMeridian') {
      this.stackLabel = this.add.text(W - 10, H * 0.38, `🔥×${this.burningMeridianStacks}`, {
        fontSize: '11px', color: '#ff8800', fontFamily: 'serif'
      }).setOrigin(1, 0.5);
    }

    // ── ENEMY CHARACTER (human-like Graphics silhouette) ──────────
    const eW = this.enemyData.type === 'boss' ? 78 : this.enemyData.type === 'elite' ? 64 : 54;
    const eHs = this.enemyData.type === 'boss' ? 100 : this.enemyData.type === 'elite' ? 86 : 72;
    this.enemyW = eW;
    this.enemyH = eHs;
    // Draw the character; returns a Graphics object positioned at (W/2, H*0.38)
    this.enemySprite = this.drawEnemyCharacter(W / 2, H * 0.38, this.enemyData.type, eW, eHs);
    // Separate freeze-tint overlay (hidden by default)
    this.enemyFreezeOverlay = this.add.rectangle(W / 2, H * 0.38, eW + 12, eHs + 8, 0x88aaff, 0.45);
    this.enemyFreezeOverlay.setVisible(false);

    // ── PLAYER SPRITE (hero.png) ──────────────────────────────────
    this.playerSprite = this.add.image(W / 2, H * 0.67, 'hero').setDisplaySize(54, 76);

    // Weapon label under player
    const wEmoji = { sword: '⚔', spear: '⚡', fists: '👊' }[this.weapon?.id] || '⚔';
    this.add.text(W / 2, H * 0.75, `${wEmoji} ${this.weapon?.name || 'Fighter'}`, {
      fontSize: '11px', color: '#c8a96e88', fontFamily: 'serif'
    }).setOrigin(0.5);

    // ── PLAYER HP BAR ─────────────────────────────────────────────
    const pHpW = 220;
    this.playerHpBg = this.add.rectangle(W / 2, H * 0.81, pHpW, 14, 0x111111);
    this.playerHpBg.setStrokeStyle(1, 0x4a7a44, 0.4);
    this.playerHpBar = this.add.rectangle(W / 2 - pHpW / 2, H * 0.81, pHpW, 14, 0x2d5a27).setOrigin(0, 0.5);
    this.add.text(W / 2 - pHpW / 2 - 5, H * 0.81, '♥', { fontSize: '12px', color: '#6abf6a' }).setOrigin(1, 0.5);
    this.playerHpText = this.add.text(W / 2, H * 0.81, `${this.playerHp}/${this.playerMaxHp}`, {
      fontSize: '10px', color: '#e8c87e'
    }).setOrigin(0.5);

    // Qi bar
    this.qiBg = this.add.rectangle(W / 2, H * 0.86, pHpW, 8, 0x111111);
    this.qiBg.setStrokeStyle(1, 0x4a6e9e, 0.3);
    this.qiBar = this.add.rectangle(W / 2 - pHpW / 2, H * 0.86, 0, 8, 0x4a6e9e).setOrigin(0, 0.5);
    this.add.text(W / 2 - pHpW / 2 - 5, H * 0.86, '氣', { fontSize: '10px', color: '#6a9ec0' }).setOrigin(1, 0.5);

    // ── TIMERS (start paused — unlocked after intro) ──────────────
    this.autoAttackTimer = this.time.addEvent({
      delay: 1500, callback: this.doAutoAttack, callbackScope: this, loop: true, paused: true
    });
    this.enemyAttackTimer = this.time.addEvent({
      delay: 2500, callback: this.doEnemyAttack, callbackScope: this, loop: true, paused: true
    });
    this.time.addEvent({
      delay: 100, callback: this.updateCooldowns, callbackScope: this, loop: true
    });

    // ── INTRO ANIMATION ───────────────────────────────────────────
    // Entrance flash
    const introFlash = this.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0.6);
    this.tweens.add({ targets: introFlash, alpha: 0, duration: 350, onComplete: () => introFlash.destroy() });

    // Enemy character fades in with slight scale pop
    this.enemySprite.setAlpha(0);
    this.enemySprite.setScale(0.75);
    this.tweens.add({ targets: this.enemySprite, alpha: 1, scaleX: 1, scaleY: 1, duration: 580, delay: 60, ease: 'Back.easeOut' });

    // Player slides in from below
    this.playerSprite.setY(H + 80);
    this.tweens.add({ targets: this.playerSprite, y: H * 0.67, duration: 650, delay: 180, ease: 'Back.easeOut' });

    // "BATTLE START" banner after sprites land
    this.time.delayedCall(900, () => {
      const bannerBg = this.add.rectangle(W / 2, H / 2, W, 58, 0x0d0800, 0.95);
      bannerBg.setStrokeStyle(2, 0xc8a96e, 0.7);
      const bannerTxt = this.add.text(W / 2, H / 2, '— 戰鬥開始 · BATTLE START —', {
        fontSize: '15px', color: '#e8c87e', fontFamily: 'serif', letterSpacing: 3
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({ targets: [bannerBg, bannerTxt], alpha: { from: 0, to: 1 }, duration: 220 });
      this.tweens.add({
        targets: [bannerBg, bannerTxt], alpha: 0, duration: 280, delay: 850,
        onComplete: () => { bannerBg.destroy(); bannerTxt.destroy(); }
      });
    });

    // Unlock combat after intro
    this.time.delayedCall(2100, () => {
      this.combatReady = true;
      this.autoAttackTimer.paused = false;
      this.enemyAttackTimer.paused = false;
    });

    this.updateBars();
    this.emitBuildInfo();
  }

  emitBuildInfo() {
    if (this.game.events) {
      this.game.events.emit('buildInfo', {
        techniques: this.techniques,
        relics: this.relics,
        innerArt: this.innerArt,
        movementArt: this.movementArt,
        activeSynergies: this.activeSynergies
      });
    }
  }

  // Draw a human-like wuxia warrior character using Phaser Graphics in LOCAL coordinates.
  // The Graphics object is positioned at (cx, cy); all drawing commands use offsets from that origin.
  drawEnemyCharacter(cx, cy, type, w, h) {
    const g = this.add.graphics();
    g.setPosition(cx, cy); // Character center in world space; drawing is relative to (0,0)

    const topY = -h / 2;
    const botY = h / 2;
    const headR = Math.round(h * 0.13);       // Head radius ~9-13 px
    const headCY = topY + headR * 2 + 2;      // Head center Y (local)
    const robeTop = headCY + headR + 3;       // Top of robe / body
    const tHW = w * 0.25;                     // Robe half-width at top
    const bHW = w * 0.44;                     // Robe half-width at bottom

    // Color palette
    const bodyC   = type === 'boss' ? 0x660000 : type === 'elite' ? 0x2a0048 : 0x3a2010;
    const accentC = type === 'boss' ? 0xcc3333 : type === 'elite' ? 0x9933cc : 0x886633;
    const skinC   = 0xd4956a;
    const hairC   = type === 'boss' ? 0x1a0000 : type === 'elite' ? 0x120028 : 0x1a0e00;
    const eyeC    = type === 'boss' ? 0xff2200 : type === 'elite' ? 0xcc44ff : 0xff8800;
    const weaponC = type === 'boss' ? 0xccaa44 : type === 'elite' ? 0xaa99cc : 0x998866;

    // Ground shadow
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(0, botY + 3, w * 0.7, 7);

    // ── BOSS GLAIVE (behind body) ───────────────────────────────
    if (type === 'boss') {
      g.lineStyle(3, weaponC, 1);
      g.lineBetween(-bHW * 0.3, robeTop + 6, -bHW * 0.75, botY - 6);
      g.lineBetween(-bHW * 0.3, robeTop + 6, -bHW * 0.1, topY + 2);
      g.fillStyle(weaponC, 1);
      g.fillTriangle(-bHW * 0.45, topY, -bHW * 0.05, topY - 16, -bHW * 0.05, topY + 5);
    }

    // ── ROBE (trapezoid = two triangles) ────────────────────────
    g.fillStyle(bodyC, 1);
    g.fillTriangle(-tHW, robeTop, tHW, robeTop, -bHW, botY);
    g.fillTriangle(tHW, robeTop, -bHW, botY, bHW, botY);

    // Collar V-overlap
    g.fillStyle(accentC, 0.22);
    g.fillTriangle(-tHW * 0.5, robeTop - 1, tHW * 0.5, robeTop - 1, 0, robeTop + Math.round(h * 0.2));

    // Center seam
    g.lineStyle(1, accentC, 0.4);
    g.lineBetween(0, robeTop + 4, 0, botY - 4);

    // Belt + knot
    const beltY = robeTop + (botY - robeTop) * 0.38;
    const beltHW = tHW + (bHW - tHW) * 0.38;
    g.lineStyle(2, accentC, 0.9);
    g.lineBetween(-beltHW + 2, beltY, beltHW - 2, beltY);
    g.fillStyle(accentC, 0.85);
    g.fillCircle(0, beltY, 3);

    // Robe hem
    g.lineStyle(1, accentC, 0.4);
    g.lineBetween(-bHW + 2, botY, bHW - 2, botY);

    // ── SHOULDER PAULDRONS (elite / boss) ───────────────────────
    if (type === 'elite' || type === 'boss') {
      const pX = tHW + 3;
      g.fillStyle(accentC, 0.82);
      g.fillTriangle(-pX, robeTop + 3, -pX - 10, robeTop + 6, -pX, robeTop + 18);
      g.fillTriangle(pX, robeTop + 3, pX + 10, robeTop + 6, pX, robeTop + 18);
      g.lineStyle(1, 0xffffff, 0.2);
      g.lineBetween(-pX, robeTop + 3, -pX - 10, robeTop + 6);
      g.lineBetween(-pX - 10, robeTop + 6, -pX, robeTop + 18);
      g.lineBetween(pX, robeTop + 3, pX + 10, robeTop + 6);
      g.lineBetween(pX + 10, robeTop + 6, pX, robeTop + 18);
    }

    // ── SWORD / WEAPON (standard + elite, right side) ───────────
    if (type !== 'boss') {
      const sX = bHW * 0.5 + 4;
      g.lineStyle(2.5, weaponC, 0.9);
      g.lineBetween(sX, robeTop - 2, sX + 8, botY - 14);
      // Guard crosspiece
      g.lineStyle(3, weaponC, 1);
      g.lineBetween(sX - 5, robeTop + 14, sX + 13, robeTop + 10);
      // Pommel
      g.fillStyle(weaponC, 1);
      g.fillCircle(sX + 8, botY - 13, 3);
    }

    // ── NECK ────────────────────────────────────────────────────
    g.fillStyle(skinC, 1);
    g.fillRect(-3, headCY + headR - 2, 6, 6);

    // ── HAIR VOLUMES (drawn behind face) ────────────────────────
    g.fillStyle(hairC, 1);
    g.fillCircle(-headR * 0.75, headCY + headR * 0.1, headR * 0.5);
    g.fillCircle(headR * 0.75, headCY + headR * 0.1, headR * 0.5);

    // ── FACE ────────────────────────────────────────────────────
    g.fillStyle(skinC, 1);
    g.fillCircle(0, headCY, headR);

    // Eyebrows
    g.lineStyle(1.5, hairC, 1);
    g.lineBetween(-headR * 0.5, headCY - headR * 0.32, -headR * 0.1, headCY - headR * 0.42);
    g.lineBetween(headR * 0.1, headCY - headR * 0.42, headR * 0.5, headCY - headR * 0.32);

    // Eyes (colored iris + black pupil)
    g.fillStyle(eyeC, 1);
    g.fillCircle(-headR * 0.35, headCY - headR * 0.04, 2.5);
    g.fillCircle(headR * 0.35, headCY - headR * 0.04, 2.5);
    g.fillStyle(0x000000, 0.7);
    g.fillCircle(-headR * 0.35, headCY - headR * 0.04, 1.2);
    g.fillCircle(headR * 0.35, headCY - headR * 0.04, 1.2);

    // Mouth line
    g.lineStyle(1, hairC, 0.5);
    g.lineBetween(-headR * 0.2, headCY + headR * 0.5, headR * 0.2, headCY + headR * 0.5);

    // ── HEADPIECE / TOPKNOT ──────────────────────────────────────
    if (type === 'boss') {
      // Imperial crown
      g.fillStyle(0xddcc33, 1);
      g.fillRect(-headR - 2, headCY - headR - 2, (headR + 2) * 2, 4);
      // Three crown spikes
      [-headR * 0.5, 0, headR * 0.5].forEach((dx, i) => {
        const sh = i === 1 ? 14 : 9;
        g.fillTriangle(dx - 4, headCY - headR - 2, dx + 4, headCY - headR - 2, dx, headCY - headR - 2 - sh);
      });
      g.fillStyle(0xff2244, 1);
      g.fillCircle(0, headCY - headR - 14, 4); // Crown gem
      // Beard
      g.fillStyle(hairC, 0.8);
      g.fillTriangle(-headR * 0.35, headCY + headR * 0.5, headR * 0.35, headCY + headR * 0.5, 0, headCY + headR + 5);
    } else {
      // Topknot bun + hairpin
      g.fillStyle(hairC, 1);
      const stemBot = headCY - headR + 2;
      const stemTop = topY + 3;
      g.fillCircle(0, stemTop + 5, 5);
      g.fillRect(-2, stemTop + 4, 4, stemBot - stemTop - 3);
      g.lineStyle(1, type === 'elite' ? accentC : 0x998844, 0.85);
      g.lineBetween(-7, stemTop + 5, 7, stemTop + 2);
    }

    // Elite: forehead bindi mark
    if (type === 'elite') {
      g.fillStyle(accentC, 0.9);
      g.fillCircle(0, headCY - headR * 0.55, 3);
    }

    return g;
  }

  updateCooldowns() {
    const dt = 0.1;
    if (this.skill1Timer > 0) this.skill1Timer = Math.max(0, this.skill1Timer - dt);
    if (this.ultimateTimer > 0) this.ultimateTimer = Math.max(0, this.ultimateTimer - dt);
    if (this.skill2Timer > 0) this.skill2Timer = Math.max(0, this.skill2Timer - dt);
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer = Math.max(0, this.dashCooldownTimer - dt);
    if (this.frozenHeartCooldown > 0) this.frozenHeartCooldown = Math.max(0, this.frozenHeartCooldown - dt);
    if (this.interruptTimer > 0) {
      this.interruptTimer = Math.max(0, this.interruptTimer - dt);
      if (this.interruptTimer <= 0) {
        this.interruptWindow = false;
        this.pendingInterrupt = false;
      }
    }
    // Enemy freeze countdown
    if (this.enemyFrozen) {
      this.enemyFreezeTimer = Math.max(0, this.enemyFreezeTimer - dt);
      if (this.enemyFreezeTimer <= 0) {
        this.enemyFrozen = false;
        if (this.enemyAttackTimer) this.enemyAttackTimer.paused = false;
      }
    }
    // Flowing River: track time since last enemy attack
    this.timeSinceLastEnemyAttack += dt;
    // Dodge attack window tracking
    if (this.dodgeAttackWindow) {
      this.dodgeWindowTimer = (this.dodgeWindowTimer || 0) - dt;
      if (this.dodgeWindowTimer <= 0) this.dodgeAttackWindow = false;
    }
    // Ghost Assassin vanish timer
    if (this.enemyData.id === 'E10') {
      this.ghostVanishTimer += dt;
      if (!this.ghostIsVanished && this.ghostVanishTimer >= 30) {
        this.ghostIsVanished = true;
        this.ghostVanishTimer = 0;
        if (this.enemySprite) this.enemySprite.setAlpha(0.1);
        this.time.delayedCall(2000, () => {
          this.ghostIsVanished = false;
          if (this.enemySprite && this.enemySprite.active) this.enemySprite.setAlpha(1);
          // Stealth attack
          if (this.enemyHp > 0 && this.playerHp > 0) {
            const dmg = Math.max(1, this.enemyAttack * 1.5 - this.playerDefense);
            this.applyPlayerDamage(dmg, false);
          }
        });
      }
    }
    // Emit to React
    if (this.game.events) {
      this.game.events.emit('cooldownUpdate', {
        skill1: this.skill1Timer,
        skill1Max: this.skill1CooldownValue,
        skill2: this.skill2Timer,
        skill2Max: this.skill2CooldownValue,
        ultimate: this.ultimateTimer,
        ultimateMax: this.ultimateCooldownValue,
        dash: this.dashCooldownTimer,
        dashMax: this.dashCooldownValue,
        burningStacks: this.burningMeridianStacks,
        interruptWindow: this.interruptWindow
      });
    }
  }

  // Compute technique multiplier from equipped techniques + active synergies
  getTechniqueMultiplier() {
    let mult = 1.0;
    // Synergy: Blade+Blade = +15% attack speed (treat as +10% dmg approx)
    if (this.activeSynergies.some(s => s.name === 'Blade Sync')) mult += 0.10;
    // Burning Meridian stack bonus
    if (this.innerArt?.id === 'burningMeridian') {
      mult += this.burningMeridianStacks * 0.03;
    }
    // R02 relic: basic attacks +8% damage
    if (this.relics.some(r => r.id === 'R02')) mult += 0.08;
    // R10 relic: Burning Meridian stacks cap raised — handled elsewhere
    return mult;
  }

  getInnerArtBonus() {
    if (!this.innerArt) return 0;
    if (this.innerArt.id === 'bloodWolf') return 2; // constant small bonus
    return 0;
  }

  getEnemyDefense() {
    let def = this.enemyData.defense || 0;
    // Phase 2 Iron Monk Disciple stance block
    if (this.enemyData.id === 'E08' && this.enemyPhase === 1 && this.enemyStanceBlockActive) def += 100;
    // White Ape Elder stone armor
    if (this.enemyData.id === 'B02' && this.enemyPhase === 2 && !this.enemyStanceBroken) def += 20;
    return def;
  }

  doAutoAttack() {
    // Guard: combatReady is false during the intro animation (first ~2.1s)
    if (!this.combatReady || this.enemyHp <= 0) return;
    this.hitCount++;
    const isCrit = rollCrit(this.critChance);
    let mult = this.getTechniqueMultiplier();
    // Dodge attack window (Drunken Drift)
    if (this.dodgeAttackWindow && this.movementArt?.id === 'drunkenDrift') mult += 0.40;
    // Blood Wolf: every 5th hit, double the hit
    const isBloodWolfProc = this.innerArt?.id === 'bloodWolf' && this.hitCount % 5 === 0;
    // Frozen Heart Sutra: next-3-hits bonus from Absolute Zero
    if (this.frozenHitBonus > 0) {
      mult *= 2.5;
      this.frozenHitCount++;
      if (this.frozenHitCount >= 3) { this.frozenHitBonus = 0; this.frozenHitCount = 0; }
    }
    // R09 Frostglass Bangle: frozen enemy takes +25%
    if (this.enemyFrozen && this.relics.some(r => r.id === 'R09')) mult += 0.25;
    let baseDmg = calculateDamage(this.playerAttack, mult, this.getInnerArtBonus(), this.getEnemyDefense());
    if (isCrit) baseDmg = Math.floor(calculateCrit(baseDmg, this.critPower - 1.5));
    // T08: first hit does 3× (Mountain-Topple Blow)
    if (this.techniques.some(t => t.id === 'T08') && this.hitCount === 1) baseDmg = Math.floor(baseDmg * 3);
    // R06: low HP counter
    if (this.vengefulRibbonReady && this.playerHp / this.playerMaxHp < 0.3) {
      baseDmg = baseDmg * 3;
      this.vengefulRibbonReady = false;
    }
    this.enemyHp = Math.max(0, this.enemyHp - baseDmg);
    this.totalDamage += baseDmg;
    this.playerQi = Math.min(this.playerMaxQi, this.playerQi + 8);
    this.showDamageNumber(baseDmg, isCrit, true);
    this.flashSprite(this.enemySprite, 0xffffff, this.enemyW, this.enemyH);
    // Blood Wolf: hit again, restore HP
    if (isBloodWolfProc && this.enemyHp > 0) {
      this.time.delayedCall(200, () => {
        if (this.enemyHp > 0) {
          let procDmg = calculateDamage(this.playerAttack, mult, this.getInnerArtBonus(), this.getEnemyDefense());
          this.enemyHp = Math.max(0, this.enemyHp - procDmg);
          this.totalDamage += procDmg;
          this.showDamageNumber(procDmg, false, true);
        }
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + this.innerArt.bonuses.lifestealHp);
        this.updateBars();
      });
    }
    // T11 Thunder Fist Chain: every 5th hit chains lightning
    if (this.techniques.some(t => t.id === 'T11') && this.hitCount % 5 === 0) {
      this.time.delayedCall(100, () => {
        if (this.enemyHp > 0) {
          const chainDmg = Math.floor(this.playerAttack * 0.3);
          this.enemyHp = Math.max(0, this.enemyHp - chainDmg);
          this.totalDamage += chainDmg;
          this.showDamageNumber(chainDmg, false, true);
          this.showSynergyPopup('⚡ THUNDER CHAIN!');
        }
      });
    }
    // R16 Thunder Bead Necklace: every 5th hit
    if (this.relics.some(r => r.id === 'R16') && this.hitCount % 5 === 0) {
      const thunderDmg = Math.floor(this.playerAttack * 0.3);
      this.time.delayedCall(150, () => {
        if (this.enemyHp > 0) {
          this.enemyHp = Math.max(0, this.enemyHp - thunderDmg);
          this.totalDamage += thunderDmg;
          this.showDamageNumber(thunderDmg, false, true);
        }
      });
    }
    this.updateBars();
    this.checkPhaseTransition();
    if (this.enemyHp <= 0) this.handleVictory();
  }

  doEnemyAttack() {
    // Guard: combatReady is false during the intro animation (first ~2.1s)
    if (!this.combatReady || this.enemyHp <= 0 || this.playerHp <= 0) return;
    if (this.enemyFrozen) return;
    // Iron Monk Disciple phase 1: can't damage unless stance-broken
    if (this.enemyData.id === 'E08' && this.enemyPhase === 1 && this.enemyStanceBlockActive) {
      // Enemy attacks normally but player can't hurt it without stance break
    }
    const sequence = this.enemyData.indicators || ['yellow'];
    const color = sequence[this.attackSequenceIndex % sequence.length];
    this.attackSequenceIndex++;
    // Skip 'shadow' indicator — treat as stealth (Ghost Assassin handled separately)
    if (color === 'shadow') return;
    this.showAttackIndicator(color);
    this.timeSinceLastEnemyAttack = 0;
    if (color === 'orange') {
      // Orange: interruptible — open interrupt window
      this.interruptWindow = true;
      this.pendingInterrupt = true;
      this.interruptTimer = 0.5;
    } else if (color === 'red') {
      this.pendingUnblockable = true;
    }
    this.time.delayedCall(800, () => {
      if (this.enemyHp <= 0 || this.playerHp <= 0) return;
      // Orange: if interrupted in time, cancel attack
      if (color === 'orange' && !this.pendingInterrupt) return;
      // Red: if player was dashing during iframe, negate
      if (color === 'red' && this.isDashing) {
        this.pendingUnblockable = false;
        return;
      }
      // Yellow: also blocked by dash iframe
      if (color === 'yellow' && this.isDashing) return;
      // Purple: stance-break if not interrupted
      if (color === 'purple' && !this.enemyStanceBroken) {
        const stanceBreakDmg = calculateStanceBreak(this.enemyAttack);
        this.applyPlayerDamage(stanceBreakDmg, true);
      } else {
        let dmg = Math.max(1, this.enemyAttack - Math.floor(Math.random() * 3));
        // Drunken Swordsman: 30% chance to dodge player skill
        if (this.enemyData.id === 'E09' && Math.random() < 0.3) return;
        this.applyPlayerDamage(dmg, false);
      }
      this.pendingUnblockable = false;
      // Frozen Heart Sutra passive: after taking a hit, freeze attacker
      if (this.innerArt?.id === 'frozenHeart' && this.frozenHeartCooldown <= 0 && this.enemyHp > 0) {
        this.frozenHeartCooldown = this.innerArt.bonuses.freezeCooldown || 6;
        this.triggerEnemyFreeze(this.innerArt.bonuses.freezeDuration || 0.8);
        this.showSynergyPopup('❄ FREEZE!');
      }
    });
  }

  applyPlayerDamage(dmg, isStanceBreak) {
    // R18 Fox Spirit Charm: avoid lethal damage once
    if (this.playerHp - dmg <= 0 && !this.foxCharmUsed && this.relics.some(r => r.id === 'R18')) {
      this.foxCharmUsed = true;
      this.playerHp = 1;
      this.showSynergyPopup('🦊 CHARM SAVED YOU!');
    } else {
      this.playerHp = Math.max(0, this.playerHp - dmg);
    }
    if (isStanceBreak) {
      this.showDamageNumber(dmg, true, false);
      this.showSynergyPopup('💢 STANCE BREAK HIT!');
    } else {
      this.showDamageNumber(dmg, false, false);
    }
    this.flashSprite(this.playerSprite, 0xff4444);
    // Burning Meridian: taking damage loses 1 stack
    if (this.innerArt?.id === 'burningMeridian' && this.burningMeridianStacks > 0) {
      this.burningMeridianStacks--;
      if (this.stackLabel) this.stackLabel.setText(`🔥×${this.burningMeridianStacks}`);
    }
    this.updateBars();
    if (this.game.events) {
      this.game.events.emit('playerHpChange', this.playerHp);
    }
    if (this.playerHp <= 0) this.handleDefeat();
  }

  triggerEnemyFreeze(duration) {
    if (this.enemyHp <= 0) return;
    this.enemyFrozen = true;
    this.enemyFreezeTimer = duration;
    if (this.enemyAttackTimer) this.enemyAttackTimer.paused = true;
    if (this.enemyFreezeOverlay) this.enemyFreezeOverlay.setVisible(true);
    this.time.delayedCall(duration * 1000, () => {
      if (this.enemyFreezeOverlay && this.enemyFreezeOverlay.active) {
        this.enemyFreezeOverlay.setVisible(false);
      }
    });
  }

  checkPhaseTransition() {
    const hpPct = this.enemyHp / this.enemyMaxHp;
    // Iron Fan Widow (B01) Phase 2 at 50%
    if (this.enemyData.id === 'B01' && this.enemyPhase === 1 && hpPct <= 0.5) {
      this.enemyPhase = 2;
      this.phaseTransitioned = true;
      this.showSynergyPopup('⚠ PHASE 2: Fan Fury!');
      // Faster attacks
      if (this.enemyAttackTimer) {
        this.enemyAttackTimer.delay = 1800;
      }
      if (this.game.events) this.game.events.emit('bossPhase', { phase: 2, boss: 'B01' });
    }
    // White Ape Elder (B02) phases
    if (this.enemyData.id === 'B02') {
      if (this.enemyPhase === 1 && hpPct <= 0.70) {
        this.enemyPhase = 2;
        this.enemyStanceBroken = false;
        this.enemyStanceHealth = 3;
        this.showSynergyPopup('🪨 STONE ARMOR!');
        if (this.game.events) this.game.events.emit('bossPhase', { phase: 2, boss: 'B02' });
      } else if (this.enemyPhase === 2 && hpPct <= 0.35) {
        this.enemyPhase = 3;
        this.enemyStanceBroken = true; // armor drops
        this.showSynergyPopup('💨 BERSERK! 15s countdown!');
        // 15s Berserk countdown — instant death
        this.time.delayedCall(15000, () => {
          if (this.enemyHp > 0 && this.playerHp > 0) {
            this.applyPlayerDamage(9999, false);
          }
        });
        if (this.enemyAttackTimer) this.enemyAttackTimer.delay = 1200;
        if (this.game.events) this.game.events.emit('bossPhase', { phase: 3, boss: 'B02' });
      }
    }
    // Twin Blade Widow (E07) split at 60% HP
    if (this.enemyData.id === 'E07' && !this.splitOccurred && hpPct <= 0.60) {
      this.splitOccurred = true;
      // Each half has 40 HP — treat as resetting HP to 80 (2×40)
      this.enemyHp = 80;
      this.enemyMaxHp = 80;
      this.showSynergyPopup('✂ SPLIT! Two blades now!');
      if (this.enemyAttackTimer) this.enemyAttackTimer.delay = 2000;
    }
    // Iron Monk Disciple (E08) Phase 2 frenzy when stance broken
    if (this.enemyData.id === 'E08' && this.enemyStanceBroken && this.enemyPhase === 1) {
      this.enemyPhase = 2;
      this.enemyStanceBlockActive = false;
      this.showSynergyPopup('🔥 FRENZY MODE!');
      if (this.enemyAttackTimer) this.enemyAttackTimer.delay = 1600;
    }
  }

  showAttackIndicator(color) {
    const colors = { yellow: 0xffff00, red: 0xff4444, orange: 0xff8800, purple: 0xaa44aa };
    const c = colors[color] || 0xffff00;
    this.attackIndicator.setStrokeStyle(4, c, 0.8);
    this.tweens.add({
      targets: this.attackIndicator,
      alpha: { from: 0.8, to: 0 },
      duration: 800,
      onComplete: () => { if (this.attackIndicator) this.attackIndicator.setStrokeStyle(0); }
    });
  }

  showDamageNumber(dmg, isCrit, isPlayerAttack) {
    const W = this.scale.width;
    const H = this.scale.height;
    const x = isPlayerAttack ? W / 2 + (Math.random() - 0.5) * 60 : W / 2 + (Math.random() - 0.5) * 60;
    const y = isPlayerAttack ? H * 0.25 : H * 0.65;
    const color = isCrit ? '#ffaa00' : isPlayerAttack ? '#e8c87e' : '#ff6666';
    const size = isCrit ? '20px' : '14px';
    const prefix = isCrit ? '✦ ' : '';
    const txt = this.add.text(x, y, `${prefix}${dmg}`, {
      fontSize: size, color, fontFamily: 'serif', fontStyle: isCrit ? 'bold' : 'normal'
    }).setOrigin(0.5);
    this.tweens.add({
      targets: txt,
      y: y - 50,
      alpha: 0,
      duration: 900,
      ease: 'Power2',
      onComplete: () => txt.destroy()
    });
  }

  flashSprite(sprite, color, overrideW, overrideH) {
    if (typeof sprite.setFillStyle === 'function') {
      // Rectangle — direct fill-color swap
      const orig = sprite.fillColor;
      sprite.setFillStyle(color);
      this.time.delayedCall(150, () => { if (sprite && sprite.active) sprite.setFillStyle(orig); });
    } else {
      // Image or Graphics — overlay a brief coloured rectangle
      const fw = overrideW || sprite.displayWidth || 54;
      const fh = overrideH || sprite.displayHeight || 76;
      const flash = this.add.rectangle(sprite.x, sprite.y, fw, fh, color, 0.65);
      this.time.delayedCall(150, () => { if (flash && flash.active) flash.destroy(); });
    }
  }

  useSkill1() {
    if (this.skill1Timer > 0 || this.enemyHp <= 0) return;
    // Orange interrupt: cancel pending enemy attack
    if (this.interruptWindow && this.pendingInterrupt) {
      this.pendingInterrupt = false;
      this.interruptWindow = false;
      this.interruptTimer = 0;
      this.showSynergyPopup('⚡ INTERRUPTED!');
    }
    // Stance break contribution
    if (this.enemyStanceHealth > 0 && !this.enemyStanceBroken) {
      this.enemyStanceHealth--;
      if (this.stanceDots[this.enemyStanceHealth]) this.stanceDots[this.enemyStanceHealth].setFillStyle(0x333333);
      if (this.enemyStanceHealth <= 0) {
        this.enemyStanceBroken = true;
        this.showSynergyPopup('💥 STANCE BROKEN!');
        this.checkPhaseTransition();
      }
    }
    let mult = this.weapon?.skill?.multiplier || 2.2;
    // Synergy: Counter Blade
    if (this.activeSynergies.some(s => s.name === 'Counter Blade') && this.timeSinceLastEnemyAttack < 1) mult += 0.5;
    // T04 Heaven-Splitting Form: Ultimate +50% if full Qi
    if (this.techniques.some(t => t.id === 'T04') && this.playerQi >= this.playerMaxQi) mult += 0.5;
    let dmg = Math.floor(calculateDamage(this.playerAttack, mult, this.getInnerArtBonus(), this.getEnemyDefense()) + Math.random() * 5);
    if (rollCrit(this.critChance + (this.relics.some(r => r.id === 'R11') ? 0.30 : 0))) {
      dmg = Math.floor(calculateCrit(dmg, this.critPower - 1.5));
    }
    // Dodge attack window bonus (Drunken Drift)
    if (this.dodgeAttackWindow && this.movementArt?.id === 'drunkenDrift') dmg = Math.floor(dmg * 1.4);
    this.enemyHp = Math.max(0, this.enemyHp - dmg);
    this.totalDamage += dmg;
    this.playerQi = Math.min(this.playerMaxQi, this.playerQi + 15);
    this.skill1Timer = this.skill1CooldownValue;
    this.showDamageNumber(dmg, false, true);
    this.showSkillEffect();
    this.updateBars();
    this.checkPhaseTransition();
    if (this.enemyHp <= 0) this.handleVictory();
  }

  useSkill2() {
    if (this.skill2Timer > 0 || this.enemyHp <= 0 || !this.innerArt) return;
    const art = this.innerArt;
    this.skill2Timer = this.skill2CooldownValue;
    if (art.id === 'flowingRiver') {
      // Tidal Surge: heal 40 HP
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + art.bonuses.ultimateHeal);
      this.showSynergyPopup('💧 TIDAL SURGE! +' + art.bonuses.ultimateHeal + ' HP');
      this.updateBars();
    } else if (art.id === 'burningMeridian') {
      // Inferno Ignition: release all stacks as AoE explosion
      const stackDmg = Math.floor(this.playerAttack * this.burningMeridianStacks * 0.5);
      const dmg = Math.max(1, stackDmg);
      this.enemyHp = Math.max(0, this.enemyHp - dmg);
      this.totalDamage += dmg;
      this.burningMeridianStacks = 0;
      if (this.stackLabel) this.stackLabel.setText('🔥×0');
      this.showDamageNumber(dmg, true, true);
      this.showSynergyPopup('🔥 INFERNO IGNITION!');
      this.showUltimateEffect();
      this.updateBars();
      this.checkPhaseTransition();
      if (this.enemyHp <= 0) this.handleVictory();
    } else if (art.id === 'bloodWolf') {
      // Savage Feast: channel 2s, heal 15% per hit
      this.showSynergyPopup('🐺 SAVAGE FEAST!');
      for (let i = 0; i < 3; i++) {
        this.time.delayedCall(i * 600 + 200, () => {
          if (this.enemyHp <= 0 || this.playerHp <= 0) return;
          const healAmt = Math.floor(this.playerMaxHp * 0.15);
          this.playerHp = Math.min(this.playerMaxHp, this.playerHp + healAmt);
          const dmg = Math.floor(this.playerAttack * 0.8);
          this.enemyHp = Math.max(0, this.enemyHp - dmg);
          this.totalDamage += dmg;
          this.showDamageNumber(dmg, false, true);
          this.updateBars();
          if (this.enemyHp <= 0) this.handleVictory();
        });
      }
    } else if (art.id === 'frozenHeart') {
      // Absolute Zero: freeze all 3s, next 3 hits do 2.5×
      this.triggerEnemyFreeze(3);
      this.frozenHitBonus = 1;
      this.frozenHitCount = 0;
      this.showSynergyPopup('❄ ABSOLUTE ZERO! 2.5× next 3 hits');
    }
  }

  useUltimate() {
    if (this.ultimateTimer > 0 || this.playerQi < 80 || this.enemyHp <= 0) return;
    let mult = 4.5;
    // T04: +50% if at full Qi
    if (this.techniques.some(t => t.id === 'T04') && this.playerQi >= this.playerMaxQi) mult *= 1.5;
    // Synergy: Flame Surge
    if (this.activeSynergies.some(s => s.name === 'Flame Surge') && this.innerArt?.id === 'burningMeridian') mult += 1.0;
    // Frozen Heart bonus hits (Absolute Zero still active)
    if (this.frozenHitBonus > 0) mult *= 2.5;
    let dmg = Math.floor(calculateDamage(this.playerAttack, mult, this.getInnerArtBonus(), this.getEnemyDefense()) + Math.random() * 10);
    // T17 Nine Dragon Destruction: hits 9 times
    if (this.techniques.some(t => t.id === 'T17')) {
      let totalDmg = 0;
      for (let i = 0; i < 9; i++) {
        totalDmg += Math.floor(this.playerAttack * 1.2);
      }
      dmg = totalDmg;
      this.showSynergyPopup('🐉 NINE DRAGON DESTRUCTION!');
    }
    this.enemyHp = Math.max(0, this.enemyHp - dmg);
    this.totalDamage += dmg;
    this.playerQi = 0;
    this.ultimateTimer = this.ultimateCooldownValue;
    this.showDamageNumber(dmg, true, true);
    this.showUltimateEffect();
    // R14: stun nearby enemies 0.5s
    if (this.relics.some(r => r.id === 'R14')) this.triggerEnemyFreeze(0.5);
    this.updateBars();
    this.checkPhaseTransition();
    if (this.enemyHp <= 0) this.handleVictory();
  }

  useDash() {
    if (this.dashCooldownTimer > 0 || this.enemyHp <= 0) return;
    this.isDashing = true;
    this.dashCooldownTimer = this.dashCooldownValue;
    // R05 Black Bone Fan: each dodge increases next skill damage
    if (this.relics.some(r => r.id === 'R05')) {
      this.blackBoneFanDodges = Math.min(5, (this.blackBoneFanDodges || 0) + 1);
    }
    // R15 Assassin's Coal Dust: smoke cloud
    if (this.relics.some(r => r.id === 'R15')) {
      this.showSynergyPopup('💨 SMOKE CLOUD!');
      this.triggerEnemyFreeze(2);
    }
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 40,
      duration: 150,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(100, () => { this.isDashing = false; });
      }
    });
    // Drunken Drift: open dodge attack window
    if (this.movementArt?.id === 'drunkenDrift') {
      this.dodgeAttackWindow = true;
      this.dodgeWindowTimer = 0.5;
    }
    // Flowing River Qi passive: if dodged within 2s of enemy attack, restore 8 HP
    if (this.innerArt?.id === 'flowingRiver' && this.timeSinceLastEnemyAttack < 2) {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + this.innerArt.bonuses.dodgeHeal);
      this.showSynergyPopup('💧 FLOWING RIVER +' + this.innerArt.bonuses.dodgeHeal + ' HP');
      this.updateBars();
    }
    // Swallow Step: second dash within 1.5s costs no cooldown
    if (this.movementArt?.id === 'swallowStep') {
      if (this.lastDashTime && (Date.now() - this.lastDashTime) < 1500) {
        this.dashCooldownTimer = 0;
      }
    }
    this.lastDashTime = Date.now();
    // Restore some qi
    this.playerQi = Math.min(this.playerMaxQi, this.playerQi + 5);
    this.updateBars();
  }

  showSynergyPopup(label) {
    const W = this.scale.width;
    const H = this.scale.height;
    const txt = this.add.text(W / 2, H * 0.48, label, {
      fontSize: '13px', color: '#ffdd44', fontFamily: 'serif', fontStyle: 'bold',
      stroke: '#1a1208', strokeThickness: 2
    }).setOrigin(0.5);
    this.tweens.add({
      targets: txt,
      y: H * 0.38,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => txt.destroy()
    });
    if (this.game.events) this.game.events.emit('synergyPopup', label);
  }

  showSkillEffect() {
    const W = this.scale.width;
    const H = this.scale.height;
    const weaponColors = { sword: 0xffd700, spear: 0x44aaff, fists: 0xff6600 };
    const col = weaponColors[this.weapon?.id] || 0xffdd00;
    // Expanding flash
    const flash = this.add.rectangle(W / 2, H * 0.38, 90, 110, col, 0.65);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 2.5, duration: 380, onComplete: () => flash.destroy() });
    // Slash line
    const slash = this.add.graphics();
    slash.lineStyle(3, col, 0.9);
    slash.lineBetween(W / 2 - 38, H * 0.29, W / 2 + 38, H * 0.47);
    slash.lineStyle(1, 0xffffff, 0.5);
    slash.lineBetween(W / 2 - 33, H * 0.28, W / 2 + 33, H * 0.46);
    this.tweens.add({ targets: slash, alpha: 0, duration: 340, onComplete: () => slash.destroy() });
  }

  showUltimateEffect() {
    const W = this.scale.width;
    const H = this.scale.height;
    // Large burst
    const flash = this.add.rectangle(W / 2, H * 0.38, 130, 150, 0xff6600, 0.85);
    this.tweens.add({ targets: flash, alpha: 0, scaleX: 3, scaleY: 2, duration: 580, onComplete: () => flash.destroy() });
    // Screen tint
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0xff6600, 0.30);
    this.tweens.add({ targets: overlay, alpha: 0, duration: 480, onComplete: () => overlay.destroy() });
    // Ripple rings
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 110, () => {
        const ring = this.add.circle(W / 2, H * 0.38, 22 + i * 14, 0xff6600, 0);
        ring.setStrokeStyle(3, 0xff8800, 0.9);
        this.tweens.add({ targets: ring, scaleX: 3.2, scaleY: 3.2, alpha: 0, duration: 520, onComplete: () => ring.destroy() });
      });
    }
  }

  updateBars() {
    const hpRatio = Math.max(0, this.enemyHp / this.enemyMaxHp);
    this.enemyHpBar.setScale(hpRatio, 1);
    this.enemyHpText.setText(`${Math.ceil(this.enemyHp)}/${this.enemyMaxHp}`);

    const playerHpRatio = Math.max(0, this.playerHp / this.playerMaxHp);
    this.playerHpBar.setScale(playerHpRatio, 1);
    this.playerHpText.setText(`${Math.ceil(this.playerHp)}/${this.playerMaxHp}`);

    const qiRatio = this.playerQi / this.playerMaxQi;
    this.qiBar.setScale(qiRatio, 1);

    if (this.game.events) {
      this.game.events.emit('statsUpdate', {
        playerHp: this.playerHp,
        playerMaxHp: this.playerMaxHp,
        playerQi: this.playerQi,
        playerMaxQi: this.playerMaxQi,
        enemyHp: this.enemyHp,
        enemyMaxHp: this.enemyMaxHp
      });
    }
  }

  handleVictory() {
    // Guard: prevent multiple invocations from concurrent delayed hits (e.g. bloodWolf Skill 2)
    if (this.combatEnded) return;
    this.combatEnded = true;
    if (this.autoAttackTimer) this.autoAttackTimer.remove();
    if (this.enemyAttackTimer) this.enemyAttackTimer.remove();
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.text(W / 2, H / 2, '勝利', {
      fontSize: '48px', color: '#e8c87e', fontFamily: 'serif'
    }).setOrigin(0.5);
    const isElite = this.enemyData.type === 'elite';
    const isBoss = this.enemyData.type === 'boss';
    // Burning Meridian: on kill, gain 1 stack
    if (this.innerArt?.id === 'burningMeridian') {
      this.burningMeridianStacks = Math.min(this.burningMeridianStacks + 1, this.innerArt.bonuses.maxStacks || 10);
      if (this.stackLabel) this.stackLabel.setText(`🔥×${this.burningMeridianStacks}`);
    }
    // Essence: 5 standard, 10 elite (doubled to 20 with R13), 60/100 boss
    let essenceGained = isBoss ? (this.enemyData.drops?.essence || 60) : isElite ? 10 : 5;
    if (isElite && this.relics.some(r => r.id === 'R13')) essenceGained *= 2;
    let silverGained = 15 + Math.floor(Math.random() * 20);
    if (this.relics.some(r => r.id === 'R08')) silverGained = Math.floor(silverGained * 1.3);
    // R04: heal 3 HP per kill
    if (this.relics.some(r => r.id === 'R04')) {
      this.playerHp = Math.min(this.playerMaxHp, this.playerHp + 3);
    }
    // Build base result
    const result = {
      victory: true,
      damageDealt: this.totalDamage,
      silverGained,
      essenceGained,
      remainingHp: this.playerHp,
      remainingQi: this.playerQi,
      burningMeridianStacks: this.burningMeridianStacks,
      bossId: isBoss ? this.enemyData.id : null
    };
    // B02 karma-dependent technique drop
    if (this.enemyData.id === 'B02') {
      const orthodoxy = this.initKarma?.orthodoxy || 0;
      result.techDropId = orthodoxy >= 2 ? 'T19' : 'T17';
    }
    this.time.delayedCall(1500, () => {
      if (!this.game?.events) return;
      // Emit bossDefeated so PhaserGame.jsx can show karma dialogue
      if (isBoss) {
        this.game.events.emit('bossDefeated', result);
      } else {
        // Non-boss: emit combatVictory (handled in PhaserGame.jsx alongside bossDefeated)
        this.game.events.emit('combatVictory', result);
      }
    });
  }

  handleDefeat() {
    // Guard: prevent multiple invocations (mirrors handleVictory guard)
    if (this.combatEnded) return;
    this.combatEnded = true;
    if (this.autoAttackTimer) this.autoAttackTimer.remove();
    if (this.enemyAttackTimer) this.enemyAttackTimer.remove();
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.text(W / 2, H / 2, '敗北', {
      fontSize: '48px', color: '#8b1a1a', fontFamily: 'serif'
    }).setOrigin(0.5);
    this.time.delayedCall(1500, () => {
      if (this.game?.events) {
        this.game.events.emit('combatDefeat', { victory: false, damageDealt: this.totalDamage, remainingHp: 0 });
      }
    });
  }

  update() {}
}
