import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MathView } from '../MathView';
import {
  Lightbulb,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Sliders,
  Sparkles,
  HelpCircle,
  Activity,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface FlattenCurveVisualizerProps {
  externalAnsOpen?: boolean;
}

export const FlattenCurveVisualizer: React.FC<FlattenCurveVisualizerProps> = ({
  externalAnsOpen = false,
}) => {
  const [ansQ1, setAnsQ1] = useState(false);
  const [ansQ2, setAnsQ2] = useState(false);
  const [hoverX, setHoverX] = useState<number>(1.5);
  const [capacityY, setCapacityY] = useState<number>(10);
  const [customR0A, setCustomR0A] = useState<number>(3.0);
  const [customR0B, setCustomR0B] = useState<number>(0.8);

  // Sync external open state if provided
  useEffect(() => {
    if (externalAnsOpen) {
      setAnsQ1(true);
      setAnsQ2(true);
    }
  }, [externalAnsOpen]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    // Layout margins
    const padL = 50;
    const padR = 25;
    const padT = 36;
    const padB = 42;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Coordinate ranges
    const xMin = 0.0;
    const xMax = 3.0;
    const yMin = 0.0;
    const yMax = 30.0;

    const toCanvasX = (x: number) => padL + ((x - xMin) / (xMax - xMin)) * plotW;
    const toCanvasY = (y: number) => padT + plotH - ((y - yMin) / (yMax - yMin)) * plotH;

    // Background chart box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(padL, padT, plotW, plotH);

    // Grid lines - Y
    ctx.lineWidth = 1;
    const yTicks = [0, 5, 10, 15, 20, 25, 30];
    yTicks.forEach((yVal) => {
      const cy = toCanvasY(yVal);
      ctx.strokeStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(padL, cy);
      ctx.lineTo(padL + plotW, cy);
      ctx.stroke();

      // Tick label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(yVal.toString(), padL - 8, cy);
    });

    // Grid lines - X
    const xTicks = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
    xTicks.forEach((xVal) => {
      const cx = toCanvasX(xVal);
      ctx.strokeStyle = '#f1f5f9';
      ctx.beginPath();
      ctx.moveTo(cx, padT);
      ctx.lineTo(cx, padT + plotH);
      ctx.stroke();

      // Tick label
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(xVal.toFixed(1), cx, padT + plotH + 8);
    });

    // Medical capacity line (한계선)
    const capY = toCanvasY(capacityY);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, capY);
    ctx.lineTo(padL + plotW, capY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Medical capacity tag
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 10.5px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`의료 시스템 수용 한계선 (y = ${capacityY})`, padL + plotW - 6, capY - 4);

    // Function 1: y = 3^x (or customR0A^x) - Blue solid
    const curvePointsA: { x: number; y: number }[] = [];
    const curvePointsB: { x: number; y: number }[] = [];
    const sampleSteps = 120;
    for (let i = 0; i <= sampleSteps; i++) {
      const xVal = xMin + ((xMax - xMin) * i) / sampleSteps;
      const yValA = Math.pow(customR0A, xVal);
      const yValB = Math.pow(customR0B, xVal);
      curvePointsA.push({ x: xVal, y: Math.min(yMax + 2, yValA) });
      curvePointsB.push({ x: xVal, y: yValB });
    }

    // Draw Blue curve y = 3^x
    ctx.save();
    // Clip to plot area
    ctx.beginPath();
    ctx.rect(padL, padT, plotW, plotH);
    ctx.clip();

    ctx.strokeStyle = '#2563eb'; // Blue line
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    curvePointsA.forEach((pt, i) => {
      const cx = toCanvasX(pt.x);
      const cy = toCanvasY(pt.y);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // Draw Red dashed curve y = 0.8^x
    ctx.strokeStyle = '#dc2626'; // Red dashed line
    ctx.lineWidth = 2.2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    curvePointsB.forEach((pt, i) => {
      const cx = toCanvasX(pt.x);
      const cy = toCanvasY(pt.y);
      if (i === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Hover x marker line
    if (hoverX >= 0 && hoverX <= 3) {
      const hx = toCanvasX(hoverX);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(hx, padT);
      ctx.lineTo(hx, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      const curYA = Math.pow(customR0A, hoverX);
      const curYB = Math.pow(customR0B, hoverX);

      // Point A
      if (curYA <= yMax) {
        const hyA = toCanvasY(curYA);
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(hx, hyA, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Point B
      if (curYB <= yMax) {
        const hyB = toCanvasY(curYB);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(hx, hyB, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    ctx.restore();

    // Plot Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(padL, padT, plotW, plotH);

    // Chart Title inside canvas
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Graphs of y = 3ˣ and y = 0.8ˣ (for x ≥ 0)', padL + plotW / 2, 10);

    // Axis Labels
    ctx.fillStyle = '#475569';
    ctx.font = 'italic 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x (감염 세대 / 시간)', padL + plotW / 2, padT + plotH + 26);

    ctx.save();
    ctx.translate(14, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('y (누적 / 활동 감염자 수)', 0, 0);
    ctx.restore();

    // Legend at Top Right
    const legX = padL + plotW - 130;
    const legY = padT + 12;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.fillRect(legX, legY, 122, 48);
    ctx.strokeRect(legX, legY, 122, 48);

    // Legend item 1: y = 3^x
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(legX + 8, legY + 14);
    ctx.lineTo(legX + 28, legY + 14);
    ctx.stroke();

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('y = 3ˣ (상황 A)', legX + 34, legY + 14);

    // Legend item 2: y = 0.8^x
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(legX + 8, legY + 34);
    ctx.lineTo(legX + 28, legY + 34);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#991b1b';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('y = 0.8ˣ (상황 B)', legX + 34, legY + 34);
  }, [hoverX, capacityY, customR0A, customR0B]);

  useEffect(() => {
    drawChart();
    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawChart]);

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const padL = 50;
    const padR = 25;
    const plotW = rect.width - padL - padR;
    const xPos = e.clientX - rect.left - padL;
    const ratio = Math.max(0, Math.min(1, xPos / plotW));
    const nextX = ratio * 3.0;
    setHoverX(Math.round(nextX * 10) / 10);
  };

  const valA = Math.pow(customR0A, hoverX);
  const valB = Math.pow(customR0B, hoverX);
  const isAOverCapacity = valA > capacityY;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center text-xs font-bold">
              3-2
            </span>
            <span><MathView tex="R_0" />와 그래프 평탄화 (Flattening the Curve)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            의료 시스템 수용 한계와 감염 곡선 평탄화의 수학적 원리를 탐구합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const toggle = !(ansQ1 && ansQ2);
              setAnsQ1(toggle);
              setAnsQ2(toggle);
            }}
            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{ansQ1 && ansQ2 ? 'Q1·Q2 정답 접기' : 'Q1·Q2 워크북 정답 & 해설'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Chart + Live Readout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Top: Interactive Chart */}
        <div className="lg:col-span-7 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="relative bg-white rounded-lg p-2 border border-slate-200 aspect-[16/11] select-none touch-none cursor-crosshair">
            <canvas
              ref={canvasRef}
              className="w-full h-full block"
              onPointerDown={handlePointer}
              onPointerMove={(e) => {
                if (e.buttons === 1) handlePointer(e);
              }}
            />
          </div>

          {/* Interactive controls */}
          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                <span>관측 시점 탐색: <strong className="font-mono text-indigo-600">x = {hoverX.toFixed(1)}</strong></span>
              </span>
              <span className="text-[11px] text-slate-400">그래프를 터치하거나 슬라이더 조절</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="3.0"
              step="0.1"
              value={hoverX}
              onChange={(e) => setHoverX(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded bg-blue-50 border border-blue-200">
                <div className="flex justify-between items-center text-blue-900 font-bold text-[11px]">
                  <span>상황 A (방역 미실시)</span>
                  <span className="text-xs font-mono">{valA.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-blue-700 mt-0.5">
                  <MathView tex={`y = 3^{${hoverX.toFixed(1)}} = ${valA.toFixed(2)}`} />
                  {isAOverCapacity ? (
                    <span className="block font-bold text-red-600 mt-0.5">🚨 수용 한계 초과! (의료 붕괴)</span>
                  ) : (
                    <span className="block text-emerald-700 mt-0.5">한계선 이하 유지 중</span>
                  )}
                </div>
              </div>

              <div className="p-2 rounded bg-rose-50 border border-rose-200">
                <div className="flex justify-between items-center text-rose-900 font-bold text-[11px]">
                  <span>상황 B (거리두기)</span>
                  <span className="text-xs font-mono">{valB.toFixed(2)}</span>
                </div>
                <div className="text-[10px] text-rose-700 mt-0.5">
                  <MathView tex={`y = (0.8)^{${hoverX.toFixed(1)}} = ${valB.toFixed(2)}`} />
                  <span className="block font-bold text-emerald-700 mt-0.5">✅ 한계선 아래 안전 관리</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right / Bottom: Explanatory Context Box */}
        <div className="lg:col-span-5 space-y-4">
          {/* Exact Text from Workbook */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2 text-xs leading-relaxed text-amber-950 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm border-b border-amber-200 pb-2">
              <Activity className="w-4 h-4 text-amber-700" />
              <span>워크북 핵심 원리 분석</span>
            </div>
            <blockquote className="italic bg-white/70 p-3 rounded-lg border border-amber-200 text-slate-800 font-medium">
              &ldquo;뾰족한 그래프(상황 A)는 짧은 시간에 환자가 폭증하여 이 선을 뚫고 올라가고 이때 병실과 의료진이 부족해져 치료받지 못하는 사람이 생기는 <strong>&apos;의료 시스템 붕괴&apos;</strong>가 발생한다. 반면, <strong>평탄한 그래프</strong>는 전체 환자 수는 비슷하더라도 수용 한계 아래를 유지하여 모두가 적절한 치료를 받을 수 있게 한다.&rdquo;
            </blockquote>
            <p className="text-[11px] text-amber-900 pt-1">
              • <strong>의료 시스템 수용 한계선:</strong> 중환자 병상, 인공호흡기, 전문 의료진의 절대적 한계를 나타내며, 감염 곡선이 이 선을 초과하면 치명률이 급격히 상승합니다.
            </p>
          </div>

          {/* Quick Comparison Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block">📊 두 그래프의 수학적 차이점 비교</span>
            <div className="space-y-1.5 text-slate-600 text-[11.5px]">
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                <span>
                  <strong>상황 A (<MathView tex="y = 3^x" />):</strong> 밑(Base)이 <MathView tex="3 > 1" />인 지수함수. <MathView tex="x = 2.1" /> 부근에서 한계선(10명)을 뚫고 폭증하여 <strong>기하급수적 의료 붕괴</strong> 초래.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 mt-1 shrink-0" />
                <span>
                  <strong>상황 B (<MathView tex="y = 0.8^x" />):</strong> 밑(Base)이 <MathView tex="0.8 < 1" />인 지수함수. 시간이 지날수록 감염자가 감소하여 <strong>수용 한계선 아래에서 자연 소멸</strong>.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Q1 & Q2 Workbook Questions and Answer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
        {/* Q1 Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 font-bold text-indigo-900 text-xs bg-indigo-100 px-2 py-0.5 rounded">
                <HelpCircle className="w-3 h-3 text-indigo-600" />
                <span>문제 Q1</span>
              </span>
              <button
                onClick={() => setAnsQ1(!ansQ1)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition cursor-pointer flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{ansQ1 ? '정답 접기' : '정답 확인'}</span>
              </button>
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
              &apos;의료 시스템 붕괴&apos;를 막기 위한 그래프는 무엇이며, 수학적으로 어떤 변수를 건드려야 할까?
            </h4>
          </div>

          {ansQ1 && (
            <div className="p-3.5 bg-indigo-50/90 border-l-4 border-indigo-600 rounded-r-lg text-xs space-y-2.5 animate-fadeIn text-slate-800">
              <div>
                <strong className="text-indigo-950 font-bold block mb-1">
                  1) 목표 그래프:
                </strong>
                <p className="text-slate-700 bg-white/70 p-2 rounded border border-indigo-200">
                  환자 발생을 시기별로 분산시키고 피크(정점)를 낮추는 <strong>&apos;평탄한 그래프&apos; (Flattening the Curve, 상황 B)</strong>
                </p>
              </div>

              <div>
                <strong className="text-indigo-950 font-bold block mb-1">
                  2) 수학적 조작 변수:
                </strong>
                <p className="text-slate-700 leading-relaxed">
                  기초감염재생산수 공식 <MathView tex="R_0 = \frac{\beta}{\gamma}" /> (또는 <MathView tex="R_0 = \beta \times D" />)에서:
                </p>
                <ul className="list-disc list-inside space-y-1 mt-1 text-slate-700 pl-1">
                  <li>
                    <strong>전파율/감염률(<MathView tex="\beta" />) 감소:</strong> 마스크 착용, 밀집도 제한, 손 씻기, 사회적 거리두기로 접촉당 전파 확률과 접촉 빈도를 줄임.
                  </li>
                  <li>
                    <strong>회복/격리율(<MathView tex="\gamma" />) 증가:</strong> 신속한 진단 검사 및 확진자 조기 격리로 바이러스 전파 유효 기간(<MathView tex="D = 1/\gamma" />)을 단축.
                  </li>
                </ul>
                <div className="mt-2 p-2 bg-indigo-100/60 rounded text-indigo-950 font-medium">
                  결과적으로 밑(Base)인 <MathView tex="R_0" /> 값을 <strong>1 미만</strong>으로 낮추어야 합니다.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Q2 Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1 font-bold text-rose-900 text-xs bg-rose-100 px-2 py-0.5 rounded">
                <HelpCircle className="w-3 h-3 text-rose-600" />
                <span>문제 Q2</span>
              </span>
              <button
                onClick={() => setAnsQ2(!ansQ2)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{ansQ2 ? '정답 접기' : '정답 확인'}</span>
              </button>
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
              <MathView tex="R_0 < 1" />이라는 수식의 의미는?
            </h4>
          </div>

          {ansQ2 && (
            <div className="p-3.5 bg-rose-50/90 border-l-4 border-rose-600 rounded-r-lg text-xs space-y-2.5 animate-fadeIn text-slate-800">
              <div>
                <strong className="text-rose-950 font-bold block mb-1">
                  1) 역학적(실제 현실) 의미:
                </strong>
                <p className="text-slate-700 bg-white/70 p-2 rounded border border-rose-200">
                  감염자 1명이 평균적으로 바이러스를 옮기는 2차 감염자의 수가 <strong>1명 미만</strong>이라는 뜻입니다.
                </p>
              </div>

              <div>
                <strong className="text-rose-950 font-bold block mb-1">
                  2) 수학적(지수함수 극한) 의미:
                </strong>
                <p className="text-slate-700 leading-relaxed">
                  감염자 수 모델 <MathView tex="y = I_0 \cdot (R_0)^t" />에서 밑(Base)이 <MathView tex="0 < R_0 < 1" />이므로:
                </p>
                <div className="my-1.5 p-2 bg-white rounded border border-rose-200 text-center font-mono font-bold text-rose-950">
                  <MathView tex="\lim_{t \to \infty} (R_0)^t = 0 \quad (\text{지수적 감쇠, Exponential Decay})" />
                </div>
                <p className="text-slate-700 leading-relaxed">
                  새로운 세대(<MathView tex="t" />)가 진행될수록 신규 감염자가 점차 0으로 수렴하여 <strong>감염 사슬이 끊어지고 감염병이 자연 소멸(종식)</strong>하게 됩니다.
                </p>
              </div>

              <div className="pt-2 border-t border-rose-200 flex items-center justify-between text-[11px] text-rose-900">
                <span>• <MathView tex="R_0 > 1" />: 지수 폭발 (대유행)</span>
                <span>• <MathView tex="R_0 = 1" />: 풍토병 (엔데믹)</span>
                <span>• <MathView tex="R_0 < 1" />: <strong>자연 종식 (성공)</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
