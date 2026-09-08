import React, { useState, useMemo } from 'react';
import { MathView } from './MathView';
import { Target, Star, HelpCircle, Check } from 'lucide-react';

interface NetworkTabProps {
  onCompleteMission: (xp: number, stars: number) => void;
  isMissionCompleted: boolean;
  onAddXP: (amount: number) => void;
}

export const NetworkTab: React.FC<NetworkTabProps> = ({
  onCompleteMission,
  isMissionCompleted,
  onAddXP,
}) => {
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const N = 6;
  const cx = 300;
  const cy = 180;
  const R = 130;

  const nodePositions = useMemo(() => {
    return labels.map((_, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
      return {
        x: cx + R * Math.cos(angle),
        y: cy + R * Math.sin(angle),
      };
    });
  }, []);

  const [edges, setEdges] = useState<Set<string>>(
    () => new Set(['0-1', '1-2', '0-2'])
  );
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const edgeKey = (i: number, j: number) => (i < j ? `${i}-${j}` : `${j}-${i}`);

  const degrees = useMemo(() => {
    const degs = new Array(N).fill(0);
    edges.forEach((k) => {
      const [u, v] = k.split('-').map(Number);
      degs[u]++;
      degs[v]++;
    });
    return degs;
  }, [edges]);

  const degSum = useMemo(() => degrees.reduce((a, b) => a + b, 0), [degrees]);

  const handleNodeClick = (index: number) => {
    if (selectedNode === null) {
      setSelectedNode(index);
    } else if (selectedNode === index) {
      setSelectedNode(null);
    } else {
      const key = edgeKey(selectedNode, index);
      const newEdges = new Set(edges);
      if (newEdges.has(key)) {
        newEdges.delete(key);
      } else {
        newEdges.add(key);
        onAddXP(2);
      }
      setEdges(newEdges);
      setSelectedNode(null);

      // Check Mission 1
      if (newEdges.size >= 6 && !isMissionCompleted) {
        onCompleteMission(50, 3);
      }
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">네트워크의 문법 — 점(Node)과 선(Edge)</h2>
        <p className="text-sm text-[#7DBFB0]">
          노드(점) 두 개를 순서대로 클릭하면 엣지(선)가 생기거나 사라집니다. 직접 선을 이어보세요!
        </p>
      </div>

      {/* Mission Box */}
      <div className="bg-gradient-to-r from-[#C084FC]/10 to-[#3FA796]/10 border border-[#C084FC]/30 rounded-xl p-3.5 flex items-start gap-3">
        <Target className="w-5 h-5 text-[#C084FC] flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-xs sm:text-sm">
          <div className="font-mono text-[11px] text-[#C084FC] font-bold tracking-wider">
            MISSION 1: 악수 보조정리 발견
          </div>
          <div className="text-[#EAFBF6] mt-0.5">
            엣지를 <b>6개 이상</b> 만들고 <b>차수의 총합</b>이 <b>엣지 수 × 2</b>임을 확인하세요!
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[#F2B84B] text-xs">
            <span>보상: +50 XP</span>
            <div className="flex text-sm">
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
              <Star className={`w-3.5 h-3.5 ${isMissionCompleted ? 'fill-[#F2B84B] text-[#F2B84B]' : 'text-gray-600'}`} />
            </div>
            {isMissionCompleted && (
              <span className="ml-2 px-1.5 py-0.2 rounded bg-[#4ADE80]/20 text-[#4ADE80] text-[10px] font-bold">
                달성 완료!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Formula Box */}
      <div className="bg-black/30 border border-[#234E47] rounded-xl p-3">
        <div className="text-[10px] font-mono text-[#C084FC] tracking-wider uppercase mb-1">
          핵심 공식 (악수 보조정리)
        </div>
        <MathView math="\sum_{i=1}^{n} \deg(v_i) = 2|E|" display={true} className="text-[#EAFBF6]" />
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* SVG Canvas */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#234E47] rounded-xl p-2 relative overflow-hidden">
          <svg viewBox="0 0 600 360" className="w-full h-auto select-none">
            {/* Edges */}
            {Array.from(edges).map((key: string) => {
              const [u, v] = key.split('-').map(Number);
              const p1 = nodePositions[u];
              const p2 = nodePositions[v];
              return (
                <line
                  key={key}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#3FA796"
                  strokeWidth="3"
                />
              );
            })}

            {/* Nodes */}
            {nodePositions.map((p, i) => {
              const isSelected = selectedNode === i;
              return (
                <g
                  key={i}
                  onClick={() => handleNodeClick(i)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="20"
                    fill={isSelected ? '#FF6B5C' : '#1A3D37'}
                    stroke="#F2B84B"
                    strokeWidth="2.5"
                  />
                  <text
                    x={p.x}
                    y={p.y + 5}
                    fill="#EAFBF6"
                    fontSize="14"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="pointer-events-none select-none"
                  >
                    {labels[i]}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-2 left-3 text-[11px] text-[#7DBFB0]">
            💡 노드를 2개 선택해 연결하거나 끊어보세요. (선택된 노드는 주황색)
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-[#1A3D37] border border-[#234E47] rounded-xl p-4 space-y-4">
          {/* Degree list */}
          <div>
            <div className="text-xs text-[#7DBFB0] mb-1.5 font-semibold">각 노드의 차수(Degree)</div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {labels.map((l, i) => (
                <span key={l} className="px-2 py-0.5 rounded bg-[#0A1A18] border border-[#234E47]">
                  {l}: <b className="text-[#F2B84B]">{degrees[i]}</b>
                </span>
              ))}
            </div>
          </div>

          {/* Adjacency Matrix */}
          <div>
            <div className="text-xs text-[#7DBFB0] mb-1.5 font-semibold">인접 행렬 (Adjacency Matrix)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono border-collapse">
                <thead>
                  <tr>
                    <th className="p-1 border border-[#234E47] text-[#7DBFB0]"></th>
                    {labels.map((l) => (
                      <th key={l} className="p-1 border border-[#234E47] text-[#F2B84B]">
                        {l}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {labels.map((rowLabel, i) => (
                    <tr key={rowLabel}>
                      <th className="p-1 border border-[#234E47] text-[#F2B84B]">{rowLabel}</th>
                      {labels.map((_, j) => {
                        const hasEdge = i !== j && edges.has(edgeKey(i, j));
                        return (
                          <td
                            key={j}
                            className={`p-1 border border-[#234E47] ${
                              hasEdge ? 'bg-[#3FA796]/20 text-[#4ADE80] font-bold' : 'text-gray-500'
                            }`}
                          >
                            {hasEdge ? 1 : 0}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-2 border-t border-[#234E47] pt-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">엣지 수 (|E|)</span>
              <span className="font-mono text-base font-bold text-[#F2B84B]">{edges.size}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">차수의 총합 (∑deg)</span>
              <span className="font-mono text-base font-bold text-[#3FA796]">{degSum}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#7DBFB0]">검증 식</span>
              <span className="font-mono text-sm font-bold text-[#4ADE80]">
                ✓ {degSum} = 2 × {edges.size}
              </span>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#234E47] space-y-2 text-xs">
            <div className="text-[#F2B84B] font-bold flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>수학 퀴즈</span>
            </div>
            <p className="text-[#EAFBF6]">
              차수의 총합 = ( &nbsp; ) × 엣지 수. 빈칸에 들어갈 수는?
            </p>
            {!showAnswer ? (
              <button
                onClick={() => {
                  setShowAnswer(true);
                  onAddXP(10);
                }}
                className="w-full py-1.5 px-2 rounded bg-[#132E29] hover:bg-[#234E47] text-[#F2B84B] border border-[#F2B84B]/40 font-semibold transition-colors"
              >
                정답 확인 (+10 XP)
              </button>
            ) : (
              <div className="p-2 rounded bg-[#132E29] border-l-2 border-[#3FA796] text-[#D1F2EB] text-[11px] leading-relaxed">
                정답은 <b>2</b>입니다! 선(엣지) 하나를 그을 때마다 양쪽 끝 점의 차수가 각각 1씩 늘어나므로 항상 2배가 됩니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
