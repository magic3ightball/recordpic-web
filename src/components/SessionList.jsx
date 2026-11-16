import { useEffect } from 'react';
import { useSession } from '../context/SessionContext';

export default function SessionList() {
  const { sessions, refreshSessions, openSession, deleteSession, setView } = useSession();

  useEffect(() => {
    refreshSessions();
  }, [refreshSessions]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">recordpic</h1>
        <button
          onClick={() => setView('record')}
          className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-colors"
        >
          New Recording
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No sessions yet</p>
          <p className="text-sm">Start a new recording to begin</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => openSession(session.id)}
                className="flex-1 text-left"
              >
                <h3 className="font-medium text-gray-800">{session.name}</h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {new Date(session.created_at).toLocaleString()} &middot;{' '}
                  {session.photos.length} photo{session.photos.length !== 1 ? 's' : ''}
                  {session.transcript ? ' \u00B7 Transcribed' : ''}
                </p>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this session?')) deleteSession(session.id);
                }}
                className="text-gray-300 hover:text-red-500 transition-colors ml-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
