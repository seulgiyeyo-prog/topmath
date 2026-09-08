import React, { useState, useEffect, useRef } from 'react';
import { Shield, Scissors, Play, RotateCcw, CheckCircle2, AlertTriangle, Sparkles, HelpCircle } from 'lucide-react';

interface Node {
  id: number;
  label: string;
  x: number;
  y: number;
  group: 'A' | 'B';
}

interface Edge {
  from: number;
  to: number;
  isBridge?: boolean;
}

export const BridgePuzzleTab: React.FC<{
  onCompleteMission?: (xp: number, stars: number) => void;
  isMissionCompleted?: boolean;
}> = ({ onCompleteMission, isMissionCompleted }) => {
  // 2 Communities (Group A: School A, Group B: School B)
  const nodes: Node[] = [
    // Group A (Left School)
    { id: 0, label: 'A1', x: 100, y: 130, group: 'A' },
    { id: 1, label: 'A2', x: 190, y: 90, group: 'A' },
    { id: 2, label: 'A3 (감염원)', x: 110, y: 280, group: 'A' },
    { id: 3, label: 'A4', x: 210, y: 220, group: 'A' },
    { id: 4, label: 'A5 (허브)', x: 230, y: 320, group: 'A' },

    // Group B (Right School)
    { id: 5, label: 'B1 (허브)', x: 370, y: 140, group: 'B' },
    { id: 6, label: 'B2', x: 470, y: 90, group: 'B' },
    { id: 7, label: 'B3', x: 490, y: 210, group: 'B' },
    { id: 8, label: 'B4', x: 380, y: 280, group: 'B' },
    { id: 9, label: 'B5', x: 480, y: 330, group: 'B' },
  ];

  // Initial edges. Bridges between A and B are (1-5) and (4-8)
  const initialEdges: Edge[] = [
    // Intra Group A
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },

    // Bridges connecting Group A and Group B!
    { from: 1, to: 5, isBridge: true },
    { from: 4, to: 8, isBridge: true },

    // Intra Group B
    { from: 5, to: 6 },
    { from: 5, to: 7 },
    { from: 6, to: 7 },
    { from: 7, to: 8 },
    { from: 7, to: 9 },
    { from: 8, to: 9 },
  ];

  const edgeKey = (u: number, v: number) => (u < v ? `${u}-${v}` : `${v}-${u}`);

  const [cutEdges, setCutEdges] = useState<Set<string>>(new Set());
  const [infectedNodes, setInfectedNodes] = useState<Set<number>>(new Set([2])); // Node 2 is patient zero
  const [simulating, setSimulating] = useState<boolean>(false);
  const [stageCleared, setStageCleared] = useState<boolean>(false);
  const [breached, setBreached] = useState<boolean>(false);

  const maxCuts = 2;

  const handleToggleCut = (u: number, v: number) => {
    if (simulating) return;
    const k = edgeKey(u, v);
    setCutEdges((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
      } else {
        if (next.size >= maxCuts) {
          alert(`방화벽 가위는 최대 ${maxCuts}개의 연결선만 자를 수 있습니다!`);
          return prev;
        }
        next.add(k);
      }
      return next;
    });
    setStageCleared(false);
    setBreached(false);
    setInfectedNodes(new Set([2]));
  };

  // Run infection spread
  const runSpread = () => {
    setSimulating(true);
    setInfectedNodes(new Set([2]));
    setStageCleared(false);
    setBreached(false);

    let currentInfected = new Set<number>([2]);
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const nextInfected = new Set<number>(currentInfected);

      currentInfected.forEach((u) => {
        initialEdges.forEach((e) => {
          const k = edgeKey(e.from, e.to);
          if (cutEdges.has(k)) return; // blocked by firewall!

          if (e.from === u) nextInfected.add(e.to);
          if (e.to === u) nextInfected.add(e.from);
        });
      });

      setInfectedNodes(new Set(nextInfected));
      currentInfected = nextInfected;

      // Check if Group B breached
      const groupBInfected = Array.from(currentInfected).some((id) => id >= 5);

      if (groupBInfected) {
        clearInterval(interval);
        setSimulating(false);
        setBreached(true);
      } else if (step >= 5) {
        clearInterval(interval);
        setSimulating(false);
        setStageCleared(true);
        if (onCompleteMission) onCompleteMission(50, 3);
      }
    }, 600);
  };

  const resetPuzzle = () => {
    setCutEdges(new Set());
    setInfectedNodes(new Set([2]));
    setSimulating(false);
    setStageCleared(false);
    setBreached(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 border-b border-[#234E47] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAFBF6]">
            방화벽 브릿지 퍼즐 (6단계의 법칙과 핵심 다리 차단)
          </h2>
          <p className="text-xs sm:text-sm text-[#7DBFB0] mt-1">
            "세상 사람들은 평균 6명만 거치면 모두 연결된다(작은 세상 네트워크)." 반대로,{' '}
            <strong className="text-[#F2B84B]">서로 다른 두 집단을 잇는 좁은 '다리(Bridge)' 단 2개</strong>만 끊으면 바이러스 확산을 완벽히 봉쇄할 수 있습니다!
          </p>
        </div>
        {stageCleared && (
          <span className="mt-2 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4ADE80]/20 border border-[#4ADE80] text-[#4ADE80] text-xs font-bold animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            B학교 감염율 0%! 방화벽 격리 성공!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Network Graph */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#234E47] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg viewBox="0 0 600 420" className="w-full h-auto select-none">
            {/* Background Group Zones */}
            <rect x="50" y="50" width="220" height="320" rx="20" fill="#132E29" opacity="0.5" />
            <text x="160" y="75" fill="#3FA796" fontSize="12" fontWeight="bold" textAnchor="middle">
              A학교 커뮤니티
            </text>

            <rect x="330" y="50" width="220" height="320" rx="20" fill="#153A5C" opacity="0.4" />
            <text x="440" y="75" fill="#7FC4EE" fontSize="12" fontWeight="bold" textAnchor="middle">
              B학교 커뮤니티 (보호 대상)
            </text>

            {/* Edges */}
            {initialEdges.map((e) => {
              const u = nodes[e.from];
              const v = nodes[e.to];
              const k = edgeKey(e.from, e.to);
              const isCut = cutEdges.has(k);

              return (
                <g key={k} onClick={() => handleToggleCut(e.from, e.to)} className="cursor-pointer group">
                  {/* Invisible thicker stroke for easy clicking */}
                  <line x1={u.x} y1={u.y} x2={v.x} y2={v.y} stroke="transparent" strokeWidth={16} />

                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={
                      isCut
                        ? '#FF6B5C'
                        : e.isBridge
                        ? '#F2B84B'
                        : '#234E47'
                    }
                    strokeWidth={e.isBridge ? 3.5 : 2}
                    strokeDasharray={isCut ? '4 4' : undefined}
                    className="transition-colors group-hover:stroke-[#F2B84B]"
                  />

                  {/* Scissors icon on cut edge */}
                  {isCut && (
                    <g transform={`translate(${(u.x + v.x) / 2 - 10}, ${(u.y + v.y) / 2 - 10})`}>
                      <circle cx="10" cy="10" r="11" fill="#FF6B5C" />
                      <text x="10" y="14" fill="#FFFFFF" fontSize="10" textAnchor="middle" fontWeight="bold">
                        ✕
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const isInfected = infectedNodes.has(node.id);
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.label.includes('허브') ? 16 : 13}
                    fill={
                      isInfected
                        ? '#FF6B5C'
                        : node.group === 'A'
                        ? '#3FA796'
                        : '#4B6B94'
                    }
                    stroke={isInfected ? '#FFFFFF' : '#EAFBF6'}
                    strokeWidth={2}
                    className="transition-colors duration-300"
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    fill="#FFFFFF"
                    fontSize={10}
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {node.label.split(' ')[0]}
                  </text>
                  {node.id === 2 && (
                    <text
                      x={node.x}
                      y={node.y + 24}
                      fill="#FF6B5C"
                      fontSize={10}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      최초 감염
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sidebar Controls */}
        <div className="bg-[#132E29] border border-[#234E47] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-mono text-[#F2B84B] font-bold uppercase tracking-wider mb-2">
              방화벽 설치 제어반
            </div>

            <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#234E47] text-xs space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-[#7DBFB0]">가위(방화벽) 사용:</span>
                <b className="font-mono text-sm text-[#F2B84B]">
                  {cutEdges.size} / {maxCuts} 개
                </b>
              </div>
              <div className="text-[11px] text-[#7DBFB0] leading-relaxed">
                👉 연결선을 클릭하면 가위로 자를 수 있습니다. A학교에서 B학교로 건너가는 <strong>다리(Bridge) 2개</strong>를 정확히 찾아 차단하세요!
              </div>
            </div>

            {/* Simulation Feedback */}
            {breached && (
              <div className="p-3 rounded-lg bg-[#FF6B5C]/20 border border-[#FF6B5C] text-xs text-[#FF6B5C] mb-4 flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>방화벽 뚫림!</strong>
                  <div className="text-[11px] mt-0.5">
                    차단되지 않은 다리를 통해 바이러스가 B학교로 확산되었습니다. 다른 연결선을 잘라보세요!
                  </div>
                </div>
              </div>
            )}

            {stageCleared && (
              <div className="p-3 rounded-lg bg-[#4ADE80]/20 border border-[#4ADE80] text-xs text-[#4ADE80] mb-4 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>격리 성공!</strong>
                  <div className="text-[11px] mt-0.5">
                    핵심 다리를 완벽히 차단하여 B학교의 5명 전원을 감염으로부터 지켜냈습니다! (+50 XP)
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 mb-4">
              <button
                onClick={runSpread}
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#F2B84B] hover:bg-[#d9a038] text-[#0A1A18] font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>바이러스 확산 시작!</span>
              </button>

              <button
                onClick={resetPuzzle}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#234E47] hover:bg-[#1A3D37] text-[#7DBFB0] text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>방화벽 초기화</span>
              </button>
            </div>

            <div className="bg-[#0A1A18] border border-[#234E47] rounded-lg p-3 text-xs leading-relaxed">
              <div className="text-[#F2B84B] font-bold mb-1 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>그래프 이론: '약한 유대의 다리'</span>
              </div>
              <p className="text-[#7DBFB0]">
                우리 사회는 끼리끼리 친한 '클러스터'로 이루어져 있습니다. 소문이나 유행병이 다른 무리로 건너뛰는 것은 친한 친구가 아니라,{' '}
                <strong className="text-[#EAFBF6]">다른 학교 친구를 잇는 '약한 연결(다리)'</strong> 덕분입니다. 방역에서는 이 다리만 찾아내면 전체를 락다운하지 않고도 확산을 막을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
