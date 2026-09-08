import React, { useState, useRef, useEffect } from 'react';
import { MathView } from '../MathView';
import { Play, RotateCcw, Eye, Sparkles, HelpCircle } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const BilliardsTab: React.FC = () => {
  // Table boundaries in SVG coords
  const TABLE_LEFT = 50;
  const TABLE_RIGHT = 550;
  const TABLE_TOP = 40;
  const TABLE_BOTTOM = 380;

  // Ball A (White ball, Cue), Ball B (Red ball, Target)
  const [A, setA] = useState<Point>({ x: 120, y: 280 });
  const [B, setB] = useState<Point>({ x: 420, y: 160 });
  const [showReflect, setShowReflect] = useState<boolean>(true);
  const [ballAnimPos, setBallAnimPos] = useState<Point | null>(null);
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const [shotSuccess, setShotSuccess] = useState<boolean>(false);
  const [dragging, setDragging] = useState<'A' | 'B' | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const animRef = useRef<number | null>(null);

  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  // 2-Cushion reflection: Wall 1 = Bottom wall (y = TABLE_BOTTOM), Wall 2 = Right wall (x = TABLE_RIGHT)
  // Step 1: Reflect Target B across Bottom Wall: B' = (B.x, 2 * TABLE_BOTTOM - B.y)
  const B_prime: Point = {
    x: B.x,
    y: 2 * TABLE_BOTTOM - B.y,
  };

  // Step 2: Reflect B' across Right Wall: B'' = (2 * TABLE_RIGHT - B_prime.x, B_prime.y)
  const B_double_prime: Point = {
    x: 2 * TABLE_RIGHT - B_prime.x,
    y: B_prime.y,
  };

  // Line from A to B'' intersects:
  // 1. Bottom Wall (y = TABLE_BOTTOM) at P1
  // y(t) = A.y + t * (B''.y - A.y) = TABLE_BOTTOM => t1 = (TABLE_BOTTOM - A.y) / (B''.y - A.y)
  const t1 = (TABLE_BOTTOM - A.y) / (B_double_prime.y - A.y || 1);
  const P1: Point = {
    x: A.x + t1 * (B_double_prime.x - A.x),
    y: TABLE_BOTTOM,
  };

  // 2. Line from P1 to B' intersects Right Wall (x = TABLE_RIGHT) at P2
  // x(t) = P1.x + t * (B'.x - P1.x) = TABLE_RIGHT => t2 = (TABLE_RIGHT - P1.x) / (B_prime.x - P1.x)
  const t2 = (TABLE_RIGHT - P1.x) / (B_prime.x - P1.x || 1);
  const P2: Point = {
    x: TABLE_RIGHT,
    y: P1.y + t2 * (B_prime.y - P1.y),
  };

  const distA_P1 = dist(A, P1);
  const distP1_P2 = dist(P1, P2);
  const distP2_B = dist(P2, B);
  const totalBilliardDist = distA_P1 + distP1_P2 + distP2_B;
  const directDoublePrimeDist = dist(A, B_double_prime);

  // Shoot ball animation along path: A -> P1 -> P2 -> B
  const shootBall = () => {
    if (isShooting) return;
    setIsShooting(true);
    setShotSuccess(false);

    const path = [A, P1, P2, B];
    let currentLeg = 0;
    let t = 0;
    const speed = 0.035;

    const animate = () => {
      t += speed;
      if (t >= 1) {
        t = 0;
        currentLeg++;
      }

      if (currentLeg < 3) {
        const pStart = path[currentLeg];
        const pEnd = path[currentLeg + 1];
        setBallAnimPos({
          x: pStart.x + t * (pEnd.x - pStart.x),
          y: pStart.y + t * (pEnd.y - pStart.y),
        });
        animRef.current = requestAnimationFrame(animate);
      } else {
        setBallAnimPos(B);
        setIsShooting(false);
        setShotSuccess(true);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const getPointerPos = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    const y = ((e.clientY - rect.top) / rect.height) * 420;
    return { x, y };
  };

  const handlePointerDown = (id: 'A' | 'B', e: React.PointerEvent) => {
    e.stopPropagation();
    setDragging(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const pos = getPointerPos(e);
    const clampedX = Math.max(TABLE_LEFT + 20, Math.min(TABLE_RIGHT - 40, pos.x));
    const clampedY = Math.max(TABLE_TOP + 20, Math.min(TABLE_BOTTOM - 40, pos.y));

    if (dragging === 'A') setA({ x: clampedX, y: clampedY });
    else if (dragging === 'B') setB({ x: clampedX, y: clampedY });
    setShotSuccess(false);
    setBallAnimPos(null);
  };

  const handlePointerUp = () => setDragging(null);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 border-b border-[#2C567F] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAF3FC]">
            당구대 2단 쿠션 챌린지 (2-Cushion Reflection)
          </h2>
          <p className="text-xs sm:text-sm text-[#9FC0DC] mt-1">
            흰 공(A)으로 바닥 쿠션과 우측 쿠션을 차례로 맞혀 빨간 공(B)을 치는 최단 경로는 어떻게 찾을까요?{' '}
            <strong className="text-[#E7A93D]">선대칭을 2번 연속 적용($B \to B' \to B''$)</strong>하는 기하학의 마법을 체험하세요!
          </p>
        </div>
        {shotSuccess && (
          <span className="mt-2 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6FCF97]/20 border border-[#6FCF97] text-[#6FCF97] text-xs font-bold animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            나이스 샷! 정밀 명중!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#2C567F] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg
            ref={svgRef}
            viewBox="0 0 600 420"
            className="w-full h-auto select-none touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Billiard Table Felt Surface */}
            <rect
              x={TABLE_LEFT}
              y={TABLE_TOP}
              width={TABLE_RIGHT - TABLE_LEFT}
              height={TABLE_BOTTOM - TABLE_TOP}
              fill="#11382B"
              stroke="#8B5A2B"
              strokeWidth={12}
              rx={16}
            />

            {/* Inner Cushion Rails */}
            <line
              x1={TABLE_LEFT}
              y1={TABLE_BOTTOM}
              x2={TABLE_RIGHT}
              y2={TABLE_BOTTOM}
              stroke="#F2B84B"
              strokeWidth={3}
              opacity={0.8}
            />
            <line
              x1={TABLE_RIGHT}
              y1={TABLE_TOP}
              x2={TABLE_RIGHT}
              y2={TABLE_BOTTOM}
              stroke="#F2B84B"
              strokeWidth={3}
              opacity={0.8}
            />

            {/* Cushion Wall Labels */}
            <text
              x={(TABLE_LEFT + TABLE_RIGHT) / 2}
              y={TABLE_BOTTOM - 8}
              fill="#F2B84B"
              fontSize={11}
              fontWeight={700}
              fontFamily="Noto Sans KR"
              textAnchor="middle"
            >
              1차 쿠션 (바닥 벽)
            </text>
            <text
              x={TABLE_RIGHT - 8}
              y={(TABLE_TOP + TABLE_BOTTOM) / 2}
              fill="#F2B84B"
              fontSize={11}
              fontWeight={700}
              fontFamily="Noto Sans KR"
              textAnchor="end"
            >
              2차 쿠션 (우측 벽)
            </text>

            {/* 2-Step Reflection Construction Lines */}
            {showReflect && (
              <g opacity={0.85}>
                {/* Direct line from A to B'' */}
                <line
                  x1={A.x}
                  y1={A.y}
                  x2={B_double_prime.x}
                  y2={B_double_prime.y}
                  stroke="#E7A93D"
                  strokeWidth={1.8}
                  strokeDasharray="5 4"
                />
                {/* Line from P1 to B' */}
                <line
                  x1={P1.x}
                  y1={P1.y}
                  x2={B_prime.x}
                  y2={B_prime.y}
                  stroke="#6FCF97"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                {/* Reflection normal lines */}
                <line
                  x1={B.x}
                  y1={B.y}
                  x2={B_prime.x}
                  y2={B_prime.y}
                  stroke="#9FC0DC"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />
                <line
                  x1={B_prime.x}
                  y1={B_prime.y}
                  x2={B_double_prime.x}
                  y2={B_double_prime.y}
                  stroke="#9FC0DC"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                />

                {/* Ghost Virtual Balls */}
                <circle
                  cx={B_prime.x}
                  cy={B_prime.y}
                  r={8}
                  fill="none"
                  stroke="#E8654F"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                />
                <text
                  x={B_prime.x + 10}
                  y={B_prime.y + 4}
                  fill="#E8654F"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="JetBrains Mono"
                >
                  B' (1차 대칭)
                </text>

                <circle
                  cx={B_double_prime.x}
                  cy={B_double_prime.y}
                  r={9}
                  fill="none"
                  stroke="#E7A93D"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
                <text
                  x={B_double_prime.x - 30}
                  y={B_double_prime.y - 12}
                  fill="#E7A93D"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="JetBrains Mono"
                >
                  B'' (2차 대칭)
                </text>
              </g>
            )}

            {/* Actual Billiard Trajectory: A -> P1 -> P2 -> B */}
            <line
              x1={A.x}
              y1={A.y}
              x2={P1.x}
              y2={P1.y}
              stroke="#EAF3FC"
              strokeWidth={2.5}
            />
            <line
              x1={P1.x}
              y1={P1.y}
              x2={P2.x}
              y2={P2.y}
              stroke="#EAF3FC"
              strokeWidth={2.5}
            />
            <line
              x1={P2.x}
              y1={P2.y}
              x2={B.x}
              y2={B.y}
              stroke="#EAF3FC"
              strokeWidth={2.5}
            />

            {/* Cushion Impact Points P1 and P2 */}
            <circle cx={P1.x} cy={P1.y} r={5} fill="#F2B84B" stroke="#0A1A18" strokeWidth={1.5} />
            <text
              x={P1.x}
              y={P1.y + 16}
              fill="#F2B84B"
              fontSize={10}
              fontWeight={700}
              textAnchor="middle"
            >
              P₁
            </text>

            <circle cx={P2.x} cy={P2.y} r={5} fill="#F2B84B" stroke="#0A1A18" strokeWidth={1.5} />
            <text
              x={P2.x + 14}
              y={P2.y + 3}
              fill="#F2B84B"
              fontSize={10}
              fontWeight={700}
            >
              P₂
            </text>

            {/* Draggable Ball A (White ball) */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('A', e)}
            >
              <circle
                cx={A.x}
                cy={A.y}
                r={12}
                fill="#FFFFFF"
                stroke="#333333"
                strokeWidth={2.5}
              />
              <text
                x={A.x}
                y={A.y + 4}
                fill="#111111"
                fontSize={11}
                fontWeight={800}
                textAnchor="middle"
                pointerEvents="none"
              >
                A
              </text>
            </g>

            {/* Draggable Ball B (Target Red ball) */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('B', e)}
            >
              <circle
                cx={B.x}
                cy={B.y}
                r={12}
                fill="#E8654F"
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <text
                x={B.x}
                y={B.y + 4}
                fill="#FFFFFF"
                fontSize={11}
                fontWeight={800}
                textAnchor="middle"
                pointerEvents="none"
              >
                B
              </text>
            </g>

            {/* Animated Moving Cue Ball */}
            {ballAnimPos && (
              <circle
                cx={ballAnimPos.x}
                cy={ballAnimPos.y}
                r={10}
                fill="#FFFFFF"
                stroke="#E7A93D"
                strokeWidth={3}
              />
            )}
          </svg>
        </div>

        {/* Sidebar Controls & Mathematical Verification */}
        <div className="bg-[#153A5C] border border-[#2C567F] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-[#E7A93D] font-bold uppercase tracking-wider mb-2">
              2단 쿠션 궤적 수학 분석
            </div>

            <div className="space-y-2 border-b border-[#2C567F] pb-3 mb-4 text-sm">
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">1구간 A → P₁</span>
                <b className="font-mono text-base text-[#EAF3FC]">{distA_P1.toFixed(1)}</b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">2구간 P₁ → P₂</span>
                <b className="font-mono text-base text-[#EAF3FC]">{distP1_P2.toFixed(1)}</b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">3구간 P₂ → B</span>
                <b className="font-mono text-base text-[#EAF3FC]">{distP2_B.toFixed(1)}</b>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-dashed border-[#2C567F]">
                <span className="text-[#EAF3FC] font-semibold">실제 총 이동 거리</span>
                <b className="font-mono text-lg text-[#6FCF97]">
                  {totalBilliardDist.toFixed(1)}
                </b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#E7A93D] font-semibold">2중 대칭 직선거리(AB'')</span>
                <b className="font-mono text-lg text-[#E7A93D]">
                  {directDoublePrimeDist.toFixed(1)}
                </b>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={shootBall}
                disabled={isShooting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#E7A93D] hover:bg-[#d6992d] text-[#0E2A45] font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>당구 샷 발사하기! (2단 쿠션 명중)</span>
              </button>

              <button
                onClick={() => setShowReflect(!showReflect)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#2C567F] hover:bg-[#1B4468] text-[#9FC0DC] text-xs font-semibold cursor-pointer transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showReflect ? "2중 대칭선 B', B'' 숨기기" : "2중 대칭 작도선 보기"}</span>
              </button>
            </div>

            {/* Q&A & Math Principles */}
            <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3.5 text-xs">
              <div className="flex items-center gap-1.5 text-[#E7A93D] font-bold font-mono mb-1">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>선대칭 2회 연속의 기하학적 원리</span>
              </div>
              <p className="text-[#9FC0DC] leading-relaxed mb-2">
                "벽을 튕길 때마다 거울에 비친 가상의 상(Image)을 만듭니다.
                벽 2개를 튕기면 목표물 <MathView math="B" inline />를 2번 대칭 이동시킨 가상의 목표 <MathView math="B''" inline />를 향해
                직선으로 쏘면 됩니다!"
              </p>
              <details className="cursor-pointer">
                <summary className="text-[#6FCF97] font-semibold hover:underline select-none">
                  💡 빛의 반사와 페르마 원리
                </summary>
                <div className="mt-2 p-2.5 rounded bg-[#1B4468] text-[#EAF3FC] space-y-1 leading-relaxed">
                  <div>
                    1. <strong>입사각 = 반사각</strong>: 쿠션에서 튕겨 나갈 때의 각도는 들어올 때의 각도와 같습니다.
                  </div>
                  <div>
                    2. 이것은 빛이 최소 시간으로 이동하는 '페르마의 최소 시간 원리'와 동일하며,
                    기하학적으로는 <MathView math="AP_1 + P_1P_2 + P_2B = AB''" inline />로 전개된 직선이 되기 때문에 완벽한 최단 경로가 됩니다!
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
