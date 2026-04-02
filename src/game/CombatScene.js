import Phaser from 'phaser';

export class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CombatScene' });
    this.playerHp = 120;
    this.playerMaxHp = 120;
    this.playerQi = 0;
    this.playerMaxQi = 100;
    this.enemyHp = 100;
    this.enemyMaxHp = 100;
    this.playerAttack = 10;
    this.enemyAttack = 8;
    this.critChance = 0.08;
    this.enemyAttackTimer = null;
    this.autoAttackTimer = null;
    this.skill1Cooldown = false;
    this.ultimateCooldown = false;
    this.onCombatEnd = null;
    this.damageNumbers = [];
    this.hitCount = 0;
  }

  init(data) {
    this.playerHp = data.playerHp || 120;
    this.playerMaxHp = data.playerMaxHp || 120;
    this.playerQi = data.playerQi || 0;
    this.playerAttack = data.playerAttack || 10;
    this.critChance = data.critChance || 0.08;
    this.enemyData = data.enemy || { hp: 100, attack: 8, name: 'Enemy' };
    this.enemyHp = this.enemyData.hp;
    this.enemyMaxHp = this.enemyData.hp;
    this.enemyAttack = this.enemyData.attack;
    this.onCombatEnd = data.onCombatEnd;
    this.weapon = data.weapon;
    this.totalDamage = 0;
    this.skill1CooldownValue = data.weapon?.skill?.cooldown || 5;
    this.skill1Timer = 0;
    this.ultimateTimer = 0;
    this.ultimateCooldownValue = 10;
    this.hitCount = 0;
  }

  preload() {}

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.rectangle(W / 2, H / 2, W, H, 0x1a1208);

    // Ink border decoration
    const border = this.add.graphics();
    border.lineStyle(2, 0xc8a96e, 0.6);
    border.strokeRect(10, 10, W - 20, H - 20);

    // Enemy arena background
    this.add.rectangle(W / 2, H * 0.35, W * 0.7, H * 0.45, 0x2a1e10, 0.8);

    // Phase label
    this.add.text(W / 2, 20, this.enemyData.name, {
      fontSize: '18px', color: '#e8c87e', fontFamily: 'serif'
    }).setOrigin(0.5, 0);

    // Enemy sprite (colored rectangle)
    const enemyColor = this.enemyData.type === 'boss' ? 0x8b1a1a : this.enemyData.type === 'elite' ? 0x6b2a6b : 0x6b4a2a;
    this.enemySprite = this.add.rectangle(W / 2, H * 0.32, 60, 80, enemyColor);
    this.enemySprite.setStrokeStyle(2, 0xc8a96e);

    // Enemy HP bar
    this.enemyHpBg = this.add.rectangle(W / 2, H * 0.12, 200, 12, 0x333333);
    this.enemyHpBar = this.add.rectangle(W / 2 - 100, H * 0.12, 200, 12, 0x8b1a1a).setOrigin(0, 0.5);
    this.add.text(W / 2, H * 0.08, 'Enemy HP', { fontSize: '11px', color: '#c8a96e' }).setOrigin(0.5);
    this.enemyHpText = this.add.text(W / 2, H * 0.16, `${this.enemyHp}/${this.enemyMaxHp}`, {
      fontSize: '11px', color: '#e8c87e'
    }).setOrigin(0.5);

    // Attack indicator (circle glow around enemy)
    this.attackIndicator = this.add.circle(W / 2, H * 0.32, 50, 0xffff00, 0);
    this.attackIndicator.setStrokeStyle(3, 0xffff00, 0);

    // Player sprite
    this.playerSprite = this.add.rectangle(W / 2, H * 0.62, 50, 70, 0x2d4a6e);
    this.playerSprite.setStrokeStyle(2, 0x6a9ec0);

    // Player HP bar
    this.playerHpBg = this.add.rectangle(W / 2, H * 0.78, 200, 12, 0x333333);
    this.playerHpBar = this.add.rectangle(W / 2 - 100, H * 0.78, 200, 12, 0x2d5a27).setOrigin(0, 0.5);
    this.add.text(W / 2, H * 0.74, 'Your HP', { fontSize: '11px', color: '#c8a96e' }).setOrigin(0.5);
    this.playerHpText = this.add.text(W / 2, H * 0.82, `${this.playerHp}/${this.playerMaxHp}`, {
      fontSize: '11px', color: '#e8c87e'
    }).setOrigin(0.5);

    // Qi bar
    this.qiBg = this.add.rectangle(W / 2, H * 0.86, 200, 8, 0x333333);
    this.qiBar = this.add.rectangle(W / 2 - 100, H * 0.86, 0, 8, 0x4a6e9e).setOrigin(0, 0.5);
    this.add.text(W / 2 - 105, H * 0.86, 'QI', { fontSize: '10px', color: '#c8a96e' }).setOrigin(1, 0.5);

    // Auto-attack timer
    this.autoAttackTimer = this.time.addEvent({
      delay: 1500,
      callback: this.doAutoAttack,
      callbackScope: this,
      loop: true
    });

    // Enemy attack timer
    this.enemyAttackTimer = this.time.addEvent({
      delay: 2500,
      callback: this.doEnemyAttack,
      callbackScope: this,
      loop: true,
      startAt: 1000
    });

    // Skill cooldown timers
    this.time.addEvent({
      delay: 100,
      callback: this.updateCooldowns,
      callbackScope: this,
      loop: true
    });

    this.updateBars();
  }

  updateCooldowns() {
    if (this.skill1Timer > 0) this.skill1Timer -= 0.1;
    if (this.ultimateTimer > 0) this.ultimateTimer -= 0.1;
    // Emit to React
    if (this.game.events) {
      this.game.events.emit('cooldownUpdate', {
        skill1: this.skill1Timer,
        skill1Max: this.skill1CooldownValue,
        ultimate: this.ultimateTimer,
        ultimateMax: this.ultimateCooldownValue
      });
    }
  }

  doAutoAttack() {
    if (this.enemyHp <= 0) return;
    this.hitCount++;
    let dmg = this.playerAttack + Math.floor(Math.random() * 3);
    const isCrit = Math.random() < this.critChance;
    if (isCrit) dmg = Math.floor(dmg * 1.5);
    this.enemyHp = Math.max(0, this.enemyHp - dmg);
    this.totalDamage += dmg;
    this.playerQi = Math.min(this.playerMaxQi, this.playerQi + 8);

    this.showDamageNumber(dmg, isCrit, true);
    this.flashSprite(this.enemySprite, 0xffffff);
    this.updateBars();

    if (this.enemyHp <= 0) {
      this.handleVictory();
    }
  }

  doEnemyAttack() {
    if (this.enemyHp <= 0) return;
    // Show indicator
    this.showAttackIndicator('yellow');
    this.time.delayedCall(800, () => {
      if (this.enemyHp <= 0) return;
      const dmg = Math.max(1, this.enemyAttack - Math.floor(Math.random() * 3));
      this.playerHp = Math.max(0, this.playerHp - dmg);
      this.showDamageNumber(dmg, false, false);
      this.flashSprite(this.playerSprite, 0xff4444);
      this.updateBars();
      if (this.game.events) {
        this.game.events.emit('playerHpChange', this.playerHp);
      }
      if (this.playerHp <= 0) {
        this.handleDefeat();
      }
    });
  }

  showAttackIndicator(color) {
    const colors = { yellow: 0xffff00, red: 0xff4444, orange: 0xff8800 };
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

  flashSprite(sprite, color) {
    const orig = sprite.fillColor;
    sprite.setFillStyle(color);
    this.time.delayedCall(150, () => { if (sprite && sprite.active) sprite.setFillStyle(orig); });
  }

  useSkill1() {
    if (this.skill1Timer > 0 || this.enemyHp <= 0) return;
    const dmg = Math.floor(this.playerAttack * 2.2 + Math.random() * 5);
    this.enemyHp = Math.max(0, this.enemyHp - dmg);
    this.totalDamage += dmg;
    this.playerQi = Math.min(this.playerMaxQi, this.playerQi + 15);
    this.skill1Timer = this.skill1CooldownValue;
    this.showDamageNumber(dmg, false, true);
    this.showSkillEffect();
    this.updateBars();
    if (this.enemyHp <= 0) this.handleVictory();
  }

  useUltimate() {
    if (this.ultimateTimer > 0 || this.playerQi < 80 || this.enemyHp <= 0) return;
    const dmg = Math.floor(this.playerAttack * 4.5 + Math.random() * 10);
    this.enemyHp = Math.max(0, this.enemyHp - dmg);
    this.totalDamage += dmg;
    this.playerQi = 0;
    this.ultimateTimer = this.ultimateCooldownValue;
    this.showDamageNumber(dmg, true, true);
    this.showUltimateEffect();
    this.updateBars();
    if (this.enemyHp <= 0) this.handleVictory();
  }

  useDash() {
    if (this.enemyHp <= 0) return;
    // Dodge: negate next enemy attack
    this.tweens.add({
      targets: this.playerSprite,
      x: this.playerSprite.x + 40,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    });
    // Restore some qi
    this.playerQi = Math.min(this.playerMaxQi, this.playerQi + 5);
    this.updateBars();
  }

  showSkillEffect() {
    const W = this.scale.width;
    const flash = this.add.rectangle(W / 2, this.scale.height * 0.32, 80, 100, 0xffdd00, 0.6);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 2,
      duration: 400,
      onComplete: () => flash.destroy()
    });
  }

  showUltimateEffect() {
    const W = this.scale.width;
    const H = this.scale.height;
    const flash = this.add.rectangle(W / 2, H * 0.32, 120, 140, 0xff6600, 0.8);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      scaleX: 3,
      scaleY: 2,
      duration: 600,
      onComplete: () => flash.destroy()
    });
    // Screen flash
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0xff6600, 0.3);
    this.tweens.add({
      targets: overlay,
      alpha: 0,
      duration: 500,
      onComplete: () => overlay.destroy()
    });
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
    if (this.autoAttackTimer) this.autoAttackTimer.remove();
    if (this.enemyAttackTimer) this.enemyAttackTimer.remove();
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.text(W / 2, H / 2, '勝利', {
      fontSize: '48px', color: '#e8c87e', fontFamily: 'serif'
    }).setOrigin(0.5);
    this.time.delayedCall(1500, () => {
      if (this.onCombatEnd) {
        this.onCombatEnd({
          victory: true,
          damageDealt: this.totalDamage,
          silverGained: 15 + Math.floor(Math.random() * 20),
          essenceGained: this.enemyData.type === 'boss' ? 60 : this.enemyData.type === 'elite' ? 20 : 5,
          remainingHp: this.playerHp,
          remainingQi: this.playerQi
        });
      }
    });
  }

  handleDefeat() {
    if (this.autoAttackTimer) this.autoAttackTimer.remove();
    if (this.enemyAttackTimer) this.enemyAttackTimer.remove();
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.text(W / 2, H / 2, '敗北', {
      fontSize: '48px', color: '#8b1a1a', fontFamily: 'serif'
    }).setOrigin(0.5);
    this.time.delayedCall(1500, () => {
      if (this.onCombatEnd) {
        this.onCombatEnd({ victory: false, damageDealt: this.totalDamage, remainingHp: 0 });
      }
    });
  }

  update() {}
}
