import { useState, useEffect, type FC } from 'react';
import { GameCanvas } from '@components/game/GameCanvas/GameCanvas';
import { Hud } from '@components/game/GameUI/HUD/HUD';
import { DinoColor } from '@/types/game-types';
import './GamePage.css';

export const GamePage: FC = () => {
    const [players, setPlayers] = useState([
        {
            id: 'player-0',
            name: 'Player 1',
            color: DinoColor.BLUE,
            position: { x: 0, y: 0 },
            lives: 3,
            speed: 1,
            bombRange: 1,
            maxBombs: 1,
            isAlive: true,
        },
        {
            id: 'player-1',
            name: 'Player 2',
            color: DinoColor.GREEN,
            position: { x: 0, y: 0 },
            lives: 3,
            speed: 1,
            bombRange: 1,
            maxBombs: 1,
            isAlive: true,
        },
        {
            id: 'player-2',
            name: 'Player 3',
            color: DinoColor.ORANGE,
            position: { x: 0, y: 0 },
            lives: 3,
            speed: 1,
            bombRange: 1,
            maxBombs: 1,
            isAlive: true,
        },
        {
            id: 'player-3',
            name: 'Player 4',
            color: DinoColor.PURPLE,
            position: { x: 0, y: 0 },
            lives: 3,
            speed: 1,
            bombRange: 1,
            maxBombs: 1,
            isAlive: true,
        },
    ]);

    useEffect(() => {
        const updatePlayersWithDamage = (
            playersArr: typeof players,
            playerId: string,
            lives: number,
        ) => {
            return playersArr.map((p) =>
                p.id === playerId ? { ...p, lives, isAlive: lives > 0 } : p,
            );
        };

        const handlePlayerDamage = (event: CustomEvent) => {
            const { playerId, lives } = event.detail;
            setPlayers((prev) => updatePlayersWithDamage(prev, playerId, lives));
        };

        globalThis.addEventListener('player-damage', handlePlayerDamage as EventListener);

        return () => {
            globalThis.removeEventListener('player-damage', handlePlayerDamage as EventListener);
        };
    }, []);

    return (
        <div className="game-page">
            <Hud players={players} timeRemaining={0} />
            <GameCanvas />
        </div>
    );
};

