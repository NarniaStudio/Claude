export const APP_NAME = 'UREADER';
export const APP_VERSION = '1.0.0';

export const STORAGE_KEYS = {
  BOOKS: '@ureader/books',
  BOOKMARKS: '@ureader/bookmarks',
  HIGHLIGHTS: '@ureader/highlights',
  NOTES: '@ureader/notes',
  COLLECTIONS: '@ureader/collections',
  READING_SESSIONS: '@ureader/reading_sessions',
  READER_SETTINGS: '@ureader/reader_settings',
  APP_SETTINGS: '@ureader/app_settings',
  SYNC_DATA: '@ureader/sync_data',
  USER_ID: '@ureader/user_id',
  DEVICE_ID: '@ureader/device_id',
};

export const DEFAULT_READER_SETTINGS = {
  fontSize: 18,
  fontFamily: 'System',
  lineHeight: 1.6,
  textAlign: 'justify' as const,
  margins: 20,
  theme: 'light' as const,
  brightness: 1,
  keepScreenOn: true,
  scrollMode: false,
  showProgressBar: true,
  showClock: true,
  showBattery: true,
  showPageNumbers: true,
  autoBookmark: true,
  tapZones: {
    left: 'prevPage' as const,
    center: 'toggleMenu' as const,
    right: 'nextPage' as const,
  },
  ttsSpeed: 1.0,
  ttsVoice: 'default',
};

export const DEFAULT_APP_SETTINGS = {
  language: 'he' as const,
  theme: 'system' as const,
  syncEnabled: true,
  syncWifiOnly: true,
  autoBackup: true,
  defaultView: 'grid' as const,
  sortBy: 'lastRead' as const,
  sortOrder: 'desc' as const,
  notifications: true,
  readingReminder: false,
  reminderTime: '21:00',
  dailyGoalPages: 30,
  dailyGoalMinutes: 30,
};

export const SUPPORTED_FILE_TYPES = ['epub', 'pdf'];

export const FILE_MIME_TYPES = {
  epub: 'application/epub+zip',
  pdf: 'application/pdf',
};

export const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const MAX_RECENT_BOOKS = 10;
export const BOOKS_PER_PAGE = 20;
