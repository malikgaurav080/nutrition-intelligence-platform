import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Splash, SignUp, Login, Dashboard, Meals, Insights, Profile } from './pages';
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
          {/* Public Routes */}
          <Route path="/" element={<Splash />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meals" 
            element={
              <ProtectedRoute>
                <Meals />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/insights" 
            element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
      </NutritionProvider>
    </UserProvider>
  );
}

export default App;
