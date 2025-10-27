import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/common/Button/Button';
import { DinoColor } from '@/types/game-types';
import './Lobby.css';

interface Player {
  id: string;
  name: string;
  color: DinoColor;
  ready: boolean;
}

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [currentPlayerId] = useState(`player_${Date.now()}`);
  const [players, setPlayers] = useState<Player[]>([]);

  React.useEffect(() => {
    const playerName = localStorage.getItem('playerName');
    if (!playerName) {
      navigate('/');
      return;
    }

    const code = Array.from(
      { length: 6 },
      () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)],
    ).join('');
    setRoomCode(code);

    const newPlayer: Player = {
      id: currentPlayerId,
      name: playerName,
      color: DinoColor.ORANGE,
      ready: false,
    };
    setPlayers([newPlayer]);
  }, [navigate, currentPlayerId]);

  const toggleReady = (playerId: string) => {
    setPlayers(players.map((p) => (p.id === playerId ? { ...p, ready: !p.ready } : p)));
  };

  const allReady = players.every((p) => p.ready);

  const handleStart = () => {
    if (allReady) {
      navigate('/game');
    }
  };

  const getDinoImage = (color: DinoColor) => `/dinos/dino-${color}.png`;

  const renderPlayerSlots = () => {
    const slots = [];
    for (let i = 0; i < 4; i++) {
      const player = players[i];
      slots.push(
        <div key={i} className={`player-card ${!player ? 'empty' : ''}`}>
          {player ? (
            <>
              <div className="player-name">{player.name}</div>
              <img src={getDinoImage(player.color)} alt={player.name} className="player-avatar" />
              <button
                className={`ready-btn ${player.ready ? 'ready' : 'not-ready'}`}
                onClick={() => toggleReady(player.id)}
              >
                {player.ready ? 'LISTO' : 'NO LISTO'}
              </button>
            </>
          ) : (
            <>
              <div className="player-name empty-text">Esperando...</div>
              <div className="player-avatar-empty">?</div>
            </>
          )}
        </div>,
      );
    }
    return slots;
  };

  return (
    <div className="lobby-wrapper">
      <header className="lobby-header">
        <h1 className="lobby-logo">BomberDino</h1>
        <div className="room-code" onClick={() => navigator.clipboard.writeText(roomCode)}>
          {roomCode}
        </div>
      </header>

      <div className="lobby-content">
        <div className="players-container">{renderPlayerSlots()}</div>

        {allReady && players.length >= 1 && (
          <Button onClick={handleStart} variant="primary">
            INICIAR JUEGO
          </Button>
        )}
      </div>
    </div>
  );
};
