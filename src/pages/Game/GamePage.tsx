import { useState, useEffect, useRef, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameCanvas } from '@components/game/GameCanvas/GameCanvas';
import { Hud } from '@components/game/GameUI/HUD/HUD';
import { useGame } from '@/context/GameContext';
import { DinoColor } from '@/types/game-types';
import type { PlayerDTO } from '@/types/websocket-types';
import './GamePage.css';

interface GamePlayer {
  id: string;
  name: string;
  color: DinoColor;
  position: { x: number; y: number };
  lives: number;
  speed: number;
  bombRange: number;
  maxBombs: number;
  isAlive: boolean;
}

export const GamePage: FC = () => {
  const navigate = useNavigate();
  const { gameState, sessionId, playerId, isConnected } = useGame();
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionId || !playerId) {
      console.warn('No session or player ID, redirecting to home');
      navigate('/');
    }

    if (!isConnected) {
      console.warn('WebSocket not connected');
    }
  }, [sessionId, playerId, isConnected, navigate]);

  useEffect(() => {
    if (gameState && gameState.players.length > 0) {
      const colors = [DinoColor.BLUE, DinoColor.GREEN, DinoColor.ORANGE, DinoColor.PURPLE];

      const mappedPlayers: GamePlayer[] = gameState.players.map((p: PlayerDTO, idx: number) => ({
        id: p.id,
        name: p.username,
        color: colors[idx % colors.length],
        position: { x: p.posX, y: p.posY },
        lives: p.lifeCount,
        speed: p.speed,
        bombRange: p.bombRange,
        maxBombs: p.bombCount,
        isAlive: p.status === 'ALIVE',
      }));

      setPlayers(mappedPlayers);
    }
  }, [gameState]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handlePlayerDamage = (event: CustomEvent) => {
      const { playerId: damagedPlayerId, lives } = event.detail;
      setPlayers((prev) =>
        prev.map((p) => (p.id === damagedPlayerId ? { ...p, lives, isAlive: lives > 0 } : p)),
      );
    };

    window.addEventListener('player-damage', handlePlayerDamage as EventListener);

    return () => {
      window.removeEventListener('player-damage', handlePlayerDamage as EventListener);
    };
  }, []);

  useEffect(() => {
    const alivePlayers = players.filter((p) => p.isAlive);
    if (alivePlayers.length === 1 && players.length > 1) {
      console.log('Game Over: Winner is', alivePlayers[0].name);
    }
  }, [players]);

  if (!sessionId || !playerId) {
    return (
      <div className="game-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: 'white' }}>Cargando...</h2>
      </div>
    );
  }

  return (
    <div className="game-page">
      <Hud players={players} timeRemaining={timeRemaining} />
      <GameCanvas />
    </div>
  );
};
