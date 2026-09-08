import React, { useState } from 'react';
import { MessageSquare, ShieldCheck, AlertCircle, Play, RotateCcw, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';

interface SNSUser {
  id: number;
  name: string;
  x: number;
  y: number;
  state: 'neutral' | 'fake' | 'fact'; // neutral, infected with fake news, or verified by fact check
}

interface Connection {
  from: number;
  to: number;
}

export const FakeNewsGameTab: React.FC<{
  onCompleteMission?: (xp: number, stars: number) => void;
  isMissionCompleted?: boolean;
}> = ({ onCompleteMission, isMissionCompleted }) => {
  const initialUsers: SNSUser[] = [
    { id: 0, name: '민준', x: 80, y: 120, state: 'fake' }, // Starts fake news
    { id: 1, name: '서연', x: 170, y: 70, state: 'neutral' },
    { id: 2, name: '도윤', x: 190, y: 190, state: 'neutral' },
    { id: 3, name: '예은 (인플루언서)', x: 290, y: 110, state: 'neutral' },
    { id: 4, name: '시우', x: 110, y: 310, state: 'neutral' },
    { id: 5, name: '하은', x: 240, y: 300, state: 'neutral' },
    { id: 6, name: '지호 (기자)', x: 380, y: 220, state: 'neutral' },
    { id: 7, name: '수아', x: 420, y: 100, state: 'neutral' },
    { id: 8, name: '유준', x: 500, y: 180, state: 'neutral' },
    { id: 9, name: '지민', x: 350, y: 330, state: 'neutral' },
    { id: 10, name: '은우', x: 480, y: 310, state: 'neutral' },
  ];

  const connections: Connection[] = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 0, to: 4 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
    { from: 2, to: 5 },
    { from: 3, to: 6 },
    { from: 3, to: 7 },
    { from: 4, to: 5 },
    { from: 5, to: 6 },
    { from: 5, to: 9 },
    { from: 6, to: 7 },
    { from: 6, to: 8 },
    { from: 6, to: 9 },
    { from: 7, to: 8 },
    { from: 8, to: 10 },
    { from: 9, to: 10 },
  ];

  const [users, setUsers] = useState<SNSUser[]>(initialUsers);
  const [turn, setTurn] = useState<number>(1);
  const [factCardsLeft, setFactCardsLeft] = useState<number>(2);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [lost, setLost] = useState<boolean>(false);

  const fakeCount = users.filter((u) => u.state === 'fake').length;
  const factCount = users.filter((u) => u.state === 'fact').length;

  // Apply Fact Check Card on clicked node
  const handleNodeClick = (id: number) => {
    if (gameOver) return;
    const target = users[id];
    if (target.state !== 'neutral') {
      alert('이미 가짜 뉴스에 물들었거나 이미 팩트체크가 완료된 사용자입니다!');
      return;
    }
    if (factCardsLeft <= 0) {
      alert('이번 턴에 사용할 수 있는 팩트체크 카드를 모두 썼습니다! [턴 종료 (가짜 뉴스 확산)]를 누르세요.');
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, state: 'fact' } : u))
    );
    setFactCardsLeft((c) => c - 1);
  };

  // Next Turn: Fake news attempts to spread to connected neutral nodes
  const handleNextTurn = () => {
    if (gameOver) return;

    // Find all neighbors of 'fake' nodes that are 'neutral'
    const newFakeIds = new Set<number>();

    users.forEach((u) => {
      if (u.state === 'fake') {
        connections.forEach((c) => {
          if (c.from === u.id && users[c.to].state === 'neutral') {
            newFakeIds.add(c.to);
          }
          if (c.to === u.id && users[c.from].state === 'neutral') {
            newFakeIds.add(c.from);
          }
        });
      }
    });

    const updatedUsers = users.map((u) =>
      newFakeIds.has(u.id) ? { ...u, state: 'fake' as const } : u
    );

    const updatedFakeCount = updatedUsers.filter((u) => u.state === 'fake').length;
    const updatedFactCount = updatedUsers.filter((u) => u.state === 'fact').length;
    const remainingNeutral = updatedUsers.filter((u) => u.state === 'neutral').length;

    setUsers(updatedUsers);

    // Win/Loss check
    if (updatedFakeCount >= 6) {
      // 50% or more contaminated
      setGameOver(true);
      setLost(true);
    } else if (newFakeIds.size === 0 || remainingNeutral === 0 || turn >= 4) {
      // Fake news completely contained!
      setGameOver(true);
      setWon(true);
      if (onCompleteMission) onCompleteMission(70, 3);
    } else {
      setTurn((t) => t + 1);
      setFactCardsLeft(2); // replenishment
    }
  };

  const resetGame = () => {
    setUsers(initialUsers);
    setTurn(1);
    setFactCardsLeft(2);
    setGameOver(false);
    setWon(false);
    setLost(false);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-4 border-b border-[#234E47] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#EAFBF6]">
            가짜 뉴스 vs 팩트체크 방어 게임 (SNS 소문 확산 전략)
          </h2>
          <p className="text-xs sm:text-sm text-[#7DBFB0] mt-1">
            SNS에서 악의적 가짜 뉴스(빨간색)가 무서운 속도로 리트윗되고 있습니다.{' '}
            <strong className="text-[#3FA796]">턴마다 주어지는 팩트체크 카드(파란색)</strong>를 핵심 인플루언서에게 주입해 가짜 뉴스를 포위 차단하세요!
          </p>
        </div>
        {won && (
          <span className="mt-2 sm:mt-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4ADE80]/20 border border-[#4ADE80] text-[#4ADE80] text-xs font-bold animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            소문 차단 완료! SNS 진실 사수!
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* SVG Network Canvas */}
        <div className="lg:col-span-2 bg-[#0A1A18] border border-[#234E47] rounded-xl p-2 relative overflow-hidden shadow-inner">
          <svg viewBox="0 0 600 420" className="w-full h-auto select-none">
            {/* Connections */}
            {connections.map((c, idx) => {
              const u = users[c.from];
              const v = users[c.to];
              return (
                <line
                  key={idx}
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={
                    u.state === 'fake' && v.state === 'fake'
                      ? '#FF6B5C'
                      : u.state === 'fact' && v.state === 'fact'
                      ? '#3FA796'
                      : '#234E47'
                  }
                  strokeWidth={2}
                  opacity={0.7}
                />
              );
            })}

            {/* Users */}
            {users.map((u) => {
              const isInfluencer = u.name.includes('인플루언서') || u.name.includes('기자');
              return (
                <g
                  key={u.id}
                  onClick={() => handleNodeClick(u.id)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={u.x}
                    cy={u.y}
                    r={isInfluencer ? 22 : 16}
                    fill={
                      u.state === 'fake'
                        ? '#FF6B5C'
                        : u.state === 'fact'
                        ? '#3FA796'
                        : '#1A3D37'
                    }
                    stroke={
                      u.state === 'fake'
                        ? '#FFFFFF'
                        : u.state === 'fact'
                        ? '#6FCF97'
                        : '#7DBFB0'
                    }
                    strokeWidth={isInfluencer ? 3 : 2}
                    className="transition-all duration-300 group-hover:scale-110"
                  />
                  <text
                    x={u.x}
                    y={u.y + 4}
                    fill="#FFFFFF"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {u.state === 'fake' ? '🚨' : u.state === 'fact' ? '🛡️' : u.name[0]}
                  </text>
                  <text
                    x={u.x}
                    y={u.y + (isInfluencer ? 34 : 26)}
                    fill={
                      u.state === 'fake'
                        ? '#FF6B5C'
                        : u.state === 'fact'
                        ? '#6FCF97'
                        : '#7DBFB0'
                    }
                    fontSize={10}
                    fontWeight="bold"
                    fontFamily="Noto Sans KR"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {u.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Turn Dashboard */}
        <div className="bg-[#132E29] border border-[#234E47] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#234E47] pb-2 mb-3">
              <span className="text-xs font-mono text-[#F2B84B] font-bold uppercase">
                턴 전략 제어실 (Turn {turn}/4)
              </span>
              <span className="text-xs font-mono text-[#6FCF97] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>카드: {factCardsLeft}장 남음</span>
              </span>
            </div>

            {/* Live Count Status */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-center">
              <div className="bg-[#0A1A18] p-2.5 rounded-lg border border-[#FF6B5C]/50">
                <div className="text-[#FF6B5C] font-semibold">🚨 가짜 뉴스 감염</div>
                <div className="text-lg font-bold font-mono text-[#FF6B5C] mt-0.5">
                  {fakeCount} / 11명
                </div>
              </div>
              <div className="bg-[#0A1A18] p-2.5 rounded-lg border border-[#3FA796]/50">
                <div className="text-[#6FCF97] font-semibold">🛡️ 팩트체크 완료</div>
                <div className="text-lg font-bold font-mono text-[#6FCF97] mt-0.5">
                  {factCount} / 11명
                </div>
              </div>
            </div>

            {/* Instruction Callout */}
            <div className="p-3 rounded-lg bg-[#0A1A18] border border-[#234E47] text-xs text-[#7DBFB0] mb-4 leading-relaxed">
              👉 <strong>행동 요령:</strong> 가짜 뉴스는 인플루언서(예은, 지호)를 타고 걷잡을 수 없이 퍼집니다.{' '}
              초록색 노드를 클릭하여 <strong className="text-[#6FCF97]">팩트체크</strong>를 주입한 뒤 <strong>[턴 종료]</strong>를 누르세요!
            </div>

            {/* Win/Loss Status */}
            {lost && (
              <div className="p-3 rounded-lg bg-[#FF6B5C]/20 border border-[#FF6B5C] text-xs text-[#FF6B5C] mb-3 flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>SNS 여론 오염 (패배)</strong>
                  <div className="text-[11px] mt-0.5">
                    가짜 뉴스가 전체 네트워크의 50% 이상으로 퍼졌습니다. 인플루언서를 먼저 선점해 보세요!
                  </div>
                </div>
              </div>
            )}

            {won && (
              <div className="p-3 rounded-lg bg-[#4ADE80]/20 border border-[#4ADE80] text-xs text-[#4ADE80] mb-3 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>가짜 뉴스 차단 성공! (승리)</strong>
                  <div className="text-[11px] mt-0.5">
                    소문의 전파 경로를 완벽히 포위하여 진실을 지켜냈습니다! (+70 XP)
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleNextTurn}
                disabled={gameOver}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#F2B84B] hover:bg-[#d9a038] text-[#0A1A18] font-bold text-xs transition-colors cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>턴 종료 (가짜 뉴스 확산 진행)</span>
              </button>

              <button
                onClick={resetGame}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#234E47] hover:bg-[#1A3D37] text-[#7DBFB0] text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>게임 다시 시작</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#234E47] text-[11px] text-[#7DBFB0] leading-relaxed">
            <div className="text-[#F2B84B] font-bold mb-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              <span>정보 확산의 수학적 법칙</span>
            </div>
            소문과 가짜 뉴스는 바이러스와 똑같은 <strong>네트워크 확산 방정식</strong>을 따릅니다.
            차수가 높은 연결 허브(인플루언서)를 팩트체크하면 확산 재생산지수가 급락합니다!
          </div>
        </div>
      </div>
    </div>
  );
};
