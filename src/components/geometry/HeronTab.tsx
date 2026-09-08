import React, { useState, useRef } from 'react';
import { MathView } from '../MathView';
import { HelpCircle, RefreshCw, Eye, Sparkles, CheckCircle2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const HeronTab: React.FC = () => {
  // 강변 수평선의 Y좌표 (강 위쪽에 마을 A, B가 모두 위치)
  const RIVER_Y = 230;

  // 두 마을 A, B는 강변의 같은 쪽(위쪽 y < RIVER_Y)에 위치
  const [A, setA] = useState<Point>({ x: 130, y: 80 });
  const [B, setB] = useState<Point>({ x: 470, y: 110 });
  const [P, setP] = useState<Point>({ x: 240, y: RIVER_Y });
  const [showReflect, setShowReflect] = useState<boolean>(true);
  const [dragging, setDragging] = useState<'A' | 'B' | 'P' | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  // 대칭점 B' (강변 라인 y = RIVER_Y에 대한 B의 선대칭점)
  const Bp: Point = { x: B.x, y: 2 * RIVER_Y - B.y };

  // 이론상 최단 거리: 선분 AB'의 직선 거리
  const minPossible = dist(A, Bp);

  // 현재 경로 거리
  const ap = dist(A, P);
  const pb = dist(P, B);
  const sumDist = ap + pb;

  // 최적의 P 위치 계산: 선분 AB'과 강변 직선(y = RIVER_Y)의 교점
  const getOptimalX = () => {
    const denom = Bp.y - A.y;
    if (Math.abs(denom) < 0.001) return (A.x + B.x) / 2;
    const t = (RIVER_Y - A.y) / denom;
    return A.x + (Bp.x - A.x) * t;
  };

  const optimalX = getOptimalX();

  // 최적점 자동 이동
  const snapToOptimal = () => {
    setP({ x: Math.max(30, Math.min(570, optimalX)), y: RIVER_Y });
    setShowReflect(true);
  };

  // 입사각 및 반사각 계산 (강변 수평선과의 각도)
  const angleA = Math.atan2(RIVER_Y - A.y, Math.abs(P.x - A.x)) * (180 / Math.PI);
  const angleB = Math.atan2(RIVER_Y - B.y, Math.abs(B.x - P.x)) * (180 / Math.PI);

  const isNearOptimal = Math.abs(sumDist - minPossible) < 1.0;

  // 미니 차트: P의 x좌표에 따른 총 거리 곡선 (U자형 최적화 곡선)
  const getChartCurve = () => {
    const pts: { x: number; s: number }[] = [];
    for (let x = 40; x <= 560; x += 8) {
      const s = dist(A, { x, y: RIVER_Y }) + dist(B, { x, y: RIVER_Y });
      pts.push({ x, s });
    }
    const smin = Math.min(...pts.map((p) => p.s));
    const smax = Math.max(...pts.map((p) => p.s));
    const chartH = 40;
    const chartY = 398;
    let d = '';
    pts.forEach((p, i) => {
      const yy = chartY - ((p.s - smin) / (smax - smin || 1)) * chartH;
      d += (i === 0 ? 'M' : 'L') + p.x + ' ' + yy + ' ';
    });
    return { d, chartY, smin, smax };
  };

  const { d: curveD, chartY, smin, smax } = getChartCurve();
  const currentChartMarkerY =
    chartY - ((sumDist - smin) / (smax - smin || 1)) * 40;

  // 강변 물결 경로
  const getRiverPath = () => {
    let d = `M 30 ${RIVER_Y}`;
    for (let x = 30; x <= 570; x += 40) {
      d += ` Q ${x + 20} ${RIVER_Y + Math.sin(x / 40) * 5} ${x + 40} ${RIVER_Y}`;
    }
    return d;
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
      // 마을 A: 강변 위쪽 영역
      setA({
        x: Math.max(40, Math.min(560, pos.x)),
        y: Math.max(30, Math.min(RIVER_Y - 30, pos.y)),
      });
    } else if (dragging === 'B') {
      // 마을 B: 강변 위쪽 영역
      setB({
        x: Math.max(40, Math.min(560, pos.x)),
        y: Math.max(30, Math.min(RIVER_Y - 30, pos.y)),
      });
    } else if (dragging === 'P') {
      // 점 P: 강변 수평선 위에서만 좌우 이동
      setP({
        x: Math.max(40, Math.min(560, pos.x)),
        y: RIVER_Y,
      });
    }
  };

  const handlePointerUp = () => setDragging(null);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 border-b border-[#2C567F] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAF3FC]">
            헤론의 최단 거리 문제 (Heron's Shortest Path)
          </h2>
          <p className="text-xs sm:text-sm text-[#9FC0DC] mt-1">
            마을 A에서 출발하여 강변의 어떤 지점 P에서 물을 뜬 후 마을 B로 갑니다.{' '}
            <strong className="text-[#E7A93D]">총 거리(AP + PB)가 최소(가장 짧은 길)</strong>가 되는 최적의 P 위치를 탐색하세요.
          </p>
        </div>
        {isNearOptimal && (
          <span className="mt-2 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6FCF97]/20 border border-[#6FCF97] text-[#6FCF97] text-xs font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            최단 경로(최적) 도달!
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
            {/* Water Reflection Area (Below River) */}
            <rect
              x="30"
              y={RIVER_Y}
              width="540"
              height={420 - RIVER_Y - 20}
              fill="#112C48"
              opacity="0.5"
            />

            {/* Background River */}
            <path
              d={getRiverPath()}
              fill="none"
              stroke="#3E7FB0"
              strokeWidth={26}
              opacity={0.35}
            />
            <line
              x1="30"
              y1={RIVER_Y}
              x2="570"
              y2={RIVER_Y}
              stroke="#7FC4EE"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
            <text
              x={40}
              y={RIVER_Y - 10}
              fill="#7FC4EE"
              fontSize={11}
              fontFamily="Noto Sans KR"
              fontWeight={600}
              opacity={0.9}
            >
              🌊 강변 라인 (물 뜨는 직선 L)
            </text>
            <text
              x={40}
              y={RIVER_Y + 18}
              fill="#9FC0DC"
              fontSize={10}
              fontFamily="Noto Sans KR"
              opacity={0.6}
            >
              물에 비친 가상의 영역 (대칭 상)
            </text>

            {/* Bottom Distance vs Position Graph */}
            <g opacity={0.85}>
              <text
                x={40}
                y={chartY - 46}
                fill="#9FC0DC"
                fontSize={10}
                fontFamily="JetBrains Mono, monospace"
              >
                📊 P의 위치(x)에 따른 총 거리 AP + PB (U자형 곡선의 가장 아래 바닥이 최솟값)
              </text>
              <path d={curveD} fill="none" stroke="#E7A93D" strokeWidth={2} />
              {/* Optimal marker on chart */}
              <circle
                cx={optimalX}
                cy={chartY - 2}
                r={3}
                fill="#6FCF97"
              />
              {/* Current P marker on chart */}
              <circle
                cx={P.x}
                cy={currentChartMarkerY}
                r={4.5}
                fill={isNearOptimal ? '#6FCF97' : '#E8654F'}
                stroke="#EAF3FC"
                strokeWidth={1.5}
              />
              <line
                x1={P.x}
                y1={chartY - 42}
                x2={P.x}
                y2={chartY}
                stroke={isNearOptimal ? '#6FCF97' : '#E8654F'}
                strokeWidth={1}
                strokeDasharray="2 2"
                opacity={0.6}
              />
            </g>

            {/* Reflection Lines if enabled */}
            {showReflect && (
              <>
                {/* Perpendicular reflection line from B to B' */}
                <line
                  x1={B.x}
                  y1={B.y}
                  x2={Bp.x}
                  y2={Bp.y}
                  stroke="#7FC4EE"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  opacity={0.8}
                />

                {/* Straight line from A to B' (The true straight shortest path) */}
                <line
                  x1={A.x}
                  y1={A.y}
                  x2={Bp.x}
                  y2={Bp.y}
                  stroke="#6FCF97"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  opacity={0.9}
                />

                {/* Symmetrical line from P to B' */}
                <line
                  x1={P.x}
                  y1={P.y}
                  x2={Bp.x}
                  y2={Bp.y}
                  stroke="#E7A93D"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  opacity={0.7}
                />

                {/* Node B' (Virtual Reflection) */}
                <circle
                  cx={Bp.x}
                  cy={Bp.y}
                  r={8}
                  fill="#E7A93D"
                  stroke="#0E2A45"
                  strokeWidth={2}
                  opacity={0.85}
                />
                <text
                  x={Bp.x + 12}
                  y={Bp.y + 4}
                  fill="#E7A93D"
                  fontSize={13}
                  fontWeight={700}
                  fontFamily="JetBrains Mono, monospace"
                >
                  B' (강변 대칭점)
                </text>
                <text
                  x={Bp.x + 12}
                  y={Bp.y + 18}
                  fill="#9FC0DC"
                  fontSize={10}
                  fontFamily="Noto Sans KR"
                >
                  PB = PB'
                </text>
              </>
            )}

            {/* Path lines from A to P and P to B */}
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

            {/* Angle Arcs & Labels at point P */}
            {P.x > A.x && (
              <g>
                <path
                  d={`M ${P.x - 28} ${RIVER_Y} A 28 28 0 0 1 ${
                    P.x - 28 * Math.cos(angleA * (Math.PI / 180))
                  } ${RIVER_Y - 28 * Math.sin(angleA * (Math.PI / 180))}`}
                  fill="none"
                  stroke="#7FC4EE"
                  strokeWidth="1.5"
                />
                <text
                  x={P.x - 45}
                  y={RIVER_Y - 8}
                  fill="#7FC4EE"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {angleA.toFixed(1)}°
                </text>
              </g>
            )}

            {B.x > P.x && (
              <g>
                <path
                  d={`M ${P.x + 28} ${RIVER_Y} A 28 28 0 0 0 ${
                    P.x + 28 * Math.cos(angleB * (Math.PI / 180))
                  } ${RIVER_Y - 28 * Math.sin(angleB * (Math.PI / 180))}`}
                  fill="none"
                  stroke="#E7A93D"
                  strokeWidth="1.5"
                />
                <text
                  x={P.x + 45}
                  y={RIVER_Y - 8}
                  fill="#E7A93D"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  textAnchor="start"
                >
                  {angleB.toFixed(1)}°
                </text>
              </g>
            )}

            {/* Draggable Node A */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('A', e)}
            >
              <circle
                cx={A.x}
                cy={A.y}
                r={11}
                fill="#E7A93D"
                stroke="#0E2A45"
                strokeWidth={2.5}
              />
              <text
                x={A.x - 6}
                y={A.y - 15}
                fill="#EAF3FC"
                fontSize={15}
                fontWeight={700}
                fontFamily="Noto Sans KR"
              >
                A (마을)
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
                r={11}
                fill="#E7A93D"
                stroke="#0E2A45"
                strokeWidth={2.5}
              />
              <text
                x={B.x - 6}
                y={B.y - 15}
                fill="#EAF3FC"
                fontSize={15}
                fontWeight={700}
                fontFamily="Noto Sans KR"
              >
                B (마을)
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
                r={13}
                fill={isNearOptimal ? '#6FCF97' : '#E8654F'}
                stroke="#EAF3FC"
                strokeWidth={2.5}
              />
              <text
                x={P.x}
                y={P.y + 24}
                fill={isNearOptimal ? '#6FCF97' : '#E8654F'}
                fontSize={13}
                fontWeight={700}
                fontFamily="Noto Sans KR"
                textAnchor="middle"
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
              실시간 거리 & 각도 측정계
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
                <span className="text-[#EAF3FC] font-semibold">총 이동 거리 (AP + PB)</span>
                <b
                  className={`font-mono text-lg ${
                    isNearOptimal ? 'text-[#6FCF97]' : 'text-[#E8654F]'
                  }`}
                >
                  {sumDist.toFixed(1)}
                </b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#6FCF97] font-semibold">이론상 최단 거리 (선분 AB')</span>
                <b className="font-mono text-lg text-[#6FCF97]">
                  {minPossible.toFixed(1)}
                </b>
              </div>

              {/* Angles comparison */}
              <div className="flex justify-between items-baseline text-xs pt-1">
                <span className="text-[#9FC0DC]">강변과의 각도</span>
                <span className="font-mono text-[#EAF3FC]">
                  입사각 <b className="text-[#7FC4EE]">{angleA.toFixed(1)}°</b> vs 반사각{' '}
                  <b className="text-[#E7A93D]">{angleB.toFixed(1)}°</b>
                </span>
              </div>
            </div>

            {/* Interactive Actions */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => setShowReflect(!showReflect)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#E7A93D] text-[#E7A93D] hover:bg-[#E7A93D] hover:text-[#0E2A45] font-semibold text-xs transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showReflect ? "대칭점 B' 및 직선 숨기기" : "B의 대칭점 B' 작도선 보기"}</span>
              </button>

              <button
                onClick={snapToOptimal}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#E7A93D] to-[#6FCF97] text-[#0E2A45] font-bold text-xs shadow hover:brightness-110 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>P를 최적의 위치(최단 경로)로 자동 이동</span>
              </button>
            </div>

            {/* What does "Optimal" mean? Explanation Callout */}
            <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3 text-xs mb-3">
              <div className="text-[#E7A93D] font-bold font-mono mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6FCF97]" />
                <span>Q. 여기서 '최적의 위치'란 무엇인가요?</span>
              </div>
              <p className="text-[#9FC0DC] leading-relaxed">
                마을 A에서 강변 P를 들러 마을 B로 가는 <strong className="text-[#EAF3FC]">총 이동 거리 (AP + PB)가 최소(가장 짧은 최단 경로)</strong>가 되는 위치를 말합니다.
                이 위치에서는 놀랍게도 <strong className="text-[#6FCF97]">입사각과 반사각이 완벽하게 같아지며</strong>(빛의 반사 법칙), A와 대칭점 B'을 잇는 직선 선분 위에 P가 놓이게 됩니다.
              </p>
            </div>

            {/* Middle School Inquiry Question & Hint */}
            <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3 text-xs">
              <div className="flex items-center gap-1.5 text-[#E7A93D] font-bold font-mono mb-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>영재 탐구: 왜 대칭점이 최단 거리일까?</span>
              </div>
              <p className="text-[#9FC0DC] leading-relaxed mb-2">
                "왜 A와 대칭점 B'을 직선으로 이은 경로가 강변과 만나는 점이 최단 거리가 될까요?
                <strong className="text-[#EAF3FC]"> '삼각부등식'</strong>을 이용해 증명해 보세요."
              </p>
              <details className="cursor-pointer group">
                <summary className="text-[#E7A93D] font-semibold hover:underline select-none">
                  💡 수학적 증명 힌트 보기
                </summary>
                <div className="mt-2 p-2.5 rounded bg-[#1B4468] border-l-2 border-[#6FCF97] text-[#EAF3FC] space-y-1.5 leading-relaxed text-[11px]">
                  <div>
                    1. 점 B를 강변에 대해 대칭시킨 점을 <MathView math="B'" inline />이라 하면,
                    강변의 어떤 점 P에 대해서도 대칭성에 의해 <MathView math="PB = PB'" inline />입니다.
                  </div>
                  <div>
                    2. 따라서 총 거리 <MathView math="AP + PB = AP + PB'" inline />가 됩니다.
                  </div>
                  <div>
                    3. 점 P가 선분 AB' 위에 있지 않으면 세 점 A, P, B'은 삼각형을 이루므로 삼각부등식에 의해:
                    <div className="my-1 font-mono text-center text-[#E7A93D]">
                      <MathView math="AP + PB' \ge AB'" />
                    </div>
                  </div>
                  <div>
                    4. 등호는 오직 세 점 A, P, B'이 한 직선 위에 있을 때만 성립하므로,
                    <strong>선분 AB'이 강변과 만나는 교점이 유일한 최단 거리 최적점</strong>입니다!
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
