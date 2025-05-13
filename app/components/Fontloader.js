import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { useFonts } from 'expo-font';

const FontLoader = ({ children }) => {
  const [fontsLoaded] = useFonts({
    PoppinsMedium: require('../assets/fonts/Poppins-Medium.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    PoppinsExtra: require('../assets/fonts/Poppins-ExtraBold.ttf'),
    PoppinsThin: require('../assets/fonts/Poppins-Light.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <>{children}</>;
};

export default FontLoader;
