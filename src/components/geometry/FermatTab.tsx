import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MathView } from '../MathView';
import { Compass, Sparkles, AlertCircle, RotateCcw, ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export const FermatTab: React.FC = () => {
  // 여유 있는 좌표 설정: 외접 정삼각형이 화면 밖으로 잘리지 않도록 배치
  const [A, setA] = useState<Point>({ x: 200, y: 350 });
  const [B, setB] = useState<Point>({ x: 430, y: 350 });
  const [C, setC] = useState<Point>({ x: 310, y: 140 });
  const [P, setP] = useState<Point>({ x: 310, y: 280 });
  const [bestSum, setBestSum] = useState<number | null>(null);
  const [dragging, setDragging] = useState<'A' | 'B' | 'C' | 'P' | 'PAN' | null>(null);
  const [showConstruction, setShowConstruction] = useState(true);

  // 화면 줌 & 팬 (확대/축소 및 이동) 상태
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const panStartRef = useRef<Point>({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
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

  // 삼각형 바깥 방향으로 외접 정삼각형의 꼭짓점 작도
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
    const aA = angleAt(A, B, C);
    const aB = angleAt(B, A, C);
    const aC = angleAt(C, A, B);
    const maxA = Math.max(aA, aB, aC);

    // 120도 이상인 둔각이 있으면 해당 꼭짓점이 최단 거리점(페르마점)
    if (maxA >= 120) {
      if (aA === maxA) return A;
      if (aB === maxA) return B;
      return C;
    }

    const apAB = apexOutward(A, B, C);
    const apBC = apexOutward(B, C, A);
    const inter = lineIntersect(C, apAB, A, apBC);
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

  // 외접 정삼각형의 꼭짓점 3개
  const apexAB = apexOutward(A, B, C);
  const apexBC = apexOutward(B, C, A);
  const apexCA = apexOutward(C, A, B);

  const angleA = angleAt(A, B, C);
  const angleB = angleAt(B, A, C);
  const angleC = angleAt(C, A, B);
  const maxAngle = Math.max(angleA, angleB, angleC);
  const isObtuse120 = maxAngle >= 120;

  // P에서의 세 사잇각
  const angleAPB = angleAt(P, A, B);
  const angleBPC = angleAt(P, B, C);
  const angleCPA = angleAt(P, C, A);

  const isNearFermat = Math.abs(currentSum - trueMin) < 1.5;

  // 페르마 점으로 부드럽게 자동 이동
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
      const t = 1 - Math.pow(1 - progress, 3); // easeOutCubic
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

  // SVG 로컬 좌표 변환 함수 (CTM 행렬 역변환으로 줌/팬 상관없이 정확)
  const getLocalPos = useCallback((e: React.PointerEvent) => {
    if (!gRef.current || !svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = gRef.current.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const transformed = pt.matrixTransform(ctm.inverse());
    return { x: transformed.x, y: transformed.y };
  }, []);

  // 화면 자동 맞춤 (Auto-Fit): 삼각형과 외접 정삼각형 전체를 화면 안에 꼭 맞게 배치
  const handleFitToScreen = () => {
    const pts = [A, B, C, P];
    if (showConstruction) {
      pts.push(apexAB, apexBC, apexCA);
    }
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));

    const bboxWidth = maxX - minX;
    const bboxHeight = maxY - minY;
    const bboxCenterX = (minX + maxX) / 2;
    const bboxCenterY = (minY + maxY) / 2;

    const canvasWidth = 640;
    const canvasHeight = 560;
    const padding = 60;

    const scaleX = (canvasWidth - padding * 2) / (bboxWidth || 1);
    const scaleY = (canvasHeight - padding * 2) / (bboxHeight || 1);
    const newZoom = Math.min(1.4, Math.max(0.5, Math.min(scaleX, scaleY)));

    // 캔버스 중심 (320, 280)으로 이동
    const newPanX = 320 - bboxCenterX * newZoom;
    const newPanY = 280 - bboxCenterY * newZoom;

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // 줌 인/아웃 핸들러
  const handleZoom = (factor: number) => {
    setZoom((prevZoom) => {
      const nextZoom = Math.min(2.5, Math.max(0.4, prevZoom * factor));
      // 중심점 기준 스케일링
      const centerX = 320;
      const centerY = 280;
      setPan((prevPan) => ({
        x: centerX - (centerX - prevPan.x) * (nextZoom / prevZoom),
        y: centerY - (centerY - prevPan.y) * (nextZoom / prevZoom),
      }));
      return nextZoom;
    });
  };

  // 줌 및 위치 초기화 (1:1 기본 뷰)
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // 마우스 휠로 확대/축소
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prevZoom) => {
      const nextZoom = Math.min(2.5, Math.max(0.4, prevZoom * factor));
      if (!svgRef.current) return nextZoom;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setPan((prevPan) => ({
        x: mouseX - (mouseX - prevPan.x) * (nextZoom / prevZoom),
        y: mouseY - (mouseY - prevPan.y) * (nextZoom / prevZoom),
      }));
      return nextZoom;
    });
  };

  // 마우스 드래그 시작
  const handlePointerDown = (id: 'A' | 'B' | 'C' | 'P', e: React.PointerEvent) => {
    e.stopPropagation();
    setDragging(id);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  // 캔버스 빈 공간 클릭 시 화면 패닝(이동) 시작
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (dragging) return;
    setDragging('PAN');
    panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;

    if (dragging === 'PAN') {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const pos = getLocalPos(e);
    if (dragging === 'A') setA({ x: pos.x, y: pos.y });
    else if (dragging === 'B') setB({ x: pos.x, y: pos.y });
    else if (dragging === 'C') setC({ x: pos.x, y: pos.y });
    else if (dragging === 'P') setP({ x: pos.x, y: pos.y });
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
            세 마을 A, B, C를 연결할 때{' '}
            <strong className="text-[#E7A93D]">총 거리(PA + PB + PC)가 최소가 되는 점 P</strong>를 찾습니다.
            (화면 확대/축소 및 마우스 휠 지원)
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
        {/* SVG Interactive Canvas Container */}
        <div className="lg:col-span-2 bg-[#0E2A45] border border-[#2C567F] rounded-xl p-2 relative overflow-hidden shadow-inner flex flex-col justify-between">
          
          {/* Floating Zoom & View Controls Overlay */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-[#0B2138]/90 backdrop-blur-sm border border-[#2C567F] p-1.5 rounded-lg shadow-lg flex-wrap">
            <button
              onClick={() => handleZoom(1.15)}
              title="확대 (Zoom In)"
              className="p-1.5 rounded hover:bg-[#1B4468] text-[#EAF3FC] hover:text-[#E7A93D] transition-colors cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#153A5C]/60 rounded border border-[#2C567F]/70">
              <input
                type="range"
                min="0.4"
                max="2.2"
                step="0.05"
                value={zoom}
                onChange={(e) => {
                  const nextZoom = parseFloat(e.target.value);
                  const centerX = 320;
                  const centerY = 280;
                  setPan((prevPan) => ({
                    x: centerX - (centerX - prevPan.x) * (nextZoom / (zoom || 1)),
                    y: centerY - (centerY - prevPan.y) * (nextZoom / (zoom || 1)),
                  }));
                  setZoom(nextZoom);
                }}
                className="w-16 sm:w-24 accent-[#E7A93D] cursor-pointer"
              />
              <span className="font-mono text-[#E7A93D] font-bold text-xs w-10 text-center">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <button
              onClick={() => handleZoom(0.87)}
              title="축소 (Zoom Out)"
              className="p-1.5 rounded hover:bg-[#1B4468] text-[#EAF3FC] hover:text-[#E7A93D] transition-colors cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-[#2C567F] mx-0.5" />
            <button
              onClick={handleFitToScreen}
              title="화면에 맞추기 (Auto-Fit)"
              className="flex items-center gap-1 px-2 py-1 rounded bg-[#6FCF97]/15 hover:bg-[#6FCF97]/25 text-[#6FCF97] border border-[#6FCF97]/40 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">화면 맞춤</span>
            </button>
            <button
              onClick={handleResetView}
              title="원래 크기 100% 리셋"
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1B4468] text-[#9FC0DC] text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">리셋</span>
            </button>
          </div>

          {/* Canvas Guide Pill */}
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-1.5 bg-[#0B2138]/85 backdrop-blur-sm border border-[#2C567F]/60 px-2.5 py-1 rounded-full text-[11px] text-[#9FC0DC]">
            <Move className="w-3 h-3 text-[#E7A93D]" />
            <span>빈 공간 드래그: 화면 이동 | 휠: 확대/축소</span>
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 640 560"
            className={`w-full h-auto select-none touch-none ${
              dragging === 'PAN' ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onWheel={handleWheel}
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* Background Grid for Spatial Orientation */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1B4468" strokeWidth="0.5" strokeOpacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Transform Layer for Smooth Zoom & Pan */}
            <g
              ref={gRef}
              transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
            >
              {/* Construction details if active */}
              {showConstruction && (
                <g opacity={0.9}>
                  {/* 3 Outward equilateral triangles with soft fill */}
                  <polygon
                    points={`${A.x},${A.y} ${B.x},${B.y} ${apexAB.x},${apexAB.y}`}
                    fill="#6FCF97"
                    fillOpacity={0.12}
                    stroke="#6FCF97"
                    strokeWidth={1.8}
                    strokeDasharray="5 4"
                  />
                  <polygon
                    points={`${B.x},${B.y} ${C.x},${C.y} ${apexBC.x},${apexBC.y}`}
                    fill="#6FCF97"
                    fillOpacity={0.12}
                    stroke="#6FCF97"
                    strokeWidth={1.8}
                    strokeDasharray="5 4"
                  />
                  <polygon
                    points={`${C.x},${C.y} ${A.x},${A.y} ${apexCA.x},${apexCA.y}`}
                    fill="#6FCF97"
                    fillOpacity={0.12}
                    stroke="#6FCF97"
                    strokeWidth={1.8}
                    strokeDasharray="5 4"
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

                  {/* External Equilateral Apex Nodes */}
                  <circle cx={apexAB.x} cy={apexAB.y} r={4.5} fill="#6FCF97" />
                  <circle cx={apexBC.x} cy={apexBC.y} r={4.5} fill="#6FCF97" />
                  <circle cx={apexCA.x} cy={apexCA.y} r={4.5} fill="#6FCF97" />
                </g>
              )}

              {/* Triangle ABC body */}
              <polygon
                points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                fill="#1B4468"
                fillOpacity={0.65}
                stroke="#7FC4EE"
                strokeWidth={2.5}
              />

              {/* Road lines from P to A, B, C */}
              <line
                x1={A.x}
                y1={A.y}
                x2={P.x}
                y2={P.y}
                stroke="#E8654F"
                strokeWidth={2.8}
              />
              <line
                x1={B.x}
                y1={B.y}
                x2={P.x}
                y2={P.y}
                stroke="#E8654F"
                strokeWidth={2.8}
              />
              <line
                x1={C.x}
                y1={C.y}
                x2={P.x}
                y2={P.y}
                stroke="#E8654F"
                strokeWidth={2.8}
              />

              {/* Angle labels at P */}
              {isNearFermat && !isObtuse120 && (
                <g fontSize={11} fill="#6FCF97" fontWeight={700} fontFamily="JetBrains Mono">
                  <text x={P.x + 12} y={P.y - 12}>
                    ∠APB: {Math.round(angleAPB)}°
                  </text>
                  <text x={P.x + 12} y={P.y + 16}>
                    ∠BPC: {Math.round(angleBPC)}°
                  </text>
                  <text x={P.x - 76} y={P.y + 4}>
                    ∠CPA: {Math.round(angleCPA)}°
                  </text>
                </g>
              )}

              {/* Vertices A, B, C */}
              <g
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => handlePointerDown('A', e)}
              >
                <circle cx={A.x} cy={A.y} r={11} fill="#E7A93D" stroke="#0E2A45" strokeWidth={2.5} />
                <text x={A.x - 7} y={A.y - 15} fill="#EAF3FC" fontSize={15} fontWeight={700}>
                  A
                </text>
              </g>

              <g
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => handlePointerDown('B', e)}
              >
                <circle cx={B.x} cy={B.y} r={11} fill="#E7A93D" stroke="#0E2A45" strokeWidth={2.5} />
                <text x={B.x + 12} y={B.y + 16} fill="#EAF3FC" fontSize={15} fontWeight={700}>
                  B
                </text>
              </g>

              <g
                className="cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => handlePointerDown('C', e)}
              >
                <circle cx={C.x} cy={C.y} r={11} fill="#E7A93D" stroke="#0E2A45" strokeWidth={2.5} />
                <text x={C.x - 6} y={C.y - 15} fill="#EAF3FC" fontSize={15} fontWeight={700}>
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
                  r={13}
                  fill={isNearFermat ? '#6FCF97' : '#EAF3FC'}
                  stroke="#0E2A45"
                  strokeWidth={2.5}
                />
                <text
                  x={P.x + 16}
                  y={P.y + 4}
                  fill={isNearFermat ? '#6FCF97' : '#EAF3FC'}
                  fontSize={13}
                  fontWeight={700}
                  fontFamily="Noto Sans KR"
                >
                  P (중심점)
                </text>
              </g>
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
              <div className="flex justify-between items-baseline text-xs text-[#9FC0DC] pt-1">
                <span>이론상 최솟값</span>
                <b className="font-mono text-[#6FCF97]">{trueMin.toFixed(1)}</b>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              <button
                onClick={animateToFermat}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-gradient-to-r from-[#E7A93D] to-[#6FCF97] hover:brightness-110 text-[#0E2A45] font-bold text-xs transition-all cursor-pointer shadow-sm"
              >
                <Compass className="w-4 h-4" />
                <span>정삼각형 작도로 실제 페르마점 찾기</span>
              </button>

              <button
                onClick={() => setShowConstruction(!showConstruction)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#2C567F] hover:bg-[#1B4468] text-[#9FC0DC] text-xs font-semibold cursor-pointer transition-colors"
              >
                <span>{showConstruction ? '외접 정삼각형 작도선 숨기기' : '외접 정삼각형 작도선 보기'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setA({ x: 200, y: 350 });
                    setB({ x: 430, y: 350 });
                    setC({ x: 310, y: 140 });
                    setP({ x: 310, y: 280 });
                    setBestSum(null);
                    setShowConstruction(true);
                    handleResetView();
                  }}
                  className="py-1.5 px-2 rounded-lg border border-[#2C567F] hover:bg-[#1B4468] text-[#9FC0DC] text-xs font-semibold text-center cursor-pointer transition-colors"
                >
                  예각 삼각형
                </button>
                <button
                  onClick={() => {
                    setA({ x: 200, y: 350 });
                    setB({ x: 450, y: 350 });
                    setC({ x: 410, y: 190 });
                    setP({ x: 370, y: 280 });
                    setBestSum(null);
                    setShowConstruction(true);
                    handleResetView();
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
                  <summary className="text-[#6FCF97] font-semibold hover:underline select-none">
                    💡 벡터 평형 증명 펼치기
                  </summary>
                  <div className="mt-1.5 p-2 rounded bg-[#1B4468] text-[#EAF3FC] space-y-1 leading-relaxed text-[11px]">
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
