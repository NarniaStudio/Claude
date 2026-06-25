import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';
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
  const pdfRef = useRef<any>(null);

  const { isPageBookmarked, togglePageBookmark } = useBookmarks(bookId);

  const handlePageChanged = useCallback((page: number, numberOfPages: number) => {
    setCurrentPage(page);
    setTotalPages(numberOfPages);
    const progress = Math.round((page / numberOfPages) * 100);
    if (book) {
      dispatch(updateReadingProgress({
        bookId: book.id,
        currentPage: page,
        progress,
      }));
    }
  }, [book, dispatch]);

  const handleLoadComplete = useCallback((numberOfPages: number) => {
    setTotalPages(numberOfPages);
    if (book) {
      dispatch(startSession({ bookId: book.id, startPage: book.currentPage || 1 }));
    }
  }, [book, dispatch]);

  if (!book) return null;

  const progress = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.reader.background }]}>
      <Pdf
        ref={pdfRef}
        source={{ uri: book.fileUri }}
        page={book.currentPage || 1}
        onPageChanged={handlePageChanged}
        onLoadComplete={handleLoadComplete}
        onPageSingleTap={() => setIsMenuVisible(prev => !prev)}
        enablePaging={!readerSettings.scrollMode}
        horizontal={!readerSettings.scrollMode}
        enableAntialiasing
        enableAnnotationRendering
        fitPolicy={0}
        spacing={readerSettings.scrollMode ? 8 : 0}
        style={[styles.pdf, { backgroundColor: theme.reader.background }]}
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
  pdf: {
    flex: 1,
    width,
    height,
  },
});
