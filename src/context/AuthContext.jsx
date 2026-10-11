import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient } from '../services/supabaseClient';
import { signIn as authSignIn, signUp as authSignUp, signOut as authSignOut, getCurrentUserSession } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSessionAndProfile = async () => {
    try {
      const data = await getCurrentUserSession();
      setSession(data.session);
      setUser(data.user);
      setProfile(data.profile);
      setRole(data.role);
    } catch (err) {
      console.warn('Auth state check error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionAndProfile();

    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          // Fetch updated profile
          supabase.from('profiles').select('*').eq('id', newSession.user.id).single()
            .then(({ data }) => {
              if (data) {
                setProfile(data);
                setRole(data.role);
              }
            });
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setRole(null);
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  const signIn = async (credentials) => {
    const result = await authSignIn(credentials);
    setSession(result.session);
    setUser(result.user);
    setProfile(result.profile);
    setRole(result.role);
    return result;
  };

  const signUp = async (details) => {
    return await authSignUp(details);
  };

  const signOut = async () => {
    await authSignOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    await fetchSessionAndProfile();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
