import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  User, Award, Star, Languages, Clock, MapPin, 
  RefreshCw, Download,
  Briefcase, MessageSquare, Settings, ChevronRight
} from 'lucide-react';

interface WorkerModuleProps {
  user: any;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  onLogout: () => void;
  // Shared nearby job feed render helper
  renderJobFeed: (coords?: [number, number]) => React.ReactNode;
}

export const WorkerModule: React.FC<WorkerModuleProps> = ({
  user: _user,
  language,
  setLanguage,
  onLogout,
  renderJobFeed,
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'passport' | 'chat' | 'profile'>('jobs');
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Translations dictionary
  const t = {
    en: {
      welcome: 'Welcome,',
      findJobs: 'Jobs Feed',
      myPassport: 'My Passport',
      chatTab: 'Messages',
      profileTab: 'Profile',
      assessmentAlert: 'Boost your visibility! Take the AI Oral Assessment to earn a Verified Expert badge.',
      takeAssessmentBtn: 'Start Oral Test (3 mins)',
      loading: 'Loading profile...',
      verifyHeader: 'SkillVerse Passport',
      experience: 'Years Exp',
      verifiedSkills: 'Verified Skills',
      badges: 'Badges Earned',
      languages: 'Languages',
      location: 'Location',
      downloadPdf: 'Download PDF Passport',
      noBadges: 'No badges yet.',
      rating: 'Rating',
      joined: 'Joined',
      logout: 'Logout',
      electrician: 'Electrician',
      plumber: 'Plumber',
      carpenter: 'Carpenter',
      delivery: 'Delivery Partner',
      driver: 'Driver',
      housekeeping: 'Housekeeping / Cleaning',
      mechanic: 'Mechanic',
      fresher: 'Fresher',
      other: 'Other',
    },
    hi: {
      welcome: 'स्वागत है,',
      findJobs: 'काम खोजें',
      myPassport: 'मेरा पासपोर्ट',
      chatTab: 'संदेश',
      profileTab: 'प्रोफ़ाइल',
      assessmentAlert: 'रोजगार के अवसर बढ़ाएं! एक्सपर्ट बैच कमाने के लिए एआई वोकल परीक्षा दें।',
      takeAssessmentBtn: 'परीक्षा शुरू करें (३ मिनट)',
      loading: 'प्रोफ़ाइल लोड हो रही है...',
      verifyHeader: 'स्किलवर्स पासपोर्ट',
      experience: 'अनुभव वर्ष',
      verifiedSkills: 'सत्यापित कौशल',
      badges: 'कौशल बैच',
      languages: 'भाषाएं',
      location: 'स्थान',
      downloadPdf: 'पीडीएफ पासपोर्ट डाउनलोड करें',
      noBadges: 'कोई बैच नहीं है।',
      rating: 'रेटिंग',
      joined: 'सदस्यता तिथि',
      logout: 'लॉगआउट',
      electrician: 'इलेक्ट्रीशियन',
      plumber: 'प्लंबर',
      carpenter: 'कारपेंटर',
      delivery: 'डिलीवरी पार्टनर',
      driver: 'ड्राइवर',
      housekeeping: 'सफाई / हाउसकीपिंग',
      mechanic: 'मैकेनिक',
      fresher: 'फ्रेशर',
      other: 'अन्य',
    }
  }[language];

  // Fetch worker profile details
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.workers.getProfile();
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to load worker profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loadingProfile) {
    return (
      <div className="app-main justify-center items-center">
        <RefreshCw className="animate-spin text-primary" size={32} />
        <p className="text-secondary-label mt-2">{t.loading}</p>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <div className="app-logo">
          <Briefcase size={22} className="text-primary" />
          <span>SkillVerse</span>
        </div>
        <div className="flex-row gap-3">
          <span className="text-xs text-secondary-label">{t.welcome} {profile?.fullName || 'Worker'}</span>
          <button className="language-pill py-1 px-3 text-xs" onClick={onLogout}>{t.logout}</button>
        </div>
      </header>

      {/* Main Scrolling View */}
      <div className="app-main">
        {/* Tab contents */}
        {isEditingProfile ? (
          <EditProfileForm
            profile={profile}
            language={language}
            setLanguage={setLanguage}
            onSave={async (updatedData) => {
              try {
                await api.workers.updateProfile(updatedData);
                await fetchProfile();
                setIsEditingProfile(false);
                setActiveTab('passport');
              } catch (err: any) {
                alert(err.message || 'Failed to update profile.');
              }
            }}
            onCancel={() => {
              setIsEditingProfile(false);
              setActiveTab('passport');
            }}
          />
        ) : activeTab === 'jobs' ? (
          renderJobFeed(profile?.location?.coordinates)
        ) : activeTab === 'passport' ? (
          <SkillPassport profile={profile} language={language} t={t} onEditClick={() => {
            setIsEditingProfile(true);
            setActiveTab('profile');
          }} />
        ) : activeTab === 'chat' ? (
          <ChatSection language={language} />
        ) : (
          renderJobFeed(profile?.location?.coordinates)
        )}
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button 
          className={`bottom-nav-item ${activeTab === 'jobs' ? 'bottom-nav-item-active' : ''}`}
          onClick={() => {
            setActiveTab('jobs');
            setIsEditingProfile(false);
          }}
        >
          <Briefcase size={20} />
          <span>{t.findJobs}</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeTab === 'passport' ? 'bottom-nav-item-active' : ''}`}
          onClick={() => {
            setActiveTab('passport');
            setIsEditingProfile(false);
          }}
        >
          <Award size={20} />
          <span>{t.myPassport}</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeTab === 'chat' ? 'bottom-nav-item-active' : ''}`}
          onClick={() => {
            setActiveTab('chat');
            setIsEditingProfile(false);
          }}
        >
          <MessageSquare size={20} />
          <span>{t.chatTab}</span>
        </button>
        <button 
          className={`bottom-nav-item ${activeTab === 'profile' || isEditingProfile ? 'bottom-nav-item-active' : ''}`}
          onClick={() => {
            setIsEditingProfile(true);
            setActiveTab('profile');
          }}
        >
          <Settings size={20} />
          <span>{t.profileTab}</span>
        </button>
      </nav>
    </>
  );
};

