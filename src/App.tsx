import { AuthProvider } from '@/context/AuthContext';
import { GameProvider } from '@/context/GameContext';
import { AppRoutes } from '@/routes/AppRoutes';
import './App.css';

function App() {
    return (
        <AuthProvider>
            <GameProvider>
                <AppRoutes />
            </GameProvider>
        </AuthProvider>
    );
}

export default App;
