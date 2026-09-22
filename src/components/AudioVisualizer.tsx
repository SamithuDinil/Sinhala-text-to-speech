import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  progress: number; // 0 to 1
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  progress,
  barCount = 36,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = Math.max(2, (width / barCount) - 3);
      const centerY = height / 2;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 3);
        const normX = i / barCount;
        const isPast = normX <= progress;

        // Dynamic wave calculation
        let barHeight = 6;
        if (isPlaying) {
          const wave1 = Math.sin(i * 0.35 + phase * 2.5);
          const wave2 = Math.cos(i * 0.2 - phase * 1.8);
          const variance = Math.abs(wave1 * 0.6 + wave2 * 0.4);
          barHeight = 8 + variance * (height * 0.7);
        } else if (isPast) {
          // Semi-active static bar
          const staticWave = Math.sin(i * 0.4);
          barHeight = 10 + Math.abs(staticWave) * 16;
        } else {
          // Idle bar
          const staticWave = Math.sin(i * 0.3);
          barHeight = 6 + Math.abs(staticWave) * 8;
        }

        // Color based on playback progress
        if (isPast) {
          const gradient = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          gradient.addColorStop(0, '#fbbf24'); // amber-400
          gradient.addColorStop(1, '#f59e0b'); // amber-500
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = '#404040'; // neutral-700
        }

        const y = centerY - barHeight / 2;
        const radius = barWidth / 2;

        // Draw rounded pill bar
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, barHeight, [radius]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      if (isPlaying) {
        phase += 0.04;
      }
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, progress, barCount]);

  return (
    <div className="w-full h-16 flex items-center justify-center bg-neutral-950/60 rounded-xl px-4 py-2 border border-neutral-800/80 backdrop-blur-sm overflow-hidden">
      <canvas
        ref={canvasRef}
        width={420}
        height={56}
        className="w-full h-full"
      />
    </div>
  );
};
