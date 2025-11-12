import { GameProvider } from '@/context/GameContext';
import { AppRoutes } from '@/routes/AppRoutes';
import './App.css';

function App() {
  return (
      <GameProvider>
        <AppRoutes />
      </GameProvider>
  );
}

export default App;
