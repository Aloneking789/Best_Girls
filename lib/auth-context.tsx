'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getUserData } from './api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<{
    isAuthenticated: boolean;
    user: any | null;
    loading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check auth on mount
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const user = getUserData();

      setState({
        isAuthenticated: authenticated,
        user,
        loading: false,
      });

      // Redirect to login if not authenticated and not on login page
      if (!authenticated && pathname !== '/login' && typeof window !== 'undefined') {
        router.push('/login');
      }
    };

    checkAuth();

    // Prevent browser back button after logout
    const handlePopState = (e: PopStateEvent) => {
      const authenticated = isAuthenticated();
      if (!authenticated) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Push a new state to prevent back navigation
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, router]);

  const logout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('kvgittoken');
    localStorage.removeItem('kvgituser');

    // Clear cookies
    document.cookie = 'kvgittoken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

    setState({
      isAuthenticated: false,
      user: null,
      loading: false,
    });

    // Clear browser history
    window.history.go(-(window.history.length - 1));

    // Redirect to login
    setTimeout(() => {
      router.push('/login');
    }, 100);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        loading: state.loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
