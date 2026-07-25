import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DailyLog, LoggedFood, SavedMealPlan } from '../types/nutrition.types';
import { EMPTY_DAILY_LOG } from '../types/nutrition.types';
import { VEGETARIAN_FOODS } from '../data/foodDatabase';
import { useUser } from './UserContext';

interface NutritionContextType {
  todayLog: DailyLog;
  activeDate: string;
  loading: boolean;
  error: string | null;
  changeDate: (date: string) => Promise<void>;
  logFood: (slot: LoggedFood['slot'], foodId: string, loggedQty: number, customFoodItem?: any) => Promise<boolean>;
  removeFood: (slot: LoggedFood['slot'], foodId: string) => Promise<boolean>;
  updateWater: (amountMl: number) => Promise<boolean>;
  logBulkFoods: (meals: Omit<LoggedFood, 'userId'>[]) => Promise<boolean>;

  // Custom Diet plans
  savedPlans: SavedMealPlan[];
  activePlan: SavedMealPlan | null;
  fetchMealPlans: () => Promise<void>;
  saveMealPlan: (
    name: string,
    meals: any[],
    planDeficiencies: string[],
    adjustments: any[],
    overwriteId?: string
  ) => Promise<{ success: boolean; error?: string; existingPlans?: { id: string; name: string }[] }>;
  setActiveMealPlan: (id: string) => Promise<boolean>;
  deleteMealPlan: (id: string) => Promise<boolean>;
  logSlotFromPlan: (slot: LoggedFood['slot'], items: any[]) => Promise<boolean>;
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

  // Custom plans state
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>([]);
  const [activePlan, setActivePlan] = useState<SavedMealPlan | null>(null);

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

  // Fetch Saved Plans from API
  const fetchMealPlans = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('/api/meal-plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedPlans(data);
        const active = data.find((p: any) => p.isActive) || null;
        setActivePlan(active);
      }
    } catch (err) {
      console.error('Error fetching meal plans', err);
    }
  }, []);

  // Load log & plans on date / user change
  useEffect(() => {
    fetchLog(activeDate);
  }, [activeDate, fetchLog]);

  useEffect(() => {
    if (currentUser) {
      fetchMealPlans();
    } else {
      setSavedPlans([]);
      setActivePlan(null);
    }
  }, [currentUser, fetchMealPlans]);

  const changeDate = async (dateStr: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      setActiveDate(dateStr);
    }
  };

  const logFood = async (slot: LoggedFood['slot'], foodId: string, loggedQty: number, customFoodItem?: any) => {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    const foodItem = customFoodItem || VEGETARIAN_FOODS.find(f => f.id === foodId);
    if (!foodItem) {
      console.error('Food item not found for logging:', foodId);
      return false;
    }

    try {
      const response = await fetch('/api/logs/food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: activeDate,
          slot,
          foodId: foodItem.id || foodId,
          name: foodItem.name,
          servingSize: foodItem.servingSize,
          servingUnit: foodItem.servingUnit,
          baseQty: foodItem.baseQty ?? 1,
          loggedQty,
          macros: foodItem.macros,
          micros: foodItem.micros
        })
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

  const logBulkFoods = async (meals: Omit<LoggedFood, 'userId'>[]) => {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch('/api/logs/bulk-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: activeDate,
          meals
        })
      });

      if (response.ok) {
        const updatedLog = await response.json();
        setTodayLog(updatedLog);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error logging bulk foods', err);
      return false;
    }
  };

  const saveMealPlan = async (
    name: string,
    meals: any[],
    planDeficiencies: string[],
    adjustments: any[],
    overwriteId?: string
  ) => {
    const token = sessionStorage.getItem('token');
    if (!token) return { success: false, error: 'Unauthorized' };

    const formattedMeals = meals.map((m: any) => ({
      slot: m.slot,
      totalCalories: m.totalCalories,
      totalProtein: m.totalProtein,
      items: (m.items || []).map((item: any) => {
        const foodObj = item.food || item;
        return {
          foodId: item.foodId || foodObj.id || foodObj.foodId,
          name: item.name || foodObj.name,
          servingSize: item.servingSize || foodObj.servingSize,
          servingUnit: item.servingUnit || foodObj.servingUnit,
          baseQty: item.baseQty ?? foodObj.baseQty ?? 1,
          loggedQty: item.loggedQty ?? 1,
          macros: item.macros || foodObj.macros,
          micros: item.micros || foodObj.micros,
          reason: item.reason || ''
        };
      })
    }));

    try {
      const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, meals: formattedMeals, planDeficiencies, adjustments, overwriteId })
      });

      const data = await response.json();

      if (response.ok) {
        setSavedPlans(data);
        const active = data.find((p: any) => p.isActive) || null;
        setActivePlan(active);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.message || 'Failed to save meal plan',
          existingPlans: data.existingPlans
        };
      }
    } catch (err) {
      console.error('Error saving meal plan', err);
      return { success: false, error: 'Server connection error' };
    }
  };

  const setActiveMealPlan = async (id: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`/api/meal-plans/${id}/active`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedPlans(data);
        const active = data.find((p: any) => p.isActive) || null;
        setActivePlan(active);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error setting active plan', err);
      return false;
    }
  };

  const deleteMealPlan = async (id: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`/api/meal-plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedPlans(data);
        const active = data.find((p: any) => p.isActive) || null;
        setActivePlan(active);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting meal plan', err);
      return false;
    }
  };

  const logSlotFromPlan = async (slot: LoggedFood['slot'], items: any[]) => {
    const token = sessionStorage.getItem('token');
    if (!token) return false;

    const formattedItems = items.map((item: any) => {
      const foodObj = item.food || item;
      return {
        foodId: item.foodId || foodObj.id || foodObj.foodId,
        name: item.name || foodObj.name,
        servingSize: item.servingSize || foodObj.servingSize,
        servingUnit: item.servingUnit || foodObj.servingUnit,
        baseQty: item.baseQty ?? foodObj.baseQty ?? 1,
        loggedQty: item.loggedQty ?? 1,
        macros: item.macros || foodObj.macros,
        micros: item.micros || foodObj.micros
      };
    });

    try {
      const response = await fetch('/api/logs/bulk-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: activeDate,
          slot,
          meals: formattedItems
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTodayLog(data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error logging slot from plan', err);
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
        updateWater,
        logBulkFoods,
        savedPlans,
        activePlan,
        fetchMealPlans,
        saveMealPlan,
        setActiveMealPlan,
        deleteMealPlan,
        logSlotFromPlan
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
