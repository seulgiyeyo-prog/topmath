import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MathView } from '../MathView';
import { HelpCircle, RefreshCw, Eye, Sparkles } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const HeronTab: React.FC = () => {
  const RIVER_Y = 210;
  const [A, setA] = useState<Point>({ x: 150, y: 90 });
  const [B, setB] = useState<Point>({ x: 450, y: 330 });
  const [P, setP] = useState<Point>({ x: 300, y: RIVER_Y });
  const [showReflect, setShowReflect] = useState<boolean>(false);
  const [dragging, setDragging] = useState<'A' | 'B' | 'P' | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  // River wavy path
  const getRiverPath = () => {
    let d = `M 30 ${RIVER_Y}`;
    for (let x = 30; x <= 570; x += 40) {
      d += ` Q ${x + 20} ${RIVER_Y + Math.sin(x / 40) * 6} ${x + 40} ${RIVER_Y}`;
    }
    return d;
  };

  // Mini chart curve for sum(x)
  const getChartCurve = () => {
    const pts: { x: number; s: number }[] = [];
    for (let x = 40; x <= 560; x += 8) {
      const s = dist(A, { x, y: RIVER_Y }) + dist(B, { x, y: RIVER_Y });
      pts.push({ x, s });
    }
    const smin = Math.min(...pts.map((p) => p.s));
    const smax = Math.max(...pts.map((p) => p.s));
    const chartH = 60;
    const chartY = 390;
    let d = '';
    pts.forEach((p, i) => {
      const yy = chartY - ((p.s - smin) / (smax - smin || 1)) * chartH;
      d += (i === 0 ? 'M' : 'L') + p.x + ' ' + yy + ' ';
    });
    return { d, chartY, smin, smax };
  };

  const ap = dist(A, P);
  const pb = dist(P, B);
  const sumDist = ap + pb;
  const Bp: Point = { x: B.x, y: 2 * RIVER_Y - B.y };
  const minPossible = dist(A, Bp);

  const snapToOptimal = () => {
    const t = (RIVER_Y - A.y) / (Bp.y - A.y);
    const optX = A.x + (Bp.x - A.x) * t;
    setP({ x: Math.max(30, Math.min(570, optX)), y: RIVER_Y });
    setShowReflect(true);
  };

  const getPointerPos = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 420;
    return { x, y };
  };

  const handlePointerDown = (id: 'A' | 'B' | 'P', e: React.PointerEvent) => {
    e.stopPropagation();
    setDragging(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const pos = getPointerPos(e);
    if (dragging === 'A') {
      setA({
        x: Math.max(30, Math.min(570, pos.x)),
        y: Math.max(20, Math.min(RIVER_Y - 20, pos.y)),
      });
    } else if (dragging === 'B') {
      setB({
        x: Math.max(30, Math.min(570, pos.x)),
        y: Math.max(RIVER_Y + 20, Math.min(400, pos.y)),
      });
    } else if (dragging === 'P') {
      setP({
        x: Math.max(30, Math.min(570, pos.x)),
        y: RIVER_Y,
      });
    }
  };

  const handlePointerUp = () => setDragging(null);

  const { d: curveD, chartY, smin, smax } = getChartCurve();
  const currentChartMarkerY =
    chartY - ((sumDist - smin) / (smax - smin || 1)) * 60;

  const isNearOptimal = Math.abs(sumDist - minPossible) < 1.0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 border-b border-[#2C567F] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAF3FC]">
            헤론의 최단 거리 문제 (Heron's Shortest Path)
          </h2>
          <p className="text-xs sm:text-sm text-[#9FC0DC] mt-1">
            마을 A에서 출발하여 강변(가운데 물길)의 어느 지점 P에서 물을 뜬 후 마을 B로 이동합니다.{' '}
            <strong className="text-[#E7A93D]">점 A, B, P를 직접 마우스나 손가락으로 드래그</strong>하며 최단 경로를 탐색해 보세요.
          </p>
        </div>
        {isNearOptimal && (
          <span className="mt-2 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6FCF97]/20 border border-[#6FCF97] text-[#6FCF97] text-xs font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            최단 경로 도달!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-2 bg-[#0E2A45] border border-[#2C567F] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg
            ref={svgRef}
            viewBox="0 0 600 420"
            className="w-full h-auto select-none touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Background River */}
            <path
              d={getRiverPath()}
              fill="none"
              stroke="#3E7FB0"
              strokeWidth={28}
              opacity={0.35}
            />
            <path
              d={getRiverPath()}
              fill="none"
              stroke="#7FC4EE"
              strokeWidth={2}
              strokeDasharray="3 6"
            />
            <text
              x={40}
              y={RIVER_Y - 14}
              fill="#7FC4EE"
              fontSize={12}
              fontFamily="Noto Sans KR"
              fontWeight={600}
              opacity={0.8}
            >
              🌊 강변 라인 (강변의 어떤 지점 P에서 물을 떠야 할까?)
            </text>

            {/* Bottom Distance vs Position Graph */}
            <g opacity={0.85}>
              <text
                x={40}
                y={chartY - 68}
                fill="#9FC0DC"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
              >
                📊 P의 위치(x)에 따른 총 거리 AP + PB 곡선 (아래로 볼록한 최솟값 지점)
              </text>
              <path d={curveD} fill="none" stroke="#E7A93D" strokeWidth={2} />
              {/* Current P on chart */}
              <circle
                cx={P.x}
                cy={currentChartMarkerY}
                r={4.5}
                fill="#E8654F"
                stroke="#EAF3FC"
                strokeWidth={1.5}
              />
              <line
                x1={P.x}
                y1={chartY - 65}
                x2={P.x}
                y2={chartY}
                stroke="#E8654F"
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.6}
              />
            </g>

            {/* Reflection Lines if enabled */}
            {showReflect && (
              <>
                {/* Straight line from A to B' */}
                <line
                  x1={A.x}
                  y1={A.y}
                  x2={Bp.x}
                  y2={Bp.y}
                  stroke="#E7A93D"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                {/* Perpendicular reflection line between B and B' */}
                <line
                  x1={B.x}
                  y1={B.y}
                  x2={Bp.x}
                  y2={Bp.y}
                  stroke="#6FCF97"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />
                {/* Node B' */}
                <circle
                  cx={Bp.x}
                  cy={Bp.y}
                  r={8}
                  fill="#E7A93D"
                  stroke="#0E2A45"
                  strokeWidth={2}
                />
                <text
                  x={Bp.x + 12}
                  y={Bp.y + 4}
                  fill="#E7A93D"
                  fontSize={14}
                  fontWeight={700}
                  fontFamily="JetBrains Mono, monospace"
                >
                  B' (강변 대칭점)
                </text>
              </>
            )}

            {/* Lines from A to P and P to B */}
            <line
              x1={A.x}
              y1={A.y}
              x2={P.x}
              y2={P.y}
              stroke="#EAF3FC"
              strokeWidth={2.5}
            />
            <line
              x1={P.x}
              y1={P.y}
              x2={B.x}
              y2={B.y}
              stroke="#EAF3FC"
              strokeWidth={2.5}
            />

            {/* Draggable Node A */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('A', e)}
            >
              <circle
                cx={A.x}
                cy={A.y}
                r={10}
                fill="#E7A93D"
                stroke="#0E2A45"
                strokeWidth={2}
              />
              <text
                x={A.x - 7}
                y={A.y - 15}
                fill="#EAF3FC"
                fontSize={15}
                fontWeight={700}
                fontFamily="Noto Sans KR"
              >
                A
              </text>
            </g>

            {/* Draggable Node B */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('B', e)}
            >
              <circle
                cx={B.x}
                cy={B.y}
                r={10}
                fill="#E7A93D"
                stroke="#0E2A45"
                strokeWidth={2}
              />
              <text
                x={B.x - 7}
                y={B.y + 26}
                fill="#EAF3FC"
                fontSize={15}
                fontWeight={700}
                fontFamily="Noto Sans KR"
              >
                B
              </text>
            </g>

            {/* Draggable Node P (on River) */}
            <g
              className="cursor-ew-resize active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('P', e)}
            >
              <circle
                cx={P.x}
                cy={P.y}
                r={12}
                fill="#E8654F"
                stroke="#EAF3FC"
                strokeWidth={2.5}
              />
              <text
                x={P.x - 5}
                y={P.y + 24}
                fill="#E8654F"
                fontSize={14}
                fontWeight={700}
                fontFamily="Noto Sans KR"
              >
                P (물 뜨는 곳)
              </text>
            </g>
          </svg>
        </div>

        {/* Control & Measurement Panel */}
        <div className="bg-[#153A5C] border border-[#2C567F] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-[#E7A93D] font-bold uppercase tracking-wider mb-2">
              실시간 거리 측정계
            </div>

            <div className="space-y-2 border-b border-[#2C567F] pb-3 mb-4 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">AP 거리 (마을A → P)</span>
                <b className="font-mono text-base text-[#EAF3FC]">{ap.toFixed(1)}</b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">PB 거리 (P → 마을B)</span>
                <b className="font-mono text-base text-[#EAF3FC]">{pb.toFixed(1)}</b>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-dashed border-[#2C567F]">
                <span className="text-[#EAF3FC] font-semibold">총 거리 (AP + PB)</span>
                <b
                  className={`font-mono text-lg ${
                    isNearOptimal ? 'text-[#6FCF97]' : 'text-[#E8654F]'
                  }`}
                >
                  {sumDist.toFixed(1)}
                </b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#6FCF97] font-semibold">이론상 최소값</span>
                <b className="font-mono text-lg text-[#6FCF97]">
                  {minPossible.toFixed(1)}
                </b>
              </div>
            </div>

            {/* Interactive Actions */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => setShowReflect(!showReflect)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#E7A93D] text-[#E7A93D] hover:bg-[#E7A93D] hover:text-[#0E2A45] font-semibold text-xs transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showReflect ? "대칭점 B' 숨기기" : "B의 대칭점 B' 보기 (작도)"}</span>
              </button>

              <button
                onClick={snapToOptimal}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#9FC0DC] text-[#9FC0DC] hover:bg-[#9FC0DC] hover:text-[#0E2A45] font-semibold text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>P를 최적의 위치로 자동 이동</span>
              </button>
            </div>

            {/* Middle School Inquiry Question & Hint */}
            <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#E7A93D] font-bold font-mono mb-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>영재 탐구 질문: 왜 대칭점이 최단 거리일까?</span>
              </div>
              <p className="text-[#9FC0DC] leading-relaxed mb-2">
                "왜 A와 대칭점 B'을 직선으로 이은 경로가 강변과 만나는 점이 최단 거리가 될까요?
                <strong className="text-[#EAF3FC]"> '삼각부등식'</strong>을 이용해 증명해 보세요."
              </p>
              <details className="cursor-pointer group">
                <summary className="text-[#E7A93D] font-semibold hover:underline select-none">
                  💡 수학적 증명 힌트 보기
                </summary>
                <div className="mt-2 p-2.5 rounded bg-[#1B4468] border-l-2 border-[#6FCF97] text-[#EAF3FC] space-y-1.5 leading-relaxed">
                  <div>
                    1. 점 B를 강변에 대해 대칭시킨 점을 <MathView math="B'" inline />이라 하면,
                    강변의 어떤 점 P에 대해서도 대칭성에 의해 <MathView math="PB = PB'" inline />입니다.
                  </div>
                  <div>
                    2. 따라서 구하려는 총 거리 <MathView math="AP + PB = AP + PB'" inline />가 됩니다.
                  </div>
                  <div>
                    3. 점 P가 A와 B'을 잇는 직선 위에 있지 않으면, 세 점 A, P, B'은 삼각형을 이룹니다.
                    삼각형의 두 변의 합은 나머지 한 변보다 항상 깁니다(삼각부등식):
                    <div className="my-1 font-mono text-center text-[#E7A93D]">
                      <MathView math="AP + PB' \ge AB'" />
                    </div>
                  </div>
                  <div>
                    4. 등호는 오직 세 점 A, P, B'이 한 직선 위에 있을 때만 성립하므로,
                    선분 AB'이 강변과 만나는 점이 유일한 최솟값을 만듭니다!
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
