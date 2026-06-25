import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useBookmarks } from '../hooks/useBookmarks';
import { getTheme } from '../theme';
import { formatDate } from '../utils/formatters';
import { highlightColors } from '../theme';

type TabKey = 'bookmarks' | 'highlights' | 'notes';

export const BookmarksScreen: React.FC<{ route: any; navigation: any }> = ({
  route, navigation,
}) => {
  const { bookId } = route.params;
  const book = useSelector((state: RootState) =>
    state.books.books.find(b => b.id === bookId)
  );
  const readerSettings = useSelector((state: RootState) => state.settings.reader);
  const theme = getTheme(readerSettings.theme);
  const [activeTab, setActiveTab] = useState<TabKey>('bookmarks');

  const {
    bookmarks, highlights, notes,
    deleteBookmark, deleteHighlight, deleteNote,
  } = useBookmarks(bookId);

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'bookmarks', label: 'סימניות', count: bookmarks.length },
    { key: 'highlights', label: 'הדגשות', count: highlights.length },
    { key: 'notes', label: 'הערות', count: notes.length },
  ];

  const handleBookmarkPress = (page: number, cfi?: string) => {
    if (book) {
      if (book.fileType === 'epub') {
        navigation.navigate('EpubReader', { bookId, goToCfi: cfi });
      } else {
        navigation.navigate('PdfReader', { bookId, goToPage: page });
      }
    }
  };

  const renderBookmarks = () => (
    <FlatList
      data={bookmarks}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => handleBookmarkPress(item.page, item.cfi)}
          onLongPress={() => {
            Alert.alert('מחיקת סימנייה', 'למחוק סימנייה זו?', [
              { text: 'ביטול', style: 'cancel' },
              { text: 'מחק', style: 'destructive', onPress: () => deleteBookmark(item.id) },
            ]);
          }}
        >
          <View style={[styles.colorDot, { backgroundColor: item.color }]} />
          <View style={styles.itemContent}>
            <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.itemMeta, { color: theme.secondary }]}>
              עמוד {item.page} · {formatDate(item.createdAt)}
            </Text>
            {item.note ? (
              <Text style={[styles.itemNote, { color: theme.secondary }]} numberOfLines={2}>
                {item.note}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.secondary }]}>אין סימניות</Text>
        </View>
      }
    />
  );

  const renderHighlights = () => (
    <FlatList
      data={highlights}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => handleBookmarkPress(item.page, item.cfi)}
          onLongPress={() => {
            Alert.alert('מחיקת הדגשה', 'למחוק הדגשה זו?', [
              { text: 'ביטול', style: 'cancel' },
              { text: 'מחק', style: 'destructive', onPress: () => deleteHighlight(item.id) },
            ]);
          }}
        >
          <View style={[styles.highlightBar, { backgroundColor: highlightColors[item.color] }]} />
          <View style={styles.itemContent}>
            <Text style={[styles.highlightText, { color: theme.text }]} numberOfLines={3}>
              "{item.text}"
            </Text>
            <Text style={[styles.itemMeta, { color: theme.secondary }]}>
              עמוד {item.page} · {formatDate(item.createdAt)}
            </Text>
            {item.note ? (
              <Text style={[styles.itemNote, { color: theme.secondary }]} numberOfLines={2}>
                {item.note}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.secondary }]}>אין הדגשות</Text>
        </View>
      }
    />
  );

  const renderNotes = () => (
    <FlatList
      data={notes}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => handleBookmarkPress(item.page, item.cfi)}
          onLongPress={() => {
            Alert.alert('מחיקת הערה', 'למחוק הערה זו?', [
              { text: 'ביטול', style: 'cancel' },
              { text: 'מחק', style: 'destructive', onPress: () => deleteNote(item.id) },
            ]);
          }}
        >
          <Text style={styles.noteIcon}>{'📝'}</Text>
          <View style={styles.itemContent}>
            <Text style={[styles.noteText, { color: theme.text }]} numberOfLines={4}>
              {item.content}
            </Text>
            <Text style={[styles.itemMeta, { color: theme.secondary }]}>
              עמוד {item.page} · {formatDate(item.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.secondary }]}>אין הערות</Text>
        </View>
      }
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.accent }]}>{'◀ חזרה'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          {book?.title || 'סימניות'}
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === tab.key ? theme.accent : theme.secondary },
            ]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'bookmarks' && renderBookmarks()}
        {activeTab === 'highlights' && renderHighlights()}
        {activeTab === 'notes' && renderNotes()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: { fontSize: 14, fontWeight: '600' },
  content: { flex: 1, padding: 16 },
  item: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  highlightBar: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    marginRight: 12,
  },
  noteIcon: { fontSize: 20, marginRight: 12 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  itemMeta: { fontSize: 12, marginTop: 4 },
  itemNote: { fontSize: 13, marginTop: 4, fontStyle: 'italic' },
  highlightText: { fontSize: 14, lineHeight: 20 },
  noteText: { fontSize: 14, lineHeight: 20 },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { fontSize: 16 },
});
