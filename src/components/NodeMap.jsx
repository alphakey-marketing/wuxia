import { useGame } from '../store/gameStore.jsx';
import { getNodeIcon, getNodeColor } from '../utils/nodeMap.js';
import BuildSummary from './BuildSummary.jsx';

const PHASE_LABELS = { 1: '第一章 · Chapter I', 2: '第二章 · Chapter II', 3: '第三章 · Chapter III' };
const NODE_TYPE_LABELS = {
  combat: 'Battle', elite: 'Elite Battle', boss: 'Final Boss',
  event: 'Event', healer: 'Healer', wanderingMaster: 'Wandering Master',
  sectTrial: 'Sect Trial', hiddenCave: 'Hidden Cave', ambush: 'Ambush',
  majorEvent: 'Major Event', manualPage: 'Ancient Manual', fork: 'Fork',
  blackMarket: 'Black Market'
};

const BRANCH_COLORS = {
  event: '#2d4a2d', healer: '#2d5a27', combat: '#6e3a1a', elite: '#8b1a1a',
  hiddenCave: '#3a2d1a', blackMarket: '#4a2a1a', wanderingMaster: '#4a3a6e',
  sectTrial: '#3a4a6e', ambush: '#6e3a1a'
};

const BRANCH_ICONS = {
  event: '📜', healer: '💊', combat: '⚔️', elite: '💀', hiddenCave: '🕳️',
  blackMarket: '🏮', wanderingMaster: '🧙', sectTrial: '🏯', ambush: '🗡️'
};

const S = {
  container: {
    minHeight: '100vh',
    background: '#1a1208',
    color: '#c8a96e',
    fontFamily: 'serif',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '900px', marginBottom: '20px' },
  title: { fontSize: '20px', color: '#e8c87e', letterSpacing: '0.2em' },
  mapArea: {
    width: '100%',
    maxWidth: '900px',
    background: '#1e1508',
    border: '1px solid #c8a96e44',
    borderRadius: '4px',
    padding: '30px 20px',
    marginBottom: '20px'
  },
  phaseRow: { display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'flex-start' },
  phaseLabel: { color: '#c8a96e88', fontSize: '12px', letterSpacing: '0.1em', minWidth: '140px', paddingTop: '24px' },
  nodeGroup: { display: 'flex', gap: '8px', flex: 1, alignItems: 'center' },
  node: (type, isCurrent, isPast, isNext) => ({
    width: '72px',
    height: '72px',
    background: isPast ? '#111' : isNext ? '#2a1e10' : '#1a1208',
    border: `2px solid ${isCurrent ? '#e8c87e' : isPast ? '#333' : isNext ? '#c8a96e' : '#c8a96e44'}`,
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isNext ? 'pointer' : 'default',
    opacity: isPast ? 0.4 : 1,
    transition: 'all 0.2s',
    position: 'relative',
    boxShadow: isCurrent ? `0 0 12px ${getNodeColor(type)}88` : 'none'
  }),
  nodeIcon: { fontSize: '22px', marginBottom: '2px' },
  nodeLabel: {
    fontSize: '9px',
    color: '#e8c87e',
    textAlign: 'center',
    letterSpacing: '0.05em'
  },
  currentDot: {
    position: 'absolute',
    top: '-6px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '8px',
    height: '8px',
    background: '#e8c87e',
    borderRadius: '50%'
  },
  connector: { width: '20px', height: '2px', background: '#c8a96e33', alignSelf: 'center', flexShrink: 0 },
  forkWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    position: 'relative'
  },
  forkBranch: (chosen, locked) => ({
    padding: '8px 12px',
    background: chosen ? '#2a3a1a' : locked ? '#111' : '#2a1e10',
    border: `1px solid ${chosen ? '#6abf6a' : locked ? '#333' : '#c8a96e55'}`,
    borderRadius: '3px',
    cursor: locked ? 'default' : 'pointer',
    opacity: locked ? 0.4 : 1,
    minWidth: '110px',
    transition: 'all 0.2s'
  }),
  forkBranchHeader: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' },
  forkBranchIcon: { fontSize: '12px' },
  forkBranchLabel: { fontSize: '10px', color: '#e8c87e', fontWeight: 'bold' },
  forkBranchDesc: { fontSize: '9px', color: '#c8a96e88', lineHeight: '1.3' },
  forkChosenBadge: { fontSize: '9px', color: '#6abf6a', marginTop: '2px' },
  legend: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '12px',
    background: '#1e1508',
    border: '1px solid #c8a96e22',
    borderRadius: '4px',
    maxWidth: '900px',
    width: '100%',
    marginBottom: '20px'
  },
  legendItem: { display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#c8a96e88' }
};

