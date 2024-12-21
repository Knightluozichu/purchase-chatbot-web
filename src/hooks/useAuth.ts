import { useState } from 'react';
import { User, LoginFormData, RegisterFormData } from '../types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginFormData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Login data being sent:', data);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Registration data being sent:', data);
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Registration failed');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      console.error('Registration error:', err);
      await logRegistrationErrorToSupabase(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const logRegistrationErrorToSupabase = async (error: any) => {
    try {
      console.log('Logging registration error to Supabase:', error.message);
      const response = await fetch('/api/logRegistrationError', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error.message }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to log error to Supabase:', errorText);
      }
    } catch (logError) {
      console.error('Error logging to Supabase:', logError);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
}
