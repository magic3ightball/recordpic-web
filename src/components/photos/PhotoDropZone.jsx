import { useState, useCallback } from 'react';
import { useExifReader } from '../../hooks/useExifReader';
import { useSession } from '../../context/SessionContext';
import { calculateAudioOffset } from '../../utils/timeSync';
import * as api from '../../utils/api';

export default function PhotoDropZone() {
  const { currentSession, refreshCurrentSession } = useSession();
  const { readAllExifTimes } = useExifReader();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files) => {
      if (!currentSession || files.length === 0) return;
      setUploading(true);

      try {
        // Read EXIF timestamps
        const exifData = await readAllExifTimes(files);

        // Upload files to backend
        await api.uploadPhotos(currentSession.id, files);

        // Calculate offsets and update metadata
        const photoMeta = exifData.map(({ filename, exifTime }) => ({
          filename,
          exif_time: exifTime,
          offset_seconds: calculateAudioOffset(
            exifTime,
            currentSession.recording_start,
            currentSession.pause_intervals,
          ),
        }));
        await api.updatePhotosMeta(currentSession.id, photoMeta);

        await refreshCurrentSession();
      } catch (err) {
        console.error('Photo upload failed:', err);
      } finally {
        setUploading(false);
      }
    },
    [currentSession, readAllExifTimes, refreshCurrentSession],
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      handleFiles(files);
    },
    [handleFiles],
  );

  const onFileInput = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
      e.target.value = '';
    },
    [handleFiles],
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
      }`}
    >
      {uploading ? (
        <p className="text-gray-500">Uploading photos...</p>
      ) : (
        <>
          <p className="text-gray-500 mb-3">Drag & drop photos here, or click to browse</p>
          <label className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer font-medium transition-colors">
            Choose Photos
            <input type="file" accept="image/*" multiple onChange={onFileInput} className="hidden" />
          </label>
        </>
      )}
    </div>
  );
}
