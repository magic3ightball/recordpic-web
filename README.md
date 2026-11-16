# recordpic (browser version)

Record a lecture and sync the photos you took to the audio timeline.

**Try it:** https://magic3ightball.github.io/recordpic-web/

## What it does
- Record audio in the browser, with pause and resume
- Add photos; each one is placed on the recording timeline by its capture time (EXIF `DateTimeOriginal`, falling back to the file's modified time)
- Click a photo to jump to that moment in the recording
- Shift all photos if your phone clock was off

## Privacy
Everything stays in your browser (IndexedDB). Recordings and photos are never uploaded.

## Differences from the original
The original version used a server for storage, invite-only access, and speech-to-text (OpenAI Whisper).
This version runs without a server, so speech-to-text is not included.

## Run locally
```bash
npm install
npm run dev
```

Built with React, Vite, Tailwind CSS, and exifr.
