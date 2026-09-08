import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Wind, Droplet } from 'lucide-react';
import { MathView } from '../MathView';

interface Point {
  x: number;
  y: number;
}

export const BubbleTab: React.FC = () => {
  const [mode, setMode] = useState<'tri' | 'square'>('tri');
  const [progress, setProgress] = useState<number>(0); // 0 = direct, 1 = bubble
  const [hMode, setHMode] = useState<boolean>(false); // in square: false = X, true = H
  const [isDipping, setIsDipping] = useState(false);

  const triPts: Point[] = [
    { x: 300, y: 90 },
    { x: 130, y: 340 },
    { x: 470, y: 340 },
  ];

  const sqPts: Point[] = [
    { x: 170, y: 90 }, // TL
    { x: 430, y: 90 }, // TR
    { x: 430, y: 350 }, // BR
    { x: 170, y: 350 }, // BL
  ];

  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  // Compute Fermat/Steiner point for triangle
  const fermatOf = (A: Point, B: Point, C: Point): Point => {
    const rotate = (pt: Point, center: Point, deg: number) => {
      const rad = (deg * Math.PI) / 180;
      const dx = pt.x - center.x;
      const dy = pt.y - center.y;
      return {
        x: center.x + dx * Math.cos(rad) - dy * Math.sin(rad),
        y: center.y + dx * Math.sin(rad) + dy * Math.cos(rad),
      };
    };
    const apexOutward = (p1: Point, p2: Point, p3: Point) => {
      const c1 = rotate(p2, p1, 60);
      const c2 = rotate(p2, p1, -60);
      return dist(c1, p3) > dist(c2, p3) ? c1 : c2;
    };
    const lineIntersect = (p1: Point, p2: Point, p3: Point, p4: Point) => {
      const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
      if (Math.abs(d) < 1e-6) return { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
      const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
      return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
    };

    const apexAB = apexOutward(A, B, C);
    const apexBC = apexOutward(B, C, A);
    return lineIntersect(C, apexAB, A, apexBC);
  };

  // Square Steiner points (2 points on vertical line)
  const squareSteinerPoints = (pts: Point[]): [Point, Point] => {
    const cx = (pts[0].x + pts[1].x + pts[2].x + pts[3].x) / 4;
    const topY = (pts[0].y + pts[1].y) / 2;
    const botY = (pts[2].y + pts[3].y) / 2;
    const H = botY - topY;
    const offset = H * (0.5 - 1 / (2 * Math.sqrt(3)));
    const S_top = { x: cx, y: topY + offset };
    const S_bot = { x: cx, y: botY - offset };
    return [S_top, S_bot];
  };

  const handleDip = () => {
    setIsDipping(true);
    if (mode === 'tri') {
      let step = 0;
      const totalSteps = 25;
      const interval = setInterval(() => {
        step++;
        setProgress(step / totalSteps);
        if (step >= totalSteps) {
          clearInterval(interval);
          setIsDipping(false);
        }
      }, 25);
    } else {
      setHMode(true);
      setTimeout(() => setIsDipping(false), 300);
    }
  };

  // Calculations for display
  const [A, B, C] = triPts;
  const F = fermatOf(A, B, C);
  const triDirectLen = dist(A, B) + dist(B, C) + dist(C, A);
  const triBubbleLen = dist(A, F) + dist(B, F) + dist(C, F);
  const triSaveRatio = Math.round((1 - triBubbleLen / triDirectLen) * 100);

  const [S1, S2] = squareSteinerPoints(sqPts);
  const sqXLen = dist(sqPts[0], sqPts[2]) + dist(sqPts[1], sqPts[3]);
  const sqHLen =
    dist(sqPts[0], S1) +
    dist(sqPts[1], S1) +
    dist(S1, S2) +
    dist(S2, sqPts[2]) +
    dist(S2, sqPts[3]);
  const sqSaveRatio = Math.round((1 - sqHLen / sqXLen) * 100);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 border-b border-[#2C567F] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAF3FC]">
            비눗방울 실험실 — 자연이 찾는 최적화 (Soap Film & Steiner Tree)
          </h2>
          <p className="text-xs sm:text-sm text-[#9FC0DC] mt-1">
            비눗방울 막은 표면장력에 의해 <strong className="text-[#6FCF97]">표면적(에너지)을 최소화</strong>하는 성질이 있습니다.
            세 갈래 막이 만날 때 항상 <strong>정확히 120도</strong>를 이루는 자연의 놀라운 최단 연결 법칙을 확인해 보세요.
          </p>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => {
            setMode('tri');
            setProgress(0);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono transition-colors cursor-pointer border ${
            mode === 'tri'
              ? 'bg-[#6FCF97] text-[#0E2A45] border-[#6FCF97] font-bold shadow-sm'
              : 'border-[#2C567F] text-[#9FC0DC] hover:text-[#EAF3FC]'
          }`}
        >
          삼각형 마을 (3개 정점)
        </button>
        <button
          onClick={() => {
            setMode('square');
            setHMode(false);
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold font-mono transition-colors cursor-pointer border ${
            mode === 'square'
              ? 'bg-[#6FCF97] text-[#0E2A45] border-[#6FCF97] font-bold shadow-sm'
              : 'border-[#2C567F] text-[#9FC0DC] hover:text-[#EAF3FC]'
          }`}
        >
          사각형 마을 (4개 정점)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Canvas */}
        <div className="lg:col-span-2 bg-[#0E2A45] border border-[#2C567F] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg viewBox="0 0 600 420" className="w-full h-auto select-none">
            {/* Liquid Shimmer Effect when dipped */}
            <rect
              width="600"
              height="420"
              fill="#7FC4EE"
              fillOpacity={mode === 'tri' ? progress * 0.05 : hMode ? 0.05 : 0}
            />

            {mode === 'tri' ? (
              <>
                {/* Direct Triangle perimeter edges (fading out) */}
                <g opacity={1 - progress}>
                  <line
                    x1={A.x}
                    y1={A.y}
                    x2={B.x}
                    y2={B.y}
                    stroke="#E8654F"
                    strokeWidth={2.5}
                  />
                  <line
                    x1={B.x}
                    y1={B.y}
                    x2={C.x}
                    y2={C.y}
                    stroke="#E8654F"
                    strokeWidth={2.5}
                  />
                  <line
                    x1={C.x}
                    y1={C.y}
                    x2={A.x}
                    y2={A.y}
                    stroke="#E8654F"
                    strokeWidth={2.5}
                  />
                </g>

                {/* Bubble Minimal Steiner Tree (fading in) */}
                <g opacity={progress}>
                  <line
                    x1={A.x}
                    y1={A.y}
                    x2={F.x}
                    y2={F.y}
                    stroke="#6FCF97"
                    strokeWidth={3}
                  />
                  <line
                    x1={B.x}
                    y1={B.y}
                    x2={F.x}
                    y2={F.y}
                    stroke="#6FCF97"
                    strokeWidth={3}
                  />
                  <line
                    x1={C.x}
                    y1={C.y}
                    x2={F.x}
                    y2={F.y}
                    stroke="#6FCF97"
                    strokeWidth={3}
                  />
                  <circle cx={F.x} cy={F.y} r={7} fill="#6FCF97" stroke="#0E2A45" strokeWidth={2} />
                  <text
                    x={F.x + 10}
                    y={F.y - 10}
                    fill="#6FCF97"
                    fontSize={13}
                    fontWeight={700}
                    fontFamily="JetBrains Mono"
                  >
                    120° 삼중 분기점 (페르마점)
                  </text>
                </g>

                {/* Nodes A, B, C */}
                {triPts.map((v, i) => (
                  <g key={i}>
                    <circle cx={v.x} cy={v.y} r={10} fill="#E7A93D" stroke="#0E2A45" strokeWidth={2} />
                    <text
                      x={v.x + (i === 0 ? -6 : i === 1 ? -24 : 14)}
                      y={v.y + (i === 0 ? -16 : 22)}
                      fill="#EAF3FC"
                      fontSize={15}
                      fontWeight={700}
                    >
                      {['A', 'B', 'C'][i]}
                    </text>
                  </g>
                ))}
              </>
            ) : (
              <>
                {/* 4 Points Square */}
                {!hMode ? (
                  /* X mode (Diagonals) */
                  <g>
                    <line
                      x1={sqPts[0].x}
                      y1={sqPts[0].y}
                      x2={sqPts[2].x}
                      y2={sqPts[2].y}
                      stroke="#E8654F"
                      strokeWidth={3}
                    />
                    <line
                      x1={sqPts[1].x}
                      y1={sqPts[1].y}
                      x2={sqPts[3].x}
                      y2={sqPts[3].y}
                      stroke="#E8654F"
                      strokeWidth={3}
                    />
                    <circle
                      cx={(sqPts[0].x + sqPts[2].x) / 2}
                      cy={(sqPts[0].y + sqPts[2].y) / 2}
                      r={6}
                      fill="#E8654F"
                    />
                    <text
                      x={(sqPts[0].x + sqPts[2].x) / 2 + 10}
                      y={(sqPts[0].y + sqPts[2].y) / 2 - 10}
                      fill="#E8654F"
                      fontSize={12}
                      fontFamily="JetBrains Mono"
                    >
                      직접 대각선 연결 (X자 형태, 90° 교차)
                    </text>
                  </g>
                ) : (
                  /* H mode (Steiner Tree with 2 points meeting at 120°) */
                  <g>
                    <line
                      x1={sqPts[0].x}
                      y1={sqPts[0].y}
                      x2={S1.x}
                      y2={S1.y}
                      stroke="#6FCF97"
                      strokeWidth={3}
                    />
                    <line
                      x1={sqPts[1].x}
                      y1={sqPts[1].y}
                      x2={S1.x}
                      y2={S1.y}
                      stroke="#6FCF97"
                      strokeWidth={3}
                    />
                    {/* Central bridge */}
                    <line
                      x1={S1.x}
                      y1={S1.y}
                      x2={S2.x}
                      y2={S2.y}
                      stroke="#6FCF97"
                      strokeWidth={3.5}
                    />
                    <line
                      x1={S2.x}
                      y1={S2.y}
                      x2={sqPts[2].x}
                      y2={sqPts[2].y}
                      stroke="#6FCF97"
                      strokeWidth={3}
                    />
                    <line
                      x1={S2.x}
                      y1={S2.y}
                      x2={sqPts[3].x}
                      y2={sqPts[3].y}
                      stroke="#6FCF97"
                      strokeWidth={3}
                    />
                    <circle cx={S1.x} cy={S1.y} r={6} fill="#6FCF97" />
                    <circle cx={S2.x} cy={S2.y} r={6} fill="#6FCF97" />
                    <text
                      x={S1.x + 14}
                      y={S1.y + 4}
                      fill="#6FCF97"
                      fontSize={12}
                      fontWeight={700}
                      fontFamily="JetBrains Mono"
                    >
                      상단 120° 분기점 S₁
                    </text>
                    <text
                      x={S2.x + 14}
                      y={S2.y + 4}
                      fill="#6FCF97"
                      fontSize={12}
                      fontWeight={700}
                      fontFamily="JetBrains Mono"
                    >
                      하단 120° 분기점 S₂
                    </text>
                  </g>
                )}

                {/* Nodes A, B, C, D */}
                {sqPts.map((v, i) => {
                  const dx = [-24, 12, 12, -24][i];
                  const dy = [-14, -14, 24, 24][i];
                  return (
                    <g key={i}>
                      <circle cx={v.x} cy={v.y} r={10} fill="#E7A93D" stroke="#0E2A45" strokeWidth={2} />
                      <text x={v.x + dx} y={v.y + dy} fill="#EAF3FC" fontSize={15} fontWeight={700}>
                        {['A', 'B', 'C', 'D'][i]}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
          </svg>
        </div>

        {/* Sidebar Measurements & Thinking Questions */}
        <div className="bg-[#153A5C] border border-[#2C567F] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-[#E7A93D] font-bold uppercase tracking-wider mb-2">
              최적화 효율 비교
            </div>

            <div className="space-y-2 border-b border-[#2C567F] pb-3 mb-4 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">
                  {mode === 'tri' ? '삼각형 둘레 직접 연결' : '직접 대각선(X자) 길이'}
                </span>
                <b className="font-mono text-base text-[#E8654F]">
                  {mode === 'tri' ? triDirectLen.toFixed(1) : `${sqXLen.toFixed(1)} (X자)`}
                </b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#6FCF97]">비눗방울(최적 슈타이너) 길이</span>
                <b className="font-mono text-base text-[#6FCF97]">
                  {mode === 'tri' ? triBubbleLen.toFixed(1) : `${sqHLen.toFixed(1)} (H자)`}
                </b>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-dashed border-[#2C567F]">
                <span className="text-[#EAF3FC] font-semibold">도로 절약 비율</span>
                <b className="font-mono text-xl text-[#E7A93D]">
                  {mode === 'tri' ? `${triSaveRatio}% 절약` : `${sqSaveRatio}% 절약`}
                </b>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={handleDip}
                disabled={isDipping}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#6FCF97] hover:bg-[#5bb883] text-[#0E2A45] font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Droplet className="w-4 h-4" />
                <span>
                  {mode === 'tri'
                    ? '비눗물에 담갔다 들어올리기 (120° 표면장력)'
                    : '비눗물에 담그기 (H자 슈타이너 변환)'}
                </span>
              </button>

              {mode === 'square' && (
                <button
                  onClick={() => setHMode(!hMode)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#E7A93D] text-[#E7A93D] hover:bg-[#E7A93D] hover:text-[#0E2A45] font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span>입으로 살짝 바람 불기 ({hMode ? 'H자 → X자' : 'X자 → H자'})</span>
                </button>
              )}
            </div>

            {/* Reflection Q&A */}
            <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3 text-xs space-y-2">
              <div className="text-[#E7A93D] font-bold font-mono">
                생각해보기 (자연의 최적화 알고리즘)
              </div>
              <div className="text-[#9FC0DC] leading-relaxed">
                {mode === 'tri' ? (
                  <>
                    <p className="font-medium text-[#EAF3FC] mb-1">
                      Q1. 자연(비눗방울)이 복잡한 삼각함수나 미분 계산 없이도 순식간에 최적해를 찾는 원리는 무엇일까요?
                    </p>
                    <p className="text-[11px] text-[#9FC0DC]">
                      💡 <strong>표면장력 원리:</strong> 액체 분자들은 서로 끌어당겨 표면적을 가장 작게 만들려는 에너지를 가집니다.
                      길이가 가장 짧은 선이 곧 표면 에너지가 가장 낮은 안정된 상태이기 때문에 저절로 120° 교차점이 만들어집니다.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-[#EAF3FC] mb-1">
                      Q2. 왜 사각형에서 단순 대각선(X자)보다 H자 모양(분기점 2개)이 더 짧을까요?
                    </p>
                    <p className="text-[11px] text-[#9FC0DC]">
                      💡 가운데 연결 다리(길이 <MathView math="H(1 - \frac{1}{\sqrt{3}})" inline />)를 공유하면서 양쪽의 4개 도로가 모두 120도 분기를 이루어 대각선보다 약 9% 더 짧아집니다!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
