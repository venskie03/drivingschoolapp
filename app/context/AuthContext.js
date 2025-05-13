import { createContext, useState, useContext } from 'react';


export const AuthenticatedContext = createContext();

export const AuthenticatedProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);


  return (
    <AuthenticatedContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </AuthenticatedContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthenticatedContext);
