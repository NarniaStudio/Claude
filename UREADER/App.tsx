import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { storageService } from './src/services/storageService';
import { setBooks, setBookmarks, setHighlights, setNotes, setCollections } from './src/store/bookSlice';
import { setReaderSettings, setAppSettings } from './src/store/settingsSlice';
import { setSessions, setDailyReadings } from './src/store/readingSlice';
import { setDeviceId } from './src/store/syncSlice';
import { generateId } from './src/utils/formatters';

const AppContent: React.FC = () => {
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const [books, bookmarks, highlights, notes, collections, sessions, readerSettings, appSettings] =
        await Promise.all([
          storageService.loadBooks(),
          storageService.loadBookmarks(),
          storageService.loadHighlights(),
          storageService.loadNotes(),
          storageService.loadCollections(),
          storageService.loadReadingSessions(),
          storageService.loadReaderSettings(),
          storageService.loadAppSettings(),
        ]);

      store.dispatch(setBooks(books));
      store.dispatch(setBookmarks(bookmarks));
      store.dispatch(setHighlights(highlights));
      store.dispatch(setNotes(notes));
      store.dispatch(setCollections(collections));
      store.dispatch(setSessions(sessions));

      if (readerSettings) store.dispatch(setReaderSettings(readerSettings));
      if (appSettings) store.dispatch(setAppSettings(appSettings));

      let deviceId = await storageService.getDeviceId();
      if (!deviceId) {
        deviceId = generateId();
        await storageService.setDeviceId(deviceId);
      }
      store.dispatch(setDeviceId(deviceId));
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