/* ==========================================================================
   SkillPassport Component (Visual Web Resume + QR Code)
   ========================================================================== */
interface SkillPassportProps {
  profile: any;
  language: 'en' | 'hi';
  t: any;
  onEditClick: () => void;
}

const SkillPassport: React.FC<SkillPassportProps> = ({ profile, language, t, onEditClick }) => {
  if (!profile) return null;

  return (
    <div className="flex-column gap-4">
      {/* Visual Passport Frame */}
      <div className="card passport-card" style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(17, 24, 39, 0.9) 100%)',
        border: '1.5px solid rgba(255, 255, 255, 0.12)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        {/* Badge Header Row */}
        <div className="flex-row space-between mb-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex-column">
            <span className="text-accent font-bold text-xs uppercase tracking-widest">{t.verifyHeader}</span>
            <h2 className="text-white font-bold text-xl">{profile.fullName}</h2>
          </div>
          <div className="badge badge-verified">
            {(t[profile.tradeCategory] || profile.tradeCategory).toUpperCase()}
          </div>
        </div>

        {/* Passport Grid Details */}
        <div className="flex-column gap-3 mb-4">
          <div className="flex-row space-between text-sm">
            <div className="flex-row text-secondary">
              <Clock size={16} />
              <span>{t.experience}</span>
            </div>
            <span className="font-bold text-white">{profile.experienceYears} {language === 'hi' ? 'वर्ष' : 'Years'}</span>
          </div>

          <div className="flex-row space-between text-sm">
            <div className="flex-row text-secondary">
              <Languages size={16} />
              <span>{t.languages}</span>
            </div>
            <span className="font-bold text-white">
              {profile.languages.map((l: string) => l === 'hi' ? 'हिन्दी' : l === 'en' ? 'English' : l).join(', ')}
            </span>
          </div>

          <div className="flex-row space-between text-sm">
            <div className="flex-row text-secondary">
              <MapPin size={16} />
              <span>{t.location}</span>
            </div>
            <span className="font-bold text-white text-right" style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.address}
            </span>
          </div>

          <div className="flex-row space-between text-sm">
            <div className="flex-row text-secondary">
              <Star size={16} />
              <span>{t.rating}</span>
            </div>
            <div className="flex-row text-accent font-bold">
              <Star size={14} fill="currentColor" />
              <span>{profile.rating?.toFixed(1) || '5.0'} ({profile.reviewCount || 0} reviews)</span>
            </div>
          </div>
        </div>

        {/* Verified Badges Section */}
        <div className="mb-4">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">{t.badges}</h4>
          {profile.verifiedBadges && profile.verifiedBadges.length > 0 ? (
            <div className="flex-column gap-2">
              {profile.verifiedBadges.map((badge: any, idx: number) => (
                <div key={idx} className="flex-row space-between p-2 rounded bg-white/5 border border-white/5 text-xs">
                  <div className="flex-row text-white font-semibold">
                    <Award size={14} className="text-success" />
                    <span>{badge.badgeName}</span>
                  </div>
                  <span className="text-success font-bold">Score: {badge.score}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-xs">{t.noBadges}</p>
          )}
        </div>

        {/* Verified Skills List */}
        <div className="mb-4">
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-2">{t.verifiedSkills}</h4>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex-column gap-2">
              {profile.skills.map((skill: string, idx: number) => (
                <div key={idx} className="flex-column gap-1">
                  <div className="flex-row space-between text-xs font-semibold text-secondary">
                    <span>{skill}</span>
                    <span className="text-success">85%</span>
                  </div>
                  <div className="score-progress-bar">
                    <div className="score-progress-fill" style={{ width: '85%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-xs">No verified skills listed. Complete assessments to unlock.</p>
          )}
        </div>

        {/* Scannable Visual QR Code (Inline SVG for premium graphics) */}
        <div className="flex-row justify-center items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="8" fill="white" />
            <rect x="8" y="8" width="24" height="24" stroke="black" strokeWidth="4" fill="none" />
            <rect x="14" y="14" width="12" height="12" fill="black" />
            <rect x="68" y="8" width="24" height="24" stroke="black" strokeWidth="4" fill="none" />
            <rect x="74" y="14" width="12" height="12" fill="black" />
            <rect x="8" y="68" width="24" height="24" stroke="black" strokeWidth="4" fill="none" />
            <rect x="14" y="74" width="12" height="12" fill="black" />
            
            <rect x="40" y="10" width="8" height="8" fill="black" />
            <rect x="52" y="18" width="8" height="8" fill="black" />
            <rect x="40" y="26" width="16" height="8" fill="black" />
            <rect x="10" y="40" width="8" height="8" fill="black" />
            <rect x="22" y="52" width="16" height="8" fill="black" />
            <rect x="52" y="40" width="8" height="8" fill="black" />
            <rect x="44" y="52" width="8" height="16" fill="black" />
            <rect x="68" y="44" width="16" height="8" fill="black" />
            <rect x="76" y="56" width="8" height="8" fill="black" />
            <rect x="56" y="76" width="16" height="8" fill="black" />
            <rect x="68" y="68" width="8" height="8" fill="black" />
            <rect x="84" y="80" width="8" height="8" fill="black" />
          </svg>
          <div className="flex-column text-left">
            <span className="text-white font-bold text-xs">{language === 'hi' ? 'प्रोफ़ाइल सत्यापित करें' : 'Verify Profile'}</span>
            <span className="text-muted text-[10px]">
              {language === 'hi' 
                ? 'अनुभव वर्ष और कौशल प्रमाण-पत्र देखने के लिए क्यूआर कोड स्कैन करें' 
                : 'Scan QR to view worker experience & verification certificates'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-column gap-2">
        <button className="btn btn-secondary flex-row justify-center" onClick={() => alert('PDF generation is queued. In a live environment, a visual PDF resume is compiled and exported.')}>
          <Download size={16} />
          {t.downloadPdf}
        </button>
        <button className="btn btn-secondary flex-row justify-center" onClick={onEditClick}>
          <User size={16} />
          {language === 'hi' ? 'प्रोफ़ाइल संपादित करें' : 'Edit Profile Details'}
        </button>
      </div>
    </div>
  );
};

/* ==========================================================================
   EditProfileForm Component
   ========================================================================== */
interface EditProfileFormProps {
  profile: any;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  profile,
  language,
  setLanguage,
  onSave,
  onCancel,
}) => {
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [tradeCategory, setTradeCategory] = useState(profile?.tradeCategory || 'electrician');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [currentSalaryEst, setCurrentSalaryEst] = useState(profile?.currentSalaryEst?.toString() || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'hi'>(language);
  const [saving, setSaving] = useState(false);

  const t = {
    en: {
      editTitle: 'Edit Settings & Profile',
      fullName: 'First Name / Full Name',
      tradeLabel: 'Occupation',
      addressLabel: 'Work Address / Area',
      saveBtn: 'Save Changes',
      cancelBtn: 'Cancel',
      electrician: 'Electrician',
      plumber: 'Plumber',
      carpenter: 'Carpenter',
      delivery: 'Delivery Partner',
      driver: 'Driver',
      housekeeping: 'Housekeeping / Cleaning',
      mechanic: 'Mechanic',
      fresher: 'Fresher',
      other: 'Other',
    },
    hi: {
      editTitle: 'सेटिंग्स और प्रोफ़ाइल बदलें',
      fullName: 'पहला नाम / पूरा नाम',
      tradeLabel: 'व्यवसाय',
      addressLabel: 'काम का पता / क्षेत्र',
      saveBtn: 'बदलाव सुरक्षित करें',
      cancelBtn: 'रद्द करें',
      electrician: 'इलेक्ट्रीशियन (बिजली मिस्त्री)',
      plumber: 'प्लंबर (नलसाज)',
      carpenter: 'कारपेंटर (बढ़ई)',
      delivery: 'डिलीवरी पार्टनर',
      driver: 'ड्राइवर (चालक)',
      housekeeping: 'हाउसकीपिंग / सफाई',
      mechanic: 'मैकेनिक',
      fresher: 'फ्रेशर',
      other: 'अन्य',
    }
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !address) {
      alert('Name and Address details are required.');
      return;
    }
    setSaving(true);
    const payload: any = {
      fullName,
      tradeCategory,
      age: age ? parseInt(age) : undefined,
      currentSalaryEst: currentSalaryEst ? parseInt(currentSalaryEst) : undefined,
      experienceYears: profile?.experienceYears || 2,
      languages: [preferredLanguage],
      skills: profile?.skills || [],
      address,
      location: profile?.location || {
        type: 'Point',
        coordinates: [77.3718, 28.6273] // Noida fallback coordinates
      }
    };

    setLanguage(preferredLanguage);
    await onSave(payload);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card animate-fade-in">
      <h3 className="text-center font-bold text-lg mb-4 text-white">{t.editTitle}</h3>

      <div className="form-group">
        <label className="form-label">{t.fullName}</label>
        <input
          type="text"
          className="input-field"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={saving}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.tradeLabel}</label>
        <select
          className="input-field select-field"
          value={tradeCategory}
          onChange={(e) => setTradeCategory(e.target.value)}
          disabled={saving}
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
          disabled={saving}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{language === 'hi' ? 'अपेक्षित वेतन (मासिक - वैकल्पिक)' : 'Expected Monthly Salary (Optional)'}</label>
        <input
          type="number"
          className="input-field"
          placeholder="e.g. 15000"
          value={currentSalaryEst}
          onChange={(e) => setCurrentSalaryEst(e.target.value)}
          disabled={saving}
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.addressLabel}</label>
        <input
          type="text"
          className="input-field"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          disabled={saving}
        />
      </div>

      <div className="form-group mb-4">
        <label className="form-label">{language === 'hi' ? 'भाषा चुनें' : 'Preferred Language'}</label>
        <select
          className="input-field select-field"
          value={preferredLanguage}
          onChange={(e) => setPreferredLanguage(e.target.value as 'en' | 'hi')}
          disabled={saving}
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
        </select>
      </div>

      <div className="flex-row gap-2">
        <button type="button" className="btn btn-secondary flex-1" onClick={onCancel} disabled={saving}>
          {t.cancelBtn}
        </button>
        <button type="submit" className={`btn btn-primary flex-1 ${saving ? 'btn-disabled' : ''}`} disabled={saving}>
          {saving ? '...' : t.saveBtn}
        </button>
      </div>
    </form>
  );
};

/* ==========================================================================
   ChatSection Component (Simulated Real-Time Messaging with Employers)
   ========================================================================== */
interface ChatSectionProps {
  language: 'en' | 'hi';
}

interface Message {
  sender: 'worker' | 'employer';
  text: string;
  time: string;
}

const ChatSection: React.FC<ChatSectionProps> = ({ language }) => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [messages, setMessages] = useState<{ [appId: string]: Message[] }>({});
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const tc = {
    en: {
      title: "Active Chats",
      noChats: "No messages yet. Go to 'Jobs Feed' and apply for jobs to start chatting!",
      back: "Back",
      status: "Status",
      typeMessage: "Type a message...",
      send: "Send",
      employerTyping: "Employer is typing...",
      quickRepliesLabel: "Quick Answers:",
      quickReplies: ["Yes, I am available", "Where is the work location?", "When can I start?"],
      defaultResponses: [
        "Thanks for reaching out! Let's connect tomorrow morning at 10 AM. Does that work?",
        "I saw your verified Skill Passport. Your test scores look great! Let's arrange a call.",
        "Could you please share if you have prior experience working in this specific area?",
        "Got it. Let me discuss with my contractor and I will confirm the details shortly."
      ]
    },
    hi: {
      title: "सक्रिय बातचीत",
      noChats: "अभी कोई संदेश नहीं है। बातचीत शुरू करने के लिए 'काम खोजें' और नौकरियों के लिए आवेदन करें!",
      back: "पीछे",
      status: "स्थिति",
      typeMessage: "अपना संदेश लिखें...",
      send: "भेजें",
      employerTyping: "नियोक्ता लिख रहे हैं...",
      quickRepliesLabel: "त्वरित उत्तर:",
      quickReplies: ["हाँ, मैं उपलब्ध हूँ", "काम का स्थान कहाँ है?", "काम कब से शुरू करना है?"],
      defaultResponses: [
        "संपर्क करने के लिए धन्यवाद! हम कल सुबह 10 बजे बात करेंगे। क्या यह समय ठीक है?",
        "मैंने आपका सत्यापित कौशल पासपोर्ट देखा। आपका स्कोर बहुत अच्छा है! आइए कल बात करें।",
        "क्या आप इस क्षेत्र में पहले भी काम कर चुके हैं?",
        "ठीक है। मैं अपने ठेकेदार से बात करके जल्द ही पुष्टि करूँगा।"
      ]
    }
  }[language];

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const res = await api.jobs.getWorkerApplications();
        const apps = Array.isArray(res) ? res : res.data || [];
        setApplications(apps);

        const initialMessages: { [appId: string]: Message[] } = {};
        apps.forEach((app: any) => {
          initialMessages[app._id] = [
            {
              sender: 'employer',
              text: language === 'hi' 
                ? `नमस्ते! हमने ${app.jobId?.title || 'काम'} के लिए आपका आवेदन देखा। आपके कौशल की पुष्टि हो गई है।` 
                : `Hello! We saw your application for ${app.jobId?.title || 'the job'}. Your verified skills look impressive.`,
              time: new Date(new Date().getTime() - 1000 * 60 * 10).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ];
        });
        
        const stored = localStorage.getItem('skillverse_chat_history');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            const merged = { ...initialMessages };
            Object.keys(parsed).forEach(key => {
              if (parsed[key] && parsed[key].length > 0) {
                merged[key] = parsed[key];
              }
            });
            setMessages(merged);
          } catch (e) {
            setMessages(initialMessages);
          }
        } else {
          setMessages(initialMessages);
        }
      } catch (err) {
        console.error("Failed to load worker applications:", err);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [language]);

  const saveChatHistory = (updatedMessages: { [appId: string]: Message[] }) => {
    localStorage.setItem('skillverse_chat_history', JSON.stringify(updatedMessages));
  };

  const handleSendMessage = (textToSend: string) => {
    if (!selectedApp || !textToSend.trim()) return;

    const appId = selectedApp._id;
    const userMsg: Message = {
      sender: 'worker',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentChat = messages[appId] || [];
    const updatedChat = [...currentChat, userMsg];
    
    const updatedMessages = {
      ...messages,
      [appId]: updatedChat
    };

    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setInputText('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = tc.defaultResponses;
      const randomResponse = responses[Math.min(currentChat.length, responses.length - 1)];

      const employerMsg: Message = {
        sender: 'employer',
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalChat = [...updatedChat, employerMsg];
      const finalMessages = {
        ...messages,
        [appId]: finalChat
      };
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="card text-center items-center py-8">
        <RefreshCw className="animate-spin text-primary" size={24} />
        <p className="text-secondary-label mt-2">Loading chats...</p>
      </div>
    );
  }

  if (selectedApp) {
    const appId = selectedApp._id;
    const chatHistory = messages[appId] || [];

    return (
      <div className="flex-column gap-3" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="card py-2 px-3 flex-row space-between" style={{ borderBottom: '1.5px solid var(--border-color)', margin: 0 }}>
          <button className="btn btn-secondary py-1 px-3 text-xs" onClick={() => setSelectedApp(null)}>
            &larr; {tc.back}
          </button>
          <div className="flex-column text-right">
            <span className="text-white font-bold text-xs">{selectedApp.jobId?.title || "Job Chat"}</span>
            <span className="text-accent text-[10px]">{tc.status}: {selectedApp.status.toUpperCase()}</span>
          </div>
        </div>

        <div 
          className="flex-column gap-2 p-3 rounded-lg animate-fade-in" 
          style={{ 
            height: '320px', 
            overflowY: 'auto', 
            background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}
        >
          {chatHistory.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex-column max-w-[85%] rounded-lg p-2.5 text-xs ${
                msg.sender === 'worker' 
                  ? 'self-end bg-primary text-white border-br-none' 
                  : 'self-start bg-white/5 border border-white/5 text-gray-200 border-bl-none'
              }`}
              style={{
                alignSelf: msg.sender === 'worker' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.sender === 'worker' ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                border: msg.sender === 'worker' ? 'none' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: '12px',
                borderBottomRightRadius: msg.sender === 'worker' ? '2px' : '12px',
                borderBottomLeftRadius: msg.sender === 'employer' ? '2px' : '12px',
                padding: '10px',
                maxWidth: '85%'
              }}
            >
              <p className="leading-relaxed">{msg.text}</p>
              <span className="text-[9px] text-right mt-1 opacity-60 block">{msg.time}</span>
            </div>
          ))}
          
          {isTyping && (
            <div 
              className="bg-white/5 border border-white/5 p-2 rounded-lg text-xs text-muted italic flex-row gap-2 self-start"
              style={{ alignSelf: 'flex-start', borderRadius: '12px', borderBottomLeftRadius: '2px', padding: '8px 12px' }}
            >
              <span className="animate-pulse">{tc.employerTyping}</span>
            </div>
          )}
        </div>

        <div className="flex-column gap-1">
          <span className="text-[10px] text-muted font-semibold uppercase">{tc.quickRepliesLabel}</span>
          <div className="flex-row flex-wrap gap-1.5">
            {tc.quickReplies.map((reply, idx) => (
              <button 
                key={idx} 
                className="btn btn-secondary py-1 px-2.5 text-[10px] rounded-full" 
                onClick={() => handleSendMessage(reply)}
                style={{ fontSize: '10px', borderRadius: '9999px', padding: '4px 10px' }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-row gap-2">
          <input
            type="text"
            className="input-field flex-1 text-xs"
            placeholder={tc.typeMessage}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage(inputText);
              }
            }}
          />
          <button 
            className="btn btn-primary px-4 py-2 text-xs"
            onClick={() => handleSendMessage(inputText)}
          >
            {tc.send}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-column gap-3">
      <h3 className="text-white font-bold text-base mb-1">{tc.title}</h3>
      {applications.length === 0 ? (
        <div className="card text-center p-6 bg-white/5 border border-white/5">
          <MessageSquare className="text-muted mx-auto mb-2" size={32} />
          <p className="text-secondary-label text-xs leading-relaxed">{tc.noChats}</p>
        </div>
      ) : (
        <div className="flex-column gap-2">
          {applications.map((app) => {
            const hasHistory = messages[app._id] && messages[app._id].length > 0;
            const lastMsg = hasHistory ? messages[app._id][messages[app._id].length - 1] : null;

            return (
              <div 
                key={app._id} 
                className="card card-interactive p-3 flex-row space-between border hover:border-accent"
                onClick={() => setSelectedApp(app)}
                style={{ border: '1px solid var(--border-color)', margin: 0 }}
              >
                <div className="flex-column gap-1 text-left flex-1" style={{ marginRight: '12px' }}>
                  <div className="flex-row gap-2">
                    <span className="text-white font-bold text-sm">{app.jobId?.title || "Specialty Work"}</span>
                    <span className={`badge text-[9px] py-0.5 px-1.5 ${
                      app.status === 'shortlisted' ? 'badge-verified' : 
                      app.status === 'hired' ? 'bg-success/20 text-success border border-success/30' :
                      app.status === 'rejected' ? 'bg-danger/20 text-danger border border-danger/30' : 
                      'bg-white/5 text-secondary border border-white/10'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-muted text-[10px]">{app.jobId?.address || "Local Area"}</span>
                  {lastMsg && (
                    <span className="text-secondary-label text-xs mt-1 truncate block max-w-[200px]" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {lastMsg.sender === 'worker' ? 'You: ' : ''}{lastMsg.text}
                    </span>
                  )}
                </div>
                <div className="flex-column items-end justify-center">
                  <span className="text-[10px] text-muted">{lastMsg ? lastMsg.time : ''}</span>
                  <ChevronRight size={16} className="text-accent mt-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
