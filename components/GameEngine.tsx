
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Vector2D, GameObject, Particle, GameState } from '../types';
import { GAME_CONSTANTS } from '../constants';

interface GameEngineProps {
  onStateUpdate: (state: GameState) => void;
  isGameOver: boolean;
  onGameOver: () => void;
}

const GameEngine: React.FC<GameEngineProps> = ({ onStateUpdate, isGameOver, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // High-frequency game state (refs to avoid re-renders)
  const playerPos = useRef<Vector2D>({ x: 100, y: 300 });
  const targetY = useRef<number>(300);
  const objects = useRef<GameObject[]>([]);
  const particles = useRef<Particle[]>([]);
  const score = useRef<number>(0);
  const health = useRef<number>(GAME_CONSTANTS.INITIAL_HEALTH);
  const shield = useRef<number>(GAME_CONSTANTS.INITIAL_SHIELD);
  const distance = useRef<number>(0);
  const gameSpeed = useRef<number>(5);

  const spawnObject = useCallback((width: number, height: number) => {
    const typeChance = Math.random();
    let type: GameObject['type'] = 'asteroid';
    let radius = 20 + Math.random() * 40;
    
    if (typeChance > 0.95) {
      type = 'crystal';
      radius = 15;
    }

    const obj: GameObject = {
      id: Math.random().toString(36).substr(2, 9),
      position: { x: width + 100, y: Math.random() * height },
      velocity: { x: -(gameSpeed.current + Math.random() * 2), y: 0 },
      radius,
      type,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    };
    objects.current.push(obj);
  }, []);

  const createExplosion = (x: number, y: number, color: string, count: number = 10) => {
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  };

  const update = (time: number) => {
    if (isGameOver) return;
    
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Update Player
    playerPos.current.y += (targetY.current - playerPos.current.y) * 0.15;
    
    // Thruster particles
    particles.current.push({
      x: playerPos.current.x - 20,
      y: playerPos.current.y + (Math.random() - 0.5) * 10,
      vx: -5 - Math.random() * 5,
      vy: (Math.random() - 0.5) * 2,
      life: 1.0,
      color: Math.random() > 0.5 ? '#22d3ee' : '#f97316',
      size: 2 + Math.random() * 3,
    });

    // 2. Update Objects
    if (Math.random() < GAME_CONSTANTS.ASTEROID_SPAWN_RATE) {
      spawnObject(canvas.width, canvas.height);
    }

    objects.current = objects.current.filter(obj => {
      obj.position.x += obj.velocity.x;
      obj.rotation += obj.rotationSpeed;

      // Collision Detection
      const dx = obj.position.x - playerPos.current.x;
      const dy = obj.position.y - playerPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < obj.radius + GAME_CONSTANTS.PLAYER_RADIUS - 10) {
        if (obj.type === 'asteroid') {
          if (shield.current > 0) {
            shield.current = Math.max(0, shield.current - 20);
            createExplosion(obj.position.x, obj.position.y, '#818cf8');
          } else {
            health.current = Math.max(0, health.current - 25);
            createExplosion(obj.position.x, obj.position.y, '#ef4444', 20);
          }
          if (health.current <= 0) onGameOver();
        } else if (obj.type === 'crystal') {
          score.current += 500;
          shield.current = Math.min(GAME_CONSTANTS.MAX_SHIELD, shield.current + 10);
          createExplosion(obj.position.x, obj.position.y, '#f472b6');
        }
        return false;
      }

      return obj.position.x > -100;
    });

    // 3. Update Particles
    particles.current = particles.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });

    // 4. Update Stats
    score.current += Math.floor(gameSpeed.current / 2);
    distance.current += gameSpeed.current * 0.01;
    gameSpeed.current += GAME_CONSTANTS.SPEED_INCREMENT;

    onStateUpdate({
      score: score.current,
      health: health.current,
      shield: shield.current,
      distance: Number(distance.current.toFixed(2)),
      isGameOver,
      isPaused: false,
      difficulty: gameSpeed.current
    });

    // 5. Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Background Stars (Simple Parallax)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 137.5 + time * 0.05) % canvas.width;
        const y = (i * 243.7) % canvas.height;
        const s = (i % 3) + 1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(x, y, s / 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Draw Particles
    particles.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw Player Ship
    ctx.save();
    ctx.translate(playerPos.current.x, playerPos.current.y);
    
    // Shield visual
    if (shield.current > 0) {
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 2;
      ctx.globalAlpha = shield.current / 100;
      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONSTANTS.PLAYER_RADIUS + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Ship Body (Neon Triangle/Sleek design)
    ctx.fillStyle = GAME_CONSTANTS.COLORS.PLAYER;
    ctx.shadowBlur = 15;
    ctx.shadowColor = GAME_CONSTANTS.COLORS.PLAYER;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(-20, -15);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-20, 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw Objects
    objects.current.forEach(obj => {
      ctx.save();
      ctx.translate(obj.position.x, obj.position.y);
      ctx.rotate(obj.rotation);
      
      if (obj.type === 'asteroid') {
        ctx.fillStyle = '#475569';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#000';
        // Simple craggy circle
        ctx.beginPath();
        for(let a=0; a<Math.PI*2; a+=0.5) {
            const r = obj.radius + (Math.sin(a * 5) * 5);
            const x = Math.cos(a) * r;
            const y = Math.sin(a) * r;
            if (a === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // Crystal
        ctx.fillStyle = '#f472b6';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f472b6';
        ctx.beginPath();
        ctx.moveTo(0, -obj.radius);
        ctx.lineTo(obj.radius, 0);
        ctx.lineTo(0, obj.radius);
        ctx.lineTo(-obj.radius, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      targetY.current = e.clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        targetY.current = e.touches[0].clientY;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    requestRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isGameOver]);

  return (
    <canvas 
      ref={canvasRef} 
      className="block w-full h-full bg-slate-950 cursor-none"
    />
  );
};

export default GameEngine;
