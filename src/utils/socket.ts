import { io, Socket } from 'socket.io-client';
import { Direction, GameMode, Difficulty } from '../types';

// Production server
const SERVER_URL = 'https://h.madrzak.pl';
const SOCKET_PATH = '/snakemultiplayer/socket.io/';

export interface GameSettings {
  mode: GameMode;
  difficulty: Difficulty;
}

export interface MatchPlayer {
  nickname: string;
  isYou?: boolean;
}

export interface SnakeData {
  nickname: string;
  segments: Array<{ x: number; y: number; id: string }>;
  alive: boolean;
  score: number;
  color: string;
  direction: Direction;
}

export interface GameStateData {
  snakes: SnakeData[];
  food: { x: number; y: number } | null;
  powerUp: any | null;
  state: string;
}

export interface GameOverData {
  winner: string | null;
  reason: string;
  scores: Array<{ nickname: string; score: number; alive: boolean }>;
}

type EventCallback = (data: any) => void;

class SocketManager {
  private socket: Socket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private connected: boolean = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      this.socket = io(SERVER_URL, {
        path: SOCKET_PATH,
        transports: ['polling', 'websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true,
        upgrade: true,
      });

      let hasResolved = false;

      this.socket.on('connect', () => {
        console.log('Connected to multiplayer server');
        this.connected = true;
        if (!hasResolved) {
          hasResolved = true;
          resolve();
        }
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.connected = false;
        // Don't reject immediately - let reconnection try
      });

      // Only reject after all reconnection attempts fail
      this.socket.io.on('reconnect_failed', () => {
        console.error('All reconnection attempts failed');
        if (!hasResolved) {
          hasResolved = true;
          reject(new Error('Failed to connect after multiple attempts'));
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        this.connected = false;
        this.emitToListeners('disconnected', { reason });
      });

      // Set a timeout to reject if connection takes too long
      setTimeout(() => {
        if (!hasResolved && !this.socket?.connected) {
          hasResolved = true;
          reject(new Error('Connection timeout'));
        }
      }, 30000);

      // Setup event forwarding
      const events = [
        'connected',
        'queue_joined',
        'queue_left',
        'match_found',
        'room_created',
        'room_joined',
        'room_left',
        'player_joined',
        'player_left',
        'countdown',
        'game_start',
        'game_state',
        'game_over',
        'rematch_requested',
        'rematch_accepted',
        'rematch_declined',
        'error',
      ];

      events.forEach((event) => {
        this.socket?.on(event, (data) => {
          if (event === 'game_over') {
            console.log('=== SOCKET RECEIVED game_over ===');
            console.log('Data:', JSON.stringify(data));
          }
          this.emitToListeners(event, data);
        });
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected && this.socket?.connected === true;
  }

  // ============ MATCHMAKING ============

  joinQueue(nickname: string, settings?: GameSettings) {
    this.socket?.emit('join_queue', { nickname, settings });
  }

  leaveQueue() {
    this.socket?.emit('leave_queue');
  }

  // ============ PRIVATE ROOMS ============

  createRoom(nickname: string, settings?: GameSettings) {
    this.socket?.emit('create_room', { nickname, settings });
  }

  joinRoom(nickname: string, roomCode: string) {
    this.socket?.emit('join_room', { nickname, roomCode });
  }

  leaveRoom() {
    this.socket?.emit('leave_room');
  }

  // ============ GAME ============

  sendInput(direction: Direction) {
    this.socket?.emit('input', { direction });
  }

  // ============ REMATCH ============

  requestRematch() {
    this.socket?.emit('request_rematch');
  }

  declineRematch() {
    this.socket?.emit('decline_rematch');
  }

  // ============ EVENT LISTENERS ============

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: EventCallback) {
    if (callback) {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        this.listeners.set(
          event,
          callbacks.filter((cb) => cb !== callback)
        );
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emitToListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  // Clear all listeners (useful for cleanup)
  clearAllListeners() {
    this.listeners.clear();
  }
}

// Singleton instance
export const socketManager = new SocketManager();
