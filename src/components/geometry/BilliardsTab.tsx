import React, { useState, useRef, useEffect } from 'react';
import { MathView } from '../MathView';
import { Play, RotateCcw, Eye, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const BilliardsTab: React.FC = () => {
  // 당구대 크기 및 좌표 (우측과 하단에 가상의 거울 당구대 및 대칭점이 보이도록 배치)
  const TABLE_LEFT = 40;
  const TABLE_RIGHT = 450;
  const TABLE_TOP = 40;
  const TABLE_BOTTOM = 280;

  // 흰 공 (수구 A), 빨간 공 (목적구 B)
  const [A, setA] = useState<Point>({ x: 120, y: 210 });
  const [B, setB] = useState<Point>({ x: 360, y: 110 });
  const [showReflect, setShowReflect] = useState<boolean>(true);
  const [ballAnimPos, setBallAnimPos] = useState<Point | null>(null);
  const [isShooting, setIsShooting] = useState<boolean>(false);
  const [shotSuccess, setShotSuccess] = useState<boolean>(false);
  const [dragging, setDragging] = useState<'A' | 'B' | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const animRef = useRef<number | null>(null);

  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  // ================= 2단 쿠션 엄밀 기하학 =================
  // 경로: A -> P1 (바닥 벽) -> P2 (우측 벽) -> B
  // 역추적(Backtracking) 기하학:
  // 1단계: 목적구 B를 2차 충돌 벽인 '우측 쿠션(x = TABLE_RIGHT)'에 선대칭 -> B'
  const B_prime: Point = {
    x: 2 * TABLE_RIGHT - B.x,
    y: B.y,
  };

  // 2단계: 가상점 B'을 1차 충돌 벽인 '바닥 쿠션(y = TABLE_BOTTOM)'에 선대칭 -> B''
  const B_double_prime: Point = {
    x: B_prime.x,
    y: 2 * TABLE_BOTTOM - B_prime.y,
  };

  // 3단계: 흰 공 A에서 최종 가상 목표 B''으로 곧바로 그은 직선이
  //        1차 충돌 벽(바닥 쿠션 y = TABLE_BOTTOM)과 만나는 교점이 P1
  const dyDouble = B_double_prime.y - A.y || 1;
  const t1 = (TABLE_BOTTOM - A.y) / dyDouble;
  const P1: Point = {
    x: A.x + t1 * (B_double_prime.x - A.x),
    y: TABLE_BOTTOM,
  };

  // 4단계: P1에서 1차 가상 목표 B'으로 그은 직선이
  //        2차 충돌 벽(우측 쿠션 x = TABLE_RIGHT)과 만나는 교점이 P2
  const dxPrime = B_prime.x - P1.x || 1;
  const t2 = (TABLE_RIGHT - P1.x) / dxPrime;
  const P2: Point = {
    x: TABLE_RIGHT,
    y: P1.y + t2 * (B_prime.y - P1.y),
  };

  // 각 구간 거리
  const distA_P1 = dist(A, P1);
  const distP1_P2 = dist(P1, P2);
  const distP2_B = dist(P2, B);
  const totalBilliardDist = distA_P1 + distP1_P2 + distP2_B;
  const directDoublePrimeDist = dist(A, B_double_prime);

  // 충돌각(입사각/반사각) 계산
  // P1 바닥 쿠션에서의 각도 (쿠션 수평선과의 각도)
  const angleP1_in = Math.atan2(TABLE_BOTTOM - A.y, Math.abs(P1.x - A.x)) * (180 / Math.PI);
  const angleP1_out = Math.atan2(TABLE_BOTTOM - P2.y, Math.abs(P2.x - P1.x)) * (180 / Math.PI);

  // P2 우측 쿠션에서의 각도 (쿠션 수직선과의 각도)
  const angleP2_in = Math.atan2(TABLE_RIGHT - P1.x, Math.abs(P2.y - P1.y)) * (180 / Math.PI);
  const angleP2_out = Math.atan2(TABLE_RIGHT - B.x, Math.abs(B.y - P2.y)) * (180 / Math.PI);

  // 당구공 샷 애니메이션: A -> P1 -> P2 -> B
  const shootBall = () => {
    if (isShooting) return;
    setIsShooting(true);
    setShotSuccess(false);

    const path = [A, P1, P2, B];
    let currentLeg = 0;
    let t = 0;
    const speed = 0.04;

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
    const x = ((e.clientX - rect.left) / rect.width) * 700;
    const y = ((e.clientY - rect.top) / rect.height) * 480;
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
    const clampedX = Math.max(TABLE_LEFT + 25, Math.min(TABLE_RIGHT - 25, pos.x));
    const clampedY = Math.max(TABLE_TOP + 25, Math.min(TABLE_BOTTOM - 25, pos.y));

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
            <strong className="text-[#E7A93D]">선대칭을 2번 연속 적용($B \to B' \to B''$)</strong>하여 곧게 펴는 기하학의 마법을 체험하세요!
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
            viewBox="0 0 700 480"
            className="w-full h-auto select-none touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Virtual Mirror Tables (거울 대칭 가상 공간) */}
            {showReflect && (
              <g opacity={0.35}>
                {/* 1차 우측 대칭 당구대 */}
                <rect
                  x={TABLE_RIGHT}
                  y={TABLE_TOP}
                  width={240}
                  height={TABLE_BOTTOM - TABLE_TOP}
                  fill="#0D2E24"
                  stroke="#8B5A2B"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                {/* 2차 우측+하단 2중 대칭 당구대 */}
                <rect
                  x={TABLE_RIGHT}
                  y={TABLE_BOTTOM}
                  width={240}
                  height={180}
                  fill="#0B261E"
                  stroke="#8B5A2B"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
                {/* 하단 대칭 영역 */}
                <rect
                  x={TABLE_LEFT}
                  y={TABLE_BOTTOM}
                  width={TABLE_RIGHT - TABLE_LEFT}
                  height={180}
                  fill="#0B261E"
                  stroke="#8B5A2B"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
              </g>
            )}

            {/* Billiard Table Felt Surface (실제 당구대) */}
            <rect
              x={TABLE_LEFT}
              y={TABLE_TOP}
              width={TABLE_RIGHT - TABLE_LEFT}
              height={TABLE_BOTTOM - TABLE_TOP}
              fill="#11382B"
              stroke="#8B5A2B"
              strokeWidth={12}
              rx={12}
            />

            {/* Inner Cushion Rails (쿠션 벽 하이라이트) */}
            <line
              x1={TABLE_LEFT}
              y1={TABLE_BOTTOM}
              x2={TABLE_RIGHT}
              y2={TABLE_BOTTOM}
              stroke="#F2B84B"
              strokeWidth={3.5}
            />
            <line
              x1={TABLE_RIGHT}
              y1={TABLE_TOP}
              x2={TABLE_RIGHT}
              y2={TABLE_BOTTOM}
              stroke="#F2B84B"
              strokeWidth={3.5}
            />

            {/* Cushion Wall Labels */}
            <text
              x={(TABLE_LEFT + TABLE_RIGHT) / 2}
              y={TABLE_BOTTOM - 10}
              fill="#F2B84B"
              fontSize={11}
              fontWeight={700}
              fontFamily="Noto Sans KR"
              textAnchor="middle"
            >
              1차 쿠션 (바닥 벽)
            </text>
            <text
              x={TABLE_RIGHT - 10}
              y={(TABLE_TOP + TABLE_BOTTOM) / 2}
              fill="#F2B84B"
              fontSize={11}
              fontWeight={700}
              fontFamily="Noto Sans KR"
              textAnchor="end"
            >
              2차 쿠션 (우측 벽)
            </text>

            {/* 2-Step Reflection Construction Lines (2단계 대칭 작도선) */}
            {showReflect && (
              <g opacity={0.9}>
                {/* Direct line from A to B'' (펼친 일직선 최단 경로!) */}
                <line
                  x1={A.x}
                  y1={A.y}
                  x2={B_double_prime.x}
                  y2={B_double_prime.y}
                  stroke="#E7A93D"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />

                {/* Line from P1 to B' */}
                <line
                  x1={P1.x}
                  y1={P1.y}
                  x2={B_prime.x}
                  y2={B_prime.y}
                  stroke="#6FCF97"
                  strokeWidth={1.8}
                  strokeDasharray="5 3"
                />

                {/* Reflection normal lines: B -> B' across Right Wall */}
                <line
                  x1={B.x}
                  y1={B.y}
                  x2={B_prime.x}
                  y2={B_prime.y}
                  stroke="#7FC4EE"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />

                {/* Reflection normal lines: B' -> B'' across Bottom Wall */}
                <line
                  x1={B_prime.x}
                  y1={B_prime.y}
                  x2={B_double_prime.x}
                  y2={B_double_prime.y}
                  stroke="#7FC4EE"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                />

                {/* Ghost Virtual Ball B' */}
                <circle
                  cx={B_prime.x}
                  cy={B_prime.y}
                  r={10}
                  fill="none"
                  stroke="#6FCF97"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
                <text
                  x={B_prime.x + 14}
                  y={B_prime.y + 4}
                  fill="#6FCF97"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="JetBrains Mono"
                >
                  B' (우측 대칭)
                </text>

                {/* Ghost Virtual Ball B'' */}
                <circle
                  cx={B_double_prime.x}
                  cy={B_double_prime.y}
                  r={11}
                  fill="none"
                  stroke="#E7A93D"
                  strokeWidth={2.5}
                  strokeDasharray="4 3"
                />
                <text
                  x={B_double_prime.x + 14}
                  y={B_double_prime.y + 4}
                  fill="#E7A93D"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="JetBrains Mono"
                >
                  B'' (2중 대칭 조준점)
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
              strokeWidth={3}
            />
            <line
              x1={P1.x}
              y1={P1.y}
              x2={P2.x}
              y2={P2.y}
              stroke="#EAF3FC"
              strokeWidth={3}
            />
            <line
              x1={P2.x}
              y1={P2.y}
              x2={B.x}
              y2={B.y}
              stroke="#EAF3FC"
              strokeWidth={3}
            />

            {/* Cushion Impact Points P1 and P2 */}
            <circle cx={P1.x} cy={P1.y} r={6} fill="#F2B84B" stroke="#0A1A18" strokeWidth={2} />
            <text
              x={P1.x}
              y={P1.y + 18}
              fill="#F2B84B"
              fontSize={11}
              fontWeight={700}
              textAnchor="middle"
            >
              P₁ ({angleP1_in.toFixed(1)}° = {angleP1_out.toFixed(1)}°)
            </text>

            <circle cx={P2.x} cy={P2.y} r={6} fill="#F2B84B" stroke="#0A1A18" strokeWidth={2} />
            <text
              x={P2.x - 12}
              y={P2.y - 10}
              fill="#F2B84B"
              fontSize={11}
              fontWeight={700}
              textAnchor="end"
            >
              P₂ ({angleP2_in.toFixed(1)}° = {angleP2_out.toFixed(1)}°)
            </text>

            {/* Draggable Ball A (White ball) */}
            <g
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown('A', e)}
            >
              <circle
                cx={A.x}
                cy={A.y}
                r={13}
                fill="#FFFFFF"
                stroke="#1A3B34"
                strokeWidth={3}
              />
              <text
                x={A.x}
                y={A.y + 4}
                fill="#111111"
                fontSize={12}
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
                r={13}
                fill="#E8654F"
                stroke="#FFFFFF"
                strokeWidth={2.5}
              />
              <text
                x={B.x}
                y={B.y + 4}
                fill="#FFFFFF"
                fontSize={12}
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
                r={11}
                fill="#FFFFFF"
                stroke="#E7A93D"
                strokeWidth={3.5}
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

              {/* Verified Equality Badge */}
              <div className="mt-2 p-2 rounded bg-[#0E2A45] border border-[#6FCF97]/40 flex items-center gap-2 text-xs text-[#6FCF97]">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  <strong>실제 경로 = 펼친 직선거리:</strong> 두 거리가 완전히 일치합니다!
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={shootBall}
                disabled={isShooting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#E7A93D] to-[#6FCF97] hover:brightness-110 text-[#0E2A45] font-bold text-xs transition-all cursor-pointer shadow-sm"
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
                2번 튕기려면 목표물 <MathView math="B" inline />를 2번 대칭시킨 <MathView math="B''" inline />를 향해 곧바로 조준하면 됩니다!"
              </p>
              <details className="cursor-pointer">
                <summary className="text-[#6FCF97] font-semibold hover:underline select-none">
                  💡 입사각=반사각과 페르마 원리
                </summary>
                <div className="mt-2 p-2.5 rounded bg-[#1B4468] text-[#EAF3FC] space-y-1.5 leading-relaxed text-[11px]">
                  <div>
                    1. <strong>각도 보존</strong>: 1차 쿠션 P₁과 2차 쿠션 P₂에서 모두 입사각과 반사각이 정확히 같습니다.
                  </div>
                  <div>
                    2. <strong>최단 거리</strong>: <MathView math="AP_1 + P_1P_2 + P_2B = AB''" inline />로 전개된 직선이 되므로, 에너지를 가장 적게 들이고 도달하는 자연의 최단 경로입니다.
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
