import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateReadingProgress } from '../store/bookSlice';
import { setFontSize, setFontFamily, setLineHeight, setReaderTheme, setMargins, setTextAlign, setBrightness, toggleScrollMode } from '../store/settingsSlice';
import { startSession, endSession } from '../store/readingSlice';
import { useBookmarks } from '../hooks/useBookmarks';
import { ReaderToolbar } from '../components/ReaderToolbar';
import { FontSettings } from '../components/FontSettings';
import { getTheme } from '../theme';
import { ReaderTheme } from '../types';

const { width, height } = Dimensions.get('window');

const getPdfViewerHtml = (uri: string, bgColor: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${bgColor}; width: 100vw; height: 100vh; overflow: hidden; }
    #viewer { width: 100%; height: 100%; }
    iframe { border: none; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <iframe id="viewer" src="${uri}"></iframe>
  <script>
    document.addEventListener('click', function(e) {
      var w = window.innerWidth;
      var x = e.clientX;
      if (x < w * 0.3) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'prev' }));
      } else if (x > w * 0.7) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'next' }));
      } else {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'toggleMenu' }));
      }
    });
  </script>
</body>
</html>
`;

export const PdfReaderScreen: React.FC<{ route: any; navigation: any }> = ({
  route, navigation,
}) => {
  const { bookId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const book = useSelector((state: RootState) =>
    state.books.books.find(b => b.id === bookId)
  );
  const readerSettings = useSelector((state: RootState) => state.settings.reader);
  const theme = getTheme(readerSettings.theme);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(book?.currentPage || 1);
  const [totalPages, setTotalPages] = useState(book?.totalPages || 0);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);

  const { isPageBookmarked, togglePageBookmark } = useBookmarks(bookId);

  const handleMessage = useCallback((event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    switch (data.type) {
      case 'toggleMenu':
        setIsMenuVisible(prev => !prev);
        break;
      case 'pageChanged':
        setCurrentPage(data.page);
        setTotalPages(data.total);
        if (book) {
          dispatch(updateReadingProgress({
            bookId: book.id,
            currentPage: data.page,
            progress: Math.round((data.page / data.total) * 100),
          }));
        }
        break;
    }
  }, [book, dispatch]);

  if (!book) return null;

  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.reader.background }]}>
      <WebView
        source={{ html: getPdfViewerHtml(book.fileUri, theme.reader.background) }}
        onMessage={handleMessage}
        originWhitelist={['*']}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        style={styles.webview}
      />

      <ReaderToolbar
        visible={isMenuVisible}
        title={book.title}
        currentPage={currentPage}
        totalPages={totalPages}
        progress={progress}
        theme={theme}
        onBack={() => {
          dispatch(endSession({ endPage: currentPage }));
          navigation.goBack();
        }}
        onBookmark={() => togglePageBookmark(currentPage, `עמוד ${currentPage}`)}
        onToc={() => {}}
        onSettings={() => setIsSettingsVisible(true)}
        onSearch={() => {}}
        onTts={() => setIsTtsPlaying(!isTtsPlaying)}
        isBookmarked={isPageBookmarked(currentPage)}
        isTtsPlaying={isTtsPlaying}
      />

      <FontSettings
        visible={isSettingsVisible}
        settings={readerSettings}
        theme={theme}
        onClose={() => setIsSettingsVisible(false)}
        onFontSizeChange={(size) => dispatch(setFontSize(size))}
        onFontFamilyChange={(family) => dispatch(setFontFamily(family))}
        onLineHeightChange={(h) => dispatch(setLineHeight(h))}
        onMarginsChange={(m) => dispatch(setMargins(m))}
        onTextAlignChange={(a) => dispatch(setTextAlign(a))}
        onThemeChange={(t: ReaderTheme) => dispatch(setReaderTheme(t))}
        onBrightnessChange={(b) => dispatch(setBrightness(b))}
        onScrollModeToggle={() => dispatch(toggleScrollMode())}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    width,
    height,
  },
});
