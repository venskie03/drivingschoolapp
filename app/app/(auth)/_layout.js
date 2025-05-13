
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="Login"
        options={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // This hides the tab bar
        }}
      />
         <Stack.Screen
        name="Register"
        options={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // This hides the tab bar
        }}
      />
    </Stack>
  );
}