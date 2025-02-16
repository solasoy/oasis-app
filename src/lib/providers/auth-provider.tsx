"use client";

import React from 'react';
import { AuthContext } from '@/lib/context/auth-context';
import { useAuth } from '@/lib/hooks/useAuth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}