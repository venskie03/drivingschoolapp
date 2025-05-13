import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="Time" options={{ headerShown: false }} />
      <Stack.Screen name="Bulk" options={{ headerShown: false }} />
      <Stack.Screen name="Addmanually" options={{ headerShown: false }} />
    </Stack>
  );
}
