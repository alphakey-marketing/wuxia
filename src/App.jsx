import { GameProvider, useGame } from './store/gameStore.jsx';
import TitleScreen from './components/TitleScreen.jsx';
import LineageSelect from './components/LineageSelect.jsx';
import NodeMap from './components/NodeMap.jsx';
import CombatScreen from './components/CombatScreen.jsx';
import EventScreen from './components/EventScreen.jsx';
import RewardDraft from './components/RewardDraft.jsx';
import LegacyScreen from './components/LegacyScreen.jsx';
import SectArchive from './components/SectArchive.jsx';
import HealerNode from './components/HealerNode.jsx';
import BlackMarketScreen from './components/BlackMarketScreen.jsx';
import WanderingMasterScreen from './components/WanderingMasterScreen.jsx';

const SCREEN_MAP = {
  title: TitleScreen,
  lineageSelect: LineageSelect,
  nodeMap: NodeMap,
  combat: CombatScreen,
  event: EventScreen,
  reward: RewardDraft,
  legacy: LegacyScreen,
  sectArchive: SectArchive,
  healer: HealerNode,
  blackMarket: BlackMarketScreen,
  wanderingMaster: WanderingMasterScreen
};

function GameRouter() {
  const { state } = useGame();
  const Screen = SCREEN_MAP[state.gamePhase] || TitleScreen;
  return (
    <div style={{ minHeight: '100vh', background: '#1a1208' }}>
      <Screen />
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameRouter />
    </GameProvider>
  );
}
