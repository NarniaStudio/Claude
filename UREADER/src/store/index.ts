import { configureStore } from '@reduxjs/toolkit';
import bookReducer from './bookSlice';
import settingsReducer from './settingsSlice';
import readingReducer from './readingSlice';
import syncReducer from './syncSlice';

export const store = configureStore({
  reducer: {
    books: bookReducer,
    settings: settingsReducer,
    reading: readingReducer,
    sync: syncReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
