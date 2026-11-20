import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { User } from '../data/users';
import { apiClient, getApiErrorMessage } from '../services/apiClient';

type UserRole = User['role'];
type ProfileUpdates = Pick<Partial<User>, 'name' | 'email' | 'phone'>;

interface BackendUser {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  photo?: string;
  phone?: string;
  createdAt?: string;
  wishlist?: Array<string | { _id?: string; id?: string }>;
}

const isUserRole = (role: string | undefined): role is UserRole =>
  role === 'user' || role === 'guide' || role === 'lead-guide' || role === 'admin';

const normalizeUser = (backendUser: BackendUser): User => ({
  id: String(backendUser._id || backendUser.id || ''),
  name: backendUser.name || '',
  email: backendUser.email || '',
  role: isUserRole(backendUser.role) ? backendUser.role : 'user',
  photo: backendUser.photo
    ? backendUser.photo.startsWith('http') || backendUser.photo.startsWith('/')
      ? backendUser.photo
      : `/img/users/${encodeURIComponent(backendUser.photo)}`
    : '/img/users/default.jpg',
  phone: backendUser.phone,
  joinedAt: backendUser.createdAt?.slice(0, 10) || '',
  wishlist: (backendUser.wishlist || []).map((item) =>
    typeof item === 'string' ? item : String(item._id || item.id || '')
  ).filter(Boolean),
  active: true
});

interface AuthContextType {
  user: User | null;
  role: 'guest' | 'user' | 'guide' | 'lead-guide' | 'admin';
  isAuthenticated: boolean;
  loading: boolean;
  authError: string | null;
  login: (email: string, pass: string) => Promise<User>;
  register: (details: { name: string; email: string; phone: string; password: string; passwordConfirm: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updates: ProfileUpdates, profilePhoto?: Blob) => Promise<void>;
  toggleWishlist: (itemId: string) => Promise<void>;
  isWishlisted: (itemId: string) => boolean;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await apiClient.get<{ data?: { data?: BackendUser } }>('/users/me');
      const backendUser = response.data?.data?.data;
      if (!backendUser?._id && !backendUser?.id) {
        throw new Error('The server returned an invalid session profile.');
      }
      const normalized = normalizeUser(backendUser);
      setUser(normalized);
      setAuthError(null);
      return normalized;
    } catch (error) {
      setUser(null);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setAuthError(null);
      } else {
        setAuthError(getApiErrorMessage(error, 'Unable to verify your sign-in session.'));
      }
      return null;
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem('sarthi_auth_current_user');
    localStorage.removeItem('sarthi_has_backend_session');
    let active = true;
    refreshUser().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [refreshUser]);

  const login = async (email: string, pass: string): Promise<User> => {
    try {
      const response = await apiClient.post<{ data?: { user?: BackendUser } }>('/users/login', {
        email,
        password: pass
      });
      const backendUser = response.data?.data?.user;
      if (!backendUser?._id && !backendUser?.id) {
        throw new Error('The server returned an invalid sign-in response.');
      }
      const loggedUser = normalizeUser(backendUser);
      setUser(loggedUser);
      setAuthError(null);
      return loggedUser;
    } catch (error) {
      setUser(null);
      throw new Error(getApiErrorMessage(error, 'Sign in failed.'));
    }
  };

  const register = async (details: {
    name: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirm: string;
  }): Promise<User> => {
    try {
      const response = await apiClient.post<{ data?: { user?: BackendUser } }>('/users/signup', details);
      const backendUser = response.data?.data?.user;
      if (!backendUser?._id && !backendUser?.id) {
        throw new Error('The server returned an invalid registration response.');
      }
      const newUser = normalizeUser(backendUser);
      setUser(newUser);
      setAuthError(null);
      return newUser;
    } catch (error) {
      setUser(null);
      throw new Error(getApiErrorMessage(error, 'Account registration failed.'));
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/users/logout');
    } catch (error) {
      if (!(axios.isAxiosError(error) && error.response?.status === 401)) {
        throw new Error(getApiErrorMessage(error, 'Sign out could not be confirmed by the server.'));
      }
    } finally {
      setUser(null);
      setAuthError(null);
      localStorage.removeItem('sarthi_auth_current_user');
      localStorage.removeItem('sarthi_has_backend_session');
    }
  };

  const updateUser = async (updates: ProfileUpdates, profilePhoto?: Blob) => {
    if (!user) throw new Error('Sign in to update your profile.');
    let updateData: ProfileUpdates | FormData = updates;
    if (profilePhoto) {
      const formData = new FormData();
      formData.append('name', updates.name || '');
      formData.append('email', updates.email || '');
      formData.append('phone', updates.phone || '');
      formData.append('photo', profilePhoto, 'profile-picture.jpg');
      updateData = formData;
    }
    const response = await apiClient.patch<{ data?: { user?: BackendUser } }>('/users/updateMe', updateData);
    const updatedUser = response.data?.data?.user;
    if (!updatedUser?._id && !updatedUser?.id) {
      throw new Error('The server returned an invalid profile response.');
    }
    setUser(normalizeUser(updatedUser));
  };

  const toggleWishlist = async (itemId: string) => {
    if (!user) throw new Error('Sign in to save tours to your wishlist.');
    const list = user.wishlist || [];
    const exists = list.includes(itemId);
    const response = exists
      ? await apiClient.delete<{ data?: { data?: Array<{ _id?: string; id?: string }> } }>(`/users/wishlist/${encodeURIComponent(itemId)}`)
      : await apiClient.post<{ data?: { data?: Array<{ _id?: string; id?: string }> } }>(`/users/wishlist/${encodeURIComponent(itemId)}`);
    const wishlist = response.data?.data?.data || [];
    setUser((currentUser) =>
      currentUser
        ? { ...currentUser, wishlist: wishlist.map((tour) => String(tour._id || tour.id || '')).filter(Boolean) }
        : currentUser
    );
  };

  const isWishlisted = (itemId: string) => {
    return !!user?.wishlist?.includes(itemId);
  };

  const role = user ? user.role : 'guest';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        loading,
        authError,
        login,
        register,
        logout,
        updateUser,
        toggleWishlist,
        isWishlisted,
        refreshUser
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
