import { Stack } from "expo-router";
// import { AuthenticatedProvider } from '../context/Authenticateduser';
import FontLoader from "../components/Fontloader";
import { SafeAreaView } from "react-native";
import "../global.css";
import Lodingscreen from "../components/LoadingScreen";
import { AuthenticatedProvider } from "../context/AuthContext";

const StackLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      {/* <Stack.Screen name="splashscreen" options={{ headerShown: false }} /> */}
      <Stack.Screen name="(coachtabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(usertabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <AuthenticatedProvider>
      <FontLoader>
        <SafeAreaView style={{ flex: 1 }}>
          {/* <Error/> */}
          <Lodingscreen />
          <StackLayout />
        </SafeAreaView>
      </FontLoader>
    </AuthenticatedProvider>
  );
};

export default RootLayout;
