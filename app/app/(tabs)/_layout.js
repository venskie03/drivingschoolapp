import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#4f46e5', // Indigo-600
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb', // Tailwind's gray-200
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
       
      })}
    >
      <Tabs.Screen name="Home" />
      <Tabs.Screen name="time" />
      <Tabs.Screen name="Settings" />
    </Tabs>
  );
};

export default TabLayout;
