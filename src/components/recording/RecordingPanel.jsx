import { useState } from 'react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useSession } from '../../context/SessionContext';
import * as api from '../../utils/api';
import RecordingTimer from './RecordingTimer';

export default function RecordingPanel() {
  const recorder = useAudioRecorder();
  const { setCurrentSession, setView, refreshSessions } = useSession();
  const [sessionName, setSessionName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleStart = () => {
    recorder.startRecording();
  };

  const handleSave = async () => {
    if (!recorder.audioBlob) return;
    setSaving(true);
    try {
      const name = sessionName.trim() || `Recording ${new Date().toLocaleDateString()}`;
      const session = await api.createSession(name, recorder.recordingStart, recorder.pauseIntervals);
      await api.uploadAudio(session.id, recorder.audioBlob);
      const updated = await api.getSession(session.id);
      setCurrentSession(updated);
      await refreshSessions();
      setView('review');
    } catch (err) {
      console.error('Failed to save session:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    recorder.reset();
    setSessionName('');
  };

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      {recorder.state === 'idle' && (
        <button
          onClick={() => setView('home')}
          className="self-start text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          &larr; Back
        </button>
      )}
      <h2 className="text-2xl font-semibold text-gray-700">Record Lecture</h2>

      <RecordingTimer elapsed={recorder.elapsed} state={recorder.state} />

      <div className="flex gap-3">
        {recorder.state === 'idle' && (
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium text-lg transition-colors"
          >
            Start Recording
          </button>
        )}

        {recorder.state === 'recording' && (
          <>
            <button
              onClick={recorder.pauseRecording}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-medium transition-colors"
            >
              Pause
            </button>
            <button
              onClick={recorder.stopRecording}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-full font-medium transition-colors"
            >
              Stop
            </button>
          </>
        )}

        {recorder.state === 'paused' && (
          <>
            <button
              onClick={recorder.resumeRecording}
              className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium transition-colors"
            >
              Resume
            </button>
            <button
              onClick={recorder.stopRecording}
              className="px-5 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-full font-medium transition-colors"
            >
              Stop
            </button>
          </>
        )}

        {recorder.state === 'stopped' && (
          <div className="flex flex-col items-center gap-4">
            <input
              type="text"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Session name (optional)"
              className="px-4 py-2 border border-gray-300 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-full font-medium transition-colors"
              >
                {saving ? 'Saving...' : 'Save Session'}
              </button>
              <button
                onClick={handleDiscard}
                className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-medium transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
