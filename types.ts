
export interface GameState {
  score: number;
  health: number;
  shield: number;
  distance: number;
  isGameOver: boolean;
  isPaused: boolean;
  difficulty: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  radius: number;
  type: 'asteroid' | 'crystal' | 'fuel' | 'enemy';
  rotation: number;
  rotationSpeed: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface MissionMessage {
  sender: 'Commander' | 'AI';
  text: string;
  timestamp: number;
}
