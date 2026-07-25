import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { calculateTargets } from '../engine/calculateTargets';
import { getRDA } from '../data/rdaTable';
import type { NutritionTargets, MicroRDA } from '../types/nutrition.types';

export interface User {
  id: string;
  name: string;
  email: string;
  dob: string;
  gender: 'Male' | 'Female';
  height: number;
  weight: number;
  activityLevel: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Athlete';
  pregnancyStatus: {
    isPregnant: boolean;
    isBreastfeeding: boolean;
  };
  primaryGoal: 'Fat Loss' | 'Muscle Build' | 'Maintain Weight' | 'Athletic Performance' | 'General Wellness';
  healthPriorities: string[];
  dietType: 'Pure Vegetarian' | 'Lacto-Vegetarian' | 'Ovo-Vegetarian' | 'Vegan';
  dietaryRestrictions: string[];
}

interface UserContextType {
  currentUser: User | null;
  /** Computed daily macro targets, populated after authentication */
  nutritionTargets: NutritionTargets | null;
  /** Personalised RDA values, populated after authentication */
  microRDA: MicroRDA | null;
  loading: boolean;
  error: string | null;
  registerUser: (userData: Omit<User, 'id'> & { password?: string }) => Promise<boolean>;
  loginUser: (credentials: { email: string; password?: string }) => Promise<boolean>;
  logoutUser: () => void;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

/** Derives nutrition targets + RDA from a resolved User object */
function deriveTargets(user: User): { targets: NutritionTargets; rda: MicroRDA } {
  const dob = new Date(user.dob);
  const age = Math.floor((Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25));

  const targets = calculateTargets({
    age,
    gender: user.gender,
    weight: user.weight,
    height: user.height,
    activityLevel: user.activityLevel,
    primaryGoal: user.primaryGoal,
    pregnancyStatus: user.pregnancyStatus,
  });

  const rda = getRDA({
    age,
    gender: user.gender,
    isPregnant: user.pregnancyStatus.isPregnant,
    isBreastfeeding: user.pregnancyStatus.isBreastfeeding,
  });

  return { targets, rda };
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [nutritionTargets, setNutritionTargets] = useState<NutritionTargets | null>(null);
  const [microRDA, setMicroRDA] = useState<MicroRDA | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const hasFetchedRef = useRef(false);

  // Check for existing token and load user profile on mount
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const loadUser = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          const user: User = {
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            dob: userData.dob,
            gender: userData.gender,
            height: userData.height,
            weight: userData.weight,
            activityLevel: userData.activityLevel,
            pregnancyStatus: userData.pregnancyStatus,
            primaryGoal: userData.primaryGoal,
            healthPriorities: userData.healthPriorities,
            dietType: userData.dietType,
            dietaryRestrictions: userData.dietaryRestrictions,
          };
          setCurrentUser(user);
          const { targets, rda } = deriveTargets(user);
          setNutritionTargets(targets);
          setMicroRDA(rda);
        } else {
          // Token is invalid/expired
          sessionStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Failed to load user session', err);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const registerUser = async (userData: Omit<User, 'id'> & { password?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      sessionStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      const { targets, rda } = deriveTargets(data.user);
      setNutritionTargets(targets);
      setMicroRDA(rda);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setLoading(false);
      return false;
    }
  };

  const loginUser = async (credentials: { email: string; password?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      sessionStorage.setItem('token', data.token);
      setCurrentUser(data.user);
      const { targets: loginTargets, rda: loginRDA } = deriveTargets(data.user);
      setNutritionTargets(loginTargets);
      setMicroRDA(loginRDA);
      setLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setLoading(false);
      return false;
    }
  };

  const logoutUser = () => {
    sessionStorage.removeItem('token');
    setCurrentUser(null);
    setNutritionTargets(null);
    setMicroRDA(null);
  };

  const clearError = () => setError(null);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        nutritionTargets,
        microRDA,
        loading,
        error,
        registerUser,
        loginUser,
        logoutUser,
        clearError
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
