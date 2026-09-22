import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Download, Volume2, VolumeX, Gauge } from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';
import { VoiceName, DeliveryStyle } from '../types';

interface AudioPlayerProps {
  audioUrl: string;
  voice: VoiceName;
  style: DeliveryStyle;
  estimatedDuration: number;
  textSnippet: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  voice,
  style,
  estimatedDuration,
  textSnippet,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(estimatedDuration || 0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset playback on audioUrl change
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    audio.playbackRate = playbackRate;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, playbackRate]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Playback error:', err);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const restartAudio = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const changePlaybackRate = () => {
    const rates = [0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <div id="tts-audio-player" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="auto" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Voice: {voice}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-300 capitalize">
            {style} Tone
          </span>
          <span className="text-xs text-neutral-400">
            24 kHz • WAV Audio
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            id="download-wav-btn"
            href={audioUrl}
            download={`gemini-speech-${voice.toLowerCase()}-${Date.now()}.wav`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors border border-neutral-700"
            title="Download uncompressed WAV file"
          >
            <Download className="w-3.5 h-3.5" />
            Download WAV
          </a>
        </div>
      </div>

      {/* Text preview */}
      <p className="text-xs text-neutral-400 line-clamp-1 italic">
        "{textSnippet}"
      </p>

      {/* Animated Waveform Visualizer */}
      <AudioVisualizer isPlaying={isPlaying} progress={progress} />

      {/* Progress scrub bar */}
      <div className="space-y-1.5">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.05}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
        />
        <div className="flex justify-between text-xs text-neutral-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Player controls */}
      <div className="flex items-center justify-between pt-1">
        {/* Play / Restart Controls */}
        <div className="flex items-center gap-3">
          <button
            id="restart-audio-btn"
            onClick={restartAudio}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            title="Replay from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            id="toggle-play-btn"
            onClick={togglePlay}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            id="speed-toggle-btn"
            onClick={changePlaybackRate}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono font-medium text-neutral-300 transition-colors"
            title="Change playback speed"
          >
            <Gauge className="w-3.5 h-3.5 text-neutral-400" />
            <span>{playbackRate}x</span>
          </button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <button
            id="mute-toggle-btn"
            onClick={toggleMute}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 sm:w-20 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-400 hover:accent-amber-400 transition-all"
            title="Volume"
          />
        </div>
      </div>
    </div>
  );
};
