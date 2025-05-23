import axios from 'axios';
import authHeader from '../utils/authHeader';

const API_URL = '/api/';

const register = (username, email, password) => {
  return axios.post(API_URL + 'users/register/', { username, email, password });
};

const login = (username, password) => {
  return axios
    .post(API_URL + 'token/', { username, password })
    .then((response) => {
      if (response.data.access && response.data.username) {
        localStorage.setItem('userTokens', JSON.stringify({ access: response.data.access, refresh: response.data.refresh }));
        const userProfile = { id: response.data.id, username: response.data.username, email: response.data.email };
        localStorage.setItem('userFullProfile', JSON.stringify(userProfile));
        return userProfile;
      } else {
        throw new Error("Login response did not contain necessary user data or tokens.");
      }
    });
};

const logout = () => {
  localStorage.removeItem('userTokens');
  localStorage.removeItem('userFullProfile');
};

const getCurrentUserTokens = () => {
  const tokens = localStorage.getItem('userTokens');
  return tokens ? JSON.parse(tokens) : null;
};

const getCurrentUserProfileData = () => {
  const profile = localStorage.getItem('userFullProfile');
  return profile ? JSON.parse(profile) : null;
};

const changePassword = (oldPassword, newPassword) => {
  return axios.post(
    API_URL + 'users/change-password/',
    { old_password: oldPassword, new_password: newPassword },
    { headers: authHeader() }
  );
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUserTokens,
  getCurrentUserProfileData,
  changePassword,
};

export default AuthService;