import React, { useState } from 'react';
import { api, setAuthToken, setSavedUser, getSavedUser } from '../../services/api';
import { Mail, Lock, User, Briefcase, Eye, EyeOff, Sparkles, ArrowRight, ChevronLeft } from 'lucide-react';

interface AuthModuleProps {
  onAuthComplete: (user: any) => void;
  language: 'en' | 'hi';
}

type Step = 'landing' | 'login' | 'register' | 'role' | 'worker-profile';

export const AuthModule: React.FC<AuthModuleProps> = ({ onAuthComplete, language }) => {
  const [step, setStep] = useState<Step>('landing');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  // Role & worker profile state
  const [_role, setRole] = useState<'worker' | 'employer' | null>(null);
  const [fullName, setFullName] = useState('');
  const [tradeCategory, setTradeCategory] = useState('electrician');
  const [age, setAge] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [gender, setGender] = useState('male');
  const [address, setAddress] = useState('');

  const clearError = () => setError('');

  // ── Login handler ─────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setLoading(true);
    clearError();
    try {
      const res = await api.auth.login(loginEmail, loginPassword);
      setAuthToken(res.data.accessToken);
      setSavedUser(res.data.user);

      const u = res.data.user;
      if (!u.role || u.role === 'admin') {
        setStep('role');
      } else if (u.role === 'worker') {
        try {
          await api.workers.getProfile();
          onAuthComplete(u);
        } catch {
          setStep('worker-profile');
        }
      } else {
        onAuthComplete(u);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Register handler ──────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!regName || !regEmail || !regPassword || !regConfirm) {
      setError('All fields are required.');
      return;
    }
    if (regPassword !== regConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.register(regEmail, regPassword, regName);
      setAuthToken(res.data.accessToken);
      setSavedUser(res.data.user);
      setStep('role');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Role selection ────────────────────────────────────────────────────────
  const handleSelectRole = async (selectedRole: 'worker' | 'employer') => {
    setRole(selectedRole);
    setLoading(true);
    clearError();
    try {
      const res = await api.auth.updateRole(selectedRole);
      setAuthToken(res.data.accessToken);
      setSavedUser(res.data.user);
      if (selectedRole === 'worker') {
        setStep('worker-profile');
      } else {
        onAuthComplete(res.data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to set role.');
    } finally {
      setLoading(false);
    }
  };

  // ── Worker profile save ───────────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !address) {
      setError('Name and address are required.');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await api.workers.updateProfile({
        fullName,
        tradeCategory,
        age: age ? parseInt(age) : undefined,
        experienceYears: experienceYears ? parseInt(experienceYears) : 0,
        gender,
        languages: [language],
        skills: [],
        address,
        location: { type: 'Point', coordinates: [77.3718, 28.6273] },
      } as any);
      onAuthComplete(getSavedUser());
    } catch (err: any) {
      setError(err.message || 'Profile creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* ── Background decoration ── */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      {/* ── Header ── */}
      <header className="auth-header">
        <div className="app-logo">
          <Briefcase size={20} />
          <span>SkillVerse</span>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="auth-main">
        {error && (
          <div className="auth-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {/* ── LANDING ── */}
        {step === 'landing' && (
          <div className="auth-card auth-landing">
            <div className="auth-badge">
              <Sparkles size={13} />
              AI-Powered Skill Passport
            </div>
            <h1 className="auth-headline">
              Find Work.<br />
              <span className="auth-headline-accent">Prove Your Skills.</span>
            </h1>
            <p className="auth-subtext">
              India's first vernacular voice-assessment platform connecting blue-collar talent with local employers.
            </p>
            <div className="auth-landing-actions">
              <button
                id="btn-get-started"
                className="btn btn-primary"
                onClick={() => { clearError(); setStep('register'); }}
              >
                Get Started Free <ArrowRight size={16} />
              </button>
              <button
                id="btn-sign-in"
                className="btn btn-ghost"
                onClick={() => { clearError(); setStep('login'); }}
              >
                I already have an account
              </button>
            </div>
            <div className="auth-trust-row">
              <span>🔒 Secure</span>
              <span>•</span>
              <span>⚡ Instant Setup</span>
              <span>•</span>
              <span>🌐 Vernacular</span>
            </div>
          </div>
        )}

        {/* ── LOGIN ── */}
        {step === 'login' && (
          <form className="auth-card" onSubmit={handleLogin} noValidate>
            <button type="button" className="auth-back-btn" onClick={() => { clearError(); setStep('landing'); }}>
              <ChevronLeft size={16} /> Back
            </button>
            <h2 className="auth-card-title">Welcome back</h2>
            <p className="auth-card-sub">Sign in to your SkillVerse account</p>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field input-with-icon"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field input-with-icon input-with-icon-end"
                  placeholder="Your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-end"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              className={`btn btn-primary mt-4 ${loading ? 'btn-disabled' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : <>Sign In <ArrowRight size={15} /></>}
            </button>

            <p className="auth-switch-text">
              Don't have an account?{' '}
              <button type="button" className="auth-link" onClick={() => { clearError(); setStep('register'); }}>
                Create one
              </button>
            </p>
          </form>
        )}

        {/* ── REGISTER ── */}
        {step === 'register' && (
          <form className="auth-card" onSubmit={handleRegister} noValidate>
            <button type="button" className="auth-back-btn" onClick={() => { clearError(); setStep('landing'); }}>
              <ChevronLeft size={16} /> Back
            </button>
            <h2 className="auth-card-title">Create your account</h2>
            <p className="auth-card-sub">Join thousands finding local work</p>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-icon-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  className="input-field input-with-icon"
                  placeholder="Rajesh Kumar"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-icon-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  id="reg-email"
                  type="email"
                  className="input-field input-with-icon"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field input-with-icon input-with-icon-end"
                  placeholder="Min. 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-icon-end"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-icon-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field input-with-icon"
                  placeholder="Repeat your password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              id="btn-register-submit"
              type="submit"
              className={`btn btn-primary mt-4 ${loading ? 'btn-disabled' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : <>Create Account <ArrowRight size={15} /></>}
            </button>

            <p className="auth-switch-text">
              Already have an account?{' '}
              <button type="button" className="auth-link" onClick={() => { clearError(); setStep('login'); }}>
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* ── ROLE PICKER ── */}
        {step === 'role' && (
          <div className="auth-card">
            <h2 className="auth-card-title">You're in! 🎉</h2>
            <p className="auth-card-sub">Choose how you want to use SkillVerse</p>

            <div className="role-grid">
              <div
                id="role-worker"
                className="role-card"
                onClick={() => !loading && handleSelectRole('worker')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectRole('worker')}
              >
                <div className="role-icon role-icon-worker">
                  <User size={26} />
                </div>
                <h3>Job Seeker</h3>
                <p>Complete voice assessments, build a Skill Passport and find local work.</p>
                <span className="role-cta">Get hired <ArrowRight size={13} /></span>
              </div>

              <div
                id="role-employer"
                className="role-card"
                onClick={() => !loading && handleSelectRole('employer')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleSelectRole('employer')}
              >
                <div className="role-icon role-icon-employer">
                  <Briefcase size={26} />
                </div>
                <h3>Employer</h3>
                <p>Post geospatial jobs, screen applicants, and listen to voice pitches.</p>
                <span className="role-cta">Post jobs <ArrowRight size={13} /></span>
              </div>
            </div>

            {loading && <p className="auth-card-sub text-center mt-4">Setting up your account…</p>}
          </div>
        )}

        {/* ── WORKER PROFILE SETUP ── */}
        {step === 'worker-profile' && (
          <form className="auth-card" onSubmit={handleSaveProfile}>
            <h2 className="auth-card-title">Build your Skill Passport</h2>
            <p className="auth-card-sub">Tell employers what you can do</p>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                id="profile-name"
                type="text"
                className="input-field"
                placeholder="e.g. Rajesh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Occupation / Trade</label>
              <select
                id="profile-trade"
                className="input-field select-field"
                value={tradeCategory}
                onChange={(e) => setTradeCategory(e.target.value)}
                disabled={loading}
              >
                <option value="electrician">Electrician</option>
                <option value="plumber">Plumber</option>
                <option value="carpenter">Carpenter</option>
                <option value="delivery">Delivery Partner</option>
                <option value="driver">Driver</option>
                <option value="housekeeping">Housekeeping / Cleaning</option>
                <option value="mechanic">Mechanic</option>
                <option value="fresher">Fresher</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  id="profile-age"
                  type="number"
                  className="input-field"
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                  disabled={loading}
                  min={16}
                  max={70}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Experience (yrs)</label>
                <input
                  id="profile-experience"
                  type="number"
                  className="input-field"
                  placeholder="e.g. 3"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  required
                  disabled={loading}
                  min={0}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                id="profile-gender"
                className="input-field select-field"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={loading}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Work Area / Address</label>
              <input
                id="profile-address"
                type="text"
                className="input-field"
                placeholder="e.g. Sector 62, Noida"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              id="btn-profile-submit"
              type="submit"
              className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`}
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : <>Generate Skill Passport <Sparkles size={15} /></>}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
