import { useRef, useEffect } from 'react';

const COLORS = {
  idle: [165, 180, 252] as [number, number, number],
  active: [129, 140, 248] as [number, number, number],
  toolActive: [165, 180, 252] as [number, number, number],
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: [number, number, number];
  life: number;
  maxLife: number;
}

export function OrbCanvas({
  isRunning,
  isComplete,
  toolActive = false,
}: {
  isRunning: boolean;
  isComplete: boolean;
  toolActive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const activeRef = useRef(false);
  const orbRef = useRef({
    radius: 40,
    targetRadius: 40,
    color: COLORS.idle,
    targetColor: COLORS.idle,
    pulse: 0
  });

  activeRef.current = isRunning;

  useEffect(() => {
    const orb = orbRef.current;
    // Color transitions: idle (purple) → thinking (blue) → toolActive (green) → idle
    const tc = toolActive ? COLORS.toolActive : isRunning ? COLORS.active : COLORS.idle;
    orb.targetColor = tc;
    orb.targetRadius = isComplete ? 55 : isRunning ? 50 + Math.sin(Date.now() / 500) * 5 : 40;
  }, [isRunning, isComplete, toolActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const particles = particlesRef.current;
    const orb = orbRef.current;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push(makeParticle(canvas.width, canvas.height, COLORS.idle));
    }

    function makeParticle(w: number, h: number, color: [number, number, number]): Particle {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * Math.min(w, h) * 0.55;
      return {
        x: w / 2 + Math.cos(angle) * dist,
        y: h / 2 + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 0.5 + Math.random() * 1.2,
        alpha: 0.1 + Math.random() * 0.25,
        color: [
          color[0] + (Math.random() - 0.5) * 40,
          color[1] + (Math.random() - 0.5) * 40,
          color[2] + (Math.random() - 0.5) * 40
        ],
        life: 0,
        maxLife: 300 + Math.random() * 400
      };
    }

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    let frame = 0;
    function animate() {
      frame++;
      
      const w = canvas!.width;
      const h = canvas!.height;
      const cx = w / 2;
      const cy = h * 0.50;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'screen';

      orb.radius = lerp(orb.radius, orb.targetRadius, 0.03);
      orb.color = orb.color.map((c, i) => lerp(c, orb.targetColor[i], 0.02)) as [number, number, number];
      orb.pulse += 0.02;

      const isActive = activeRef.current;
      const pulseAmp = isActive ? 6 : 2;
      const dynamicRadius = orb.radius + Math.sin(orb.pulse) * pulseAmp;

      if (frame % (isActive ? 3 : 8) === 0 && particles.length < 120) {
        particles.push(makeParticle(w, h, orb.targetColor));
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        const dx = cx - p.x;
        const dy = cy - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const pull = isActive ? 0.00015 : -0.00003;
        p.vx += dx * pull;
        p.vy += dy * pull;

        if (isActive && dist > 60) {
          p.vx += -dy * 0.000008;
          p.vy += dx * 0.000008;
        }

        p.vx *= 0.998;
        p.vy *= 0.998;
        p.x += p.vx;
        p.y += p.vy;

        const lifePct = p.life / p.maxLife;
        const fadeAlpha = lifePct < 0.1 ? lifePct / 0.1 : lifePct > 0.8 ? (1 - lifePct) / 0.2 : 1;
        const alpha = p.alpha * fadeAlpha;

        p.color = p.color.map((c, idx) => lerp(c, orb.targetColor[idx] + (Math.random() - 0.5) * 10, 0.005)) as [
          number,
          number,
          number
        ];

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.round(p.color[0])},${Math.round(p.color[1])},${Math.round(p.color[2])},${alpha * 2.5})`;
        ctx.fill();

        if (p.life > p.maxLife || p.x < -50 || p.x > w + 50 || p.y < -50 || p.y > h + 50) {
          particles.splice(i, 1);
        }
      }

      const [r, g, b] = orb.color.map(Math.round);

      
      

      const gradient3 = ctx.createRadialGradient(cx, cy, 0, cx, cy, dynamicRadius * 6);
      gradient3.addColorStop(0, `rgba(${r},${g},${b},0.5)`);
      gradient3.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, w, h);

      const gradient2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, dynamicRadius * 3);
      gradient2.addColorStop(0, `rgba(${r},${g},${b},0.6)`);
      gradient2.addColorStop(0.5, `rgba(${r},${g},${b},0.2)`);
      gradient2.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gradient2;
      ctx.beginPath();
      ctx.arc(cx, cy, dynamicRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, dynamicRadius * 1.5);
      gradient.addColorStop(0, `rgba(${Math.min(r + 60, 255)},${Math.min(g + 60, 255)},${Math.min(b + 60, 255)},0.8)`);
      gradient.addColorStop(0.6, `rgba(${r},${g},${b},0.4)`);
      gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, dynamicRadius, 0, Math.PI * 2);
      ctx.fill();

      const gradient4 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 3);
      gradient4.addColorStop(0, `rgba(255,255,255,${isActive ? 0.3 : 0.1})`);
      gradient4.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gradient4;
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(animate);
    }

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className='fixed inset-0 w-screen h-screen pointer-events-none z-[999] opacity-100 mix-blend-screen ' style={{ opacity: 1, willChange: 'transform, opacity', transform: 'translateZ(0)' }} />;
}
