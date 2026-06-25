import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { BookSyncData, SyncData } from '../types';
import { generateId } from '../utils/formatters';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

let app: ReturnType<typeof initializeApp>;
let db: ReturnType<typeof getFirestore>;
let auth: ReturnType<typeof getAuth>;

class SyncService {
  private deviceId: string;
  private initialized = false;

  constructor() {
    this.deviceId = generateId();
  }

  initialize(): void {
    if (this.initialized) return;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    db = getFirestore(app);
    auth = getAuth(app);
    this.initialized = true;
  }

  async signInAnonymous(): Promise<User> {
    this.initialize();
    const result = await signInAnonymously(auth);
    return result.user;
  }

  async signInWithEmail(email: string, password: string): Promise<User> {
    this.initialize();
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async signUpWithEmail(email: string, password: string): Promise<User> {
    this.initialize();
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async signOutUser(): Promise<void> {
    this.initialize();
    await signOut(auth);
  }

  getCurrentUser(): User | null {
    this.initialize();
    return auth.currentUser;
  }

  onAuthChange(callback: (user: User | null) => void): () => void {
    this.initialize();
    return onAuthStateChanged(auth, callback);
  }

  async syncBookData(userId: string, bookData: BookSyncData[]): Promise<void> {
    this.initialize();
    const syncRef = doc(db, 'sync', userId);
    const syncData: SyncData = {
      userId,
      deviceId: this.deviceId,
      lastSyncAt: Date.now(),
      books: bookData,
    };
    await setDoc(syncRef, {
      ...syncData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  async getSyncData(userId: string): Promise<SyncData | null> {
    this.initialize();
    const syncRef = doc(db, 'sync', userId);
    const snapshot = await getDoc(syncRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        userId: data.userId,
        deviceId: data.deviceId,
        lastSyncAt: data.lastSyncAt,
        books: data.books || [],
      };
    }
    return null;
  }

  async syncDevice(userId: string, deviceInfo: {
    deviceId: string;
    deviceName: string;
    platform: string;
    lastActive: number;
  }): Promise<void> {
    this.initialize();
    const deviceRef = doc(db, 'devices', `${userId}_${deviceInfo.deviceId}`);
    await setDoc(deviceRef, {
      ...deviceInfo,
      userId,
      updatedAt: serverTimestamp(),
    });
  }

  async getDevices(userId: string): Promise<Array<{
    deviceId: string;
    deviceName: string;
    platform: string;
    lastActive: number;
  }>> {
    this.initialize();
    const devicesRef = collection(db, 'devices');
    const q = query(devicesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => {
      const data = d.data();
      return {
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        platform: data.platform,
        lastActive: data.lastActive,
      };
    });
  }

  mergeBookData(local: BookSyncData[], remote: BookSyncData[]): BookSyncData[] {
    const merged = new Map<string, BookSyncData>();

    for (const book of local) {
      merged.set(book.bookId, book);
    }

    for (const remoteBook of remote) {
      const localBook = merged.get(remoteBook.bookId);
      if (!localBook) {
        merged.set(remoteBook.bookId, remoteBook);
      } else {
        // Keep the most recent progress
        if (remoteBook.lastReadAt > localBook.lastReadAt) {
          merged.set(remoteBook.bookId, {
            ...remoteBook,
            bookmarks: mergeById(localBook.bookmarks, remoteBook.bookmarks),
            highlights: mergeById(localBook.highlights, remoteBook.highlights),
            notes: mergeById(localBook.notes, remoteBook.notes),
          });
        } else {
          merged.set(remoteBook.bookId, {
            ...localBook,
            bookmarks: mergeById(localBook.bookmarks, remoteBook.bookmarks),
            highlights: mergeById(localBook.highlights, remoteBook.highlights),
            notes: mergeById(localBook.notes, remoteBook.notes),
          });
        }
      }
    }

    return Array.from(merged.values());
  }

  setDeviceId(id: string): void {
    this.deviceId = id;
  }
}

function mergeById<T extends { id: string; createdAt: number }>(
  local: T[],
  remote: T[]
): T[] {
  const merged = new Map<string, T>();
  for (const item of local) merged.set(item.id, item);
  for (const item of remote) {
    const existing = merged.get(item.id);
    if (!existing || item.createdAt > existing.createdAt) {
      merged.set(item.id, item);
    }
  }
  return Array.from(merged.values());
}

export const syncService = new SyncService();
