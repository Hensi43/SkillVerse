import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { 
  User, Award, Star, Languages, Clock, MapPin, 
  Mic, Square, RefreshCw, CheckCircle, ArrowRight, Download,
  Briefcase, MessageSquare, Settings, ChevronRight
} from 'lucide-react';

interface WorkerModuleProps {
  user: any;
  language: 'en' | 'hi';
  onLogout: () => void;
  // Shared nearby job feed render helper
  renderJobFeed: () => React.ReactNode;
}

export const WorkerModule: React.FC<WorkerModuleProps> = ({
  user: _user,
  language,
  onLogout,
  renderJobFeed,
}) => {
  const [activeTab, setActiveTab] = useState<'jobs' | 'passport' | 'chat' | 'profile'>('jobs');
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showAssessment, setShowAssessment] = useState(false);
  const [_assessmentResult, setAssessmentResult] = useState<any>(null);
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
      noBadges: 'No badges yet. Take the voice test to earn your first badge.',
      rating: 'Rating',
      joined: 'Joined',
      logout: 'Logout',
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
      noBadges: 'कोई बैच नहीं है। बैच कमाने के लिए वॉयस टेस्ट दें।',
      rating: 'रेटिंग',
      joined: 'सदस्यता तिथि',
      logout: 'लॉगआउट',
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
        <div className="flex-row">
          <User className="text-primary" size={20} />
          <h2 className="text-sm font-bold">{t.welcome} {profile?.fullName || 'Worker'}</h2>
        </div>
        <button className="language-pill" onClick={onLogout}>{t.logout}</button>
      </header>

      {/* Main Scrolling View */}
      <div className="app-main">
        {/* Verification banner if no badges */}
        {profile && (!profile.verifiedBadges || profile.verifiedBadges.length === 0) && !showAssessment && !isEditingProfile && activeTab === 'passport' && (
          <div className="card border-accent" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(22, 28, 45, 0.7) 100%)' }}>
            <div className="flex-row mb-2">
              <Award className="text-accent" size={24} />
              <h3 className="text-white text-sm font-bold">Earn Badge</h3>
            </div>
            <p className="text-secondary-label text-xs mb-3">{t.assessmentAlert}</p>
            <button className="btn btn-primary btn-success py-2 text-xs" onClick={() => setShowAssessment(true)}>
              {t.takeAssessmentBtn}
            </button>
          </div>
        )}

        {/* Tab contents */}
        {showAssessment ? (
          <VoiceAssessment 
            profile={profile} 
            language={language}
            onComplete={(result) => {
              setAssessmentResult(result);
              fetchProfile(); // Reload profile with new badges/skills
            }}
            onClose={() => setShowAssessment(false)} 
          />
        ) : isEditingProfile ? (
          <EditProfileForm
            profile={profile}
            language={language}
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
          renderJobFeed()
        ) : activeTab === 'passport' ? (
          <SkillPassport profile={profile} language={language} t={t} onEditClick={() => {
            setIsEditingProfile(true);
            setActiveTab('profile');
          }} />
        ) : activeTab === 'chat' ? (
          <ChatSection language={language} />
        ) : (
          renderJobFeed()
        )}
      </div>

      {/* Fixed Bottom Navigation Bar */}
      {!showAssessment && (
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
      )}
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
            {profile.tradeCategory.toUpperCase()}
          </div>
        </div>

        {/* Passport Grid Details */}
        <div className="flex-column gap-3 mb-4">
          <div className="flex-row space-between text-sm">
            <div className="flex-row text-secondary">
              <Clock size={16} />
              <span>{t.experience}</span>
            </div>
            <span className="font-bold text-white">{profile.experienceYears} Years</span>
          </div>

          <div className="flex-row space-between text-sm">
            <div className="flex-row text-secondary">
              <Languages size={16} />
              <span>{t.languages}</span>
            </div>
            <span className="font-bold text-white">{profile.languages.join(', ')}</span>
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
            <span className="text-white font-bold text-xs">Verify Profile</span>
            <span className="text-muted text-[10px]">Scan QR to view worker experience & verification certificates</span>
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
   VoiceAssessment Component (Audio Quiz & AI Evaluation Polling)
   ========================================================================== */
