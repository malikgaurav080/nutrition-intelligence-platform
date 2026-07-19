import { Link } from 'react-router-dom';

export function Splash() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1>Nutrition Intelligence Platform</h1>
      <p style={{ marginTop: '1rem' }}>
        Welcome. Please <Link style={{ color: 'var(--primary)' }} to="/login">Login</Link> or{' '}
        <Link style={{ color: 'var(--primary)' }} to="/signup">Sign Up</Link>.
      </p>
    </div>
  );
}

export function SignUp() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1>Sign Up</h1>
      <p style={{ marginTop: '1rem' }}>Create your personalized profile.</p>
      <Link style={{ color: 'var(--secondary)', display: 'block', marginTop: '1rem' }} to="/">Back to Home</Link>
    </div>
  );
}

export function Login() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1>Login</h1>
      <p style={{ marginTop: '1rem' }}>Access your personalized dashboard.</p>
      <Link style={{ color: 'var(--primary)', display: 'block', marginTop: '1rem' }} to="/dashboard">Go to Dashboard</Link>
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1 style={{ color: 'var(--primary)' }}>Dashboard</h1>
      <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>How healthy am I today?</p>
      
      <div className="premium-card" style={{ marginTop: '2rem' }}>
        <h2>Overall Nutrition Score</h2>
        <p className="tabular-nums" style={{ fontSize: '2rem', color: 'var(--primary)', marginTop: '0.5rem' }}>84%</p>
      </div>

      {/* Navigation placeholder */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <Link style={{ color: 'var(--secondary)' }} to="/meals">Meals</Link>
        <Link style={{ color: 'var(--secondary)' }} to="/insights">Insights</Link>
        <Link style={{ color: 'var(--secondary)' }} to="/profile">Profile</Link>
      </div>
    </div>
  );
}

export function Meals() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1>Meals</h1>
      <p style={{ marginTop: '1rem' }}>Log your food and see recommendations.</p>
      <Link style={{ color: 'var(--secondary)', display: 'block', marginTop: '1rem' }} to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}

export function Insights() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1>Insights</h1>
      <p style={{ marginTop: '1rem' }}>Health System Scores and Micronutrients.</p>
      <Link style={{ color: 'var(--secondary)', display: 'block', marginTop: '1rem' }} to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}

export function Profile() {
  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <h1>Profile</h1>
      <p style={{ marginTop: '1rem' }}>Manage your goals and priorities.</p>
      <Link style={{ color: 'var(--secondary)', display: 'block', marginTop: '1rem' }} to="/dashboard">Back to Dashboard</Link>
    </div>
  );
}
