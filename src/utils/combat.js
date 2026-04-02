export function calculateDamage(weaponAttack, techniqueMultiplier, innerArtBonus, enemyDefense) {
  return Math.max(1, (weaponAttack * techniqueMultiplier) + innerArtBonus - enemyDefense);
}

export function calculateCrit(baseDamage, critPowerBonus) {
  return baseDamage * (1.5 + critPowerBonus);
}

export function calculateStanceBreak(baseDamage) {
  return baseDamage * 1.8;
}

export function rollCrit(critChance) {
  return Math.random() < critChance;
}
