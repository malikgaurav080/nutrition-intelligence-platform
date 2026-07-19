import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DailyLog, LoggedFood, FoodItem } from '../types/nutrition.types';
import { EMPTY_DAILY_LOG } from '../types/nutrition.types';
import { VEGETARIAN_FOODS } from '../data/foodDatabase';
import { useUser } from './UserContext';

interface NutritionContextType {
  todayLog: DailyLog;
  activeDate: string;
  loading: boolean;
  error: string | null;
  changeDate: (date: string) => Promise<void>;
  logFood: (slot: LoggedFood['slot'], foodId: string, loggedQty: number) => Promise<boolean>;
  removeFood: (slot: LoggedFood['slot'], foodId: string) => Promise<boolean>;
  updateWater: (amountMl: number) => Promise<boolean>;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useUser();
  const [activeDate, setActiveDate] = useState<string>(getLocalDateString());
  const [todayLog, setTodayLog] = useState<DailyLog>(EMPTY_DAILY_LOG(activeDate));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch log from API
  const fetchLog = useCallback(async (dateStr: string) => {
    const token = sessionStorage.getItem('token');
    if (!token || !currentUser) {
      setTodayLog(EMPTY_DAILY_LOG(dateStr));
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/logs/${dateStr}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTodayLog(data);
      } else {
        setTodayLog(EMPTY_DAILY_LOG(dateStr));
      }
    } catch (err) {
      console.error('Error fetching nutrition log', err);
      setError('Failed to load log details');
      setTodayLog(EMPTY_DAILY_LOG(dateStr));
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Load log on user auth or date changes
  useEffect(() => {
    fetchLog(activeDate);
  }, [activeDate, fetchLog]);

  const changeDate = async (dateStr: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      setActiveDate(dateStr);
    }
  };

  const logFood = async (slot: LoggedFood['slot'], foodId: string, loggedQty: number) => {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    const food = VEGETARIAN_FOODS.find(f => f.id === foodId);
    if (!food) return false;

    // Multiply macros/micros by qty multiplier
    const multiplyMacros = (m: FoodItem['macros'], q: number) => ({
      calories: Math.round(m.calories * q),
      protein: Math.round(m.protein * q * 10) / 10,
      carbs: Math.round(m.carbs * q * 10) / 10,
      fat: Math.round(m.fat * q * 10) / 10,
      fiber: Math.round(m.fiber * q * 10) / 10,
    });

    const multiplyMicros = (m: FoodItem['micros'], q: number) => ({
      vitA: Math.round(m.vitA * q * 10) / 10,
      vitC: Math.round(m.vitC * q * 10) / 10,
      vitD: Math.round(m.vitD * q * 10) / 10,
      vitE: Math.round(m.vitE * q * 10) / 10,
      vitB12: Math.round(m.vitB12 * q * 10) / 10,
      calcium: Math.round(m.calcium * q * 10) / 10,
      iron: Math.round(m.iron * q * 10) / 10,
      zinc: Math.round(m.zinc * q * 10) / 10,
      magnesium: Math.round(m.magnesium * q * 10) / 10,
      potassium: Math.round(m.potassium * q * 10) / 10,
      folate: Math.round(m.folate * q * 10) / 10,
      omega3: Math.round(m.omega3 * q * 10) / 10,
    });

    try {
      const payload = {
        date: activeDate,
        slot,
        foodId,
        name: food.name,
        servingSize: food.servingSize,
        servingUnit: food.servingUnit,
        baseQty: food.baseQty,
        loggedQty,
        macros: multiplyMacros(food.macros, loggedQty),
        micros: multiplyMicros(food.micros, loggedQty),
      };

      const response = await fetch('/api/logs/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const updatedLog = await response.json();
        setTodayLog(updatedLog);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error logging food', err);
      return false;
    }
  };

  const removeFood = async (slot: LoggedFood['slot'], foodId: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`/api/logs/food/${activeDate}/${slot}/${foodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedLog = await response.json();
        setTodayLog(updatedLog);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error removing food log', err);
      return false;
    }
  };

  const updateWater = async (amountMl: number) => {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch('/api/logs/water', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: activeDate,
          waterConsumed: amountMl
        })
      });

      if (response.ok) {
        const updatedLog = await response.json();
        setTodayLog(updatedLog);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error logging water', err);
      return false;
    }
  };

  return (
    <NutritionContext.Provider
      value={{
        todayLog,
        activeDate,
        loading,
        error,
        changeDate,
        logFood,
        removeFood,
        updateWater
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
};
