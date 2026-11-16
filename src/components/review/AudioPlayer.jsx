import { formatTime } from '../../utils/timeSync';

export default function AudioPlayer({ player }) {
  const { playing, currentTime, duration, togglePlay, seek } = player;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekBar = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seek(ratio * duration);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors flex-shrink-0"
        >
          {playing ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <rect x="5" y="4" width="3" height="12" rx="1" />
              <rect x="12" y="4" width="3" height="12" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4l10 6-10 6V4z" />
            </svg>
          )}
        </button>

        <span className="text-sm font-mono text-gray-600 w-12 text-right tabular-nums">
          {formatTime(currentTime)}
        </span>

        <div
          className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer relative"
          onClick={handleSeekBar}
        >
          <div
            className="h-full bg-blue-500 rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-sm font-mono text-gray-400 w-12 tabular-nums">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}
