import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@components/common/Button/Button';
import { useGame } from '@/context/GameContext';
import { DinoColor } from '@/types/game-types';
import './Lobby.css';

interface LobbyPlayer {
  id: string;
  name: string;
  color: DinoColor;
  ready: boolean;
}

export const Lobby: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { gameState, sessionId } = useGame();

  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);

  useEffect(() => {
    console.log('🔍 GameState:', gameState);
  }, [gameState]);

  useEffect(() => {
    const playerName = localStorage.getItem('playerName');
    if (!playerName) {
      navigate('/');
      return;
    }

    const roomId = searchParams.get('roomId') || sessionId;
    if (roomId) {
      setRoomCode(roomId.substring(0, 6).toUpperCase());
    }
  }, [navigate, searchParams, sessionId]);

  useEffect(() => {
    if (gameState) {
      const colors = [DinoColor.BLUE, DinoColor.GREEN, DinoColor.ORANGE, DinoColor.PURPLE];

      const lobbyPlayers: LobbyPlayer[] = gameState.players.map((p, idx) => ({
        id: p.id,
        name: p.username,
        color: colors[idx % colors.length],
        ready: false,
      }));

      setPlayers(lobbyPlayers);
    }
  }, [gameState]);

  const handleStartGame = () => {
    navigate('/game');
  };

  const getDinoImage = (color: DinoColor) => `/assets/images/avatars/dino-${color}.png`;

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
        <div className="room-code" onClick={() => navigator.clipboard.writeText(sessionId || '')}>
          {roomCode}
        </div>
      </header>

      <div className="lobby-content">
        <div className="players-container">{renderPlayerSlots()}</div>

        {players.length >= 2 && (
          <Button onClick={handleStartGame} variant="primary">
            INICIAR JUEGO
          </Button>
        )}
      </div>
    </div>
  );
};
