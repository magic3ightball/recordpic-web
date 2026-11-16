import { photoUrl } from '../../utils/api';
import { formatTime } from '../../utils/timeSync';

export default function Timeline({ sessionId, photos, duration, currentTime, onSeek }) {
  if (!duration) return null;

  const sortedPhotos = [...photos]
    .filter((p) => p.offset_seconds != null)
    .sort((a, b) => a.offset_seconds - b.offset_seconds);

  const playheadPos = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Timeline</h3>

      {/* Seekable track */}
      <div
        className="relative h-6 bg-gray-100 rounded-lg cursor-pointer mb-2"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          onSeek(ratio * duration);
        }}
      >
        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 transition-[left] duration-100"
          style={{ left: `${playheadPos}%` }}
        />

        {/* Photo markers as dots on the track */}
        {sortedPhotos.map((photo) => {
          const pos = (photo.offset_seconds / duration) * 100;
          const clampedPos = Math.min(Math.max(pos, 0), 100);
          return (
            <div
              key={photo.filename}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-500 rounded-full z-5 hover:scale-150 transition-transform cursor-pointer"
              style={{ left: `${clampedPos}%`, transform: `translateX(-50%) translateY(-50%)` }}
              title={`${photo.filename} — ${formatTime(photo.offset_seconds)}`}
              onClick={(e) => {
                e.stopPropagation();
                onSeek(photo.offset_seconds);
              }}
            />
          );
        })}

        {/* Time labels */}
        <span className="absolute bottom-0.5 left-1 text-[9px] text-gray-400">{formatTime(0)}</span>
        <span className="absolute bottom-0.5 right-1 text-[9px] text-gray-400">
          {formatTime(duration)}
        </span>
      </div>

      {/* Photo thumbnails strip */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {sortedPhotos.map((photo) => (
          <div
            key={photo.filename}
            className="flex-shrink-0 cursor-pointer group"
            onClick={() => onSeek(photo.offset_seconds)}
          >
            <img
              src={photoUrl(sessionId, photo.filename)}
              alt=""
              className="w-10 h-10 rounded border border-gray-200 object-cover hover:scale-110 transition-transform"
              loading="lazy"
            />
            <div className="text-[8px] text-gray-400 text-center mt-0.5">
              {formatTime(photo.offset_seconds)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
