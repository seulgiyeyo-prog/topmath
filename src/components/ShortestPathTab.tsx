import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MathView } from './MathView';
import { Zap, Star, RotateCcw, CheckCircle2, Clock, Layers, Sparkles, AlertCircle } from 'lucide-react';

interface ShortestPathTabProps {
  onCompleteMission: (xp: number, stars: number) => void;
  isMissionCompleted: boolean;
  onAddXP: (amount: number) => void;
  bestTime: number | null;
  onSaveBestTime: (timeMs: number) => void;
}

interface GraphStage {
  id: string;
  name: string;
  difficulty: string;
  description: string;
  startNode: number;
  endNode: number;
  positions: Record<number, { x: number; y: number }>;
  adj: Record<number, number[]>;
}

export const ShortestPathTab: React.FC<ShortestPathTabProps> = ({
  onCompleteMission,
  isMissionCompleted,
  bestTime,
  onSaveBestTime,
}) => {
  const STAGES: GraphStage[] = [
    {
      id: 'pyramid',
      name: '피라미드 계층망',
      difficulty: '기본 (10개 노드)',
      description: '1번 노드에서 10번 노드로 전진하는 표준 5계층 피라미드 구조입니다.',
      startNode: 0,
      endNode: 9,
      positions: {
        0: { x: 70, y: 180 },
        1: { x: 185, y: 140 },
        2: { x: 185, y: 220 },
        3: { x: 300, y: 100 },
        4: { x: 300, y: 180 },
        5: { x: 300, y: 260 },
        6: { x: 415, y: 100 },
        7: { x: 415, y: 180 },
        8: { x: 415, y: 260 },
        9: { x: 530, y: 180 },
      },
      adj: {
        0: [1, 2],
        1: [0, 3, 4],
        2: [0, 4, 5],
        3: [1, 6],
        4: [1, 2, 6, 7],
        5: [2, 7, 8],
        6: [3, 4, 9],
        7: [4, 5, 9],
        8: [5, 9],
        9: [6, 7, 8],
      },
    },
    {
      id: 'diamond',
      name: '다이아몬드 순환망',
      difficulty: '중급 (10개 노드)',
      description: '상하로 갈라지는 다이아몬드 우회로와 고속 지름길이 공존하는 네트워크입니다.',
      startNode: 0,
      endNode: 9,
      positions: {
        0: { x: 70, y: 180 },
        1: { x: 160, y: 110 },
        2: { x: 160, y: 250 },
        3: { x: 260, y: 70 },
        4: { x: 270, y: 180 },
        5: { x: 260, y: 290 },
        6: { x: 370, y: 90 },
        7: { x: 370, y: 270 },
        8: { x: 450, y: 180 },
        9: { x: 540, y: 180 },
      },
      adj: {
        0: [1, 2, 4],
        1: [0, 3, 4],
        2: [0, 4, 5],
        3: [1, 6],
        4: [0, 1, 2, 8],
        5: [2, 7],
        6: [3, 8, 9],
        7: [5, 8, 9],
        8: [4, 6, 7, 9],
        9: [6, 7, 8],
      },
    },
    {
      id: 'grid-maze',
      name: '격자형 병목 네트워크',
      difficulty: '고급 (11개 노드)',
      description: '중앙의 핵심 병목 노드(6번)를 거치거나 긴 외곽 둘레길을 선택해야 합니다.',
      startNode: 0,
      endNode: 10,
      positions: {
        0: { x: 60, y: 180 },
        1: { x: 150, y: 100 },
        2: { x: 150, y: 260 },
        3: { x: 240, y: 100 },
        4: { x: 240, y: 260 },
        5: { x: 300, y: 180 }, // 중앙 병목 허브
        6: { x: 370, y: 100 },
        7: { x: 370, y: 260 },
        8: { x: 460, y: 100 },
        9: { x: 460, y: 260 },
        10: { x: 540, y: 180 },
      },
      adj: {
        0: [1, 2],
        1: [0, 3],
        2: [0, 4],
        3: [1, 5, 6],
        4: [2, 5, 7],
        5: [3, 4, 6, 7],
        6: [3, 5, 8],
        7: [4, 5, 9],
        8: [6, 10],
        9: [7, 10],
        10: [8, 9],
      },
    },
  ];

  const [currentStageId, setCurrentStageId] = useState<string>('pyramid');
  const stage = useMemo(() => STAGES.find((s) => s.id === currentStageId) || STAGES[0], [currentStageId]);

  const { positions, adj, startNode, endNode } = stage;
  const totalNodes = Object.keys(positions).length;

  // Compute shortest path length from startNode to endNode using BFS
  const bestLen = useMemo(() => {
    const dist = new Array(totalNodes).fill(Infinity);
    dist[startNode] = 0;
    const q = [startNode];
    while (q.length > 0) {
      const u = q.shift()!;
      (adj[u] || []).forEach((v) => {
        if (dist[v] === Infinity) {
          dist[v] = dist[u] + 1;
          q.push(v);
        }
      });
    }
    return dist[endNode];
  }, [adj, startNode, endNode, totalNodes]);

  const [path, setPath] = useState<number[]>([startNode]);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'ok' | 'bad' | 'info' } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

  // Switch stage helper
  const handleSelectStage = (stageId: string) => {
    setCurrentStageId(stageId);
    const target = STAGES.find((s) => s.id === stageId) || STAGES[0];
    setPath([target.startNode]);
    setTimerRunning(false);
    setElapsed(0);
    setStatusMsg(null);
  };

  useEffect(() => {
    if (timerRunning) {
      startTimeRef.current = Date.now() - elapsed;
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m < 10 ? '0' + m : m}:${sec < 10 ? '0' + sec : sec}`;
  };

  const lastNode = path[path.length - 1];

  // Candidates connected to current head that are not yet visited
  const validNextNodes = useMemo(() => {
    const neighbors = adj[lastNode] || [];
    return neighbors.filter((v) => !path.includes(v));
  }, [adj, lastNode, path]);

  const handleNodeClick = (nodeId: number) => {
    // 1. Clicked an already visited node in path -> Roll back easily
    if (path.includes(nodeId)) {
      if (nodeId === lastNode && path.length > 1) {
        setPath((prev) => prev.slice(0, -1));
        setStatusMsg(null);
        return;
      }
      const idx = path.indexOf(nodeId);
      setPath((prev) => prev.slice(0, idx + 1));
      setStatusMsg({
        text: `📍 ${nodeId + 1}번 노드로 경로를 되돌렸습니다.`,
        type: 'info',
      });
      return;
    }

    // 2. Clicked a direct neighbor of current head -> Extend path!
    const neighbors = adj[lastNode] || [];
    if (neighbors.includes(nodeId)) {
      if (path.length === 1 && !timerRunning) {
        setTimerRunning(true);
      }
      const nextPath = [...path, nodeId];
      setPath(nextPath);
      setStatusMsg(null);

      // Reached destination?
      if (nodeId === endNode) {
        setStatusMsg({
          text: `🎯 도착점(${endNode + 1}번)에 도달했습니다! 아래 [정답 확인하기]를 눌러보세요!`,
          type: 'info',
        });
      }
      return;
    }

    // 3. Clicked a non-adjacent node -> Give helpful guidance without jitter
    const reachableList = validNextNodes.map((v) => `${v + 1}번`).join(', ');
    setStatusMsg({
      text: `⚠️ ${nodeId + 1}번은 현재 위치(${lastNode + 1}번)와 직접 연결되어 있지 않습니다. 초록색 점선으로 깜빡이는 [${reachableList}] 중 하나를 눌러주세요!`,
      type: 'bad',
    });
  };

  const handleCheck = () => {
    if (path[path.length - 1] !== endNode) {
      setStatusMsg({
        text: `아직 ${endNode + 1}번 도착 노드에 도달하지 않았습니다. 끝까지 연결해 보세요!`,
        type: 'bad',
      });
      return;
    }

    setTimerRunning(false);
    const len = path.length - 1;

    if (len === bestLen) {
      const isFast = elapsed <= 30000;
      const xp = isFast ? 80 : 40;
      setStatusMsg({
        text: `🎉 축하합니다! 최단 경로(${bestLen}단계) 발견! 소요 시간: ${formatTime(elapsed)}${isFast ? ' ⚡ 30초 내 초고속 보너스!' : ''}`,
        type: 'ok',
      });
      onCompleteMission(xp, isFast ? 3 : 2);
      if (!bestTime || elapsed < bestTime) {
        onSaveBestTime(elapsed);
      }
    } else {
      setStatusMsg({
        text: `도착했지만 최단 경로가 아닙니다. (현재: ${len}단계, 최단: ${bestLen}단계). 돌아가서 더 짧은 경로를 찾아보세요!`,
        type: 'bad',
      });
    }
  };

  const handleReset = () => {
    setPath([startNode]);
    setStatusMsg(null);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setElapsed(0);
    setPath([startNode]);
    setStatusMsg(null);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#234E47] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
            최단 경로 탐험 ⏱️
          </h2>
          <p className="text-xs sm:text-sm text-[#7DBFB0] mt-0.5">
            시작(초록)에서 도착(빨강)까지 최소 단계로 연결하세요. <strong>초록색 점선으로 깜빡이는 다음 이웃 노드</strong>를 누르면 경로가 만들어집니다!
          </p>
        </div>

        {/* Stage Selector Pills */}
        <div className="flex items-center bg-[#0A1A18] p-1 rounded-xl border border-[#234E47] gap-1">
          {STAGES.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectStage(s.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentStageId === s.id
                  ? 'bg-[#F2B84B] text-[#0A1A18] shadow-sm'
                  : 'text-[#7DBFB0] hover:text-white'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mission & Guidance Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 bg-gradient-to-r from-[#FF6B5C]/10 to-[#F2B84B]/10 border border-[#FF6B5C]/30 rounded-xl p-3 flex items-start gap-3">
          <Zap className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <div className="font-mono text-[11px] text-[#FF6B5C] font-bold tracking-wider">
              {stage.name} 도전 과제
            </div>
            <div className="text-[#EAFBF6] mt-0.5">
              {stage.description} <b>최단 경로({bestLen}단계)</b>를 찾아 <b>30초 안에</b> 도달하면 초고속 보너스 XP!
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[#F2B84B] text-[11px]">
              <span>보상: +40 XP (30초 이내 시 +80 XP)</span>
              <div className="flex text-xs">
                <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
                <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
                <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Formula Box */}
        <div className="bg-[#0A1A18] border border-[#234E47] rounded-xl p-3 flex flex-col justify-center">
          <div className="text-[10px] font-mono text-[#C084FC] tracking-wider uppercase mb-1">
            최단 경로의 수학적 정의
          </div>
          <MathView math="d(u,v) = \min \{ |P| : P \text{ is a path} \}" display={true} className="text-[#EAFBF6] text-xs" />
        </div>
      </div>

      {/* Main Grid: SVG Canvas + Control Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* SVG Canvas */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#234E47] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg viewBox="0 0 600 360" className="w-full h-auto select-none">
            {/* Grid Pattern Lines */}
            <defs>
              <pattern id="path-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#234E47" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="600" height="360" fill="url(#path-grid)" />

            {/* Background Graph Edges */}
            {Object.keys(adj).map((uStr) => {
              const u = Number(uStr);
              const p1 = positions[u];
              if (!p1) return null;
              const neighbors = adj[u] || [];
              return neighbors.map((v) => {
                if (u >= v) return null;
                const p2 = positions[v];
                if (!p2) return null;
                return (
                  <line
                    key={`${u}-${v}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#1A3D37"
                    strokeWidth="3"
                  />
                );
              });
            })}

            {/* Selected Path Edges */}
            {path.map((node, i) => {
              if (i === path.length - 1) return null;
              const nextNode = path[i + 1];
              const p1 = positions[node];
              const p2 = positions[nextNode];
              if (!p1 || !p2) return null;
              return (
                <line
                  key={`path-${i}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#F2B84B"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              );
            })}

            {/* Nodes */}
            {Array.from({ length: totalNodes }).map((_, id) => {
              const p = positions[id];
              if (!p) return null;
              const isStart = id === startNode;
              const isEnd = id === endNode;
              const inPath = path.includes(id);
              const isCurrentHead = id === lastNode;
              const isClickableNext = validNextNodes.includes(id);

              let fill = '#132E29';
              if (isStart) fill = '#3FA796';
              else if (isEnd) fill = '#FF6B5C';
              else if (inPath) fill = '#F2B84B';

              return (
                <g
                  key={id}
                  onClick={() => handleNodeClick(id)}
                  className="cursor-pointer"
                >
                  {/* Invisible Hitbox to prevent miss-clicks */}
                  <circle cx={p.x} cy={p.y} r="26" fill="transparent" />

                  {/* Pulsing Guide Ring on Valid Next Step Nodes */}
                  {isClickableNext && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="24"
                      fill="none"
                      stroke="#4ADE80"
                      strokeWidth="2.5"
                      strokeDasharray="4 3"
                      className="animate-pulse opacity-90"
                    />
                  )}

                  {/* Glowing Ring on Current Position */}
                  {isCurrentHead && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="23"
                      fill="none"
                      stroke="#F2B84B"
                      strokeWidth="2"
                    />
                  )}

                  {/* Node Circle (No CSS scale on <g> to prevent SVG jitter!) */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={inPath || isCurrentHead ? 19 : isClickableNext ? 18 : 16}
                    fill={fill}
                    stroke={
                      isCurrentHead
                        ? '#FFFFFF'
                        : isClickableNext
                        ? '#4ADE80'
                        : inPath || isStart || isEnd
                        ? '#EAFBF6'
                        : '#3FA796'
                    }
                    strokeWidth={isCurrentHead ? 3 : 2}
                  />

                  {/* Node Number Text */}
                  <text
                    x={p.x}
                    y={p.y + 4.5}
                    fill={inPath || isStart || isEnd ? '#0A1A18' : '#EAFBF6'}
                    fontSize={12}
                    fontWeight="800"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                    pointerEvents="none"
                  >
                    {id + 1}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Quick Helper Floating Footer */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-[#7DBFB0] bg-[#0A1A18]/80 px-2.5 py-1 rounded-lg border border-[#234E47]">
            <div className="flex items-center gap-1.5">
              <span>🟢 시작: <strong>{startNode + 1}번</strong></span>
              <span>→</span>
              <span>🔴 도착: <strong>{endNode + 1}번</strong></span>
            </div>
            <div className="text-[#4ADE80] font-semibold">
              ✨ 초록 점선 깜빡임: 다음 클릭 가능 노드 ({validNextNodes.map((v) => v + 1).join(', ') || '없음'})
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="bg-[#1A3D37] border border-[#234E47] rounded-xl p-4 space-y-3.5">
          {/* Timer Display */}
          <div className="text-center p-3 rounded-xl bg-[#0A1A18] border border-[#234E47]">
            <div className="text-[11px] text-[#7DBFB0] flex items-center justify-center gap-1 mb-0.5">
              <Clock className="w-3.5 h-3.5 text-[#FF6B5C]" />
              <span>진행 시간</span>
            </div>
            <div className="font-mono text-3xl font-bold text-[#FF6B5C] tracking-wider">
              {formatTime(elapsed)}
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-2 border-t border-[#234E47] pt-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">내 경로 단계 수</span>
              <span className="font-mono text-base font-bold text-[#FF6B5C]">
                {Math.max(0, path.length - 1)}단계
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">최단 경로 단계 수</span>
              <span className="font-mono text-base font-bold text-[#3FA796]">{bestLen}단계</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">현재 위치</span>
              <span className="font-mono font-bold text-[#F2B84B]">{lastNode + 1}번 노드</span>
            </div>
          </div>

          {bestTime !== null && (
            <div className="p-2 rounded-lg bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-center">
              <div className="text-[10px] text-[#7DBFB0]">🏆 나의 최고 기록</div>
              <div className="font-mono text-sm font-bold text-[#4ADE80]">{formatTime(bestTime)}</div>
            </div>
          )}

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                statusMsg.type === 'ok'
                  ? 'bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40'
                  : statusMsg.type === 'info'
                  ? 'bg-[#7FC4EE]/20 text-[#7FC4EE] border border-[#7FC4EE]/40'
                  : 'bg-[#FF6B5C]/20 text-[#FF6B5C] border border-[#FF6B5C]/40'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleCheck}
              className="w-full py-2.5 px-3 rounded-lg bg-[#F2B84B] hover:bg-[#ffc65a] text-[#0A1A18] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#F2B84B]/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>정답 확인하기</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleReset}
                className="py-2 px-2 rounded-lg bg-[#132E29] hover:bg-[#234E47] text-[#7DBFB0] hover:text-white border border-[#234E47] text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>경로 리셋</span>
              </button>
              <button
                onClick={handleTimerReset}
                className="py-2 px-2 rounded-lg bg-[#132E29] hover:bg-[#234E47] text-[#7DBFB0] hover:text-white border border-[#234E47] text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>타이머 리셋</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
