import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Network,
  RotateCcw,
  Lightbulb,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
  Hand,
  Hash,
  Sparkles,
  Link,
  Unlink,
} from 'lucide-react';
import { MathView } from '../MathView';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export const AdjacencyMatrixVisualizer: React.FC = () => {
  const nodeLabels = ['A', 'B', 'C', 'D'];

  // 4x4 Adjacency Matrix state (0 or 1, symmetric, 0 on diagonal)
  // Default workbook problem:
  // A-B, A-C, B-C, B-D, C-D (5 edges)
  const defaultMatrix: number[][] = [
    [0, 1, 1, 0], // A connected to B, C
    [1, 0, 1, 1], // B connected to A, C, D
    [1, 1, 0, 1], // C connected to A, B, D
    [0, 1, 1, 0], // D connected to B, C
  ];

  const [matrix, setMatrix] = useState<number[][]>(defaultMatrix);

  // Default node positions
  const defaultNodes: GraphNode[] = [
    { id: 'A', label: 'A', x: 120, y: 90 },
    { id: 'B', label: 'B', x: 280, y: 90 },
    { id: 'C', label: 'C', x: 120, y: 230 },
    { id: 'D', label: 'D', x: 280, y: 230 },
  ];
  const [nodes, setNodes] = useState<GraphNode[]>(defaultNodes);

  // Active hover states for cross-referencing
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<[string, string] | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragIdxRef = useRef<number>(-1);

  // Calculate degrees from matrix (sum of each row)
  const degrees = useMemo(() => {
    return matrix.map((row) => row.reduce((sum, val) => sum + val, 0));
  }, [matrix]);

  // Extract edge list from upper triangle (undirected)
  const edges = useMemo(() => {
    const list: [string, string][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = i + 1; j < 4; j++) {
        if (matrix[i][j] === 1) {
          list.push([nodeLabels[i], nodeLabels[j]]);
        }
      }
    }
    return list;
  }, [matrix, nodeLabels]);

  const totalDegreeSum = useMemo(() => {
    return degrees.reduce((acc, d) => acc + d, 0);
  }, [degrees]);

  const totalEdges = edges.length;

  // Toggle edge on matrix click
  const toggleMatrixEdge = (r: number, c: number) => {
    if (r === c) return; // Disallow self-loops in simple graphs
    const next = matrix.map((row) => [...row]);
    const newVal = next[r][c] === 1 ? 0 : 1;
    next[r][c] = newVal;
    next[c][r] = newVal; // Maintain symmetry
    setMatrix(next);
  };

  // Presets
  const applyPreset = (preset: 'workbook' | 'complete' | 'cycle' | 'star' | 'path') => {
    if (preset === 'workbook') {
      setMatrix(defaultMatrix);
      setNodes([
        { id: 'A', label: 'A', x: 120, y: 90 },
        { id: 'B', label: 'B', x: 280, y: 90 },
        { id: 'C', label: 'C', x: 120, y: 230 },
        { id: 'D', label: 'D', x: 280, y: 230 },
      ]);
    } else if (preset === 'complete') {
      // K4: all pairs connected
      setMatrix([
        [0, 1, 1, 1],
        [1, 0, 1, 1],
        [1, 1, 0, 1],
        [1, 1, 1, 0],
      ]);
    } else if (preset === 'cycle') {
      // C4: A-B-D-C-A
      setMatrix([
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
        [0, 1, 1, 0],
      ]);
    } else if (preset === 'star') {
      // S4: B connected to A, C, D
      setMatrix([
        [0, 1, 0, 0],
        [1, 0, 1, 1],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ]);
    } else if (preset === 'path') {
      // P4: A-B-C-D
      setMatrix([
        [0, 1, 0, 0],
        [1, 0, 1, 0],
        [0, 1, 0, 1],
        [0, 0, 1, 0],
      ]);
    }
  };

  // Render Graph on Canvas
  useEffect(() => {
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

    // Subtle blueprint grid
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const gSize = 24;
    for (let x = 0; x < w; x += gSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Determine currently highlighted edge
    const isEdgeActive = (u: string, v: string) => {
      if (hoveredCell) {
        const uH = nodeLabels[hoveredCell.row];
        const vH = nodeLabels[hoveredCell.col];
        if ((u === uH && v === vH) || (u === vH && v === uH)) return true;
      }
      if (hoveredEdge) {
        if ((u === hoveredEdge[0] && v === hoveredEdge[1]) || (u === hoveredEdge[1] && v === hoveredEdge[0])) {
          return true;
        }
      }
      if (hoveredNode) {
        if (u === hoveredNode || v === hoveredNode) return true;
      }
      return false;
    };

    // Draw Edges
    edges.forEach(([u, v]) => {
      const p1 = nodes.find((n) => n.id === u);
      const p2 = nodes.find((n) => n.id === v);
      if (!p1 || !p2) return;

      const active = isEdgeActive(u, v);

      if (active) {
        // Glowing halo for active edge
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        ctx.strokeStyle = '#059669';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Edge label pill in center
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.arc(mx, my, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${u}${v}`, mx, my);
      } else {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2.8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });

    // Draw Nodes
    nodes.forEach((node, idx) => {
      const isNodeActive =
        hoveredNode === node.id ||
        (hoveredCell && (nodeLabels[hoveredCell.row] === node.id || nodeLabels[hoveredCell.col] === node.id)) ||
        (hoveredEdge && (hoveredEdge[0] === node.id || hoveredEdge[1] === node.id));

      const deg = degrees[idx];

      // Outer active ring
      if (isNodeActive) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Node circle
      ctx.fillStyle = isNodeActive ? '#059669' : '#4f46e5';
      ctx.beginPath();
      ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Degree Badge in top-right
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(node.x + 13, node.y - 13, 9.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(deg.toString(), node.x + 13, node.y - 13);
    });

    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }, [nodes, edges, degrees, hoveredCell, hoveredNode, hoveredEdge, nodeLabels]);

  // Pointer drag event handlers for node repositioning
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let hit = -1;
    nodes.forEach((n, idx) => {
      if (Math.hypot(n.x - x, n.y - y) < 24) {
        hit = idx;
      }
    });

    if (hit !== -1) {
      dragIdxRef.current = hit;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(25, Math.min(rect.width - 25, e.clientX - rect.left));
    const y = Math.max(25, Math.min(rect.height - 25, e.clientY - rect.top));

    if (dragIdxRef.current !== -1) {
      const next = [...nodes];
      next[dragIdxRef.current] = { ...next[dragIdxRef.current], x, y };
      setNodes(next);
    } else {
      // Hover detection on nodes
      let hoveredNodeId: string | null = null;
      nodes.forEach((n) => {
        if (Math.hypot(n.x - x, n.y - y) < 22) {
          hoveredNodeId = n.id;
        }
      });
      setHoveredNode(hoveredNodeId);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragIdxRef.current = -1;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold">
              1
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 font-bold">
              그래프 이론 & 행렬 매핑
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
            인접 행렬(Adjacency Matrix)과 악수 정리(Handshaking Lemma)
          </h2>
        </div>

        {/* Graph Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">프리셋:</span>
          <button
            onClick={() => applyPreset('workbook')}
            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition cursor-pointer border border-indigo-200"
          >
            기본 문제
          </button>
          <button
            onClick={() => applyPreset('complete')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            완전 그래프 (K₄)
          </button>
          <button
            onClick={() => applyPreset('cycle')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            원형 (C₄)
          </button>
          <button
            onClick={() => applyPreset('star')}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            별 모양 (S₄)
          </button>
        </div>
      </div>

      {/* Main Grid: Visual Matrix Diagram (Left) & Live Graph Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Mathematical Bracketed Matrix & Interactive Cells */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Hash className="w-4 h-4 text-indigo-600" />
              <span>수학적 인접 행렬 표 (셀을 클릭하여 연결 토글)</span>
            </span>
            <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">
              대칭행렬: M_ij = M_ji
            </span>
          </div>

          {/* Styled Mathematical Matrix Table */}
          <div className="relative bg-slate-900 text-white p-5 rounded-2xl shadow-xl overflow-hidden font-mono border border-slate-800">
            {/* Matrix Left & Right Large Brackets Graphic */}
            <div className="absolute left-3 top-10 bottom-4 w-1.5 border-l-2 border-t-2 border-b-2 border-indigo-400 rounded-l-md"></div>
            <div className="absolute right-20 top-10 bottom-4 w-1.5 border-r-2 border-t-2 border-b-2 border-indigo-400 rounded-r-md"></div>

            <table className="w-full text-center select-none">
              <thead>
                <tr className="text-slate-400 text-xs border-b border-slate-800 pb-2">
                  <th className="w-12 text-slate-500 font-sans text-[11px]">노드</th>
                  {nodeLabels.map((col, cIdx) => (
                    <th
                      key={col}
                      className={`py-1.5 transition-colors ${
                        hoveredCell?.col === cIdx ? 'text-emerald-400 font-bold bg-emerald-950/40 rounded-t' : ''
                      }`}
                    >
                      {col}
                    </th>
                  ))}
                  <th className="pl-4 text-emerald-400 font-bold text-xs">차수 (deg)</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, rIdx) => {
                  const rLabel = nodeLabels[rIdx];
                  const deg = degrees[rIdx];
                  const isRowActive = hoveredCell?.row === rIdx || hoveredNode === rLabel;

                  return (
                    <tr
                      key={rLabel}
                      className={`border-b border-slate-800/80 transition-colors ${
                        isRowActive ? 'bg-indigo-950/30' : ''
                      }`}
                    >
                      {/* Row Header */}
                      <td className="py-2.5 font-bold text-blue-400 font-sans text-xs">
                        {rLabel}
                      </td>

                      {/* Matrix Value Cells */}
                      {row.map((val, cIdx) => {
                        const isDiag = rIdx === cIdx;
                        const cLabel = nodeLabels[cIdx];
                        const isHovered =
                          hoveredCell?.row === rIdx && hoveredCell?.col === cIdx;
                        const isSymmetricHovered =
                          hoveredCell?.row === cIdx && hoveredCell?.col === rIdx;
                        const isConnected = val === 1;

                        return (
                          <td key={cIdx} className="p-1">
                            <button
                              onClick={() => toggleMatrixEdge(rIdx, cIdx)}
                              onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx })}
                              onMouseLeave={() => setHoveredCell(null)}
                              disabled={isDiag}
                              title={
                                isDiag
                                  ? `${rLabel}-${cLabel}: 자기 자신 루프 없음 (0)`
                                  : `${rLabel}-${cLabel}: ${isConnected ? '연결됨 (1) - 클릭 시 해제' : '연결 안 됨 (0) - 클릭 시 연결'}`
                              }
                              className={`w-9 h-9 rounded-lg font-mono font-bold text-sm transition-all duration-150 flex items-center justify-center mx-auto cursor-pointer ${
                                isDiag
                                  ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
                                  : isHovered || isSymmetricHovered
                                  ? 'bg-emerald-500 text-slate-950 shadow-lg scale-110 ring-2 ring-emerald-300'
                                  : isConnected
                                  ? 'bg-indigo-600/80 hover:bg-indigo-500 text-white shadow-xs border border-indigo-400/30'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700/60'
                              }`}
                            >
                              {val}
                            </button>
                          </td>
                        );
                      })}

                      {/* Row Degree Sum */}
                      <td className="pl-4 py-2 text-emerald-400 font-mono font-bold text-sm">
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800">
                          {deg}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Matrix Cell Meaning Banner */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600"></span>
                <span>1: 간선 연결</span>
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 border border-slate-700 ml-2"></span>
                <span>0: 미연결</span>
              </span>
              <span className="text-emerald-400 font-mono font-bold">
                대각 성분 = 항상 0 (단순 그래프)
              </span>
            </div>
          </div>

          {/* Interactive Cell Info Tooltip */}
          {hoveredCell && hoveredCell.row !== hoveredCell.col && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  M({nodeLabels[hoveredCell.row]}, {nodeLabels[hoveredCell.col]}) = {matrix[hoveredCell.row][hoveredCell.col]}
                </span>
                <span>
                  노드 {nodeLabels[hoveredCell.row]}와 노드 {nodeLabels[hoveredCell.col]} 사이에{' '}
                  <strong>
                    {matrix[hoveredCell.row][hoveredCell.col] === 1 ? '간선이 존재합니다.' : '간선이 없습니다.'}
                  </strong>
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 font-sans">클릭하여 상태 전환</span>
            </div>
          )}
        </div>

        {/* RIGHT: Interactive Graph Canvas & Handshaking Lemma Live Proof */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Network className="w-4 h-4 text-indigo-600" />
              <span>네트워크 그래프 시각화 (노드를 드래그하여 배치 조절)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              총 엣지 수: <strong className="text-indigo-600">{totalEdges}개</strong>
            </span>
          </div>

          {/* Graph Canvas */}
          <div className="w-full bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div
              className="w-full bg-white rounded-xl overflow-hidden border border-slate-200 aspect-[16/11] relative touch-none cursor-grab active:cursor-grabbing shadow-inner"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Overlay Hint */}
              <div className="absolute bottom-2.5 left-2.5 pointer-events-none bg-white/90 backdrop-blur-xs border border-slate-200 px-2 py-1 rounded-md text-[10px] text-slate-500 flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span>노드 위 숫자: 해당 노드의 <strong>차수(Degree)</strong></span>
              </div>
            </div>
          </div>

          {/* HANDSHAKING LEMMA (악수 정리) LIVE PROOF CARD */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                <Hand className="w-4 h-4 text-indigo-600" />
                <span>악수 정리 (Handshaking Lemma) 실시간 수식 검증</span>
              </span>
              <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                정리 성립 ✓
              </span>
            </div>

            {/* Visual Formula Comparison */}
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-indigo-200/80 shadow-2xs">
                <div className="text-slate-500 text-[11px] mb-0.5">각 노드 차수(Degree)의 총합</div>
                <div className="text-sm font-mono font-bold text-indigo-700">
                  {degrees.join(' + ')} = <span className="text-base text-indigo-950">{totalDegreeSum}</span>
                </div>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-indigo-200/80 shadow-2xs">
                <div className="text-slate-500 text-[11px] mb-0.5">간선(엣지) 수의 2배</div>
                <div className="text-sm font-mono font-bold text-emerald-700">
                  2 × {totalEdges} = <span className="text-base text-emerald-950">{2 * totalEdges}</span>
                </div>
              </div>
            </div>

            {/* Proof Explanation */}
            <div className="p-2.5 bg-white/80 rounded-lg text-slate-700 text-[11px] leading-relaxed border border-indigo-100">
              <p className="font-semibold text-indigo-900 mb-0.5">
                📌 왜 항상 '차수의 총합 = 2 × (간선의 수)'일까요?
              </p>
              <p>
                두 사람이 악수(간선 1개)를 하면 <strong>양쪽 사람의 악수 횟수(차수)가 각각 +1씩</strong> 올라가므로, 
                하나의 간선은 언제나 전체 차수의 합에 <strong className="text-indigo-700">+2</strong>를 기여하기 때문입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
