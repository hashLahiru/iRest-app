import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        // Hide tab bar on 'index' and 'login' screens
        tabBarStyle: ['index', 'login', 'home', 'table', 'steward', 'mainbilling', 'billScreen', 'payment', 'print', 'delivery', 'customproduct', 'deliverydetails', 'daysummary', 'saleshistory',
          'takeaway', 'profile'
        ].includes(route.name)
          ? { display: 'none' }
          : Platform.select({
              ios: {
                position: 'absolute',
              },
              default: {},
            }),
      })}
    />
  );
}
