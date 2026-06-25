import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Book, ThemeColors } from '../types';
import { formatProgress, formatRelativeDate, truncateText } from '../utils/formatters';

interface BookCardProps {
  book: Book;
  theme: ThemeColors;
  viewMode: 'grid' | 'list';
  onPress: (book: Book) => void;
  onLongPress?: (book: Book) => void;
}

const { width } = Dimensions.get('window');
const GRID_CARD_WIDTH = (width - 48) / 3;

export const BookCard: React.FC<BookCardProps> = ({
  book, theme, viewMode, onPress, onLongPress,
}) => {
  if (viewMode === 'grid') {
    return (
      <TouchableOpacity
        style={[styles.gridCard, { backgroundColor: theme.card }]}
        onPress={() => onPress(book)}
        onLongPress={() => onLongPress?.(book)}
        activeOpacity={0.7}
      >
        {book.coverUri ? (
          <Image source={{ uri: book.coverUri }} style={styles.gridCover} />
        ) : (
          <View style={[styles.gridCover, styles.placeholderCover, { backgroundColor: theme.accent }]}>
            <Text style={styles.placeholderText}>
              {book.title.charAt(0).toUpperCase()}
            </Text>
            <Text style={styles.placeholderTitle} numberOfLines={3}>
              {book.title}
            </Text>
          </View>
        )}
        <View style={styles.gridInfo}>
          <Text style={[styles.gridTitle, { color: theme.text }]} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={[styles.gridAuthor, { color: theme.secondary }]} numberOfLines={1}>
            {book.author}
          </Text>
          {book.progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View
                  style={[styles.progressFill, {
                    backgroundColor: theme.accent,
                    width: `${book.progress}%`,
                  }]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.secondary }]}>
                {formatProgress(book.progress)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.listCard, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
      onPress={() => onPress(book)}
      onLongPress={() => onLongPress?.(book)}
      activeOpacity={0.7}
    >
      {book.coverUri ? (
        <Image source={{ uri: book.coverUri }} style={styles.listCover} />
      ) : (
        <View style={[styles.listCover, styles.listPlaceholder, { backgroundColor: theme.accent }]}>
          <Text style={styles.listPlaceholderText}>
            {book.title.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <View style={styles.listInfo}>
        <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={[styles.listAuthor, { color: theme.secondary }]} numberOfLines={1}>
          {book.author}
        </Text>
        <View style={styles.listMeta}>
          <Text style={[styles.listType, { color: theme.accent }]}>
            {book.fileType.toUpperCase()}
          </Text>
          <Text style={[styles.listDate, { color: theme.secondary }]}>
            {formatRelativeDate(book.lastReadAt || book.addedAt)}
          </Text>
        </View>
        {book.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View
                style={[styles.progressFill, {
                  backgroundColor: theme.accent,
                  width: `${book.progress}%`,
                }]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.secondary }]}>
              {formatProgress(book.progress)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gridCard: {
    width: GRID_CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridCover: {
    width: '100%',
    height: GRID_CARD_WIDTH * 1.5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  placeholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    opacity: 0.8,
  },
  placeholderTitle: {
    fontSize: 11,
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  gridInfo: {
    padding: 8,
  },
  gridTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  gridAuthor: {
    fontSize: 10,
    marginBottom: 4,
  },
  listCard: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
  },
  listCover: {
    width: 60,
    height: 90,
    borderRadius: 4,
  },
  listPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listAuthor: {
    fontSize: 13,
    marginBottom: 4,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  listType: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: 8,
  },
  listDate: {
    fontSize: 11,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    marginLeft: 6,
  },
});
