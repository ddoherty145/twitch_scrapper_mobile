import React from 'react';
import { View, Text } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/homeScreen';
import GamesScreen from '../screens/gameScreen';

const Drawer = createDrawerNavigator();

// Temporary placeholder implementations so TypeScript and navigation compile.
const HighlightsStackNavigator: React.FC = () => (
  <View>
    <Text>Highlights</Text>
  </View>
);
const AboutScreen: React.FC = () => (
  <View>
    <Text>About</Text>
  </View>
);

const AppNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#ffffff',
        drawerStyle: { backgroundColor: '#1a1a2e' },
        drawerActiveTintColor: '#9b72cf',
        drawerInactiveTintColor: '#ffffff',
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="Games" component={GamesScreen} />
      <Drawer.Screen name="Highlights" component={HighlightsStackNavigator} />
      <Drawer.Screen name="About" component={AboutScreen} />
    </Drawer.Navigator>
  );
};

export default AppNavigator;