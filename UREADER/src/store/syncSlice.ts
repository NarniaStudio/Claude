import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SyncState {
  isSyncing: boolean;
  lastSyncAt: number | null;
  syncError: string | null;
  userId: string | null;
  deviceId: string | null;
  isLoggedIn: boolean;
  pendingChanges: number;
}

const initialState: SyncState = {
  isSyncing: false,
  lastSyncAt: null,
  syncError: null,
  userId: null,
  deviceId: null,
  isLoggedIn: false,
  pendingChanges: 0,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setSyncing(state, action: PayloadAction<boolean>) {
      state.isSyncing = action.payload;
      if (action.payload) state.syncError = null;
    },
    setSyncSuccess(state) {
      state.isSyncing = false;
      state.lastSyncAt = Date.now();
      state.syncError = null;
      state.pendingChanges = 0;
    },
    setSyncError(state, action: PayloadAction<string>) {
      state.isSyncing = false;
      state.syncError = action.payload;
    },
    setUserId(state, action: PayloadAction<string>) {
      state.userId = action.payload;
    },
    setDeviceId(state, action: PayloadAction<string>) {
      state.deviceId = action.payload;
    },
    setLoggedIn(state, action: PayloadAction<boolean>) {
      state.isLoggedIn = action.payload;
    },
    incrementPendingChanges(state) {
      state.pendingChanges += 1;
    },
    clearSyncState(state) {
      state.isSyncing = false;
      state.lastSyncAt = null;
      state.syncError = null;
      state.userId = null;
      state.isLoggedIn = false;
      state.pendingChanges = 0;
    },
  },
});

export const {
  setSyncing, setSyncSuccess, setSyncError,
  setUserId, setDeviceId, setLoggedIn,
  incrementPendingChanges, clearSyncState,
} = syncSlice.actions;

export default syncSlice.reducer;
