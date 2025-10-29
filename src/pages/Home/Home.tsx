import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/common/Button/Button';
import { Input } from '@components/common/Input/Input';
import { useGame } from '@/context/GameContext';
import './Home.css';

export const Home: FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { createRoom, joinRoom } = useGame();

  const handleStart = () => {
    if (playerName.trim()) {
      localStorage.setItem('playerName', playerName);
      localStorage.setItem('playerId', `player_${Date.now()}`);
      setShowOptions(true);
    }
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await createRoom(`${playerName}'s Room`, 4, 'default-map-001');
      localStorage.setItem('sessionId', response.roomId);
      navigate(`/lobby?roomId=${response.roomId}`);
    } catch (err) {
      setError('Error al crear la sala. Intenta de nuevo.');
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
      setError('No se pudo unir a la sala. Verifica el código.');
      console.error('Error joining room:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="dino-top-left"></div>
      <div className="dino-top-right"></div>
      <div className="dino-bottom-left"></div>
      <div className="dino-bottom-right"></div>

      {!showOptions ? (
        <>
          <h1 className="game-title">BomberDino</h1>
          <div className="name-input-section">
            <Input
              value={playerName}
              onChange={setPlayerName}
              placeholder="Nombre de Usuario"
              maxLength={15}
            />
            <Button onClick={handleStart} disabled={!playerName.trim() || isLoading}>
              Ingresar
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="game-title">¡Empieza a Jugar!</h1>
          <div className="options-section">
            {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
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
          </div>
        </>
      )}
    </div>
  );
};
