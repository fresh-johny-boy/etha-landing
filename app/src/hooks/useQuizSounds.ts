"use client";

import { useEffect, useCallback, useState } from "react";
import { quizSounds, SoundName, SoundOptions } from "@/lib/quizSounds";

export function useQuizSounds() {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    quizSounds.init();
    setEnabledState(quizSounds.enabled);
  }, []);

  const play = useCallback((name: SoundName, options?: SoundOptions) => {
    quizSounds.play(name, options);
  }, []);

  const toggleEnabled = useCallback(() => {
    const next = !quizSounds.enabled;
    quizSounds.setEnabled(next);
    setEnabledState(next);
  }, []);

  const setVolume = useCallback((v: number) => {
    quizSounds.setVolume(v);
  }, []);

  return {
    play,
    toggleEnabled,
    setVolume,
    enabled,
    // Convenience aliases
    playIntro:    () => quizSounds.play("intro"),
    playTick:     () => quizSounds.play("tick"),
    playSelect:   () => quizSounds.play("select"),
    playLayerIn:  () => quizSounds.play("layerIn"),
    playDrawLine: () => quizSounds.play("drawLine"),
    playComplete: () => quizSounds.play("complete"),
    playChime:    () => quizSounds.play("chime"),
  };
}
