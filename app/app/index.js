import { useEffect, useState } from 'react';
import SplashScreen from './Splashscreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import 'expo-dev-client';

const Index = () => {
  const [isShowSplashScreen, setIsShowSplashScreen] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('Authorization');

      // 👇 Add 2-second delay before navigating
      setTimeout(() => {
        if (token) {
          router.push('/(usertabs)/home/Home');
        } else {
          router.push('/(auth)/Login');
        }
        setIsShowSplashScreen(false);
      }, 2000); // 2000 ms = 2 seconds

    } catch (error) {
      console.log('Auth check error:', error);
      setIsShowSplashScreen(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      {isShowSplashScreen ? <SplashScreen /> : null}
    </>
  );
};

export default Index;
