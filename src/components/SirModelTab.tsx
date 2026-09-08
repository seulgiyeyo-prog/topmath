import React, { useState, useMemo, useEffect } from 'react';
import { MathView } from './MathView';
import { ShieldAlert, Star, Activity, Check } from 'lucide-react';

interface SirModelTabProps {
  onCompleteMission: (xp: number, stars: number) => void;
  isMissionCompleted: boolean;
}

export const SirModelTab: React.FC<SirModelTabProps> = ({
  onCompleteMission,
  isMissionCompleted,
}) => {
  const [beta, setBeta] = useState(0.6);
  const [gamma, setGamma] = useState(0.2);
  const [capacity, setCapacity] = useState(150);

  const Np = 1000;
  const steps = 80;

  // Simulate discrete SIR model
  const simulationData = useMemo(() => {
    let S = Np - 1;
    let I = 1;
    let R = 0;
    const history = [{ S, I, R }];

    for (let t = 0; t < steps; t++) {
      const newInfections = Math.min(S, (beta * S * I) / Np);
      const newRecoveries = Math.min(I, gamma * I);
      S -= newInfections;
      I += newInfections - newRecoveries;
      R += newRecoveries;
      history.push({ S, I, R });
    }
    return history;
  }, [beta, gamma]);

  const peakInfected = useMemo(() => {
    return Math.max(...simulationData.map((d) => d.I));
  }, [simulationData]);

  const r0 = beta / gamma;
  const isOverCapacity = peakInfected > capacity;

  // Check mission: keep within capacity with beta >= 0.3
  useEffect(() => {
    if (!isOverCapacity && beta >= 0.3 && !isMissionCompleted) {
      onCompleteMission(60, 3);
    }
  }, [isOverCapacity, beta, isMissionCompleted, onCompleteMission]);

  // Chart coordinates
  const W = 600;
  const H = 280;
  const pL = 40;
  const pB = 30;
  const pT = 12;
  const pW = W - pL - 18;
  const pH = H - pB - pT;
  const maxY = Math.max(Np * 0.6, peakInfected * 1.15, capacity * 1.15);

  const px = (t: number) => pL + (t / steps) * pW;
  const py = (v: number) => pT + pH - (v / maxY) * pH;

  const pathS = useMemo(() => {
    return simulationData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(d.S)}`).join(' ');
  }, [simulationData, maxY]);

  const pathI = useMemo(() => {
    return simulationData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(d.I)}`).join(' ');
  }, [simulationData, maxY]);

  const pathR = useMemo(() => {
    return simulationData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${px(i)} ${py(d.R)}`).join(' ');
  }, [simulationData, maxY]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">SIR 모델 — 곡선을 평탄하게! (Flatten the Curve)</h2>
        <p className="text-sm text-[#7DBFB0]">
          전파율(β)과 회복률(γ)을 조절하여 감염자 최고점이 병원 수용 한계를 넘지 않도록 의료 붕괴를 막으세요!
        </p>
      </div>

      {/* Mission Box */}
      <div className="bg-gradient-to-r from-[#FF6B5C]/10 to-[#4ADE80]/10 border border-[#FF6B5C]/30 rounded-xl p-3.5 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs sm:text-sm">
          <div className="font-mono text-[11px] text-[#FF6B5C] font-bold tracking-wider">
            MISSION 5: 의료 붕괴 차단!
          </div>
          <div className="text-[#EAFBF6] mt-0.5">
            <b>β ≥ 0.3 조건</b>에서 병상 초과 없이 감염자 정점을 수용 한계 내로 안전하게 유지하세요!
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[#F2B84B] text-xs">
            <span>보상: +60 XP</span>
            <div className="flex text-sm">
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Formula Box */}
      <div className="bg-black/30 border border-[#234E47] rounded-xl p-3">
        <div className="text-[10px] font-mono text-[#C084FC] tracking-wider uppercase mb-1">
          SIR 미분방정식 계
        </div>
        <MathView
          math="\frac{dS}{dt}=-\beta\frac{SI}{N}, \quad \frac{dI}{dt}=\beta\frac{SI}{N}-\gamma I, \quad \frac{dR}{dt}=\gamma I, \quad R_0=\frac{\beta}{\gamma}"
          display={true}
          className="text-[#EAFBF6]"
        />
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* SVG Simulation Chart */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#234E47] rounded-xl p-3 relative overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
            {/* Axis */}
            <line x1={pL} y1={pT} x2={pL} y2={pT + pH} stroke="#234E47" strokeWidth="1.5" />
            <line x1={pL} y1={pT + pH} x2={pL + pW} y2={pT + pH} stroke="#234E47" strokeWidth="1.5" />

            {/* Hospital capacity line */}
            <line
              x1={pL}
              y1={py(capacity)}
              x2={pL + pW}
              y2={py(capacity)}
              stroke="#FF6B5C"
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <text
              x={pL + pW - 120}
              y={py(capacity) - 6}
              fill="#FF6B5C"
              fontSize="11"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
            >
              병상 수용 한계 ({capacity}명)
            </text>

            {/* Curves */}
            <path d={pathS} fill="none" stroke="#3FA796" strokeWidth="2.5" />
            <path d={pathI} fill="none" stroke="#FF6B5C" strokeWidth="3" />
            <path d={pathR} fill="none" stroke="#F2B84B" strokeWidth="2.5" />

            {/* Legends */}
            <g transform={`translate(${pL}, ${H - 12})`}>
              <rect x="0" y="0" width="9" height="9" fill="#3FA796" />
              <text x="14" y="8" fill="#7DBFB0" fontSize="11">S (감염대상)</text>
              <rect x="110" y="0" width="9" height="9" fill="#FF6B5C" />
              <text x="124" y="8" fill="#FF6B5C" fontSize="11">I (현재 감염자)</text>
              <rect x="240" y="0" width="9" height="9" fill="#F2B84B" />
              <text x="254" y="8" fill="#F2B84B" fontSize="11">R (완치·면역)</text>
            </g>
          </svg>
        </div>

        {/* Sidebar Controls */}
        <div className="bg-[#1A3D37] border border-[#234E47] rounded-xl p-4 space-y-4">
          {/* Presets */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setBeta(0.6);
                setGamma(0.2);
              }}
              className="py-1.5 px-2 rounded-lg bg-[#132E29] hover:bg-[#234E47] text-[#FF6B5C] border border-[#FF6B5C]/30 text-xs font-semibold"
            >
              📈 조치 없음
            </button>
            <button
              onClick={() => {
                setBeta(0.2);
                setGamma(0.2);
              }}
              className="py-1.5 px-2 rounded-lg bg-[#132E29] hover:bg-[#234E47] text-[#4ADE80] border border-[#4ADE80]/30 text-xs font-semibold"
            >
              😷 거리두기/마스크
            </button>
          </div>

          {/* Slider: beta */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#7DBFB0]">
              <span>전파율 (β)</span>
              <span className="font-mono font-bold text-[#F2B84B]">{beta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.01"
              value={beta}
              onChange={(e) => setBeta(Number(e.target.value))}
              className="w-full accent-[#F2B84B]"
            />
          </div>

          {/* Slider: gamma */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#7DBFB0]">
              <span>회복률 (γ)</span>
              <span className="font-mono font-bold text-[#F2B84B]">{gamma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.01"
              value={gamma}
              onChange={(e) => setGamma(Number(e.target.value))}
              className="w-full accent-[#F2B84B]"
            />
          </div>

          {/* Slider: capacity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#7DBFB0]">
              <span>병상 한계</span>
              <span className="font-mono font-bold text-[#FF6B5C]">{capacity}명</span>
            </div>
            <input
              type="range"
              min="30"
              max="500"
              step="10"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full accent-[#FF6B5C]"
            />
          </div>

          {/* Metrics */}
          <div className="space-y-2 border-t border-[#234E47] pt-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">기초재생산수 (R₀ = β/γ)</span>
              <span
                className={`font-mono text-base font-bold ${
                  r0 > 1 ? 'text-[#FF6B5C]' : 'text-[#4ADE80]'
                }`}
              >
                {r0.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">최대 동시 감염자 (Peak)</span>
              <span className="font-mono text-base font-bold text-[#F2B84B]">
                {Math.round(peakInfected)}명
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">의료 시스템 상태</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  isOverCapacity ? 'bg-[#FF6B5C]/20 text-[#FF6B5C]' : 'bg-[#4ADE80]/20 text-[#4ADE80]'
                }`}
              >
                {isOverCapacity ? '🚨 의료 붕괴 위험' : '✅ 수용 범위 내 안전'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
