import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { updateBook, setBookRating } from '../store/bookSlice';
import { getTheme } from '../theme';
import { formatFileSize, formatDate, formatProgress, formatReadingTime } from '../utils/formatters';

export const BookDetailsScreen: React.FC<{ route: any; navigation: any }> = ({
  route, navigation,
}) => {
  const { bookId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const book = useSelector((state: RootState) =>
    state.books.books.find(b => b.id === bookId)
  );
  const bookmarks = useSelector((state: RootState) => state.books.bookmarks[bookId] || []);
  const highlights = useSelector((state: RootState) => state.books.highlights[bookId] || []);
  const notes = useSelector((state: RootState) => state.books.notes[bookId] || []);
  const readerSettings = useSelector((state: RootState) => state.settings.reader);
  const theme = getTheme(readerSettings.theme);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(book?.title || '');
  const [editAuthor, setEditAuthor] = useState(book?.author || '');

  if (!book) return null;

  const handleSave = () => {
    dispatch(updateBook({ id: book.id, title: editTitle, author: editAuthor }));
    setIsEditing(false);
  };

  const renderStars = () => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => dispatch(setBookRating({ bookId: book.id, rating: star }))}
          >
            <Text style={[styles.star, star <= book.rating && styles.starActive]}>
              {star <= book.rating ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Cover */}
      <View style={[styles.coverSection, { backgroundColor: theme.accent }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'◀ חזרה'}</Text>
        </TouchableOpacity>
        {book.coverUri ? (
          <Image source={{ uri: book.coverUri }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.placeholderCover]}>
            <Text style={styles.placeholderText}>{book.title.charAt(0)}</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={[styles.infoSection, { backgroundColor: theme.card }]}>
        {isEditing ? (
          <View style={styles.editSection}>
            <TextInput
              style={[styles.editInput, { color: theme.text, borderColor: theme.border }]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="שם הספר"
            />
            <TextInput
              style={[styles.editInput, { color: theme.text, borderColor: theme.border }]}
              value={editAuthor}
              onChangeText={setEditAuthor}
              placeholder="מחבר"
            />
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.accent }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>שמור</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.title, { color: theme.text }]}>{book.title}</Text>
            <Text style={[styles.author, { color: theme.secondary }]}>{book.author}</Text>
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={[styles.editLink, { color: theme.accent }]}>ערוך פרטים</Text>
            </TouchableOpacity>
          </>
        )}

        {renderStars()}

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${book.progress}%` }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.text }]}>
            {formatProgress(book.progress)}
          </Text>
        </View>

        {/* Read Button */}
        <TouchableOpacity
          style={[styles.readBtn, { backgroundColor: theme.accent }]}
          onPress={() => {
            if (book.fileType === 'epub') {
              navigation.navigate('EpubReader', { bookId: book.id });
            } else {
              navigation.navigate('PdfReader', { bookId: book.id });
            }
          }}
        >
          <Text style={styles.readBtnText}>
            {book.progress > 0 ? 'המשך קריאה' : 'התחל לקרוא'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Details */}
      <View style={[styles.detailsSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>פרטים</Text>
        <DetailRow label="פורמט" value={book.fileType.toUpperCase()} theme={theme} />
        <DetailRow label="גודל" value={formatFileSize(book.fileSize)} theme={theme} />
        <DetailRow label="עמודים" value={`${book.totalPages || '—'}`} theme={theme} />
        <DetailRow label="עמוד נוכחי" value={`${book.currentPage || '—'}`} theme={theme} />
        <DetailRow label="נוסף" value={formatDate(book.addedAt)} theme={theme} />
        <DetailRow label="נקרא לאחרונה" value={book.lastReadAt ? formatDate(book.lastReadAt) : '—'} theme={theme} />
        {book.publisher && <DetailRow label="מו\"ל" value={book.publisher} theme={theme} />}
        {book.isbn && <DetailRow label="ISBN" value={book.isbn} theme={theme} />}
      </View>

      {/* Stats */}
      <View style={[styles.statsSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>נתונים</Text>
        <View style={styles.statsGrid}>
          <StatCard label="סימניות" value={`${bookmarks.length}`} theme={theme} />
          <StatCard label="הדגשות" value={`${highlights.length}`} theme={theme} />
          <StatCard label="הערות" value={`${notes.length}`} theme={theme} />
        </View>
      </View>

      {book.description && (
        <View style={[styles.descSection, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>תיאור</Text>
          <Text style={[styles.description, { color: theme.text }]}>{book.description}</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const DetailRow: React.FC<{ label: string; value: string; theme: any }> = ({ label, value, theme }) => (
  <View style={detailStyles.row}>
    <Text style={[detailStyles.label, { color: theme.secondary }]}>{label}</Text>
    <Text style={[detailStyles.value, { color: theme.text }]}>{value}</Text>
  </View>
);

const StatCard: React.FC<{ label: string; value: string; theme: any }> = ({ label, value, theme }) => (
  <View style={[detailStyles.statCard, { backgroundColor: theme.background }]}>
    <Text style={[detailStyles.statValue, { color: theme.accent }]}>{value}</Text>
    <Text style={[detailStyles.statLabel, { color: theme.secondary }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  coverSection: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    right: 16,
    zIndex: 10,
  },
  backText: { color: 'white', fontSize: 16, fontWeight: '600' },
  cover: { width: 140, height: 210, borderRadius: 8, elevation: 5 },
  placeholderCover: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 48, color: 'white', fontWeight: '700' },
  infoSection: {
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  author: { fontSize: 16, marginBottom: 8 },
  editLink: { fontSize: 13, marginBottom: 12 },
  starsRow: { flexDirection: 'row', gap: 4, marginBottom: 16 },
  star: { fontSize: 28, color: '#ccc' },
  starActive: { color: '#f5a623' },
  progressSection: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  progressBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { marginLeft: 10, fontSize: 14, fontWeight: '600' },
  readBtn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
  readBtnText: { color: 'white', fontSize: 17, fontWeight: '700' },
  editSection: { width: '100%', gap: 10 },
  editInput: {
    borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, textAlign: 'right',
  },
  saveBtn: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  detailsSection: {
    padding: 16, marginHorizontal: 16, marginTop: 12, borderRadius: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  statsSection: {
    padding: 16, marginHorizontal: 16, marginTop: 12, borderRadius: 12,
  },
  statsGrid: { flexDirection: 'row', gap: 8 },
  descSection: {
    padding: 16, marginHorizontal: 16, marginTop: 12, borderRadius: 12,
  },
  description: { fontSize: 14, lineHeight: 22 },
});

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600' },
  statCard: {
    flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: 10,
  },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 4 },
});
