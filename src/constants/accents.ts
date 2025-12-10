export const ACCENTS = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'th', name: 'Thai' },
  { code: 'ru', name: 'Russian' },
  { code: 'he', name: 'Hebrew' }
] as const;

export const DEFAULT_ACCENT = 'en';

export type AccentCode = typeof ACCENTS[number]['code'];

