import React from 'react';
import { GameState } from '../types';
import { Trophy, Flame, CheckCircle2 } from 'lucide-react';

interface HUDProps {
  gameState: GameState;
  onOpenAchievements?: () => void;
  title?: string;
  icon?: string;
  theme?: 'teal' | 'plum';
  totalMissions?: number;
}

export const HUD: React.FC<HUDProps> = ({
  gameState,
  title,
  icon,
  theme = 'teal',
  totalMissions = 6,
}) => {
  const xpNeeded = gameState.level * 100;
  const progressPercent = Math.min(100, Math.max(0, (gameState.xp / xpNeeded) * 100));
  const completedMissions = Object.values(gameState.missions).filter(Boolean).length;

  const isPlum = theme === 'plum';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-2.5 transition-colors ${
        isPlum
          ? 'bg-[#140A1F]/90 border-[#3E2156] text-[#FAF5FF]'
          : 'bg-[#0A1A18]/90 border-[#234E47] text-[#EAFBF6]'
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Logo */}
        <div
          className={`flex items-center gap-2 font-mono font-bold tracking-wide ${
            isPlum ? 'text-[#F472B6]' : 'text-[#F2B84B]'
          }`}
        >
          <span className="text-base">{icon || (isPlum ? '🦴' : '🧬')}</span>
          <span className="hidden sm:inline">{title || (isPlum ? '치유의 수학' : '확산의 수학')}</span>
        </div>

        {/* XP Bar */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xs min-w-[180px]">
          <span
            className={`px-2 py-0.5 rounded text-white font-mono font-bold text-[11px] shadow-xs ${
              isPlum
                ? 'bg-gradient-to-r from-[#A855F7] to-[#F472B6]'
                : 'bg-gradient-to-r from-[#3FA796] to-[#C084FC]'
            }`}
          >
            Lv.{gameState.level}
          </span>
          <div
            className={`flex-1 h-2 rounded-full overflow-hidden relative ${
              isPlum ? 'bg-[#3E2156]' : 'bg-[#234E47]'
            }`}
          >
            <div
              className={`h-full transition-all duration-500 ease-out ${
                isPlum
                  ? 'bg-gradient-to-r from-[#A855F7] via-[#E879F9] to-[#F472B6]'
                  : 'bg-gradient-to-r from-[#3FA796] to-[#F2B84B]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span
            className={`font-mono text-[11px] whitespace-nowrap ${
              isPlum ? 'text-[#F472B6]' : 'text-[#F2B84B]'
            }`}
          >
            {gameState.xp}/{xpNeeded} XP
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div
            className={`text-center px-2 py-0.5 rounded border ${
              isPlum ? 'bg-[#201130] border-[#3E2156]' : 'bg-[#132E29] border-[#234E47]'
            }`}
          >
            <div
              className={`font-mono font-bold text-sm ${
                isPlum ? 'text-[#F472B6]' : 'text-[#F2B84B]'
              }`}
            >
              {gameState.score.toLocaleString()}
            </div>
            <div
              className={`text-[10px] flex items-center gap-1 justify-center ${
                isPlum ? 'text-[#D8B4FE]' : 'text-[#7DBFB0]'
              }`}
            >
              <Trophy
                className={`w-3 h-3 ${isPlum ? 'text-[#F472B6]' : 'text-[#F2B84B]'}`}
              />
              <span>점수</span>
            </div>
          </div>

          <div
            className={`text-center px-2 py-0.5 rounded border ${
              isPlum ? 'bg-[#201130] border-[#3E2156]' : 'bg-[#132E29] border-[#234E47]'
            }`}
          >
            <div className="font-mono font-bold text-[#FF6B8B] text-sm flex items-center justify-center gap-0.5">
              <Flame className="w-3.5 h-3.5 fill-[#FF6B8B]" />
              <span>{gameState.streak}</span>
            </div>
            <div className={`text-[10px] ${isPlum ? 'text-[#D8B4FE]' : 'text-[#7DBFB0]'}`}>
              연속 성공
            </div>
          </div>

          <div
            className={`text-center px-2 py-0.5 rounded border ${
              isPlum ? 'bg-[#201130] border-[#3E2156]' : 'bg-[#132E29] border-[#234E47]'
            }`}
          >
            <div className="font-mono font-bold text-[#4ADE80] text-sm flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
              <span>
                {completedMissions}/{totalMissions}
              </span>
            </div>
            <div className={`text-[10px] ${isPlum ? 'text-[#D8B4FE]' : 'text-[#7DBFB0]'}`}>
              미션 달성
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
