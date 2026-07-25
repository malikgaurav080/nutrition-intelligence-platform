import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Splash, SignUp, Login,
  Dashboard, Meals, Health, Insights, Profile, Reports,
  Micronutrients, MealPlan, GeneratePlan, LogFood,
} from './pages';
import { UserProvider } from './context/UserContext.tsx';
import { NutritionProvider } from './context/NutritionContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import './index.css';

function App() {
  return (
    <UserProvider>
      <NutritionProvider>
        <Router>
          <Routes>
            {/* ── Public Routes ──────────────────────────────── */}
            <Route path="/"        element={<Splash />} />
            <Route path="/signup"  element={<SignUp />} />
            <Route path="/login"   element={<Login />} />

            {/* ── Protected Routes ───────────────────────────── */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/meals"
              element={<ProtectedRoute><Meals /></ProtectedRoute>}
            />
            <Route
              path="/health"
              element={<ProtectedRoute><Health /></ProtectedRoute>}
            />
            <Route
              path="/insights"
              element={<ProtectedRoute><Insights /></ProtectedRoute>}
            />
            <Route
              path="/reports"
              element={<ProtectedRoute><Reports /></ProtectedRoute>}
            />
            <Route
              path="/profile"
              element={<ProtectedRoute><Profile /></ProtectedRoute>}
            />
            <Route
              path="/targets"
              element={<Navigate to="/micronutrients" replace />}
            />
            <Route
              path="/micronutrients"
              element={<ProtectedRoute><Micronutrients /></ProtectedRoute>}
            />
            <Route
              path="/meal-plan"
              element={<ProtectedRoute><MealPlan /></ProtectedRoute>}
            />
            <Route
              path="/log-food"
              element={<ProtectedRoute><LogFood /></ProtectedRoute>}
            />
            <Route
              path="/generate-plan"
              element={<ProtectedRoute><GeneratePlan /></ProtectedRoute>}
            />

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NutritionProvider>
    </UserProvider>
  );
}

export default App;
