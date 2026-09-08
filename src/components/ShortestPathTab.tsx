import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MathView } from './MathView';
import { Zap, Star, RotateCcw, CheckCircle2, Clock } from 'lucide-react';

interface ShortestPathTabProps {
  onCompleteMission: (xp: number, stars: number) => void;
  isMissionCompleted: boolean;
  onAddXP: (amount: number) => void;
  bestTime: number | null;
  onSaveBestTime: (timeMs: number) => void;
}

export const ShortestPathTab: React.FC<ShortestPathTabProps> = ({
  onCompleteMission,
  isMissionCompleted,
  bestTime,
  onSaveBestTime,
}) => {
  const layer = [[0], [1, 2], [3, 4, 5], [6, 7, 8], [9]];
  const positions = useMemo(() => {
    const pos: Record<number, { x: number; y: number }> = {};
    layer.forEach((ids, li) => {
      const x = 70 + li * 115;
      ids.forEach((id, k) => {
        pos[id] = { x, y: 180 + (k - (ids.length - 1) / 2) * 80 };
      });
    });
    return pos;
  }, []);

  const adj: Record<number, number[]> = useMemo(() => {
    const a: Record<number, number[]> = {
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
    };
    return a;
  }, []);

  // Compute shortest path length from 0 to 9 using BFS
  const bestLen = useMemo(() => {
    const dist = new Array(10).fill(Infinity);
    dist[0] = 0;
    const q = [0];
    while (q.length > 0) {
      const u = q.shift()!;
      (adj[u] || []).forEach((v) => {
        if (dist[v] === Infinity) {
          dist[v] = dist[u] + 1;
          q.push(v);
        }
      });
    }
    return dist[9];
  }, [adj]);

  const [path, setPath] = useState<number[]>([0]);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'ok' | 'bad' | 'info' } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);

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

  const handleNodeClick = (nodeId: number) => {
    const last = path[path.length - 1];

    if (nodeId === last && path.length > 1) {
      setPath((prev) => prev.slice(0, -1));
      return;
    }

    if ((adj[last] || []).includes(nodeId) && !path.includes(nodeId)) {
      if (path.length === 1 && !timerRunning) {
        setTimerRunning(true);
      }
      setPath((prev) => [...prev, nodeId]);
    }
  };

  const handleCheck = () => {
    if (path[path.length - 1] !== 9) {
      setStatusMsg({
        text: '아직 10번 노드에 도달하지 않았습니다. 끝까지 연결해 보세요!',
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
        text: `도착했지만 최단 경로가 아닙니다. (현재: ${len}단계, 최단: ${bestLen}단계)`,
        type: 'bad',
      });
    }
  };

  const handleReset = () => {
    setPath([0]);
    setStatusMsg(null);
  };

  const handleTimerReset = () => {
    setTimerRunning(false);
    setElapsed(0);
    setPath([0]);
    setStatusMsg(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">최단 경로 게임 ⏱️</h2>
        <p className="text-sm text-[#7DBFB0]">
          노드 1 → 노드 10까지 최소 단계로 도달하세요. 연결된 점을 순서대로 클릭하면 됩니다!
        </p>
      </div>

      {/* Mission Box */}
      <div className="bg-gradient-to-r from-[#FF6B5C]/10 to-[#F2B84B]/10 border border-[#FF6B5C]/30 rounded-xl p-3.5 flex items-start gap-3">
        <Zap className="w-5 h-5 text-[#FF6B5C] flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs sm:text-sm">
          <div className="font-mono text-[11px] text-[#FF6B5C] font-bold tracking-wider">
            MISSION 2: 최단 경로 속도 도전
          </div>
          <div className="text-[#EAFBF6] mt-0.5">
            <b>최단 경로({bestLen}단계)</b>를 찾아 <b>30초 안에</b> 완성하면 보너스 XP 획득!
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[#F2B84B] text-xs">
            <span>보상: +40 XP (30초 이내 시 +80 XP)</span>
            <div className="flex text-sm">
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Formula Box */}
      <div className="bg-black/30 border border-[#234E47] rounded-xl p-3">
        <div className="text-[10px] font-mono text-[#C084FC] tracking-wider uppercase mb-1">
          최단 경로의 수학적 정의
        </div>
        <MathView math="d(u,v) = \min \{ |P| : P \text{ is a path from } u \text{ to } v \}" display={true} className="text-[#EAFBF6]" />
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* SVG Canvas */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#234E47] rounded-xl p-2 relative overflow-hidden">
          <svg viewBox="0 0 600 360" className="w-full h-auto select-none">
            {/* Background Edges */}
            {Object.entries(adj).map(([uStr, neighbors]) => {
              const u = Number(uStr);
              const p1 = positions[u];
              return neighbors.map((v) => {
                if (u >= v) return null;
                const p2 = positions[v];
                return (
                  <line
                    key={`${u}-${v}`}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#234E47"
                    strokeWidth="2.5"
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
              return (
                <line
                  key={`path-${i}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#F2B84B"
                  strokeWidth="4.5"
                />
              );
            })}

            {/* Nodes */}
            {Array.from({ length: 10 }).map((_, id) => {
              const p = positions[id];
              const isStart = id === 0;
              const isEnd = id === 9;
              const inPath = path.includes(id);

              let fill = '#1A3D37';
              if (isStart) fill = '#3FA796';
              else if (isEnd) fill = '#FF6B5C';
              else if (inPath) fill = '#F2B84B';

              return (
                <g
                  key={id}
                  onClick={() => handleNodeClick(id)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="18"
                    fill={fill}
                    stroke={inPath || isStart || isEnd ? '#EAFBF6' : '#3FA796'}
                    strokeWidth="2"
                  />
                  <text
                    x={p.x}
                    y={p.y + 5}
                    fill={inPath || isStart || isEnd ? '#0A1A18' : '#EAFBF6'}
                    fontSize="13"
                    fontWeight="bold"
                    textAnchor="middle"
                    fontFamily="JetBrains Mono"
                    className="pointer-events-none select-none"
                  >
                    {id + 1}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-2 left-3 text-[11px] text-[#7DBFB0]">
            🟢 1번(시작)에서 출발하여 🔴 10번(도착)까지 도달하세요.
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-[#1A3D37] border border-[#234E47] rounded-xl p-4 space-y-4">
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
          <div className="space-y-2 border-t border-[#234E47] pt-3 text-xs">
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
          </div>

          {bestTime !== null && (
            <div className="p-2.5 rounded-lg bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-center">
              <div className="text-[10px] text-[#7DBFB0]">🏆 나의 최고 기록</div>
              <div className="font-mono text-sm font-bold text-[#4ADE80]">{formatTime(bestTime)}</div>
            </div>
          )}

          {statusMsg && (
            <div
              className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                statusMsg.type === 'ok'
                  ? 'bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40'
                  : 'bg-[#FF6B5C]/20 text-[#FF6B5C] border border-[#FF6B5C]/40'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleCheck}
              className="w-full py-2.5 px-3 rounded-lg bg-[#F2B84B] hover:bg-[#ffc65a] text-[#0A1A18] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#F2B84B]/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>정답 확인하기</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleReset}
                className="py-2 px-2 rounded-lg bg-[#132E29] hover:bg-[#234E47] text-[#7DBFB0] hover:text-white border border-[#234E47] text-xs flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>경로 리셋</span>
              </button>
              <button
                onClick={handleTimerReset}
                className="py-2 px-2 rounded-lg bg-[#132E29] hover:bg-[#234E47] text-[#7DBFB0] hover:text-white border border-[#234E47] text-xs flex items-center justify-center gap-1"
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
