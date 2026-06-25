import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { addBook, removeBook, setSearchQuery } from '../store/bookSlice';
import { BookCard } from '../components/BookCard';
import { SyncStatus } from '../components/SyncStatus';
import { bookService } from '../services/bookService';
import { storageService } from '../services/storageService';
import { getTheme } from '../theme';
import { Book } from '../types';

export const LibraryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { books, searchQuery } = useSelector((state: RootState) => state.books);
  const { app: appSettings, reader: readerSettings } = useSelector((state: RootState) => state.settings);
  const syncState = useSelector((state: RootState) => state.sync);
  const theme = getTheme(readerSettings.theme);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(appSettings.defaultView);
  const [activeFilter, setActiveFilter] = useState<'all' | 'reading' | 'finished' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const getFilteredBooks = useCallback(() => {
    let filtered = books;
    switch (activeFilter) {
      case 'reading':
        filtered = bookService.getReadingBooks(books);
        break;
      case 'finished':
        filtered = bookService.getFinishedBooks(books);
        break;
      case 'unread':
        filtered = bookService.getUnreadBooks(books);
        break;
    }
    if (searchQuery) {
      filtered = bookService.filterBooks(filtered, searchQuery);
    }
    return bookService.sortBooks(filtered, appSettings.sortBy, appSettings.sortOrder);
  }, [books, activeFilter, searchQuery, appSettings.sortBy, appSettings.sortOrder]);

  const handleImport = async () => {
    try {
      const newBooks = await bookService.importBooks();
      for (const book of newBooks) {
        dispatch(addBook(book));
      }
      if (newBooks.length > 0) {
        await storageService.saveBooks([...books, ...newBooks]);
      }
    } catch (error: any) {
      Alert.alert('שגיאה', 'לא ניתן לייבא את הקובץ');
    }
  };

  const handleBookPress = (book: Book) => {
    if (book.fileType === 'epub') {
      navigation.navigate('EpubReader', { bookId: book.id });
    } else {
      navigation.navigate('PdfReader', { bookId: book.id });
    }
  };

  const handleBookLongPress = (book: Book) => {
    Alert.alert(book.title, '', [
      { text: 'פרטי הספר', onPress: () => navigation.navigate('BookDetails', { bookId: book.id }) },
      { text: 'סימניות', onPress: () => navigation.navigate('Bookmarks', { bookId: book.id }) },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: () => {
          Alert.alert('מחיקת ספר', `למחוק את "${book.title}"?`, [
            { text: 'ביטול', style: 'cancel' },
            {
              text: 'מחק',
              style: 'destructive',
              onPress: async () => {
                await bookService.deleteBook(book);
                dispatch(removeBook(book.id));
              },
            },
          ]);
        },
      },
      { text: 'ביטול', style: 'cancel' },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const savedBooks = await storageService.loadBooks();
    setRefreshing(false);
  };

  const filters = [
    { key: 'all' as const, label: 'הכל' },
    { key: 'reading' as const, label: 'קורא עכשיו' },
    { key: 'unread' as const, label: 'לא נקרא' },
    { key: 'finished' as const, label: 'הושלם' },
  ];

  const filteredBooks = getFilteredBooks();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar backgroundColor={theme.statusBar} barStyle={readerSettings.theme === 'light' ? 'dark-content' : 'light-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>UREADER</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              style={styles.headerBtn}
            >
              <Text style={{ fontSize: 20 }}>{viewMode === 'grid' ? '☰' : '⊞'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Statistics')}
              style={styles.headerBtn}
            >
              <Text style={{ fontSize: 20 }}>{'📊'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('Settings')}
              style={styles.headerBtn}
            >
              <Text style={{ fontSize: 20 }}>{'⚙️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <Text style={styles.searchIcon}>{'🔍'}</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="חיפוש ספרים..."
            placeholderTextColor={theme.secondary}
            value={searchQuery}
            onChangeText={(text) => dispatch(setSearchQuery(text))}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterBtn,
                { borderColor: theme.border },
                activeFilter === filter.key && { backgroundColor: theme.accent, borderColor: theme.accent },
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={[
                styles.filterText,
                { color: activeFilter === filter.key ? '#fff' : theme.text },
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sync Status */}
      <SyncStatus
        isSyncing={syncState.isSyncing}
        lastSyncAt={syncState.lastSyncAt}
        syncError={syncState.syncError}
        isLoggedIn={syncState.isLoggedIn}
        pendingChanges={syncState.pendingChanges}
        theme={theme}
        onSync={() => {}}
        onLogin={() => navigation.navigate('Settings')}
      />

      {/* Book List */}
      {filteredBooks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyIcon]}>{'📚'}</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>הספרייה ריקה</Text>
          <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
            הוסף ספרים בפורמט EPUB או PDF
          </Text>
          <TouchableOpacity
            style={[styles.importBtn, { backgroundColor: theme.accent }]}
            onPress={handleImport}
          >
            <Text style={styles.importBtnText}>{'➕ הוסף ספר'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              theme={theme}
              viewMode={viewMode}
              onPress={handleBookPress}
              onLongPress={handleBookLongPress}
            />
          )}
          keyExtractor={item => item.id}
          numColumns={viewMode === 'grid' ? 3 : 1}
          key={viewMode}
          contentContainerStyle={[
            styles.listContent,
            viewMode === 'grid' && styles.gridContent,
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* FAB */}
      {filteredBooks.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.accent }]}
          onPress={handleImport}
        >
          <Text style={styles.fabText}>{'+'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    padding: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    textAlign: 'right',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  importBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  importBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  gridContent: {
    justifyContent: 'space-between',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});
