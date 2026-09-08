import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ShieldCheck,
  Flame,
  Users,
  GitFork,
  HelpCircle,
  Check,
  AlertTriangle,
  Award
} from 'lucide-react';
import { MathView } from './MathView';

interface MiddleSchoolExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardXP?: (amount: number) => void;
}

export const MiddleSchoolExplainModal: React.FC<MiddleSchoolExplainModalProps> = ({
  isOpen,
  onClose,
  onRewardXP,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reset or keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setCurrentStep((prev) => Math.min(5, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentStep((prev) => Math.max(1, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      id="explain-modal-overlay"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === 'explain-modal-overlay') onClose();
      }}
    >
      <div className="relative w-full max-w-3xl bg-[#0E2420] border-2 border-[#3FA796] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#234E47] bg-[#132E29]">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#F2B84B]/20 text-[#F2B84B] text-lg">💡</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#EAFBF6]">
                  중학생 눈높이 특강: 무작위 vs 허브, 왜 차이가 날까?
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#3FA796]/20 text-[#3FA796] border border-[#3FA796]/40">
                  교과 연계 · 수학과 과학
                </span>
              </div>
              <p className="text-xs text-[#7DBFB0] mt-0.5">
                버튼을 눌러 한 단계씩 차근차근 원리를 파헤쳐 보세요!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7DBFB0] hover:text-white hover:bg-[#1A3D37] transition-colors"
            title="닫기 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-[#1A3D37] px-5 py-2.5 border-b border-[#234E47] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5].map((step) => {
              const isActive = step === currentStep;
              const isPast = step < currentStep;
              return (
                <button
                  key={step}
                  onClick={() => setCurrentStep(step)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                    isActive
                      ? 'bg-[#F2B84B] text-[#0A1A18] shadow-md shadow-[#F2B84B]/20 scale-105'
                      : isPast
                      ? 'bg-[#234E47] text-[#4ADE80] hover:bg-[#2c5f56]'
                      : 'bg-[#132E29] text-[#7DBFB0] hover:bg-[#234E47]'
                  }`}
                >
                  {isPast ? <Check className="w-3 h-3" /> : null}
                  <span>{step}단계</span>
                </button>
              );
            })}
          </div>
          <span className="text-xs font-mono text-[#F2B84B] whitespace-nowrap font-bold">
            {currentStep} / {totalSteps}
          </span>
        </div>

        {/* Modal Body with Step Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-[#EAFBF6] space-y-4">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C084FC]/15 text-[#C084FC] border border-[#C084FC]/30 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                1단계: 세상은 공평하지 않다? 네트워크 속 &lsquo;슈퍼 인싸&rsquo;
              </div>

              <h4 className="text-xl font-bold text-white leading-snug">
                모든 사람이 똑같이 친구를 가질까요? No! 소수의 <span className="text-[#C084FC] underline decoration-[#C084FC]/40 underline-offset-4">&lsquo;허브(Hub)&rsquo;</span>가 있어요!
              </h4>

              {/* 중학생 공감 비유 카드 */}
              <div className="p-4 rounded-xl bg-[#132E29] border border-[#234E47] space-y-2.5">
                <div className="text-xs font-bold text-[#F2B84B] flex items-center gap-1.5">
                  <span>🏫</span> 중학생 맞춤 비유: 우리 학교를 떠올려 볼까요?
                </div>
                <p className="text-sm text-[#D1F2EB] leading-relaxed">
                  학교에 가면 자기 짝꿍이나 단짝 1~2명하고만 주로 노는 친구들이 대부분이에요.
                  하지만 전교 학생회장이나 동아리 부장처럼, <b>전교생 300명 중 50명과 인사하고 다니는 &lsquo;마당발 인싸&rsquo;</b>가 꼭 한두 명씩 있죠?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#234E47]">
                    <div className="text-xs text-[#7DBFB0] font-semibold mb-1">보통 사람 (대부분의 점)</div>
                    <div className="text-sm font-bold text-[#EAFBF6]">친구 1~2명 (차수 1~2)</div>
                    <div className="text-xs text-[#7DBFB0] mt-1">골목길처럼 연결이 적어요.</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#C084FC]/40">
                    <div className="text-xs text-[#C084FC] font-semibold mb-1">슈퍼 허브 (소수의 핵심 점) 👑</div>
                    <div className="text-sm font-bold text-[#F2B84B]">친구 10~20명 이상 (차수 10+)</div>
                    <div className="text-xs text-[#C084FC] mt-1">사통팔달 고속도로 교차로!</div>
                  </div>
                </div>
              </div>

              {/* 시각 그래픽 예시 */}
              <div className="p-4 rounded-xl bg-[#0A1A18] border border-[#234E47] flex flex-col items-center">
                <div className="text-xs text-[#7DBFB0] mb-2 font-mono">
                  [수학 용어] 노드(점)와 연결된 선의 개수를 <span className="text-[#F2B84B] font-bold">&lsquo;차수(Degree)&rsquo;</span>라고 불러요!
                </div>
                <svg viewBox="0 0 500 160" className="w-full max-w-md h-36">
                  {/* Lines to center hub */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const x2 = 250 + Math.cos(rad) * 60;
                    const y2 = 80 + Math.sin(rad) * 60;
                    return (
                      <g key={i}>
                        <line x1="250" y1="80" x2={x2} y2={y2} stroke="#C084FC" strokeWidth="2.5" strokeOpacity="0.7" />
                        <circle cx={x2} cy={y2} r="6" fill="#1A3D37" stroke="#3FA796" strokeWidth="1.5" />
                      </g>
                    );
                  })}
                  {/* Center Hub */}
                  <circle cx="250" cy="80" r="22" fill="#C084FC" stroke="#FFFFFF" strokeWidth="3" />
                  <text x="250" y="85" fill="#0A1A18" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono">
                    허브
                  </text>

                  {/* Ordinary small nodes */}
                  <line x1="60" y1="80" x2="110" y2="80" stroke="#234E47" strokeWidth="2" />
                  <circle cx="60" cy="80" r="10" fill="#1A3D37" stroke="#3FA796" strokeWidth="1.5" />
                  <circle cx="110" cy="80" r="10" fill="#1A3D37" stroke="#3FA796" strokeWidth="1.5" />
                  <text x="85" y="115" fill="#7DBFB0" fontSize="11" textAnchor="middle">
                    보통 노드 (차수=1)
                  </text>
                  <text x="250" y="152" fill="#F2B84B" fontSize="12" fontWeight="bold" textAnchor="middle">
                    허브 노드 (차수=8개 이상)
                  </text>
                </svg>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6B5C]/15 text-[#FF6B5C] border border-[#FF6B5C]/30 text-xs font-bold">
                <Flame className="w-3.5 h-3.5" />
                2단계: 바이러스의 시선 — 허브는 &lsquo;고속도로 톨게이트&rsquo;!
              </div>

              <h4 className="text-xl font-bold text-white leading-snug">
                바이러스가 허브에 도착하면, <span className="text-[#FF6B5C]">한 방에 폭발적 확산</span>이 일어납니다!
              </h4>

              <div className="p-4 rounded-xl bg-[#132E29] border border-[#234E47] space-y-2.5">
                <div className="text-xs font-bold text-[#FF6B5C] flex items-center gap-1.5">
                  <span>🚨</span> 바이러스의 입장에서 생각해 볼까요?
                </div>
                <p className="text-sm text-[#D1F2EB] leading-relaxed">
                  친구가 1명인 학생이 감염되면? 그 단짝 1명에게만 전파될 위험이 있어요.
                  <br />
                  하지만 <b>친구 15명인 &lsquo;슈퍼 허브&rsquo; 학생이 감염되면? 다음 날 15명이 동시에 감염</b>됩니다!
                </p>
                <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#FF6B5C]/30 text-xs text-[#EAFBF6] flex items-start gap-2.5">
                  <span className="text-base">✈️</span>
                  <div>
                    <b>실제 예시:</b> 코로나19 때 전 세계로 바이러스가 빠르게 번진 이유도, 각국의 승객이 환승하는 <b>인천공항, 뉴욕공항, 런던공항 같은 &lsquo;허브 공항&rsquo;</b>이 감염 경로였기 때문이에요.
                  </div>
                </div>
              </div>

              {/* 시각화: 허브 감염 폭발 */}
              <div className="p-4 rounded-xl bg-[#0A1A18] border border-[#FF6B5C]/40 flex flex-col items-center">
                <div className="text-xs text-[#FF6B5C] mb-1 font-bold">
                  허브 1명이 감염되었을 때 발생하는 연쇄 폭발
                </div>
                <div className="text-xs text-[#7DBFB0] mb-3">
                  단 한 번의 접촉으로 8곳 이상의 마을로 불길(바이러스)이 번져 나갑니다.
                </div>
                <svg viewBox="0 0 500 160" className="w-full max-w-md h-36">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const x2 = 250 + Math.cos(rad) * 60;
                    const y2 = 80 + Math.sin(rad) * 60;
                    return (
                      <g key={i}>
                        <line x1="250" y1="80" x2={x2} y2={y2} stroke="#FF6B5C" strokeWidth="3" strokeDasharray="4 2" />
                        <circle cx={x2} cy={y2} r="7" fill="#FF6B5C" stroke="#FF9585" strokeWidth="2" />
                        <circle cx={x2} cy={y2} r="14" fill="none" stroke="#FF6B5C" strokeWidth="1" opacity="0.6" />
                      </g>
                    );
                  })}
                  <circle cx="250" cy="80" r="24" fill="#FF6B5C" stroke="#FFFFFF" strokeWidth="3.5" />
                  <text x="250" y="85" fill="#FFFFFF" fontSize="14" fontWeight="bold" textAnchor="middle">
                    🦠 감염
                  </text>
                  <text x="250" y="152" fill="#FF6B5C" fontSize="12" fontWeight="bold" textAnchor="middle">
                    🔥 8개 연결선으로 동시에 불길이 번짐!
                  </text>
                </svg>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2B84B]/15 text-[#F2B84B] border border-[#F2B84B]/30 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                3단계: 제비뽑기(무작위 접종)의 치명적인 함정
              </div>

              <h4 className="text-xl font-bold text-white leading-snug">
                아무나 무작위로 뽑아 백신을 놓으면 <span className="text-[#F2B84B]">왜 백신을 낭비</span>하게 될까요?
              </h4>

              <div className="p-4 rounded-xl bg-[#132E29] border border-[#234E47] space-y-2.5">
                <div className="text-xs font-bold text-[#F2B84B] flex items-center gap-1.5">
                  <span>🎲</span> 확률의 비밀: 제비뽑기를 하면 누가 뽑힐까?
                </div>
                <p className="text-sm text-[#D1F2EB] leading-relaxed">
                  전체 인구 중 <b>90%는 연결선이 1~2개뿐인 평범한 사람</b>이고, <b>허브는 단 5~10%</b>뿐이에요.
                  눈을 감고 무작위로 10명을 뽑으면 어떻게 될까요?
                </p>
                <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#234E47] space-y-1.5 text-xs">
                  <div className="text-[#FF6B5C] font-bold">❌ 결과: 골목길에만 백신 쉴드가 쳐지고, 고속도로는 뻥 뚫림!</div>
                  <p className="text-[#7DBFB0] leading-relaxed">
                    연결이 1개뿐인 외딴 곳의 친구들만 우연히 백신을 맞고, <b>정작 수십 명과 만나는 &lsquo;슈퍼 허브&rsquo;는 백신을 못 맞을 확률이 너무 높아요.</b>
                    결국 바이러스가 고속도로(허브)를 밟는 순간, 무작위 접종 방어선은 그대로 무너집니다!
                  </p>
                </div>
              </div>

              {/* 시각화: 무작위 접종의 빈틈 */}
              <div className="p-4 rounded-xl bg-[#0A1A18] border border-[#234E47] flex flex-col items-center">
                <div className="text-xs text-[#F2B84B] mb-2 font-bold">
                  🎲 무작위 접종 시: 흩뿌려진 백신 (초록) vs 여전히 무방비인 중심 허브 (빨강)
                </div>
                <svg viewBox="0 0 500 150" className="w-full max-w-md h-36">
                  {/* Edges */}
                  <line x1="120" y1="75" x2="250" y2="75" stroke="#234E47" strokeWidth="2" />
                  <line x1="380" y1="75" x2="250" y2="75" stroke="#234E47" strokeWidth="2" />
                  <line x1="250" y1="20" x2="250" y2="75" stroke="#234E47" strokeWidth="2" />
                  <line x1="250" y1="130" x2="250" y2="75" stroke="#234E47" strokeWidth="2" />
                  <line x1="160" y1="30" x2="250" y2="75" stroke="#234E47" strokeWidth="2" />
                  <line x1="340" y1="120" x2="250" y2="75" stroke="#234E47" strokeWidth="2" />

                  {/* Hub unprotected */}
                  <circle cx="250" cy="75" r="22" fill="#FF6B5C" stroke="#FF9585" strokeWidth="3" />
                  <text x="250" y="80" fill="#0A1A18" fontSize="11" fontWeight="bold" textAnchor="middle">
                    허브 (무방비)
                  </text>

                  {/* Random vaccinated small nodes */}
                  <circle cx="120" cy="75" r="12" fill="#3FA796" stroke="#7BDBCA" strokeWidth="2" />
                  <text x="120" y="79" fill="#0A1A18" fontSize="9" fontWeight="bold" textAnchor="middle">
                    백신
                  </text>
                  <circle cx="380" cy="75" r="12" fill="#3FA796" stroke="#7BDBCA" strokeWidth="2" />
                  <text x="380" y="79" fill="#0A1A18" fontSize="9" fontWeight="bold" textAnchor="middle">
                    백신
                  </text>

                  <circle cx="250" cy="20" r="9" fill="#1A3D37" stroke="#3FA796" strokeWidth="1.5" />
                  <circle cx="250" cy="130" r="9" fill="#1A3D37" stroke="#3FA796" strokeWidth="1.5" />
                  <circle cx="160" cy="30" r="9" fill="#1A3D37" stroke="#3FA796" strokeWidth="1.5" />
                  <circle cx="340" cy="120" r="9" fill="#1A3D37" stroke="#3FA796" strokeWidth="1.5" />

                  <text x="250" y="148" fill="#FF6B5C" fontSize="11" fontWeight="bold" textAnchor="middle">
                    ⚠️ 중심 허브가 뚫려 있어 바이러스가 사방으로 통과 가능!
                  </text>
                </svg>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3FA796]/15 text-[#3FA796] border border-[#3FA796]/30 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                4단계: 허브 접종의 마법 — &lsquo;길목 차단&rsquo;과 &lsquo;우산 효과&rsquo;
              </div>

              <h4 className="text-xl font-bold text-white leading-snug">
                핵심 길목(허브) 1곳만 막아도, <span className="text-[#3FA796]">수십 명이 자동으로 보호</span>됩니다!
              </h4>

              <div className="p-4 rounded-xl bg-[#132E29] border border-[#234E47] space-y-2.5">
                <div className="text-xs font-bold text-[#3FA796] flex items-center gap-1.5">
                  <span>☂️</span> 중학생 맞춤 비유: 우산 효과 (집단면역의 본질)
                </div>
                <p className="text-sm text-[#D1F2EB] leading-relaxed">
                  소나기가 쏟아질 때, 작은 우산 10개를 각자 쓰는 것보다 <b>광장 한가운데에 거대한 파라솔(허브 쉴드)</b>을 하나 딱 펼치는 걸 상상해 보세요.
                  그 파라솔 아래에 모인 수많은 친구들은 <b>자기 우산(백신)이 없어도 비를 전혀 맞지 않아요!</b>
                </p>
                <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#3FA796]/40 space-y-1.5 text-xs">
                  <div className="text-[#4ADE80] font-bold">🛡️ 고속도로 톨게이트 폐쇄 효과:</div>
                  <p className="text-[#7DBFB0] leading-relaxed">
                    허브 노드가 백신을 맞으면(면역 획득), 바이러스는 허브를 통과할 수 없습니다.
                    <b>허브에 연결된 10~15개의 도로가 한꺼번에 차단</b>되어 네트워크가 작은 안전지대들로 쪼개집니다!
                  </p>
                </div>
              </div>

              {/* 시각화: 허브 쉴드와 안전지대 */}
              <div className="p-4 rounded-xl bg-[#0A1A18] border border-[#3FA796]/40 flex flex-col items-center">
                <div className="text-xs text-[#4ADE80] mb-2 font-bold">
                  🎯 허브 접종: 중심 교차로가 방패가 되어 바이러스 이동선 완전 차단
                </div>
                <svg viewBox="0 0 500 150" className="w-full max-w-md h-36">
                  {/* Blocked Edges */}
                  <line x1="120" y1="75" x2="250" y2="75" stroke="#3FA796" strokeWidth="3" />
                  <line x1="380" y1="75" x2="250" y2="75" stroke="#3FA796" strokeWidth="3" />
                  <line x1="250" y1="20" x2="250" y2="75" stroke="#3FA796" strokeWidth="3" />
                  <line x1="250" y1="130" x2="250" y2="75" stroke="#3FA796" strokeWidth="3" />
                  <line x1="160" y1="30" x2="250" y2="75" stroke="#3FA796" strokeWidth="3" />
                  <line x1="340" y1="120" x2="250" y2="75" stroke="#3FA796" strokeWidth="3" />

                  {/* X block markers */}
                  <text x="180" y="72" fill="#3FA796" fontSize="13" fontWeight="bold">✕</text>
                  <text x="310" y="72" fill="#3FA796" fontSize="13" fontWeight="bold">✕</text>
                  <text x="254" y="50" fill="#3FA796" fontSize="13" fontWeight="bold">✕</text>
                  <text x="254" y="110" fill="#3FA796" fontSize="13" fontWeight="bold">✕</text>

                  {/* Hub with Shield */}
                  <circle cx="250" cy="75" r="26" fill="none" stroke="#7BDBCA" strokeWidth="3" strokeDasharray="4 2" />
                  <circle cx="250" cy="75" r="22" fill="#3FA796" stroke="#FFFFFF" strokeWidth="3" />
                  <text x="250" y="80" fill="#0A1A18" fontSize="13" fontWeight="bold" textAnchor="middle">
                    🛡️ V
                  </text>

                  {/* Protected nodes */}
                  <circle cx="120" cy="75" r="10" fill="#1A3D37" stroke="#4ADE80" strokeWidth="2" />
                  <circle cx="380" cy="75" r="10" fill="#1A3D37" stroke="#4ADE80" strokeWidth="2" />
                  <circle cx="250" cy="20" r="9" fill="#1A3D37" stroke="#4ADE80" strokeWidth="2" />
                  <circle cx="250" cy="130" r="9" fill="#1A3D37" stroke="#4ADE80" strokeWidth="2" />
                  <circle cx="160" cy="30" r="9" fill="#1A3D37" stroke="#4ADE80" strokeWidth="2" />
                  <circle cx="340" cy="120" r="9" fill="#1A3D37" stroke="#4ADE80" strokeWidth="2" />

                  <text x="250" y="148" fill="#4ADE80" fontSize="11" fontWeight="bold" textAnchor="middle">
                    ✅ 백신 안 맞은 노드들도 허브 덕분에 100% 안전!
                  </text>
                </svg>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30 text-xs font-bold">
                <GitFork className="w-3.5 h-3.5" />
                5단계: 중학 수학으로 딱 떨어지는 차수(Degree) 비교!
              </div>

              <h4 className="text-xl font-bold text-white leading-snug">
                숫자로 보는 결론: <span className="text-[#F2B84B]">백신 1개당 효율이 7~8배 이상</span> 차이 납니다!
              </h4>

              {/* 수학 공식 및 비교 표 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-xl bg-[#132E29] border border-[#FF6B5C]/30 space-y-2">
                  <div className="text-xs font-bold text-[#FF6B5C] flex items-center justify-between">
                    <span>🎲 무작위 접종 (3명)</span>
                    <span className="font-mono text-xs text-[#7DBFB0]">비효율</span>
                  </div>
                  <div className="text-sm font-mono text-[#EAFBF6]">
                    차수 합 = 1 + 1 + 2 = <b className="text-[#FF6B5C] text-base">4개</b>
                  </div>
                  <div className="text-xs text-[#7DBFB0]">
                    차단된 전파 경로: 고작 <b>4개 선</b>
                  </div>
                  <div className="text-[11px] text-[#7DBFB0] pt-1 border-t border-[#234E47]">
                    백신 1개당 차단 경로: 약 <b>1.3개</b>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#132E29] border border-[#3FA796] space-y-2 shadow-lg shadow-[#3FA796]/10">
                  <div className="text-xs font-bold text-[#3FA796] flex items-center justify-between">
                    <span>🎯 허브 접종 (단 1명!)</span>
                    <span className="font-mono text-xs text-[#4ADE80]">압도적 승리 🏆</span>
                  </div>
                  <div className="text-sm font-mono text-[#EAFBF6]">
                    차수 = <b className="text-[#4ADE80] text-base">10개 이상!</b>
                  </div>
                  <div className="text-xs text-[#D1F2EB]">
                    차단된 전파 경로: 무려 <b>10개 선 일괄 차단</b>
                  </div>
                  <div className="text-[11px] text-[#4ADE80] pt-1 border-t border-[#234E47] font-semibold">
                    백신 1개당 차단 경로: <b>10.0개</b> (무작위 대비 7.5배!)
                  </div>
                </div>
              </div>

              {/* 한눈에 정리하는 3줄 요약 카드 */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#132E29] to-[#1A3D37] border border-[#F2B84B]/40 space-y-2">
                <div className="text-xs font-bold text-[#F2B84B] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#F2B84B]" />
                  <span>중학생을 위한 핵심 3줄 정리</span>
                </div>
                <ul className="text-xs sm:text-sm text-[#EAFBF6] space-y-1.5 list-disc list-inside">
                  <li>
                    <b>1. 허브는 교차로:</b> 연결선(차수)이 월등히 많아 바이러스 전파의 슈퍼 고속도로 역할을 한다.
                  </li>
                  <li>
                    <b>2. 무작위의 실패:</b> 제비뽑기로 접종하면 골목길만 막고 고속도로는 활짝 열려 있다.
                  </li>
                  <li>
                    <b>3. 허브 접종의 기적:</b> 소수의 허브만 차단해도 네트워크 전체가 격리되어 <b>적은 백신으로 전체를 구한다!</b>
                  </li>
                </ul>
              </div>

              {/* 중학생 퀴즈 섹션 */}
              <div className="p-4 rounded-xl bg-[#0A1A18] border border-[#234E47] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#C084FC] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#C084FC]" />
                    <span>이해도 쑥쑥! 확인 퀴즈 (+30 XP)</span>
                  </div>
                  <span className="text-[11px] text-[#7DBFB0]">정답을 골라보세요</span>
                </div>
                <p className="text-xs sm:text-sm text-[#EAFBF6]">
                  <b>Q.</b> 다음 중 감염병 발생 시 한정된 백신으로 가장 많은 사람을 보호할 수 있는 최고의 전략은?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 1, text: 'A. 이름 순서대로 무작위 제비뽑기하기' },
                    { id: 2, text: 'B. 연결선(차수)이 가장 많은 슈퍼 허브 먼저 접종하기', correct: true },
                    { id: 3, text: 'C. 친구가 1명뿐인 조용한 학생 먼저 접종하기' },
                    { id: 4, text: 'D. 아무도 접종하지 않고 지켜보기' },
                  ].map((option) => {
                    const isSelected = quizAnswer === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          setQuizAnswer(option.id);
                          setQuizSubmitted(true);
                          if (option.correct && onRewardXP) {
                            onRewardXP(30);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? option.correct
                              ? 'bg-[#4ADE80]/20 border-[#4ADE80] text-[#4ADE80] font-bold'
                              : 'bg-[#FF6B5C]/20 border-[#FF6B5C] text-[#FF6B5C]'
                            : 'bg-[#132E29] border-[#234E47] text-[#D1F2EB] hover:bg-[#1A3D37]'
                        }`}
                      >
                        <span>{option.text}</span>
                        {isSelected && option.correct && <Award className="w-4 h-4 text-[#4ADE80]" />}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && quizAnswer === 2 && (
                  <div className="p-2.5 rounded-lg bg-[#4ADE80]/15 border border-[#4ADE80]/40 text-xs text-[#4ADE80] flex items-center gap-2">
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span><b>정답입니다! 🎉</b> 허브 1명을 차단하는 것이 수많은 일반인을 지키는 지름길입니다!</span>
                  </div>
                )}
                {quizSubmitted && quizAnswer !== 2 && (
                  <div className="p-2.5 rounded-lg bg-[#FF6B5C]/15 border border-[#FF6B5C]/40 text-xs text-[#FF6B5C]">
                    다시 생각해 보세요! 바이러스가 가장 많이 오가는 &lsquo;핵심 교차로&rsquo;가 어디일까요?
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Controls */}
        <div className="p-4 border-t border-[#234E47] bg-[#132E29] flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed text-[#7DBFB0] bg-[#1A3D37]'
                : 'text-[#7DBFB0] hover:text-white bg-[#1A3D37] hover:bg-[#234E47] border border-[#234E47]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 설명</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#7DBFB0]">
            <span>키보드</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#0A1A18] border border-[#234E47] text-[10px] text-[#F2B84B]">
              ←
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[#0A1A18] border border-[#234E47] text-[10px] text-[#F2B84B]">
              →
            </kbd>
            <span>로도 넘길 수 있어요!</span>
          </div>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#F2B84B] text-[#0A1A18] hover:bg-[#ffc65a] transition-all shadow-md shadow-[#F2B84B]/20 flex items-center gap-1.5"
          >
            <span>{currentStep === totalSteps ? '이해 완료! 닫기' : '다음 설명 보기'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
