import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MathView } from '../MathView';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Lightbulb,
  Sparkles,
  Eye,
  EyeOff,
  Droplets,
  Route,
  TriangleAlert,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface FermatInteractiveVisualizerProps {
  externalAnsOpen?: boolean;
}

export const FermatInteractiveVisualizer: React.FC<FermatInteractiveVisualizerProps> = ({
  externalAnsOpen,
}) => {
  // Triangle vertices on 640 x 520 coordinate plane
  const [A, setA] = useState<Point>({ x: 320, y: 130 });
  const [B, setB] = useState<Point>({ x: 200, y: 360 });
  const [C, setC] = useState<Point>({ x: 440, y: 360 });

  // Test point P (can be freely dragged or auto-tracked)
  const [P, setP] = useState<Point>({ x: 320, y: 290 });
  const [autoTrack, setAutoTrack] = useState<boolean>(true);
  const [showConstruction, setShowConstruction] = useState<boolean>(true);
  const [ansOpen, setAnsOpen] = useState<boolean>(false);

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<'A' | 'B' | 'C' | 'P' | 'PAN' | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const initialPanRef = useRef<Point>({ x: 0, y: 0 });
  const animRef = useRef<number | null>(null);

  // Sync with external answer toggle
  useEffect(() => {
    if (externalAnsOpen !== undefined) {
      setAnsOpen(externalAnsOpen);
    }
  }, [externalAnsOpen]);

  // Math Helpers
  const dist = useCallback((p1: Point, p2: Point) => Math.hypot(p1.x - p2.x, p1.y - p2.y), []);

  const rotate = useCallback((pt: Point, center: Point, deg: number): Point => {
    const rad = (deg * Math.PI) / 180;
    const dx = pt.x - center.x;
    const dy = pt.y - center.y;
    return {
      x: center.x + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: center.y + dx * Math.sin(rad) + dy * Math.cos(rad),
    };
  }, []);

  // External Equilateral Apex outward
  const getApexOutward = useCallback(
    (p1: Point, p2: Point, p3: Point): Point => {
      const cand1 = rotate(p2, p1, 60);
      const cand2 = rotate(p2, p1, -60);
      const d1 = dist(cand1, p3);
      const d2 = dist(cand2, p3);
      return d1 > d2 ? cand1 : cand2;
    },
    [dist, rotate]
  );

  const getAngleDeg = useCallback((vertex: Point, p1: Point, p2: Point): number => {
    const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
    const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
    if (mag < 1e-6) return 0;
    return (Math.acos(Math.max(-1, Math.min(1, dot / mag))) * 180) / Math.PI;
  }, []);

  const lineIntersect = useCallback(
    (p1: Point, p2: Point, p3: Point, p4: Point): Point | null => {
      const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
      if (Math.abs(denom) < 1e-6) return null;
      const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
      return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
    },
    []
  );

  // Compute exact Fermat Point
  const computeFermat = useCallback(
    (pA: Point, pB: Point, pC: Point): { pt: Point; isObtuse: boolean; obtuseVertex: 'A' | 'B' | 'C' | null } => {
      const aA = getAngleDeg(pA, pB, pC);
      const aB = getAngleDeg(pB, pA, pC);
      const aC = getAngleDeg(pC, pA, pB);
      const maxA = Math.max(aA, aB, aC);

      if (maxA >= 120) {
        if (aA === maxA) return { pt: pA, isObtuse: true, obtuseVertex: 'A' };
        if (aB === maxA) return { pt: pB, isObtuse: true, obtuseVertex: 'B' };
        return { pt: pC, isObtuse: true, obtuseVertex: 'C' };
      }

      // Torricelli intersection of external equilateral triangles
      const apexBC = getApexOutward(pB, pC, pA);
      const apexCA = getApexOutward(pC, pA, pB);
      const inter = lineIntersect(pA, apexBC, pB, apexCA);

      return {
        pt: inter || { x: (pA.x + pB.x + pC.x) / 3, y: (pA.y + pB.y + pC.y) / 3 },
        isObtuse: false,
        obtuseVertex: null,
      };
    },
    [getAngleDeg, getApexOutward, lineIntersect]
  );

  const fermatResult = useMemo(() => computeFermat(A, B, C), [A, B, C, computeFermat]);
  const fermatPt = fermatResult.pt;
  const isObtuse120 = fermatResult.isObtuse;
  const obtuseVertex = fermatResult.obtuseVertex;

  // Keep P at Fermat point if autoTrack is true
  useEffect(() => {
    if (autoTrack) {
      setP(fermatPt);
    }
  }, [fermatPt, autoTrack]);

  // Triangle angles
  const angA = useMemo(() => getAngleDeg(A, B, C), [A, B, C, getAngleDeg]);
  const angB = useMemo(() => getAngleDeg(B, A, C), [A, B, C, getAngleDeg]);
  const angC = useMemo(() => getAngleDeg(C, A, B), [A, B, C, getAngleDeg]);
  const maxTriangleAngle = Math.max(angA, angB, angC);

  // Outward Apexes
  const apexBC = useMemo(() => getApexOutward(B, C, A), [B, C, A, getApexOutward]); // A'
  const apexCA = useMemo(() => getApexOutward(C, A, B), [C, A, B, getApexOutward]); // B'
  const apexAB = useMemo(() => getApexOutward(A, B, C), [A, B, C, getApexOutward]); // C'

  // Distance Sums
  const distPA = dist(P, A);
  const distPB = dist(P, B);
  const distPC = dist(P, C);
  const currentSum = distPA + distPB + distPC;

  const minSum = dist(fermatPt, A) + dist(fermatPt, B) + dist(fermatPt, C);
  const isNearFermat = Math.abs(currentSum - minSum) < 1.8;

  // Angles around P
  const angAPB = useMemo(() => getAngleDeg(P, A, B), [P, A, B, getAngleDeg]);
  const angBPC = useMemo(() => getAngleDeg(P, B, C), [P, B, C, getAngleDeg]);
  const angCPA = useMemo(() => getAngleDeg(P, C, A), [P, C, A, getAngleDeg]);

  // SVG coordinate transformation
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

  // Smooth Snap Animation to Fermat Point
  const snapToFermat = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const start = { ...P };
    const target = fermatPt;
    let frame = 0;
    const totalFrames = 26;

    const step = () => {
      frame++;
      const progress = frame / totalFrames;
      const ease = 1 - Math.pow(1 - progress, 3);
      setP({
        x: start.x + (target.x - start.x) * ease,
        y: start.y + (target.y - start.y) * ease,
      });
      if (frame < totalFrames) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setAutoTrack(true);
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, [P, fermatPt]);

  // Pointer event handlers
  const handlePointerDown = (type: 'A' | 'B' | 'C' | 'P', e: React.PointerEvent) => {
    e.stopPropagation();
    setDragging(type);
    if (type === 'P') {
      setAutoTrack(false);
    }
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName === 'circle') return;
    setDragging('PAN');
    panStartRef.current = { x: e.clientX, y: e.clientY };
    initialPanRef.current = { ...pan };
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    if (dragging === 'PAN') {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: initialPanRef.current.x + dx,
        y: initialPanRef.current.y + dy,
      });
      return;
    }

    const pos = getLocalPos(e);
    // Boundary clamp inside 640 x 520
    const clampedX = Math.max(30, Math.min(610, pos.x));
    const clampedY = Math.max(30, Math.min(490, pos.y));

    if (dragging === 'A') setA({ x: clampedX, y: clampedY });
    else if (dragging === 'B') setB({ x: clampedX, y: clampedY });
    else if (dragging === 'C') setC({ x: clampedX, y: clampedY });
    else if (dragging === 'P') setP({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDragging(null);
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Preset triangles
  const applyPreset = (preset: 'acute' | 'equilateral' | 'right' | 'obtuse') => {
    if (preset === 'acute') {
      setA({ x: 320, y: 130 });
      setB({ x: 200, y: 360 });
      setC({ x: 440, y: 360 });
    } else if (preset === 'equilateral') {
      const cx = 320;
      const cy = 260;
      const r = 140;
      setA({ x: cx, y: cy - r });
      setB({ x: cx - r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6) });
      setC({ x: cx + r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6) });
    } else if (preset === 'right') {
      setA({ x: 220, y: 140 });
      setB({ x: 220, y: 360 });
      setC({ x: 460, y: 360 });
    } else if (preset === 'obtuse') {
      setA({ x: 320, y: 280 });
      setB({ x: 170, y: 210 });
      setC({ x: 470, y: 210 });
    }
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setAutoTrack(true);
  };

  // Angle slider for Angle A
  const handleAngleASlider = (targetDeg: number) => {
    const baseLen = dist(B, C) || 240;
    const midX = (B.x + C.x) / 2;
    const midY = (B.y + C.y) / 2;
    const baseAngle = Math.atan2(C.y - B.y, C.x - B.x);
    const normAngle = baseAngle - Math.PI / 2;
    const halfRad = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, (targetDeg * Math.PI) / 360));
    const h = (baseLen / 2) / Math.tan(halfRad);
    const newAx = midX + h * Math.cos(normAngle);
    const newAy = midY + h * Math.sin(normAngle);
    setA({ x: Math.round(newAx), y: Math.round(newAy) });
  };

  // Auto-fit to screen
  const handleFitToScreen = () => {
    const pts = [A, B, C, P];
    if (showConstruction) {
      pts.push(apexBC, apexCA, apexAB);
    }
    const minX = Math.min(...pts.map((p) => p.x));
    const maxX = Math.max(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxY = Math.max(...pts.map((p) => p.y));

    const bboxW = Math.max(1, maxX - minX);
    const bboxH = Math.max(1, maxY - minY);
    const bboxCx = (minX + maxX) / 2;
    const bboxCy = (minY + maxY) / 2;

    const pad = 50;
    const availW = 640 - pad * 2;
    const availH = 520 - pad * 2;
    const fitZoom = Math.min(1.4, Math.max(0.55, Math.min(availW / bboxW, availH / bboxH)));

    const newPanX = 320 - bboxCx * fitZoom;
    const newPanY = 260 - bboxCy * fitZoom;

    setZoom(Number(fitZoom.toFixed(2)));
    setPan({ x: Math.round(newPanX), y: Math.round(newPanY) });
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold">
              2
            </span>
            <span>페르마 점 (Fermat Point) 인터랙티브 작도기</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            세 마을 <MathView tex="A, B, C" />를 잇는 도로망 총합(<MathView tex="PA + PB + PC" />)을 최소화하는 최적 연결점 <MathView tex="P" />를 탐구합니다.
          </p>
        </div>

        <button
          onClick={() => setAnsOpen(!ansOpen)}
          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg border border-indigo-200 transition flex items-center gap-1 cursor-pointer"
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>{ansOpen ? '120° 정답 접기' : '120° 이상 정답 & 해설'}</span>
        </button>
      </div>

      {/* Main Workbench Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 7 Cols: Interactive SVG Canvas & Tools */}
        <div className="lg:col-span-7 bg-slate-50/70 rounded-xl p-3 sm:p-4 border border-slate-200 flex flex-col space-y-3">
          {/* Controls Bar 1: Zoom, View, Construction, Presets */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
            {/* Row 1: Zoom Slider & Auto-Fit */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-700">배율:</span>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-16 sm:w-24 accent-indigo-600 cursor-pointer"
                  />
                  <button
                    onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(2))))}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                  >
                    +
                  </button>
                  <span className="font-mono text-indigo-600 font-bold w-10 text-center text-[11px]">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleFitToScreen}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold rounded-lg transition cursor-pointer flex items-center gap-1 text-[11px]"
                  title="작도 요소 전체를 화면 중앙에 꽉 차게 맞춥니다"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>화면 맞춤</span>
                </button>

                <button
                  onClick={() => {
                    setZoom(1.0);
                    setPan({ x: 0, y: 0 });
                  }}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition cursor-pointer text-[11px]"
                  title="100% 기본 화면 리셋"
                >
                  100%
                </button>

                <button
                  onClick={() => setShowConstruction(!showConstruction)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1 border text-[11px] ${
                    showConstruction
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                  title="외접 정삼각형 작도선 표시/숨김"
                >
                  {showConstruction ? <Eye className="w-3.5 h-3.5 text-indigo-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>외접 정삼각형</span>
                </button>

                <button
                  onClick={() => applyPreset('acute')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-medium transition cursor-pointer flex items-center gap-1 text-[11px]"
                  title="초기 위치 복귀"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>위치 리셋</span>
                </button>
              </div>
            </div>

            {/* Row 2: Presets & Auto Track Toggle */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-500 font-medium mr-1 text-[11px]">모양 프리셋:</span>
                <button
                  onClick={() => applyPreset('acute')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md text-slate-700 font-medium transition cursor-pointer text-[11px]"
                >
                  📐 예각 (기본)
                </button>
                <button
                  onClick={() => applyPreset('equilateral')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md text-slate-700 font-medium transition cursor-pointer text-[11px]"
                >
                  🔺 정삼각형
                </button>
                <button
                  onClick={() => applyPreset('right')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-md text-slate-700 font-medium transition cursor-pointer text-[11px]"
                >
                  📐 직각 (3:4:5)
                </button>
                <button
                  onClick={() => applyPreset('obtuse')}
                  className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md font-medium transition cursor-pointer text-[11px]"
                >
                  ⚠️ 둔각 (≥120°)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={snapToFermat}
                  className="px-2.5 py-1 rounded-md bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                  <span>페르마 최적점으로 스냅</span>
                </button>
              </div>
            </div>

            {/* Row 3: Live Angle A Drag Slider */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap bg-indigo-50/50 -mx-2.5 -mb-2 px-2.5 py-1.5 rounded-b-lg">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-indigo-900 flex items-center gap-1 text-[11px]">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>내각 ∠A 슬라이더:</span>
                </span>
                <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-mono">35°</span>
                  <input
                    type="range"
                    min="35"
                    max="145"
                    step="1"
                    value={Math.round(angA)}
                    onChange={(e) => handleAngleASlider(Number(e.target.value))}
                    className="w-20 sm:w-28 accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">145°</span>
                  <span
                    className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10.5px] ${
                      angA >= 120
                        ? 'bg-rose-100 text-rose-700 border border-rose-300 font-bold'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}
                  >
                    ∠A: {Math.round(angA)}°{angA >= 120 ? ' ⚠️(≥120°)' : ''}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="text-[11px] font-medium">
                {maxTriangleAngle >= 120 ? (
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <TriangleAlert className="w-3 h-3" />
                    <span>둔각 ≥120° 꼭짓점이 페르마점!</span>
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>내부 120° 균형점 형성</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Responsive Vector SVG Canvas */}
          <div className="w-full bg-white rounded-xl border border-slate-200 relative overflow-hidden shadow-inner aspect-[640/520]">
            {/* Guide overlay badge */}
            <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none bg-white/90 backdrop-blur-xs border border-slate-200 px-2.5 py-1 rounded-md text-[11px] text-slate-500 shadow-xs flex items-center gap-1.5">
              <Move className="w-3 h-3 text-indigo-600" />
              <span>
                <strong>A, B, C</strong> 및 <strong>P(빨강)</strong> 드래그 조작 | 배경 드래그: 화면 이동
              </span>
            </div>

            {/* Live Distance Meter in Top Right */}
            <div className="absolute top-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-xs border border-slate-200 p-2 rounded-xl text-[11px] shadow-sm space-y-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500 font-medium">현재 거리 합:</span>
                <span className="font-mono font-bold text-slate-900 text-xs">{currentSum.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500 font-medium">이론상 최솟값:</span>
                <span className="font-mono font-bold text-emerald-600 text-xs">{minSum.toFixed(1)}</span>
              </div>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">최적 상태:</span>
                {isNearFermat ? (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ✓ 최적 달성!
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                    +{(currentSum - minSum).toFixed(1)} 차이
                  </span>
                )}
              </div>
            </div>

            <svg
              ref={svgRef}
              viewBox="0 0 640 520"
              className={`w-full h-full select-none touch-none ${
                dragging === 'PAN' ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {/* Draft Grid pattern */}
              <defs>
                <pattern id="wfGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#wfGrid)" />

              <g
                ref={gRef}
                transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                transform-origin="320 260"
              >
                {/* 1. External Equilateral Triangles (Torricelli Construction) */}
                {showConstruction && (
                  <g className="transition-opacity duration-200">
                    {/* Triangle on BC -> apex A' */}
                    <polygon
                      points={`${B.x},${B.y} ${apexBC.x},${apexBC.y} ${C.x},${C.y}`}
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    {/* Triangle on CA -> apex B' */}
                    <polygon
                      points={`${C.x},${C.y} ${apexCA.x},${apexCA.y} ${A.x},${A.y}`}
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    {/* Triangle on AB -> apex C' */}
                    <polygon
                      points={`${A.x},${A.y} ${apexAB.x},${apexAB.y} ${B.x},${B.y}`}
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10b981"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />

                    {/* Torricelli Lines: A -> A', B -> B', C -> C' */}
                    <line
                      x1={A.x}
                      y1={A.y}
                      x2={apexBC.x}
                      y2={apexBC.y}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                    />
                    <line
                      x1={B.x}
                      y1={B.y}
                      x2={apexCA.x}
                      y2={apexCA.y}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                    />
                    <line
                      x1={C.x}
                      y1={C.y}
                      x2={apexAB.x}
                      y2={apexAB.y}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                    />

                    {/* Apex dots and labels */}
                    {[
                      { pt: apexBC, label: "A'" },
                      { pt: apexCA, label: "B'" },
                      { pt: apexAB, label: "C'" },
                    ].map((ap, i) => (
                      <g key={i}>
                        <circle cx={ap.pt.x} cy={ap.pt.y} r={4.5} fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                        <text
                          x={ap.pt.x + 8}
                          y={ap.pt.y - 6}
                          fontSize="11"
                          fontWeight="bold"
                          fill="#047857"
                          fontFamily="sans-serif"
                        >
                          {ap.label}
                        </text>
                      </g>
                    ))}
                  </g>
                )}

                {/* 2. Main Triangle ABC */}
                <polygon
                  points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                  fill="rgba(59, 130, 246, 0.08)"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* 3. Connecting roads from test point P to A, B, C */}
                <g>
                  <line
                    x1={P.x}
                    y1={P.y}
                    x2={A.x}
                    y2={A.y}
                    stroke={isNearFermat ? '#10b981' : '#ef4444'}
                    strokeWidth="2.4"
                  />
                  <line
                    x1={P.x}
                    y1={P.y}
                    x2={B.x}
                    y2={B.y}
                    stroke={isNearFermat ? '#10b981' : '#ef4444'}
                    strokeWidth="2.4"
                  />
                  <line
                    x1={P.x}
                    y1={P.y}
                    x2={C.x}
                    y2={C.y}
                    stroke={isNearFermat ? '#10b981' : '#ef4444'}
                    strokeWidth="2.4"
                  />

                  {/* Distance tags on lines */}
                  {[
                    { from: P, to: A, d: distPA },
                    { from: P, to: B, d: distPB },
                    { from: P, to: C, d: distPC },
                  ].map((seg, i) => (
                    <text
                      key={i}
                      x={(seg.from.x + seg.to.x) / 2 + 5}
                      y={(seg.from.y + seg.to.y) / 2 - 5}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                      fill={isNearFermat ? '#047857' : '#b91c1c'}
                    >
                      {seg.d.toFixed(0)}
                    </text>
                  ))}
                </g>

                {/* 4. Fermat Point Indicator & Halo */}
                {!isObtuse120 && (
                  <g>
                    {/* Theoretical Fermat Point marker */}
                    <circle
                      cx={fermatPt.x}
                      cy={fermatPt.y}
                      r={14}
                      fill="rgba(16, 185, 129, 0.15)"
                      stroke="#10b981"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={fermatPt.x + 14}
                      y={fermatPt.y + 4}
                      fontSize="11"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                      fill="#059669"
                    >
                      F (최적점: 120°)
                    </text>
                  </g>
                )}

                {/* 5. Obtuse angle highlight ring */}
                {isObtuse120 && (
                  <circle
                    cx={fermatPt.x}
                    cy={fermatPt.y}
                    r={24}
                    fill="rgba(239, 68, 68, 0.15)"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* 6. Movable Test Point P */}
                <g
                  onPointerDown={(e) => handlePointerDown('P', e)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={P.x}
                    cy={P.y}
                    r={18}
                    fill={isNearFermat ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.22)'}
                  />
                  <circle
                    cx={P.x}
                    cy={P.y}
                    r={7.5}
                    fill={isNearFermat ? '#10b981' : '#ef4444'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  <text
                    x={P.x + 12}
                    y={P.y - 8}
                    fontSize="11.5"
                    fontWeight="bold"
                    fill={isNearFermat ? '#065f46' : '#991b1b'}
                    fontFamily="sans-serif"
                  >
                    P {isNearFermat ? '(최적 페르마 위치)' : '(탐색 중)'}
                  </text>
                </g>

                {/* 7. Vertices A, B, C */}
                {[
                  { pt: A, label: 'A', ang: angA, type: 'A' as const },
                  { pt: B, label: 'B', ang: angB, type: 'B' as const },
                  { pt: C, label: 'C', ang: angC, type: 'C' as const },
                ].map((v) => {
                  const isObt = v.ang >= 120;
                  return (
                    <g
                      key={v.label}
                      onPointerDown={(e) => handlePointerDown(v.type, e)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={v.pt.x}
                        cy={v.pt.y}
                        r={16}
                        fill="transparent"
                      />
                      <circle
                        cx={v.pt.x}
                        cy={v.pt.y}
                        r={8.5}
                        fill={isObt ? '#ef4444' : '#1e3a8a'}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                      <text
                        x={v.pt.x - 14}
                        y={v.pt.y - 12}
                        fontSize="13"
                        fontWeight="bold"
                        fill={isObt ? '#dc2626' : '#0f172a'}
                        fontFamily="sans-serif"
                      >
                        {v.label} ({Math.round(v.ang)}°)
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* Angles Monitoring Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">삼각형 내각:</span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${angA >= 120 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                ∠A: {Math.round(angA)}°
              </span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${angB >= 120 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                ∠B: {Math.round(angB)}°
              </span>
              <span className={`px-2 py-0.5 rounded font-mono font-bold ${angC >= 120 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'}`}>
                ∠C: {Math.round(angC)}°
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500 font-medium">점 P에서의 사잇각:</span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[11px]">
                {Math.round(angAPB)}°
              </span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[11px]">
                {Math.round(angBPC)}°
              </span>
              <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[11px]">
                {Math.round(angCPA)}°
              </span>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Principles, Q&A, and Steiner 4-Town Tree */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Core Principle Card */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 leading-relaxed">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-amber-600" />
                  <span>비눗방울 막(표면장력)과 120° 원리</span>
                </span>
                <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-semibold">
                  플라토의 법칙
                </span>
              </div>
              <p className="mt-1 text-slate-700">
                비눗방울은 스스로 표면적(에너지)을 최소화합니다. 세 기둥 사이의 비눗막은 자연스럽게 <strong className="text-amber-900 font-mono">120°</strong>를 이루며 하나의 중심점에서 만나며, 이것이 수학적으로 증명된 <strong className="text-indigo-900">페르마 포인트</strong>입니다.
              </p>
            </div>

            {/* Answer & Explanation Card */}
            {ansOpen && (
              <div className="p-4 bg-indigo-50/80 border-l-4 border-indigo-600 rounded-r-xl text-xs text-slate-800 space-y-2 animate-fadeIn shadow-2xs">
                <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>Q. 한 각이 120도 이상일 때는 어떻게 될까요?</span>
                </p>
                <p className="leading-relaxed text-slate-700">
                  삼각형 내부에 세 꼭짓점을 모두 120도로 바라보는 점이 존재하지 않습니다. 따라서 <strong>120도 이상인 그 둔각 꼭짓점 자체</strong>가 거리의 합을 최소로 만드는 페르마 점으로 퇴화(일치)합니다.
                </p>
                <div className="p-2.5 bg-white rounded-lg border border-indigo-200 text-[11px] text-indigo-950 space-y-1">
                  <p>• <strong>모든 각 &lt; 120°:</strong> 내부 페르마 점 존재 (<MathView tex="\angle APB = \angle BPC = \angle CPA = 120^\circ" />)</p>
                  <p>• <strong>어느 한 각 ≥ 120°:</strong> 둔각 꼭짓점이 곧 최단 거리 점 (<MathView tex="P = \text{둔각 꼭짓점}" />)</p>
                </div>
              </div>
            )}
          </div>

          {/* Steiner Tree Comparison */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Route className="w-4 h-4 text-indigo-600" />
              <span>정사각형 네 마을 슈타이너 트리 비교 (한 변 = 1)</span>
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <div className="font-bold text-slate-700 mb-1">대각선 X자 교점</div>
                <div className="text-slate-500 font-mono text-[11px]">총 길이 = <MathView tex="2\sqrt{2}" /></div>
                <div className="text-rose-600 font-bold mt-1 text-sm">약 2.828</div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-indigo-200 bg-indigo-50/40 shadow-2xs">
                <div className="font-bold text-indigo-900 mb-1">H자 슈타이너 트리</div>
                <div className="text-slate-500 font-mono text-[11px]">총 길이 = <MathView tex="1 + \sqrt{3}" /></div>
                <div className="text-emerald-600 font-bold mt-1 text-sm">약 2.732 (최적)</div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center leading-relaxed">
              페르마 점 2개를 접합한 H자 형태가 대각선 X자보다 약 <strong>3.4% 더 짧아</strong> 실제 고속도로 및 통신 케이블망 설계의 핵심 기하 원리로 쓰입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
