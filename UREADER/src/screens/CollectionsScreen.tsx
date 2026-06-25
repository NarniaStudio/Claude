import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { addCollection, removeCollection, updateCollection } from '../store/bookSlice';
import { bookService } from '../services/bookService';
import { getTheme } from '../theme';
import { Collection } from '../types';

export const CollectionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const collections = useSelector((state: RootState) => state.books.collections);
  const books = useSelector((state: RootState) => state.books.books);
  const readerSettings = useSelector((state: RootState) => state.settings.reader);
  const theme = getTheme(readerSettings.theme);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) {
      Alert.alert('שגיאה', 'נא להזין שם לאוסף');
      return;
    }
    const collection = bookService.createCollection(newName.trim(), newDesc.trim());
    dispatch(addCollection(collection));
    setNewName('');
    setNewDesc('');
    setShowNewModal(false);
  };

  const handleDelete = (collection: Collection) => {
    Alert.alert('מחיקת אוסף', `למחוק את "${collection.name}"?`, [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => dispatch(removeCollection(collection.id)) },
    ]);
  };

  const renderCollection = ({ item }: { item: Collection }) => {
    const bookCount = item.bookIds.length;
    return (
      <TouchableOpacity
        style={[styles.collectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => navigation.navigate('Library', { collectionId: item.id })}
        onLongPress={() => handleDelete(item)}
      >
        <View style={[styles.collectionIcon, { backgroundColor: theme.accent }]}>
          <Text style={styles.collectionIconText}>{'📂'}</Text>
        </View>
        <View style={styles.collectionInfo}>
          <Text style={[styles.collectionName, { color: theme.text }]}>{item.name}</Text>
          {item.description ? (
            <Text style={[styles.collectionDesc, { color: theme.secondary }]} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
          <Text style={[styles.bookCount, { color: theme.secondary }]}>
            {bookCount} ספרים
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backText, { color: theme.accent }]}>{'◀ חזרה'}</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>אוספים</Text>
        <TouchableOpacity onPress={() => setShowNewModal(true)}>
          <Text style={[styles.addText, { color: theme.accent }]}>+ חדש</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyIcon]}>{'📂'}</Text>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>אין אוספים</Text>
            <Text style={[styles.emptySubtitle, { color: theme.secondary }]}>
              צור אוספים כדי לארגן את הספרים שלך
            </Text>
          </View>
        }
      />

      {/* New Collection Modal */}
      <Modal visible={showNewModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>אוסף חדש</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="שם האוסף"
              placeholderTextColor={theme.secondary}
              value={newName}
              onChangeText={setNewName}
              textAlign="right"
            />
            <TextInput
              style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
              placeholder="תיאור (אופציונלי)"
              placeholderTextColor={theme.secondary}
              value={newDesc}
              onChangeText={setNewDesc}
              textAlign="right"
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.accent }]}
                onPress={handleCreate}
              >
                <Text style={styles.modalBtnText}>צור</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.border }]}
                onPress={() => setShowNewModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: theme.text }]}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backText: { fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  addText: { fontSize: 15, fontWeight: '600' },
  listContent: { padding: 16 },
  collectionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
  },
  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  collectionIconText: { fontSize: 24 },
  collectionInfo: { flex: 1 },
  collectionName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  collectionDesc: { fontSize: 13, marginBottom: 2 },
  bookCount: { fontSize: 12 },
  emptyContainer: { paddingVertical: 80, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 10,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBtnText: { color: 'white', fontSize: 15, fontWeight: '600' },
});
