import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';
import type { User } from '../context/UserContext.tsx';

const GOALS = [
  { id: 'Fat Loss', icon: '🔥', desc: 'Lose body fat, create calorie deficit' },
  { id: 'Muscle Build', icon: '💪', desc: 'Gain lean muscle, support training' },
  { id: 'Maintain Weight', icon: '⚖️', desc: 'Eat at maintenance, feel balanced' },
  { id: 'Athletic Performance', icon: '🏃', desc: 'Fuel training and recovery' },
  { id: 'General Wellness', icon: '🌿', desc: 'Improve overall health and energy' }
];

const PRIORITIES = [
  { id: 'Brain & Nervous System', icon: '🧠', desc: 'Memory, focus, energy, mood' },
  { id: 'Hair Health', icon: '💇', desc: 'Stronger hair, less shedding' },
  { id: 'Skin Health', icon: '✨', desc: 'Glow, elasticity, healing' },
  { id: 'Bones & Teeth', icon: '🦴', desc: 'Density, strength, posture' },
  { id: 'Heart Health', icon: '❤️', desc: 'Blood pressure, cholesterol' },
  { id: 'Muscle Health', icon: '💪', desc: 'Repair, strength, recovery' },
  { id: 'Immunity', icon: '🛡️', desc: 'Fight infections, faster recovery' },
  { id: 'Eye Health', icon: '👀', desc: 'Vision, retina protection' },
  { id: 'Blood Health', icon: '🩸', desc: 'Haemoglobin, iron levels' },
  { id: 'Thyroid Health', icon: '🦋', desc: 'Hormonal balance, metabolism' }
];

const DIETS = [
  { id: 'Pure Vegetarian', desc: 'No eggs, no meat' },
  { id: 'Lacto-Vegetarian', desc: 'Includes dairy, no eggs' },
  { id: 'Ovo-Vegetarian', desc: 'Includes eggs, no dairy' },
  { id: 'Vegan', desc: 'No animal products at all' }
];

const RESTRICTIONS = [
  'Gluten-Free',
  'Lactose Intolerant',
  'Nut Allergy',
  'Soy Allergy',
  'No Onion / No Garlic',
  'Diabetic-Friendly',
  'Low FODMAP'
];

