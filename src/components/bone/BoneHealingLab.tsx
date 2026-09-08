import React, { useState, useEffect, useRef } from 'react';
import { GameState, MissionKey } from '../../types';
import { HUD } from '../HUD';
import { MathView } from '../MathView';
import { Home, ArrowRight, Play, Pause, RotateCcw, Check, HelpCircle, Activity } from 'lucide-react';

interface BoneHealingLabProps {
  gameState: GameState;
  onAddXP: (amount: number) => void;
  onCompleteMission: (key: MissionKey, xp: number, stars: number) => void;
  onLaunchConfetti: () => void;
  onGoHome: () => void;
  onSwitchToGeometry: () => void;
  onSwitchToDiffusion: () => void;
}

export const BoneHealingLab: React.FC<BoneHealingLabProps> = ({
  gameState,
  onAddXP,
  onCompleteMission,
  onLaunchConfetti,
  onGoHome,
  onSwitchToGeometry,
  onSwitchToDiffusion,
}) => {
  const [activeTab, setActiveTab] = useState<'logistic' | 'cascade'>('logistic');

  // ===================== TAB 1: LOGISTIC STATE =====================
  const [k, setK] = useState<number>(0.06);
  const [logDay, setLogDay] = useState<number>(0);
  const [logPlaying, setLogPlaying] = useState<boolean>(false);
  const logTimerRef = useRef<number | null>(null);

  const TMAX_LOG = 120;

  // Logistic simulation computation
  const simulateLogistic = (rateK: number) => {
    let B = 1, t = 0;
    const dt = 0.5;
    let healed = false;
    const pts: { x: number; y: number }[] = [{ x: 0, y: B }];
    let t90: number | null = null;

    while (t < TMAX_LOG) {
      if (!healed) {
        const dB = (rateK * B * (100 - B)) / 100;
        B += dB * dt;
        if (B >= 90) {
          B = 100;
          healed = true;
        }
      }
      t += dt;
      pts.push({ x: t, y: B });
      if (t90 === null && B >= 90) t90 = t;
    }
    return { pts, t90 };
  };

  const { pts: logPts, t90: logT90 } = simulateLogistic(k);
  const logIdx = Math.min(logPts.length - 1, Math.round(logDay / 0.5));
  const currentB = logPts[logIdx] ? logPts[logIdx].y : 100;

  // Check Tab 1 Mission
  useEffect(() => {
    if (!gameState.missions.boneLogistic && logT90 !== null && logT90 <= 70) {
      onCompleteMission('boneLogistic', 40, 3);
    }
  }, [logT90, gameState.missions.boneLogistic, onCompleteMission]);

  // Tab 1 Animation Loop
  useEffect(() => {
    if (logPlaying) {
      logTimerRef.current = window.setInterval(() => {
        setLogDay((prev) => {
          if (prev >= TMAX_LOG) {
            setLogPlaying(false);
            return TMAX_LOG;
          }
          return prev + 1.5;
        });
      }, 60);
    } else if (logTimerRef.current) {
      clearInterval(logTimerRef.current);
    }
    return () => {
      if (logTimerRef.current) clearInterval(logTimerRef.current);
    };
  }, [logPlaying]);

  const handleLogPlayToggle = () => {
    if (logDay >= TMAX_LOG) setLogDay(0);
    setLogPlaying((p) => !p);
  };

  const handleLogReset = () => {
    setLogPlaying(false);
    setLogDay(0);
  };

  // Helper color for simple healing (warm rose-plum palette)
  const getSimpleColor = (pct: number) => {
    if (pct < 20) return '#FB7185';
    if (pct < 50) return '#F59E0B';
    if (pct < 80) return '#C084FC';
    return '#34D399';
  };

  // ===================== TAB 2: CASCADE STATE =====================
  const [paramA, setParamA] = useState<number>(0.15);
  const [paramB, setParamB] = useState<number>(0.08);
  const [paramC, setParamC] = useState<number>(0.03);
  const [cascDay, setCascDay] = useState<number>(0);
  const [cascPlaying, setCascPlaying] = useState<boolean>(false);
  const [activeProfile, setActiveProfile] = useState<'young' | 'adult' | 'slow' | 'custom'>('adult');
  const [clearedProfiles, setClearedProfiles] = useState<Set<string>>(new Set());
  const cascTimerRef = useRef<number | null>(null);

  const TMAX_CASC = 150;

  const profiles = {
    young: { a: 0.25, b: 0.12, c: 0.05 },
    adult: { a: 0.15, b: 0.08, c: 0.03 },
    slow: { a: 0.07, b: 0.04, c: 0.015 },
  };

  const simulateCascade = (a: number, b: number, c: number) => {
    let H = 100, S = 0, C = 0, R = 0, t = 0;
    const dt = 0.25;
    let healed = false;
    const pts: { x: number; H: number; S: number; C: number; R: number }[] = [
      { x: 0, H, S, C, R },
    ];
    let t90: number | null = null;

    while (t < TMAX_CASC) {
      if (!healed) {
        const dH = -a * H;
        const dS = a * H - b * S;
        const dC = b * S - c * C;
        const dR = c * C;
        H += dH * dt;
        S += dS * dt;
        C += dC * dt;
        R += dR * dt;
        if (R >= 90) {
          H = 0;
          S = 0;
          C = 0;
          R = 100;
          healed = true;
        }
      }
      t += dt;
      pts.push({
        x: t,
        H: Math.max(0, H),
        S: Math.max(0, S),
        C: Math.max(0, C),
        R: Math.min(100, R),
      });
      if (t90 === null && R >= 90) t90 = t;
    }
    return { pts, t90 };
  };

  const { pts: cascPts, t90: cascT90 } = simulateCascade(paramA, paramB, paramC);
  const cascIdx = Math.min(cascPts.length - 1, Math.round(cascDay / 0.25));
  const currentCasc = cascPts[cascIdx] || cascPts[cascPts.length - 1];

  // Visual structural integrity proxy
  const cascHealPct = Math.min(
    100,
    currentCasc.R + currentCasc.C * 0.5 + currentCasc.S * 0.15
  );

  const getPhaseColor = (H: number, S: number, C: number, R: number) => {
    const cols = [
      [251, 113, 133, H], // Rose Coral
      [251, 191, 36, S],  // Warm Gold
      [192, 132, 252, C], // Purple Amethyst
      [52, 211, 153, R],  // Mint Emerald
    ];
    let tot = H + S + C + R || 1, r = 0, g = 0, b = 0;
    cols.forEach(([cr, cg, cb, w]) => {
      r += cr * w;
      g += cg * w;
      b += cb * w;
    });
    r /= tot;
    g /= tot;
    b /= tot;
    return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
  };

  // Profile selection
  const handleSelectProfile = (key: 'young' | 'adult' | 'slow') => {
    setActiveProfile(key);
    setParamA(profiles[key].a);
    setParamB(profiles[key].b);
    setParamC(profiles[key].c);
  };

  // Check Mission 2
  useEffect(() => {
    if (cascT90 !== null && cascT90 <= TMAX_CASC) {
      setClearedProfiles((prev) => {
        const next = new Set(prev);
        next.add(activeProfile);
        return next;
      });
    }
  }, [cascT90, activeProfile]);

  useEffect(() => {
    if (!gameState.missions.boneCascade && clearedProfiles.size >= 3) {
      onCompleteMission('boneCascade', 100, 3);
      onLaunchConfetti();
    }
  }, [clearedProfiles, gameState.missions.boneCascade, onCompleteMission, onLaunchConfetti]);

  // Tab 2 Animation Loop
  useEffect(() => {
    if (cascPlaying) {
      cascTimerRef.current = window.setInterval(() => {
        setCascDay((prev) => {
          if (prev >= TMAX_CASC) {
            setCascPlaying(false);
            return TMAX_CASC;
          }
          return prev + 2;
        });
      }, 60);
    } else if (cascTimerRef.current) {
      clearInterval(cascTimerRef.current);
    }
    return () => {
      if (cascTimerRef.current) clearInterval(cascTimerRef.current);
    };
  }, [cascPlaying]);

  const handleCascPlayToggle = () => {
    if (cascDay >= TMAX_CASC) setCascDay(0);
    setCascPlaying((p) => !p);
  };

  const handleCascReset = () => {
    setCascPlaying(false);
    setCascDay(0);
  };

  // ===================== REALISTIC BONE SVG RENDERER =====================
  const renderBoneFragment = (
    xOuter: number,
    xInner: number,
    midY: number,
    isLeft: boolean,
    exposure: number,
    yOffset: number = 0
  ) => {
    const dir = isLeft ? 1 : -1;
    const shaftHalf = 13, knuckleR = 20, knuckleOff = 17;
    const shaftEndNearFrac = xInner - dir * 15;
    const shaftStartNearOuter = xOuter + dir * 16;
    const canalX1 = Math.min(shaftStartNearOuter, shaftEndNearFrac) + 10;
    const canalX2 = Math.max(shaftStartNearOuter, shaftEndNearFrac) - 4;

    const capNear = shaftEndNearFrac, capFar = xInner;
    const jag =
      dir > 0
        ? `M ${capNear},${midY - shaftHalf} L ${capNear + 8},${midY - shaftHalf} L ${capFar},${midY - 5} L ${capFar - 7},${midY + 3} L ${capFar},${midY + 9} L ${capNear + 6},${midY + shaftHalf} L ${capNear},${midY + shaftHalf} Z`
        : `M ${capNear},${midY - shaftHalf} L ${capNear - 8},${midY - shaftHalf} L ${capFar},${midY - 5} L ${capFar + 7},${midY + 3} L ${capFar},${midY + 9} L ${capNear - 6},${midY + shaftHalf} L ${capNear},${midY + shaftHalf} Z`;

    return (
      <g transform={`translate(0,${yOffset})`}>
        <g filter="url(#boneShadowPlum)">
          {/* Shaft */}
          <rect
            x={Math.min(shaftStartNearOuter, shaftEndNearFrac)}
            y={midY - shaftHalf}
            width={Math.abs(shaftEndNearFrac - shaftStartNearOuter)}
            height={shaftHalf * 2}
            fill="url(#boneGradPlum)"
          />
          {/* Knuckles */}
          <circle
            cx={xOuter + dir * knuckleR * 0.5}
            cy={midY - knuckleOff}
            r={knuckleR}
            fill="url(#boneGradPlum)"
          />
          <circle
            cx={xOuter + dir * knuckleR * 0.5}
            cy={midY + knuckleOff}
            r={knuckleR}
            fill="url(#boneGradPlum)"
          />
          <circle
            cx={xOuter}
            cy={midY}
            r={knuckleR * 0.75}
            fill="url(#boneGradPlum)"
          />
          {/* Jagged fracture edge */}
          <path d={jag} fill="url(#boneGradPlum)" />
        </g>

        {/* Medullary canal */}
        {canalX2 > canalX1 + 6 && (
          <rect
            x={canalX1}
            y={midY - 6}
            width={canalX2 - canalX1}
            height={12}
            rx={6}
            fill="#8E5E50"
            opacity={0.5}
          />
        )}

        {/* Marrow exposure */}
        {exposure > 0.03 && (
          <circle
            cx={xInner}
            cy={midY}
            r={7}
            fill="#9E2A2B"
            opacity={Math.min(0.6, exposure * 0.7)}
          />
        )}
      </g>
    );
  };

  const renderBoneScene = (healPct: number, callusColor: string) => {
    const midY = 100, maxGap = 78, minGap = 0;
    const gapCenter = 350;
    const gap = maxGap - (maxGap - minGap) * (healPct / 100);
    const leftEnd = gapCenter - gap / 2;
    const rightStart = gapCenter + gap / 2;
    const exposure = gap / maxGap;
    const misalign = (1 - healPct / 100) * 7;

    const bulge =
      healPct < 70 ? healPct / 70 : 1 - ((healPct - 70) / 30) * 0.35;
    const rx = gap / 2 + 12 + 20 * bulge;
    const ry = 13 + 9 + 15 * bulge;

    return (
      <g>
        {renderBoneFragment(30, leftEnd, midY, true, exposure, 0)}
        {renderBoneFragment(670, rightStart, midY, false, exposure, misalign)}

        {/* Callus Bulge */}
        <ellipse
          cx={gapCenter}
          cy={midY + misalign / 2}
          rx={rx}
          ry={ry}
          fill={callusColor}
          opacity={0.88}
          stroke="#12091A"
          strokeWidth={1.5}
        />

        {/* Inner bridge line once mostly healed */}
        {healPct > 55 && (
          <rect
            x={leftEnd - 3}
            y={midY - 11}
            width={gap + 6}
            height={22}
            rx={8}
            fill="url(#boneGradPlum)"
            opacity={Math.min(1, (healPct - 55) / 30)}
          />
        )}

        {/* Seamless union glow */}
        {healPct >= 99.5 && (
          <ellipse
            cx={gapCenter}
            cy={midY}
            rx={16}
            ry={15}
            fill="url(#boneGradPlum)"
            opacity={0.95}
          />
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-[#12091A] text-[#FAF5FF] font-sans relative pb-20 selection:bg-[#F472B6] selection:text-[#12091A]">
      {/* Top Universal Classroom Navigation */}
      <nav className="bg-[#1A0E26]/95 backdrop-blur border-b border-[#3E2156] sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#12091A] hover:bg-[#28153A] border border-[#3E2156] text-xs font-semibold text-[#D8B4FE] hover:text-[#FAF5FF] transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>수업 선택 홈</span>
            </button>

            <span className="text-[#3E2156]">|</span>

            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F472B6]">
              <span className="text-base">🦴</span>
              <span className="hidden sm:inline">과정 3:</span>
              <span>뼈가 붙는 수학 (생명현상과 미분방정식)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToGeometry}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#28153A] hover:bg-[#3E2156] text-[#E7A93D] text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>과정 1(기하)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={onSwitchToDiffusion}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#28153A] hover:bg-[#3E2156] text-[#3FA796] text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>과정 2(확산)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </nav>

      {/* Global Top HUD - Plum Medical Theme */}
      <HUD gameState={gameState} theme="plum" title="치유의 수학" icon="🦴" totalMissions={2} />

      {/* Header */}
      <header className="max-w-6xl mx-auto px-5 pt-6 pb-3">
        <div className="text-[11px] font-mono text-[#F472B6] tracking-wider uppercase flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          <span>중등수학 영재교육원 · 생명현상과 미분방정식</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif mt-1 mb-1.5 text-transparent bg-clip-text bg-gradient-to-r from-[#FAF5FF] via-[#F472B6] to-[#C084FC]">
          부러진 뼈가 붙는 수학
        </h1>
        <p className="text-xs sm:text-sm text-[#D8B4FE] max-w-3xl leading-relaxed">
          뼈는 하루아침에 붙지 않습니다. 혈종 → 연성가골 → 경성가골 → 재형성, 4단계를 거치며 서서히 회복됩니다.
          이 속도를 미분방정식으로 모델링하고, 눈으로 직접 골절 접합과 세포 치유의 수학을 확인해보세요!
        </p>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-5 mt-4">
        <nav className="flex gap-2 border-b border-[#3E2156]">
          <button
            onClick={() => setActiveTab('logistic')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border border-[#3E2156] border-b-0 ${
              activeTab === 'logistic'
                ? 'bg-gradient-to-r from-[#C084FC] via-[#E879F9] to-[#F472B6] text-[#12091A] font-extrabold shadow-md'
                : 'bg-[#1A0E26] text-[#D8B4FE] hover:text-[#FAF5FF] hover:bg-[#28153A]'
            }`}
          >
            <span>1. 로지스틱 치유 모델</span>
            {gameState.missions.boneLogistic && (
              <Check className={`w-3.5 h-3.5 stroke-[3] ${activeTab === 'logistic' ? 'text-[#12091A]' : 'text-[#34D399]'}`} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('cascade')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer border border-[#3E2156] border-b-0 ${
              activeTab === 'cascade'
                ? 'bg-gradient-to-r from-[#C084FC] via-[#E879F9] to-[#F472B6] text-[#12091A] font-extrabold shadow-md'
                : 'bg-[#1A0E26] text-[#D8B4FE] hover:text-[#FAF5FF] hover:bg-[#28153A]'
            }`}
          >
            <span>2. 4단계 카스케이드 시뮬레이터 🎮</span>
            {gameState.missions.boneCascade && (
              <Check className={`w-3.5 h-3.5 stroke-[3] ${activeTab === 'cascade' ? 'text-[#12091A]' : 'text-[#34D399]'}`} />
            )}
          </button>
        </nav>

        {/* Main Tab Content */}
        <main className="bg-[#1A0E26] border border-[#3E2156] rounded-b-2xl rounded-tr-2xl p-4 sm:p-6 shadow-2xl">
          {/* ===================== TAB 1: LOGISTIC MODEL ===================== */}
          {activeTab === 'logistic' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#FAF5FF]">
                치유 속도를 미분방정식으로 나타내기
              </h2>
              <p className="text-xs sm:text-sm text-[#D8B4FE] mt-1 mb-4 leading-relaxed">
                치유율 <span className="text-[#F472B6] font-mono font-bold">B(t)</span> (0~100%)가 시간에 따라 늘어나는 속도는,
                처음엔 빠르다가 다 나을수록 느려집니다. "남은 회복 여력"에 비례해서 속도가 줄어드는 이 구조는{' '}
                <strong className="text-[#FBBF24]">로지스틱 미분방정식</strong>으로 표현됩니다.
              </p>

              {/* Mission 1 Box */}
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#C084FC]/20 via-[#F472B6]/15 to-[#A855F7]/10 border border-[#C084FC]/50 mb-5 flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div className="flex-1">
                  <div className="text-[11px] font-mono font-bold text-[#F472B6] uppercase tracking-wider">
                    MISSION 1 — 최적 치유 상수 탐색
                  </div>
                  <div className="text-xs sm:text-sm text-[#FAF5FF] mt-0.5 leading-snug">
                    치유 속도 상수 <b>k</b>를 조절해서, <b>70일 이내에 치유율 90%</b>에 도달시켜보세요! 재생 버튼으로 애니메이션을 확인하세요.
                  </div>
                  <div className="text-xs font-mono text-[#FBBF24] font-bold mt-1.5 flex items-center gap-2">
                    <span>+40 XP</span>
                    <span className="flex gap-0.5">
                      <span className={gameState.missions.boneLogistic ? 'text-[#FBBF24]' : 'opacity-25'}>⭐</span>
                      <span className={gameState.missions.boneLogistic ? 'text-[#FBBF24]' : 'opacity-25'}>⭐</span>
                      <span className={gameState.missions.boneLogistic ? 'text-[#FBBF24]' : 'opacity-25'}>⭐</span>
                    </span>
                    {gameState.missions.boneLogistic && (
                      <span className="text-[#34D399] font-sans text-xs ml-2">미션 완료!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Math Formula Callout */}
              <div className="bg-[#12091A] border border-[#3E2156] rounded-xl p-3.5 mb-5 text-center">
                <div className="text-base sm:text-lg text-[#FAF5FF] font-mono py-1">
                  <MathView tex="\dfrac{dB}{dt} = k \cdot B \cdot \dfrac{100 - B}{100}" display />
                </div>
                <div className="text-xs text-[#D8B4FE] mt-1.5 leading-relaxed">
                  <span className="text-[#F472B6] font-mono font-bold">B</span> = 치유율(%),{' '}
                  <span className="text-[#FBBF24] font-mono font-bold">k</span> = 치유 속도 상수,{' '}
                  <span className="text-[#FAF5FF] font-mono font-bold">(100 - B)</span> = "아직 남은 회복 여력".
                  남은 여력이 클수록 초반엔 가속도가 붙고, 다 나을수록 천천히 굳어지는 S자 곡선이 완성됩니다.
                </div>
              </div>

              {/* Layout: Interactive Stage + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* SVG Visual Stage */}
                <div className="lg:col-span-2 bg-[#12091A] border border-[#3E2156] rounded-xl p-3 shadow-inner">
                  <svg viewBox="0 0 700 440" className="w-full h-auto select-none">
                    <defs>
                      <linearGradient id="boneGradPlum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FAF3E0" />
                        <stop offset="50%" stopColor="#E8DCC0" />
                        <stop offset="100%" stopColor="#B8A46E" />
                      </linearGradient>
                      <filter id="boneShadowPlum" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="0" stdDeviation="1.4" floodColor="#4B1E38" floodOpacity="0.95" />
                      </filter>
                    </defs>

                    {/* Top Section: Realistic Bone Animation */}
                    <g transform="translate(0, 0)">
                      {renderBoneScene(currentB, getSimpleColor(currentB))}
                      <text
                        x="350"
                        y="185"
                        fill="#D8B4FE"
                        fontSize="14"
                        fontFamily="JetBrains Mono"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        뼈 치유율 {Math.round(currentB)}%
                      </text>
                    </g>

                    {/* Bottom Section: Logistic Curve Chart */}
                    <g transform="translate(0, 220)">
                      {/* Grid & Axes */}
                      <line x1="40" y1="170" x2="660" y2="170" stroke="#3E2156" strokeWidth="1.5" />
                      <line x1="40" y1="20" x2="40" y2="170" stroke="#3E2156" strokeWidth="1.5" />

                      {/* Y ticks */}
                      {[0, 25, 50, 75, 100].map((v, i) => {
                        const yy = 170 - (i / 4) * (170 - 20);
                        return (
                          <g key={i}>
                            <line x1="40" y1={yy} x2="660" y2={yy} stroke="#2B173E" strokeWidth="1" />
                            <text
                              x="32"
                              y={yy + 4}
                              fill="#D8B4FE"
                              fontSize="10"
                              fontFamily="JetBrains Mono"
                              textAnchor="end"
                            >
                              {v}
                            </text>
                          </g>
                        );
                      })}

                      {/* X ticks */}
                      {[0, 30, 60, 90, 120].map((v, i) => {
                        const xx = 40 + (i / 4) * (660 - 40);
                        return (
                          <text
                            key={i}
                            x={xx}
                            y="188"
                            fill="#D8B4FE"
                            fontSize="10"
                            fontFamily="JetBrains Mono"
                            textAnchor="middle"
                          >
                            {v}
                          </text>
                        );
                      })}

                      <text x="350" y="206" fill="#D8B4FE" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">
                        일(day)
                      </text>
                      <text x="10" y="12" fill="#D8B4FE" fontSize="11" fontFamily="JetBrains Mono" textAnchor="start">
                        B(%)
                      </text>

                      {/* 90% Clinically Healed Threshold Line */}
                      <line
                        x1="40"
                        y1={170 - (90 / 100) * 150}
                        x2="660"
                        y2={170 - (90 / 100) * 150}
                        stroke="#FBBF24"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity={0.7}
                      />
                      <text
                        x="650"
                        y={170 - (90 / 100) * 150 - 4}
                        fill="#FBBF24"
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        textAnchor="end"
                      >
                        90% 완치선
                      </text>

                      {/* Area Fill */}
                      <path
                        d={`M 40 170 ${logPts
                          .map(
                            (p) =>
                              `L ${40 + (p.x / TMAX_LOG) * (660 - 40)} ${
                                170 - (p.y / 100) * (170 - 20)
                              }`
                          )
                          .join(' ')} L ${660} 170 Z`}
                        fill="#F472B6"
                        opacity={0.15}
                      />

                      {/* Line */}
                      <polyline
                        fill="none"
                        stroke="#F472B6"
                        strokeWidth="2.5"
                        points={logPts
                          .map(
                            (p) =>
                              `${40 + (p.x / TMAX_LOG) * (660 - 40)},${
                                170 - (p.y / 100) * (170 - 20)
                              }`
                          )
                          .join(' ')}
                      />

                      {/* Current Day Marker */}
                      {(() => {
                        const mx = 40 + (logDay / TMAX_LOG) * (660 - 40);
                        const my = 170 - (currentB / 100) * (170 - 20);
                        return (
                          <circle
                            cx={mx}
                            cy={my}
                            r={6}
                            fill="#FBBF24"
                            stroke="#12091A"
                            strokeWidth="2"
                            className="animate-pulse"
                          />
                        );
                      })()}
                    </g>
                  </svg>
                </div>

                {/* Sidebar Controls */}
                <div className="bg-[#241334] border border-[#3E2156] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono text-[#F472B6] font-bold uppercase tracking-wider mb-3">
                      파라미터 제어 및 계측
                    </div>

                    {/* Slider k */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-[#D8B4FE] mb-1">
                        <span>치유 속도 상수 k</span>
                        <b className="font-mono text-[#F472B6]">{k.toFixed(3)}</b>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.20"
                        step="0.005"
                        value={k}
                        onChange={(e) => setK(Number(e.target.value))}
                        className="w-full accent-[#F472B6] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-[#D8B4FE] mt-1 font-mono">
                        <span>0.020 (완서)</span>
                        <span>0.200 (초고속)</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-2 border-t border-b border-[#3E2156] py-3 text-xs mb-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[#D8B4FE]">경과 일수</span>
                        <b className="font-mono text-base text-[#FBBF24]">{Math.round(logDay)}일</b>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[#D8B4FE]">현재 치유율</span>
                        <b className="font-mono text-base text-[#F472B6]">{Math.round(currentB)}%</b>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[#D8B4FE]">90% 도달 예상일</span>
                        <b className="font-mono text-base text-[#C084FC]">
                          {logT90 === null ? '120일 이상' : `${Math.round(logT90)}일`}
                        </b>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        onClick={handleLogPlayToggle}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-[#C084FC] via-[#E879F9] to-[#F472B6] hover:brightness-110 text-[#12091A] font-extrabold text-xs transition-all cursor-pointer shadow-md"
                      >
                        {logPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{logPlaying ? '일시정지' : '재생'}</span>
                      </button>

                      <button
                        onClick={handleLogReset}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#3E2156] hover:bg-[#1A0E26] text-[#D8B4FE] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>처음으로</span>
                      </button>
                    </div>

                    {/* Q&A Accordion */}
                    <div className="bg-[#12091A] border border-[#3E2156] rounded-lg p-3 text-xs">
                      <div className="text-[#F472B6] font-bold mb-1 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Q. 왜 양 끝에서 속도가 느려질까요?</span>
                      </div>
                      <p className="text-[#D8B4FE] text-[11px] leading-relaxed">
                        <MathView tex="dB/dt = k \cdot B \cdot (100 - B) / 100" />이므로,{' '}
                        <span className="text-[#FAF5FF]">B가 0에 가까우면 인수 B 자체가 작고</span>,{' '}
                        <span className="text-[#FAF5FF]">B가 100에 가까우면 (100-B)가 작아집니다</span>.{' '}
                        따라서 양쪽 끝에서는 변화율이 0에 수렴하며, <strong>B = 50% 부근에서 가장 폭발적으로 뼈가 붙는 아름다운 S자 곡선</strong>을 그리게 됩니다!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: CASCADE SYSTEM ===================== */}
          {activeTab === 'cascade' && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#FAF5FF]">
                4단계 카스케이드 모델 — 연립미분방정식
              </h2>
              <p className="text-xs sm:text-sm text-[#D8B4FE] mt-1 mb-4 leading-relaxed">
                실제 골절 치유는 한 번에 일어나지 않고,{' '}
                <strong className="text-[#FB7185]">혈종(H)</strong> →{' '}
                <strong className="text-[#FBBF24]">연성가골(S)</strong> →{' '}
                <strong className="text-[#C084FC]">경성가골(C)</strong> →{' '}
                <strong className="text-[#34D399]">재형성된 뼈(R)</strong>{' '}
                순서로 이어지는 사슬 반응입니다. 각 단계가 다음 단계로 넘어가는 속도를 각각의 식으로 표현하면,
                네 식이 연결된 <strong>연립미분방정식</strong>이 됩니다.
              </p>

              {/* Mission 2 Box */}
              <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-[#C084FC]/20 via-[#F472B6]/15 to-[#A855F7]/10 border border-[#C084FC]/50 mb-5 flex items-start gap-3">
                <span className="text-2xl">🏆</span>
                <div className="flex-1">
                  <div className="text-[11px] font-mono font-bold text-[#F472B6] uppercase tracking-wider">
                    MISSION 2 FINAL BOSS — 환자 맞춤 치료 시뮬레이터
                  </div>
                  <div className="text-xs sm:text-sm text-[#FAF5FF] mt-0.5 leading-snug">
                    세 가지 환자 프로필 모두에서, <b>150일 이내에 재형성률(R) 90% 이상</b>을 달성하세요! 전환 속도 상수를 직접 조절해보며 각 단계가 얼마나 걸리는지 관찰하세요.
                  </div>
                  <div className="text-xs font-mono text-[#FBBF24] font-bold mt-1.5 flex items-center gap-2">
                    <span>+100 XP + 🎉 컨페티</span>
                    <span className="flex gap-0.5">
                      <span className={gameState.missions.boneCascade ? 'text-[#FBBF24]' : 'opacity-25'}>⭐</span>
                      <span className={gameState.missions.boneCascade ? 'text-[#FBBF24]' : 'opacity-25'}>⭐</span>
                      <span className={gameState.missions.boneCascade ? 'text-[#FBBF24]' : 'opacity-25'}>⭐</span>
                    </span>
                    <span className="text-[#D8B4FE] text-xs ml-2">
                      (프로필 달성: {clearedProfiles.size}/3)
                    </span>
                  </div>
                </div>
              </div>

              {/* Math Formula Callout */}
              <div className="bg-[#12091A] border border-[#3E2156] rounded-xl p-3.5 mb-4 text-center">
                <div className="text-sm sm:text-base text-[#FAF5FF] font-mono py-1">
                  <MathView
                    tex="\begin{aligned} \dfrac{dH}{dt} &= -aH \\ \dfrac{dS}{dt} &= aH - bS \\ \dfrac{dC}{dt} &= bS - cC \\ \dfrac{dR}{dt} &= cC \end{aligned}"
                    display
                  />
                </div>
                <div className="text-xs text-[#D8B4FE] mt-1.5 leading-relaxed">
                  각 단계는 앞 단계에서 <span className="text-[#34D399]">"흘러들어오는 양"</span>만큼 늘고,
                  자신이 다음 단계로 <span className="text-[#FB7185]">"빠져나가는 양"</span>만큼 줄어듭니다.
                  이 사슬 구조는 화학 반응 속도론이나 방사성 붕괴 계열에서도 동일하게 사용됩니다.
                </div>
              </div>

              {/* Profile Pill Buttons */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-mono text-[#D8B4FE]">환자 프로필:</span>
                <button
                  onClick={() => handleSelectProfile('young')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    activeProfile === 'young'
                      ? 'bg-[#F472B6]/20 border-[#F472B6] text-[#F472B6]'
                      : 'bg-[#12091A] border-[#3E2156] text-[#D8B4FE] hover:text-[#FAF5FF]'
                  }`}
                >
                  🏃 건강한 청소년
                </button>
                <button
                  onClick={() => handleSelectProfile('adult')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    activeProfile === 'adult'
                      ? 'bg-[#F472B6]/20 border-[#F472B6] text-[#F472B6]'
                      : 'bg-[#12091A] border-[#3E2156] text-[#D8B4FE] hover:text-[#FAF5FF]'
                  }`}
                >
                  🚶 건강한 성인
                </button>
                <button
                  onClick={() => handleSelectProfile('slow')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    activeProfile === 'slow'
                      ? 'bg-[#F472B6]/20 border-[#F472B6] text-[#F472B6]'
                      : 'bg-[#12091A] border-[#3E2156] text-[#D8B4FE] hover:text-[#FAF5FF]'
                  }`}
                >
                  🐢 회복이 느린 조건
                </button>
              </div>

              {/* Layout: Interactive Stage + Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* SVG Visual Stage */}
                <div className="lg:col-span-2 bg-[#12091A] border border-[#3E2156] rounded-xl p-3 shadow-inner">
                  <svg viewBox="0 0 700 440" className="w-full h-auto select-none">
                    <defs>
                      <linearGradient id="boneGradPlum2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FAF3E0" />
                        <stop offset="50%" stopColor="#E8DCC0" />
                        <stop offset="100%" stopColor="#B8A46E" />
                      </linearGradient>
                      <filter id="boneShadowPlum2" x="-30%" y="-30%" width="160%" height="160%">
                        <feDropShadow dx="0" dy="0" stdDeviation="1.4" floodColor="#4B1E38" floodOpacity="0.95" />
                      </filter>
                    </defs>

                    {/* Top Bone Visual with Blended Color & Structural Integrity */}
                    <g transform="translate(0, 0)">
                      {renderBoneScene(
                        cascHealPct,
                        getPhaseColor(
                          currentCasc.H,
                          currentCasc.S,
                          currentCasc.C,
                          currentCasc.R
                        )
                      )}
                      <text
                        x="350"
                        y="185"
                        fill="#D8B4FE"
                        fontSize="14"
                        fontFamily="JetBrains Mono"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        구조적 안정성 {Math.round(cascHealPct)}%
                      </text>
                    </g>

                    {/* Bottom Stacked Area Chart */}
                    <g transform="translate(0, 220)">
                      <line x1="40" y1="170" x2="660" y2="170" stroke="#3E2156" strokeWidth="1.5" />
                      <line x1="40" y1="20" x2="40" y2="170" stroke="#3E2156" strokeWidth="1.5" />

                      {/* Y ticks */}
                      {[0, 25, 50, 75, 100].map((v, i) => {
                        const yy = 170 - (i / 4) * (170 - 20);
                        return (
                          <g key={i}>
                            <line x1="40" y1={yy} x2="660" y2={yy} stroke="#2B173E" strokeWidth="1" />
                            <text
                              x="32"
                              y={yy + 4}
                              fill="#D8B4FE"
                              fontSize="10"
                              fontFamily="JetBrains Mono"
                              textAnchor="end"
                            >
                              {v}
                            </text>
                          </g>
                        );
                      })}

                      {/* X ticks */}
                      {[0, 37.5, 75, 112.5, 150].map((v, i) => {
                        const xx = 40 + (i / 4) * (660 - 40);
                        return (
                          <text
                            key={i}
                            x={xx}
                            y="188"
                            fill="#D8B4FE"
                            fontSize="10"
                            fontFamily="JetBrains Mono"
                            textAnchor="middle"
                          >
                            {Math.round(v)}
                          </text>
                        );
                      })}

                      {/* Stacked Bands: H, H+S, H+S+C, H+S+C+R */}
                      {(() => {
                        const sx = (v: number) => 40 + (v / TMAX_CASC) * (660 - 40);
                        const sy = (v: number) => 170 - (v / 100) * (170 - 20);

                        const makeBand = (
                          lowFn: (p: any) => number,
                          highFn: (p: any) => number
                        ) => {
                          let d = '';
                          cascPts.forEach((p, i) => {
                            const yy = highFn(p);
                            d += (i === 0 ? 'M ' : 'L ') + sx(p.x) + ' ' + sy(yy) + ' ';
                          });
                          for (let i = cascPts.length - 1; i >= 0; i--) {
                            const p = cascPts[i];
                            const yy = lowFn(p);
                            d += 'L ' + sx(p.x) + ' ' + sy(yy) + ' ';
                          }
                          d += 'Z';
                          return d;
                        };

                        return (
                          <>
                            {/* Layer 1: H (Rose Coral) */}
                            <path
                              d={makeBand(
                                () => 0,
                                (p) => p.H
                              )}
                              fill="#FB7185"
                              opacity={0.8}
                            />
                            {/* Layer 2: S (Gold) */}
                            <path
                              d={makeBand(
                                (p) => p.H,
                                (p) => p.H + p.S
                              )}
                              fill="#FBBF24"
                              opacity={0.8}
                            />
                            {/* Layer 3: C (Purple) */}
                            <path
                              d={makeBand(
                                (p) => p.H + p.S,
                                (p) => p.H + p.S + p.C
                              )}
                              fill="#C084FC"
                              opacity={0.8}
                            />
                            {/* Layer 4: R (Mint) */}
                            <path
                              d={makeBand(
                                (p) => p.H + p.S + p.C,
                                (p) => p.H + p.S + p.C + p.R
                              )}
                              fill="#34D399"
                              opacity={0.8}
                            />
                          </>
                        );
                      })()}

                      {/* Day marker vertical line */}
                      {(() => {
                        const mx = 40 + (cascDay / TMAX_CASC) * (660 - 40);
                        return (
                          <line
                            x1={mx}
                            y1={20}
                            x2={mx}
                            y2={170}
                            stroke="#FAF5FF"
                            strokeWidth={1.5}
                            strokeDasharray="3 3"
                          />
                        );
                      })()}
                    </g>
                  </svg>

                  {/* Legend Row */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#FB7185]" />
                      <span className="text-[#FB7185]">혈종 H</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#FBBF24]" />
                      <span className="text-[#FBBF24]">연성가골 S</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#C084FC]" />
                      <span className="text-[#C084FC]">경성가골 C</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-[#34D399]" />
                      <span className="text-[#34D399]">재형성 R</span>
                    </div>
                  </div>
                </div>

                {/* Sidebar Controls */}
                <div className="bg-[#241334] border border-[#3E2156] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono text-[#F472B6] font-bold uppercase tracking-wider mb-2">
                      전환 속도 상수 제어실
                    </div>

                    {/* Slider a (H -> S) */}
                    <div className="mb-2.5">
                      <div className="flex justify-between text-xs text-[#D8B4FE] mb-0.5">
                        <span>H → S 속도 a</span>
                        <b className="font-mono text-[#FB7185]">{paramA.toFixed(3)}</b>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.30"
                        step="0.01"
                        value={paramA}
                        onChange={(e) => {
                          setActiveProfile('custom');
                          setParamA(Number(e.target.value));
                        }}
                        className="w-full accent-[#FB7185] cursor-pointer"
                      />
                    </div>

                    {/* Slider b (S -> C) */}
                    <div className="mb-2.5">
                      <div className="flex justify-between text-xs text-[#D8B4FE] mb-0.5">
                        <span>S → C 속도 b</span>
                        <b className="font-mono text-[#FBBF24]">{paramB.toFixed(3)}</b>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="0.20"
                        step="0.005"
                        value={paramB}
                        onChange={(e) => {
                          setActiveProfile('custom');
                          setParamB(Number(e.target.value));
                        }}
                        className="w-full accent-[#FBBF24] cursor-pointer"
                      />
                    </div>

                    {/* Slider c (C -> R) */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-[#D8B4FE] mb-0.5">
                        <span>C → R 속도 c</span>
                        <b className="font-mono text-[#34D399]">{paramC.toFixed(3)}</b>
                      </div>
                      <input
                        type="range"
                        min="0.005"
                        max="0.10"
                        step="0.005"
                        value={paramC}
                        onChange={(e) => {
                          setActiveProfile('custom');
                          setParamC(Number(e.target.value));
                        }}
                        className="w-full accent-[#34D399] cursor-pointer"
                      />
                    </div>

                    {/* Day Display */}
                    <div className="bg-[#12091A] py-1.5 px-3 rounded-lg border border-[#3E2156] text-center font-mono text-base font-bold text-[#FBBF24] mb-3">
                      Day {Math.round(cascDay)}
                    </div>

                    {/* Metrics */}
                    <div className="space-y-1.5 text-xs border-t border-b border-[#3E2156] py-2 mb-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[#FB7185]">혈종 H</span>
                        <b className="font-mono text-[#FB7185]">{Math.round(currentCasc.H)}%</b>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[#FBBF24]">연성가골 S</span>
                        <b className="font-mono text-[#FBBF24]">{Math.round(currentCasc.S)}%</b>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[#C084FC]">경성가골 C</span>
                        <b className="font-mono text-[#C084FC]">{Math.round(currentCasc.C)}%</b>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[#34D399]">재형성 R</span>
                        <b className="font-mono text-[#34D399]">{Math.round(currentCasc.R)}%</b>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-[#3E2156]">
                        <span className="text-[#F472B6]">90% 도달일</span>
                        <b className="font-mono text-sm text-[#F472B6]">
                          {cascT90 === null ? '150일 이상' : `${Math.round(cascT90)}일`}
                        </b>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button
                        onClick={handleCascPlayToggle}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-[#C084FC] via-[#E879F9] to-[#F472B6] hover:brightness-110 text-[#12091A] font-extrabold text-xs transition-all cursor-pointer shadow-md"
                      >
                        {cascPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{cascPlaying ? '일시정지' : '재생'}</span>
                      </button>

                      <button
                        onClick={handleCascReset}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#3E2156] hover:bg-[#1A0E26] text-[#D8B4FE] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>처음으로</span>
                      </button>
                    </div>

                    {/* Deep Q&A Box */}
                    <div className="bg-[#12091A] border border-[#3E2156] rounded-lg p-2.5 text-xs">
                      <div className="text-[#F472B6] font-bold mb-1 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>심화 Q. 병목 구간(Rate-Limiting Step)</span>
                      </div>
                      <p className="text-[#D8B4FE] text-[11px] leading-relaxed">
                        사슬 전체의 속도는 <strong>가장 느린 단계(병목 구간)</strong>에 의해 결정됩니다.
                        세 계수 중 하나만 극단적으로 줄이면, 나머지 계수를 아무리 높여도 뼈가 완치되는 총시간은 거의 줄어들지 않는 현상을 슬라이더로 직접 확인해 보세요!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
