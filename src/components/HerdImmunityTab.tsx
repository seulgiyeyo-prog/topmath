import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MathView } from './MathView';
import {
  Trophy,
  Star,
  Play,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  TrendingDown,
  ShieldCheck,
  Flame,
  ArrowRight
} from 'lucide-react';

interface HerdImmunityTabProps {
  onCompleteMission: (xp: number, stars: number) => void;
  isMissionCompleted: boolean;
  onAddXP: (amount: number) => void;
  onLaunchConfetti: () => void;
  onOpenExplainModal: () => void;
}

interface NodePoint {
  x: number;
  y: number;
}

type NodeStatus = 'S' | 'V' | 'I' | 'R';

export const HerdImmunityTab: React.FC<HerdImmunityTabProps> = ({
  onCompleteMission,
  isMissionCompleted,
  onAddXP,
  onLaunchConfetti,
  onOpenExplainModal,
}) => {
  const NUM = 40;
  const [r0, setR0] = useState(4.0);
  const [speedVal, setSpeedVal] = useState(3);
  const [nodes, setNodes] = useState<NodePoint[]>([]);
  const [adjacency, setAdjacency] = useState<number[][]>([]);
  const [nodeStates, setNodeStates] = useState<NodeStatus[]>([]);
  const [tournPhase, setTournPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [savedStartNode, setSavedStartNode] = useState<number>(-1);
  const [cmpData, setCmpData] = useState<{ rand: number | null; hub: number | null }>({
    rand: null,
    hub: null,
  });
  const [roundNum, setRoundNum] = useState(0);
  const [newInfectedNodes, setNewInfectedNodes] = useState<number[]>([]);
  const [phaseLabel, setPhaseLabel] = useState('🔍 허브 구조 분석 중 — 보라색=슈퍼허브, 숫자=차수');

  const animTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Speed delay map
  const speedDelays = [900, 500, 280, 130, 55];
  const currentSpeedDelay = speedDelays[speedVal - 1];

  // Degree helper
  const getDegree = useCallback((i: number) => (adjacency[i] ? adjacency[i].length : 0), [adjacency]);

  // Build Scale-free Network (Barabási–Albert preferential attachment)
  const buildNetwork = useCallback(() => {
    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }

    const pts: NodePoint[] = [];
    const adj: number[][] = [];

    // 4-clique seed in the center
    const seeds: NodePoint[] = [
      { x: 500, y: 260 },
      { x: 420, y: 310 },
      { x: 580, y: 310 },
      { x: 500, y: 200 },
    ];
    seeds.forEach((p) => {
      pts.push(p);
      adj.push([]);
    });

    for (let i = 0; i < seeds.length; i++) {
      for (let j = i + 1; j < seeds.length; j++) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }

    // Add nodes with preferential attachment
    for (let i = seeds.length; i < NUM; i++) {
      const ang = Math.random() * 2 * Math.PI;
      const rad = 70 + Math.random() * 230;
      pts.push({
        x: Math.max(30, Math.min(970, 500 + rad * Math.cos(ang))),
        y: Math.max(30, Math.min(490, 260 + rad * Math.sin(ang))),
      });
      adj.push([]);

      // Preferential attachment power 1.8 -> creates clear super-hubs
      const weights = adj.slice(0, i).map((a) => Math.pow(a.length + 1, 1.8));
      const total = weights.reduce((s, v) => s + v, 0);
      let rr = Math.random() * total;
      let tgt = 0;
      for (let j = 0; j < weights.length; j++) {
        rr -= weights[j];
        if (rr <= 0) {
          tgt = j;
          break;
        }
      }
      adj[i].push(tgt);
      adj[tgt].push(i);

      // Occasional extra edge
      if (Math.random() < 0.4 && i > 4) {
        const w2 = adj.slice(0, i).map((a) => a.length + 0.5);
        const t2 = w2.reduce((s, v) => s + v, 0);
        let r2 = Math.random() * t2;
        let o = 0;
        for (let j = 0; j < w2.length; j++) {
          r2 -= w2[j];
          if (r2 <= 0) {
            o = j;
            break;
          }
        }
        if (!adj[i].includes(o)) {
          adj[i].push(o);
          adj[o].push(i);
        }
      }
    }

    setNodes(pts);
    setAdjacency(adj);
    setNodeStates(new Array(NUM).fill('S'));
    setTournPhase(0);
    setCmpData({ rand: null, hub: null });
    setRoundNum(0);
    setNewInfectedNodes([]);
    setPhaseLabel('🔍 허브 구조 분석 완료 — 보라색=슈퍼허브, 숫자=연결선(차수)');
  }, [NUM]);

  useEffect(() => {
    buildNetwork();
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, [buildNetwork]);

  // Top superhubs (indices)
  const topHubs = useMemo(() => {
    if (adjacency.length === 0) return [];
    return [...Array(NUM).keys()]
      .sort((a, b) => getDegree(b) - getDegree(a))
      .slice(0, 3);
  }, [adjacency, NUM, getDegree]);

  // Count infected/recovered
  const infectedCount = useMemo(() => {
    return nodeStates.filter((s) => s === 'I' || s === 'R').length;
  }, [nodeStates]);

  const infectedPercent = Math.round((infectedCount / NUM) * 100);

  // Run simulation step
  const runSimulation = useCallback(
    (initialVaccinated: number[], startNode: number, onDone: (totalInfected: number) => void) => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);

      const states: NodeStatus[] = new Array(NUM).fill('S');
      initialVaccinated.forEach((i) => {
        if (i !== startNode) states[i] = 'V';
      });
      states[startNode] = 'I';

      setNodeStates([...states]);
      setNewInfectedNodes([startNode]);

      const avgDeg = adjacency.reduce((s, a) => s + a.length, 0) / NUM;
      const infProb = Math.min(0.85, (r0 / Math.max(avgDeg, 1)) * 0.65);

      let currentStates = [...states];
      let stepCount = 0;

      const step = () => {
        stepCount++;
        setRoundNum(stepCount);

        const nextStates = [...currentStates];
        const newlyInfected: number[] = [];

        for (let i = 0; i < NUM; i++) {
          if (currentStates[i] !== 'I') continue;

          (adjacency[i] || []).forEach((j) => {
            if (nextStates[j] === 'S' && Math.random() < infProb) {
              nextStates[j] = 'I';
              newlyInfected.push(j);
            }
          });

          // Recovery probability
          if (Math.random() < 0.28) {
            nextStates[i] = 'R';
          }
        }

        currentStates = nextStates;
        setNodeStates([...currentStates]);
        setNewInfectedNodes(newlyInfected);

        const activeInfected = currentStates.filter((s) => s === 'I').length;

        if (activeInfected === 0 || stepCount >= 30) {
          animTimerRef.current = null;
          const finalCount = currentStates.filter((s) => s === 'I' || s === 'R').length;
          onAddXP(30);
          onDone(finalCount);
          return;
        }

        animTimerRef.current = setTimeout(step, currentSpeedDelay);
      };

      animTimerRef.current = setTimeout(step, 500);
    },
    [NUM, adjacency, r0, currentSpeedDelay, onAddXP]
  );

  // Handle Round 1: Random
  const handleStartRound1 = () => {
    if (tournPhase !== 0) return;
    setTournPhase(1);

    // Pick a fixed low-degree start node
    const sortedByDeg = [...Array(NUM).keys()].sort((a, b) => getDegree(a) - getDegree(b));
    const startNode = sortedByDeg[Math.floor(Math.random() * Math.min(6, sortedByDeg.length))];
    setSavedStartNode(startNode);

    // 10 random nodes vaccinated (excluding startNode)
    const pool = [...Array(NUM).keys()].filter((i) => i !== startNode);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const randVaccinated = pool.slice(0, 10);

    setPhaseLabel('🎲 Round 1: 무작위 접종 (10명) 진행 중... 확산 관찰');

    runSimulation(randVaccinated, startNode, (finalInfected) => {
      setCmpData((prev) => ({ ...prev, rand: finalInfected }));
      setTournPhase(2);
      setPhaseLabel('✅ Round 1 완료! 이제 똑같은 조건에서 [허브 접종]으로 도전해 보세요!');
    });
  };

  // Handle Round 2: Hub
  const handleStartRound2 = () => {
    if (tournPhase !== 2) return;
    setTournPhase(3);

    // Top 10 highest degree nodes (excluding startNode)
    const hubVaccinated = [...Array(NUM).keys()]
      .filter((i) => i !== savedStartNode)
      .sort((a, b) => getDegree(b) - getDegree(a))
      .slice(0, 10);

    setPhaseLabel('🎯 Round 2: 허브 접종 (상위 10명) 진행 중... 길목 차단 효과 관찰');

    runSimulation(hubVaccinated, savedStartNode, (finalInfected) => {
      setCmpData((prev) => ({ ...prev, hub: finalInfected }));
      setTournPhase(4);
      setPhaseLabel('🏆 토너먼트 종료! 대결 결과를 확인하세요');

      const randResult = cmpData.rand || 0;
      if (finalInfected < randResult) {
        onLaunchConfetti();
        onCompleteMission(150, 3);
      }
    });
  };

  const herdThreshold = ((1 - 1 / r0) * 100).toFixed(1);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Title & Top Explanation Button Banner */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            집단면역 전략 대결 🦠🎮 — 무작위 vs 허브
          </h2>
          <p className="text-sm text-[#7DBFB0]">
            동일한 네트워크와 시작 감염자 조건에서, <b>무작위 접종</b>과 <b>허브 접종</b>의 확산 방어력을 직접 대결시켜 보세요!
          </p>
        </div>

        {/* PROMINENT 중학생 눈높이 해설 버튼 */}
        <button
          onClick={onOpenExplainModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C084FC]/25 to-[#3FA796]/25 border-2 border-[#C084FC] hover:border-[#F2B84B] text-[#EAFBF6] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-[#C084FC]/30 hover:scale-105 active:scale-95 group cursor-pointer"
        >
          <span className="p-1 rounded-md bg-[#C084FC] text-[#0A1A18] text-xs font-mono font-bold group-hover:bg-[#F2B84B]">
            중학생 특강
          </span>
          <BookOpen className="w-4 h-4 text-[#C084FC] group-hover:text-[#F2B84B]" />
          <span>📖 왜 차이가 날까? (단계별 원리 설명)</span>
        </button>
      </div>

      {/* Mission Box */}
      <div className="bg-gradient-to-r from-[#C084FC]/15 to-[#3FA796]/15 border border-[#C084FC]/40 rounded-xl p-3.5 flex items-start gap-3">
        <Trophy className="w-5 h-5 text-[#F2B84B] flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs sm:text-sm">
          <div className="font-mono text-[11px] text-[#C084FC] font-bold tracking-wider">
            MISSION 6: 집단면역 토너먼트 마스터
          </div>
          <div className="text-[#EAFBF6] mt-0.5">
            ① 무작위 실행 → ② 허브 실행 → ③ 결과 비교! 허브 접종이 감염자를 훨씬 적게 만드는 것을 증명하세요.
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[#F2B84B] text-xs">
            <span>보상: +150 XP + 승리 시 🎉 축하 컨페티</span>
            <div className="flex text-sm">
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* R0 and Herd Immunity Threshold */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div className="sm:col-span-2 bg-[#1A3D37] border border-[#234E47] rounded-xl p-3.5 space-y-1.5">
          <div className="flex justify-between text-xs text-[#7DBFB0]">
            <span>기초감염재생산수 (R₀) 조절</span>
            <span className="font-mono font-bold text-[#F2B84B]">{r0.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="1.1"
            max="20"
            step="0.1"
            value={r0}
            onChange={(e) => setR0(Number(e.target.value))}
            className="w-full accent-[#F2B84B]"
          />
        </div>

        <div className="bg-[#1A3D37] border border-[#234E47] rounded-xl p-3 text-center sm:text-left">
          <div className="text-[11px] text-[#7DBFB0]">수학적 집단면역 임계치</div>
          <div className="font-mono text-2xl font-bold text-[#3FA796]">{herdThreshold}%</div>
          <div className="text-[10px] text-[#7DBFB0]">
            <MathView math="p_c = 1 - \frac{1}{R_0}" /> 이상 면역 시 확산 차단
          </div>
        </div>
      </div>

      {/* Phase Steps Indicator */}
      <div className="grid grid-cols-4 border border-[#234E47] rounded-xl overflow-hidden text-center text-xs">
        {[
          { icon: '🌐', label: '네트워크 분석', active: tournPhase === 0 },
          { icon: '🎲', label: 'Round 1: 무작위', active: tournPhase === 1 },
          { icon: '🎯', label: 'Round 2: 허브', active: tournPhase === 2 || tournPhase === 3 },
          { icon: '📊', label: '결과 비교', active: tournPhase === 4 },
        ].map((step, idx) => (
          <div
            key={idx}
            className={`p-2 border-r border-[#234E47] last:border-r-0 transition-colors ${
              step.active
                ? 'bg-[#F2B84B]/20 text-[#F2B84B] font-bold border-b-2 border-b-[#F2B84B]'
                : 'bg-[#132E29] text-[#7DBFB0]'
            }`}
          >
            <div className="text-base sm:text-lg">{step.icon}</div>
            <div className="text-[10px] sm:text-xs mt-0.5 whitespace-nowrap">{step.label}</div>
          </div>
        ))}
      </div>

      {/* Large SVG Network Stage */}
      <div className="relative bg-[#0A1A18] border-2 border-[#234E47] rounded-2xl overflow-hidden">
        {/* Phase status badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded-full bg-[#0A1A18]/90 border border-[#F2B84B] text-xs font-mono text-[#F2B84B] shadow-lg pointer-events-none whitespace-nowrap">
          {phaseLabel}
        </div>

        {/* Round display */}
        <div className="absolute top-3 right-3 z-10 font-mono text-xs text-[#F2B84B] bg-[#132E29]/80 px-2 py-1 rounded border border-[#234E47]">
          {roundNum > 0 ? `진행: ${roundNum}단계` : '대기 중'}
        </div>

        {/* Infected overlay */}
        {infectedCount > 0 && (
          <div className="absolute bottom-4 left-4 z-10 font-mono text-xs text-[#FF6B5C] bg-[#0A1A18]/80 px-2.5 py-1 rounded border border-[#FF6B5C]/30">
            🔴 총 감염: {infectedCount}명 ({infectedPercent}%)
          </div>
        )}

        {/* Spread progress bar at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#132E29] z-10">
          <div
            className="h-full bg-gradient-to-r from-[#FF6B5C] to-[#F2B84B] transition-all duration-300"
            style={{ width: `${infectedPercent}%` }}
          />
        </div>

        {/* SVG Canvas */}
        <svg viewBox="0 0 1000 520" className="w-full h-auto select-none">
          {/* Edges */}
          {adjacency.map((neighbors, i) =>
            neighbors.map((j) => {
              if (i >= j) return null;
              const p1 = nodes[i];
              const p2 = nodes[j];
              if (!p1 || !p2) return null;

              const bothInfected =
                (nodeStates[i] === 'I' || nodeStates[i] === 'R') &&
                (nodeStates[j] === 'I' || nodeStates[j] === 'R');
              const isHubEdge = topHubs.includes(i) || topHubs.includes(j);

              return (
                <line
                  key={`${i}-${j}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={
                    bothInfected
                      ? 'rgba(255,107,92,0.7)'
                      : isHubEdge
                      ? 'rgba(192,132,252,0.5)'
                      : 'rgba(42,90,82,0.7)'
                  }
                  strokeWidth={bothInfected ? 3.5 : isHubEdge ? 2.2 : 1.4}
                />
              );
            })
          )}

          {/* Newly infected ripple circles */}
          {newInfectedNodes.map((nodeIdx) => {
            const p = nodes[nodeIdx];
            if (!p) return null;
            return (
              <circle
                key={`ripple-${nodeIdx}`}
                cx={p.x}
                cy={p.y}
                r="26"
                fill="none"
                stroke="#FF6B5C"
                strokeWidth="2.5"
                opacity="0.8"
                className="animate-ping"
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((p, i) => {
            const state = nodeStates[i];
            const d = getDegree(i);
            const isSuperHub = topHubs.includes(i);
            const r = 10 + d * 1.4;

            let fill = '#1A3D37';
            let stroke = '#3FA796';
            let sw = 1.5;

            if (state === 'V') {
              fill = '#3FA796';
              stroke = '#7BDBCA';
              sw = 2.5;
            } else if (state === 'I') {
              fill = '#FF6B5C';
              stroke = '#FF9585';
              sw = 3;
            } else if (state === 'R') {
              fill = '#F2B84B';
              stroke = '#F5CC7A';
              sw = 2;
            } else if (isSuperHub && tournPhase === 0) {
              fill = 'rgba(192,132,252,0.3)';
              stroke = '#C084FC';
              sw = 3;
            }

            return (
              <g key={i}>
                {/* Glow for Super Hubs */}
                {isSuperHub && state === 'S' && tournPhase === 0 && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={r + 8}
                    fill="none"
                    stroke="#C084FC"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                    opacity="0.5"
                  />
                )}
                <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke={stroke} strokeWidth={sw} />
                <text
                  x={p.x}
                  y={p.y + 4}
                  fill={state === 'S' && !isSuperHub ? '#EAFBF6' : '#0A1A18'}
                  fontSize={d >= 8 ? 13 : d >= 4 ? 11 : 9}
                  fontWeight="bold"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                >
                  {state === 'V' ? 'V' : state === 'I' ? 'I' : d}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#7DBFB0]">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#1A3D37] border border-[#3FA796]" />
          <span>미감염 (S)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#3FA796] border border-[#7BDBCA]" />
          <span>면역·백신 (V)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#FF6B5C] border border-[#FF9585]" />
          <span>감염중 (I)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#F2B84B] border border-[#F5CC7A]" />
          <span>회복 (R)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#C084FC]/30 border-2 border-[#C084FC]" />
          <span>슈퍼허브 👑</span>
        </div>
      </div>

      {/* Control Panel: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        {/* Column 1: Action Controls */}
        <div className="bg-[#1A3D37] border border-[#234E47] rounded-xl p-4 space-y-3">
          <div className="p-2.5 rounded-lg bg-[#0A1A18] border border-[#234E47] text-xs">
            <div className="text-[10px] font-mono text-[#C084FC] uppercase font-bold">
              {tournPhase === 0
                ? 'READY'
                : tournPhase === 1
                ? 'ROUND 1 실행 중'
                : tournPhase === 2
                ? 'ROUND 1 완료'
                : tournPhase === 3
                ? 'ROUND 2 실행 중'
                : '대결 완료'}
            </div>
            <div className="text-[#EAFBF6] text-[11px] mt-0.5">
              {tournPhase === 0
                ? '아래 버튼을 눌러 무작위 접종부터 대결을 시작하세요!'
                : tournPhase === 1
                ? '🎲 무작위 10명 접종 후 바이러스가 퍼지는 중...'
                : tournPhase === 2
                ? '이제 같은 조건에서 허브 10명을 접종해 결과를 비교하세요!'
                : tournPhase === 3
                ? '🎯 핵심 교차로(허브) 10곳을 차단하여 방어 중...'
                : '대결이 끝났습니다! 오른쪽 결과표를 확인하세요.'}
            </div>
          </div>

          {/* Dynamic Play Button */}
          {tournPhase === 0 && (
            <button
              onClick={handleStartRound1}
              className="w-full py-3 px-3 rounded-xl bg-[#F2B84B] hover:bg-[#ffc65a] text-[#0A1A18] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#F2B84B]/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>▶ Round 1: 무작위 접종 시작</span>
            </button>
          )}

          {tournPhase === 1 && (
            <button
              disabled
              className="w-full py-3 px-3 rounded-xl bg-[#234E47] text-[#7DBFB0] font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <span>⏳ 무작위 확산 진행 중...</span>
            </button>
          )}

          {tournPhase === 2 && (
            <button
              onClick={handleStartRound2}
              className="w-full py-3 px-3 rounded-xl bg-[#3FA796] hover:bg-[#52c1af] text-[#0A1A18] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#3FA796]/30 animate-pulse"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>▶ Round 2: 허브 접종 시작 (대결!)</span>
            </button>
          )}

          {tournPhase === 3 && (
            <button
              disabled
              className="w-full py-3 px-3 rounded-xl bg-[#234E47] text-[#7DBFB0] font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed"
            >
              <span>⏳ 허브 방어 진행 중...</span>
            </button>
          )}

          {tournPhase === 4 && (
            <button
              onClick={buildNetwork}
              className="w-full py-2.5 px-3 rounded-xl bg-[#132E29] hover:bg-[#234E47] text-[#F2B84B] border border-[#F2B84B]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>🔄 새 네트워크로 다시 대결</span>
            </button>
          )}

          {/* Reset button */}
          <button
            onClick={buildNetwork}
            className="w-full py-2 px-3 rounded-lg bg-[#132E29] hover:bg-[#234E47] text-[#7DBFB0] hover:text-white border border-[#234E47] text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>새 네트워크 생성</span>
          </button>

          {/* Speed slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-[#7DBFB0]">
              <span>시뮬레이션 속도</span>
              <span className="font-mono text-xs text-[#F2B84B]">
                {['매우 느림', '느리게', '보통', '빠르게', '초고속'][speedVal - 1]}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={speedVal}
              onChange={(e) => setSpeedVal(Number(e.target.value))}
              className="w-full accent-[#F2B84B]"
            />
          </div>
        </div>

        {/* Column 2: Live Status & Hub Ranking */}
        <div className="bg-[#1A3D37] border border-[#234E47] rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-[#C084FC] flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#FF6B5C]" />
            <span>실시간 현황</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-[#0A1A18] border border-[#FF6B5C]/30 text-center">
              <div className="text-[10px] text-[#7DBFB0]">누적 감염자</div>
              <div className="font-mono text-2xl font-bold text-[#FF6B5C]">
                {infectedCount > 0 ? `${infectedCount}명` : '—'}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#0A1A18] border border-[#F2B84B]/30 text-center">
              <div className="text-[10px] text-[#7DBFB0]">감염율</div>
              <div className="font-mono text-2xl font-bold text-[#F2B84B]">
                {infectedCount > 0 ? `${infectedPercent}%` : '—'}
              </div>
            </div>
          </div>

          {/* Hub Ranking List */}
          <div>
            <div className="text-xs font-bold text-[#C084FC] mb-1.5 flex items-center justify-between">
              <span>🔗 슈퍼 허브 차수 순위 (Top 5)</span>
              <span className="text-[10px] text-[#7DBFB0]">연결선 수</span>
            </div>
            <div className="space-y-1">
              {[...Array(NUM).keys()]
                .sort((a, b) => getDegree(b) - getDegree(a))
                .slice(0, 5)
                .map((nodeIdx, rank) => {
                  const d = getDegree(nodeIdx);
                  const isTop = rank < 3;
                  return (
                    <div
                      key={nodeIdx}
                      className="flex items-center justify-between px-2 py-1 rounded bg-[#0A1A18] text-xs font-mono"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={isTop ? 'text-[#C084FC] font-bold' : 'text-[#7DBFB0]'}>
                          {rank + 1}위
                        </span>
                        <span className="text-white">노드 #{nodeIdx + 1}</span>
                        {isTop && <span>👑</span>}
                      </div>
                      <span className="text-[#F2B84B] font-bold">{d}개</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Column 3: Strategy Comparison Results */}
        <div className="bg-[#1A3D37] border border-[#234E47] rounded-xl p-4 space-y-3">
          <div className="text-xs font-bold text-[#C084FC] flex items-center justify-between">
            <span>⚔️ 전략 대결 결과</span>
            <span className="text-[10px] text-[#7DBFB0]">총 40명 중</span>
          </div>

          {/* Random result */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#FF6B5C] font-bold flex items-center gap-1">
                <span>🎲</span> Round 1: 무작위 접종
              </span>
              <span className="font-mono text-sm font-bold text-[#FF6B5C]">
                {cmpData.rand !== null ? `${cmpData.rand}명 (${Math.round((cmpData.rand / NUM) * 100)}%)` : '—'}
              </span>
            </div>
            <div className="h-4 bg-[#0A1A18] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B5C] to-[#FF9585] transition-all duration-700"
                style={{ width: cmpData.rand !== null ? `${(cmpData.rand / NUM) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Hub result */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#3FA796] font-bold flex items-center gap-1">
                <span>🎯</span> Round 2: 허브 접종
              </span>
              <span className="font-mono text-sm font-bold text-[#3FA796]">
                {cmpData.hub !== null ? `${cmpData.hub}명 (${Math.round((cmpData.hub / NUM) * 100)}%)` : '—'}
              </span>
            </div>
            <div className="h-4 bg-[#0A1A18] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3FA796] to-[#7BDBCA] transition-all duration-700"
                style={{ width: cmpData.hub !== null ? `${(cmpData.hub / NUM) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Comparison conclusion */}
          {cmpData.rand !== null && cmpData.hub !== null && (
            <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#3FA796] text-xs text-center space-y-1 animate-in zoom-in-95 duration-300">
              <div className="font-bold text-[#4ADE80] flex items-center justify-center gap-1 text-sm">
                <Trophy className="w-4 h-4 text-[#F2B84B]" />
                <span>허브 접종 전략 압승!</span>
              </div>
              <p className="text-[#D1F2EB] text-[11px]">
                허브 접종이 무작위보다 무려 <b>{cmpData.rand - cmpData.hub}명</b>이나 감염자를 더 적게 만들었습니다!
              </p>
            </div>
          )}

          {/* WHY IT DIFFERS BUTTON (중학생 맞춤 설명 열기) */}
          <div className="pt-2 border-t border-[#234E47]">
            <button
              onClick={onOpenExplainModal}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#C084FC]/20 to-[#3FA796]/20 hover:from-[#C084FC]/30 hover:to-[#3FA796]/30 border border-[#C084FC] text-[#EAFBF6] text-xs font-bold flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C084FC]" />
              <span>📖 왜 이런 차이가 날까? (중학생 눈높이 해설)</span>
            </button>
            <p className="text-[10px] text-[#7DBFB0] text-center mt-1">
              버튼을 누르면 다음 설명으로 넘겨가며 자세히 배울 수 있어요!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
