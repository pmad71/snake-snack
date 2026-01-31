import { useState, useEffect, useCallback, useRef } from 'react';
import {
  socketManager,
  GameStateData,
  GameOverData,
  SnakeData,
  GameSettings,
} from '../utils/socket';
import { Direction, GameMode, Difficulty } from '../types';

export type MultiplayerState =
  | 'IDLE'
  | 'CONNECTING'
  | 'IN_QUEUE'
  | 'IN_LOBBY'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'GAME_OVER';

export interface MultiplayerPlayer {
  nickname: string;
  isYou?: boolean;
}

export interface UseMultiplayerGameReturn {
  // State
  mpState: MultiplayerState;
  gameState: GameStateData | null;
  countdown: number | null;
  roomCode: string | null;
  players: MultiplayerPlayer[];
  playersOnline: number;
  winner: string | null;
  gameOverReason: string | null;
  finalScores: Array<{ nickname: string; score: number; alive: boolean }> | null;
  error: string | null;
  rematchRequested: string | null;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  joinQueue: (settings?: GameSettings) => void;
  leaveQueue: () => void;
  createRoom: (settings?: GameSettings) => void;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
  sendDirection: (direction: Direction) => void;
  requestRematch: () => void;
  declineRematch: () => void;
  clearError: () => void;
  resetState: () => void;

  // Helpers
  getMySnake: () => SnakeData | null;
  getOpponentSnake: () => SnakeData | null;
  isConnected: boolean;
}