const PHASE_MAP = [
  { phase: 1, nodes: [0, 1, 2] },
  { phase: 2, nodes: [3, 4, 5, 6] },
  { phase: 3, nodes: [7, 8, 9] }
];

export default function NodeMap() {
  const { state, actions } = useGame();
  const { runState } = state;
  const { nodeMap, currentNode } = runState;

  const canTravel = (nodeIndex) => nodeIndex === currentNode + 1 || (nodeIndex === currentNode && nodeIndex === 0);
  const isPast = (nodeIndex) => nodeIndex < currentNode;
  const isCurrent = (nodeIndex) => nodeIndex === currentNode;

  const renderForkNode = (node, nodeIdx) => {
    const forkKey = `fork_${nodeIdx}`;
    const chosenBranch = runState.run_flags[forkKey];
    const isForkCurrent = isCurrent(nodeIdx);
    const forkTravelable = canTravel(nodeIdx);
    return (
      <div style={S.forkWrapper} title="Fork — choose your path">
        {node.branches.map((branch, bi) => {
          const isChosen = chosenBranch === bi;
          const isLocked = chosenBranch !== undefined && chosenBranch !== bi;
          const canClick = forkTravelable && !isCurrent(nodeIdx) && chosenBranch === undefined;
          return (
            <div
              key={bi}
              style={S.forkBranch(isChosen, isLocked || (!forkTravelable && !isCurrent(nodeIdx)))}
              onClick={() => canClick && actions.chooseFork(nodeIdx, bi)}
            >
              <div style={S.forkBranchHeader}>
                <span style={S.forkBranchIcon}>{BRANCH_ICONS[branch.type] || '❓'}</span>
                <span style={S.forkBranchLabel}>{branch.label}</span>
              </div>
              <div style={S.forkBranchDesc}>{branch.description}</div>
              {isChosen && <div style={S.forkChosenBadge}>✓ Chosen</div>}
            </div>
          );
        })}
        {isForkCurrent && chosenBranch === undefined && (
          <div style={{ fontSize: '9px', color: '#ff8800', textAlign: 'center', marginTop: '2px' }}>↑ Choose a path</div>
        )}
      </div>
    );
  };

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>江湖路線 · Path Through Jianghu</div>
        <div style={{ fontSize: '13px', color: '#c8a96e88' }}>
          Node {currentNode + 1} / {nodeMap.length}
        </div>
      </div>

      <div style={S.mapArea}>
        {PHASE_MAP.map(({ phase, nodes }) => (
          <div key={phase} style={S.phaseRow}>
            <div style={S.phaseLabel}>{PHASE_LABELS[phase]}</div>
            <div style={S.nodeGroup}>
              {nodes.map((nodeIdx, i) => {
                const node = nodeMap[nodeIdx];
                if (!node) return null;
                const travelable = canTravel(nodeIdx);
                const isFork = node.type === 'fork';
                return (
                  <div key={nodeIdx} style={{ display: 'flex', alignItems: 'center' }}>
                    {i > 0 && <div style={S.connector} />}
                    {isFork ? (
                      <div style={{ position: 'relative' }}>
                        {isCurrent(nodeIdx) && (
                          <div style={{ ...S.currentDot, top: '-10px', left: '50%' }} />
                        )}
                        {renderForkNode(node, nodeIdx)}
                      </div>
                    ) : (
                      <div
                        style={S.node(node.type, isCurrent(nodeIdx), isPast(nodeIdx), travelable && !isCurrent(nodeIdx))}
                        onClick={() => travelable && !isCurrent(nodeIdx) && actions.travelToNode(nodeIdx)}
                        title={`${NODE_TYPE_LABELS[node.type] || node.type}: ${node.label}`}
                      >
                        {isCurrent(nodeIdx) && <div style={S.currentDot} />}
                        <div style={S.nodeIcon}>{getNodeIcon(node.type)}</div>
                        <div style={S.nodeLabel}>{NODE_TYPE_LABELS[node.type] || node.type}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={S.legend}>
        {[
          ['⚔️', 'Battle'], ['💀', 'Elite'], ['👑', 'Boss'], ['📜', 'Event'],
          ['💊', 'Healer'], ['🧙', 'Master'], ['🏯', 'Sect Trial'], ['⭐', 'Major Event'],
          ['⑂', 'Fork'], ['🏮', 'Market']
        ].map(([icon, label]) => (
          <div key={label} style={S.legendItem}>{icon} {label}</div>
        ))}
      </div>

      <BuildSummary />

      {isCurrent(currentNode) && nodeMap[currentNode] && nodeMap[currentNode].type !== 'fork' && (
        <div style={{ marginTop: '10px', textAlign: 'center', color: '#c8a96e88', fontSize: '13px' }}>
          Click the next node to continue your journey
        </div>
      )}
    </div>
  );
}
