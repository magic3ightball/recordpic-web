import { formatTime } from '../../utils/timeSync';

export default function RecordingTimer({ elapsed, state }) {
  return (
    <div className="text-center">
      <div className="text-6xl font-mono font-bold tabular-nums tracking-wider text-gray-800">
        {formatTime(elapsed)}
      </div>
      <div className="mt-2 text-sm font-medium">
        {state === 'recording' && (
          <span className="text-red-500 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Recording
          </span>
        )}
        {state === 'paused' && <span className="text-amber-500">Paused</span>}
        {state === 'idle' && <span className="text-gray-400">Ready to record</span>}
        {state === 'stopped' && <span className="text-gray-500">Recording stopped</span>}
      </div>
    </div>
  );
}
