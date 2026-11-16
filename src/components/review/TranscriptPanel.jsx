import { useEffect, useRef } from 'react';
import { formatTime } from '../../utils/timeSync';

export default function TranscriptPanel({ segments, currentTime, onSeek }) {
  const activeRef = useRef(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentTime]);

  if (!segments || segments.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        Speech-to-text is not available in this browser version.
      </div>
    );
  }

  return (
    <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
      {segments.map((seg, i) => {
        const active = currentTime >= seg.start && currentTime < seg.end;
        return (
          <div
            key={i}
            ref={active ? activeRef : null}
            onClick={() => onSeek(seg.start)}
            className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
              active ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-xs font-mono text-gray-400 mt-0.5 flex-shrink-0 w-10 text-right">
              {formatTime(seg.start)}
            </span>
            <span className={`text-sm ${active ? 'text-blue-800 font-medium' : 'text-gray-700'}`}>
              {seg.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
