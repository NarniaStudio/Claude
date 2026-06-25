import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
} from 'react-native';
import { ThemeColors } from '../types';

interface ReaderToolbarProps {
  visible: boolean;
  title: string;
  currentPage: number;
  totalPages: number;
  progress: number;
  theme: ThemeColors;
  onBack: () => void;
  onBookmark: () => void;
  onToc: () => void;
  onSettings: () => void;
  onSearch: () => void;
  onTts: () => void;
  isBookmarked: boolean;
  isTtsPlaying: boolean;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  visible, title, currentPage, totalPages, progress, theme,
  onBack, onBookmark, onToc, onSettings, onSearch, onTts,
  isBookmarked, isTtsPlaying,
}) => {
  if (!visible) return null;

  return (
    <>
      {/* Top Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.statusBar }]}>
        <StatusBar backgroundColor={theme.statusBar} barStyle="light-content" />
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.btnIcon}>{'◀'}</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <View style={styles.topActions}>
          <TouchableOpacity onPress={onSearch} style={styles.actionBtn}>
            <Text style={styles.btnIcon}>{'🔍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBookmark} style={styles.actionBtn}>
            <Text style={styles.btnIcon}>{isBookmarked ? '🔖' : '📑'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.statusBar }]}>
        <View style={styles.progressRow}>
          <View style={[styles.progressBarContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: '#fff' }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.bottomActions}>
          <TouchableOpacity onPress={onToc} style={styles.bottomBtn}>
            <Text style={styles.bottomBtnIcon}>{'📋'}</Text>
            <Text style={styles.bottomBtnText}>תוכן</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onTts} style={styles.bottomBtn}>
            <Text style={styles.bottomBtnIcon}>{isTtsPlaying ? '⏸' : '🔊'}</Text>
            <Text style={styles.bottomBtnText}>הקראה</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onSettings} style={styles.bottomBtn}>
            <Text style={styles.bottomBtnIcon}>{'⚙'}</Text>
            <Text style={styles.bottomBtnText}>הגדרות</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.pageInfo}>
          {currentPage > 0 ? `עמוד ${currentPage} מתוך ${totalPages}` : ''}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 100,
    elevation: 5,
  },
  backBtn: {
    padding: 8,
  },
  btnIcon: {
    fontSize: 20,
    color: 'white',
  },
  title: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  topActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    padding: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    zIndex: 100,
    elevation: 5,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 8,
    width: 36,
    textAlign: 'right',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  bottomBtn: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  bottomBtnIcon: {
    fontSize: 22,
  },
  bottomBtnText: {
    color: 'white',
    fontSize: 11,
    marginTop: 2,
  },
  pageInfo: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    textAlign: 'center',
  },
});
