import React, { createContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUserTokens, setCurrentUserTokens] = useState(AuthService.getCurrentUserTokens());
  const [currentUserProfile, setCurrentUserProfile] = useState(AuthService.getCurrentUserProfileData());
  const [loadingAuth, setLoadingAuth] = useState(true);

  const updateUserState = useCallback(() => {
    const tokens = AuthService.getCurrentUserTokens();
    const profile = AuthService.getCurrentUserProfileData();
    setCurrentUserTokens(tokens);
    setCurrentUserProfile(profile);
    setLoadingAuth(false);
  }, []);

  useEffect(() => {
    updateUserState(); // Initial check

    const handleStorageChange = () => { // Sync across tabs
      updateUserState();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateUserState]);

  const login = async (username, password) => {
    setLoadingAuth(true);
    try {
      const userProfile = await AuthService.login(username, password);
      updateUserState(); // Update state after successful login
      return userProfile;
    } catch (error) {
      updateUserState(); // Ensure loadingAuth is set to false even on error
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    updateUserState(); // Update state after logout
  };

  const signup = async (username, email, password) => {
    return AuthService.register(username, email, password);
  };

  const value = {
    currentUserTokens,
    currentUser: currentUserProfile,
    isAuthenticated: !!currentUserTokens && !!currentUserProfile,
    login,
    logout,
    signup,
    loadingAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;