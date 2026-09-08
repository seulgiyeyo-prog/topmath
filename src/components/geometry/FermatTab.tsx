import React, { useState, useRef, useEffect } from 'react';
import { MathView } from '../MathView';
import { Compass, Sparkles, AlertCircle, RotateCcw } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const FermatTab: React.FC = () => {
  const [A, setA] = useState<Point>({ x: 150, y: 360 });
  const [B, setB] = useState<Point>({ x: 460, y: 360 });
  const [C, setC] = useState<Point>({ x: 300, y: 80 });
  const [P, setP] = useState<Point>({ x: 303, y: 270 });
  const [bestSum, setBestSum] = useState<number | null>(null);
  const [dragging, setDragging] = useState<'A' | 'B' | 'C' | 'P' | null>(null);
  const [showConstruction, setShowConstruction] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const animRef = useRef<number | null>(null);

  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  const rotate = (pt: Point, center: Point, deg: number): Point => {
    const rad = (deg * Math.PI) / 180;
    const dx = pt.x - center.x;
    const dy = pt.y - center.y;
    return {
      x: center.x + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: center.y + dx * Math.sin(rad) + dy * Math.cos(rad),
    };
  };

  // Build outward equilateral apex on side p1-p2, pointing away from p3
  const apexOutward = (p1: Point, p2: Point, p3: Point): Point => {
    const cand1 = rotate(p2, p1, 60);
    const cand2 = rotate(p2, p1, -60);
    const d1 = dist(cand1, p3);
    const d2 = dist(cand2, p3);
    return d1 > d2 ? cand1 : cand2;
  };

  const angleAt = (vertex: Point, p1: Point, p2: Point): number => {
    const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
    const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
    if (mag < 1e-6) return 0;
    return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
  };

  const lineIntersect = (p1: Point, p2: Point, p3: Point, p4: Point): Point | null => {
    const d = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(d) < 1e-6) return null;
    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / d;
    return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
  };

  const getTrueFermat = (): Point => {
    const angleA = angleAt(A, B, C);
    const angleB = angleAt(B, A, C);
    const angleC = angleAt(C, A, B);
    const maxAngle = Math.max(angleA, angleB, angleC);

    // If any angle >= 120 deg, Fermat point is that vertex itself
    if (maxAngle >= 120) {
      if (angleA === maxAngle) return A;
      if (angleB === maxAngle) return B;
      return C;
    }

    const apexAB = apexOutward(A, B, C);
    const apexBC = apexOutward(B, C, A);
    const inter = lineIntersect(C, apexAB, A, apexBC);
    return inter || { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
  };

  const pa = dist(P, A);
  const pb = dist(P, B);
  const pc = dist(P, C);
  const currentSum = pa + pb + pc;

  const trueFermat = getTrueFermat();
  const trueMin = dist(trueFermat, A) + dist(trueFermat, B) + dist(trueFermat, C);

  useEffect(() => {
    setBestSum((prev) => (prev === null || currentSum < prev ? currentSum : prev));
  }, [currentSum]);

  // Outward equilateral apexes
  const apexAB = apexOutward(A, B, C);
  const apexBC = apexOutward(B, C, A);
  const apexCA = apexOutward(C, A, B);

  const angleA = angleAt(A, B, C);
  const angleB = angleAt(B, A, C);
  const angleC = angleAt(C, A, B);
  const maxAngle = Math.max(angleA, angleB, angleC);
  const isObtuse120 = maxAngle >= 120;

  // Angles formed at P: APB, BPC, CPA
  const angleAPB = angleAt(P, A, B);
  const angleBPC = angleAt(P, B, C);
  const angleCPA = angleAt(P, C, A);

  const isNearFermat = Math.abs(currentSum - trueMin) < 1.5;

  const animateToFermat = () => {
    setShowConstruction(true);
    const target = getTrueFermat();
    const start = { ...P };
    let frame = 0;
    const totalFrames = 30;

    if (animRef.current) cancelAnimationFrame(animRef.current);

    const step = () => {
      frame++;
      const progress = frame / totalFrames;
      // easeOutCubic
      const t = 1 - Math.pow(1 - progress, 3);
      setP({
        x: start.x + (target.x - start.x) * t,
        y: start.y + (target.y - start.y) * t,
      });

      if (frame < totalFrames) {
        animRef.current = requestAnimationFrame(step);
      }
    };
    animRef.current = requestAnimationFrame(step);
  };

  const getPointerPos = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 460;
    return { x, y };
  };

  const handlePointerDown = (id: 'A' | 'B' | 'C' | 'P', e: React.PointerEvent) => {
    e.stopPropagation();
    setDragging(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const pos = getPointerPos(e);
    const clampedX = Math.max(20, Math.min(580, pos.x));
    const clampedY = Math.max(20, Math.min(440, pos.y));

    if (dragging === 'A') setA({ x: clampedX, y: clampedY });
    else if (dragging === 'B') setB({ x: clampedX, y: clampedY });
    else if (dragging === 'C') setC({ x: clampedX, y: clampedY });
    else if (dragging === 'P') setP({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = () => setDragging(null);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 border-b border-[#2C567F] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAF3FC]">
            페르마 점 탐구 (Fermat Point Exploration)
          </h2>
          <p className="text-xs sm:text-sm text-[#9FC0DC] mt-1">
            세 마을 A, B, C를 연결하는 도로가 한 점 P에서 만날 때,{' '}
            <strong className="text-[#E7A93D]">PA + PB + PC 를 최소로 만드는 점 P</strong>는 어디일까요?
            P를 드래그해 최솟값을 직접 찾아보세요.
          </p>
        </div>
        {isNearFermat && (
          <span className="mt-2 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6FCF97]/20 border border-[#6FCF97] text-[#6FCF97] text-xs font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            페르마 점 도달! (120° 균형)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Canvas */}
        <div className="lg:col-span-2 bg-[#0E2A45] border border-[#2C567F] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg
            ref={svgRef}
            viewBox="0 0 600 460"
            className="w-full h-auto select-none touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Triangle ABC body */}
            <polygon
              points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
              fill="#1B4468"
              fillOpacity={0.6}
              stroke="#7FC4EE"
              strokeWidth={2}
            />

            {/* Construction details if active */}
            {showConstruction && (
              <g opacity={0.85}>
                {/* 3 Outward equilateral triangles */}
                <polygon
                  points={`${A.x},${A.y} ${B.x},${B.y} ${apexAB.x},${apexAB.y}`}
                  fill="#6FCF97"
                  fillOpacity={0.1}
                  stroke="#6FCF97"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <polygon
                  points={`${B.x},${B.y} ${C.x},${C.y} ${apexBC.x},${apexBC.y}`}
                  fill="#6FCF97"
                  fillOpacity={0.1}
                  stroke="#6FCF97"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <polygon
                  points={`${C.x},${C.y} ${A.x},${A.y} ${apexCA.x},${apexCA.y}`}
                  fill="#6FCF97"
                  fillOpacity={0.1}
                  stroke="#6FCF97"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />

                {/* Connecting lines intersecting at Fermat point */}
                <line
                  x1={C.x}
                  y1={C.y}
                  x2={apexAB.x}
                  y2={apexAB.y}
                  stroke="#E7A93D"
                  strokeWidth={1.5}
                />
                <line
                  x1={A.x}
                  y1={A.y}
                  x2={apexBC.x}
                  y2={apexBC.y}
                  stroke="#E7A93D"
                  strokeWidth={1.5}
                />
                <line
                  x1={B.x}
                  y1={B.y}
                  x2={apexCA.x}
                  y2={apexCA.y}
                  stroke="#E7A93D"
                  strokeWidth={1.5}
                />
              </g>
            )}

            {/* Lines from P to A, B, C */}
            <line
              x1={A.x}
              y1={A.y}
              x2={P.x}
              y2={P.y}
              stroke="#E8654F"
              strokeWidth={2.5}
            />
            <line
              x1={B.x}
              y1={B.y}
              x2={P.x}
              y2={P.y}
              stroke="#E8654F"
              strokeWidth={2.5}
            />
            <line
              x1={C.x}
              y1={C.y}
              x2={P.x}
              y2={P.y}
              stroke="#E8654F"
              strokeWidth={2.5}
            />

            {/* Angle labels at P */}
            {isNearFermat && !isObtuse120 && (
              <g fontSize={11} fill="#6FCF97" fontWeight={600} fontFamily="JetBrains Mono">
                <text x={P.x + 12} y={P.y - 12}>
                  ∠APB: {Math.round(angleAPB)}°
                </text>
                <text x={P.x + 12} y={P.y + 14}>
                  ∠BPC: {Math.round(angleBPC)}°
                </text>
                <text x={P.x - 70} y={P.y + 4}>
                  ∠CPA: {Math.round(angleCPA)}°
                </text>
              </g>
            )}

            {/* Vertices A, B, C */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('A', e)}
            >
              <circle cx={A.x} cy={A.y} r={10} fill="#E7A93D" stroke="#0E2A45" strokeWidth={2} />
              <text x={A.x - 7} y={A.y - 14} fill="#EAF3FC" fontSize={15} fontWeight={700}>
                A
              </text>
            </g>

            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('B', e)}
            >
              <circle cx={B.x} cy={B.y} r={10} fill="#E7A93D" stroke="#0E2A45" strokeWidth={2} />
              <text x={B.x + 12} y={B.y + 16} fill="#EAF3FC" fontSize={15} fontWeight={700}>
                B
              </text>
            </g>

            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('C', e)}
            >
              <circle cx={C.x} cy={C.y} r={10} fill="#E7A93D" stroke="#0E2A45" strokeWidth={2} />
              <text x={C.x - 6} y={C.y - 14} fill="#EAF3FC" fontSize={15} fontWeight={700}>
                C
              </text>
            </g>

            {/* Draggable Point P */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('P', e)}
            >
              <circle
                cx={P.x}
                cy={P.y}
                r={12}
                fill={isNearFermat ? '#6FCF97' : '#EAF3FC'}
                stroke="#0E2A45"
                strokeWidth={2.5}
              />
              <text
                x={P.x + 14}
                y={P.y + 4}
                fill={isNearFermat ? '#6FCF97' : '#EAF3FC'}
                fontSize={14}
                fontWeight={700}
                fontFamily="Noto Sans KR"
              >
                P (중심점)
              </text>
            </g>
          </svg>
        </div>

        {/* Sidebar Controls & Measurements */}
        <div className="bg-[#153A5C] border border-[#2C567F] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-[#E7A93D] font-bold uppercase tracking-wider mb-2">
              거리 측정 및 탐색 결과
            </div>

            <div className="space-y-2 border-b border-[#2C567F] pb-3 mb-4 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">PA 거리</span>
                <b className="font-mono text-base text-[#EAF3FC]">{pa.toFixed(1)}</b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">PB 거리</span>
                <b className="font-mono text-base text-[#EAF3FC]">{pb.toFixed(1)}</b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">PC 거리</span>
                <b className="font-mono text-base text-[#EAF3FC]">{pc.toFixed(1)}</b>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-dashed border-[#2C567F]">
                <span className="text-[#EAF3FC] font-semibold">합계 (PA+PB+PC)</span>
                <b
                  className={`font-mono text-lg ${
                    isNearFermat ? 'text-[#6FCF97]' : 'text-[#E8654F]'
                  }`}
                >
                  {currentSum.toFixed(1)}
                </b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#6FCF97] font-semibold">내 최고 기록 (최소값)</span>
                <b className="font-mono text-lg text-[#6FCF97]">
                  {bestSum !== null ? bestSum.toFixed(1) : '-'}
                </b>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={animateToFermat}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#E7A93D] hover:bg-[#d6992d] text-[#0E2A45] font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Compass className="w-4 h-4" />
                <span>정삼각형 작도로 실제 페르마점 찾기</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setA({ x: 150, y: 360 });
                    setB({ x: 460, y: 360 });
                    setC({ x: 300, y: 80 });
                    setP({ x: 303, y: 270 });
                    setBestSum(null);
                    setShowConstruction(false);
                  }}
                  className="py-1.5 px-2 rounded-lg border border-[#2C567F] hover:bg-[#1B4468] text-[#9FC0DC] text-xs font-semibold text-center cursor-pointer transition-colors"
                >
                  예각 삼각형
                </button>
                <button
                  onClick={() => {
                    setA({ x: 150, y: 340 });
                    setB({ x: 470, y: 340 });
                    setC({ x: 430, y: 120 });
                    setP({ x: 350, y: 280 });
                    setBestSum(null);
                    setShowConstruction(false);
                  }}
                  className="py-1.5 px-2 rounded-lg border border-[#2C567F] hover:bg-[#1B4468] text-[#9FC0DC] text-xs font-semibold text-center cursor-pointer transition-colors"
                >
                  둔각(120°+) 삼각형
                </button>
              </div>
            </div>

            {/* Caution & In-depth Vector / Derivative Question */}
            <div className="space-y-2">
              <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3 text-xs">
                <div className="flex items-center gap-1.5 text-[#E8654F] font-bold font-mono mb-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>주의: 한 내각이 120° 이상이면?</span>
                </div>
                <p className="text-[#9FC0DC] leading-relaxed">
                  '둔각 삼각형' 버튼을 눌러보세요. 한 내각이 120° 이상이 되면 페르마 점 작도선 교점이 삼각형 바깥으로 나가버리기 때문에,{' '}
                  <strong className="text-[#EAF3FC]">그 120° 꼭짓점 자체가 최단 거리 점</strong>이 됩니다!
                </p>
              </div>

              <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3 text-xs">
                <div className="text-[#E7A93D] font-bold font-mono mb-1">
                  심화: 왜 하필 세 각이 120°일까? (미분과 벡터 평형)
                </div>
                <p className="text-[#9FC0DC] leading-relaxed mb-1.5">
                  거리의 합 <MathView math="PA+PB+PC" inline />가 최소가 되는 곳에서는, 점 P를 어느 방향으로 살짝 움직여도 변화율(미분값)이 0이 됩니다.
                </p>
                <details className="cursor-pointer">
                  <summary className="text-[#6FCF97] font-semibold hover:underline">
                    벡터 평형 증명 펼치기
                  </summary>
                  <div className="mt-1.5 p-2 rounded bg-[#1B4468] text-[#EAF3FC] space-y-1 leading-relaxed">
                    <div>
                      P에서 세 꼭짓점으로 향하는 단위벡터(길이 1)를 <MathView math="\vec{u}_A, \vec{u}_B, \vec{u}_C" inline />라 하면,
                      거리 합 함수의 미분(기울기)은 이 세 벡터의 합과 같습니다:
                    </div>
                    <div className="text-center font-mono text-[#E7A93D] py-1">
                      <MathView math="\vec{u}_A + \vec{u}_B + \vec{u}_C = \vec{0}" />
                    </div>
                    <div>
                      세 개의 같은 크기(1) 힘이 줄다리기를 하여 정확히 평형(0)을 이루려면,
                      세 벡터는 360°를 3등분한 <strong>정확히 120°씩</strong> 벌어져 있어야 합니다!
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