interface VoiceAssessmentProps {
  profile: any;
  language: 'en' | 'hi';
  onComplete: (result: any) => void;
  onClose: () => void;
}

const VoiceAssessment: React.FC<VoiceAssessmentProps> = ({
  profile,
  language,
  onComplete,
  onClose,
}) => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  
  // Audio state
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Array<{ questionId: string; questionText: string; blob: Blob }>>([]);
  
  // Submission & Polling
  const [gradingState, setGradingState] = useState<'idle' | 'submitting' | 'polling' | 'completed' | 'failed'>('idle');
  const [gradedResult, setGradedResult] = useState<any>(null);
  const [error, setError] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load questions based on trade and language
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const res = await api.assessment.getQuestions(profile.tradeCategory, language);
        setQuestions(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load assessment questions.');
      } finally {
        setLoadingQuestions(false);
      }
    };
    fetchQuestions();
  }, [profile.tradeCategory, language]);

  // Start Audio Recording
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
        // Stop all tracks on the stream to release mic icon
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setError('');
    } catch (err: any) {
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Save answer and move to next question
  const saveAnswer = () => {
    if (!audioBlob) return;
    
    const currentQ = questions[currentIdx];
    const newAnswer = {
      questionId: currentQ.id,
      questionText: currentQ.text,
      blob: audioBlob
    };
    
    setAnswers([...answers, newAnswer]);
    setAudioBlob(null);
    setAudioUrl(null);
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Last answer recorded, trigger submit
      submitAnswers([...answers, newAnswer]);
    }
  };

  // Submit all recordings to the backend
  const submitAnswers = async (finalAnswers: any[]) => {
    setGradingState('submitting');
    setError('');
    try {
      const res = await api.assessment.submit(
        profile.tradeCategory,
        language,
        finalAnswers
      );
      
      const assessmentId = res.data.assessmentId;
      startPollingStatus(assessmentId);
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
      setGradingState('idle');
    }
  };

  // Poll status of evaluation
  const startPollingStatus = (assessmentId: string) => {
    setGradingState('polling');
    const interval = setInterval(async () => {
      try {
        const res = await api.assessment.getStatus(assessmentId);
        const assessment = res.data;
        
        if (assessment.status === 'completed') {
          clearInterval(interval);
          setGradedResult(assessment);
          setGradingState('completed');
          onComplete(assessment);
        } else if (assessment.status === 'failed') {
          clearInterval(interval);
          setError(assessment.feedback || 'AI assessment grading failed.');
          setGradingState('failed');
        }
      } catch (err) {
        // Log error and retry
        console.error('Polling error:', err);
      }
    }, 2000);
  };

  if (loadingQuestions) {
    return (
      <div className="card text-center items-center py-8">
        <RefreshCw className="animate-spin text-primary" size={24} />
        <p className="text-secondary-label mt-2">Fetching oral questions...</p>
      </div>
    );
  }

  if (gradingState === 'submitting') {
    return (
      <div className="card text-center py-8">
        <RefreshCw className="animate-spin text-primary mx-auto" size={28} />
        <h3 className="text-white font-bold mt-3">Uploading audio answers</h3>
        <p className="text-muted text-xs mt-1">Uploading high-fidelity voice profiles for assessment...</p>
      </div>
    );
  }

  if (gradingState === 'polling') {
    return (
      <div className="card text-center py-8">
        <RefreshCw className="animate-spin text-accent mx-auto" size={28} />
        <h3 className="text-white font-bold mt-3">AI Engine Grading Answers</h3>
        <p className="text-muted text-xs mt-1">Transcribing speech and grading technical concept accuracy...</p>
      </div>
    );
  }

  if (gradingState === 'completed' && gradedResult) {
    return (
      <div className="card assessment-card text-center">
        <CheckCircle className="text-success mx-auto mb-2" size={48} />
        <h3 className="text-white font-bold text-lg">Test Completed!</h3>
        <p className="text-success text-xs font-semibold uppercase tracking-wider mb-4">
          Badge Awarded: {gradedResult.badgeAwarded}
        </p>

        {/* Scores details */}
        <div className="flex-column gap-3 mb-4 bg-white/5 p-3 rounded-lg text-left">
          <div className="flex-column gap-1">
            <div className="flex-row space-between text-xs font-semibold text-secondary">
              <span>Technical Accuracy</span>
              <span className="text-success">{gradedResult.scores?.accuracy}%</span>
            </div>
            <div className="score-progress-bar">
              <div className="score-progress-fill" style={{ width: `${gradedResult.scores?.accuracy}%` }}></div>
            </div>
          </div>

          <div className="flex-column gap-1">
            <div className="flex-row space-between text-xs font-semibold text-secondary">
              <span>Speech Fluency</span>
              <span className="text-success">{gradedResult.scores?.fluency}%</span>
            </div>
            <div className="score-progress-bar">
              <div className="score-progress-fill" style={{ width: `${gradedResult.scores?.fluency}%` }}></div>
            </div>
          </div>

          <div className="flex-column gap-1">
            <div className="flex-row space-between text-xs font-semibold text-secondary">
              <span>Domain Knowledge</span>
              <span className="text-success">{gradedResult.scores?.knowledge}%</span>
            </div>
            <div className="score-progress-bar">
              <div className="score-progress-fill" style={{ width: `${gradedResult.scores?.knowledge}%` }}></div>
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="text-left bg-black/40 p-3 rounded-lg border border-white/5 mb-4">
          <h4 className="text-accent font-bold text-xs uppercase mb-1">AI Assessor Review</h4>
          <p className="text-secondary-label text-xs leading-relaxed">{gradedResult.feedback}</p>
        </div>

        <button className="btn btn-primary" onClick={onClose}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="card assessment-card">
      <div className="flex-row space-between mb-4 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <span className="text-accent text-xs font-bold uppercase">Oral Exam ({currentIdx + 1}/{questions.length})</span>
        <button className="text-muted hover:text-white text-xs font-bold" onClick={onClose}>Quit</button>
      </div>

      {error && (
        <div className="text-danger bg-red-950/20 p-2 rounded text-xs text-center mb-3">
          {error}
        </div>
      )}

      {currentQ && (
        <div className="text-center">
          <h3 className="text-white font-bold text-base mb-6 leading-relaxed" style={{ minHeight: '60px' }}>
            "{currentQ.text}"
          </h3>

          {/* Voice Waves */}
          <div className="voice-wave">
            <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
            <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
            <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
            <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
            <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
            <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
          </div>

          {/* Controls */}
          <div className="mic-btn-container">
            {recording ? (
              <button className="mic-btn mic-btn-recording" onClick={stopRecording}>
                <Square size={24} className="text-white" />
              </button>
            ) : (
              <button className="mic-btn" onClick={startRecording}>
                <Mic size={28} className="text-white" />
              </button>
            )}
            <span className="text-secondary text-xs">
              {recording ? 'Tap to STOP speaking' : 'Tap to RECORD your answer'}
            </span>
          </div>

          {/* Recorded playback */}
          {audioUrl && (
            <div className="audio-player-card">
              <audio src={audioUrl} controls style={{ width: '100%' }} />
            </div>
          )}

          {/* Navigation Action */}
          {audioBlob && (
            <button className="btn btn-success flex-row justify-center mt-4" onClick={saveAnswer}>
              <span>{currentIdx < questions.length - 1 ? 'Save & Next Question' : 'Submit Oral Answers'}</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   EditProfileForm Component
   ========================================================================== */
interface EditProfileFormProps {
  profile: any;
  language: 'en' | 'hi';
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({
  profile,
  language,
  onSave,
  onCancel,
}) => {
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [gender, setGender] = useState(profile?.gender || 'male');
  const [tradeCategory, setTradeCategory] = useState(profile?.tradeCategory || 'electrician');
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears?.toString() || '2');
  const [address, setAddress] = useState(profile?.address || '');
  const [coords, setCoords] = useState<[number, number] | null>(profile?.location?.coordinates || null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>(profile?.location ? 'success' : 'idle');
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);

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

  const t = {
    en: {
      editTitle: 'Edit Worker Profile',
      fullName: 'Full Name',
      genderLabel: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      tradeLabel: 'Trade / Specialty',
      experienceLabel: 'Experience (Years)',
      addressLabel: 'Work Address / Area',
      locationBtn: 'Detect Work Location (GPS)',
      locationFetching: 'Accessing GPS...',
      locationSuccess: 'Location verified!',
      locationError: 'GPS Access Failed',
      saveBtn: 'Save Changes',
      cancelBtn: 'Cancel',
      electrician: 'Electrician',
      plumber: 'Plumber',
      painter: 'Painter',
      carpenter: 'Carpenter',
      delivery: 'Delivery Partner',
      housekeeping: 'Housekeeping / Cleaning',
    },
    hi: {
      editTitle: 'प्रोफ़ाइल संपादित करें',
      fullName: 'पूरा नाम',
      genderLabel: 'लिंग',
      male: 'पुरुष',
      female: 'महिला',
      other: 'अन्य',
      tradeLabel: 'काम का प्रकार / विशेषता',
      experienceLabel: 'अनुभव (वर्ष)',
      addressLabel: 'काम का पता / क्षेत्र',
      locationBtn: 'स्थान का पता लगाएं (GPS)',
      locationFetching: 'जीपीएस से जुड़ रहे हैं...',
      locationSuccess: 'स्थान सत्यापित हो गया!',
      locationError: 'जीपीएस काम नहीं कर रहा',
      saveBtn: 'बदलाव सुरक्षित करें',
      cancelBtn: 'रद्द करें',
      electrician: 'इलेक्ट्रीशियन (बिजली मिस्त्री)',
      plumber: 'प्लंबर (नलसाज)',
      painter: 'पेंटर (रंगाई मिस्त्री)',
      carpenter: 'कारपेंटर (बढ़ई)',
      delivery: 'डिलीवरी पार्टनर',
      housekeeping: 'हाउसकीपिंग / सफाई',
    }
  }[language];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !address) {
      alert('Name and Address details are required.');
      return;
    }
    setSaving(true);
    const payload: any = {
      fullName,
      gender,
      tradeCategory,
      experienceYears: parseInt(experienceYears) || 0,
      skills,
      address,
    };
    if (coords) {
      payload.location = {
        type: 'Point',
        coordinates: coords,
      };
    }
    await onSave(payload);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
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
        <label className="form-label">{t.genderLabel}</label>
        <select
          className="input-field select-field"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          disabled={saving}
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
          disabled={saving}
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
          disabled={saving}
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
            disabled={saving}
          />
          <button
            type="button"
            className="btn btn-secondary py-2 px-3 text-xs"
            onClick={handleAddSkill}
            disabled={saving}
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
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          disabled={saving}
        />
      </div>

      <div className="form-group mb-4">
        <label className="form-label">GPS Geolocation</label>
        <button
          type="button"
          className={`btn btn-secondary flex-row justify-center ${
            locationStatus === 'success' ? 'border-success text-success' : ''
          }`}
          onClick={detectLocation}
          disabled={saving || locationStatus === 'fetching'}
        >
          <MapPin size={16} className={locationStatus === 'fetching' ? 'animate-bounce' : ''} />
          {locationStatus === 'idle' && t.locationBtn}
          {locationStatus === 'fetching' && t.locationFetching}
          {locationStatus === 'success' && t.locationSuccess}
          {locationStatus === 'error' && t.locationError}
        </button>
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
