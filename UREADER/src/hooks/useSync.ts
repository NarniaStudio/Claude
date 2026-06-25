import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setSyncing, setSyncSuccess, setSyncError, setLoggedIn, setUserId } from '../store/syncSlice';
import { bookService } from '../services/bookService';
import { syncService } from '../services/syncService';
import { SYNC_INTERVAL } from '../utils/constants';

export const useSync = () => {
  const dispatch = useDispatch<AppDispatch>();
  const syncState = useSelector((state: RootState) => state.sync);
  const books = useSelector((state: RootState) => state.books.books);
  const bookmarks = useSelector((state: RootState) => state.books.bookmarks);
  const highlights = useSelector((state: RootState) => state.books.highlights);
  const notes = useSelector((state: RootState) => state.books.notes);
  const syncEnabled = useSelector((state: RootState) => state.settings.app.syncEnabled);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const performSync = useCallback(async () => {
    if (!syncState.userId || !syncEnabled || syncState.isSyncing) return;

    dispatch(setSyncing(true));
    try {
      await bookService.performSync(
        syncState.userId,
        books,
        bookmarks,
        highlights,
        notes
      );
      dispatch(setSyncSuccess());
    } catch (error: any) {
      dispatch(setSyncError(error.message || 'Sync failed'));
    }
  }, [syncState.userId, syncEnabled, syncState.isSyncing, books, bookmarks, highlights, notes, dispatch]);

  const signIn = useCallback(async (email?: string, password?: string) => {
    try {
      let user;
      if (email && password) {
        user = await syncService.signInWithEmail(email, password);
      } else {
        user = await syncService.signInAnonymous();
      }
      dispatch(setUserId(user.uid));
      dispatch(setLoggedIn(true));
      return user;
    } catch (error: any) {
      dispatch(setSyncError(error.message));
      throw error;
    }
  }, [dispatch]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const user = await syncService.signUpWithEmail(email, password);
      dispatch(setUserId(user.uid));
      dispatch(setLoggedIn(true));
      return user;
    } catch (error: any) {
      dispatch(setSyncError(error.message));
      throw error;
    }
  }, [dispatch]);

  const signOut = useCallback(async () => {
    await syncService.signOutUser();
    dispatch(setLoggedIn(false));
    dispatch(setUserId(''));
  }, [dispatch]);

  useEffect(() => {
    if (syncEnabled && syncState.isLoggedIn) {
      intervalRef.current = setInterval(performSync, SYNC_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [syncEnabled, syncState.isLoggedIn, performSync]);

  return {
    ...syncState,
    performSync,
    signIn,
    signUp,
    signOut,
  };
};
