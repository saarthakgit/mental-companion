import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        // 1. COLORS
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        
        // 2. BACKGROUND STYLE
        tabBarStyle: {
          backgroundColor: theme.colors.secondaryContainer, // Soft Secondary
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },

        // 3. FONT STYLING
        tabBarLabelStyle: {
          fontFamily: 'Code', 
          fontSize: 10,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'HOME', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          ) 
        }} 
      />
      
      {/* --- NEW JOURNAL TAB --- */}
      <Tabs.Screen 
        name="journals" 
        options={{ 
          title: 'JOURNAL', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "journal" : "journal-outline"} size={24} color={color} />
          ) 
        }} 
      />

      <Tabs.Screen 
        name="analysis" 
        options={{ 
          title: 'INSIGHTS', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "bar-chart" : "bar-chart-outline"} size={24} color={color} />
          ) 
        }} 
      />
      <Tabs.Screen 
        name="community" 
        options={{ 
          title: 'TRIBE', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ) 
        }} 
      />
    </Tabs>
  );
}