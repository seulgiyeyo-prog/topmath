import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MathView } from '../MathView';
import { Play, RotateCcw, Weight, Sparkles, HelpCircle, Activity } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const TorricelliTab: React.FC = () => {
  // Vertices of the triangle (Pulleys)
  const [A, setA] = useState<Point>({ x: 300, y: 70 });
  const [B, setB] = useState<Point>({ x: 130, y: 340 });
  const [C, setC] = useState<Point>({ x: 470, y: 340 });

  // Central knot P (connecting 3 strings)
  const [P, setP] = useState<Point>({ x: 280, y: 220 });
  const [velocity, setVelocity] = useState<Point>({ x: 0, y: 0 });
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [showForces, setShowForces] = useState<boolean>(true);
  const [dragging, setDragging] = useState<'A' | 'B' | 'C' | 'P' | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const animRef = useRef<number | null>(null);

  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  const distPA = dist(P, A);
  const distPB = dist(P, B);
  const distPC = dist(P, C);
  const totalDistance = distPA + distPB + distPC;

  // Calculate angles at P between strings
  const angleBetween = (p1: Point, p2: Point) => {
    const v1 = { x: p1.x - P.x, y: p1.y - P.y };
    const v2 = { x: p2.x - P.x, y: p2.y - P.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.hypot(v1.x, v1.y) || 1;
    const mag2 = Math.hypot(v2.x, v2.y) || 1;
    const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return (Math.acos(cosTheta) * 180) / Math.PI;
  };

  const angleAPB = angleBetween(A, B);
  const angleBPC = angleBetween(B, C);
  const angleCPA = angleBetween(C, A);

  // Physics loop: Tension force pulls P towards A, B, C with unit magnitude (since all 3 weights are equal: 1kg each)
  const stepPhysics = useCallback(() => {
    if (dragging === 'P') return;

    // Unit vectors towards A, B, C
    const dA = Math.hypot(A.x - P.x, A.y - P.y) || 1;
    const dB = Math.hypot(B.x - P.x, B.y - P.y) || 1;
    const dC = Math.hypot(C.x - P.x, C.y - P.y) || 1;

    const fx = (A.x - P.x) / dA + (B.x - P.x) / dB + (C.x - P.x) / dC;
    const fy = (A.y - P.y) / dA + (B.y - P.y) / dB + (C.y - P.y) / dC;

    const tensionStrength = 1.8;
    const damping = 0.88;

    setVelocity((v) => {
      const newVx = (v.x + fx * tensionStrength) * damping;
      const newVy = (v.y + fy * tensionStrength) * damping;

      setP((prevP) => ({
        x: prevP.x + newVx,
        y: prevP.y + newVy,
      }));

      return { x: newVx, y: newVy };
    });
  }, [A, B, C, P, dragging]);

  useEffect(() => {
    if (isSimulating && !dragging) {
      animRef.current = requestAnimationFrame(stepPhysics);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isSimulating, dragging, stepPhysics]);

  const getPointerPos = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 420;
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
    const clampedX = Math.max(50, Math.min(550, pos.x));
    const clampedY = Math.max(50, Math.min(370, pos.y));

    if (dragging === 'A') setA({ x: clampedX, y: clampedY });
    else if (dragging === 'B') setB({ x: clampedX, y: clampedY });
    else if (dragging === 'C') setC({ x: clampedX, y: clampedY });
    else if (dragging === 'P') {
      setP({ x: clampedX, y: clampedY });
      setVelocity({ x: 0, y: 0 });
    }
  };

  const handlePointerUp = () => setDragging(null);

  // Net force magnitude on knot P
  const dA = Math.hypot(A.x - P.x, A.y - P.y) || 1;
  const dB = Math.hypot(B.x - P.x, B.y - P.y) || 1;
  const dC = Math.hypot(C.x - P.x, C.y - P.y) || 1;
  const netFx = (A.x - P.x) / dA + (B.x - P.x) / dB + (C.x - P.x) / dC;
  const netFy = (A.y - P.y) / dA + (B.y - P.y) / dB + (C.y - P.y) / dC;
  const netForce = Math.hypot(netFx, netFy);

  const isEquilibrium = netForce < 0.08;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 border-b border-[#2C567F] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAF3FC]">
            토리첼리의 3중 도르래 물리 실험실 (Torricelli's Pulley Engine)
          </h2>
          <p className="text-xs sm:text-sm text-[#9FC0DC] mt-1">
            수학자 페르마의 질문에 물리학자 토리첼리는{' '}
            <strong className="text-[#E7A93D]">"도르래에 1kg 추 3개를 매달면 중력이 저절로 최단 거리를 찾는다"</strong>
            고 답했습니다. 힘의 평형과 120도의 원리를 직접 실험하세요!
          </p>
        </div>
        {isEquilibrium && (
          <span className="mt-2 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6FCF97]/20 border border-[#6FCF97] text-[#6FCF97] text-xs font-bold animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            힘의 평형 도달! (세 각 모두 120°)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Mechanical Pulley Stage */}
        <div className="lg:col-span-2 bg-[#0E2A45] border border-[#2C567F] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg
            ref={svgRef}
            viewBox="0 0 600 420"
            className="w-full h-auto select-none touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Wooden Board Texture Backing */}
            <rect width="600" height="420" fill="#122438" rx={12} />

            {/* Triangle Edges (Base board) */}
            <polygon
              points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
              fill="#1B4468"
              fillOpacity={0.3}
              stroke="#2C567F"
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />

            {/* 3 Hanging Strings through Pulleys to 1kg Weights */}
            {/* From P to A, then hanging down to Weight A */}
            <line x1={P.x} y1={P.y} x2={A.x} y2={A.y} stroke="#EAF3FC" strokeWidth={2.5} />
            <line x1={A.x} y1={A.y} x2={A.x} y2={A.y + 55} stroke="#E7A93D" strokeWidth={2} />
            {/* Weight A */}
            <g transform={`translate(${A.x - 14}, ${A.y + 55})`}>
              <rect width={28} height={20} rx={4} fill="#8B5A2B" stroke="#F2B84B" strokeWidth={1.5} />
              <text x={14} y={14} fill="#FFFFFF" fontSize={9} fontWeight={700} textAnchor="middle">
                1kg
              </text>
            </g>

            {/* From P to B, then hanging down to Weight B */}
            <line x1={P.x} y1={P.y} x2={B.x} y2={B.y} stroke="#EAF3FC" strokeWidth={2.5} />
            <line x1={B.x} y1={B.y} x2={B.x - 30} y2={B.y + 40} stroke="#E7A93D" strokeWidth={2} />
            {/* Weight B */}
            <g transform={`translate(${B.x - 44}, ${B.y + 40})`}>
              <rect width={28} height={20} rx={4} fill="#8B5A2B" stroke="#F2B84B" strokeWidth={1.5} />
              <text x={14} y={14} fill="#FFFFFF" fontSize={9} fontWeight={700} textAnchor="middle">
                1kg
              </text>
            </g>

            {/* From P to C, then hanging down to Weight C */}
            <line x1={P.x} y1={P.y} x2={C.x} y2={C.y} stroke="#EAF3FC" strokeWidth={2.5} />
            <line x1={C.x} y1={C.y} x2={C.x + 30} y2={C.y + 40} stroke="#E7A93D" strokeWidth={2} />
            {/* Weight C */}
            <g transform={`translate(${C.x + 16}, ${C.y + 40})`}>
              <rect width={28} height={20} rx={4} fill="#8B5A2B" stroke="#F2B84B" strokeWidth={1.5} />
              <text x={14} y={14} fill="#FFFFFF" fontSize={9} fontWeight={700} textAnchor="middle">
                1kg
              </text>
            </g>

            {/* Tension Force Vectors on knot P */}
            {showForces && (
              <g>
                {/* Vector to A */}
                <line
                  x1={P.x}
                  y1={P.y}
                  x2={P.x + ((A.x - P.x) / dA) * 45}
                  y2={P.y + ((A.y - P.y) / dA) * 45}
                  stroke="#FF6B5C"
                  strokeWidth={3}
                  markerEnd="url(#arrow)"
                />
                {/* Vector to B */}
                <line
                  x1={P.x}
                  y1={P.y}
                  x2={P.x + ((B.x - P.x) / dB) * 45}
                  y2={P.y + ((B.y - P.y) / dB) * 45}
                  stroke="#FF6B5C"
                  strokeWidth={3}
                  markerEnd="url(#arrow)"
                />
                {/* Vector to C */}
                <line
                  x1={P.x}
                  y1={P.y}
                  x2={P.x + ((C.x - P.x) / dC) * 45}
                  y2={P.y + ((C.y - P.y) / dC) * 45}
                  stroke="#FF6B5C"
                  strokeWidth={3}
                  markerEnd="url(#arrow)"
                />
              </g>
            )}

            {/* 3 Pulleys at A, B, C */}
            {[
              { pt: A, label: 'A', id: 'A' as const },
              { pt: B, label: 'B', id: 'B' as const },
              { pt: C, label: 'C', id: 'C' as const },
            ].map(({ pt, label, id }) => (
              <g
                key={label}
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => handlePointerDown(id, e)}
              >
                {/* Pulley Wheel */}
                <circle cx={pt.x} cy={pt.y} r={14} fill="#4B6B94" stroke="#9FC0DC" strokeWidth={3} />
                <circle cx={pt.x} cy={pt.y} r={4} fill="#1B4468" />
                <text
                  x={pt.x}
                  y={pt.y - 20}
                  fill="#EAF3FC"
                  fontSize={13}
                  fontWeight={800}
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  도르래 {label}
                </text>
              </g>
            ))}

            {/* Central Knot P (Draggable) */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('P', e)}
            >
              <circle
                cx={P.x}
                cy={P.y}
                r={12}
                fill={isEquilibrium ? '#6FCF97' : '#E7A93D'}
                stroke="#0E2A45"
                strokeWidth={2.5}
                className="transition-colors"
              />
              <text
                x={P.x}
                y={P.y + 4}
                fill="#0E2A45"
                fontSize={10}
                fontWeight={900}
                textAnchor="middle"
                pointerEvents="none"
              >
                P
              </text>
            </g>

            {/* Angle Labels around knot P */}
            <text
              x={P.x}
              y={P.y - 18}
              fill="#9FC0DC"
              fontSize={10}
              fontWeight={700}
              textAnchor="middle"
            >
              ∠APB: {angleAPB.toFixed(0)}°
            </text>
            <text
              x={P.x + 22}
              y={P.y + 22}
              fill="#9FC0DC"
              fontSize={10}
              fontWeight={700}
            >
              ∠BPC: {angleBPC.toFixed(0)}°
            </text>
            <text
              x={P.x - 65}
              y={P.y + 22}
              fill="#9FC0DC"
              fontSize={10}
              fontWeight={700}
            >
              ∠CPA: {angleCPA.toFixed(0)}°
            </text>
          </svg>
        </div>

        {/* Sidebar Controls & Mathematical Insights */}
        <div className="bg-[#153A5C] border border-[#2C567F] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-[#E7A93D] font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>도르래 역학 실시간 분석</span>
              <Activity className="w-3.5 h-3.5 text-[#6FCF97]" />
            </div>

            <div className="space-y-2 border-b border-[#2C567F] pb-3 mb-4 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">세 실 길이 합 (PA+PB+PC)</span>
                <b className="font-mono text-base text-[#EAF3FC]">{totalDistance.toFixed(1)}</b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">매듭에 가해지는 알짜힘</span>
                <b
                  className={`font-mono text-base ${
                    isEquilibrium ? 'text-[#6FCF97]' : 'text-[#FF6B5C]'
                  }`}
                >
                  {netForce.toFixed(2)} N
                </b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">세 방향 각도</span>
                <b className="font-mono text-xs text-[#E7A93D]">
                  {angleAPB.toFixed(0)}° / {angleBPC.toFixed(0)}° / {angleCPA.toFixed(0)}°
                </b>
              </div>
            </div>

            {/* Drag knot hint */}
            <div className="p-2.5 rounded-lg bg-[#0E2A45] border border-[#2C567F] mb-4 text-xs text-[#9FC0DC] leading-relaxed">
              👉 <strong>탐구 미션:</strong> 중앙 매듭 <strong className="text-[#E7A93D]">P</strong>를 마우스로 아무 곳이나 멀리 끌어다 놓아보세요!
              손을 떼면 도르래에 달린 1kg 추들이 실을 당기며 <strong className="text-[#6FCF97]">정확히 세 각이 120°가 되는 페르마 점</strong>으로 매듭을 끌고 갑니다.
            </div>

            {/* Toggle Controls */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => {
                  setP({ x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 });
                  setVelocity({ x: 0, y: 0 });
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#E7A93D] hover:bg-[#d6992d] text-[#0E2A45] font-bold text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>매듭 P 임의 위치로 흔들기</span>
              </button>

              <button
                onClick={() => setShowForces(!showForces)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#2C567F] hover:bg-[#1B4468] text-[#9FC0DC] text-xs font-semibold cursor-pointer transition-colors"
              >
                <Weight className="w-3.5 h-3.5" />
                <span>{showForces ? '장력 벡터(붉은 화살표) 숨기기' : '장력 벡터 표시하기'}</span>
              </button>
            </div>

            {/* Math & Physics Principle */}
            <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3 text-xs leading-relaxed">
              <div className="text-[#E7A93D] font-bold font-mono mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>왜 물리적 평형이 수학적 최단 거리일까?</span>
              </div>
              <p className="text-[#9FC0DC] mb-1.5">
                매달린 추들이 아래로 내려갈수록 중력 퍼텐셜 에너지는 낮아집니다.
                추들이 최대로 내려가 멈춘다는 것은, <strong>실의 매듭 P에서 도르래까지의 거리 합 <MathView math="PA+PB+PC" inline />가 최소</strong>가 된다는 뜻입니다!
              </p>
              <div className="p-2 rounded bg-[#1B4468] text-[#6FCF97] font-mono text-[11px]">
                크기가 같은 3개의 벡터 합이 0이 되려면:
                <br />
                <MathView math="\vec{T}_A + \vec{T}_B + \vec{T}_C = \vec{0} \iff \text{각도 } 120^\circ" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
