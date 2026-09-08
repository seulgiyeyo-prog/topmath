import React, { useState } from 'react';
import { GameState, MissionKey } from '../types';
import { HUD } from './HUD';
import { NetworkTab } from './NetworkTab';
import { ShortestPathTab } from './ShortestPathTab';
import { BridgePuzzleTab } from './BridgePuzzleTab';
import { ExponentialTab } from './ExponentialTab';
import { CalculusTab } from './CalculusTab';
import { FlattenCurveTab } from './FlattenCurveTab';
import { SirModelTab } from './SirModelTab';
import { HerdImmunityTab } from './HerdImmunityTab';
import { FakeNewsGameTab } from './FakeNewsGameTab';
import { MiddleSchoolExplainModal } from './MiddleSchoolExplainModal';
import { Check, BookOpen, Home, ArrowRight, Share2 } from 'lucide-react';

interface DiffusionLabProps {
  gameState: GameState;
  onAddXP: (amount: number) => void;
  onCompleteMission: (key: MissionKey, xp: number, stars: number) => void;
  onSavePathBest: (time: number) => void;
  onLaunchConfetti: () => void;
  onGoHome: () => void;
  onSwitchToGeometry: () => void;
}

export const DiffusionLab: React.FC<DiffusionLabProps> = ({
  gameState,
  onAddXP,
  onCompleteMission,
  onSavePathBest,
  onLaunchConfetti,
  onGoHome,
  onSwitchToGeometry,
}) => {
  const [activeTab, setActiveTab] = useState<MissionKey>('herd');
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);

  const tabs: { key: MissionKey; label: string; number: number; session: string }[] = [
    { key: 'net', label: '네트워크 기초', number: 1, session: '1차시' },
    { key: 'path', label: '최단 경로', number: 2, session: '1차시' },
    { key: 'bridge', label: '방화벽 브릿지 퍼즐', number: 3, session: '1차시' },
    { key: 'exp', label: '지수 확산', number: 4, session: '2차시' },
    { key: 'calc', label: '미분이란?', number: 5, session: '2차시' },
    { key: 'flatten', label: '방역 사령관 게임', number: 6, session: '2차시' },
    { key: 'sir', label: 'SIR 모델', number: 7, session: '2차시' },
    { key: 'herd', label: '집단면역 게임 🎮', number: 8, session: '3차시' },
    { key: 'fakeNews', label: '가짜 뉴스 방어 🛡️', number: 9, session: '3차시' },
  ];

  return (
    <div className="min-h-screen bg-[#0A1A18] text-[#EAFBF6] font-sans relative pb-20 selection:bg-[#F2B84B] selection:text-[#0A1A18]">
      {/* Top Universal Classroom Bar */}
      <nav className="bg-[#132E29]/95 backdrop-blur border-b border-[#234E47] sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A1A18] hover:bg-[#1A3D37] border border-[#234E47] text-xs font-semibold text-[#7DBFB0] hover:text-[#EAFBF6] transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>수업 선택 홈</span>
            </button>

            <span className="text-[#234E47]">|</span>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F2B84B]">
              <Share2 className="w-4 h-4 text-[#3FA796]" />
              <span className="hidden sm:inline">과정 2:</span>
              <span>확산의 수학 (감염병·소문과 네트워크 모델링)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToGeometry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A3D37] hover:bg-[#234E47] text-[#F2B84B] text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>과정 1(기하 최적화)로 이동</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Top HUD */}
      <HUD gameState={gameState} />

      {/* Hero Header */}
      <header className="max-w-6xl mx-auto px-5 pt-6 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-[11px] font-mono text-[#F2B84B] tracking-wider uppercase">
            중등수학 영재교육원 · 감염병·소문 확산과 네트워크 모델링 (총 3차시 마스터)
          </div>

          {/* Quick Explanation Button in Header */}
          <button
            onClick={() => setIsExplainModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C084FC]/20 hover:bg-[#C084FC]/30 text-[#C084FC] border border-[#C084FC]/40 text-xs font-bold transition-all cursor-pointer hover:scale-105"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>무작위 vs 허브 왜 차이 날까? (중학생 특강 보기)</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif mt-1 mb-1.5 text-transparent bg-clip-text bg-gradient-to-r from-[#EAFBF6] to-[#3FA796]">
          퍼져나가는 것들의 수학
        </h1>
        <p className="text-xs sm:text-sm text-[#7DBFB0] max-w-2xl leading-relaxed">
          네트워크 다리 끊기, 방역 사령관 병상 사수(Flatten the Curve), 집단면역 백신 배틀, SNS 가짜 뉴스 방어까지 — 
          9개의 탐구 미션을 클리어하며 확산의 수학적 원리를 완전 정복하세요!
        </p>
      </header>

      {/* Tabs Navigation */}
      <div className="max-w-6xl mx-auto px-5 mt-4">
        <nav className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const isDone = gameState.missions[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  onAddXP(5);
                }}
                className={`px-3 py-2 rounded-t-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 relative border border-[#234E47] border-b-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#F2B84B] text-[#0A1A18] font-bold shadow-sm'
                    : 'bg-[#132E29] text-[#7DBFB0] hover:text-white hover:bg-[#1A3D37]'
                }`}
              >
                <span className="text-[10px] px-1 py-0.5 rounded bg-black/20 font-mono">
                  {tab.session}
                </span>
                <span>
                  {tab.number}. {tab.label}
                </span>
                {isDone && (
                  <Check
                    className={`w-3 h-3 ${
                      isActive ? 'text-[#0A1A18]' : 'text-[#4ADE80]'
                    } stroke-[3]`}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Main Panel Content */}
        <main className="bg-[#132E29] border border-[#234E47] rounded-b-2xl rounded-tr-2xl p-4 sm:p-6 shadow-2xl">
          {activeTab === 'net' && (
            <NetworkTab
              onCompleteMission={(xp, stars) => onCompleteMission('net', xp, stars)}
              isMissionCompleted={gameState.missions.net}
              onAddXP={onAddXP}
            />
          )}

          {activeTab === 'path' && (
            <ShortestPathTab
              onCompleteMission={(xp, stars) => onCompleteMission('path', xp, stars)}
              isMissionCompleted={gameState.missions.path}
              onAddXP={onAddXP}
              bestTime={gameState.pathBest}
              onSaveBestTime={onSavePathBest}
            />
          )}

          {activeTab === 'bridge' && (
            <BridgePuzzleTab
              onCompleteMission={(xp, stars) => onCompleteMission('bridge', xp, stars)}
              isMissionCompleted={gameState.missions.bridge}
            />
          )}

          {activeTab === 'exp' && (
            <ExponentialTab
              onCompleteMission={(xp, stars) => onCompleteMission('exp', xp, stars)}
              isMissionCompleted={gameState.missions.exp}
              onAddXP={onAddXP}
            />
          )}

          {activeTab === 'calc' && (
            <CalculusTab
              onCompleteMission={(xp, stars) => onCompleteMission('calc', xp, stars)}
              isMissionCompleted={gameState.missions.calc}
            />
          )}

          {activeTab === 'flatten' && (
            <FlattenCurveTab
              onCompleteMission={(xp, stars) => onCompleteMission('flatten', xp, stars)}
              isMissionCompleted={gameState.missions.flatten}
            />
          )}

          {activeTab === 'sir' && (
            <SirModelTab
              onCompleteMission={(xp, stars) => onCompleteMission('sir', xp, stars)}
              isMissionCompleted={gameState.missions.sir}
            />
          )}

          {activeTab === 'herd' && (
            <HerdImmunityTab
              onCompleteMission={(xp, stars) => onCompleteMission('herd', xp, stars)}
              isMissionCompleted={gameState.missions.herd}
              onAddXP={onAddXP}
              onLaunchConfetti={onLaunchConfetti}
              onOpenExplainModal={() => setIsExplainModalOpen(true)}
            />
          )}

          {activeTab === 'fakeNews' && (
            <FakeNewsGameTab
              onCompleteMission={(xp, stars) => onCompleteMission('fakeNews', xp, stars)}
              isMissionCompleted={gameState.missions.fakeNews}
            />
          )}
        </main>
      </div>

      {/* MIDDLE SCHOOL STEP-BY-STEP EXPLANATION MODAL */}
      <MiddleSchoolExplainModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        onRewardXP={(amount) => onAddXP(amount)}
      />
    </div>
  );
};
