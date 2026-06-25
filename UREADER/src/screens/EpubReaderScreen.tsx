import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setFontSize, setFontFamily, setLineHeight, setReaderTheme, setMargins, setTextAlign, setBrightness, toggleScrollMode } from '../store/settingsSlice';
import { useReader } from '../hooks/useReader';
import { useBookmarks } from '../hooks/useBookmarks';
import { ReaderToolbar } from '../components/ReaderToolbar';
import { TableOfContents } from '../components/TableOfContents';
import { FontSettings } from '../components/FontSettings';
import { getEpubReaderHtml } from '../services/epubParser';
import { getTheme } from '../theme';
import { TableOfContentsItem, ReaderTheme } from '../types';

export const EpubReaderScreen: React.FC<{ route: any; navigation: any }> = ({
  route, navigation,
}) => {
  const { bookId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const readerSettings = useSelector((state: RootState) => state.settings.reader);
  const theme = getTheme(readerSettings.theme);
  const [tocItems, setTocItems] = useState<TableOfContentsItem[]>([]);

  const {
    book, webViewRef, isMenuVisible, setIsMenuVisible,
    currentLocation, isTocVisible, setIsTocVisible,
    isSettingsVisible, setIsSettingsVisible,
    isTtsPlaying, setIsTtsPlaying,
    handleWebViewMessage, goToLocation,
    isSearchVisible, setIsSearchVisible,
  } = useReader(bookId);

  const {
    isPageBookmarked, togglePageBookmark,
  } = useBookmarks(bookId);

  const handleMessage = useCallback((event: any) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'tocLoaded') {
      setTocItems(data.toc);
    }
    handleWebViewMessage(event);
  }, [handleWebViewMessage]);

  const handleTocSelect = useCallback((item: TableOfContentsItem) => {
    goToLocation(item.href);
    setIsTocVisible(false);
  }, [goToLocation, setIsTocVisible]);

  if (!book) return null;

  const readerHtml = getEpubReaderHtml({
    fontSize: readerSettings.fontSize,
    fontFamily: readerSettings.fontFamily,
    lineHeight: readerSettings.lineHeight,
    textAlign: readerSettings.textAlign,
    backgroundColor: theme.reader.background,
    textColor: theme.reader.text,
    margins: readerSettings.margins,
  });

  const injectedJs = `
    (function() {
      openBook("${book.fileUri}", ${book.currentCfi ? `"${book.currentCfi}"` : 'null'});
    })();
    true;
  `;

  return (
    <View style={[styles.container, { backgroundColor: theme.reader.background }]}>
      <WebView
        ref={webViewRef}
        source={{ html: readerHtml }}
        injectedJavaScript={injectedJs}
        onMessage={handleMessage}
        originWhitelist={['*']}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        javaScriptEnabled
        domStorageEnabled
        style={styles.webview}
      />

      <ReaderToolbar
        visible={isMenuVisible}
        title={book.title}
        currentPage={currentLocation.page}
        totalPages={currentLocation.totalPages}
        progress={currentLocation.progress}
        theme={theme}
        onBack={() => navigation.goBack()}
        onBookmark={() => togglePageBookmark(
          currentLocation.page,
          `עמוד ${currentLocation.page}`,
          currentLocation.cfi
        )}
        onToc={() => setIsTocVisible(true)}
        onSettings={() => setIsSettingsVisible(true)}
        onSearch={() => setIsSearchVisible(true)}
        onTts={() => setIsTtsPlaying(!isTtsPlaying)}
        isBookmarked={isPageBookmarked(currentLocation.page)}
        isTtsPlaying={isTtsPlaying}
      />

      <TableOfContents
        visible={isTocVisible}
        items={tocItems}
        theme={theme}
        onSelect={handleTocSelect}
        onClose={() => setIsTocVisible(false)}
      />

      <FontSettings
        visible={isSettingsVisible}
        settings={readerSettings}
        theme={theme}
        onClose={() => setIsSettingsVisible(false)}
        onFontSizeChange={(size) => dispatch(setFontSize(size))}
        onFontFamilyChange={(family) => dispatch(setFontFamily(family))}
        onLineHeightChange={(height) => dispatch(setLineHeight(height))}
        onMarginsChange={(margins) => dispatch(setMargins(margins))}
        onTextAlignChange={(align) => dispatch(setTextAlign(align))}
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
  },
});
