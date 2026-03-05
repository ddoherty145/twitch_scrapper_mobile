import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/store/store_index';
import AppNavigator from './src/navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setFavorites, Clip } from './src/store/clipSlice';
import { setDarkMode } from './src/store/settingSlice';

export default function App() {
  // Restore persisted state on launch
  useEffect(() => {
    const hydrate = async () => {
      try {
        const favoritesJson = await AsyncStorage.getItem('favorites');
        if (favoritesJson) {
          const favorites: Clip[] = JSON.parse(favoritesJson);
          store.dispatch(setFavorites(favorites));
        }

        const darkModeJson = await AsyncStorage.getItem('darkMode');
        if (darkModeJson !== null) {
          store.dispatch(setDarkMode(JSON.parse(darkModeJson)));
        }
      } catch (e) {
        console.warn('Failed to hydrate state from storage', e);
      }
    };

    hydrate();
  }, []);

  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}