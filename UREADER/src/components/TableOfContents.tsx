import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';
import { TableOfContentsItem, ThemeColors } from '../types';

interface TableOfContentsProps {
  visible: boolean;
  items: TableOfContentsItem[];
  theme: ThemeColors;
  onSelect: (item: TableOfContentsItem) => void;
  onClose: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  visible, items, theme, onSelect, onClose,
}) => {
  const renderItem = ({ item }: { item: TableOfContentsItem }) => (
    <View>
      <TouchableOpacity
        style={[styles.item, { paddingLeft: 16 + item.level * 24 }]}
        onPress={() => onSelect(item)}
      >
        <Text style={[
          styles.itemText,
          { color: theme.text },
          item.level === 0 && styles.mainChapter,
        ]}>
          {item.title}
        </Text>
        {item.page !== undefined && (
          <Text style={[styles.pageNum, { color: theme.secondary }]}>
            {item.page}
          </Text>
        )}
      </TouchableOpacity>
      {item.children?.map(child => (
        <TouchableOpacity
          key={child.id}
          style={[styles.item, { paddingLeft: 16 + (child.level) * 24 }]}
          onPress={() => onSelect(child)}
        >
          <Text style={[styles.itemText, styles.subChapter, { color: theme.secondary }]}>
            {child.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>תוכן העניינים</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: theme.accent }]}>סגור</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 40,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 16,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
  },
  mainChapter: {
    fontWeight: '600',
  },
  subChapter: {
    fontSize: 13,
  },
  pageNum: {
    fontSize: 12,
    marginLeft: 8,
  },
  separator: {
    height: 0.5,
    marginLeft: 16,
  },
});
