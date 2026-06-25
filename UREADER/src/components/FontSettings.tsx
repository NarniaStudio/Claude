import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { ReaderSettings, ReaderTheme, ThemeColors } from '../types';
import { fonts, themes } from '../theme';

interface FontSettingsProps {
  visible: boolean;
  settings: ReaderSettings;
  theme: ThemeColors;
  onClose: () => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onLineHeightChange: (height: number) => void;
  onMarginsChange: (margins: number) => void;
  onTextAlignChange: (align: 'left' | 'right' | 'center' | 'justify') => void;
  onThemeChange: (theme: ReaderTheme) => void;
  onBrightnessChange: (brightness: number) => void;
  onScrollModeToggle: () => void;
}

export const FontSettings: React.FC<FontSettingsProps> = ({
  visible, settings, theme, onClose,
  onFontSizeChange, onFontFamilyChange, onLineHeightChange,
  onMarginsChange, onTextAlignChange, onThemeChange,
  onBrightnessChange, onScrollModeToggle,
}) => {
  const themeOptions: { key: ReaderTheme; label: string; bg: string; fg: string }[] = [
    { key: 'light', label: 'בהיר', bg: '#ffffff', fg: '#212529' },
    { key: 'sepia', label: 'ספיה', bg: '#f4ecd8', fg: '#5b4636' },
    { key: 'green', label: 'ירוק', bg: '#e8f5e9', fg: '#1b5e20' },
    { key: 'dark', label: 'כהה', bg: '#121212', fg: '#e0e0e0' },
    { key: 'night', label: 'לילה', bg: '#000000', fg: '#555555' },
  ];

  const alignOptions: { key: 'left' | 'right' | 'center' | 'justify'; label: string }[] = [
    { key: 'right', label: 'ימין' },
    { key: 'center', label: 'מרכז' },
    { key: 'left', label: 'שמאל' },
    { key: 'justify', label: 'מיושר' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>הגדרות קריאה</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeText, { color: theme.accent }]}>סגור</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Font Size */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>גודל פונט</Text>
              <View style={styles.fontSizeRow}>
                <TouchableOpacity
                  style={[styles.fontSizeBtn, { borderColor: theme.border }]}
                  onPress={() => onFontSizeChange(settings.fontSize - 1)}
                >
                  <Text style={[styles.fontSizeBtnText, { color: theme.text, fontSize: 14 }]}>A</Text>
                </TouchableOpacity>
                <Text style={[styles.fontSizeValue, { color: theme.text }]}>{settings.fontSize}</Text>
                <TouchableOpacity
                  style={[styles.fontSizeBtn, { borderColor: theme.border }]}
                  onPress={() => onFontSizeChange(settings.fontSize + 1)}
                >
                  <Text style={[styles.fontSizeBtnText, { color: theme.text, fontSize: 22 }]}>A</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Font Family */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>פונט</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {fonts.options.map(font => (
                  <TouchableOpacity
                    key={font.value}
                    style={[
                      styles.fontBtn,
                      { borderColor: theme.border },
                      settings.fontFamily === font.value && { borderColor: theme.accent, backgroundColor: theme.accent + '20' },
                    ]}
                    onPress={() => onFontFamilyChange(font.value)}
                  >
                    <Text style={[
                      styles.fontBtnText,
                      { color: theme.text, fontFamily: font.value },
                    ]}>
                      {font.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Theme */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>ערכת נושא</Text>
              <View style={styles.themeRow}>
                {themeOptions.map(t => (
                  <TouchableOpacity
                    key={t.key}
                    style={[
                      styles.themeBtn,
                      { backgroundColor: t.bg, borderColor: theme.border },
                      settings.theme === t.key && { borderColor: theme.accent, borderWidth: 3 },
                    ]}
                    onPress={() => onThemeChange(t.key)}
                  >
                    <Text style={[styles.themeBtnText, { color: t.fg }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Line Height */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                מרווח שורות: {settings.lineHeight.toFixed(1)}
              </Text>
              <Slider
                value={settings.lineHeight}
                minimumValue={1.0}
                maximumValue={3.0}
                step={0.1}
                onValueChange={onLineHeightChange}
                minimumTrackTintColor={theme.accent}
                thumbTintColor={theme.accent}
              />
            </View>

            {/* Margins */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                שוליים: {settings.margins}px
              </Text>
              <Slider
                value={settings.margins}
                minimumValue={0}
                maximumValue={60}
                step={5}
                onValueChange={onMarginsChange}
                minimumTrackTintColor={theme.accent}
                thumbTintColor={theme.accent}
              />
            </View>

            {/* Text Alignment */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>יישור טקסט</Text>
              <View style={styles.alignRow}>
                {alignOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.alignBtn,
                      { borderColor: theme.border },
                      settings.textAlign === opt.key && { backgroundColor: theme.accent },
                    ]}
                    onPress={() => onTextAlignChange(opt.key)}
                  >
                    <Text style={[
                      styles.alignBtnText,
                      { color: settings.textAlign === opt.key ? '#fff' : theme.text },
                    ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Brightness */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                בהירות: {Math.round(settings.brightness * 100)}%
              </Text>
              <Slider
                value={settings.brightness}
                minimumValue={0.05}
                maximumValue={1}
                step={0.05}
                onValueChange={onBrightnessChange}
                minimumTrackTintColor={theme.accent}
                thumbTintColor={theme.accent}
              />
            </View>

            {/* Scroll Mode */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.toggleRow, { borderColor: theme.border }]}
                onPress={onScrollModeToggle}
              >
                <Text style={[styles.toggleLabel, { color: theme.text }]}>מצב גלילה</Text>
                <View style={[
                  styles.toggle,
                  { backgroundColor: settings.scrollMode ? theme.accent : theme.border },
                ]}>
                  <View style={[
                    styles.toggleKnob,
                    settings.scrollMode && styles.toggleKnobActive,
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '80%',
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
  closeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  fontSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  fontSizeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeBtnText: {
    fontWeight: '700',
  },
  fontSizeValue: {
    fontSize: 20,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
  fontBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    marginRight: 8,
  },
  fontBtnText: {
    fontSize: 14,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  themeBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeBtnText: {
    fontSize: 10,
    fontWeight: '600',
  },
  alignRow: {
    flexDirection: 'row',
    gap: 8,
  },
  alignBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  alignBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleLabel: {
    fontSize: 15,
  },
  toggle: {
    width: 48,
    height: 26,
    borderRadius: 13,
    padding: 2,
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
});
