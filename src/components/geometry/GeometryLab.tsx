import React, { useState } from 'react';
import { HeronTab } from './HeronTab';
import { BilliardsTab } from './BilliardsTab';
import { FermatTab } from './FermatTab';
import { TorricelliTab } from './TorricelliTab';
import { BubbleTab } from './BubbleTab';
import { CityGameTab } from './CityGameTab';
import { Home, Compass, ArrowRight, ChevronLeft, ChevronRight, BookOpen, Lightbulb } from 'lucide-react';

interface GeometryLabProps {
  onGoHome: () => void;
  onSwitchToDiffusion: () => void;
  onOpenWorkbook?: () => void;
  onOpenIdeas?: () => void;
}

type GeometryTabKey = 'heron' | 'billiards' | 'fermat' | 'torricelli' | 'bubble' | 'city';

export const GeometryLab: React.FC<GeometryLabProps> = ({
  onGoHome,
  onSwitchToDiffusion,
  onOpenWorkbook,
  onOpenIdeas,
}) => {
  const [activeTab, setActiveTab] = useState<GeometryTabKey>('heron');

  const tabs: { key: GeometryTabKey; label: string; number: number; session: string }[] = [
    { key: 'heron', label: '헤론의 최단 거리', number: 1, session: '1차시' },
    { key: 'billiards', label: '당구대 2단 쿠션', number: 2, session: '1차시' },
    { key: 'fermat', label: '페르마 점 탐구', number: 3, session: '2차시' },
    { key: 'torricelli', label: '토리첼리 3중 도르래', number: 4, session: '2차시' },
    { key: 'bubble', label: '비눗방울 실험실', number: 5, session: '2차시' },
    { key: 'city', label: '도시 설계 & 외판원 게임', number: 6, session: '3차시' },
  ];

  const currentIdx = tabs.findIndex((t) => t.key === activeTab);
  const prevTab = currentIdx > 0 ? tabs[currentIdx - 1] : null;
  const nextTab = currentIdx < tabs.length - 1 ? tabs[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-[#0E2A45] text-[#EAF3FC] font-sans relative pb-20 selection:bg-[#E7A93D] selection:text-[#0E2A45] overflow-x-hidden w-full max-w-full">
      {/* Top Universal Classroom Bar */}
      <nav className="bg-[#153A5C]/95 backdrop-blur border-b border-[#2C567F] sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E2A45] hover:bg-[#1B4468] border border-[#2C567F] text-xs font-semibold text-[#9FC0DC] hover:text-[#EAF3FC] transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>수업 선택 홈</span>
            </button>

            <span className="text-[#2C567F]">|</span>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E7A93D]">
              <Compass className="w-4 h-4 text-[#E7A93D]" />
              <span className="hidden sm:inline">과정 1:</span>
              <span>가장 짧은 길을 찾아서 (기하 최적화와 페르마 점)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenIdeas && (
              <button
                onClick={onOpenIdeas}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105"
                title="영재 발표회 산출물 아이디어 고민하기"
              >
                <Lightbulb className="w-3.5 h-3.5 text-yellow-200" />
                <span>💡 산출물 아이디어</span>
              </button>
            )}

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
              onClick={onSwitchToDiffusion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B4468] hover:bg-[#2C567F] text-[#7FC4EE] text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>과정 2(확산의 수학)로 이동</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Lab Header */}
      <header className="max-w-6xl mx-auto px-5 pt-8 pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-[12px] font-mono text-[#E7A93D] tracking-wider uppercase">
            중등수학 영재교육원 · 기하 최적화와 페르마 점 (총 3차시 마스터)
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif mt-1 mb-2 text-[#EAF3FC]">
          가장 짧은 길을 찾아서
        </h1>
        <p className="text-xs sm:text-sm text-[#9FC0DC] max-w-2xl leading-relaxed">
          강가의 물길에서 당구대 쿠션, 토리첼리의 도르래, 비눗방울 표면장력, 도시의 도로망까지 — 
          수학과 자연의 물리 법칙이 만나는 6개의 최적화 실험실을 단계별로 탐구하세요.
        </p>
      </header>

      {/* Tabs Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-4">
        <nav className="flex flex-wrap gap-1.5 pb-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 sm:px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 relative border border-[#2C567F] border-b-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#E7A93D] text-[#0E2A45] font-bold shadow-sm'
                    : 'bg-[#153A5C] text-[#9FC0DC] hover:text-white hover:bg-[#1B4468]'
                }`}
              >
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono">
                  {tab.session}
                </span>
                <span>
                  {tab.number}. {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Main Panel Content */}
        <main className="bg-[#153A5C] border border-[#2C567F] rounded-b-2xl rounded-tr-2xl p-4 sm:p-6 shadow-2xl">
          {activeTab === 'heron' && <HeronTab />}
          {activeTab === 'billiards' && <BilliardsTab />}
          {activeTab === 'fermat' && <FermatTab />}
          {activeTab === 'torricelli' && <TorricelliTab />}
          {activeTab === 'bubble' && <BubbleTab />}
          {activeTab === 'city' && <CityGameTab />}

          {/* Bottom Step-by-Step Navigation Bar */}
          <div className="mt-8 pt-4 border-t border-[#2C567F] flex items-center justify-between gap-3 flex-wrap text-xs">
            {prevTab ? (
              <button
                onClick={() => setActiveTab(prevTab.key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0E2A45] hover:bg-[#1B4468] border border-[#2C567F] text-[#9FC0DC] hover:text-[#EAF3FC] font-semibold transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#E7A93D]" />
                <span>이전: {prevTab.number}. {prevTab.label}</span>
              </button>
            ) : (
              <div />
            )}

            <div className="text-[11px] text-[#9FC0DC] font-mono text-center">
              현재 <strong className="text-[#E7A93D]">{currentIdx + 1}번 / 총 6개</strong> 탐구 진행 중
            </div>

            {nextTab ? (
              <button
                onClick={() => setActiveTab(nextTab.key)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E7A93D] hover:bg-[#d4962c] text-[#0E2A45] font-bold transition-all cursor-pointer shadow-md"
              >
                <span>다음: {nextTab.number}. {nextTab.label}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-xs font-bold text-[#34D399] flex items-center gap-1">
                <span>🎉 6개 모든 탐구 완료!</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
