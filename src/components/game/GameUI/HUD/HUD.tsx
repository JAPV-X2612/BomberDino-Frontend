import type { FC } from 'react';
import type { Player } from '@/types/game-types';
import './HUD.css';

interface HUDProps {
    players?: Player[];
    timeRemaining?: number;
}

export const Hud: FC<HUDProps> = ({ players, timeRemaining = 180 }) => {
    // Mock hardcoded players for visual testing
    const mockPlayers: Player[] = players ?? [
        { id: 'player-0', name: 'Player 1', color: 'blue', lives: 3, isAlive: true },
        { id: 'player-1', name: 'Player 2', color: 'green', lives: 3, isAlive: true },
        { id: 'player-2', name: 'Player 3', color: 'orange', lives: 3, isAlive: true },
        { id: 'player-3', name: 'Player 4', color: 'purple', lives: 3, isAlive: true },
    ];

    return (
        <div className="hud-container">
            <div className="players-status">
                {mockPlayers.map((player) => (
                    <div
                        key={player.id}
                        className={`player-hud player-hud-${player.color} ${!player.isAlive ? 'dead' : ''}`}
                    >
                        <div className="player-hud-icon"></div>
                        <div className="player-hud-info">
                            <span className="player-hud-name">{player.name}</span>
                            <div className="lives">
                                {Array.from({ length: player.lives }).map((_, i) => (
                                    <span key={`${player.id}-heart-${i}`} className="heart">
                    ❤️
                  </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="time-remaining">Time Remaining: {timeRemaining}s</div>
        </div>
    );
};
