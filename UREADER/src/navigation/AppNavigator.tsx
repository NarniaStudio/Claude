import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { getTheme } from '../theme';

import { LibraryScreen } from '../screens/LibraryScreen';
import { EpubReaderScreen } from '../screens/EpubReaderScreen';
import { PdfReaderScreen } from '../screens/PdfReaderScreen';
import { BookDetailsScreen } from '../screens/BookDetailsScreen';
import { BookmarksScreen } from '../screens/BookmarksScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CollectionsScreen } from '../screens/CollectionsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const LibraryTab: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LibraryMain" component={LibraryScreen} />
    </Stack.Navigator>
  );
};

const CollectionsTab: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CollectionsMain" component={CollectionsScreen} />
    </Stack.Navigator>
  );
};

const StatsTab: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StatsMain" component={StatisticsScreen} />
    </Stack.Navigator>
  );
};

const SettingsTab: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

const TabNavigator: React.FC = () => {
  const readerSettings = useSelector((state: RootState) => state.settings.reader);
  const theme = getTheme(readerSettings.theme);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.secondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Library"
        component={LibraryTab}
        options={{
          tabBarLabel: 'ספרייה',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>{'📚'}</Text>,
        }}
      />
      <Tab.Screen
        name="Collections"
        component={CollectionsTab}
        options={{
          tabBarLabel: 'אוספים',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>{'📂'}</Text>,
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatsTab}
        options={{
          tabBarLabel: 'סטטיסטיקות',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>{'📊'}</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsTab}
        options={{
          tabBarLabel: 'הגדרות',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>{'⚙️'}</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="EpubReader"
          component={EpubReaderScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="PdfReader"
          component={PdfReaderScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="BookDetails" component={BookDetailsScreen} />
        <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
