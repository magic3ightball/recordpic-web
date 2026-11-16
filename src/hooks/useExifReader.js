import { useCallback } from 'react';
import exifr from 'exifr';

export function useExifReader() {
  const readExifTime = useCallback(async (file) => {
    try {
      const exif = await exifr.parse(file, ['DateTimeOriginal']);
      if (exif?.DateTimeOriginal) {
        return exif.DateTimeOriginal.getTime();
      }
    } catch {
      // EXIF not available
    }
    // Fallback to file lastModified
    return file.lastModified || null;
  }, []);

  const readAllExifTimes = useCallback(
    async (files) => {
      const results = [];
      for (const file of files) {
        const time = await readExifTime(file);
        results.push({ filename: file.name, exifTime: time });
      }
      return results;
    },
    [readExifTime],
  );

  return { readExifTime, readAllExifTimes };
}
