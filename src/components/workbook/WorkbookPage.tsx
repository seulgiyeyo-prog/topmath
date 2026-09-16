import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MathView } from '../MathView';
import { SoapFilmLab } from './SoapFilmLab';
import { FermatInteractiveVisualizer } from './FermatInteractiveVisualizer';
import { AdjacencyMatrixVisualizer } from './AdjacencyMatrixVisualizer';
import { FlattenCurveVisualizer } from './FlattenCurveVisualizer';
import {
  GraduationCap,
  Shapes,
  Network,
  Lightbulb,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Route,
  TriangleAlert,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Home,
  Compass,
  Share2,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Hand,
  Maximize2,
  Move,
  Sparkles,
  Layers,
  Droplets,
} from 'lucide-react';

interface WorkbookPageProps {
  onGoHome: () => void;
  onSwitchToGeometry: () => void;
  onSwitchToDiffusion: () => void;
  onOpenIdeas?: () => void;
}

export const WorkbookPage: React.FC<WorkbookPageProps> = ({
  onGoHome,
  onSwitchToGeometry,
  onSwitchToDiffusion,
  onOpenIdeas,
}) => {
  const [activeSection, setActiveSection] = useState<'t1' | 't2'>('t1');

  // Toggle states for all answer/explanation cards
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [ansHeron, setAnsHeron] = useState(false);
  const [ansFermatQ, setAnsFermatQ] = useState(false);
  const [ansNetMat, setAnsNetMat] = useState(false);
  const [ansRumor, setAnsRumor] = useState(false);
  const [ansR0Table, setAnsR0Table] = useState(false);
  const [ansVaccineHub, setAnsVaccineHub] = useState(false);
  const [ansMath26, setAnsMath26] = useState(false);

  // Toggle all answers at once
  const handleToggleAllAnswers = () => {
    const nextState = !showAllAnswers;
    setShowAllAnswers(nextState);
    setAnsHeron(nextState);
    setAnsFermatQ(nextState);
    setAnsNetMat(nextState);
    setAnsRumor(nextState);
    setAnsR0Table(nextState);
    setAnsVaccineHub(nextState);
    setAnsMath26(nextState);
  };

  // =========================================================================
  // 1. HERON CANVAS STATE
  // =========================================================================
  const heronCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [heronPXRatio, setHeronPXRatio] = useState(0.45);
  const isDraggingHeronRef = useRef(false);
  const [heronStats, setHeronStats] = useState({ cur: 0, min: 0, isOpt: false });

  const drawHeron = useCallback(() => {
    const canvas = heronCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const riverY = height * 0.58;
    const ptA = { x: width * 0.18, y: height * 0.22 };
    const ptB = { x: width * 0.82, y: height * 0.28 };
    const ptBPrime = { x: ptB.x, y: riverY + (riverY - ptB.y) };
    const ptP = { x: width * heronPXRatio, y: riverY };

    const optPX = ptA.x + (ptBPrime.x - ptA.x) * ((riverY - ptA.y) / (ptBPrime.y - ptA.y));

    // River background
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(0, riverY - 5, width, 10);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, riverY);
    ctx.lineTo(width, riverY);
    ctx.stroke();

    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('강변 (반사축)', 12, riverY - 10);

    // Symmetry line (B - B')
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(ptB.x, ptB.y);
    ctx.lineTo(ptBPrime.x, ptBPrime.y);
    ctx.stroke();

    // Optimal line (A - B')
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ptA.x, ptA.y);
    ctx.lineTo(ptBPrime.x, ptBPrime.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current path (A -> P -> B)
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(ptA.x, ptA.y);
    ctx.lineTo(ptP.x, ptP.y);
    ctx.lineTo(ptB.x, ptB.y);
    ctx.stroke();

    // P -> B' virtual line
    ctx.strokeStyle = '#60a5fa';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(ptP.x, ptP.y);
    ctx.lineTo(ptBPrime.x, ptBPrime.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Points
    const drawPt = (p: { x: number; y: number }, color: string, label: string, dy = -12) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(label, p.x - 10, p.y + dy);
    };

    drawPt(ptA, '#1e293b', 'A');
    drawPt(ptB, '#1e293b', 'B');
    drawPt(ptBPrime, '#64748b', "B'", 20);
    drawPt(ptP, '#f97316', 'P (물 뜨는 곳)', -14);

    const distCur = Math.hypot(ptA.x - ptP.x, ptA.y - ptP.y) + Math.hypot(ptB.x - ptP.x, ptB.y - ptP.y);
    const distMin = Math.hypot(ptA.x - ptBPrime.x, ptA.y - ptBPrime.y);
    const isOptimal = Math.abs(ptP.x - optPX) < 3.5;

    setHeronStats({ cur: distCur, min: distMin, isOpt: isOptimal });
  }, [heronPXRatio]);

  // =========================================================================
  // 4. R0 SIMULATION CHART STATE
  // =========================================================================
  const r0CanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sliderR0A, setSliderR0A] = useState(3.0);
  const [sliderR0B, setSliderR0B] = useState(0.8);

  const drawR0Chart = useCallback(() => {
    const canvas = r0CanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 30;
    const padBottom = 35;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const steps = [0, 1, 2, 3, 4, 5];
    const dataA = steps.map((i) => Math.pow(sliderR0A, i));
    const dataB = steps.map((i) => Math.pow(sliderR0B, i));

    const maxVal = Math.max(260, ...dataA, ...dataB);

    // Axes & grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let g = 0; g <= 5; g++) {
      const gy = padTop + (plotH / 5) * g;
      ctx.beginPath();
      ctx.moveTo(padLeft, gy);
      ctx.lineTo(padLeft + plotW, gy);
      ctx.stroke();

      const labelVal = Math.round(maxVal - (maxVal / 5) * g);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(labelVal.toString(), padLeft - 6, gy + 3);
    }

    // X-axis labels
    ctx.textAlign = 'center';
    steps.forEach((st, i) => {
      const gx = padLeft + (plotW / 5) * i;
      ctx.fillText(`${st}단계`, gx, padTop + plotH + 18);
    });

    // Medical capacity line (50)
    const capY = padTop + plotH - (50 / maxVal) * plotH;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, capY);
    ctx.lineTo(padLeft + plotW, capY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'right';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('의료 수용 한계선 (50명)', padLeft + plotW - 8, capY - 6);

    // Draw Line helper
    const drawLine = (data: number[], strokeColor: string, fillColor: string) => {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      data.forEach((val, i) => {
        const x = padLeft + (plotW / 5) * i;
        const y = padTop + plotH - (val / maxVal) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // fill gradient under curve
      ctx.lineTo(padLeft + plotW, padTop + plotH);
      ctx.lineTo(padLeft, padTop + plotH);
      ctx.closePath();
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Points
      data.forEach((val, i) => {
        const x = padLeft + (plotW / 5) * i;
        const y = padTop + plotH - (val / maxVal) * plotH;
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Draw Situation B (Blue)
    drawLine(dataB, '#2563eb', 'rgba(37, 99, 235, 0.08)');
    // Draw Situation A (Red)
    drawLine(dataA, '#ef4444', 'rgba(239, 68, 68, 0.12)');

    // Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`■ 상황 A (R₀ = ${sliderR0A.toFixed(1)})`, padLeft + 10, padTop - 10);
    ctx.fillStyle = '#2563eb';
    ctx.fillText(`■ 상황 B (R₀ = ${sliderR0B.toFixed(2)})`, padLeft + 160, padTop - 10);
  }, [sliderR0A, sliderR0B]);

  // =========================================================================
  // 5. SIR PREDICTION SIMULATION CHART STATE
  // =========================================================================
  const sirCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sirMode, setSirMode] = useState<'before' | 'after'>('before');

  const simulateSIR = (N: number, I0: number, beta: number, gamma: number, days: number) => {
    let S = N - I0;
    let I = I0;
    let R = 0;
    const dt = 0.5;
    const stepsPerDay = 1 / dt;
    const resS = [S], resI = [I], resR = [R];

    for (let d = 1; d <= days; d++) {
      for (let s = 0; s < stepsPerDay; s++) {
        const dS = -((beta * S * I) / N) * dt;
        const dI = ((beta * S * I) / N - gamma * I) * dt;
        const dR = gamma * I * dt;
        S += dS;
        I += dI;
        R += dR;
      }
      resS.push(Math.round(S));
      resI.push(Math.round(I));
      resR.push(Math.round(R));
    }
    return { S: resS, I: resI, R: resR };
  };

  const drawSirChart = useCallback(() => {
    const canvas = sirCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const days = 60;
    const sim =
      sirMode === 'before'
        ? simulateSIR(1000, 1, 0.4, 0.1, days)
        : simulateSIR(1000, 1, 0.08, 0.1, days);

    const padLeft = 45;
    const padRight = 20;
    const padTop = 30;
    const padBottom = 35;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;
    const maxVal = 1000;

    // Grid lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let g = 0; g <= 5; g++) {
      const gy = padTop + (plotH / 5) * g;
      ctx.beginPath();
      ctx.moveTo(padLeft, gy);
      ctx.lineTo(padLeft + plotW, gy);
      ctx.stroke();

      const labelVal = Math.round(maxVal - (maxVal / 5) * g);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(labelVal.toString(), padLeft - 6, gy + 3);
    }

    // X-axis days
    ctx.textAlign = 'center';
    [0, 10, 20, 30, 40, 50, 60].forEach((d) => {
      const gx = padLeft + (plotW / 60) * d;
      ctx.fillText(`${d}일`, gx, padTop + plotH + 18);
    });

    // Hospital capacity (200)
    const capY = padTop + plotH - (200 / maxVal) * plotH;
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, capY);
    ctx.lineTo(padLeft + plotW, capY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#b91c1c';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('의료 수용 한계선 (200명)', padLeft + plotW - 8, capY - 6);

    const drawCurve = (data: number[], color: string, fill = false, fillColor = '') => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      data.forEach((val, i) => {
        const x = padLeft + (plotW / days) * i;
        const y = padTop + plotH - (val / maxVal) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      if (fill) {
        ctx.lineTo(padLeft + plotW, padTop + plotH);
        ctx.lineTo(padLeft, padTop + plotH);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
      }
    };

    // Draw S (Blue)
    drawCurve(sim.S, '#3b82f6');
    // Draw R (Green)
    drawCurve(sim.R, '#10b981');
    // Draw I (Red) with fill
    drawCurve(sim.I, '#ef4444', true, 'rgba(239, 68, 68, 0.15)');

    // Legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('■ I (감염자)', padLeft + 10, padTop - 10);
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('■ S (감수성자)', padLeft + 110, padTop - 10);
    ctx.fillStyle = '#10b981';
    ctx.fillText('■ R (회복·면역자)', padLeft + 220, padTop - 10);
  }, [sirMode]);

  // Initial draw & resize listeners
  useEffect(() => {
    drawHeron();
    drawR0Chart();
    drawSirChart();

    const handleResize = () => {
      drawHeron();
      drawR0Chart();
      drawSirChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawHeron, drawR0Chart, drawSirChart]);

  // Redraw when active section switches
  useEffect(() => {
    const timer = setTimeout(() => {
      drawHeron();
      drawR0Chart();
      drawSirChart();
    }, 50);
    return () => clearTimeout(timer);
  }, [activeSection, drawHeron, drawR0Chart, drawSirChart]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Universal Classroom Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">
                  2026 중등영재 수학
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  교재 정답 & 인터랙티브 수업 플랫폼
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                기하 최적화 & 감염병 확산 모델링 워크북
              </h1>
            </div>
          </div>

          {/* Controls: Home, Lab Switches, Section Tabs, Master Answer Toggle */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={onGoHome}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>포털 홈</span>
            </button>

            {onOpenIdeas && (
              <button
                onClick={onOpenIdeas}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-105"
                title="영재 발표회 산출물 아이디어 고민 및 3분 발표 타임라인 기획"
              >
                <Lightbulb className="w-3.5 h-3.5 text-yellow-200" />
                <span>💡 산출물 아이디어 고민하기</span>
              </button>
            )}

            <button
              onClick={handleToggleAllAnswers}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm ${
                showAllAnswers
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
              title="수업 시 모든 문제의 정답과 해설을 한 번에 열거나 닫습니다"
            >
              {showAllAnswers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showAllAnswers ? '정답 전체 닫기' : '교재 정답 전체 보기'}</span>
            </button>

            {/* Section Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveSection('t1')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSection === 't1'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shapes className="w-4 h-4" />
                <span>1. 기하 최적화와 페르마 점</span>
              </button>

              <button
                onClick={() => setActiveSection('t2')}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSection === 't2'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Network className="w-4 h-4" />
                <span>2. 확산과 네트워크 모델링</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-1 space-y-6">

        {/* Quick Course Transfer Floating Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <span className="text-xl">💡</span>
            <span>
              <strong>선생님 수업 가이드:</strong> 워크북의 문제별 <strong>[정답 및 해설]</strong> 버튼을 누르면 풀이가 즉시 펼쳐집니다. 시뮬레이션 게임 본편으로 이동하려면 우측 버튼을 누르세요.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSwitchToGeometry}
              className="px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>기하 랩 본편</span>
            </button>
            <button
              onClick={onSwitchToDiffusion}
              className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>확산 랩 본편</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* [SECTION 1] 기하 최적화와 페르마 점                                */}
        {/* ================================================================= */}
        {activeSection === 't1' && (
          <div className="space-y-6">
            {/* 1. 헤론의 최단거리 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3 mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  헤론의 최단 거리 문제와 대칭의 원리
                </h2>
                <button
                  onClick={() => setAnsHeron(!ansHeron)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{ansHeron ? '정답 접기' : '정답 및 해설'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6 space-y-3">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed">
                    <strong className="text-slate-800">Q. 왜 직선 거리가 최단 거리가 될까?</strong>
                    <br />
                    <span className="text-slate-600">
                      '삼각형의 결정 조건(삼각 부등식)'을 이용하여 설명해 보세요.
                    </span>
                  </div>

                  {ansHeron && (
                    <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl text-xs sm:text-sm text-slate-700 space-y-2 animate-fadeIn">
                      <p className="font-bold text-blue-900">💡 수학적 증명 해설</p>
                      <p>
                        1. 강변 직선을 기준으로 점 <MathView tex="B" />를 대칭이동시킨 점을 <MathView tex="B'" />이라 하면, 선대칭 성질에 의해 강변의 임의의 점 <MathView tex="P" />에 대해 <MathView tex="PB = PB'" />입니다.
                      </p>
                      <p>
                        2. 따라서 전체 이동 거리는 <MathView tex="AP + PB = AP + PB'" />이 됩니다.
                      </p>
                      <p>
                        3. 점 <MathView tex="P" />가 선분 <MathView tex="AB'" /> 위에 있지 않다면 삼각형 <MathView tex="APB'" />이 만들어집니다. <strong>삼각형의 결정 조건(삼각 부등식)</strong>에 따라 두 변의 길이의 합은 다른 한 변보다 항상 깁니다 (<MathView tex="AP + PB' > AB'" />).
                      </p>
                      <p>
                        4. 따라서 세 점 <MathView tex="A, P, B'" />이 일직선상에 존재할 때 거리의 합이 최소(<MathView tex="AB'" />)가 됩니다.
                      </p>
                    </div>
                  )}
                </div>

                {/* 헤론 캔버스 */}
                <div className="lg:col-span-6 bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-2 font-medium flex items-center gap-1">
                    <Hand className="w-3.5 h-3.5 text-blue-600" />
                    <span>강변 위의 주황색 점 <MathView tex="P" />를 마우스나 손가락으로 드래그하여 거리 변화를 관찰하세요.</span>
                  </p>
                  <div
                    className="w-full bg-white rounded-lg overflow-hidden border border-slate-200 aspect-[16/10] relative touch-none cursor-ew-resize"
                    onPointerDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const curX = rect.width * heronPXRatio;
                      if (Math.abs(x - curX) < 40) isDraggingHeronRef.current = true;
                    }}
                    onPointerMove={(e) => {
                      if (!isDraggingHeronRef.current) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = Math.max(20, Math.min(rect.width - 20, e.clientX - rect.left));
                      setHeronPXRatio(x / rect.width);
                    }}
                    onPointerUp={() => {
                      isDraggingHeronRef.current = false;
                    }}
                  >
                    <canvas ref={heronCanvasRef} className="w-full h-full block" />
                  </div>
                  <div className="mt-2 text-center text-xs font-semibold text-slate-700">
                    현재 경로 <MathView tex="AP + PB" />: <span className={`font-mono ${heronStats.isOpt ? 'text-emerald-600 font-bold' : 'text-blue-600'}`}>{heronStats.cur.toFixed(1)}</span> px 
                    | 최단 직선 거리 <MathView tex="AB'" />: <span className="font-mono text-emerald-600 font-bold">{heronStats.min.toFixed(1)}</span> px 
                    {heronStats.isOpt && <span className="text-emerald-600 ml-1 font-bold">✨ (최적 상태 달성!)</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. 페르마 점 작도기 (Fermat Point Interactive Visualizer & Steiner Tree) */}
            <FermatInteractiveVisualizer />

            {/* [물리·수학 융합 실험] 비눗방울 막(표면장력) & 플라토의 법칙 실험실 */}
            <SoapFilmLab />
          </div>
        )}

        {/* ================================================================= */}
        {/* [SECTION 2] 감염병 확산과 네트워크 모델링                          */}
        {/* ================================================================= */}
        {activeSection === 't2' && (
          <div className="space-y-6">
            {/* 1. 네트워크 & 인접 행렬 다이어그램과 악수 정리 */}
            <AdjacencyMatrixVisualizer />

            {/* 2. 지수적 폭발 & 소문의 확산 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3 mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  지수적 폭발 (소문의 확산 속도 & 거듭제곱)
                </h2>
                <button
                  onClick={() => setAnsRumor(!ansRumor)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg border border-indigo-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{ansRumor ? '정답 접기' : '정답 및 상세 풀이'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-700 space-y-1">
                <p>
                  <strong>상황:</strong> 1명이 비밀을 알고 있고, 1시간마다 알고 있는 사람이 각자 새로운 3명에게 소문을 퍼뜨린다.
                </p>
                <p className="text-slate-500 text-xs">
                  Q1. <MathView tex="t" />시간 후 소문을 아는 총 인원 <MathView tex="y" />를 나타내는 식을 구하시오.<br />
                  Q2. 인구 100만 명(<MathView tex="10^6" />명)인 대도시에 소문이 전부 퍼지는 데 몇 시간이 걸리는지 구하시오.
                </p>
              </div>

              {ansRumor && (
                <div className="mt-3 p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded-r-xl text-xs sm:text-sm text-slate-800 space-y-3 animate-fadeIn">
                  <div>
                    <strong className="text-indigo-950 font-bold">[Q1: 소문이 전파되는 식]</strong>
                    <p className="mt-1 leading-relaxed">
                      매 시간마다 기존 1명이 새로운 3명에게 전파하므로, 1시간 뒤 인원은 본인(1) + 새 인원(3) = <strong>4배</strong>가 됩니다.<br />
                      따라서 시간 <MathView tex="t" />에 따른 지수함수는 <MathView tex="y = 4^t = (2^2)^t = 2^{2t}" /> 입니다.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-indigo-200">
                    <strong className="text-indigo-950 font-bold">[Q2: 100만 명(<MathView tex="10^6" />) 도시 전체에 전파되는 시간]</strong>
                    <div className="mt-1 space-y-1 leading-relaxed">
                      <p>
                        부등식: <MathView tex="4^t \ge 1,000,000 \iff 2^{2t} \ge 1,000,000" />
                      </p>
                      <p>
                        • 거듭제곱 밑작업: <MathView tex="2^{10} = 1,024 \approx 10^3" />
                      </p>
                      <p>
                        • 양변 제곱: <MathView tex="(2^{10})^2 = 2^{20} = (1,024)^2 = 1,048,576 > 1,000,000" />
                      </p>
                      <p>
                        • 지수 비교: <MathView tex="2t = 20 \implies t = \mathbf{10\text{시간}}" />
                      </p>
                      <div className="mt-2 p-2.5 bg-white/80 rounded-lg border border-indigo-200 text-indigo-950">
                        ✨ <strong>결론:</strong> 단 <strong>10시간</strong> 만에 인구 100만 명 전체가 소문을 알게 됩니다! (지수함수의 폭발적 위력)
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. SIR 모델의 설계 */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-6">
              <div className="flex flex-wrap items-center justify-between border-b pb-3 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-xs">
                      3
                    </span>
                    <span>SIR 모델의 설계</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    기초감염재생산수(<MathView tex="R_0" />)의 거듭제곱 확산 모델과 방역 정책을 통한 그래프 평탄화의 원리를 탐구합니다.
                  </p>
                </div>
              </div>

              {/* 3-1. 기초 감염재생산수와 지수곡선 */}
              <div className="rounded-xl border border-slate-200 p-4 sm:p-5 bg-slate-50/60 space-y-4">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold">
                        3-1
                      </span>
                      <span>기초 감염재생산수(<MathView tex="R_0" />)와 지수곡선</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      방역 조치에 따른 <MathView tex="R_0" /> 값의 변화가 감염자 수에 미치는 영향을 비교합니다.
                    </p>
                  </div>
                  <button
                    onClick={() => setAnsR0Table(!ansR0Table)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg border border-indigo-200 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{ansR0Table ? '표 정답 접기' : '3-1 단계별 표 정답 & 풀이'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>상황 A (방역 미실시): <MathView tex="R_0" /></span>
                          <span className="text-red-600 font-mono font-bold">{sliderR0A.toFixed(1)}</span>
                        </div>
                        <input
                          type="range"
                          min="1.5"
                          max="4.0"
                          step="0.1"
                          value={sliderR0A}
                          onChange={(e) => setSliderR0A(parseFloat(e.target.value))}
                          className="w-full accent-red-600 cursor-pointer"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>상황 B (거리두기 실시): <MathView tex="R_0" /></span>
                          <span className="text-blue-600 font-mono font-bold">{sliderR0B.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max="1.3"
                          step="0.05"
                          value={sliderR0B}
                          onChange={(e) => setSliderR0B(parseFloat(e.target.value))}
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 leading-relaxed">
                      <strong className="flex items-center gap-1 text-red-700 mb-1">
                        <TriangleAlert className="w-3.5 h-3.5" />
                        <span>의료 수용 한계선 (점선)</span>
                      </strong>
                      <MathView tex="R_0 > 1" />이면 단 몇 단계 만에 지수 폭발이 일어나 의료 붕괴가 발생합니다. 거리두기를 통해 <MathView tex="R_0 < 1" />로 억제해야 자연 소멸합니다.
                    </div>
                  </div>

                  <div className="lg:col-span-8 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="w-full bg-white rounded-lg p-2 aspect-[16/9] relative">
                      <canvas ref={r0CanvasRef} className="w-full h-full block" />
                    </div>
                  </div>
                </div>

                {ansR0Table && (
                  <div className="mt-4 pt-4 border-t border-slate-200 text-xs animate-fadeIn space-y-3">
                    <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 leading-relaxed">
                      <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        <span>📋 워크북 단계별 감염자 수 표 완성 (정답)</span>
                      </h4>

                      {/* 완성 표 */}
                      <div className="overflow-x-auto my-2">
                        <table className="min-w-full text-center border-collapse bg-white rounded-lg overflow-hidden border border-indigo-200 text-xs">
                          <thead>
                            <tr className="bg-indigo-100/70 text-indigo-950 font-bold border-b border-indigo-200">
                              <th className="py-2 px-3">구분</th>
                              <th className="py-2 px-3">0단계(초기)</th>
                              <th className="py-2 px-3">1단계</th>
                              <th className="py-2 px-3">2단계</th>
                              <th className="py-2 px-3">3단계</th>
                              <th className="py-2 px-3">4단계</th>
                              <th className="py-2 px-3">5단계</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-indigo-100">
                            <tr className="hover:bg-red-50/50">
                              <td className="py-2 px-3 font-bold text-red-700">상황 A (<MathView tex="R_0=3" />)</td>
                              <td className="py-2 px-3">1</td>
                              <td className="py-2 px-3">3</td>
                              <td className="py-2 px-3">9</td>
                              <td className="py-2 px-3 font-bold text-red-600 bg-red-50/70">27</td>
                              <td className="py-2 px-3 font-bold text-red-600 bg-red-50/70">81</td>
                              <td className="py-2 px-3 font-bold text-red-600 bg-red-100/80">243명</td>
                            </tr>
                            <tr className="hover:bg-blue-50/50">
                              <td className="py-2 px-3 font-bold text-blue-700">상황 B (<MathView tex="R_0=0.8" />)</td>
                              <td className="py-2 px-3">1</td>
                              <td className="py-2 px-3">0.8</td>
                              <td className="py-2 px-3">0.64</td>
                              <td className="py-2 px-3 font-bold text-blue-600 bg-blue-50/70">0.512</td>
                              <td className="py-2 px-3 font-bold text-blue-600 bg-blue-50/70">0.4096</td>
                              <td className="py-2 px-3 font-bold text-blue-600 bg-blue-100/80">0.32768명</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-indigo-200 mt-2 space-y-1.5 text-slate-800">
                        <p>
                          • <strong>수식 비교:</strong> 상황 A는 <MathView tex="3^t" />, 상황 B는 <MathView tex="(0.8)^t" /> 곡선입니다.
                        </p>
                        <p>
                          • <strong>5단계 비율 계산:</strong>{' '}
                          <MathView tex="\frac{243}{0.32768} \approx \mathbf{741.5배}" />
                        </p>
                        <p className="text-indigo-900 font-semibold">
                          💡 단 5차수(세대) 만에 방역 조치 유무에 따라 감염자 수가 무려 <strong>741배 이상</strong> 차이가 벌어집니다!
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3-2. R_0와 그래프 평탄화 */}
              <div>
                <FlattenCurveVisualizer externalAnsOpen={showAllAnswers} />
              </div>
            </div>

            {/* 4. 집단면역 임계치 & 백신 우선 접종 전략 (허브 vs 무작위) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between border-b pb-3 mb-4 flex-wrap gap-2">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold">
                    4
                  </span>
                  집단 면역 임계치(<MathView tex="H_c" />) & 백신 우선 접종 전략 (허브 vs 무작위)
                </h2>
                <button
                  onClick={() => setAnsVaccineHub(!ansVaccineHub)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-lg border border-indigo-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{ansVaccineHub ? '정답 접기' : '정답 및 네트워크 증명'}</span>
                </button>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-700 space-y-2 leading-relaxed">
                <p>
                  <strong>[탐구 1] 집단 면역 임계치 공식:</strong> 면역자 비율이 <MathView tex="H_c" /> 이상이면 감염병이 확산되지 않고 자연 소멸한다.
                </p>
                <p>
                  <strong>[탐구 2] 백신 우선순위 질문:</strong> 백신이 딱 10명분밖에 없습니다. 무작위(Random)로 나눠줄 것인가, 아니면 친구가 가장 많은 사람(<strong>허브, Hub</strong>)에게 줄 것인가? 네트워크 관점에서 이유를 서술하시오.
                </p>
              </div>

              {ansVaccineHub && (
                <div className="mt-3 p-4 bg-indigo-50 border-l-4 border-indigo-600 rounded-r-xl text-xs sm:text-sm text-slate-800 space-y-3 animate-fadeIn">
                  {/* 집단면역 유도 및 임계치 */}
                  <div>
                    <h4 className="font-bold text-indigo-950 mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      <span>[탐구 1] 집단 면역 임계치 공식 유도</span>
                    </h4>
                    <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-1.5">
                      <p>
                        감염자 1명이 전파 가능한 대상은 비면역자 비율 <MathView tex="(1 - H)" /> 뿐이므로,
                        유효 감염재생산수 <MathView tex="R = R_0 \times (1 - H)" />가 됩니다.
                      </p>
                      <p>
                        확산이 멈추려면 <MathView tex="R \le 1" /> 이어야 하므로:<br />
                        <MathView tex="R_0 \times (1 - H) \le 1 \implies 1 - H \le \frac{1}{R_0} \implies H \ge 1 - \frac{1}{R_0}" />
                      </p>
                      <div className="pt-2 text-indigo-900 border-t border-indigo-100 font-semibold grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="bg-indigo-50 p-2 rounded">
                          • <strong>홍역 (<MathView tex="R_0=15" />):</strong> <MathView tex="H_c = 1 - \frac{1}{15} = \frac{14}{15} \approx \mathbf{93.3\%}" />
                        </div>
                        <div className="bg-indigo-50 p-2 rounded">
                          • <strong>독감 (<MathView tex="R_0=2" />):</strong> <MathView tex="H_c = 1 - \frac{1}{2} = \mathbf{50.0\%}" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 허브 백신 접종 네트워크 이유 */}
                  <div className="pt-2 border-t border-indigo-200">
                    <h4 className="font-bold text-indigo-950 mb-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      <span>[탐구 2] 백신 우선 접종 질문 정답 & 네트워크 이론</span>
                    </h4>
                    <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-2">
                      <p>
                        <strong>[정답]</strong> 친구가 가장 많은 사람(<strong>허브, Hub</strong>)에게 최우선으로 접종해야 합니다.
                      </p>
                      <p className="leading-relaxed text-slate-700">
                        <strong>[네트워크 관점 서술]</strong><br />
                        인간 관계망은 멱함수 법칙(Power Law)을 따르는 <strong>척도 없는 네트워크(Scale-Free Network)</strong> 구조를 가집니다.
                        소수의 '허브(Hub)' 노드가 수많은 연결선(Edge)을 독점하고 있어 바이러스의 고속도로 역할을 합니다.
                      </p>
                      <ul className="space-y-1 text-slate-700 text-xs">
                        <li>
                          • <strong>허브 노드 백신 접종(노드 제거):</strong> 허브 1명만 면역화해도 그 허브를 지나가는 수십~수백 개의 전파 경로가 일거에 차단됩니다.
                        </li>
                        <li>
                          • <strong>네트워크 분절화(Percolation 효과):</strong> 거대한 연결망이 작은 고립 클러스터들로 산산조각 나면서 바이러스가 전 도시로 번질 수 없습니다.
                        </li>
                        <li>
                          • <strong>무작위(Random) 접종의 한계:</strong> 연결선이 1~2개뿐인 외곽 노드에 백신이 소모되어, 10명분 백신으로는 방역 효과가 거의 0에 수렴합니다.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. 신종 바이러스 '수학-26'의 확산을 막아라! */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex flex-wrap items-center justify-between border-b pb-3 mb-4 gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-sm font-bold">
                      5
                    </span>
                    신종 바이러스 '수학-26'의 확산을 막아라! (정책 & SIR 예측 그래프)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    조건: <MathView tex="R_0=4" />, 초기 감염자 1명, 도시 인구 1,000명, 병원 수용 한계 200명
                  </p>
                </div>
                <button
                  onClick={() => setAnsMath26(!ansMath26)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg border border-red-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{ansMath26 ? '정답 접기' : '정책 빈칸 정답 & SIR 미분방정식'}</span>
                </button>
              </div>

              {/* 3개 정책 빈칸 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                <div className="p-3.5 bg-slate-50 border rounded-xl text-xs">
                  <span className="font-bold text-slate-800">1. 접촉 횟수 제한(거리두기)</span>
                  <div className="text-slate-600 mt-1 font-medium">
                    ( <span className="font-mono text-red-600 font-bold text-sm">75% 초과 감소</span> ) 전략
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 border rounded-xl text-xs">
                  <span className="font-bold text-slate-800">2. 백신 우선 접종 대상선정</span>
                  <div className="text-slate-600 mt-1 font-medium">
                    ( <span className="font-mono text-red-600 font-bold text-sm">허브 / 중심성 높은</span> ) 노드 타겟팅
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 border rounded-xl text-xs">
                  <span className="font-bold text-slate-800">3. 정보 투명성 제고</span>
                  <div className="text-slate-600 mt-1 font-medium">
                    가짜 뉴스 차단 및 조기 검사 촉진
                  </div>
                </div>
              </div>

              {ansMath26 && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-xs sm:text-sm text-slate-800 space-y-3 animate-fadeIn">
                  <p className="font-bold text-red-950 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                    <span>💡 정책 수립 빈칸 정답 및 수식 근거</span>
                  </p>
                  
                  <div className="space-y-2 leading-relaxed bg-white p-3 rounded-lg border border-red-200">
                    <div>
                      • <strong>1. 접촉 횟수 제한:</strong> <strong>75% 초과 감소</strong> (또는 75% 이상 / 80% 감소)
                      <p className="text-slate-600 text-xs mt-0.5 pl-3">
                        근거: <MathView tex="R_0 = 4" />이므로 유효 전파수를 1 미만(<MathView tex="R < 1" />)으로 낮추려면 접촉률을 <MathView tex="\frac{1}{4} = 25\%" /> 미만으로 줄여야 하므로, <strong>75% 이상 감소</strong>시켜야 합니다.
                      </p>
                    </div>
                    <div>
                      • <strong>2. 백신 우선 접종 대상선정:</strong> <strong>허브(Hub) / 연결 중심성(Degree Centrality)이 높은 노드</strong>
                      <p className="text-slate-600 text-xs mt-0.5 pl-3">
                        근거: 척도 없는 네트워크에서 허브 노드들을 우선 제거하면 네트워크가 분절되어 대유행(Pandemic)을 원천 차단합니다.
                      </p>
                    </div>
                    <div>
                      • <strong>3. 정보 투명성 제고:</strong> <strong>왜곡된 정보 및 가짜 뉴스 확산 차단</strong>
                      <p className="text-slate-600 text-xs mt-0.5 pl-3">
                        근거: 투명한 정보 공개로 시민들의 자발적 방역 참여율과 조기 검사율을 높여 감염 전파 기간을 단축시킵니다.
                      </p>
                    </div>
                  </div>

                  {/* SIR 미분방정식 설명 보충 */}
                  <div className="p-3 bg-red-100/50 rounded-lg border border-red-200 text-xs text-red-950 space-y-1">
                    <strong className="block font-bold">📐 SIR 연립 미분방정식 모델:</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1 font-mono text-center">
                      <div className="bg-white p-1.5 rounded border border-red-200">
                        <MathView tex="\frac{dS}{dt} = -\frac{\beta S I}{N}" />
                      </div>
                      <div className="bg-white p-1.5 rounded border border-red-200">
                        <MathView tex="\frac{dI}{dt} = \frac{\beta S I}{N} - \gamma I" />
                      </div>
                      <div className="bg-white p-1.5 rounded border border-red-200">
                        <MathView tex="\frac{dR}{dt} = \gamma I" />
                      </div>
                    </div>
                    <p className="text-slate-700">
                      여기서 <MathView tex="R_0 = \frac{\beta}{\gamma}" /> 입니다. 정책 적용 시 전파율 <MathView tex="\beta" />가 75% 감소하여 감염률이 급감합니다.
                    </p>
                  </div>
                </div>
              )}

              {/* SIR 예측 그래프 영역 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span>[예측 그래프] 방역 정책 적용 전 vs 적용 후 SIR 동적 시뮬레이션</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      당신의 정책(거리두기 75%↑ + 허브 접종)을 적용했을 때 곡선의 변화를 즉시 확인하세요.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSirMode('before')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        sirMode === 'before'
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>정책 미적용 (<MathView tex="R_0=4" />)</span>
                    </button>
                    <button
                      onClick={() => setSirMode('after')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        sirMode === 'after'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>정책 적용 (<MathView tex="R < 1" />)</span>
                    </button>
                  </div>
                </div>

                <div className="w-full bg-white rounded-lg p-2 aspect-[16/8] relative border border-slate-200">
                  <canvas ref={sirCanvasRef} className="w-full h-full block" />
                </div>

                {/* 예측 그래프 해석 요약 카드 */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-red-50/80 border border-red-100 rounded-lg text-red-950">
                    <strong className="text-red-700 block mb-1">❌ 정책 미적용 시 (뾰족한 피크 그래프)</strong>
                    짧은 시간(약 15~20일 차)에 감염자(<MathView tex="I" />)가 폭증하여 병원 수용 한계(200명)를 뚫고 올라가 의료 시스템이 붕괴됩니다.
                  </div>
                  <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-lg text-emerald-950">
                    <strong className="text-emerald-700 block mb-1">✅ 정책 적용 시 (평탄화된 안전 그래프)</strong>
                    거리두기(75% 감소)와 허브 백신 접종으로 <MathView tex="R < 1" />이 되어 감염자 피크가 거의 발생하지 않고 수용 한계선 아래에서 안전하게 자연 소멸합니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 px-4 text-center text-xs text-slate-500 space-y-1">
        <div>2026 중등수학 영재교육원 · 기하 최적화 & 감염병 확산 인터랙티브 수업 플랫폼</div>
        <div className="text-slate-400 font-medium tracking-wide">
          Development &amp; Design: Seulgi Jeong
        </div>
      </footer>
    </div>
  );
};
