import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Droplets,
  Sparkles,
  RotateCcw,
  Maximize2,
  Info,
  CheckCircle2,
  ArrowRight,
  Route,
  Zap,
} from 'lucide-react';
import { MathView } from '../MathView';

interface Point2D {
  x: number;
  y: number;
}

export const SoapFilmLab: React.FC = () => {
  const [labMode, setLabMode] = useState<'triangle' | 'square'>('triangle');
  const [showVectors, setShowVectors] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  const [isDipping, setIsDipping] = useState(false);
  const [dipProgress, setDipProgress] = useState(1); // 0 to 1

  // 4-pillar square mode options: 'H_horizontal' | 'H_vertical' | 'X_diagonal'
  const [squareConfig, setSquareConfig] = useState<'H_horizontal' | 'H_vertical' | 'X_diagonal'>('H_horizontal');

  // Interactive Pillars for Triangle Mode
  const [triPillars, setTriPillars] = useState<Point2D[]>([
    { x: 180, y: 320 }, // A (bottom-left)
    { x: 420, y: 320 }, // B (bottom-right)
    { x: 300, y: 110 }, // C (top)
  ]);

  // Interactive Pillars for Square Mode (Default 1x1 aspect ratio)
  const [sqPillars, setSqPillars] = useState<Point2D[]>([
    { x: 190, y: 120 }, // A (top-left)
    { x: 410, y: 120 }, // B (top-right)
    { x: 410, y: 340 }, // C (bottom-right)
    { x: 190, y: 340 }, // D (bottom-left)
  ]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragPillarIdxRef = useRef<number>(-1);

  // Trigger dip animation (simulating withdrawing frame from soap solution)
  const triggerDipAnimation = () => {
    setIsDipping(true);
    setDipProgress(0);
    let start: number | null = null;
    const duration = 900; // ms

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const prog = Math.min(1, elapsed / duration);
      // easeOutBack bounce for surface tension snap
      const c1 = 1.70158;
      const c3 = c1 + 1;
      const eased = prog >= 1 ? 1 : 1 + c3 * Math.pow(prog - 1, 3) + c1 * Math.pow(prog - 1, 2);
      setDipProgress(Math.min(1, Math.max(0, eased)));

      if (prog < 1) {
        requestAnimationFrame(step);
      } else {
        setIsDipping(false);
        setDipProgress(1);
      }
    };
    requestAnimationFrame(step);
  };

  // Helper geometry calculations
  const getAngleDeg = (p1: Point2D, p2: Point2D, p3: Point2D) => {
    const a = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    const b = Math.hypot(p3.x - p2.x, p3.y - p2.y);
    const c = Math.hypot(p1.x - p3.x, p1.y - p3.y);
    if (a < 1e-5 || b < 1e-5) return 60;
    const cosV = (a * a + b * b - c * c) / (2 * a * b);
    return Math.acos(Math.max(-1, Math.min(1, cosV))) * (180 / Math.PI);
  };

  const rotatePt = (pt: Point2D, center: Point2D, deg: number): Point2D => {
    const rad = (deg * Math.PI) / 180;
    const dx = pt.x - center.x;
    const dy = pt.y - center.y;
    return {
      x: center.x + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: center.y + dx * Math.sin(rad) + dy * Math.cos(rad),
    };
  };

  const getExtApex = (p1: Point2D, p2: Point2D, opp: Point2D): Point2D => {
    const c1 = rotatePt(p2, p1, 60);
    const c2 = rotatePt(p2, p1, -60);
    const d1 = Math.hypot(c1.x - opp.x, c1.y - opp.y);
    const d2 = Math.hypot(c2.x - opp.x, c2.y - opp.y);
    return d1 > d2 ? c1 : c2;
  };

  const lineIntersection = (p1: Point2D, p2: Point2D, p3: Point2D, p4: Point2D): Point2D | null => {
    const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
    if (Math.abs(denom) < 1e-5) return null;
    const t = ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
    return { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) };
  };

  // Compute 3-pillar Fermat Point (Soap Film Junction)
  const computeTriFermat = useCallback(() => {
    const [A, B, C] = triPillars;
    const angA = getAngleDeg(B, A, C);
    const angB = getAngleDeg(A, B, C);
    const angC = getAngleDeg(A, C, B);

    if (angA >= 120) return { pt: A, isObtuse: true, obtusePillar: 'A', angles: [angA, angB, angC] };
    if (angB >= 120) return { pt: B, isObtuse: true, obtusePillar: 'B', angles: [angA, angB, angC] };
    if (angC >= 120) return { pt: C, isObtuse: true, obtusePillar: 'C', angles: [angA, angB, angC] };

    const extBC = getExtApex(B, C, A);
    const extCA = getExtApex(C, A, B);
    const inter = lineIntersection(A, extBC, B, extCA);

    return {
      pt: inter || { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 },
      isObtuse: false,
      obtusePillar: null,
      angles: [angA, angB, angC],
    };
  }, [triPillars]);

  // Compute 4-pillar Steiner points & lengths
  const computeSquareSteiner = useCallback(() => {
    const [A, B, C, D] = sqPillars;
    const width = Math.hypot(B.x - A.x, B.y - A.y);
    const height = Math.hypot(D.x - A.x, D.y - A.y);

    // Center of square
    const center = {
      x: (A.x + B.x + C.x + D.x) / 4,
      y: (A.y + B.y + C.y + D.y) / 4,
    };

    // Diagonal X-shape (single intersection at center)
    const lenX = Math.hypot(center.x - A.x, center.y - A.y) +
      Math.hypot(center.x - B.x, center.y - B.y) +
      Math.hypot(center.x - C.x, center.y - C.y) +
      Math.hypot(center.x - D.x, center.y - D.y);

    // H-horizontal: two junction points P1 (between A, D) and P2 (between B, C)
    // Distance from vertical edge is w/2 - h/(2*sqrt(3))
    const offsetH = Math.max(10, Math.min(width * 0.45, (height / (2 * Math.sqrt(3)))));
    const midAD = { x: (A.x + D.x) / 2, y: (A.y + D.y) / 2 };
    const midBC = { x: (B.x + C.x) / 2, y: (B.y + C.y) / 2 };

    const p1H: Point2D = {
      x: center.x - (width / 2 - offsetH),
      y: center.y,
    };
    const p2H: Point2D = {
      x: center.x + (width / 2 - offsetH),
      y: center.y,
    };

    const lenH_horiz =
      Math.hypot(A.x - p1H.x, A.y - p1H.y) +
      Math.hypot(D.x - p1H.x, D.y - p1H.y) +
      Math.hypot(p1H.x - p2H.x, p1H.y - p2H.y) +
      Math.hypot(B.x - p2H.x, B.y - p2H.y) +
      Math.hypot(C.x - p2H.x, C.y - p2H.y);

    // H-vertical: two junction points P1 (between A, B) and P2 (between D, C)
    const offsetV = Math.max(10, Math.min(height * 0.45, (width / (2 * Math.sqrt(3)))));
    const p1V: Point2D = {
      x: center.x,
      y: center.y - (height / 2 - offsetV),
    };
    const p2V: Point2D = {
      x: center.x,
      y: center.y + (height / 2 - offsetV),
    };

    const lenH_vert =
      Math.hypot(A.x - p1V.x, A.y - p1V.y) +
      Math.hypot(B.x - p1V.x, B.y - p1V.y) +
      Math.hypot(p1V.x - p2V.x, p1V.y - p2V.y) +
      Math.hypot(D.x - p2V.x, D.y - p2V.y) +
      Math.hypot(C.x - p2V.x, C.y - p2V.y);

    return {
      center,
      lenX,
      p1H,
      p2H,
      lenH_horiz,
      p1V,
      p2V,
      lenH_vert,
      width,
      height,
    };
  }, [sqPillars]);

  // Main Canvas Rendering Loop
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

    // 1. Drafting Background: Acrylic glass plate visual styling
    const gradBg = ctx.createLinearGradient(0, 0, w, h);
    gradBg.addColorStop(0, '#0d1b2a');
    gradBg.addColorStop(0.5, '#1b263b');
    gradBg.addColorStop(1, '#0f1d30');
    ctx.fillStyle = gradBg;
    ctx.fillRect(0, 0, w, h);

    // Subtle water bubble caustics & grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Helper: Draw iridescent soap film membrane line
    const drawSoapFilmLine = (p1: Point2D, p2: Point2D, thickness = 6, opacity = 0.95) => {
      // If dipping animation is running, scale towards center
      const effP2 = {
        x: p1.x + (p2.x - p1.x) * dipProgress,
        y: p1.y + (p2.y - p1.y) * dipProgress,
      };

      // Outer shimmering soap aura (iridescent color gradient)
      const grad = ctx.createLinearGradient(p1.x, p1.y, effP2.x, effP2.y);
      grad.addColorStop(0, 'rgba(147, 197, 253, 0.4)');
      grad.addColorStop(0.25, 'rgba(244, 114, 182, 0.65)');
      grad.addColorStop(0.5, 'rgba(253, 224, 71, 0.6)');
      grad.addColorStop(0.75, 'rgba(52, 211, 153, 0.65)');
      grad.addColorStop(1, 'rgba(167, 139, 250, 0.4)');

      // Soft glow
      ctx.save();
      ctx.shadowColor = 'rgba(56, 189, 248, 0.75)';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = grad;
      ctx.lineWidth = thickness * dipProgress;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(effP2.x, effP2.y);
      ctx.stroke();
      ctx.restore();

      // Sharp crystal core line
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * dipProgress})`;
      ctx.lineWidth = 1.8 * dipProgress;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(effP2.x, effP2.y);
      ctx.stroke();
    };

    // Helper: Draw tension vector arrow
    const drawTensionArrow = (from: Point2D, to: Point2D, label: string) => {
      const len = Math.hypot(to.x - from.x, to.y - from.y);
      if (len < 10) return;
      const arrowLen = Math.min(48, len * 0.45);
      const angle = Math.atan2(to.y - from.y, to.x - from.x);

      const ax = from.x + arrowLen * Math.cos(angle);
      const ay = from.y + arrowLen * Math.sin(angle);

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(ax, ay);
      ctx.stroke();

      // Arrow head
      const headLen = 8;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(
        ax - headLen * Math.cos(angle - Math.PI / 6),
        ay - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        ax - headLen * Math.cos(angle + Math.PI / 6),
        ay - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      // Vector label badge
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.fillStyle = '#fde68a';
      ctx.fillText(label, ax + 8 * Math.cos(angle + Math.PI / 2), ay + 8 * Math.sin(angle + Math.PI / 2));
    };

    // Helper: Draw circular angle arc with degree label
    const drawJunctionAngle = (center: Point2D, p1: Point2D, p2: Point2D) => {
      const ang1 = Math.atan2(p1.y - center.y, p1.x - center.x);
      const ang2 = Math.atan2(p2.y - center.y, p2.x - center.x);

      let diff = ang2 - ang1;
      while (diff < 0) diff += 2 * Math.PI;
      while (diff >= 2 * Math.PI) diff -= 2 * Math.PI;

      let startAng = ang1;
      let sweep = diff;
      if (diff > Math.PI) {
        startAng = ang2;
        sweep = 2 * Math.PI - diff;
      }
      const deg = Math.round((sweep * 180) / Math.PI);
      const r = 22;

      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.arc(center.x, center.y, r, startAng, startAng + sweep, false);
      ctx.closePath();
      ctx.fillStyle = 'rgba(52, 211, 153, 0.22)';
      ctx.fill();
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Text label
      const midA = startAng + sweep / 2;
      const lx = center.x + (r + 16) * Math.cos(midA);
      const ly = center.y + (r + 16) * Math.sin(midA);
      ctx.font = 'bold 10.5px monospace';
      ctx.fillStyle = '#a7f3d0';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${deg}°`, lx, ly);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
    };

    // 2. Render TRIANGLE MODE (Plateau 120° Law)
    if (labMode === 'triangle') {
      const [A, B, C] = triPillars;
      const { pt: P, isObtuse, obtusePillar, angles } = computeTriFermat();

      // Soft triangle fill (acrylic frame boundary)
      ctx.fillStyle = 'rgba(30, 58, 138, 0.12)';
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, B.y);
      ctx.lineTo(C.x, C.y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw the three soap films meeting at P
      drawSoapFilmLine(A, P, 7);
      drawSoapFilmLine(B, P, 7);
      drawSoapFilmLine(C, P, 7);

      // Plateau 120° Angle indicators at junction P
      if (showAngles && !isObtuse) {
        drawJunctionAngle(P, A, B);
        drawJunctionAngle(P, B, C);
        drawJunctionAngle(P, C, A);
      }

      // Surface tension vector forces (equal magnitude 120° apart)
      if (showVectors && !isObtuse) {
        drawTensionArrow(P, A, 'T_A');
        drawTensionArrow(P, B, 'T_B');
        drawTensionArrow(P, C, 'T_C');
      }

      // Central Soap Junction Node P
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fillStyle = isObtuse ? '#f43f5e' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(P.x, P.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Junction Label Badge
      ctx.font = 'bold 11px sans-serif';
      const labelText = isObtuse
        ? `⚠️ 기둥 ${obtusePillar}로 막이 흡수됨 (한 내각 ≥ 120°)`
        : `플라토 비누막 교점 (세 장력 평형: 120°)`;
      ctx.fillStyle = isObtuse ? '#881337' : '#0369a1';
      const tw = ctx.measureText(labelText).width;
      ctx.beginPath();
      ctx.roundRect(P.x - tw / 2 - 8, P.y - 28, tw + 16, 20, 4);
      ctx.fill();
      ctx.strokeStyle = isObtuse ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, P.x, P.y - 18);
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';

      // Draw the 3 acrylic pillars
      const names = ['A', 'B', 'C'];
      triPillars.forEach((p, i) => {
        // Outer acrylic post shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(p.x, p.y + 2, 12, 0, Math.PI * 2);
        ctx.fill();

        // Metallic / Glass post
        const postGrad = ctx.createRadialGradient(p.x - 3, p.y - 3, 2, p.x, p.y, 11);
        postGrad.addColorStop(0, '#fef08a');
        postGrad.addColorStop(0.7, '#eab308');
        postGrad.addColorStop(1, '#a16207');
        ctx.fillStyle = postGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pillar name
        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(names[i], p.x, p.y);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      });
    }

    // 3. Render SQUARE MODE (Steiner Tree: X-Shape vs H-Shape)
    if (labMode === 'square') {
      const [A, B, C, D] = sqPillars;
      const { center, p1H, p2H, p1V, p2V, lenX, lenH_horiz, lenH_vert } = computeSquareSteiner();

      // Boundary outline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        Math.min(A.x, D.x),
        Math.min(A.y, B.y),
        Math.abs(B.x - A.x),
        Math.abs(D.y - A.y)
      );
      ctx.setLineDash([]);

      if (squareConfig === 'X_diagonal') {
        // Unstable 4-film hypothesis (X-shape)
        drawSoapFilmLine(A, center, 6, 0.7);
        drawSoapFilmLine(B, center, 6, 0.7);
        drawSoapFilmLine(C, center, 6, 0.7);
        drawSoapFilmLine(D, center, 6, 0.7);

        // Center 90 degree crossing indicator
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(center.x, center.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 11px sans-serif';
        const txt = '⚠️ 4갈래 90° 교차: 표면장력 불균형 (비누막에서 자연 붕괴됨)';
        const tw = ctx.measureText(txt).width;
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.roundRect(center.x - tw / 2 - 8, center.y - 28, tw + 16, 20, 4);
        ctx.fill();
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#fecdd3';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(txt, center.x, center.y - 18);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      } else if (squareConfig === 'H_horizontal') {
        // Optimal Horizontal H-Steiner Soap Film (2 junctions of 120°)
        drawSoapFilmLine(A, p1H, 7);
        drawSoapFilmLine(D, p1H, 7);
        drawSoapFilmLine(p1H, p2H, 7); // Center bridge
        drawSoapFilmLine(B, p2H, 7);
        drawSoapFilmLine(C, p2H, 7);

        if (showAngles) {
          drawJunctionAngle(p1H, A, D);
          drawJunctionAngle(p2H, B, C);
        }

        // Two junction points
        [p1H, p2H].forEach((jp, idx) => {
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(jp.x, jp.y, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#6ee7b7';
          ctx.fillText(`P${idx + 1} (120°)`, jp.x - 22, jp.y + 18);
        });
      } else if (squareConfig === 'H_vertical') {
        // Optimal Vertical H-Steiner Soap Film
        drawSoapFilmLine(A, p1V, 7);
        drawSoapFilmLine(B, p1V, 7);
        drawSoapFilmLine(p1V, p2V, 7); // Vertical bridge
        drawSoapFilmLine(D, p2V, 7);
        drawSoapFilmLine(C, p2V, 7);

        if (showAngles) {
          drawJunctionAngle(p1V, A, B);
          drawJunctionAngle(p2V, D, C);
        }

        [p1V, p2V].forEach((jp, idx) => {
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(jp.x, jp.y, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#6ee7b7';
          ctx.fillText(`P${idx + 1} (120°)`, jp.x + 10, jp.y + 4);
        });
      }

      // Draw the 4 square pillars
      const names = ['A', 'B', 'C', 'D'];
      sqPillars.forEach((p, i) => {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.beginPath();
        ctx.arc(p.x, p.y + 2, 12, 0, Math.PI * 2);
        ctx.fill();

        const postGrad = ctx.createRadialGradient(p.x - 3, p.y - 3, 2, p.x, p.y, 11);
        postGrad.addColorStop(0, '#bae6fd');
        postGrad.addColorStop(0.7, '#38bdf8');
        postGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = postGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#082f49';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(names[i], p.x, p.y);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      });
    }
  }, [
    labMode,
    triPillars,
    sqPillars,
    squareConfig,
    showVectors,
    showAngles,
    dipProgress,
    computeTriFermat,
    computeSquareSteiner,
  ]);

  // Pointer drag event handlers for moving pillars
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const currentPillars = labMode === 'triangle' ? triPillars : sqPillars;
    let hit = -1;
    currentPillars.forEach((p, idx) => {
      if (Math.hypot(p.x - x, p.y - y) < 26) {
        hit = idx;
      }
    });

    if (hit !== -1) {
      dragPillarIdxRef.current = hit;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragPillarIdxRef.current === -1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(30, Math.min(rect.width - 30, e.clientX - rect.left));
    const y = Math.max(30, Math.min(rect.height - 30, e.clientY - rect.top));

    if (labMode === 'triangle') {
      const next = [...triPillars];
      next[dragPillarIdxRef.current] = { x, y };
      setTriPillars(next);
    } else {
      const next = [...sqPillars];
      next[dragPillarIdxRef.current] = { x, y };
      setSqPillars(next);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragPillarIdxRef.current = -1;
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Reset pillar positions
  const resetPillars = () => {
    if (labMode === 'triangle') {
      setTriPillars([
        { x: 180, y: 320 },
        { x: 420, y: 320 },
        { x: 300, y: 110 },
      ]);
    } else {
      setSqPillars([
        { x: 190, y: 120 },
        { x: 410, y: 120 },
        { x: 410, y: 340 },
        { x: 190, y: 340 },
      ]);
    }
    triggerDipAnimation();
  };

  const sqMetrics = computeSquareSteiner();

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-xl space-y-5">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
              <Droplets className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-bold">
              물리·수학 융합 실험실
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            비눗방울 막의 최적화 해답 & 플라토의 법칙 (Plateau's Laws)
          </h2>
        </div>

        {/* Experiment Selector */}
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 self-stretch sm:self-auto">
          <button
            onClick={() => {
              setLabMode('triangle');
              triggerDipAnimation();
            }}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              labMode === 'triangle'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>🔺 3-기둥 삼각형 (120°)</span>
          </button>
          <button
            onClick={() => {
              setLabMode('square');
              triggerDipAnimation();
            }}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              labMode === 'square'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span>⬛ 4-기둥 정사각형 (H-트리)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Canvas Simulation Area */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative w-full aspect-[4/3] bg-black rounded-xl overflow-hidden border border-slate-700 shadow-2xl touch-none">
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-grab active:cursor-grabbing"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />

            {/* In-canvas Controls Bar */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <button
                onClick={triggerDipAnimation}
                disabled={isDipping}
                className="px-2.5 py-1.5 bg-blue-600/90 hover:bg-blue-500 backdrop-blur-xs text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>비눗물에 다시 담그기 (Dip)</span>
              </button>

              <button
                onClick={resetPillars}
                className="p-1.5 bg-slate-800/90 hover:bg-slate-700 backdrop-blur-xs text-slate-300 rounded-lg text-xs transition border border-slate-600 shadow-md cursor-pointer"
                title="기둥 위치 초기화"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Helper Hint Pill */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center pointer-events-none text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-700/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>황금색 아크릴 기둥을 마우스로 드래그해보세요</span>
              </span>
              <span className="font-mono text-cyan-300">표면장력 γ = 최소면적 수축</span>
            </div>
          </div>

          {/* Sub-bar: Toggles */}
          <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2 px-1">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={showAngles}
                  onChange={(e) => setShowAngles(e.target.checked)}
                  className="rounded accent-blue-500 cursor-pointer"
                />
                <span>플라토 120° 각도 표시</span>
              </label>

              {labMode === 'triangle' && (
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={showVectors}
                    onChange={(e) => setShowVectors(e.target.checked)}
                    className="rounded accent-amber-500 cursor-pointer"
                  />
                  <span>표면장력 벡터(T) 표시</span>
                </label>
              )}
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Plateau's Minimal Surface Simulator
            </span>
          </div>
        </div>

        {/* Right: Scientific Principles & Comparative Measurements */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {labMode === 'triangle' ? (
            /* TRIANGLE MODE EXPLANATION */
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                  <Zap className="w-4 h-4" />
                  <span>비누막이 120°를 스스로 찾는 물리적 이유</span>
                </div>
                <p className="text-slate-300">
                  비누막은 <strong>표면 에너지(E = γ × 면적)</strong>를 최소화하기 위해 항상 면적(두 판 사이에서는 막의 총 길이)을 최소로 줄이려고 수축합니다.
                </p>
                <div className="p-2.5 bg-black/40 rounded-lg border border-blue-900/40 text-blue-200 font-mono text-[11px]">
                  세 비누막의 장력 크기 = <MathView tex="T_A = T_B = T_C = \gamma h" />
                  <br />
                  힘의 평형: <MathView tex="\vec{T}_A + \vec{T}_B + \vec{T}_C = \vec{0} \iff \text{각도 } 120^\circ" />
                </div>
                <p className="text-slate-400 text-[11px]">
                  크기가 같은 세 벡터의 합이 0이 되려면 오직 세 벡터가 정확히 <strong>120° 간격</strong>을 이룰 때뿐입니다.
                </p>
              </div>

              <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-2">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  <span>실제 실험에서의 120° 이상 둔각 현상</span>
                </div>
                <p className="text-slate-300">
                  위 캔버스에서 기둥 C를 아래로 내려 <strong className="text-amber-300">한 내각을 120° 이상</strong>으로 만들어보세요!
                </p>
                <p className="text-slate-400 text-[11px]">
                  세 기둥에서 당기는 힘의 균형점이 삼각형 바깥으로 나가버리므로, 비누막 교점이 <strong>그 둔각 꼭짓점 자체로 합쳐져 사라집니다</strong>. 비누막 실험에서도 똑같이 꼭짓점에 달라붙는 것을 볼 수 있습니다.
                </p>
              </div>
            </div>
          ) : (
            /* SQUARE MODE EXPLANATION (X vs H) */
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300">네 마을(기둥) 연결 가설 선택</span>
                  <span className="text-[10px] bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-300 font-mono">
                    슈타이너 트리 비교
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => setSquareConfig('H_horizontal')}
                    className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                      squareConfig === 'H_horizontal'
                        ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-[11px]">가로 H-트리</div>
                    <div className="text-[10px] opacity-80 font-mono">비누막 해답</div>
                  </button>

                  <button
                    onClick={() => setSquareConfig('H_vertical')}
                    className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                      squareConfig === 'H_vertical'
                        ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-[11px]">세로 H-트리</div>
                    <div className="text-[10px] opacity-80 font-mono">비누막 해답</div>
                  </button>

                  <button
                    onClick={() => setSquareConfig('X_diagonal')}
                    className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                      squareConfig === 'X_diagonal'
                        ? 'bg-rose-600 text-white border-rose-400 font-bold'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-[11px]">대각선 X자</div>
                    <div className="text-[10px] opacity-80 font-mono">불안정 가설</div>
                  </button>
                </div>
              </div>

              {/* Length Comparison Cards */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-center">
                  <div className="text-slate-400 text-[11px] font-medium">대각선 X자 교점</div>
                  <div className="text-lg font-mono font-bold text-rose-400 mt-0.5">
                    <MathView tex="2\sqrt{2} \approx 2.828" />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">4갈래 90° 불안정</div>
                </div>

                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-700/60 text-center">
                  <div className="text-emerald-300 text-[11px] font-medium">비누막 H-트리 (최적)</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                    <MathView tex="1 + \sqrt{3} \approx 2.732" />
                  </div>
                  <div className="text-[10px] text-emerald-300 font-semibold mt-1">
                    약 3.4% 길이 & 에너지 단축!
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-800/40 border border-slate-700/80 rounded-xl text-[11px] text-slate-300 space-y-1.5">
                <p className="font-bold text-indigo-300">💡 플라토의 법칙 (Plateau's Laws)</p>
                <p>
                  1. 비누막은 공간에서 항상 <strong>매끄러운 곡면</strong>을 이룹니다.
                </p>
                <p>
                  2. 비누막이 만나는 선에서는 <strong>항상 3개의 면이 120° 각도</strong>로 만납니다 (4개 이상이 한 선에서 만나는 것은 물리적으로 불가능).
                </p>
                <p className="text-slate-400">
                  따라서 4개의 기둥을 비눗물에 담그면 X자가 아닌 <strong>두 개의 120° 삼거리(H자)</strong>가 스스로 나타납니다.
                </p>
              </div>
            </div>
          )}

          {/* Quick Summary Pill */}
          <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 font-medium">
                자연계의 최소 표면적 원리 = 수학적 최단거리
              </span>
            </div>
            <span className="font-mono text-emerald-400 font-bold text-[11px]">
              Min Energy = Min Length
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
