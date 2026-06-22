import React, { useState } from 'react';
import { api, setAuthToken, setSavedUser, getSavedUser } from '../../services/api';
import { Phone, User, Briefcase } from 'lucide-react';

interface AuthModuleProps {
  onAuthComplete: (user: any) => void;
  language: 'en' | 'hi';
}

export const AuthModule: React.FC<AuthModuleProps> = ({
  onAuthComplete,
  language,
}) => {
  const [step, setStep] = useState<'login' | 'role' | 'worker-profile'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Role & Profile state
  const [_role, setRole] = useState<'worker' | 'employer' | null>(null);
  const [fullName, setFullName] = useState('');
  const [tradeCategory, setTradeCategory] = useState('electrician');
  const [age, setAge] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [gender, setGender] = useState('male');
  const [address, setAddress] = useState('');

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
      carpenter: 'Carpenter',
      delivery: 'Delivery Partner',
      driver: 'Driver',
      housekeeping: 'Housekeeping / Cleaning',
      mechanic: 'Mechanic',
      fresher: 'Fresher',
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
      carpenter: 'कारपेंटर (बढ़ई)',
      delivery: 'डिलीवरी पार्टनर',
      driver: 'ड्राइवर (चालक)',
      housekeeping: 'हाउसकीपिंग / सफाई',
      mechanic: 'मैकेनिक',
      fresher: 'फ्रेशर',
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
        tradeCategory,
        age: age ? parseInt(age) : undefined,
        experienceYears: experienceYears ? parseInt(experienceYears) : 0,
        gender,
        languages: [language],
        skills: [],
        address,
        location: {
          type: 'Point',
          coordinates: [77.3718, 28.6273], // Noida default coordinates fallback
        }
      };

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
    <div className="flex-column" style={{ minHeight: '100vh', width: '100%' }}>
      <header className="app-header">
        <div className="app-logo">
          <Briefcase size={22} className="text-primary" />
          <span>SkillVerse</span>
        </div>
      </header>

      <div className="app-main justify-center" style={{ paddingBottom: '40px' }}>
        {error && (
          <div className="card border-danger text-danger bg-red-950/20 py-3 mb-2 text-center text-sm">
            <strong>{t.errorHeading}: </strong> {error}
          </div>
        )}

        {/* STEP 1: Phone input */}
        {step === 'login' && (
          <form onSubmit={handleLogin} className="card">
            <h3 className="text-white font-bold text-lg mb-1 text-center">{t.subtitle}</h3>
            <p className="text-secondary-label text-xs mb-4 text-center">{t.tagline}</p>
            
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
              <label className="form-label">{language === 'hi' ? 'पहला नाम / पूरा नाम' : 'First Name / Full Name'}</label>
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
              <label className="form-label">{language === 'hi' ? 'व्यवसाय' : 'Occupation'}</label>
              <select
                className="input-field select-field"
                value={tradeCategory}
                onChange={(e) => setTradeCategory(e.target.value)}
                disabled={loading}
              >
                <option value="electrician">{t.electrician}</option>
                <option value="plumber">{t.plumber}</option>
                <option value="carpenter">{t.carpenter}</option>
                <option value="delivery">{t.delivery}</option>
                <option value="driver">{t.driver}</option>
                <option value="housekeeping">{t.housekeeping}</option>
                <option value="mechanic">{t.mechanic}</option>
                <option value="fresher">{t.fresher}</option>
                <option value="other">{t.other}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{language === 'hi' ? 'उम्र (Age)' : 'Age'}</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.experienceLabel}</label>
              <input
                type="number"
                className="input-field"
                placeholder="e.g. 3"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
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

            <div className="form-group mb-4">
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

            <button type="submit" className={`btn btn-primary ${loading ? 'btn-disabled' : ''}`} disabled={loading}>
              {loading ? '...' : t.finishBtn}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
