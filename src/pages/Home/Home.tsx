import { useState, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/common/Button/Button';
import { Input } from '@components/common/Input/Input';
import './Home.css';

export const Home: FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (playerName.trim()) {
      localStorage.setItem('playerName', playerName);
      setShowOptions(true);
    }
  };

  const handleCreateRoom = () => {
    navigate('/lobby?create=true');
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      navigate(`/lobby?code=${roomCode}`);
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
            <Button onClick={handleStart} disabled={!playerName.trim()}>
              Ingresar
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="game-title">¡Empieza a Jugar!</h1>
          <div className="options-section">
            <Button onClick={handleCreateRoom}>Crear Sala</Button>
            <div className="join-section">
              <Button onClick={handleJoinRoom} variant="secondary">
                Entrar a Sala
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
