import { useState, useCallback } from 'react';
import { useSession } from '../../context/SessionContext';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { audioUrl, updatePhotosMeta, TRANSCRIBE_AVAILABLE } from '../../utils/api';
import * as api from '../../utils/api';
import AudioPlayer from './AudioPlayer';
import Timeline from './Timeline';
import TranscriptPanel from './TranscriptPanel';
import PhotoGallery from './PhotoGallery';
import PhotoDropZone from '../photos/PhotoDropZone';

export default function ReviewView() {
  const { currentSession, refreshCurrentSession, setView, deleteSession } = useSession();
  const player = useAudioPlayer(currentSession?.has_audio ? audioUrl(currentSession.id) : null);
  const [transcribing, setTranscribing] = useState(false);
  const [clockOffset, setClockOffset] = useState(0); // seconds, for manual calibration
  const [showCalibration, setShowCalibration] = useState(false);

  const handlePhotoClick = useCallback(
    (photo) => {
      if (photo.offset_seconds != null) {
        player.pause();
        player.seek(Math.max(0, photo.offset_seconds + clockOffset));
      }
    },
    [player, clockOffset],
  );

  const handleTranscribe = useCallback(async () => {
    if (!currentSession) return;
    setTranscribing(true);
    try {
      await api.transcribeSession(currentSession.id);
      await refreshCurrentSession();
    } catch (err) {
      console.error('Transcription failed:', err);
    } finally {
      setTranscribing(false);
    }
  }, [currentSession, refreshCurrentSession]);

  const applyCalibration = useCallback(async () => {
    if (!currentSession || clockOffset === 0) return;
    const updated = currentSession.photos.map((p) => ({
      ...p,
      offset_seconds: p.offset_seconds != null ? Math.max(0, p.offset_seconds + clockOffset) : null,
    }));
    await updatePhotosMeta(currentSession.id, updated);
    setClockOffset(0);
    await refreshCurrentSession();
  }, [currentSession, clockOffset, refreshCurrentSession]);

  const handleDelete = useCallback(async () => {
    if (!currentSession) return;
    if (confirm('Delete this session and all its data?')) {
      await deleteSession(currentSession.id);
    }
  }, [currentSession, deleteSession]);

  if (!currentSession) return null;

  // Apply visual offset to photos for preview
  const calibratedPhotos = currentSession.photos.map((p) => ({
    ...p,
    offset_seconds: p.offset_seconds != null ? Math.max(0, p.offset_seconds + clockOffset) : null,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => setView('home')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            &larr; Back
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{currentSession.name}</h2>
        </div>
        <div className="flex gap-2">
          {TRANSCRIBE_AVAILABLE && currentSession.has_audio && !currentSession.transcript && (
            <button
              onClick={handleTranscribe}
              disabled={transcribing}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {transcribing ? 'Transcribing...' : 'Transcribe'}
            </button>
          )}
          <button
            onClick={() => setShowCalibration((v) => !v)}
            className="px-3 py-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
            title="Calibrate photo timing"
          >
            Calibrate
          </button>
          <button
            onClick={handleDelete}
            className="px-3 py-2 text-gray-300 hover:text-red-500 transition-colors"
            title="Delete session"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calibration panel */}
      {showCalibration && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700 mb-2">
            Adjust if your phone clock was off from your Mac. Positive = shift photos later.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={-60}
              max={60}
              step={1}
              value={clockOffset}
              onChange={(e) => setClockOffset(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-mono w-16 text-right">
              {clockOffset > 0 ? '+' : ''}{clockOffset}s
            </span>
            <button
              onClick={applyCalibration}
              disabled={clockOffset === 0}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white rounded text-sm font-medium transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Audio Player */}
      {currentSession.has_audio && <AudioPlayer player={player} />}

      {/* Timeline */}
      {currentSession.has_audio && (
        <Timeline
          sessionId={currentSession.id}
          photos={calibratedPhotos}
          duration={player.duration}
          currentTime={player.currentTime}
          onSeek={(t) => {
            player.pause();
            player.seek(t);
          }}
        />
      )}

      {/* Photo Gallery */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Photos ({currentSession.photos.length})
        </h3>
        <PhotoGallery
          sessionId={currentSession.id}
          photos={calibratedPhotos}
          currentTime={player.currentTime}
          onPhotoClick={handlePhotoClick}
        />
        <div className="mt-4">
          <PhotoDropZone />
        </div>
      </div>

      {/* Transcript */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Transcript
        </h3>
        <TranscriptPanel
          segments={currentSession.transcript}
          currentTime={player.currentTime}
          onSeek={(t) => {
            player.seek(t);
            player.play();
          }}
        />
      </div>
    </div>
  );
}
