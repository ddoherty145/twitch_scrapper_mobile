import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

type TabIconProps = {
  label: string;
  focused: boolean;
};

const Tab = createBottomTabNavigator();

// Temporary placeholder implementations so TypeScript and navigation compile.
const TabIcon: React.FC<TabIconProps> = ({ label, focused }) => (
  <View>
    <Text>{label}</Text>
  </View>
);

const HomeStackNavigator: React.FC = () => <View />;
const GamesStackNavigator: React.FC = () => <View />;
const HighlightsStackNavigator: React.FC = () => <View />;
const AboutScreen: React.FC = () => <View />;

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a2e',
          borderTopColor: '#6441a5',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 6,
          height: 65,
        },
        tabBarActiveTintColor: '#9b72cf',
        tabBarInactiveTintColor: '#888888',
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Games" component={GamesStackNavigator} />
      <Tab.Screen name="Highlights" component={HighlightsStackNavigator} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;