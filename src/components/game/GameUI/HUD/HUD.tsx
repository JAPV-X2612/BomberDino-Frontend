import { type FC } from 'react';
import './HUD.css';

interface Player {
    id: string;
    name: string;
    lives: number;
    isAlive: boolean;
}

interface HudProps {
    players: Player[];
    timeRemaining: number;
}

export const Hud: FC<HudProps> = ({ players, timeRemaining }) => {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="hud-container">
            <div className="hud-timer">{formatTime(timeRemaining)}</div>
            <div className="hud-players">
                {players.map((player) => (
                    <div key={player.id} className={`hud-player ${!player.isAlive ? 'dead' : ''}`}>
                        <span className="hud-player-name">{player.name}</span>
                        <span className="hud-player-lives">❤️ x{player.lives}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
