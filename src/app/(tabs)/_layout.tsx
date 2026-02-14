import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#6C5CE7', headerShown: false }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Home', 
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="analysis" 
        options={{ 
          title: 'Insights', 
          tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={24} color={color} /> 
        }} 
      />
      <Tabs.Screen 
        name="community" 
        options={{ 
          title: 'Tribes', 
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} /> 
        }} 
      />
    </Tabs>
  );
}