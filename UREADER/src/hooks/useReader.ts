import { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateReadingProgress } from '../store/bookSlice';
import { startSession, endSession } from '../store/readingSlice';
import { storageService } from '../services/storageService';
import { WebView } from 'react-native-webview';

export const useReader = (bookId: string) => {
  const dispatch = useDispatch<AppDispatch>();
  const book = useSelector((state: RootState) =>
    state.books.books.find(b => b.id === bookId)
  );
  const readerSettings = useSelector((state: RootState) => state.settings.reader);
  const webViewRef = useRef<WebView>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({
    cfi: '',
    progress: 0,
    chapter: 0,
    page: 0,
    totalPages: 0,
  });
  const [isTocVisible, setIsTocVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  useEffect(() => {
    if (book) {
      dispatch(startSession({ bookId: book.id, startPage: book.currentPage }));
    }
    return () => {
      if (book) {
        dispatch(endSession({ endPage: currentLocation.page }));
      }
    };
  }, [bookId]);

  const sendToWebView = useCallback((message: object) => {
    webViewRef.current?.postMessage(JSON.stringify(message));
  }, []);

  const nextPage = useCallback(() => {
    sendToWebView({ type: 'next' });
  }, [sendToWebView]);

  const prevPage = useCallback(() => {
    sendToWebView({ type: 'prev' });
  }, [sendToWebView]);

  const goToLocation = useCallback((target: string) => {
    sendToWebView({ type: 'goTo', target });
  }, [sendToWebView]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    sendToWebView({ type: 'search', query });
  }, [sendToWebView]);

  const updateTheme = useCallback((settings: object) => {
    sendToWebView({ type: 'updateTheme', settings });
  }, [sendToWebView]);

  const handleWebViewMessage = useCallback((event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
      case 'locationChanged':
        setCurrentLocation({
          cfi: data.cfi,
          progress: data.progress,
          chapter: data.chapter,
          page: data.page,
          totalPages: data.totalPages,
        });
        if (book) {
          dispatch(updateReadingProgress({
            bookId: book.id,
            currentPage: data.page,
            progress: data.progress,
            cfi: data.cfi,
          }));
        }
        break;
      case 'toggleMenu':
        setIsMenuVisible(prev => !prev);
        break;
      case 'textSelected':
        break;
      case 'searchResults':
        setSearchResults(data.results);
        break;
      case 'bookReady':
        break;
      case 'tocLoaded':
        break;
    }
  }, [book, dispatch]);

  const toggleMenu = useCallback(() => {
    setIsMenuVisible(prev => !prev);
  }, []);

  return {
    book,
    webViewRef,
    readerSettings,
    isMenuVisible,
    setIsMenuVisible,
    currentLocation,
    isTocVisible,
    setIsTocVisible,
    isSettingsVisible,
    setIsSettingsVisible,
    searchQuery,
    searchResults,
    isSearchVisible,
    setIsSearchVisible,
    isTtsPlaying,
    setIsTtsPlaying,
    nextPage,
    prevPage,
    goToLocation,
    search,
    updateTheme,
    handleWebViewMessage,
    toggleMenu,
    sendToWebView,
  };
};