export default function SignUp() {
  const { registerUser, currentUser, error, clearError } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

  // Form Fields
  // Step 1: Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Profile details
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Athlete'>('Sedentary');
  const [isPregnant, setIsPregnant] = useState(false);
  const [isBreastfeeding, setIsBreastfeeding] = useState(false);

  // Step 3: Goal
  const [primaryGoal, setPrimaryGoal] = useState('');

  // Step 4: Priorities
  const [healthPriorities, setHealthPriorities] = useState<string[]>([]);

  // Step 5: Diet
  const [dietType, setDietType] = useState('');

  // Step 6: Restrictions
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
    return () => clearError();
  }, [currentUser, navigate, clearError]);

  const validateStep = (): boolean => {
    setStepError(null);
    clearError();

    switch (step) {
      case 1:
        if (!name || name.length < 2) {
          setStepError('Name must be at least 2 characters.');
          return false;
        }
        if (!email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
          setStepError('Please enter a valid email address.');
          return false;
        }
        // Password rule: min 8, 1 uppercase, 1 number
        if (password.length < 8) {
          setStepError('Password must be at least 8 characters.');
          return false;
        }
        if (!/[A-Z]/.test(password)) {
          setStepError('Password must contain at least one uppercase letter.');
          return false;
        }
        if (!/[0-9]/.test(password)) {
          setStepError('Password must contain at least one number.');
          return false;
        }
        if (password !== confirmPassword) {
          setStepError('Passwords do not match.');
          return false;
        }
        return true;

      case 2:
        if (!dob) {
          setStepError('Date of birth is required.');
          return false;
        }
        const ageDifMs = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (age < 8) {
          setStepError('Age must be 8 years or older.');
          return false;
        }
        if (!height || isNaN(Number(height)) || Number(height) <= 0) {
          setStepError('Please enter a valid height in cm.');
          return false;
        }
        if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
          setStepError('Please enter a valid weight in kg.');
          return false;
        }
        return true;

      case 3:
        if (!primaryGoal) {
          setStepError('Please select one primary goal.');
          return false;
        }
        return true;

      case 4:
        if (healthPriorities.length < 1 || healthPriorities.length > 5) {
          setStepError('Please select between 1 and 5 health priorities.');
          return false;
        }
        return true;

      case 5:
        if (!dietType) {
          setStepError('Please select a diet type.');
          return false;
        }
        return true;

      case 6:
        return true;

      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStepError(null);
    setStep(prev => prev - 1);
  };

  const handlePriorityToggle = (priorityId: string) => {
    setHealthPriorities(prev => {
      if (prev.includes(priorityId)) {
        return prev.filter(p => p !== priorityId);
      } else {
        if (prev.length >= 5) return prev; // cap at 5
        return [...prev, priorityId];
      }
    });
  };

  const handleRestrictionToggle = (restriction: string) => {
    setDietaryRestrictions(prev => {
      if (prev.includes(restriction)) {
        return prev.filter(r => r !== restriction);
      } else {
        return [...prev, restriction];
      }
    });
  };

  const handleFinish = async () => {
    if (!validateStep()) return;

    const payload = {
      name,
      email,
      password,
      dob,
      gender,
      height: Number(height),
      weight: Number(weight),
      activityLevel,
      pregnancyStatus: {
        isPregnant: gender === 'Female' ? isPregnant : false,
        isBreastfeeding: gender === 'Female' ? isBreastfeeding : false
      },
      primaryGoal: primaryGoal as User['primaryGoal'],
      healthPriorities,
      dietType: dietType as User['dietType'],
      dietaryRestrictions
    };

    const success = await registerUser(payload);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        padding: '20px'
      }}
    >
      <div className="premium-card" style={{ maxWidth: '480px', width: '100%' }}>
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>Onboarding Progress</span>
          <span className="tabular-nums">Step {step} of 6</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '2rem' }}>
          {[1, 2, 3, 4, 5, 6].map(s => (
            <div 
              key={s}
              style={{
                flex: 1,
                height: '4px',
                backgroundColor: s <= step ? 'var(--primary)' : 'var(--divider)',
                borderRadius: '2px',
                transition: 'background-color 0.2s'
              }}
            />
          ))}
        </div>

        {(stepError || error) && (
          <div 
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}
          >
            {stepError || error}
          </div>
        )}

        {/* Step 1: Account Credentials */}
        {step === 1 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Begin setting up your scientific health profile
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Full Name
              </label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--divider)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
                placeholder="Jane Doe"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Email Address
              </label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--divider)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
                placeholder="jane@domain.com"
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Password (Min 8 characters, 1 uppercase, 1 number)
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--divider)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
                placeholder="••••••••"
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Confirm Password
              </label>
              <input 
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--divider)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
                placeholder="••••••••"
              />
            </div>
          </div>
        )}

        {/* Step 2: Basic Profile */}
        {step === 2 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Personal Metrics</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              We use these formulas to calculate baseline BMR, energy levels, and nutrient targets.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Date of Birth
              </label>
              <input 
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--divider)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Gender
                </label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                  style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--divider)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Activity Level
                </label>
                <select 
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--divider)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="Sedentary">Sedentary</option>
                  <option value="Light">Light</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Active">Active</option>
                  <option value="Athlete">Athlete</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Height (cm)
                </label>
                <input 
                  type="number"
                  placeholder="170"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--divider)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
                  className="tabular-nums"
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Weight (kg)
                </label>
                <input 
                  type="number"
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  style={{ width: '100%', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--divider)', borderRadius: '8px', padding: '12px', color: 'var(--text-primary)', outline: 'none' }}
                  className="tabular-nums"
                />
              </div>
            </div>

            {gender === 'Female' && (
              <div style={{ marginTop: '1.5rem', backgroundColor: 'var(--bg-surface)', padding: '15px', borderRadius: '8px', border: '1px solid var(--divider)' }}>
                <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Reproductive Life Stage</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={isPregnant}
                      onChange={(e) => {
                        setIsPregnant(e.target.checked);
                        if (e.target.checked) setIsBreastfeeding(false); // Mutually exclusive usually
                      }}
                    />
                    Are you Pregnant?
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox"
                      checked={isBreastfeeding}
                      onChange={(e) => {
                        setIsBreastfeeding(e.target.checked);
                        if (e.target.checked) setIsPregnant(false);
                      }}
                    />
                    Are you Breastfeeding?
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Define Target Goal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Select one primary target to adjust daily macro allocation
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {GOALS.map(g => (
                <div 
                  key={g.id}
                  onClick={() => setPrimaryGoal(g.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '16px',
                    borderRadius: '12px',
                    border: primaryGoal === g.id ? '2px solid var(--primary)' : '1px solid var(--divider)',
                    backgroundColor: primaryGoal === g.id ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background-color 0.2s'
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{g.icon}</span>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', color: primaryGoal === g.id ? 'var(--primary)' : 'var(--text-primary)' }}>{g.id}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{g.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Health Priorities */}
        {step === 4 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Select Health Priorities</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Choose 1 to 5 priorities to customize your health scoring dashboards
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
              {PRIORITIES.map(p => {
                const isSelected = healthPriorities.includes(p.id);
                return (
                  <div 
                    key={p.id}
                    onClick={() => handlePriorityToggle(p.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--divider)',
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '4px' }}>{p.icon}</span>
                    <h3 style={{ fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>{p.id}</h3>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Selected: {healthPriorities.length} / 5
            </div>
          </div>
        )}

        {/* Step 5: Diet Type */}
        {step === 5 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Vegetarian Diet Profile</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Define your custom dietary constraints.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {DIETS.map(d => (
                <div 
                  key={d.id}
                  onClick={() => setDietType(d.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: dietType === d.id ? '2px solid var(--primary)' : '1px solid var(--divider)',
                    backgroundColor: dietType === d.id ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <h3 style={{ fontSize: '0.95rem', color: dietType === d.id ? 'var(--primary)' : 'var(--text-primary)' }}>{d.id}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Restrictions */}
        {step === 6 && (
          <div>
            <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Restrictions & Allergies</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Check any options that apply to generate filtered suggestions (Optional)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {RESTRICTIONS.map(r => {
                const isSelected = dietaryRestrictions.includes(r);
                return (
                  <div 
                    key={r}
                    onClick={() => handleRestrictionToggle(r)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid var(--divider)',
                      backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-surface)',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: isSelected ? 'var(--primary)' : 'var(--text-primary)' }}>{r}</span>
                    <input 
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', gap: '1rem' }}>
          {step > 1 ? (
            <button 
              type="button"
              onClick={handleBack}
              style={{
                flex: 1,
                border: '1px solid var(--divider)',
                backgroundColor: 'rgba(255,255,255,0.02)',
                color: 'var(--text-primary)',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {step < 6 ? (
            <button 
              type="button"
              onClick={handleNext}
              style={{
                flex: 1,
                backgroundColor: 'var(--primary)',
                color: 'var(--bg-dark)',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Next Step
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleFinish}
              style={{
                flex: 1,
                backgroundColor: 'var(--primary)',
                color: 'var(--bg-dark)',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Complete Onboarding
            </button>
          )}
        </div>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Login Instead
          </Link>
        </p>
      </div>
    </div>
  );
}
