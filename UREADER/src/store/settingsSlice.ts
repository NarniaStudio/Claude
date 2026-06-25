import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReaderSettings, AppSettings, ReaderTheme } from '../types';
import { DEFAULT_READER_SETTINGS, DEFAULT_APP_SETTINGS } from '../utils/constants';

interface SettingsState {
  reader: ReaderSettings;
  app: AppSettings;
}

const initialState: SettingsState = {
  reader: DEFAULT_READER_SETTINGS,
  app: DEFAULT_APP_SETTINGS,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setReaderSettings(state, action: PayloadAction<Partial<ReaderSettings>>) {
      state.reader = { ...state.reader, ...action.payload };
    },
    setAppSettings(state, action: PayloadAction<Partial<AppSettings>>) {
      state.app = { ...state.app, ...action.payload };
    },
    setFontSize(state, action: PayloadAction<number>) {
      state.reader.fontSize = Math.max(10, Math.min(40, action.payload));
    },
    setFontFamily(state, action: PayloadAction<string>) {
      state.reader.fontFamily = action.payload;
    },
    setLineHeight(state, action: PayloadAction<number>) {
      state.reader.lineHeight = Math.max(1.0, Math.min(3.0, action.payload));
    },
    setReaderTheme(state, action: PayloadAction<ReaderTheme>) {
      state.reader.theme = action.payload;
    },
    setBrightness(state, action: PayloadAction<number>) {
      state.reader.brightness = Math.max(0.05, Math.min(1, action.payload));
    },
    toggleScrollMode(state) {
      state.reader.scrollMode = !state.reader.scrollMode;
    },
    toggleKeepScreenOn(state) {
      state.reader.keepScreenOn = !state.reader.keepScreenOn;
    },
    setMargins(state, action: PayloadAction<number>) {
      state.reader.margins = Math.max(0, Math.min(60, action.payload));
    },
    setTextAlign(state, action: PayloadAction<'left' | 'right' | 'center' | 'justify'>) {
      state.reader.textAlign = action.payload;
    },
    setTtsSpeed(state, action: PayloadAction<number>) {
      state.reader.ttsSpeed = Math.max(0.25, Math.min(4, action.payload));
    },
    setSortBy(state, action: PayloadAction<AppSettings['sortBy']>) {
      state.app.sortBy = action.payload;
    },
    setSortOrder(state, action: PayloadAction<'asc' | 'desc'>) {
      state.app.sortOrder = action.payload;
    },
    setDefaultView(state, action: PayloadAction<'grid' | 'list'>) {
      state.app.defaultView = action.payload;
    },
    setDailyGoal(state, action: PayloadAction<{ pages?: number; minutes?: number }>) {
      if (action.payload.pages !== undefined) state.app.dailyGoalPages = action.payload.pages;
      if (action.payload.minutes !== undefined) state.app.dailyGoalMinutes = action.payload.minutes;
    },
    toggleSync(state) {
      state.app.syncEnabled = !state.app.syncEnabled;
    },
    resetReaderSettings(state) {
      state.reader = DEFAULT_READER_SETTINGS;
    },
    resetAppSettings(state) {
      state.app = DEFAULT_APP_SETTINGS;
    },
  },
});

export const {
  setReaderSettings, setAppSettings,
  setFontSize, setFontFamily, setLineHeight, setReaderTheme,
  setBrightness, toggleScrollMode, toggleKeepScreenOn,
  setMargins, setTextAlign, setTtsSpeed,
  setSortBy, setSortOrder, setDefaultView, setDailyGoal,
  toggleSync, resetReaderSettings, resetAppSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
