import React, { useState } from 'react';
import { MathView } from './MathView';
import { Sparkles, Star, Target, Check } from 'lucide-react';

interface ExponentialTabProps {
  onCompleteMission: (xp: number, stars: number) => void;
  isMissionCompleted: boolean;
  onAddXP: (amount: number) => void;
}

export const ExponentialTab: React.FC<ExponentialTabProps> = ({
  onCompleteMission,
  isMissionCompleted,
  onAddXP,
}) => {
  const [k, setK] = useState(3);
  const [n, setN] = useState(3);
  const [pop, setPop] = useState(1000000);
  const [guess, setGuess] = useState('');
  const [guessFeedback, setGuessFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  const N = Math.pow(k, n);
  const stepsToPop = Math.ceil(Math.log(pop) / Math.log(k));

  const handleGuessSubmit = () => {
    const userGuess = Number(guess);
    if (isNaN(userGuess)) return;
    const actual = Math.pow(k, n);
    const err = Math.abs(userGuess - actual) / actual;

    if (err < 0.01) {
      setGuessFeedback({
        text: `🎯 대박! 정확하게 맞혔습니다! N = ${actual.toLocaleString()}`,
        correct: true,
      });
      onAddXP(50);
      onCompleteMission(50, 3);
    } else if (err < 0.25) {
      setGuessFeedback({
        text: `아깝습니다! 실제값은 ${actual.toLocaleString()} (오차 ${(err * 100).toFixed(0)}%)`,
        correct: false,
      });
      onAddXP(15);
    } else {
      setGuessFeedback({
        text: `실제값은 ${actual.toLocaleString()}입니다! 지수 성장은 생각보다 엄청나게 빠르죠?`,
        correct: false,
      });
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">지수적 폭발 💥 — 소문의 확산 속도</h2>
        <p className="text-sm text-[#7DBFB0]">
          확산은 덧셈이 아니라 곱셈으로 일어납니다. 지수함수의 폭발적인 위력을 직접 조작하며 체감해 보세요!
        </p>
      </div>

      {/* Mission Box */}
      <div className="bg-gradient-to-r from-[#C084FC]/10 to-[#F2B84B]/10 border border-[#C084FC]/30 rounded-xl p-3.5 flex items-start gap-3">
        <Target className="w-5 h-5 text-[#C084FC] flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs sm:text-sm">
          <div className="font-mono text-[11px] text-[#C084FC] font-bold tracking-wider">
            MISSION 3: 지수 예측 챌린지
          </div>
          <div className="text-[#EAFBF6] mt-0.5">
            슬라이더를 먼저 조작한 뒤 <b>N값을 먼저 머릿속으로 계산하거나 예측</b>하고 맞춰보세요!
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[#F2B84B] text-xs">
            <span>보상: +30 XP (정확 예측 시 +50 XP 보너스)</span>
            <div className="flex text-sm">
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Formula Box */}
      <div className="bg-black/30 border border-[#234E47] rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] font-mono text-[#C084FC] tracking-wider uppercase mb-1">
            지수 성장 공식
          </div>
          <MathView math="N(n) = k^n" display={true} className="text-[#EAFBF6]" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-[#C084FC] tracking-wider uppercase mb-1">
            도시 전체 확산 필요 단계
          </div>
          <MathView math="n = \left\lceil \frac{\ln M}{\ln k} \right\rceil" display={true} className="text-[#EAFBF6]" />
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Visual Graph & Dot Stage */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#234E47] rounded-xl p-4 space-y-4">
          {/* Bar Chart */}
          <div className="h-56 w-full">
            <svg viewBox="0 0 600 240" className="w-full h-full">
              {Array.from({ length: 11 }).map((_, i) => {
                const val = Math.pow(k, i);
                const maxVal = Math.pow(k, Math.max(n, 1));
                const barH = Math.min(190, (val / maxVal) * 190);
                const barW = 600 / 11 - 8;
                const x = 16 + i * (barW + 8);
                const isCurrent = i === n;

                return (
                  <g key={i}>
                    <rect
                      x={x}
                      y={210 - barH}
                      width={barW}
                      height={barH}
                      fill={isCurrent ? '#F2B84B' : '#234E47'}
                      rx={3}
                    />
                    <text
                      x={x + barW / 2}
                      y={228}
                      fill="#7DBFB0"
                      fontSize="11"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {i}단계
                    </text>
                    {isCurrent && (
                      <text
                        x={x + barW / 2}
                        y={Math.max(16, 210 - barH - 6)}
                        fill="#F2B84B"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="JetBrains Mono"
                        textAnchor="middle"
                      >
                        {val.toLocaleString()}명
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Dots Display */}
          <div className="border-t border-[#234E47] pt-3">
            <div className="flex justify-between items-center text-xs text-[#7DBFB0] mb-2 font-mono">
              <span>감염 인원 가각화 ({N > 300 ? `처음 300명 / 총 ${N.toLocaleString()}명` : `${N}명`})</span>
              <span className="text-[#F2B84B] font-bold">1개 점 = 1명</span>
            </div>
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-2 bg-[#132E29] rounded-lg border border-[#234E47]">
              {Array.from({ length: Math.min(N, 300) }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#FF6B5C] animate-in zoom-in-50 duration-200"
                />
              ))}
              {N > 300 && (
                <span className="text-[11px] font-mono text-[#F2B84B] self-center ml-2">
                  +{(N - 300).toLocaleString()}명 더...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="bg-[#1A3D37] border border-[#234E47] rounded-xl p-4 space-y-4">
          {/* Slider 1: k */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#7DBFB0]">
              <span>1명이 퍼뜨리는 수 (k)</span>
              <span className="font-mono text-sm font-bold text-[#F2B84B]">{k}명</span>
            </div>
            <input
              type="range"
              min="2"
              max="6"
              step="1"
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="w-full accent-[#F2B84B]"
            />
          </div>

          {/* Slider 2: n */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#7DBFB0]">
              <span>경과 단계 (n)</span>
              <span className="font-mono text-sm font-bold text-[#F2B84B]">{n}단계</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-[#F2B84B]"
            />
          </div>

          {/* Current formula output */}
          <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#234E47] text-xs space-y-1">
            <div className="text-[#7DBFB0]">현재 확산 인원</div>
            <div className="text-base font-mono font-bold text-[#FF6B5C]">
              N = {k}
              <sup>{n}</sup> = {N.toLocaleString()}명
            </div>
          </div>

          {/* Prediction Game */}
          <div className="p-3 rounded-lg bg-[#C084FC]/10 border border-[#C084FC]/30 space-y-2 text-xs">
            <div className="font-bold text-[#C084FC] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>🎯 깜짝 예측 퀴즈</span>
            </div>
            <p className="text-[#D1F2EB] text-[11px]">
              k={k}, n={n}일 때 N은 얼마일까요? 직접 암산해서 맞춰보세요!
            </p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="예측값 입력"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded bg-[#0A1A18] border border-[#234E47] text-xs text-white"
              />
              <button
                onClick={handleGuessSubmit}
                className="px-3 py-1.5 rounded bg-[#C084FC] hover:bg-[#d09eff] text-[#0A1A18] font-bold text-xs"
              >
                확인!
              </button>
            </div>
            {guessFeedback && (
              <div
                className={`p-2 rounded text-[11px] leading-relaxed ${
                  guessFeedback.correct ? 'bg-[#4ADE80]/20 text-[#4ADE80]' : 'bg-[#FF6B5C]/20 text-[#FF6B5C]'
                }`}
              >
                {guessFeedback.text}
              </div>
            )}
          </div>

          {/* City Population Calculator */}
          <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#234E47] space-y-2 text-xs">
            <div className="text-[#F2B84B] font-bold">도시 전체 전파 계산기</div>
            <div className="space-y-1">
              <label className="text-[11px] text-[#7DBFB0]">도시 인구 수 (명)</label>
              <input
                type="number"
                value={pop}
                onChange={(e) => setPop(Math.max(100, Number(e.target.value)))}
                className="w-full px-2.5 py-1.5 rounded bg-[#132E29] border border-[#234E47] text-xs text-white"
              />
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[#234E47]">
              <span className="text-[#7DBFB0]">전체 감염 소요 단계</span>
              <span className="font-mono text-base font-bold text-[#3FA796]">{stepsToPop}단계</span>
            </div>
            <div className="text-[10px] text-[#7DBFB0] leading-tight">
              ※ 100만 명 도시라도 1명이 {k}명씩만 전파하면 단 <b>{stepsToPop}번</b> 만에 전체가 감염됩니다!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
