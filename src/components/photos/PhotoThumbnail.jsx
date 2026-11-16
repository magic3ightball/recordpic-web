import { useState } from 'react';
import { photoUrl } from '../../utils/api';
import { formatTime } from '../../utils/timeSync';

export default function PhotoThumbnail({ sessionId, photo, onClick, active }) {
  const [error, setError] = useState(false);

  return (
    <button
      onClick={() => onClick?.(photo)}
      className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
        active ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent hover:border-gray-300'
      }`}
    >
      <div className="w-20 h-20 relative bg-gray-100">
        {error ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
            HEIC
          </div>
        ) : (
          <img
            src={photoUrl(sessionId, photo.filename)}
            alt={photo.filename}
            className="w-full h-full object-cover"
            onError={() => setError(true)}
          />
        )}
        {photo.offset_seconds != null && (
          <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-0.5">
            {formatTime(photo.offset_seconds)}
          </span>
        )}
      </div>
    </button>
  );
}
