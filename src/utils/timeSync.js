/**
 * Calculate the audio offset in seconds for a photo taken at `photoTime`
 * given the recording started at `recordingStart` with `pauseIntervals`.
 *
 * All times are unix timestamps in milliseconds.
 * pauseIntervals: [[pauseStartMs, pauseEndMs], ...]
 */
export function calculateAudioOffset(photoTime, recordingStart, pauseIntervals = []) {
  if (!photoTime || !recordingStart) return null;

  const elapsed = photoTime - recordingStart;
  if (elapsed < 0) return null;

  // Subtract pause durations that occurred before this photo
  let pauseTotal = 0;
  for (const [start, end] of pauseIntervals) {
    if (start < photoTime) {
      const pauseEnd = Math.min(end || photoTime, photoTime);
      pauseTotal += pauseEnd - start;
    }
  }

  const offset = (elapsed - pauseTotal) / 1000;
  return Math.max(0, offset);
}

/**
 * Format seconds as MM:SS or H:MM:SS when >= 1 hour
 */
export function formatTime(seconds) {
  if (seconds == null || !isFinite(seconds) || isNaN(seconds)) return '--:--';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
