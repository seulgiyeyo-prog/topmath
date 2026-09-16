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
import { Check, BookOpen, Home, ArrowRight, Share2, ChevronLeft, ChevronRight, LayoutGrid, SlidersHorizontal } from 'lucide-react';

interface DiffusionLabProps {
  gameState: GameState;
  onAddXP: (amount: number) => void;
  onCompleteMission: (key: MissionKey, xp: number, stars: number) => void;
  onSavePathBest: (time: number) => void;
  onLaunchConfetti: () => void;
  onGoHome: () => void;
  onSwitchToGeometry: () => void;
  onOpenWorkbook?: () => void;
}

export const DiffusionLab: React.FC<DiffusionLabProps> = ({
  gameState,
  onAddXP,
  onCompleteMission,
  onSavePathBest,
  onLaunchConfetti,
  onGoHome,
  onSwitchToGeometry,
  onOpenWorkbook,
}) => {
  const [activeTab, setActiveTab] = useState<MissionKey>('herd');
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [isWrapView, setIsWrapView] = useState(true);

  const navScrollRef = React.useRef<HTMLDivElement | null>(null);

  const tabs: { key: MissionKey; label: string; number: number; session: string; sessionNum: '1' | '2' | '3' }[] = [
    { key: 'net', label: '네트워크 기초', number: 1, session: '1차시', sessionNum: '1' },
    { key: 'path', label: '최단 경로', number: 2, session: '1차시', sessionNum: '1' },
    { key: 'bridge', label: '방화벽 브릿지 퍼즐', number: 3, session: '1차시', sessionNum: '1' },
    { key: 'exp', label: '지수 확산', number: 4, session: '2차시', sessionNum: '2' },
    { key: 'calc', label: '미분이란?', number: 5, session: '2차시', sessionNum: '2' },
    { key: 'flatten', label: '방역 사령관 게임', number: 6, session: '2차시', sessionNum: '2' },
    { key: 'sir', label: 'SIR 모델', number: 7, session: '2차시', sessionNum: '2' },
    { key: 'herd', label: '집단면역 게임 🎮', number: 8, session: '3차시', sessionNum: '3' },
    { key: 'fakeNews', label: '가짜 뉴스 방어 🛡️', number: 9, session: '3차시', sessionNum: '3' },
  ];

  const visibleTabs = sessionFilter === 'all' 
    ? tabs 
    : tabs.filter((t) => t.sessionNum === sessionFilter);

  const currentIdx = tabs.findIndex((t) => t.key === activeTab);
  const prevTab = currentIdx > 0 ? tabs[currentIdx - 1] : null;
  const nextTab = currentIdx < tabs.length - 1 ? tabs[currentIdx + 1] : null;

  const handleSelectTab = (key: MissionKey) => {
    setActiveTab(key);
    onAddXP(5);
  };

  const handlePrevTab = () => {
    if (prevTab) {
      handleSelectTab(prevTab.key);
      if (sessionFilter !== 'all' && prevTab.sessionNum !== sessionFilter) {
        setSessionFilter(prevTab.sessionNum);
      }
    }
  };

  const handleNextTab = () => {
    if (nextTab) {
      handleSelectTab(nextTab.key);
      if (sessionFilter !== 'all' && nextTab.sessionNum !== sessionFilter) {
        setSessionFilter(nextTab.sessionNum);
      }
    }
  };

  const handleSelectSession = (filter: 'all' | '1' | '2' | '3') => {
    setSessionFilter(filter);
    if (filter !== 'all') {
      const match = tabs.find((t) => t.sessionNum === filter);
      if (match && !tabs.filter((t) => t.sessionNum === filter).some((t) => t.key === activeTab)) {
        handleSelectTab(match.key);
      }
    }
  };

  const scrollNav = (direction: 'left' | 'right') => {
    if (navScrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      navScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

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
            {onOpenWorkbook && (
              <button
                onClick={onOpenWorkbook}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                title="수업용 교재 정답 및 해설 워크북 열기"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>교재 정답 & 워크북</span>
              </button>
            )}

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
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-3">
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

      {/* Tabs Navigation Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
        {/* Session Filter Bar + Quick Navigation Controls */}
        <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0E2420] border border-[#234E47] p-2 rounded-xl text-xs">
          {/* Session Quick Filters */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[#7DBFB0] text-[11px] font-bold mr-1 hidden md:inline">차시별 필터:</span>
            <button
              onClick={() => handleSelectSession('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                sessionFilter === 'all'
                  ? 'bg-[#F2B84B] text-[#0A1A18] shadow-sm'
                  : 'bg-[#132E29] text-[#7DBFB0] hover:text-white'
              }`}
            >
              전체 9개 미션
            </button>
            <button
              onClick={() => handleSelectSession('1')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                sessionFilter === '1'
                  ? 'bg-[#F2B84B] text-[#0A1A18] shadow-sm'
                  : 'bg-[#132E29] text-[#7DBFB0] hover:text-white'
              }`}
            >
              1차시 (1~3. 네트워크)
            </button>
            <button
              onClick={() => handleSelectSession('2')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                sessionFilter === '2'
                  ? 'bg-[#F2B84B] text-[#0A1A18] shadow-sm'
                  : 'bg-[#132E29] text-[#7DBFB0] hover:text-white'
              }`}
            >
              2차시 (4~7. 확산·미분)
            </button>
            <button
              onClick={() => handleSelectSession('3')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                sessionFilter === '3'
                  ? 'bg-[#F2B84B] text-[#0A1A18] shadow-sm'
                  : 'bg-[#132E29] text-[#7DBFB0] hover:text-white'
              }`}
            >
              3차시 (8~9. 게임·방어)
            </button>
          </div>

          {/* Stepper + View Mode Toggle */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              onClick={handlePrevTab}
              disabled={!prevTab}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-0.5 transition-all ${
                prevTab
                  ? 'bg-[#132E29] border-[#234E47] text-[#EAFBF6] hover:bg-[#1A3D37] cursor-pointer'
                  : 'bg-[#0A1A18] border-[#1A3D37] text-gray-600 cursor-not-allowed'
              }`}
              title="이전 미션"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">이전</span>
            </button>

            <span className="font-mono text-xs px-2 py-1 rounded bg-[#0A1A18] border border-[#234E47] text-[#F2B84B] font-bold">
              {currentIdx + 1} / {tabs.length}
            </span>

            <button
              onClick={handleNextTab}
              disabled={!nextTab}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-0.5 transition-all ${
                nextTab
                  ? 'bg-[#132E29] border-[#234E47] text-[#EAFBF6] hover:bg-[#1A3D37] cursor-pointer'
                  : 'bg-[#0A1A18] border-[#1A3D37] text-gray-600 cursor-not-allowed'
              }`}
              title="다음 미션"
            >
              <span className="text-[11px] hidden sm:inline">다음</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsWrapView((prev) => !prev)}
              className="p-1.5 rounded-lg bg-[#132E29] hover:bg-[#1A3D37] border border-[#234E47] text-[#7DBFB0] hover:text-white transition-all cursor-pointer ml-1"
              title={isWrapView ? '한 줄 슬라이드 모드로 전환' : '한눈에 펼쳐보기(랩) 모드로 전환'}
            >
              {isWrapView ? <SlidersHorizontal className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Tab Row Container (Wrap Mode by default to prevent side cutoff) */}
        <div className="relative">
          {!isWrapView && (
            <div className="flex items-center justify-between mb-1 text-[11px] text-[#7DBFB0]">
              <span>💡 가로 스크롤 또는 좌우 화살표를 눌러 숨겨진 탭을 볼 수 있습니다:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => scrollNav('left')}
                  className="px-2 py-0.5 rounded bg-[#132E29] hover:bg-[#234E47] border border-[#234E47] text-[#F2B84B] cursor-pointer"
                >
                  ◀ 좌측 탭
                </button>
                <button
                  onClick={() => scrollNav('right')}
                  className="px-2 py-0.5 rounded bg-[#132E29] hover:bg-[#234E47] border border-[#234E47] text-[#F2B84B] cursor-pointer"
                >
                  우측 탭 ▶
                </button>
              </div>
            </div>
          )}

          <nav
            ref={navScrollRef}
            className={`gap-1.5 pb-1 transition-all ${
              isWrapView 
                ? 'flex flex-wrap' 
                : 'flex overflow-x-auto scrollbar-thin'
            }`}
          >
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const isDone = gameState.missions[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => handleSelectTab(tab.key)}
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
        </div>

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

          {/* Bottom Step-by-Step Navigation Bar */}
          <div className="mt-8 pt-4 border-t border-[#234E47] flex items-center justify-between gap-3 flex-wrap text-xs">
            {prevTab ? (
              <button
                onClick={handlePrevTab}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0A1A18] hover:bg-[#1A3D37] border border-[#234E47] text-[#7DBFB0] hover:text-[#EAFBF6] font-semibold transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#F2B84B]" />
                <span>이전: {prevTab.number}. {prevTab.label}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="text-[11px] text-[#7DBFB0] font-mono text-center">
              현재 <strong className="text-[#F2B84B]">{currentIdx + 1}번 / 총 9개</strong> 탐구 진행 중
            </div>

            {nextTab ? (
              <button
                onClick={handleNextTab}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F2B84B] hover:bg-[#d9a038] text-[#0A1A18] font-bold transition-all cursor-pointer shadow-md"
              >
                <span>다음: {nextTab.number}. {nextTab.label}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs font-bold text-[#4ADE80] flex items-center gap-1">
                <span>🎉 9개 모든 탐구 완료!</span>
              </div>
            )}
          </div>
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
