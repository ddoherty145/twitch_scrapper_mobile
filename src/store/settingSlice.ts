import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  darkMode: boolean;
  englishOnly: boolean;
  defaultDaysBack: number;
  defaultLimit: number;
}

const initialState: SettingsState = {
  darkMode: false,
  englishOnly: true,
  defaultDaysBack: 1,
  defaultLimit: 150,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
    },
    toggleEnglishOnly(state) {
      state.englishOnly = !state.englishOnly;
    },
    setDefaultDaysBack(state, action: PayloadAction<number>) {
      state.defaultDaysBack = action.payload;
    },
    setDefaultLimit(state, action: PayloadAction<number>) {
      state.defaultLimit = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  toggleEnglishOnly,
  setDefaultDaysBack,
  setDefaultLimit,
} = settingsSlice.actions;

export default settingsSlice.reducer;