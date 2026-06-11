import React, { useState } from 'react';
import { api, setAuthToken, setSavedUser, getSavedUser } from '../../services/api';
import { Phone, User, Briefcase, Navigation } from 'lucide-react';

interface AuthModuleProps {
  onAuthComplete: (user: any) => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({
  onAuthComplete,
  language,
  setLanguage,
}) => {
  const [step, setStep] = useState<'login' | 'role' | 'worker-profile'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Role & Profile state
  const [_role, setRole] = useState<'worker' | 'employer' | null>(null);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('male');
  const [tradeCategory, setTradeCategory] = useState('electrician');
  const [languages] = useState<string[]>(['hi']);
  const [experienceYears, setExperienceYears] = useState('2');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Translations dictionary
  const t = {
    en: {
      brand: 'SkillVerse',
      subtitle: 'AI Vernacular Skill Passport',
      tagline: 'Connect with local jobs using your voice',
      phoneLabel: 'Enter Mobile Number',
      phonePlaceholder: 'e.g. +91 98765 43210',
      sendOtp: 'Login / Register',
      chooseRole: 'I want to join as...',
      workerRole: 'Job Seeker / Worker',
      workerDesc: 'Complete voice assessments, build a visual Skill Passport, and find local work.',
      employerRole: 'Hiring Manager / Employer',
      employerDesc: 'Post geospatial jobs, screen applicants, and listen to voice pitch introductions.',
      setupProfile: 'Setup Worker Profile',
      fullName: 'Full Name',
      genderLabel: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      tradeLabel: 'Trade / Specialty',
      experienceLabel: 'Experience (Years)',
      languagesLabel: 'Preferred Languages',
      addressLabel: 'Work Address / Area',
      locationBtn: 'Detect Work Location (GPS)',
      locationFetching: 'Accessing GPS...',
      locationSuccess: 'Location verified!',
      locationError: 'GPS Access Failed',
      finishBtn: 'Generate Skill Passport',
      errorHeading: 'Alert',
      electrician: 'Electrician',
      plumber: 'Plumber',
      painter: 'Painter',
      carpenter: 'Carpenter',
      delivery: 'Delivery Partner',
      housekeeping: 'Housekeeping / Cleaning',
    },
    hi: {
      brand: 'स्किलवर्स (SkillVerse)',
      subtitle: 'एआई-संचालित वोकल स्किल पासपोर्ट',
      tagline: 'अपनी आवाज से जुड़ें आस-पास के रोजगार से',
      phoneLabel: 'मोबाइल नंबर दर्ज करें',
      phonePlaceholder: 'उदा. +91 98765 43210',
      sendOtp: 'लॉगइन / रजिस्टर करें',
      chooseRole: 'आप किस रूप में जुड़ना चाहते हैं?',
      workerRole: 'कामगार / नौकरी खोजें',
      workerDesc: 'आवाज से परीक्षा दें, डिजिटल स्किल पासपोर्ट बनाएं और आस-पास काम ढूंढें।',
      employerRole: 'नियोक्ता / भर्ती प्रबंधक',
      employerDesc: 'आस-पास की नौकरियां पोस्ट करें और कामगारों के वॉयस इंटरव्यू सुनें।',
      setupProfile: 'कामगार प्रोफाइल सेट करें',
      fullName: 'पूरा नाम',
      genderLabel: 'लिंग',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',
      tradeLabel: 'काम का प्रकार / विशेषता',
      experienceLabel: 'अनुभव (वर्ष)',
      languagesLabel: 'पसंदीदा भाषाएं',
      addressLabel: 'काम का पता / क्षेत्र',
      locationBtn: 'स्थान का पता लगाएं (GPS)',
      locationFetching: 'जीपीएस से जुड़ रहे हैं...',
      locationSuccess: 'स्थान सत्यापित हो गया!',
      locationError: 'जीपीएस काम नहीं कर रहा',
      finishBtn: 'कौशल पासपोर्ट बनाएं',
      errorHeading: 'त्रुटि',
      electrician: 'इलेक्ट्रीशियन (बिजली मिस्त्री)',
      plumber: 'प्लंबर (नलसाज)',
      painter: 'पेंटर (रंगाई मिस्त्री)',
      carpenter: 'कारपेंटर (बढ़ई)',
      delivery: 'डिलीवरी पार्टनर',
      housekeeping: 'हाउसकीपिंग / सफाई',
    }
  }[language];

  // Submit phone login directly
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.verifyOtp(phoneNumber, '');
      setAuthToken(res.data.accessToken);
      setSavedUser(res.data.user);
      
      const loggedInUser = res.data.user;
      if (!loggedInUser.role || loggedInUser.role === 'admin') {
        setStep('role');
      } else if (loggedInUser.role === 'worker') {
        try {
          // Verify if worker profile is already configured in DB
          await api.workers.getProfile();
          onAuthComplete(loggedInUser);
        } catch {
          // If no profile exists, prompt setup
          setStep('worker-profile');
        }
      } else {
        onAuthComplete(loggedInUser);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  // Select Role
  const handleSelectRole = async (selectedRole: 'worker' | 'employer') => {
    setRole(selectedRole);
    setLoading(true);
    setError('');
    try {
      const res = await api.auth.updateRole(selectedRole);
      setAuthToken(res.data.accessToken);
      setSavedUser(res.data.user);

      if (selectedRole === 'worker') {
        setStep('worker-profile');
      } else {
        // Employers log in immediately
        onAuthComplete(res.data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update user role.');
    } finally {
      setLoading(false);
    }
  };

  // Geolocation lookup
  const detectLocation = () => {
    setLocationStatus('fetching');
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords([position.coords.longitude, position.coords.latitude]);
        setLocationStatus('success');
      },
      () => {
        setLocationStatus('error');
      }
    );
  };

  // Save Worker Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !address) {
      setError('Name and Address details are required.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const profilePayload: any = {
        fullName,
        gender,
        tradeCategory,
        experienceYears: parseInt(experienceYears) || 0,
        languages,
        skills,
        address,
      };

      if (coords) {
        profilePayload.location = {
          type: 'Point',
          coordinates: coords, // [lng, lat]
        };
      } else {
        // Mock fallback coordinates if GPS was denied
        profilePayload.location = {
          type: 'Point',
          coordinates: [77.5946, 12.9716], // Bangalore center fallback
        };
      }

      await api.workers.updateProfile(profilePayload);
      
      // Complete login flow
      const user = getSavedUser();
      onAuthComplete(user);
    } catch (err: any) {
      setError(err.message || 'Worker profile creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-main justify-center">
      {/* Header Info */}
      <div className="text-center mb-4">
        <h1 className="app-logo justify-center mb-1">
          <Briefcase size={26} className="text-primary" /> {t.brand}
        </h1>
        <p className="text-accent font-semibold text-sm uppercase tracking-wider">{t.subtitle}</p>
        <p className="text-secondary-label mt-1">{t.tagline}</p>
      </div>

      {error && (
        <div className="card border-danger text-danger bg-red-950/20 py-3 mb-2 text-center text-sm">
          <strong>{t.errorHeading}: </strong> {error}
        </div>
      )}

      {/* STEP 1: Phone input */}
      {step === 'login' && (
        <form onSubmit={handleLogin} className="card">
          <div className="form-group">
            <label className="form-label">{t.phoneLabel}</label>
            <div className="flex-row">
              <Phone size={18} className="text-muted" />
              <input
                type="tel"
                className="input-field flex-1"
                placeholder={t.phonePlaceholder}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className={`btn btn-primary mt-2 ${loading ? 'btn-disabled' : ''}`} disabled={loading}>
            {loading ? '...' : t.sendOtp}
          </button>
        </form>
      )}

      {/* STEP 3: Role Picker */}
      {step === 'role' && (
        <div className="flex-column gap-4">
          <h3 className="text-center font-bold text-lg mb-2">{t.chooseRole}</h3>

          <div className="card card-interactive" onClick={() => handleSelectRole('worker')}>
            <div className="flex-row mb-2">
              <User className="text-primary" size={24} />
              <h4 className="text-white font-bold">{t.workerRole}</h4>
            </div>
            <p className="text-secondary-label text-sm">{t.workerDesc}</p>
          </div>

          <div className="card card-interactive" onClick={() => handleSelectRole('employer')}>
            <div className="flex-row mb-2">
              <Briefcase className="text-accent" size={24} />
              <h4 className="text-white font-bold">{t.employerRole}</h4>
            </div>
            <p className="text-secondary-label text-sm">{t.employerDesc}</p>
          </div>
        </div>
      )}

      {/* STEP 4: Worker Profile Setup */}
      {step === 'worker-profile' && (
        <form onSubmit={handleSaveProfile} className="card">
          <h3 className="text-center font-bold text-lg mb-4">{t.setupProfile}</h3>

          <div className="form-group">
            <label className="form-label">{t.fullName}</label>
            <input
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
            <label className="form-label">{t.genderLabel}</label>
            <select
              className="input-field select-field"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={loading}
            >
              <option value="male">{t.male}</option>
              <option value="female">{t.female}</option>
              <option value="other">{t.other}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t.tradeLabel}</label>
            <select
              className="input-field select-field"
              value={tradeCategory}
              onChange={(e) => setTradeCategory(e.target.value)}
              disabled={loading}
            >
              <option value="electrician">{t.electrician}</option>
              <option value="plumber">{t.plumber}</option>
              <option value="painter">{t.painter}</option>
              <option value="carpenter">{t.carpenter}</option>
              <option value="delivery">{t.delivery}</option>
              <option value="housekeeping">{t.housekeeping}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t.experienceLabel}</label>
            <input
              type="number"
              className="input-field"
              min={0}
              max={50}
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{language === 'hi' ? 'कौशल / हुनर (Skills)' : 'Skills / Specialty'}</label>
            <div className="flex-row gap-2">
              <input
                type="text"
                className="input-field flex-1"
                placeholder={language === 'hi' ? 'उदा. वायरिंग सुधार, मोटर वाइंडिंग' : 'e.g. Wiring Repair, Troubleshooting'}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                disabled={loading}
              />
              <button
                type="button"
                className="btn btn-secondary py-2 px-3 text-xs"
                onClick={handleAddSkill}
                disabled={loading}
              >
                {language === 'hi' ? 'जोड़ें' : 'Add'}
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex-row flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <span key={index} className="badge badge-verified flex-row text-xs py-1 px-2 gap-1" style={{ color: 'var(--text-accent)' }}>
                    {skill}
                    <button
                      type="button"
                      className="hover:text-white font-bold ml-1 text-xs"
                      onClick={() => handleRemoveSkill(skill)}
                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', outline: 'none', color: 'inherit' }}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">{t.addressLabel}</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Sector 62, Noida"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Location Verification Button */}
          <div className="form-group mb-4">
            <label className="form-label">GPS Geolocation</label>
            <button
              type="button"
              className={`btn btn-secondary flex-row justify-center ${
                locationStatus === 'success' ? 'border-success text-success' : ''
              }`}
              onClick={detectLocation}
              disabled={loading || locationStatus === 'fetching'}
            >
              <Navigation size={16} className={locationStatus === 'fetching' ? 'animate-bounce' : ''} />
              {locationStatus === 'idle' && t.locationBtn}
              {locationStatus === 'fetching' && t.locationFetching}
              {locationStatus === 'success' && t.locationSuccess}
              {locationStatus === 'error' && t.locationError}
            </button>
          </div>

          <button type="submit" className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`} disabled={loading}>
            {loading ? '...' : t.finishBtn}
          </button>
        </form>
      )}

      {/* Language Switcher Overlay Link */}
      <div className="flex-row justify-center gap-2 mt-4">
        <button
          className={`language-pill ${language === 'en' ? 'btn-primary' : ''}`}
          onClick={() => setLanguage('en')}
        >
          English
        </button>
        <button
          className={`language-pill ${language === 'hi' ? 'btn-primary' : ''}`}
          onClick={() => setLanguage('hi')}
        >
          हिन्दी
        </button>
      </div>
    </div>
  );
};
