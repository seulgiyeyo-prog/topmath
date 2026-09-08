import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, MissionKey, CourseId } from './types';
import { CourseSelectionPage } from './components/CourseSelectionPage';
import { DiffusionLab } from './components/DiffusionLab';
import { GeometryLab } from './components/geometry/GeometryLab';
import { BoneHealingLab } from './components/bone/BoneHealingLab';

interface ToastItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
}

export default function App() {
  // Read initial course from URL hash if available (#diffusion or #geometry or #bone)
  const getInitialCourse = (): CourseId => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'diffusion') return 'diffusion';
    if (hash === 'geometry') return 'geometry';
    if (hash === 'bone') return 'bone';
    return 'home';
  };

  const [currentCourse, setCurrentCourse] = useState<CourseId>(getInitialCourse);

  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem('math_lab_gamestate');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      xp: 0,
      level: 1,
      score: 0,
      streak: 0,
      missions: {
        net: false,
        path: false,
        exp: false,
        calc: false,
        sir: false,
        herd: false,
      },
      achievements: [],
      pathBest: null,
    };
  });

  // Save game state
  useEffect(() => {
    try {
      localStorage.setItem('math_lab_gamestate', JSON.stringify(gameState));
    } catch {
      // ignore
    }
  }, [gameState]);

  // Sync hash with currentCourse
  const setCourse = useCallback((course: CourseId) => {
    setCurrentCourse(course);
    window.location.hash = course === 'home' ? '' : course;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to popstate / hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'diffusion') setCurrentCourse('diffusion');
      else if (hash === 'geometry') setCurrentCourse('geometry');
      else setCurrentCourse('home');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Show Toast
  const showToast = useCallback((title: string, desc: string, icon = '🏅') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, desc, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  // Confetti effect
  const launchConfetti = useCallback(() => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#F2B84B', '#3FA796', '#FF6B5C', '#C084FC', '#4ADE80', '#F472B6', '#E7A93D', '#7FC4EE'];
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rot: number;
      rotV: number;
      life: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 8,
        life: 1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach((p) => {
        if (p.life <= 0) return;
        aliveCount++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.rot += p.rotV;
        p.life -= 0.012;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });

      if (aliveCount > 0) {
        animId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();
  }, []);

  // Add XP and level up
  const addXP = useCallback(
    (amount: number) => {
      setGameState((prev) => {
        let newXp = prev.xp + amount;
        let newLevel = prev.level;
        const newScore = prev.score + amount;
        const xpNeeded = newLevel * 100;

        if (newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel++;
          showToast('레벨 업!', `Lv.${newLevel} 달성! 계속 탐험하세요.`, '🎊');
          launchConfetti();
        }

        return {
          ...prev,
          xp: newXp,
          level: newLevel,
          score: newScore,
        };
      });
    },
    [launchConfetti, showToast]
  );

  // Complete mission
  const completeMission = useCallback(
    (key: MissionKey, xp: number, _stars: number) => {
      setGameState((prev) => {
        if (prev.missions[key]) return prev;
        const updatedMissions = { ...prev.missions, [key]: true };
        const newStreak = prev.streak + 1;

        showToast('미션 달성!', `미션을 성공적으로 클리어했습니다! (+${xp} XP)`, '🎯');

        const allDone = Object.values(updatedMissions).every(Boolean);
        if (allDone) {
          setTimeout(() => {
            showToast('🎓 완전 정복!', '모든 미션을 클리어했습니다! 확산의 수학 마스터!', '🏆');
            launchConfetti();
          }, 600);
        }

        return {
          ...prev,
          streak: newStreak,
          missions: updatedMissions,
        };
      });
      addXP(xp);
    },
    [addXP, launchConfetti, showToast]
  );

  const completedCount = Object.values(gameState.missions).filter(Boolean).length;

  return (
    <>
      {/* Confetti Canvas */}
      <canvas
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Global Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#1A3D37] to-[#153A5C] border border-[#F2B84B] shadow-2xl text-xs max-w-sm pointer-events-auto animate-in slide-in-from-right-10 duration-300"
          >
            <span className="text-2xl">{toast.icon}</span>
            <div>
              <div className="font-bold text-[#F2B84B]">{toast.title}</div>
              <div className="text-[#9FC0DC] mt-0.5 leading-snug">{toast.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Render Current Course View */}
      {currentCourse === 'home' && (
        <CourseSelectionPage
          onSelectCourse={(course) => setCourse(course)}
          diffusionProgress={{
            completedMissions: completedCount,
            totalMissions: 6,
            level: gameState.level,
          }}
        />
      )}

      {currentCourse === 'diffusion' && (
        <DiffusionLab
          gameState={gameState}
          onAddXP={addXP}
          onCompleteMission={completeMission}
          onSavePathBest={(t) => setGameState((prev) => ({ ...prev, pathBest: t }))}
          onLaunchConfetti={launchConfetti}
          onGoHome={() => setCourse('home')}
          onSwitchToGeometry={() => setCourse('geometry')}
        />
      )}

      {currentCourse === 'geometry' && (
        <GeometryLab
          onGoHome={() => setCourse('home')}
          onSwitchToDiffusion={() => setCourse('diffusion')}
        />
      )}

      {currentCourse === 'bone' && (
        <BoneHealingLab
          gameState={gameState}
          onAddXP={addXP}
          onCompleteMission={completeMission}
          onLaunchConfetti={launchConfetti}
          onGoHome={() => setCourse('home')}
          onSwitchToGeometry={() => setCourse('geometry')}
          onSwitchToDiffusion={() => setCourse('diffusion')}
        />
      )}
    </>
  );
}
