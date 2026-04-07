import { useState } from 'react';
import { useGame } from '../store/gameStore.jsx';
import { RELICS } from '../data/relics.js';
import { TECHNIQUES } from '../data/techniques.js';

function generateShopInventory(runState) {
  const availableRelics = Object.values(RELICS).filter(r => !runState.relics.find(rr => rr.id === r.id));
  const availableTechs = Object.values(TECHNIQUES).filter(t => !runState.techniques.find(rt => rt.id === t.id) && t.category !== 'rare');
  const items = [];
  // Pick 2 relics and 1 technique (or 2 techniques and 1 relic)
  const relicCount = Math.random() < 0.5 ? 2 : 1;
  for (let i = 0; i < relicCount && availableRelics.length > 0; i++) {
    const idx = Math.floor(Math.random() * availableRelics.length);
    const relic = availableRelics.splice(idx, 1)[0];
    const cost = 80 + Math.floor(Math.random() * 71); // 80-150
    items.push({ item: relic, itemType: 'relic', cost });
  }
  const techCount = 3 - relicCount;
  for (let i = 0; i < techCount && availableTechs.length > 0; i++) {
    const idx = Math.floor(Math.random() * availableTechs.length);
    const tech = availableTechs.splice(idx, 1)[0];
    const cost = 50 + Math.floor(Math.random() * 51); // 50-100
    items.push({ item: tech, itemType: 'technique', cost });
  }
  return items;
}

const S = {
  container: {
    minHeight: '100vh',
    background: '#0d0a06',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 20px',
    fontFamily: 'serif',
    color: '#c8a96e'
  },
  title: { fontSize: '24px', color: '#e8c87e', letterSpacing: '0.2em', marginBottom: '4px' },
  subtitle: { fontSize: '12px', color: '#c8a96e66', letterSpacing: '0.15em', marginBottom: '30px' },
  panel: {
    width: '100%',
    maxWidth: '600px',
    background: '#1a1208',
    border: '1px solid #c8a96e33',
    borderRadius: '4px',
    padding: '24px',
    marginBottom: '20px'
  },
  silverRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    padding: '10px 16px',
    background: '#2a1e10',
    borderRadius: '2px',
    border: '1px solid #c8a96e22'
  },
  shopGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  shopItem: (canAfford, purchased) => ({
    padding: '16px',
    background: purchased ? '#1a2a1a' : canAfford ? '#2a1e10' : '#1a1208',
    border: `1px solid ${purchased ? '#4a8b4a' : canAfford ? '#c8a96e44' : '#c8a96e22'}`,
    borderRadius: '2px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: purchased ? 0.7 : 1
  }),
  itemInfo: { flex: 1 },
  itemName: { fontSize: '15px', color: '#e8c87e', marginBottom: '4px' },
  itemType: (type) => ({
    display: 'inline-block',
    fontSize: '10px',
    padding: '1px 6px',
    background: type === 'relic' ? '#2a1a2a' : '#1a2a2a',
    border: `1px solid ${type === 'relic' ? '#6b2a6b44' : '#2a6b6b44'}`,
    borderRadius: '2px',
    color: type === 'relic' ? '#c88bcc' : '#6bcccc',
    marginRight: '6px',
    letterSpacing: '0.05em'
  }),
  itemDesc: { fontSize: '11px', color: '#c8a96e88', marginTop: '4px' },
  buyArea: { textAlign: 'right', marginLeft: '16px' },
  costLabel: { fontSize: '13px', color: '#e8c87e', marginBottom: '6px' },
  buyBtn: (canAfford, purchased) => ({
    padding: '8px 18px',
    background: purchased ? 'transparent' : canAfford ? '#3a2a10' : '#1a1208',
    border: `1px solid ${purchased ? '#4a8b4a' : canAfford ? '#c8a96e' : '#c8a96e33'}`,
    color: purchased ? '#4a8b4a' : canAfford ? '#e8c87e' : '#c8a96e44',
    fontFamily: 'serif',
    fontSize: '12px',
    cursor: canAfford && !purchased ? 'pointer' : 'not-allowed',
    borderRadius: '2px',
    minWidth: '70px',
    minHeight: '36px'
  }),
  leaveBtn: {
    padding: '12px 40px',
    background: 'transparent',
    border: '1px solid #c8a96e',
    color: '#e8c87e',
    fontFamily: 'serif',
    fontSize: '15px',
    cursor: 'pointer',
    letterSpacing: '0.15em'
  }
};

