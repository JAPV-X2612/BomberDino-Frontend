// import React from 'react';
// import type { Player } from '@/types/game-types';
// import './PlayerList.css';
//
// interface PlayerListProps {
//   players: Player[];
//   maxPlayers: number;
// }
//
// export const PlayerList: React.FC<PlayerListProps> = ({ players, maxPlayers }) => {
//   const emptySlots = maxPlayers - players.length;
//
//   return (
//     <div className="player-list">
//       <h3 className="player-list-title">
//         Jugadores ({players.length}/{maxPlayers})
//       </h3>
//       <div className="players-grid">
//         {players.map((player) => (
//           <div key={player.id} className={`player-card player-${player.color}`}>
//             <div className="player-dino-icon"></div>
//             <span className="player-name">{player.name}</span>
//             <span className="player-status">LISTO</span>
//           </div>
//         ))}
//         {Array.from({ length: emptySlots }).map((_, index) => (
//           <div key={`empty-slot-${index + players.length}`} className="player-card player-empty">
//             <span className="empty-text">Esperando...</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
