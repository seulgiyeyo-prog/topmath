import React, { useState, useEffect, useRef } from 'react';
import { Award, RefreshCw, CheckCircle2, AlertCircle, Save, ListOrdered, Truck, Network, Sparkles, HelpCircle } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface LeaderboardEntry {
  name: string;
  score: number;
  mode: 'mst' | 'tsp';
  date: string;
}

export const CityGameTab: React.FC = () => {
  const [mode, setMode] = useState<'mst' | 'tsp'>('mst');
  const [pts, setPts] = useState<Point[]>([]);
  const [edges, setEdges] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [targetVal, setTargetVal] = useState<number | null>(null);
  const [efficiency, setEfficiency] = useState<number | null>(null);
  const [teamName, setTeamName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const dist = (p: Point, q: Point) => Math.hypot(p.x - q.x, p.y - q.y);

  const randPts = (n: number): Point[] => {
    const arr: Point[] = [];
    for (let i = 0; i < n; i++) {
      arr.push({
        x: Math.round(70 + Math.random() * 460),
        y: Math.round(60 + Math.random() * 300),
      });
    }
    return arr;
  };

  const key = (i: number, j: number) => (i < j ? `${i}-${j}` : `${j}-${i}`);

  const initGame = (n = 5) => {
    setPts(randPts(n));
    setEdges(new Set());
    setSelected(null);
    setSubmitted(false);
    setTargetVal(null);
    setEfficiency(null);
    setSaveMsg(null);
  };

  useEffect(() => {
    initGame(5);
    loadLeaderboard();
  }, [mode]);

  const totalLen = (): number => {
    let s = 0;
    edges.forEach((k) => {
      const [i, j] = k.split('-').map(Number);
      if (pts[i] && pts[j]) {
        s += dist(pts[i], pts[j]);
      }
    });
    return s;
  };

  const isConnected = (): boolean => {
    if (pts.length === 0) return false;
    const visited = new Set<number>([0]);
    const stack: number[] = [0];
    while (stack.length > 0) {
      const u = stack.pop()!;
      for (let v = 0; v < pts.length; v++) {
        if (v !== u && edges.has(key(u, v)) && !visited.has(v)) {
          visited.add(v);
          stack.push(v);
        }
      }
    }
    return visited.size === pts.length;
  };

  // Check if edges form a single valid TSP cycle (each node has degree 2 and graph is connected)
  const isValidTSPCycle = (): boolean => {
    if (pts.length === 0 || edges.size !== pts.length) return false;
    const degree = new Array(pts.length).fill(0);
    edges.forEach((k) => {
      const [i, j] = k.split('-').map(Number);
      degree[i]++;
      degree[j]++;
    });
    const allDeg2 = degree.every((d) => d === 2);
    return allDeg2 && isConnected();
  };

  // Compute MST using Prim's algorithm
  const computeMST = (): number => {
    const n = pts.length;
    if (n <= 1) return 0;
    const inMST = new Array(n).fill(false);
    const dmin = new Array(n).fill(Infinity);
    dmin[0] = 0;
    let total = 0;

    for (let k = 0; k < n; k++) {
      let u = -1;
      for (let i = 0; i < n; i++) {
        if (!inMST[i] && (u === -1 || dmin[i] < dmin[u])) {
          u = i;
        }
      }
      if (u === -1) break;
      inMST[u] = true;
      total += dmin[u] === Infinity ? 0 : dmin[u];

      for (let v = 0; v < n; v++) {
        if (!inMST[v]) {
          const d = dist(pts[u], pts[v]);
          if (d < dmin[v]) dmin[v] = d;
        }
      }
    }
    return total;
  };

  // Compute optimal TSP tour by permuting vertices (for n=5, 4! = 24 checks, instantaneous!)
  const computeOptimalTSP = (): number => {
    const n = pts.length;
    if (n < 3) return 0;
    const others = Array.from({ length: n - 1 }, (_, i) => i + 1);
    let bestDist = Infinity;

    const permute = (arr: number[], m: number[] = []) => {
      if (arr.length === 0) {
        const tour = [0, ...m];
        let d = 0;
        for (let i = 0; i < tour.length; i++) {
          const u = tour[i];
          const v = tour[(i + 1) % tour.length];
          d += dist(pts[u], pts[v]);
        }
        if (d < bestDist) bestDist = d;
      } else {
        for (let i = 0; i < arr.length; i++) {
          const curr = arr.slice();
          const next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next));
        }
      }
    };

    permute(others);
    return bestDist;
  };

  const handleNodeClick = (idx: number) => {
    if (selected === null) {
      setSelected(idx);
    } else if (selected === idx) {
      setSelected(null);
    } else {
      const k = key(selected, idx);
      setEdges((prev) => {
        const next = new Set(prev);
        if (next.has(k)) {
          next.delete(k);
        } else {
          next.add(k);
        }
        return next;
      });
      setSelected(null);
      setSubmitted(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'mst') {
      if (!isConnected()) {
        alert('⚠️ 아직 모든 마을이 연결되지 않았습니다! 끊어진 마을이 없도록 도로를 연결해 주세요.');
        return;
      }
      const mine = totalLen();
      const optimal = computeMST();
      setTargetVal(optimal);
      const eff = Math.min(100, Math.round((optimal / mine) * 100));
      setEfficiency(eff);
      setSubmitted(true);
    } else {
      // TSP mode
      if (!isValidTSPCycle()) {
        alert('⚠️ 외판원 순회는 모든 마을을 정확히 1번씩만 방문하고 출발 마을로 돌아오는 "하나의 닫힌 고리(모든 마을의 연결선 2개)"여야 합니다!');
        return;
      }
      const mine = totalLen();
      const optimal = computeOptimalTSP();
      setTargetVal(optimal);
      const eff = Math.min(100, Math.round((optimal / mine) * 100));
      setEfficiency(eff);
      setSubmitted(true);
    }
  };

  const loadLeaderboard = () => {
    try {
      const raw = localStorage.getItem('geometry_city_leaderboard');
      if (raw) {
        const list: LeaderboardEntry[] = JSON.parse(raw);
        setLeaderboard(list.sort((a, b) => b.score - a.score));
      }
    } catch {
      // ignore
    }
  };

  const handleSaveScore = () => {
    if (!teamName.trim()) {
      alert('이름 또는 모둠명을 입력해 주세요!');
      return;
    }
    if (efficiency === null) {
      alert('먼저 도로를 제출하고 효율을 확인해 주세요!');
      return;
    }

    try {
      const currentList: LeaderboardEntry[] = JSON.parse(
        localStorage.getItem('geometry_city_leaderboard') || '[]'
      );
      const existingIdx = currentList.findIndex(
        (item) => item.name === teamName.trim() && item.mode === mode
      );
      if (existingIdx >= 0) {
        currentList[existingIdx].score = Math.max(
          currentList[existingIdx].score,
          efficiency
        );
      } else {
        currentList.push({
          name: teamName.trim(),
          score: efficiency,
          mode: mode,
          date: new Date().toLocaleDateString('ko-KR'),
        });
      }
      currentList.sort((a, b) => b.score - a.score);
      localStorage.setItem('geometry_city_leaderboard', JSON.stringify(currentList));
      setLeaderboard(currentList);
      setShowLeaderboard(true);
      setSaveMsg(`🎉 ${teamName.trim()}님의 효율(${efficiency}%)이 랭킹에 등록되었습니다!`);
      setTimeout(() => setSaveMsg(null), 3500);
    } catch {
      alert('기록 저장에 실패했습니다.');
    }
  };

  const currentTotal = totalLen();
  const validStatus = mode === 'mst' ? isConnected() : isValidTSPCycle();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 border-b border-[#2C567F] pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl sm:text-2xl font-bold font-serif text-[#EAF3FC]">
              최고의 도시 설계자 & 외판원 순회 챌린지
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#9FC0DC]">
            마을들을 가장 적은 비용으로 연결하는 기하학적 네트워크를 설계하세요.{' '}
            마을 두 곳을 순서대로 클릭하면 도로가 건설되거나 철거됩니다.
          </p>
        </div>

        {/* Mode Selector Pill Buttons */}
        <div className="mt-3 sm:mt-0 flex items-center bg-[#0E2A45] p-1 rounded-xl border border-[#2C567F]">
          <button
            onClick={() => {
              setMode('mst');
              setEdges(new Set());
              setSubmitted(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'mst'
                ? 'bg-[#E7A93D] text-[#0E2A45] shadow-sm'
                : 'text-[#9FC0DC] hover:text-[#EAF3FC]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>최소 도로망 (MST)</span>
          </button>
          <button
            onClick={() => {
              setMode('tsp');
              setEdges(new Set());
              setSubmitted(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mode === 'tsp'
                ? 'bg-[#6FCF97] text-[#0E2A45] shadow-sm'
                : 'text-[#9FC0DC] hover:text-[#EAF3FC]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>택배 기사 순회 (TSP)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Interactive SVG Canvas */}
        <div className="lg:col-span-2 bg-[#0E2A45] border border-[#2C567F] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg viewBox="0 0 600 420" className="w-full h-auto select-none">
            {/* Grid Pattern Lines */}
            <defs>
              <pattern id="city-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2C567F" strokeWidth="0.5" opacity="0.3" />
              </pattern>
            </defs>
            <rect width="600" height="420" fill="url(#city-grid)" />

            {/* Built Roads */}
            {Array.from(edges).map((k: string) => {
              const [i, j] = k.split('-').map(Number);
              const p1 = pts[i];
              const p2 = pts[j];
              if (!p1 || !p2) return null;
              return (
                <g key={k}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke={mode === 'mst' ? '#E7A93D' : '#6FCF97'}
                    strokeWidth={3.5}
                    strokeLinecap="round"
                  />
                  {/* Road distance label */}
                  <text
                    x={(p1.x + p2.x) / 2}
                    y={(p1.y + p2.y) / 2 - 4}
                    fill="#9FC0DC"
                    fontSize={10}
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    {Math.round(dist(p1, p2))}
                  </text>
                </g>
              );
            })}

            {/* Town Nodes */}
            {pts.map((p, idx) => {
              const isSel = selected === idx;
              return (
                <g
                  key={idx}
                  onClick={() => handleNodeClick(idx)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSel ? 17 : 14}
                    fill={isSel ? '#FF6B5C' : '#1B4468'}
                    stroke={isSel ? '#FFFFFF' : '#7FC4EE'}
                    strokeWidth={isSel ? 3 : 2}
                    className="transition-all"
                  />
                  <text
                    x={p.x}
                    y={p.y + 4}
                    fill="#EAF3FC"
                    fontSize={11}
                    fontWeight={800}
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {String.fromCharCode(65 + idx)}
                  </text>
                  <text
                    x={p.x}
                    y={p.y + 26}
                    fill="#9FC0DC"
                    fontSize={10}
                    fontFamily="Noto Sans KR"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    마을 {String.fromCharCode(65 + idx)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Mode Guidance Pill */}
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-[#0E2A45]/90 border border-[#2C567F] text-xs text-[#EAF3FC] shadow">
            {mode === 'mst' ? (
              <span>
                🌲 <strong>MST 목표:</strong> 모든 마을을 연결하는 최소 길이 도로망 (필요 도로: {pts.length - 1}개)
              </span>
            ) : (
              <span>
                🚚 <strong>TSP 목표:</strong> 모든 마을을 1번씩만 방문하고 출발지로 귀환하는 닫힌 루프 (도로: {pts.length}개)
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Controls & Evaluation */}
        <div className="bg-[#153A5C] border border-[#2C567F] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#2C567F] pb-2 mb-3">
              <span className="text-xs font-mono text-[#E7A93D] font-bold uppercase">
                {mode === 'mst' ? '도로망 효율 분석' : '순회 경로 효율 분석'}
              </span>
              <button
                onClick={() => initGame(5)}
                className="flex items-center gap-1 text-xs text-[#9FC0DC] hover:text-[#EAF3FC] cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>마을 재배치</span>
              </button>
            </div>

            {/* Live Stats */}
            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">건설된 도로 수</span>
                <b className="font-mono text-base text-[#EAF3FC]">{edges.size} 개</b>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[#9FC0DC]">현재 총 도로 길이</span>
                <b className="font-mono text-base text-[#EAF3FC]">{Math.round(currentTotal)} km</b>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#2C567F]">
                <span className="text-[#9FC0DC]">규칙 충족 여부</span>
                {validStatus ? (
                  <span className="text-[#6FCF97] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {mode === 'mst' ? '전체 연결됨' : '유효한 순회 루프'}
                  </span>
                ) : (
                  <span className="text-[#FF6B5C] font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {mode === 'mst' ? '미연결 마을 있음' : '고리 미완성'}
                  </span>
                )}
              </div>
            </div>

            {/* Submit & Result */}
            <div className="space-y-2 mb-4">
              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#E7A93D] hover:bg-[#d6992d] text-[#0E2A45] font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <Award className="w-4 h-4" />
                <span>설계 제출 & 효율 채점</span>
              </button>

              {submitted && efficiency !== null && (
                <div className="p-3 rounded-lg bg-[#0E2A45] border border-[#6FCF97] text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#9FC0DC]">수학적 최적 최소 길이:</span>
                    <b className="font-mono text-sm text-[#6FCF97]">{Math.round(targetVal || 0)} km</b>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#EAF3FC] font-bold">내 설계 효율:</span>
                    <b
                      className={`font-mono text-lg font-extrabold ${
                        efficiency === 100 ? 'text-[#6FCF97]' : 'text-[#E7A93D]'
                      }`}
                    >
                      {efficiency}%
                    </b>
                  </div>
                  <div className="text-[11px] text-[#9FC0DC] pt-1 border-t border-[#2C567F]">
                    {efficiency === 100 ? (
                      <span className="text-[#6FCF97] font-bold">
                        🏆 축하합니다! 완벽한 수학적 최단 {mode === 'mst' ? '트리' : '루프'}를 완성했습니다!
                      </span>
                    ) : (
                      <span>불필요하게 긴 도로를 철거하고 더 짧은 연결을 찾아보세요!</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Save Score Section */}
            {submitted && efficiency !== null && (
              <div className="bg-[#0E2A45] border border-[#2C567F] rounded-lg p-3 text-xs mb-3 space-y-2">
                <div className="font-bold text-[#EAF3FC]">모둠 랭킹에 기록 저장하기</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="이름 또는 모둠명"
                    className="flex-1 bg-[#153A5C] border border-[#2C567F] rounded px-2.5 py-1.5 text-xs text-[#EAF3FC] focus:outline-none focus:border-[#E7A93D]"
                  />
                  <button
                    onClick={handleSaveScore}
                    className="px-3 py-1.5 rounded bg-[#6FCF97] hover:bg-[#5bb882] text-[#0E2A45] font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>저장</span>
                  </button>
                </div>
                {saveMsg && <div className="text-[11px] text-[#6FCF97] font-semibold">{saveMsg}</div>}
              </div>
            )}

            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded border border-[#2C567F] text-[#9FC0DC] hover:text-[#EAF3FC] text-xs cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>{showLeaderboard ? '명예의 전당 닫기' : '명예의 전당 보기'}</span>
            </button>

            {showLeaderboard && (
              <div className="mt-3 bg-[#0E2A45] border border-[#2C567F] rounded-lg p-2.5 max-h-40 overflow-y-auto text-xs space-y-1.5">
                <div className="font-bold text-[#E7A93D] mb-1">🏆 모둠 설계 효율 랭킹</div>
                {leaderboard.length === 0 ? (
                  <div className="text-gray-400 text-[11px]">아직 등록된 기록이 없습니다.</div>
                ) : (
                  leaderboard.slice(0, 5).map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1 border-b border-[#2C567F]/40 text-[11px]"
                    >
                      <span className="font-semibold text-[#EAF3FC]">
                        {idx + 1}위. {entry.name} ({entry.mode.toUpperCase()})
                      </span>
                      <span className="font-mono text-[#6FCF97] font-bold">{entry.score}%</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Educational Comparison Footer */}
          <div className="mt-4 pt-3 border-t border-[#2C567F] text-[11px] text-[#9FC0DC] leading-relaxed">
            <div className="text-[#E7A93D] font-bold mb-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>MST vs TSP의 엄청난 컴퓨터과학 차이</span>
            </div>
            <div>
              <strong>MST(최소 신장 트리):</strong> 컴퓨터가 눈 깜짝할 사이에 정답을 계산합니다 (다항 시간, P 문제).
            </div>
            <div>
              <strong>TSP(외판원 순회):</strong> 도시가 50개만 되어도 슈퍼컴퓨터로 수백 년이 걸리는 현대 암호학의 기반이자 최고의 난제(NP-Hard)입니다!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
