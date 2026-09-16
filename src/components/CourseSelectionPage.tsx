import React from 'react';
import { Compass, Share2, Sparkles, Award, ArrowRight, BookOpen, Layers, Activity, Lightbulb } from 'lucide-react';
import { CourseId } from '../types';

interface CourseSelectionPageProps {
  onSelectCourse: (course: CourseId) => void;
  diffusionProgress?: {
    completedMissions: number;
    totalMissions?: number;
    level: number;
  };
  boneProgress?: {
    completedMissions: number;
  };
}

export const CourseSelectionPage: React.FC<CourseSelectionPageProps> = ({
  onSelectCourse,
  diffusionProgress,
  boneProgress,
}) => {
  return (
    <div className="min-h-screen bg-[#0A1A2F] text-[#EAF3FC] font-sans selection:bg-[#E7A93D] selection:text-[#0E2A45] pb-16">
      {/* Lobby Top Navigation Bar */}
      <header className="border-b border-[#2C567F]/70 bg-[#0E2A45]/80 backdrop-blur sticky top-0 z-30 px-5 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E7A93D] to-[#3FA796] flex items-center justify-center font-serif font-black text-slate-900 shadow">
              ∑
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-[#E7A93D] tracking-wider uppercase">
                중등수학 영재교육원 · 수학 탐구 실험실 포털
              </div>
              <div className="text-base font-bold text-[#EAF3FC]">
                수학적 모델링 & 최적화 인터랙티브 랩 (정규 과정 탑재)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* NEW BUTTON: 산출물 아이디어 고민하는 버튼 */}
            <button
              onClick={() => onSelectCourse('ideas')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-105"
              title="영재 발표회 산출물 아이디어 고민 및 3분 발표 타임라인 기획"
            >
              <Lightbulb className="w-3.5 h-3.5 text-yellow-200" />
              <span>💡 산출물 아이디어 고민하기</span>
            </button>

            <button
              onClick={() => onSelectCourse('workbook')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-105"
              title="교재 문제 풀이와 정답 확인을 한 화면에서 진행할 수 있는 워크북 플랫폼"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>📖 교재 정답 & 워크북 확인</span>
            </button>

            <div className="text-xs text-[#9FC0DC] hidden lg:flex items-center gap-1.5 font-medium">
              <Layers className="w-4 h-4 text-[#3FA796]" />
              <span>기하 최적화 · 네트워크 확산 · 생명수학 완비</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Course Hero Selection */}
      <section className="max-w-6xl mx-auto px-5 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-amber-400 text-xs font-semibold mb-4 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>2026 중등수학 영재교육원 · 수학 탐구 실험실 포털</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          탐구할 <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">수학 실험실</span>을 선택하세요
        </h1>
        <p className="mt-3.5 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          자연과 생명, 일상 속 숨겨진 수학적 원리를 직접 조작하고 시뮬레이션하는 인터랙티브 실험실입니다.{' '}
          기하 최적화(페르마 점), 네트워크 확산(감염병·소문), 생명현상(골절 치유) 중 오늘 탐구할 과정을 선택하세요.
        </p>
      </section>

      {/* Main Course Grid */}
      <main className="relative max-w-6xl mx-auto px-5 mt-2 space-y-7">
        {/* NEW FEATURE CARD: 2026 중등영재 수학 워크북 & 교재 정답 확인관 */}
        <div className="bg-gradient-to-r from-[#0F2942] via-[#153A5C] to-[#0D253A] border-2 border-[#0284c7] rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden group hover:border-[#38bdf8] transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#0284c7]/30 border border-[#0284c7]/50 text-[#38bdf8] text-xs font-bold font-mono flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>2026 중등영재 수학 정규 교재 연계 워크북</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#10b981]/20 border border-[#10b981]/40 text-[#34d399] text-[11px] font-bold">
                  ✨ 전 문항 실시간 정답 & 해설 수록
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                <span>📖 2026 인터랙티브 워크북 & 교재 정답 확인관</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#9FC0DC] max-w-3xl leading-relaxed">
                수업 중에 빔프로젝터나 태블릿으로 띄워놓고 학생들과 질문-답변을 나누며 즉시 <strong>[정답 및 해설]</strong>을 확인하고,{' '}
                <strong>헤론 대칭 작도기</strong>, <strong>페르마 점 줌 캔버스</strong>, <strong>인접 행렬 악수 정리</strong>, <strong>R₀ 지수곡선 표</strong>, <strong>신종 바이러스 '수학-26' SIR 예측 모델</strong>을 직접 시뮬레이션할 수 있습니다.
              </p>
            </div>

            <button
              onClick={() => onSelectCourse('workbook')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0284c7] to-[#2563eb] hover:from-[#0369a1] hover:to-[#1d4ed8] text-white font-bold text-sm shadow-xl transition-all cursor-pointer hover:scale-105 shrink-0"
            >
              <span>교재 워크북 & 정답관 열기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* NEW FEATURE CARD: 2026 수학 영재 산출물 & 발표회 아이디어 익스텐더 */}
        <div className="bg-gradient-to-r from-[#171638] via-[#1E1B4B] to-[#0F172A] border-2 border-indigo-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden group hover:border-indigo-400 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/50 text-indigo-300 text-xs font-bold font-mono flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>영재원 산출물 & 발표회 기획 엔진</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
                  ✨ 11대 영재 추천 주제 & 자동 기획서 생성
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 tracking-tight">
                <span>💡 수학 영재 산출물 & 발표회 아이디어 익스텐더</span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                <strong>몬티홀의 역설, 님 게임 필승법, 미우라 접기, 3D 멩거 스펀지, 보로노이 지도, 페르마 점 비누막, 골절 치유 로지스틱</strong> 등 
                영재원 산출물 주제를 <strong>중등 연계 개념, 30초 오프닝 훅, 청중 참여형 데모, 실물 교구/SW 산출물 확장, 3분 발표 타임라인</strong>으로 즉시 체계화합니다.
              </p>
            </div>

            <button
              onClick={() => onSelectCourse('ideas')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-bold text-sm shadow-xl transition-all cursor-pointer hover:scale-105 shrink-0"
            >
              <span>산출물 아이디어 고민하기</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* TOP ROW: Course 1 (Geometry) & Course 2 (Diffusion) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
          {/* COURSE 1: 기하 최적화와 페르마 점 */}
          <div className="bg-gradient-to-b from-[#153A5C] to-[#0E2A45] border border-[#2C567F] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between hover:border-[#7FC4EE] transition-all group">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#E7A93D]/20 border border-[#E7A93D]/40 text-[#E7A93D] text-xs font-bold font-mono flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>수학 × 기하학 × 자연의 물리 융합 (3차시)</span>
                </span>
                <span className="text-xs font-mono text-[#6FCF97] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>6개 인터랙티브 랩</span>
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1B4468] border border-[#7FC4EE]/50 flex items-center justify-center shrink-0 shadow-lg text-2xl group-hover:scale-105 transition-transform">
                  📐
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#EAF3FC] group-hover:text-[#E7A93D] transition-colors tracking-tight">
                    가장 짧은 길을 찾아서
                  </h2>
                  <div className="text-xs font-medium text-[#9FC0DC] mt-0.5">
                    기하 최적화와 페르마 점 (당구대 · 도르래 · 비눗방울 · 도로망)
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#9FC0DC] leading-relaxed">
                강가의 물길에서 당구대 2단 쿠션, 토리첼리의 3중 도르래, 비눗방울의 표면장력, 도시 도로망까지 — 
                자연과 수학이 함께 찾는 최단 거리의 원리를 직접 점을 끌어보며 실험합니다. 왜 120도에서 만나는지 직접 확인하세요!
              </p>

              {/* Curriculum items */}
              <div className="mt-5 space-y-2">
                <div className="text-xs font-mono text-[#E7A93D] font-bold">
                  정규 커리큘럼 (6개 인터랙티브 랩):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0E2A45]/70 border border-[#2C567F]/70 text-[#EAF3FC]">
                    <span className="px-1.5 py-0.5 rounded bg-[#E7A93D]/30 text-[#E7A93D] text-[10px] font-bold font-mono">
                      1차시
                    </span>
                    <span>1. 헤론의 최단 거리 (강변 대칭)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0E2A45]/70 border border-[#2C567F]/70 text-[#EAF3FC]">
                    <span className="px-1.5 py-0.5 rounded bg-[#E7A93D]/30 text-[#E7A93D] text-[10px] font-bold font-mono">
                      1차시
                    </span>
                    <span>2. 당구대 2단 쿠션 반사 게임 🎱</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0E2A45]/70 border border-[#2C567F]/70 text-[#EAF3FC]">
                    <span className="px-1.5 py-0.5 rounded bg-[#7FC4EE]/30 text-[#7FC4EE] text-[10px] font-bold font-mono">
                      2차시
                    </span>
                    <span>3. 페르마 점 탐구 (작도와 120°)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0E2A45]/70 border border-[#2C567F]/70 text-[#EAF3FC]">
                    <span className="px-1.5 py-0.5 rounded bg-[#7FC4EE]/30 text-[#7FC4EE] text-[10px] font-bold font-mono">
                      2차시
                    </span>
                    <span>4. 토리첼리 3중 도르래 실험 ⚙️</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0E2A45]/70 border border-[#2C567F]/70 text-[#EAF3FC]">
                    <span className="px-1.5 py-0.5 rounded bg-[#7FC4EE]/30 text-[#7FC4EE] text-[10px] font-bold font-mono">
                      2차시
                    </span>
                    <span>5. 비눗방울 실험실 (슈타이너 X vs H)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0E2A45]/70 border border-[#2C567F]/70 text-[#6FCF97] font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-[#6FCF97]/30 text-[#6FCF97] text-[10px] font-bold font-mono">
                      3차시
                    </span>
                    <span>6. 도시 설계 & 외판원 TSP 게임 🎮</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#2C567F] flex items-center justify-between">
              <div className="text-[11px] text-[#9FC0DC]">
                🫧 비눗물 애니메이션 & 물리 도르래 시뮬레이터 완비
              </div>
              <button
                onClick={() => onSelectCourse('geometry')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E7A93D] hover:bg-[#d6992d] text-[#0E2A45] font-bold text-sm shadow-md transition-all cursor-pointer group-hover:translate-x-1"
              >
                <span>기하 최적화 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* COURSE 2: 확산의 수학 */}
          <div className="bg-gradient-to-b from-[#132E29] to-[#0A1A18] border border-[#234E47] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between hover:border-[#3FA796] transition-all group">
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#3FA796]/20 border border-[#3FA796]/40 text-[#3FA796] text-xs font-bold font-mono flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>수학 × 네트워크 × 감염병 역학 융합 (3차시)</span>
                </span>
                {diffusionProgress && diffusionProgress.completedMissions > 0 && (
                  <span className="text-xs font-mono text-[#F2B84B] flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>진행도: {diffusionProgress.completedMissions}/9 미션</span>
                  </span>
                )}
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#1A3D37] border border-[#3FA796]/50 flex items-center justify-center shrink-0 shadow-lg text-2xl group-hover:scale-105 transition-transform">
                  🦠
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#EAFBF6] group-hover:text-[#F2B84B] transition-colors tracking-tight">
                    퍼져나가는 것들의 수학
                  </h2>
                  <div className="text-xs font-medium text-[#7DBFB0] mt-0.5">
                    감염병·소문 확산과 네트워크 모델링 (SIR & 집단면역)
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-[#9FC0DC] leading-relaxed">
                소문 하나, 바이러스 하나가 온 도시로 번지는 과정 속에는 오일러의 그래프 이론, 지수함수적 폭발,
                미분방정식의 원리가 숨어 있습니다. 무작위 접종 vs 허브 접종의 7.5배 비밀을 풀고 집단면역을 달성해 보세요!
              </p>

              {/* Curriculum items */}
              <div className="mt-5 space-y-2">
                <div className="text-xs font-mono text-[#F2B84B] font-bold">
                  정규 커리큘럼 (9개 인터랙티브 랩):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A1A18]/60 border border-[#234E47]/70 text-[#EAFBF6]">
                    <span className="px-1.5 py-0.5 rounded bg-[#3FA796]/30 text-[#3FA796] text-[10px] font-bold font-mono">
                      1차시
                    </span>
                    <span>1. 네트워크 기초 (오일러 차수)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A1A18]/60 border border-[#234E47]/70 text-[#EAFBF6]">
                    <span className="px-1.5 py-0.5 rounded bg-[#3FA796]/30 text-[#3FA796] text-[10px] font-bold font-mono">
                      1차시
                    </span>
                    <span>2. 최단 경로 (다익스트라 탐색)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A1A18]/60 border border-[#234E47]/70 text-[#EAFBF6]">
                    <span className="px-1.5 py-0.5 rounded bg-[#3FA796]/30 text-[#3FA796] text-[10px] font-bold font-mono">
                      1차시
                    </span>
                    <span>3. 방화벽 브릿지 퍼즐 ✂️</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A1A18]/60 border border-[#234E47]/70 text-[#EAFBF6]">
                    <span className="px-1.5 py-0.5 rounded bg-[#F2B84B]/30 text-[#F2B84B] text-[10px] font-bold font-mono">
                      2차시
                    </span>
                    <span>4. 지수 확산 ($R_0$와 기하급수)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A1A18]/60 border border-[#234E47]/70 text-[#EAFBF6]">
                    <span className="px-1.5 py-0.5 rounded bg-[#F2B84B]/30 text-[#F2B84B] text-[10px] font-bold font-mono">
                      2차시
                    </span>
                    <span>5. 미분이란? (순간 변화율 접선)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A1A18]/60 border border-[#234E47]/70 text-[#EAFBF6]">
                    <span className="px-1.5 py-0.5 rounded bg-[#F2B84B]/30 text-[#F2B84B] text-[10px] font-bold font-mono">
                      2차시
                    </span>
                    <span>6. 방역 사령관 게임 (병상 사수) 🚨</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A1A18]/60 border border-[#234E47]/70 text-[#EAFBF6]">
                    <span className="px-1.5 py-0.5 rounded bg-[#F2B84B]/30 text-[#F2B84B] text-[10px] font-bold font-mono">
                      2차시
                    </span>
                    <span>7. SIR 미분방정식 시뮬레이터</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A1A18]/60 border border-[#234E47]/70 text-[#F2B84B] font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-[#C084FC]/30 text-[#C084FC] text-[10px] font-bold font-mono">
                      3차시
                    </span>
                    <span>8. 집단면역 배틀 게임 🎮 (5단계 해설)</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-[#0A1A18]/60 border border-[#234E47]/70 text-[#6FCF97] font-bold">
                    <span className="px-1.5 py-0.5 rounded bg-[#6FCF97]/30 text-[#6FCF97] text-[10px] font-bold font-mono">
                      3차시
                    </span>
                    <span>9. SNS 가짜 뉴스 방어 게임 🛡️</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#234E47] flex items-center justify-between">
              <div className="text-[11px] text-[#7DBFB0]">
                ✨ 무작위 vs 허브 7.5배 비밀 5단계 특강 해설관 완비
              </div>
              <button
                onClick={() => onSelectCourse('diffusion')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F2B84B] hover:bg-[#e0a638] text-[#0A1A18] font-bold text-sm shadow-md transition-all cursor-pointer group-hover:translate-x-1"
              >
                <span>확산의 수학 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW (FULL WIDTH): Course 3 (Bone Healing - 생명현상과 미분방정식) */}
        <div className="bg-gradient-to-r from-[#28153A] via-[#1E102C] to-[#140A1F] border border-[#A855F7]/70 rounded-3xl p-6 sm:p-7 shadow-2xl hover:border-[#F472B6] transition-all group">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              {/* Header Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-[#C084FC]/20 border border-[#C084FC]/40 text-[#E9D5FF] text-xs font-bold font-mono flex items-center gap-1.5">
                  <span>🦴</span>
                  <span>생명현상 × 의학 × 미분방정식 융합</span>
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F472B6]/20 border border-[#F472B6]/40 text-[#F472B6] text-xs font-bold font-mono flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  <span>실시간 골절 치유 시뮬레이터</span>
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#190C25] border border-[#C084FC] flex items-center justify-center shrink-0 shadow-lg text-2xl group-hover:scale-105 transition-transform">
                  🦴
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#FAF5FF] group-hover:text-[#F472B6] transition-colors tracking-tight">
                    부러진 뼈가 붙는 수학
                  </h2>
                  <div className="text-xs font-medium text-[#D8B4FE] mt-0.5">
                    미분방정식으로 보는 골절 치유 (로지스틱 치유 & 4단계 카스케이드 사슬 반응)
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-[#E2D9F3] max-w-3xl leading-relaxed">
                뼈는 하루아침에 붙지 않습니다. 혈종(H) → 연성가골(S) → 경성가골(C) → 재형성된 뼈(R) 4단계를 거치며 서서히 회복됩니다.{' '}
                "남은 회복 여력"에 따라 속도가 변하는 <strong className="text-[#F472B6]">로지스틱 미분방정식</strong>과, 네 단계가 서로 얽혀 가장 느린 단계가 전체 속도를 지배하는 <strong className="text-[#C084FC]">사슬형 연립미분방정식(병목 현상)</strong>을 직접 관찰하세요!
              </p>

              {/* Exploration Stations */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl text-xs">
                <div className="p-2.5 rounded-xl bg-[#140A1F]/70 border border-[#4E296C] text-[#FAF5FF]">
                  <div className="font-bold text-[#F472B6] flex items-center gap-1.5 mb-1">
                    <span className="w-4 h-4 rounded-full bg-[#F472B6]/20 text-[#F472B6] flex items-center justify-center text-[10px] font-mono">1</span>
                    <span>1. 로지스틱 치유 모델</span>
                  </div>
                  <div className="text-[11px] text-[#D8B4FE]">
                    dB/dt = k·B·(100−B)/100 모델링, S자 치유 곡선 및 70일 완치 미션
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#140A1F]/70 border border-[#4E296C] text-[#FAF5FF]">
                  <div className="font-bold text-[#C084FC] flex items-center gap-1.5 mb-1">
                    <span className="w-4 h-4 rounded-full bg-[#C084FC]/20 text-[#C084FC] flex items-center justify-center text-[10px] font-mono">2</span>
                    <span>2. 4단계 카스케이드 시뮬레이터 🎮</span>
                  </div>
                  <div className="text-[11px] text-[#D8B4FE]">
                    H→S→C→R 4원 연립미분방정식, 청소년·성인 환자 프로필 및 병목 구간 분석
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="flex md:flex-col items-center justify-between md:justify-center gap-3 shrink-0 pt-2 md:pt-6">
              <div className="text-xs text-[#D8B4FE] hidden md:block text-center font-mono">
                생명수학 실험실
              </div>
              <button
                onClick={() => onSelectCourse('bone')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#C084FC] via-[#E879F9] to-[#F472B6] hover:from-[#A855F7] hover:to-[#EC4899] text-[#120A1A] font-extrabold text-sm shadow-xl transition-all cursor-pointer group-hover:scale-105"
              >
                <span>뼈 치유 실험실 시작하기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pt-8 pb-10 border-t border-[#1B4268] text-center text-xs text-[#7A9BB8] space-y-1">
        <div>2026 중등수학 영재교육원 · 기하 최적화 &amp; 감염병 확산 &amp; 생체수학 융합 플랫폼</div>
        <div className="text-[#9FC0DC] font-medium tracking-wide">
          Development &amp; Design: Seulgi Jeong
        </div>
      </footer>
    </div>
  );
};
