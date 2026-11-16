// Browser-only storage (no server). Sessions, audio and photos live in this
// browser's IndexedDB and never leave the device. Same function names as the
// old server client, so the components did not need to change much.

const DB_NAME = 'recordpic';
const DB_VERSION = 1;
let dbPromise = null;

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('blobs')) db.createObjectStore('blobs');
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function tx(store, mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, mode);
        const s = t.objectStore(store);
        let result;
        Promise.resolve(fn(s)).then((r) => { result = r; });
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

const reqP = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const getMeta = (id) => tx('sessions', 'readonly', (s) => reqP(s.get(id)));
const putMeta = (meta) => tx('sessions', 'readwrite', (s) => reqP(s.put(meta)));
const getBlob = (key) => tx('blobs', 'readonly', (s) => reqP(s.get(key)));
const putBlob = (key, blob) => tx('blobs', 'readwrite', (s) => reqP(s.put(blob, key)));

// Object URLs for <audio>/<img>, created when a session is loaded.
const urls = new Map();
const audioKey = (id) => `${id}/audio`;
const photoKey = (id, filename) => `${id}/photo/${filename}`;

function setUrl(key, blob) {
  if (urls.has(key)) URL.revokeObjectURL(urls.get(key));
  if (blob) urls.set(key, URL.createObjectURL(blob));
}

async function loadUrls(meta) {
  if (!meta) return;
  if (meta.has_audio && !urls.has(audioKey(meta.id))) setUrl(audioKey(meta.id), await getBlob(audioKey(meta.id)));
  for (const p of meta.photos) {
    const k = photoKey(meta.id, p.filename);
    if (!urls.has(k)) setUrl(k, await getBlob(k));
  }
}

function newId() {
  return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2)).replace(/-/g, '').slice(0, 8);
}

export async function createSession(name, recordingStart, pauseIntervals) {
  const meta = {
    id: newId(),
    name,
    recording_start: recordingStart,
    pause_intervals: pauseIntervals,
    created_at: new Date().toISOString(),
    has_audio: false,
    photos: [],
    transcript: null,
  };
  await putMeta(meta);
  return meta;
}

export async function listSessions() {
  const all = await tx('sessions', 'readonly', (s) => reqP(s.getAll()));
  return all.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function getSession(id) {
  const meta = await getMeta(id);
  await loadUrls(meta);
  return meta;
}

export async function deleteSession(id) {
  const meta = await getMeta(id);
  if (!meta) return;
  const keys = [audioKey(id), ...meta.photos.map((p) => photoKey(id, p.filename))];
  await tx('blobs', 'readwrite', (s) => Promise.all(keys.map((k) => reqP(s.delete(k)))));
  await tx('sessions', 'readwrite', (s) => reqP(s.delete(id)));
  keys.forEach((k) => {
    if (urls.has(k)) URL.revokeObjectURL(urls.get(k));
    urls.delete(k);
  });
}

export async function uploadAudio(sessionId, blob) {
  await putBlob(audioKey(sessionId), blob);
  setUrl(audioKey(sessionId), blob);
  const meta = await getMeta(sessionId);
  meta.has_audio = true;
  await putMeta(meta);
  return { ok: true };
}

export async function uploadPhotos(sessionId, files) {
  const meta = await getMeta(sessionId);
  const existing = new Set(meta.photos.map((p) => p.filename));
  for (const f of files) {
    if (existing.has(f.name)) continue;
    await putBlob(photoKey(sessionId, f.name), f);
    setUrl(photoKey(sessionId, f.name), f);
    meta.photos.push({ filename: f.name, exif_time: null, offset_seconds: null });
    existing.add(f.name);
  }
  await putMeta(meta);
  return meta.photos;
}

export async function updatePhotosMeta(sessionId, photos) {
  const meta = await getMeta(sessionId);
  const byName = new Map(photos.map((p) => [p.filename, p]));
  for (const p of meta.photos) {
    const u = byName.get(p.filename);
    if (u) Object.assign(p, { exif_time: u.exif_time ?? null, offset_seconds: u.offset_seconds ?? null });
  }
  await putMeta(meta);
  return meta.photos;
}

// Speech-to-text needed a server and an API key; this browser version leaves it out.
export const TRANSCRIBE_AVAILABLE = false;
export async function transcribeSession() {
  throw new Error('Transcription is not available in the browser version.');
}

export function audioUrl(sessionId) {
  return urls.get(audioKey(sessionId)) || '';
}

export function photoUrl(sessionId, filename) {
  return urls.get(photoKey(sessionId, filename)) || '';
}
