export interface Book {
  id: string;
  title: string;
  author: string;
  coverUri: string | null;
  fileUri: string;
  fileType: 'epub' | 'pdf';
  fileSize: number;
  totalPages: number;
  currentPage: number;
  currentCfi?: string; // EPUB location
  progress: number; // 0-100
  addedAt: number;
  lastReadAt: number;
  isFinished: boolean;
  language: string;
  publisher?: string;
  description?: string;
  isbn?: string;
  collectionIds: string[];
  rating: number; // 0-5
  tags: string[];
}

export interface Bookmark {
  id: string;
  bookId: string;
  page: number;
  cfi?: string;
  title: string;
  note: string;
  createdAt: number;
  color: string;
}

export interface Highlight {
  id: string;
  bookId: string;
  page: number;
  cfi?: string;
  text: string;
  note: string;
  color: HighlightColor;
  createdAt: number;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'red' | 'purple' | 'orange';

export interface Note {
  id: string;
  bookId: string;
  page: number;
  cfi?: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  coverUri: string | null;
  bookIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: number;
  endTime: number;
  pagesRead: number;
  startPage: number;
  endPage: number;
}

export interface ReadingStats {
  totalBooksRead: number;
  totalPagesRead: number;
  totalReadingTime: number; // minutes
  currentStreak: number; // days
  longestStreak: number;
  averagePagesPerDay: number;
  averageReadingTimePerDay: number; // minutes
  booksPerMonth: number[];
  readingHistory: DailyReading[];
}

export interface DailyReading {
  date: string; // YYYY-MM-DD
  pagesRead: number;
  readingTime: number; // minutes
  booksRead: string[];
}

export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  textAlign: 'left' | 'right' | 'center' | 'justify';
  margins: number;
  theme: ReaderTheme;
  brightness: number;
  keepScreenOn: boolean;
  scrollMode: boolean; // true = scroll, false = page
  showProgressBar: boolean;
  showClock: boolean;
  showBattery: boolean;
  showPageNumbers: boolean;
  autoBookmark: boolean;
  tapZones: TapZoneConfig;
  ttsSpeed: number;
  ttsVoice: string;
}

export type ReaderTheme = 'light' | 'dark' | 'sepia' | 'night' | 'green' | 'custom';

export interface ThemeColors {
  background: string;
  text: string;
  accent: string;
  secondary: string;
  border: string;
  card: string;
  statusBar: string;
  tabBar: string;
  reader: {
    background: string;
    text: string;
  };
}

export interface TapZoneConfig {
  left: TapAction;
  center: TapAction;
  right: TapAction;
}

export type TapAction = 'prevPage' | 'nextPage' | 'toggleMenu' | 'bookmark' | 'none';

export interface SyncData {
  userId: string;
  deviceId: string;
  lastSyncAt: number;
  books: BookSyncData[];
}

export interface BookSyncData {
  bookId: string;
  currentPage: number;
  currentCfi?: string;
  progress: number;
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: Note[];
  lastReadAt: number;
  isFinished: boolean;
  rating: number;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  href: string;
  page?: number;
  level: number;
  children: TableOfContentsItem[];
}

export interface SearchResult {
  page: number;
  cfi?: string;
  text: string;
  context: string;
}

export interface AppSettings {
  language: 'he' | 'en' | 'ar';
  theme: 'light' | 'dark' | 'system';
  syncEnabled: boolean;
  syncWifiOnly: boolean;
  autoBackup: boolean;
  defaultView: 'grid' | 'list';
  sortBy: 'title' | 'author' | 'lastRead' | 'added' | 'progress';
  sortOrder: 'asc' | 'desc';
  notifications: boolean;
  readingReminder: boolean;
  reminderTime: string; // HH:MM
  dailyGoalPages: number;
  dailyGoalMinutes: number;
}
