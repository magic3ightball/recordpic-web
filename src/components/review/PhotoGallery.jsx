import PhotoThumbnail from '../photos/PhotoThumbnail';

export default function PhotoGallery({ sessionId, photos, currentTime, onPhotoClick }) {
  const sorted = [...photos]
    .filter((p) => p.offset_seconds != null)
    .sort((a, b) => a.offset_seconds - b.offset_seconds);

  if (sorted.length === 0) return null;

  // Find photo closest to current time
  let activeFilename = null;
  for (const p of sorted) {
    if (p.offset_seconds <= currentTime) activeFilename = p.filename;
  }

  return (
    <div className="flex gap-2 overflow-x-auto py-2">
      {sorted.map((photo) => (
        <PhotoThumbnail
          key={photo.filename}
          sessionId={sessionId}
          photo={photo}
          active={photo.filename === activeFilename}
          onClick={onPhotoClick}
        />
      ))}
    </div>
  );
}
