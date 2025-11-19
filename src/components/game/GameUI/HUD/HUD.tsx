import type { FC } from 'react';
import type { Player } from '@/types/game-types';
import './HUD.css';

interface HUDProps {
  players: Player[];
  timeRemaining: number;
}

export const Hud: FC<HUDProps> = ({ players, timeRemaining }) => {
  return (
    <div className="hud-container">
      <div className="players-status">
        {players.map((player) => {
          const maxLives = 3; // o el valor que uses como máximo
          const heartsRemaining = maxLives - player.deaths;

          return (
            <div
              key={player.id}
              className={`player-hud player-hud-${player.color} ${!player.isAlive ? 'dead' : ''}`}
            >
              <div className="player-hud-icon"></div>
              <div className="player-hud-info">
                <span className="player-hud-name">{player.name}</span>
                <div className="lives">
                  {Array.from({ length: heartsRemaining }).map((_, i) => (
                    <span key={`${player.id}-heart-${i}`} className="heart">
                      ❤️
                    </span>
                  ))}
                  {heartsRemaining <= 0 && <span className="dead-indicator">💀</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="time-remaining">Time Remaining: {timeRemaining}s</div>
    </div>
  );
};
