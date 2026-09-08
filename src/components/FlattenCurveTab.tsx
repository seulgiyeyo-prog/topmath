import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertCircle, Play, RotateCcw, CheckCircle2, TrendingDown, Sparkles, DollarSign, Activity } from 'lucide-react';
import { MathView } from './MathView';

export const FlattenCurveTab: React.FC<{
  onCompleteMission?: (xp: number, stars: number) => void;
  isMissionCompleted?: boolean;
}> = ({ onCompleteMission, isMissionCompleted }) => {
  const TOTAL_POP = 1000;
  const ICU_LIMIT = 200; // Peak I cannot exceed 200

  // Policies
  const [distancingLevel, setDistancingLevel] = useState<number>(0); // 0, 1, 2, 3
  const [maskMandate, setMaskMandate] = useState<boolean>(false);
  const [contactTracing, setContactTracing] = useState<boolean>(false);

  // Simulation state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [day, setDay] = useState<number>(0);
  const [history, setHistory] = useState<{ day: number; S: number; I: number; R: number }[]>([
    { day: 0, S: 995, I: 5, R: 0 },
  ]);
  const [budgetSpent, setBudgetSpent] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [overwhelmed, setOverwhelmed] = useState<boolean>(false);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Current transmission parameters modified by policies
  // Base beta = 0.55, gamma = 0.12 (R0 ~ 4.58)
  let beta = 0.55;
  if (distancingLevel === 1) beta *= 0.75;
  else if (distancingLevel === 2) beta *= 0.55;
  else if (distancingLevel === 3) beta *= 0.35;

  if (maskMandate) beta *= 0.7;

  let gamma = 0.12;
  if (contactTracing) gamma *= 1.45;

  const currentR0 = (beta / gamma).toFixed(2);

  // Daily budget cost
  const dailyCost = distancingLevel * 25 + (maskMandate ? 10 : 0) + (contactTracing ? 20 : 0);

  // Step simulation 1 day
  const runSim = () => {
    if (isRunning) return;
    setIsRunning(true);
    setGameOver(false);
    setOverwhelmed(false);
    setGameWon(false);

    let currS = 995;
    let currI = 5;
    let currR = 0;
    let currDay = 0;
    let totalBudget = 0;
    let maxI = 5;

    const hist = [{ day: 0, S: currS, I: currI, R: currR }];

    const interval = setInterval(() => {
      currDay++;
      totalBudget += dailyCost;

      // SIR differential steps
      const newInfections = (beta * currS * currI) / TOTAL_POP;
      const newRecoveries = gamma * currI;

      currS = Math.max(0, currS - newInfections);
      currI = Math.max(0, currI + newInfections - newRecoveries);
      currR = Math.min(TOTAL_POP, currR + newRecoveries);

      if (currI > maxI) maxI = currI;

      hist.push({
        day: currDay,
        S: Math.round(currS),
        I: Math.round(currI),
        R: Math.round(currR),
      });

      setDay(currDay);
      setBudgetSpent(totalBudget);
      setHistory([...hist]);

      // Check overflow
      if (currI > ICU_LIMIT) {
        clearInterval(interval);
        setIsRunning(false);
        setGameOver(true);
        setOverwhelmed(true);
        return;
      }

      // Epidemic ends when I drops below 2 or day >= 80
      if ((currDay > 15 && currI < 2) || currDay >= 80) {
        clearInterval(interval);
        setIsRunning(false);
        setGameOver(true);
        if (maxI <= ICU_LIMIT) {
          setGameWon(true);
          if (onCompleteMission) onCompleteMission(60, 3);
        }
      }
    }, 120);

    timerRef.current = interval as unknown as number;
  };

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setDay(0);
    setHistory([{ day: 0, S: 995, I: 5, R: 0 }]);
    setBudgetSpent(0);
    setGameOver(false);
    setOverwhelmed(false);
    setGameWon(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentI = history[history.length - 1].I;
  const maxIReached = Math.max(...history.map((h) => h.I));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 border-b border-[#234E47] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAFBF6]">
            방역 사령관 게임: 병상 붕괴를 막아라! (Flatten the Curve)
          </h2>
          <p className="text-xs sm:text-sm text-[#7DBFB0] mt-1">
            바이러스가 번질 때 감염자가 폭발하면 병상이 부족해 의료체계가 붕괴합니다.{' '}
            <strong className="text-[#F2B84B]">거리두기와 마스크 정책으로 피크를 낮춰(Flatten)</strong> 중환자 병상 한계선(200명) 아래로 유행을 종식시키세요!
          </p>
        </div>
        {gameWon && (
          <span className="mt-2 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4ADE80]/20 border border-[#4ADE80] text-[#4ADE80] text-xs font-bold animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            병상 사수 성공! 완벽한 방역 사령관!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Real-time Chart Display */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#234E47] rounded-xl p-3 relative shadow-inner">
          <div className="flex items-center justify-between px-2 mb-2">
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-[#FF6B5C]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B5C]" /> 감염자 I(t)
              </span>
              <span className="flex items-center gap-1 text-[#4ADE80]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" /> 완치자 R(t)
              </span>
              <span className="flex items-center gap-1 text-[#7DBFB0]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7DBFB0]" /> 감수성 S(t)
              </span>
            </div>
            <div className="text-xs font-mono text-[#F2B84B]">
              현재 R₀: <strong>{currentR0}</strong>
            </div>
          </div>

          {/* SVG Graph Canvas */}
          <div className="w-full h-64 relative bg-[#0D211E] rounded-lg border border-[#234E47] overflow-hidden">
            <svg viewBox="0 0 600 250" className="w-full h-full select-none" preserveAspectRatio="none">
              {/* ICU Limit Line (Y = 250 - 200/1000 * 250 = 200) */}
              <line
                x1="0"
                y1={250 - (ICU_LIMIT / TOTAL_POP) * 250}
                x2="600"
                y2={250 - (ICU_LIMIT / TOTAL_POP) * 250}
                stroke="#FF6B5C"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <text
                x="10"
                y={250 - (ICU_LIMIT / TOTAL_POP) * 250 - 6}
                fill="#FF6B5C"
                fontSize="11"
                fontWeight="bold"
                fontFamily="JetBrains Mono"
              >
                🚨 중환자실 병상 한계선 (ICU Cap: 200명)
              </text>

              {/* S curve */}
              <polyline
                fill="none"
                stroke="#7DBFB0"
                strokeWidth="2"
                opacity="0.4"
                points={history
                  .map((h) => `${(h.day / 80) * 600},${250 - (h.S / TOTAL_POP) * 250}`)
                  .join(' ')}
              />

              {/* R curve */}
              <polyline
                fill="none"
                stroke="#4ADE80"
                strokeWidth="2"
                opacity="0.6"
                points={history
                  .map((h) => `${(h.day / 80) * 600},${250 - (h.R / TOTAL_POP) * 250}`)
                  .join(' ')}
              />

              {/* I curve (Infected, bold) */}
              <polyline
                fill="none"
                stroke="#FF6B5C"
                strokeWidth="3.5"
                points={history
                  .map((h) => `${(h.day / 80) * 600},${250 - (h.I / TOTAL_POP) * 250}`)
                  .join(' ')}
              />
            </svg>
          </div>

          {/* Real-time Dashboard Gauges */}
          <div className="grid grid-cols-4 gap-2 mt-3 text-center text-xs">
            <div className="bg-[#132E29] p-2 rounded-lg border border-[#234E47]">
              <div className="text-[#7DBFB0]">경과 일수</div>
              <div className="font-mono text-base font-bold text-[#EAFBF6]">{day}일</div>
            </div>
            <div className="bg-[#132E29] p-2 rounded-lg border border-[#234E47]">
              <div className="text-[#7DBFB0]">현재 감염자</div>
              <div className="font-mono text-base font-bold text-[#FF6B5C]">{currentI}명</div>
            </div>
            <div className="bg-[#132E29] p-2 rounded-lg border border-[#234E47]">
              <div className="text-[#7DBFB0]">최고 피크(Peak)</div>
              <div
                className={`font-mono text-base font-bold ${
                  maxIReached > ICU_LIMIT ? 'text-[#FF6B5C]' : 'text-[#4ADE80]'
                }`}
              >
                {maxIReached}명
              </div>
            </div>
            <div className="bg-[#132E29] p-2 rounded-lg border border-[#234E47]">
              <div className="text-[#7DBFB0]">방역 경제 비용</div>
              <div className="font-mono text-base font-bold text-[#F2B84B]">{budgetSpent} 억</div>
            </div>
          </div>
        </div>

        {/* Policy Commander Controls */}
        <div className="bg-[#132E29] border border-[#234E47] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-[#F2B84B] font-bold uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>방역 정책 수립 콘솔</span>
              <Shield className="w-3.5 h-3.5 text-[#3FA796]" />
            </div>

            {/* Policy 1: Social Distancing Level */}
            <div className="mb-4">
              <label className="text-xs text-[#EAFBF6] font-semibold flex justify-between mb-1.5">
                <span>1. 사회적 거리두기 단계</span>
                <span className="text-[#F2B84B] font-mono">
                  {distancingLevel === 0 ? '해제 (0단계)' : `${distancingLevel}단계`}
                </span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                {[0, 1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    disabled={isRunning}
                    onClick={() => setDistancingLevel(lvl)}
                    className={`py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                      distancingLevel === lvl
                        ? 'bg-[#F2B84B] text-[#0A1A18]'
                        : 'bg-[#0A1A18] text-[#7DBFB0] hover:bg-[#1A3D37]'
                    }`}
                  >
                    {lvl === 0 ? '0단계' : `${lvl}단계`}
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-[#7DBFB0] mt-1">
                단계가 높을수록 접촉률이 급감하나 매일 막대한 경제 비용 발생!
              </div>
            </div>

            {/* Policy 2: Mask Mandate */}
            <div className="mb-3">
              <label
                onClick={() => !isRunning && setMaskMandate(!maskMandate)}
                className="flex items-center justify-between p-2 rounded-lg bg-[#0A1A18] border border-[#234E47] cursor-pointer hover:border-[#3FA796] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">😷</span>
                  <span className="text-xs font-semibold text-[#EAFBF6]">마스크 의무화</span>
                </div>
                <input
                  type="checkbox"
                  checked={maskMandate}
                  onChange={() => {}}
                  className="rounded text-[#F2B84B] focus:ring-0"
                />
              </label>
            </div>

            {/* Policy 3: Fast Tracing */}
            <div className="mb-4">
              <label
                onClick={() => !isRunning && setContactTracing(!contactTracing)}
                className="flex items-center justify-between p-2 rounded-lg bg-[#0A1A18] border border-[#234E47] cursor-pointer hover:border-[#3FA796] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">🧪</span>
                  <span className="text-xs font-semibold text-[#EAFBF6]">신속 PCR & 밀접접촉자 추적</span>
                </div>
                <input
                  type="checkbox"
                  checked={contactTracing}
                  onChange={() => {}}
                  className="rounded text-[#F2B84B] focus:ring-0"
                />
              </label>
            </div>

            {/* Result Alerts */}
            {overwhelmed && (
              <div className="p-3 rounded-lg bg-[#FF6B5C]/20 border border-[#FF6B5C] text-xs text-[#FF6B5C] mb-3 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>병상 수용 한계 초과!</strong>
                  <div className="text-[11px] mt-0.5">
                    감염자가 200명을 넘어 중환자실이 마비되었습니다. 거리두기나 마스크 정책을 더 강화하세요!
                  </div>
                </div>
              </div>
            )}

            {gameWon && (
              <div className="p-3 rounded-lg bg-[#4ADE80]/20 border border-[#4ADE80] text-xs text-[#4ADE80] mb-3 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Flatten the Curve 성공!</strong>
                  <div className="text-[11px] mt-0.5">
                    병상 한계를 넘지 않고 총 {budgetSpent}억 원으로 유행을 성공적으로 종식시켰습니다! (+60 XP)
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={runSim}
                disabled={isRunning}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#F2B84B] hover:bg-[#d9a038] text-[#0A1A18] font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>방역 시뮬레이션 가동!</span>
              </button>

              <button
                onClick={resetGame}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#234E47] hover:bg-[#1A3D37] text-[#7DBFB0] text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>재도전하기</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