export const useMultiplayerGame = (playerNickname: string): UseMultiplayerGameReturn => {
  const [mpState, setMpState] = useState<MultiplayerState>('IDLE');
  const [gameState, setGameState] = useState<GameStateData | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<MultiplayerPlayer[]>([]);
  const [playersOnline, setPlayersOnline] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);
  const [finalScores, setFinalScores] = useState<Array<{ nickname: string; score: number; alive: boolean }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rematchRequested, setRematchRequested] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const nicknameRef = useRef(playerNickname);
  nicknameRef.current = playerNickname;

  // Setup event listeners
  useEffect(() => {
    const handleConnected = (data: { playersOnline: number }) => {
      setPlayersOnline(data.playersOnline);
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setMpState('IDLE');
      setError('Utracono połączenie z serwerem');
    };

    const handleQueueJoined = (data: { position: number; playersOnline: number }) => {
      setMpState('IN_QUEUE');
      setPlayersOnline(data.playersOnline);
    };

    const handleQueueLeft = () => {
      setMpState('IDLE');
    };

    const handleMatchFound = (data: { roomCode: string; players: MultiplayerPlayer[] }) => {
      setRoomCode(data.roomCode);
      setPlayers(data.players);
      setMpState('IN_LOBBY');
    };

    const handleRoomCreated = (data: { roomCode: string }) => {
      setRoomCode(data.roomCode);
      setPlayers([{ nickname: nicknameRef.current, isYou: true }]);
      setMpState('IN_LOBBY');
    };

    const handleRoomJoined = (data: { roomCode: string; players: Array<{ nickname: string }> }) => {
      setRoomCode(data.roomCode);
      setPlayers(
        data.players.map((p) => ({
          nickname: p.nickname,
          isYou: p.nickname === nicknameRef.current,
        }))
      );
      setMpState('IN_LOBBY');
    };

    const handleRoomLeft = () => {
      setMpState('IDLE');
      setRoomCode(null);
      setPlayers([]);
    };

    const handlePlayerJoined = (data: { nickname: string; players: Array<{ nickname: string }> }) => {
      setPlayers(
        data.players.map((p) => ({
          nickname: p.nickname,
          isYou: p.nickname === nicknameRef.current,
        }))
      );
    };

    const handlePlayerLeft = (data: { nickname: string }) => {
      setPlayers((prev) => prev.filter((p) => p.nickname !== data.nickname));
    };

    const handleCountdown = (data: { seconds: number }) => {
      setMpState('COUNTDOWN');
      setCountdown(data.seconds);
    };

    const handleGameStart = () => {
      setMpState('PLAYING');
      setCountdown(null);
    };

    const handleGameState = (data: GameStateData) => {
      setGameState(data);
      if (mpState !== 'PLAYING' && data.state === 'PLAYING') {
        setMpState('PLAYING');
      }
    };

    const handleGameOver = (data: GameOverData) => {
      console.log('=== GAME_OVER EVENT RECEIVED ===');
      console.log('Winner:', data.winner);
      console.log('Reason:', data.reason);
      console.log('Scores:', JSON.stringify(data.scores));
      setMpState('GAME_OVER');
      setWinner(data.winner);
      setGameOverReason(data.reason);
      setFinalScores(data.scores);
      setRematchRequested(null);
    };

    const handleRematchRequested = (data: { nickname: string }) => {
      setRematchRequested(data.nickname);
    };

    const handleRematchAccepted = () => {
      setRematchRequested(null);
      setWinner(null);
      setGameOverReason(null);
      setFinalScores(null);
      // State will transition through countdown
    };

    const handleRematchDeclined = () => {
      setRematchRequested(null);
    };

    const handleError = (data: { code?: string; message: string }) => {
      setError(data.message);
    };

    // Register listeners
    socketManager.on('connected', handleConnected);
    socketManager.on('disconnected', handleDisconnected);
    socketManager.on('queue_joined', handleQueueJoined);
    socketManager.on('queue_left', handleQueueLeft);
    socketManager.on('match_found', handleMatchFound);
    socketManager.on('room_created', handleRoomCreated);
    socketManager.on('room_joined', handleRoomJoined);
    socketManager.on('room_left', handleRoomLeft);
    socketManager.on('player_joined', handlePlayerJoined);
    socketManager.on('player_left', handlePlayerLeft);
    socketManager.on('countdown', handleCountdown);
    socketManager.on('game_start', handleGameStart);
    socketManager.on('game_state', handleGameState);
    socketManager.on('game_over', handleGameOver);
    socketManager.on('rematch_requested', handleRematchRequested);
    socketManager.on('rematch_accepted', handleRematchAccepted);
    socketManager.on('rematch_declined', handleRematchDeclined);
    socketManager.on('error', handleError);

    // Cleanup
    return () => {
      socketManager.off('connected', handleConnected);
      socketManager.off('disconnected', handleDisconnected);
      socketManager.off('queue_joined', handleQueueJoined);
      socketManager.off('queue_left', handleQueueLeft);
      socketManager.off('match_found', handleMatchFound);
      socketManager.off('room_created', handleRoomCreated);
      socketManager.off('room_joined', handleRoomJoined);
      socketManager.off('room_left', handleRoomLeft);
      socketManager.off('player_joined', handlePlayerJoined);
      socketManager.off('player_left', handlePlayerLeft);
      socketManager.off('countdown', handleCountdown);
      socketManager.off('game_start', handleGameStart);
      socketManager.off('game_state', handleGameState);
      socketManager.off('game_over', handleGameOver);
      socketManager.off('rematch_requested', handleRematchRequested);
      socketManager.off('rematch_accepted', handleRematchAccepted);
      socketManager.off('rematch_declined', handleRematchDeclined);
      socketManager.off('error', handleError);
    };
  }, [mpState]);

  // Actions
  const connect = useCallback(async () => {
    setMpState('CONNECTING');
    setError(null);
    try {
      await socketManager.connect();
      setIsConnected(true);
      setMpState('IDLE');
    } catch (err) {
      setMpState('IDLE');
      setError('Nie można połączyć z serwerem');
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    socketManager.disconnect();
    setIsConnected(false);
    setMpState('IDLE');
    setRoomCode(null);
    setPlayers([]);
    setGameState(null);
  }, []);

  const joinQueue = useCallback(
    (settings?: GameSettings) => {
      socketManager.joinQueue(nicknameRef.current, settings);
    },
    []
  );

  const leaveQueue = useCallback(() => {
    socketManager.leaveQueue();
  }, []);

  const createRoom = useCallback(
    (settings?: GameSettings) => {
      socketManager.createRoom(nicknameRef.current, settings);
    },
    []
  );

  const joinRoom = useCallback(
    (code: string) => {
      socketManager.joinRoom(nicknameRef.current, code);
    },
    []
  );

  const leaveRoom = useCallback(() => {
    socketManager.leaveRoom();
  }, []);

  const sendDirection = useCallback((direction: Direction) => {
    socketManager.sendInput(direction);
  }, []);

  const requestRematch = useCallback(() => {
    socketManager.requestRematch();
  }, []);

  const declineRematch = useCallback(() => {
    socketManager.declineRematch();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setMpState('IDLE');
    setGameState(null);
    setCountdown(null);
    setRoomCode(null);
    setPlayers([]);
    setWinner(null);
    setGameOverReason(null);
    setFinalScores(null);
    setError(null);
    setRematchRequested(null);
  }, []);

  // Helpers
  const getMySnake = useCallback((): SnakeData | null => {
    if (!gameState) return null;
    return gameState.snakes.find((s) => s.nickname === nicknameRef.current) || null;
  }, [gameState]);

  const getOpponentSnake = useCallback((): SnakeData | null => {
    if (!gameState) return null;
    return gameState.snakes.find((s) => s.nickname !== nicknameRef.current) || null;
  }, [gameState]);

  return {
    // State
    mpState,
    gameState,
    countdown,
    roomCode,
    players,
    playersOnline,
    winner,
    gameOverReason,
    finalScores,
    error,
    rematchRequested,

    // Actions
    connect,
    disconnect,
    joinQueue,
    leaveQueue,
    createRoom,
    joinRoom,
    leaveRoom,
    sendDirection,
    requestRematch,
    declineRematch,
    clearError,
    resetState,

    // Helpers
    getMySnake,
    getOpponentSnake,
    isConnected,
  };
};
