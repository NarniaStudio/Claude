import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Book, Bookmark, Highlight, Note, Collection, ReadingSession } from '../types';
import { ReaderSettings, AppSettings } from '../types';

class StorageService {
  async saveBooks(books: Book[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }

  async loadBooks(): Promise<Book[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKS);
    return data ? JSON.parse(data) : [];
  }

  async saveBookmarks(bookmarks: Record<string, Bookmark[]>): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  }

  async loadBookmarks(): Promise<Record<string, Bookmark[]>> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : {};
  }

  async saveHighlights(highlights: Record<string, Highlight[]>): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(highlights));
  }

  async loadHighlights(): Promise<Record<string, Highlight[]>> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
    return data ? JSON.parse(data) : {};
  }

  async saveNotes(notes: Record<string, Note[]>): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  async loadNotes(): Promise<Record<string, Note[]>> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
    return data ? JSON.parse(data) : {};
  }

  async saveCollections(collections: Collection[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  }

  async loadCollections(): Promise<Collection[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    return data ? JSON.parse(data) : [];
  }

  async saveReadingSessions(sessions: ReadingSession[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.READING_SESSIONS, JSON.stringify(sessions));
  }

  async loadReadingSessions(): Promise<ReadingSession[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.READING_SESSIONS);
    return data ? JSON.parse(data) : [];
  }

  async saveReaderSettings(settings: ReaderSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.READER_SETTINGS, JSON.stringify(settings));
  }

  async loadReaderSettings(): Promise<ReaderSettings | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.READER_SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  async saveAppSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  }

  async loadAppSettings(): Promise<AppSettings | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  async getUserId(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
  }

  async setUserId(id: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, id);
  }

  async getDeviceId(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  }

  async setDeviceId(id: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
  }

  async clearAll(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  }

  async exportData(): Promise<string> {
    const keys = Object.values(STORAGE_KEYS);
    const pairs = await AsyncStorage.multiGet(keys);
    const data: Record<string, unknown> = {};
    for (const [key, value] of pairs) {
      if (value) data[key] = JSON.parse(value);
    }
    return JSON.stringify(data);
  }

  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    const pairs: [string, string][] = Object.entries(data).map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(pairs);
  }
}

export const storageService = new StorageService();
