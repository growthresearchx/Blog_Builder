"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Volume2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArticleAudioPlayerProps {
  title: string;
  content: string;
}

export function ArticleAudioPlayer({ title, content }: ArticleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const cleanText = (html: string) => {
    if (typeof document === "undefined") return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return `${title}. ${temp.textContent || temp.innerText || ""}`;
  };

  const handlePlay = () => {
    if (!isSupported) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = cleanText(content);
    if (!textToRead.trim()) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const cyclePlaybackRate = () => {
    const rates = [1.0, 1.25, 1.5, 2.0];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (isPlaying || isPaused) {
      handleStop();
    }
  };

  if (!isSupported) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-muted/40 dark:bg-muted/20 border rounded-xl shadow-xs transition-all">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Volume2 className="h-4 w-4" />
        </div>
        <div>
          <span className="text-xs font-semibold text-foreground block">Listen to this article</span>
          <span className="text-[11px] text-muted-foreground">
            {isPlaying ? "Playing narration..." : isPaused ? "Paused" : "Audio narration generated via Web Speech"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={cyclePlaybackRate}
          className="h-8 px-2.5 text-xs gap-1 font-mono"
          title="Change playback speed"
        >
          <Gauge className="h-3.5 w-3.5" />
          {playbackRate}x
        </Button>

        {isPlaying ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePause}
            className="h-8 px-3 text-xs gap-1.5"
          >
            <Pause className="h-3.5 w-3.5 fill-current" />
            Pause
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={handlePlay}
            className="h-8 px-3 text-xs gap-1.5 shadow-xs"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isPaused ? "Resume" : "Play"}
          </Button>
        )}

        {(isPlaying || isPaused) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleStop}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            title="Stop audio"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </Button>
        )}
      </div>
    </div>
  );
}
