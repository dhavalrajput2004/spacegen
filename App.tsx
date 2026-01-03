
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameEngine from './components/GameEngine';
import UIOverlay from './components/UIOverlay';
import { GameState } from './types';
import { getMissionUpdate } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    health: 100,
    shield: 50,
    distance: 0,
    isGameOver: false,
    isPaused: false,
    difficulty: 5,
  });

  const [missionUpdate, setMissionUpdate] = useState<string>("");
  const [hasStarted, setHasStarted] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  const handleStateUpdate = useCallback((newState: GameState) => {
    setGameState(newState);
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState(prev => ({ ...prev, isGameOver: true }));
  }, []);

  const restartGame = () => {
    setGameState({
      score: 0,
      health: 100,
      shield: 50,
      distance: 0,
      isGameOver: false,
      isPaused: false,
      difficulty: 5,
    });
    setMissionUpdate("Recalibrating for second attempt. Ready pilot.");
  };

  // Periodic AI Dialogue updates
  useEffect(() => {
    if (!hasStarted || gameState.isGameOver) return;

    const fetchUpdate = async () => {
      const now = Date.now();
      // Fetch mission update every 12 seconds
      if (now - lastUpdateRef.current > 12000) {
        lastUpdateRef.current = now;
        const msg = await getMissionUpdate(gameState.score, gameState.health, gameState.distance);
        setMissionUpdate(msg);
      }
    };

    const interval = setInterval(fetchUpdate, 2000);
    return () => clearInterval(interval);
  }, [hasStarted, gameState.isGameOver, gameState.score, gameState.health, gameState.distance]);

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-xl text-center">
          <h1 className="text-7xl md:text-8xl font-orbitron font-bold mb-4 bg-gradient-to-b from-cyan-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.3)] uppercase tracking-tighter">
            Stellar Sprint
          </h1>
          <p className="text-slate-400 font-mono mb-12 tracking-widest uppercase animate-pulse">
            Beyond the Event Horizon
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
             <div className="bg-slate-900/50 p-4 border border-cyan-500/20 rounded-xl">
                <div className="text-cyan-500 text-xs font-bold uppercase mb-2 italic">01. Navigation</div>
                <p className="text-slate-300 text-sm">Move your pointer or touch screen to control ship elevation.</p>
             </div>
             <div className="bg-slate-900/50 p-4 border border-pink-500/20 rounded-xl">
                <div className="text-pink-500 text-xs font-bold uppercase mb-2 italic">02. Collection</div>
                <p className="text-slate-300 text-sm">Absorb Pink Pulsar Crystals for energy shields and score.</p>
             </div>
             <div className="bg-slate-900/50 p-4 border border-slate-500/20 rounded-xl">
                <div className="text-slate-400 text-xs font-bold uppercase mb-2 italic">03. Survival</div>
                <p className="text-slate-300 text-sm">Dodge high-density asteroids. Hull failure is permanent.</p>
             </div>
          </div>

          <button 
            onClick={() => setHasStarted(true)}
            className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-200 bg-indigo-600 font-orbitron rounded-full hover:bg-indigo-500 active:scale-95 shadow-[0_0_40px_rgba(79,70,229,0.4)]"
          >
            Launch Vessel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <GameEngine 
        onStateUpdate={handleStateUpdate} 
        isGameOver={gameState.isGameOver}
        onGameOver={handleGameOver}
      />
      <UIOverlay 
        gameState={gameState} 
        onRestart={restartGame}
        missionUpdate={missionUpdate}
      />
    </div>
  );
};

export default App;
