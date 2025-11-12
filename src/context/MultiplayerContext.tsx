// import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
// import Peer, { type DataConnection } from 'peerjs';
//
// interface PlayerUpdate {
//   type: 'MOVE' | 'BOMB' | 'STATE_UPDATE';
//   playerId: string;
//   data: never;
// }
//
// interface MultiplayerContextType {
//   isHost: boolean;
//   roomId: string | null;
//   connectedPlayers: string[];
//   localPlayerId: string;
//   joinRoom: (roomId: string) => void;
//   createRoom: () => void;
//   sendUpdate: (update: PlayerUpdate) => void;
//   onPlayerUpdate: (callback: (update: PlayerUpdate) => void) => void;
// }
//
// const MultiplayerContext = createContext<MultiplayerContextType | null>(null);
//
// export const useMultiplayer = () => {
//   const context = useContext(MultiplayerContext);
//   if (!context) {
//     throw new Error('useMultiplayer must be used within MultiplayerProvider');
//   }
//   return context;
// };
//
// interface Props {
//   children: ReactNode;
// }
//
// export const MultiplayerProvider = ({ children }: Props) => {
//   const [peer, setPeer] = useState<Peer | null>(null);
//   const [roomId, setRoomId] = useState<string | null>(null);
//   const [isHost, setIsHost] = useState(false);
//   const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);
//   const [localPlayerId, setLocalPlayerId] = useState<string>('');
//
//   const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
//   const updateCallbacksRef = useRef<((update: PlayerUpdate) => void)[]>([]);
//
//   useEffect(() => {
//     const newPeer = new Peer({
//       config: {
//         iceServers: [
//           { urls: 'stun:stun.l.google.com:19302' },
//           { urls: 'stun:global.stun.twilio.com:3478' },
//         ],
//       },
//     });
//
//     newPeer.on('open', (id) => {
//       console.log('Peer ID:', id);
//       setLocalPlayerId(id);
//       setPeer(newPeer);
//     });
//
//     newPeer.on('connection', (conn) => {
//       console.log('Nueva conexión entrante:', conn.peer);
//       setupConnection(conn);
//     });
//
//     newPeer.on('error', (err) => {
//       console.error('Peer error:', err);
//     });
//
//     return () => {
//       connectionsRef.current.forEach((conn) => conn.close());
//       newPeer.destroy();
//     };
//   }, []);
//
//   const setupConnection = (conn: DataConnection) => {
//     conn.on('open', () => {
//       console.log('Conexión establecida con:', conn.peer);
//       connectionsRef.current.set(conn.peer, conn);
//       setConnectedPlayers((prev) => [...prev, conn.peer]);
//
//       // Si soy el host, enviar el estado actual del juego
//       if (isHost) {
//         conn.send({
//           type: 'INITIAL_STATE',
//           playerId: localPlayerId,
//           data: {
//             hostId: localPlayerId,
//             players: Array.from(connectionsRef.current.keys()),
//           },
//         });
//       }
//     });
//
//     conn.on('data', (data: any) => {
//       console.log('Datos recibidos:', data);
//       updateCallbacksRef.current.forEach((callback) => callback(data));
//     });
//
//     conn.on('close', () => {
//       console.log('Conexión cerrada con:', conn.peer);
//       connectionsRef.current.delete(conn.peer);
//       setConnectedPlayers((prev) => prev.filter((p) => p !== conn.peer));
//     });
//
//     conn.on('error', (err) => {
//       console.error('Error en conexión:', err);
//     });
//   };
//
//   const createRoom = () => {
//     if (!peer) return;
//
//     setIsHost(true);
//     setRoomId(peer.id);
//     setConnectedPlayers([peer.id]);
//     console.log('Sala creada:', peer.id);
//   };
//
//   const joinRoom = (hostId: string) => {
//     if (!peer) return;
//
//     console.log('Conectando a sala:', hostId);
//     const conn = peer.connect(hostId, { reliable: true });
//     setupConnection(conn);
//     setRoomId(hostId);
//     setIsHost(false);
//   };
//
//   const sendUpdate = (update: PlayerUpdate) => {
//     connectionsRef.current.forEach((conn) => {
//       if (conn.open) {
//         conn.send(update);
//       }
//     });
//   };
//
//   const onPlayerUpdate = (callback: (update: PlayerUpdate) => void) => {
//     updateCallbacksRef.current.push(callback);
//   };
//
//   return (
//     <MultiplayerContext.Provider
//       value={{
//         isHost,
//         roomId,
//         connectedPlayers,
//         localPlayerId,
//         joinRoom,
//         createRoom,
//         sendUpdate,
//         onPlayerUpdate,
//       }}
//     >
//       {children}
//     </MultiplayerContext.Provider>
//   );
// };
