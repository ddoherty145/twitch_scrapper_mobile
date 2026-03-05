import { configureStore } from '@reduxjs/toolkit';
import clipsReducer from './clipSlice';
import settingsReducer from './settingSlice';

export const store = configureStore({
  reducer: {
    clips: clipsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;