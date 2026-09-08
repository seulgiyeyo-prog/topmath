import React, { useState, useMemo, useEffect } from 'react';
import { MathView } from './MathView';
import { Microscope, Star, Check } from 'lucide-react';

interface CalculusTabProps {
  onCompleteMission: (xp: number, stars: number) => void;
  isMissionCompleted: boolean;
}

export const CalculusTab: React.FC<CalculusTabProps> = ({
  onCompleteMission,
  isMissionCompleted,
}) => {
  const [t0, setT0] = useState(10);
  const [h, setH] = useState(8.0);

  const effectiveH = useMemo(() => {
    if (t0 + h > 39.5) return Math.max(0.2, 39.5 - t0);
    return h;
  }, [t0, h]);

  const f = (t: number) => 120 * t * Math.exp(-0.12 * t);

  const { avg, inst, diff } = useMemo(() => {
    const A = { x: t0, y: f(t0) };
    const B = { x: t0 + effectiveH, y: f(t0 + effectiveH) };
    const avgRate = (B.y - A.y) / effectiveH;

    const eps = 0.001;
    const instRate = (f(t0 + eps) - f(t0 - eps)) / (2 * eps);
    const d = Math.abs(avgRate - instRate);

    return {
      avg: avgRate,
      inst: instRate,
      diff: d,
    };
  }, [t0, effectiveH]);

  // Check mission
  useEffect(() => {
    if (diff <= 1.0 && !isMissionCompleted) {
      onCompleteMission(40, 3);
    }
  }, [diff, isMissionCompleted, onCompleteMission]);

  // SVG dimensions
  const W = 600;
  const H = 280;
  const pL = 40;
  const pB = 30;
  const pT = 12;
  const pW = W - pL - 16;
  const pH = H - pB - pT;
  const dom = 40;
  const maxY = 420;

  const px = (t: number) => pL + (t / dom) * pW;
  const py = (v: number) => pT + pH - (v / maxY) * pH;

  const curvePath = useMemo(() => {
    let d = '';
    for (let t = 0; t <= dom; t += 0.5) {
      d += `${t === 0 ? 'M' : 'L'} ${px(t)} ${py(f(t))} `;
    }
    return d;
  }, []);

  // Secant line
  const secantLine = useMemo(() => {
    const Ax = t0;
    const Ay = f(t0);
    const x1 = Math.max(0, Ax - 6);
    const y1 = Ay + avg * (x1 - Ax);
    const x2 = Math.min(dom, Ax + effectiveH + 5);
    const y2 = Ay + avg * (x2 - Ax);
    return { x1: px(x1), y1: py(y1), x2: px(x2), y2: py(y2) };
  }, [t0, effectiveH, avg]);

  // Tangent line
  const tangentLine = useMemo(() => {
    const Ax = t0;
    const Ay = f(t0);
    const x1 = Math.max(0, Ax - 7);
    const y1 = Ay + inst * (x1 - Ax);
    const x2 = Math.min(dom, Ax + 7);
    const y2 = Ay + inst * (x2 - Ax);
    return { x1: px(x1), y1: py(y1), x2: px(x2), y2: py(y2) };
  }, [t0, inst]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">미분이란? — 변화의 순간을 포착하기</h2>
        <p className="text-sm text-[#7DBFB0]">
          간격(h) 슬라이더를 0에 가깝게 줄여가며 두 점을 잇는 할선이 한 점에서의 접선에 완벽히 일치하는 순간을 목격하세요!
        </p>
      </div>

      {/* Mission Box */}
      <div className="bg-gradient-to-r from-[#3FA796]/10 to-[#C084FC]/10 border border-[#3FA796]/30 rounded-xl p-3.5 flex items-start gap-3">
        <Microscope className="w-5 h-5 text-[#3FA796] flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs sm:text-sm">
          <div className="font-mono text-[11px] text-[#3FA796] font-bold tracking-wider">
            MISSION 4: 0에 가까이! (극한의 체험)
          </div>
          <div className="text-[#EAFBF6] mt-0.5">
            h 슬라이더를 <b>최솟값(0.2)</b>까지 줄여서 할선과 접선의 기울기 차이를 <b>1 이하</b>로 만드세요!
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[#F2B84B] text-xs">
            <span>보상: +40 XP</span>
            <div className="flex text-sm">
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
            </div>
            {isMissionCompleted && (
              <span className="ml-2 px-1.5 py-0.2 rounded bg-[#4ADE80]/20 text-[#4ADE80] text-[10px] font-bold">
                달성 완료!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Formula Box */}
      <div className="bg-black/30 border border-[#234E47] rounded-xl p-3">
        <div className="text-[10px] font-mono text-[#C084FC] tracking-wider uppercase mb-1">
          미분계수의 정의 (순간 변화율)
        </div>
        <MathView math="f'(t_0) = \lim_{h \to 0} \frac{f(t_0+h) - f(t_0)}{h}" display={true} className="text-[#EAFBF6]" />
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* SVG Curve Canvas */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#234E47] rounded-xl p-3 relative overflow-hidden">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none">
            {/* Axis */}
            <line x1={pL} y1={pT} x2={pL} y2={pT + pH} stroke="#234E47" strokeWidth="1.5" />
            <line x1={pL} y1={pT + pH} x2={pL + pW} y2={pT + pH} stroke="#234E47" strokeWidth="1.5" />

            {/* Function Curve */}
            <path d={curvePath} fill="none" stroke="#7DBFB0" strokeWidth="2.5" />

            {/* Secant line (gold) */}
            <line
              x1={secantLine.x1}
              y1={secantLine.y1}
              x2={secantLine.x2}
              y2={secantLine.y2}
              stroke="#F2B84B"
              strokeWidth="2.5"
            />

            {/* Tangent line (teal dashed) */}
            <line
              x1={tangentLine.x1}
              y1={tangentLine.y1}
              x2={tangentLine.x2}
              y2={tangentLine.y2}
              stroke="#3FA796"
              strokeWidth="2"
              strokeDasharray="5 4"
            />

            {/* Points A and B */}
            <circle cx={px(t0)} cy={py(f(t0))} r="6" fill="#FF6B5C" stroke="#0A1A18" strokeWidth="1.5" />
            <text x={px(t0) - 10} y={py(f(t0)) - 10} fill="#FF6B5C" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono">
              A
            </text>

            <circle cx={px(t0 + effectiveH)} cy={py(f(t0 + effectiveH))} r="6" fill="#F2B84B" stroke="#0A1A18" strokeWidth="1.5" />
            <text x={px(t0 + effectiveH) + 6} y={py(f(t0 + effectiveH)) - 8} fill="#F2B84B" fontSize="12" fontWeight="bold" fontFamily="JetBrains Mono">
              B
            </text>

            {/* Legends */}
            <g transform={`translate(${pL}, ${H - 12})`}>
              <rect x="0" y="0" width="8" height="8" fill="#7DBFB0" />
              <text x="12" y="8" fill="#7DBFB0" fontSize="10">그래프 I(t)</text>
              <rect x="90" y="0" width="8" height="8" fill="#F2B84B" />
              <text x="102" y="8" fill="#F2B84B" fontSize="10">할선(평균변화율)</text>
              <rect x="220" y="0" width="8" height="8" fill="#3FA796" />
              <text x="232" y="8" fill="#3FA796" fontSize="10">접선(순간변화율)</text>
            </g>
          </svg>
        </div>

        {/* Sidebar Controls */}
        <div className="bg-[#1A3D37] border border-[#234E47] rounded-xl p-4 space-y-4">
          {/* Slider: t0 */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#7DBFB0]">
              <span>기준 시각 (t₀)</span>
              <span className="font-mono font-bold text-[#F2B84B]">{t0}</span>
            </div>
            <input
              type="range"
              min="2"
              max="35"
              step="1"
              value={t0}
              onChange={(e) => setT0(Number(e.target.value))}
              className="w-full accent-[#F2B84B]"
            />
          </div>

          {/* Slider: h */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#7DBFB0]">
              <span>간격 (h)</span>
              <span className="font-mono font-bold text-[#F2B84B]">{effectiveH.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="10"
              step="0.2"
              value={h}
              onChange={(e) => setH(Number(e.target.value))}
              className="w-full accent-[#F2B84B]"
            />
          </div>

          {/* Metrics */}
          <div className="space-y-2 border-t border-[#234E47] pt-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">평균 변화율 (할선 기울기)</span>
              <span className="font-mono text-sm font-bold text-[#FF6B5C]">{avg.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">순간 변화율 (접선 기울기)</span>
              <span className="font-mono text-sm font-bold text-[#3FA796]">{inst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">기울기 차이 (|할선 - 접선|)</span>
              <span className="font-mono text-base font-bold text-[#F2B84B]">{diff.toFixed(2)}</span>
            </div>
          </div>

          {diff <= 1.0 ? (
            <div className="p-2.5 rounded-lg bg-[#4ADE80]/20 border border-[#4ADE80]/40 text-xs text-[#4ADE80] font-bold text-center">
              🎉 할선이 접선에 거의 완전히 겹쳐졌습니다!
            </div>
          ) : (
            <div className="text-[11px] text-[#7DBFB0] text-center">
              h를 0.2까지 줄여 차이를 1.0 이하로 만들어 보세요!
            </div>
          )}

          {/* SIR Connection Card */}
          <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#234E47] text-xs space-y-2">
            <div className="text-[#C084FC] font-bold">감염병 모델과의 연결고리</div>
            <div className="text-[11px] text-[#D1F2EB] leading-relaxed">
              감염자 수 <MathView math="I(t)" />의 순간 변화율인 <MathView math="\frac{dI}{dt} = 0" />이 되는 바로 그 순간이
              <b> 감염병 환자가 가장 많은 최고 정점(Peak)</b>입니다!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
