
import React from 'react';
import { GameState } from '../types';

interface UIOverlayProps {
  gameState: GameState;
  onRestart: () => void;
  missionUpdate: string;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, onRestart, missionUpdate }) => {
  return (
    <div className="fixed inset-0 pointer-events-none select-none p-6 flex flex-col justify-between">
      {/* HUD TOP */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-lg">
            <div className="text-cyan-400 text-xs uppercase tracking-widest font-bold mb-1">Current Score</div>
            <div className="text-3xl font-orbitron text-white">{gameState.score.toLocaleString()}</div>
          </div>
          <div className="flex gap-4">
             <div className="bg-black/40 backdrop-blur-md border border-slate-700 p-2 px-4 rounded-lg">
                <div className="text-slate-400 text-[10px] uppercase">Distance</div>
                <div className="text-white font-mono">{gameState.distance} LY</div>
             </div>
             <div className="bg-black/40 backdrop-blur-md border border-slate-700 p-2 px-4 rounded-lg">
                <div className="text-slate-400 text-[10px] uppercase">Warp Factor</div>
                <div className="text-white font-mono">{(gameState.difficulty / 5).toFixed(1)}x</div>
             </div>
          </div>
        </div>

        <div className="w-64 space-y-3">
          {/* Health Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-red-400 uppercase tracking-tighter">
              <span>Hull Integrity</span>
              <span>{gameState.health}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-red-900/50">
              <div 
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                style={{ width: `${gameState.health}%` }}
              />
            </div>
          </div>

          {/* Shield Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
              <span>Energy Shield</span>
              <span>{gameState.shield}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-indigo-900/50">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300 shadow-[0_0_10px_rgba(129,140,248,0.5)]" 
                style={{ width: `${gameState.shield}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MISSION CONTROL CENTER */}
      <div className="flex justify-center mb-8">
         <div className="w-full max-w-xl bg-black/50 backdrop-blur-xl border-t-2 border-cyan-500/50 p-4 rounded-t-2xl shadow-[0_-10px_30px_rgba(34,211,238,0.1)]">
            <div className="flex items-start gap-4">
               <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500 flex items-center justify-center shrink-0">
                  <div className="w-6 h-6 animate-pulse text-cyan-400">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" />
                    </svg>
                  </div>
               </div>
               <div className="flex-1">
                  <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em] mb-1">Nova AI Intelligence</div>
                  <div className="text-white font-mono text-sm leading-tight italic">
                    "{missionUpdate || 'Calibrating long-range sensors...'}"
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* GAME OVER MODAL */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 pointer-events-auto bg-slate-950/80 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="text-center p-12 bg-slate-900/50 border border-cyan-500/30 rounded-3xl shadow-2xl max-w-md w-full">
            <h2 className="text-5xl font-orbitron font-bold text-white mb-2 tracking-widest uppercase">System Failed</h2>
            <p className="text-slate-400 mb-8 font-mono">Your journey ended in the Void sector.</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/40 p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase text-slate-500">Total Score</div>
                <div className="text-2xl font-orbitron text-cyan-400">{gameState.score}</div>
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] uppercase text-slate-500">Travel Distance</div>
                <div className="text-2xl font-orbitron text-indigo-400">{gameState.distance} LY</div>
              </div>
            </div>

            <button 
              onClick={onRestart}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xl rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.5)] uppercase tracking-wider font-orbitron"
            >
              Initiate New Voyage
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;
