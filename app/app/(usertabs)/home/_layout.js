import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="Home" options={{ headerShown: false }} />
       <Stack.Screen name="Addbooking" options={{ headerShown: false }} />
    </Stack>
  );
}
