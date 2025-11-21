import { useState, type FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/common/Button/Button';
import { Input } from '@components/common/Input/Input';
import { Toast } from '@components/common/Toast/Toast';
import { useGame } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import './Home.css';

export const Home: FC = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { createRoom, joinRoom } = useGame();
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    login,
    logout,
    loginError,
    clearLoginError
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem('playerName', user.name || user.username || 'Player');
      localStorage.setItem('playerId', user.localAccountId || `player_${Date.now()}`);
    }
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    setError(null);
    await login();
  };

  const handleContinue = () => {
    if (isAuthenticated) {
      setShowOptions(true);
    }
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const playerName = localStorage.getItem('playerName') || 'Player';
      const response = await createRoom(`${playerName}'s Room`, 4, 'default-map-001');
      localStorage.setItem('sessionId', response.roomId);

      const playerId = localStorage.getItem('playerId') || `player_${Date.now()}`;
      const username = localStorage.getItem('playerName') || 'Anonymous';
      await joinRoom(response.roomCode, playerId, username);

      navigate(`/lobby?roomId=${response.roomCode}`);
    } catch (err) {
      setError('Error al crear la sala.\nIntenta de nuevo.');
      console.error('Error creating room:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Ingresa un código de sala válido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const playerId = localStorage.getItem('playerId') || `player_${Date.now()}`;
      const username = localStorage.getItem('playerName') || 'Anonymous';
      await joinRoom(roomCode, playerId, username);
      localStorage.setItem('sessionId', roomCode);
      navigate(`/lobby?roomId=${roomCode}`);
    } catch (err) {
      setError('No se pudo unir a la sala.\nVerifica el código.');
      console.error('Error joining room:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
        <div className="home-container">
          <h1 className="game-title">BomberDino</h1>
          <p className="loading-text">Cargando...</p>
        </div>
    );
  }

  return (
      <div className="home-container">
        <div className="dino-top-left"></div>
        <div className="dino-top-right"></div>
        <div className="dino-bottom-left"></div>
        <div className="dino-bottom-right"></div>

        {loginError && (
            <Toast
                message={loginError}
                type="error"
                onClose={clearLoginError}
                duration={6000}
            />
        )}

        {error && (
            <Toast
                message={error}
                type="error"
                onClose={() => setError(null)}
                duration={5000}
            />
        )}

        {!isAuthenticated ? (
            <>
              <h1 className="game-title">BomberDino</h1>
              <div className="name-input-section">
                <p className="auth-message">Inicia Sesión</p>
                <button
                    onClick={handleLogin}
                    disabled={authLoading}
                    className="microsoft-login-btn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
                    <rect x="11" y="1" width="10" height="10" fill="#7fba00"/>
                    <rect x="1" y="11" width="10" height="10" fill="#00a4ef"/>
                    <rect x="11" y="11" width="10" height="10" fill="#ffb900"/>
                  </svg>
                  <span>Continuar con Microsoft</span>
                </button>
              </div>
            </>
        ) : !showOptions ? (
            <>
              <h1 className="game-title">BomberDino</h1>
              <div className="name-input-section">
                <p className="welcome-message">¡Bienvenido, {user?.name || 'Jugador'}!</p>
                <Button onClick={handleContinue}>Continuar</Button>
                <Button onClick={logout} variant="secondary">
                  Cerrar sesión
                </Button>
              </div>
            </>
        ) : (
            <>
              <h1 className="game-title">¡Empieza a Jugar!</h1>
              <div className="options-section">
                <Button onClick={handleCreateRoom} disabled={isLoading}>
                  {isLoading ? 'Creando...' : 'Crear Sala'}
                </Button>
                <div className="join-section">
                  <Button onClick={handleJoinRoom} variant="secondary" disabled={isLoading}>
                    {isLoading ? 'Uniéndose...' : 'Entrar a Sala'}
                  </Button>
                  <Input
                      value={roomCode}
                      onChange={setRoomCode}
                      placeholder="Código de sala"
                      maxLength={6}
                  />
                </div>
                <Button onClick={() => setShowOptions(false)} variant="secondary">
                  Volver
                </Button>
              </div>
            </>
        )}
      </div>
  );
};
