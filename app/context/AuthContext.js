import { createContext, useState, useContext, useEffect } from 'react';
import { API } from '../api/api';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthenticatedContext = createContext();

export const AuthenticatedProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  const handleCurrentUserInfo = async () => {
    try {
      const response = await API.currentUserInfo();
      console.log("CURRENT USER DETAILS", response.data)
    } catch (error) {
      if(error.message === "Invalid token"){
        await AsyncStorage.removeItem('Authorization');
        router.navigate('/(auth)/Login');
      }
    }
  }

  const handleLogoutUser = async () => {
     await AsyncStorage.removeItem('Authorization');
    router.navigate('/(auth)/Login');
  }

  useEffect(()=>{
    handleCurrentUserInfo();
  },[])


  return (
    <AuthenticatedContext.Provider value={{ isLoading, setIsLoading, handleLogoutUser }}>
      {children}
    </AuthenticatedContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthenticatedContext);