export default function BlackMarketScreen() {
  const { state, actions } = useGame();
  const { runState } = state;
  const [inventory] = useState(() => generateShopInventory(runState));
  const [purchased, setPurchased] = useState({});
  const [upgradedTechs, setUpgradedTechs] = useState({});

  const handleBuy = (entry, idx) => {
    if (purchased[idx] || runState.silver < entry.cost) return;
    actions.buyFromMarket(entry.item, entry.cost, entry.itemType);
    setPurchased(prev => ({ ...prev, [idx]: true }));
  };

  const handleUpgrade = (tech) => {
    actions.upgradeTechniqueWithShard(tech.id);
    setUpgradedTechs(prev => ({ ...prev, [tech.id]: (prev[tech.id] || 0) + 1 }));
  };

  const handleLeave = () => {
    actions.leaveNode();
  };

  // Techniques eligible for shard upgrade
  const upgradableTechs = runState.techniques.filter(t => {
    const appliedUpgrade = t.appliedUpgrade || 0;
    if (appliedUpgrade >= 2) return false;
    const nextUpgradeText = appliedUpgrade === 0 ? t.upgradeI : t.upgradeII;
    return !!nextUpgradeText;
  });
  const hasShards = (runState.techniqueShards || 0) > 0;

  return (
    <div style={S.container}>
      <div style={S.title}>黑市 · Black Market</div>
      <div style={S.subtitle}>Strange goods for those who know where to look</div>

      <div style={S.panel}>
        <div style={S.silverRow}>
          <span style={{ fontSize: '13px', color: '#c8a96e88' }}>Silver on hand</span>
          <span style={{ fontSize: '18px', color: '#e8c87e' }}>💰 {runState.silver}</span>
        </div>
        <div style={S.shopGrid}>
          {inventory.map((entry, idx) => {
            const canAfford = runState.silver >= entry.cost && !purchased[idx];
            const isPurchased = !!purchased[idx];
            return (
              <div key={idx} style={S.shopItem(canAfford || isPurchased, isPurchased)}>
                <div style={S.itemInfo}>
                  <div style={S.itemName}>{entry.item.name}</div>
                  <div>
                    <span style={S.itemType(entry.itemType)}>{entry.itemType === 'relic' ? 'Relic' : 'Technique'}</span>
                    {entry.itemType === 'technique' && entry.item.tags?.map(tag => (
                      <span key={tag} style={{ fontSize: '10px', color: '#c8a96e66', marginRight: '4px' }}>[{tag}]</span>
                    ))}
                  </div>
                  <div style={S.itemDesc}>{entry.item.description}</div>
                </div>
                <div style={S.buyArea}>
                  <div style={S.costLabel}>{entry.cost}💰</div>
                  <button
                    style={S.buyBtn(canAfford, isPurchased)}
                    onClick={() => handleBuy(entry, idx)}
                    disabled={!canAfford || isPurchased}
                  >
                    {isPurchased ? '✓ Bought' : 'Buy'}
                  </button>
                </div>
              </div>
            );
          })}
          {inventory.length === 0 && (
            <div style={{ textAlign: 'center', color: '#c8a96e44', padding: '20px' }}>
              The merchant has nothing left to offer.
            </div>
          )}
        </div>
      </div>

      {/* ── Technique Forge ───────────────────────────────────────── */}
      <div style={S.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '16px', color: '#e8c87e', letterSpacing: '0.1em' }}>⚒ 技藝淬煉 · Technique Forge</div>
            <div style={{ fontSize: '11px', color: '#c8a96e66', marginTop: '2px' }}>Spend a Technique Shard to unlock an upgrade on an owned technique</div>
          </div>
          <div style={{ fontSize: '13px', color: (runState.techniqueShards || 0) > 0 ? '#e8c87e' : '#c8a96e44', background: '#2a1e10', padding: '4px 12px', borderRadius: '2px', border: '1px solid #c8a96e33' }}>
            🔮 {runState.techniqueShards || 0} shard{(runState.techniqueShards || 0) !== 1 ? 's' : ''}
          </div>
        </div>
        {upgradableTechs.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#c8a96e44', textAlign: 'center', padding: '12px' }}>
            {runState.techniques.length === 0
              ? 'No techniques to upgrade — acquire techniques first.'
              : 'All owned techniques are already at maximum upgrade tier.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upgradableTechs.map(tech => {
              const appliedUpgrade = (tech.appliedUpgrade || 0) + (upgradedTechs[tech.id] || 0);
              const nextUpgradeText = appliedUpgrade === 0 ? tech.upgradeI : tech.upgradeII;
              const tierLabel = appliedUpgrade === 0 ? 'Chapter I' : 'Chapter II';
              const alreadyUpgraded = upgradedTechs[tech.id] > 0;
              const canUpgrade = hasShards && !alreadyUpgraded && !!nextUpgradeText;
              return (
                <div key={tech.id} style={{
                  padding: '14px',
                  background: alreadyUpgraded ? '#1a2a1a' : '#2a1e10',
                  border: `1px solid ${alreadyUpgraded ? '#4a8b4a55' : '#c8a96e33'}`,
                  borderRadius: '2px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#e8c87e', marginBottom: '3px' }}>{tech.name}</div>
                    <div style={{ fontSize: '11px', color: '#c8a96e66', marginBottom: '6px' }}>{tech.tags?.join(' · ')}</div>
                    {nextUpgradeText && !alreadyUpgraded && (
                      <div style={{ fontSize: '11px', color: '#88aacc', lineHeight: '1.5' }}>
                        <span style={{ color: '#4a88cc88', marginRight: '4px' }}>{tierLabel}:</span>{nextUpgradeText}
                      </div>
                    )}
                    {alreadyUpgraded && (
                      <div style={{ fontSize: '11px', color: '#6abf6a' }}>✓ Upgrade applied this visit</div>
                    )}
                  </div>
                  <button
                    style={{
                      marginLeft: '16px',
                      padding: '8px 14px',
                      background: alreadyUpgraded ? 'transparent' : canUpgrade ? '#1a2a3a' : '#1a1208',
                      border: `1px solid ${alreadyUpgraded ? '#4a8b4a' : canUpgrade ? '#4a88cc' : '#c8a96e22'}`,
                      color: alreadyUpgraded ? '#4a8b4a' : canUpgrade ? '#88aaee' : '#c8a96e33',
                      fontFamily: 'serif',
                      fontSize: '12px',
                      cursor: canUpgrade ? 'pointer' : 'not-allowed',
                      borderRadius: '2px',
                      minWidth: '80px',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => canUpgrade && handleUpgrade(tech)}
                    disabled={!canUpgrade}
                  >
                    {alreadyUpgraded ? '✓ Done' : hasShards ? '🔮 Upgrade' : 'No Shards'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {!hasShards && upgradableTechs.length > 0 && (
          <div style={{ fontSize: '11px', color: '#c8a96e44', marginTop: '10px', textAlign: 'center', fontStyle: 'italic' }}>
            Acquire technique shards by choosing "Observe from afar" at Wandering Master encounters or teaching students at events.
          </div>
        )}
      </div>

      <button style={S.leaveBtn} onClick={handleLeave}>
        離開 · Leave Market
      </button>
    </div>
  );
}
