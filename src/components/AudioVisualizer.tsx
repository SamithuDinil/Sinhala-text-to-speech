import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  progress: number; // 0 to 1
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  progress,
  barCount = 44,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.scale(dpr, dpr);
    };

    updateDimensions();

    let phase = 0;

    const render = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      const spacing = 2.5;
      const totalSpacing = (barCount - 1) * spacing;
      const barWidth = Math.max(2, (width - totalSpacing) / barCount);
      const centerY = height / 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + spacing);
        const normX = i / barCount;
        const isPast = normX <= progress;

        let barHeight = 6;
        if (isPlaying) {
          const wave1 = Math.sin(i * 0.35 + phase * 2.8);
          const wave2 = Math.cos(i * 0.18 - phase * 1.5);
          const variance = Math.abs(wave1 * 0.65 + wave2 * 0.35);
          barHeight = 6 + variance * (height * 0.72);
        } else if (isPast) {
          const staticWave = Math.sin(i * 0.32);
          barHeight = 8 + Math.abs(staticWave) * 14;
        } else {
          const staticWave = Math.sin(i * 0.28);
          barHeight = 5 + Math.abs(staticWave) * 8;
        }

        if (isPast) {
          const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          gradient.addColorStop(0, '#fbbf24'); // amber-400
          gradient.addColorStop(1, '#f59e0b'); // amber-500
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = '#27272a'; // zinc-800
        }

        const y = centerY - barHeight / 2;
        const radius = barWidth / 2;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, barHeight, [radius]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.035;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      updateDimensions();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, progress, barCount]);

  return (
    <div
      ref={containerRef}
      className="w-full h-14 flex items-center justify-center bg-zinc-950/90 rounded-xl px-3 py-1 border border-zinc-800/80 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};

