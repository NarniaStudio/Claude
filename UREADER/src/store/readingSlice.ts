import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReadingSession, ReadingStats, DailyReading } from '../types';

interface ReadingState {
  sessions: ReadingSession[];
  currentSession: ReadingSession | null;
  stats: ReadingStats;
  dailyReadings: DailyReading[];
}

const initialState: ReadingState = {
  sessions: [],
  currentSession: null,
  stats: {
    totalBooksRead: 0,
    totalPagesRead: 0,
    totalReadingTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    averagePagesPerDay: 0,
    averageReadingTimePerDay: 0,
    booksPerMonth: [],
    readingHistory: [],
  },
  dailyReadings: [],
};

const readingSlice = createSlice({
  name: 'reading',
  initialState,
  reducers: {
    startSession(state, action: PayloadAction<{ bookId: string; startPage: number }>) {
      state.currentSession = {
        id: Date.now().toString(36),
        bookId: action.payload.bookId,
        startTime: Date.now(),
        endTime: 0,
        pagesRead: 0,
        startPage: action.payload.startPage,
        endPage: action.payload.startPage,
      };
    },
    endSession(state, action: PayloadAction<{ endPage: number }>) {
      if (state.currentSession) {
        state.currentSession.endTime = Date.now();
        state.currentSession.endPage = action.payload.endPage;
        state.currentSession.pagesRead = Math.abs(
          action.payload.endPage - state.currentSession.startPage
        );
        state.sessions.push(state.currentSession);

        const sessionMinutes = (state.currentSession.endTime - state.currentSession.startTime) / 60000;
        state.stats.totalPagesRead += state.currentSession.pagesRead;
        state.stats.totalReadingTime += sessionMinutes;

        const today = new Date().toISOString().split('T')[0];
        const todayReading = state.dailyReadings.find(d => d.date === today);
        if (todayReading) {
          todayReading.pagesRead += state.currentSession.pagesRead;
          todayReading.readingTime += sessionMinutes;
          if (!todayReading.booksRead.includes(state.currentSession.bookId)) {
            todayReading.booksRead.push(state.currentSession.bookId);
          }
        } else {
          state.dailyReadings.push({
            date: today,
            pagesRead: state.currentSession.pagesRead,
            readingTime: sessionMinutes,
            booksRead: [state.currentSession.bookId],
          });
        }

        state.currentSession = null;
        recalculateStats(state);
      }
    },
    setSessions(state, action: PayloadAction<ReadingSession[]>) {
      state.sessions = action.payload;
      recalculateStats(state);
    },
    setDailyReadings(state, action: PayloadAction<DailyReading[]>) {
      state.dailyReadings = action.payload;
      recalculateStats(state);
    },
    incrementBooksRead(state) {
      state.stats.totalBooksRead += 1;
    },
    resetStats(state) {
      state.sessions = [];
      state.dailyReadings = [];
      state.stats = initialState.stats;
    },
  },
});

function recalculateStats(state: ReadingState) {
  const readings = state.dailyReadings;
  if (readings.length === 0) return;

  const totalDays = readings.length;
  state.stats.averagePagesPerDay = state.stats.totalPagesRead / totalDays;
  state.stats.averageReadingTimePerDay = state.stats.totalReadingTime / totalDays;

  // Calculate streak
  const sorted = [...readings].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedStr = expected.toISOString().split('T')[0];
    if (sorted[i]?.date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }
  state.stats.currentStreak = streak;
  if (streak > state.stats.longestStreak) {
    state.stats.longestStreak = streak;
  }
}

export const {
  startSession, endSession, setSessions, setDailyReadings,
  incrementBooksRead, resetStats,
} = readingSlice.actions;

export default readingSlice.reducer;
