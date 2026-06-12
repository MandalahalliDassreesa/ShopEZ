import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Configure axios default auth header if token exists
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setAuthHeader(parsedUser.token);
          
          // Verify token and fetch latest profile
          const { data } = await axios.get(`${API_BASE_URL}/auth/profile`);
          // Maintain token from local storage
          const updatedUser = { ...data, token: parsedUser.token };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Set recently viewed products
          setRecentlyViewed(updatedUser.recentlyViewed || []);
        } catch (error) {
          console.error('Session expired or connection failed:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    setAuthHeader(data.token);
    
    // Fetch user profile to get address details and recently viewed products
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`);
    const fullUserData = { ...profileResponse.data, token: data.token };
    setUser(fullUserData);
    localStorage.setItem('user', JSON.stringify(fullUserData));
    setRecentlyViewed(fullUserData.recentlyViewed || []);
    return fullUserData;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post(`${API_BASE_URL}/auth/register`, { name, email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    setAuthHeader(data.token);
    
    // Fetch full profile (addresses, recentlyViewed)
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`);
    const fullUserData = { ...profileResponse.data, token: data.token };
    setUser(fullUserData);
    localStorage.setItem('user', JSON.stringify(fullUserData));
    setRecentlyViewed(fullUserData.recentlyViewed || []);
    return fullUserData;
  };

  const logout = () => {
    setUser(null);
    setRecentlyViewed([]);
    localStorage.removeItem('user');
    setAuthHeader(null);
  };

  const updateProfile = async (profileData) => {
    const { data } = await axios.put(`${API_BASE_URL}/auth/profile`, profileData);
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAuthHeader(updatedUser.token);
    return updatedUser;
  };

  const addAddress = async (addressData) => {
    const { data } = await axios.post(`${API_BASE_URL}/auth/addresses`, addressData);
    const updatedUser = { ...user, addresses: data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return data;
  };

  const updateAddress = async (addressId, addressData) => {
    const { data } = await axios.put(`${API_BASE_URL}/auth/addresses/${addressId}`, addressData);
    const updatedUser = { ...user, addresses: data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return data;
  };

  const deleteAddress = async (addressId) => {
    const { data } = await axios.delete(`${API_BASE_URL}/auth/addresses/${addressId}`);
    const updatedUser = { ...user, addresses: data };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return data;
  };

  const trackRecentlyViewed = async (productId) => {
    if (!user) return;
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/recently-viewed`, { productId });
      setRecentlyViewed(data);
    } catch (error) {
      console.error('Error tracking recently viewed:', error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        recentlyViewed,
        trackRecentlyViewed
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
