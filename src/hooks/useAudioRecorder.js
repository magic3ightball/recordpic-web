import { useState, useRef, useCallback } from 'react';

const MAX_DURATION_SECONDS = 3 * 60 * 60; // 3 hours

export function useAudioRecorder() {
  const [state, setState] = useState('idle'); // idle | recording | paused | stopped
  const [recordingStart, setRecordingStart] = useState(null);
  const [pauseIntervals, setPauseIntervals] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const pauseStartRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedTotalRef = useRef(0);

  const stopRef = useRef(null);

  const updateElapsed = useCallback(() => {
    if (startTimeRef.current) {
      const now = Date.now();
      const paused = pausedTotalRef.current + (pauseStartRef.current ? now - pauseStartRef.current : 0);
      const secs = Math.floor((now - startTimeRef.current - paused) / 1000);
      setElapsed(secs);
      if (secs >= MAX_DURATION_SECONDS && stopRef.current) {
        stopRef.current();
      }
    }
  }, []);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
    chunksRef.current = [];

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      setAudioBlob(blob);
      stream.getTracks().forEach((t) => t.stop());
    };

    const now = Date.now();
    startTimeRef.current = now;
    pausedTotalRef.current = 0;
    setRecordingStart(now);
    setPauseIntervals([]);
    setElapsed(0);

    mr.start(1000);
    mediaRecorderRef.current = mr;
    setState('recording');

    timerRef.current = setInterval(updateElapsed, 500);
  }, [updateElapsed]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      pauseStartRef.current = Date.now();
      setState('paused');
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      const now = Date.now();
      const pauseStart = pauseStartRef.current;
      pausedTotalRef.current += now - pauseStart;
      setPauseIntervals((prev) => [...prev, [pauseStart, now]]);
      pauseStartRef.current = null;
      mediaRecorderRef.current.resume();
      setState('recording');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // If paused, finalize the last pause interval
      if (pauseStartRef.current) {
        const now = Date.now();
        pausedTotalRef.current += now - pauseStartRef.current;
        setPauseIntervals((prev) => [...prev, [pauseStartRef.current, now]]);
        pauseStartRef.current = null;
      }
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setState('stopped');
    }
  }, []);

  stopRef.current = stopRecording;

  const reset = useCallback(() => {
    setState('idle');
    setRecordingStart(null);
    setPauseIntervals([]);
    setElapsed(0);
    setAudioBlob(null);
    chunksRef.current = [];
  }, []);

  return {
    state,
    recordingStart,
    pauseIntervals,
    elapsed,
    audioBlob,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  };
}
