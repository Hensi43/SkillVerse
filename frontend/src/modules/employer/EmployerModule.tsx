import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Briefcase, Plus, Clock, User, 
  Award, Play, Check, X, Star, FileText, ArrowLeft, RefreshCw, Navigation, MapPin
} from 'lucide-react';
import { TiltCard } from '../../components/TiltCard';

interface EmployerModuleProps {
  user: any;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  onLogout: () => void;
}

export const EmployerModule: React.FC<EmployerModuleProps> = ({
  user: _user,
  language,
  setLanguage,
  onLogout,
}) => {
  const [view, setView] = useState<'dashboard' | 'post-job' | 'applicants'>('dashboard');
  const [jobs, setJobs] = useState<any[]>([]);
  const [nearbyWorkers, setNearbyWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const t: any = {
    en: {
      employerPortal: 'Employer Dashboard',
      postJobBtn: 'Post a New Job',
      noJobs: 'You have not posted any jobs yet.',
      applicantsCount: 'Applicants',
      posted: 'Posted on',
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
      employerPortal: 'नियोक्ता डैशबोर्ड',
      postJobBtn: 'नई नौकरी पोस्ट करें',
      noJobs: 'आपने अभी तक कोई नौकरी पोस्ट नहीं की है।',
      applicantsCount: 'आवेदन मिले',
      posted: 'पोस्टिंग तिथि',
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

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [jobsRes, workersRes] = await Promise.allSettled([
        api.jobs.getEmployerJobs(),
        // We'll use a hardcoded default Noida location for dummy workers search 
        api.workers.getNearby({ lat: 28.62, lng: 77.37, radiusKm: 20 })
      ]);
      if (jobsRes.status === 'fulfilled') setJobs(jobsRes.value.data || []);
      if (workersRes.status === 'fulfilled') setNearbyWorkers(workersRes.value.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);

  return (
    <>
      <header className="app-header">
        <div className="app-logo">
          <Briefcase size={22} className="text-accent" />
          <span>SkillVerse</span>
        </div>
        <div className="flex-row gap-3">
          <span className="text-xs text-secondary-label">{t.employerPortal}</span>
          <button className="language-pill" style={{ fontSize:12, padding:'4px 12px' }}
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}>
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <button className="language-pill py-1 px-3 text-xs" onClick={onLogout}>{t.logout}</button>
        </div>
      </header>

      {/* Main Bento Grid */}
      <div className="bento-grid bento-grid--employer">
        {error && (
          <div className="text-danger bg-red-950/20 p-3 rounded-lg text-xs text-center" style={{ gridColumn: '1 / -1' }}>
            {error}
          </div>
        )}

        {/* 1. Post Job Banner */}
        <TiltCard className="bento-cell bento-cell--post-banner" maxTilt={3} style={{ minHeight: 'auto', background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.1) 100%)', border: '1px solid rgba(99,102,241,0.3)', padding: '32px', textAlign: 'center', justifyContent: 'center' }}>
          <Briefcase size={32} className="text-primary mx-auto mb-3" />
          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', marginBottom: 12 }}>Grow Your Team</h2>
          <button className="btn btn-primary flex-row justify-center mx-auto" onClick={() => setView('post-job')} style={{ padding: '12px 24px', fontSize: 14 }}>
            <Plus size={18} />
            <span>{t.postJobBtn}</span>
          </button>
        </TiltCard>

        {/* 2. Quick Stats */}
        <TiltCard className="bento-cell bento-cell--post-stats" maxTilt={8}>
          <div className="bento-section-header">
            <span className="bento-section-title">Hiring Pipeline</span>
          </div>
          <div className="bento-stat-grid" style={{ gap: 16 }}>
            <div className="bento-stat-card">
              <div className="bento-stat-icon bento-stat-icon--indigo"><Briefcase size={16}/></div>
              <div>
                <div className="bento-stat-value">{jobs.length}</div>
                <div className="bento-stat-label">Active Jobs</div>
              </div>
            </div>
            <div className="bento-stat-card">
              <div className="bento-stat-icon bento-stat-icon--amber"><User size={16}/></div>
              <div>
                <div className="bento-stat-value">{totalApplicants}</div>
                <div className="bento-stat-label">Total Applicants</div>
              </div>
            </div>
          </div>
        </TiltCard>

        {/* 3. Nearby Workers Feed */}
        <TiltCard className="bento-cell bento-cell--quick-app" maxTilt={5}>
          <div className="bento-section-header">
            <span className="bento-section-title">Nearby Workers</span>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>{nearbyWorkers.length} found</span>
          </div>
          <div className="bento-feed-scroll" style={{ maxHeight: 360 }}>
            {nearbyWorkers.length > 0 ? nearbyWorkers.map((worker: any, i: number) => (
              <div key={i} className="bento-msg-row" style={{ alignItems: 'center' }} onClick={() => alert('Worker inspection overlay would open here.')}>
                <div className="bento-msg-avatar bg-success">
                  {worker.fullName[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="bento-msg-text font-bold">{worker.fullName}</div>
                  <div className="bento-msg-sub">
                    {worker.tradeCategory.charAt(0).toUpperCase() + worker.tradeCategory.slice(1)} • {worker.experienceYears} Yrs Exp
                  </div>
                </div>
                <div className="flex-column items-end">
                  <span className="badge badge-verified py-0 px-1 text-[9px] mb-1">★ {worker.rating?.toFixed(1) || '5.0'}</span>
                  <span className="text-[10px] text-muted"><MapPin size={8} className="inline mr-1"/>Local</span>
                </div>
              </div>
            )) : (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)', fontSize:13 }}>
                <User size={28} style={{ margin:'0 auto 8px', display:'block', opacity:0.4 }} />
                No workers found nearby.
              </div>
            )}
          </div>
        </TiltCard>

        {/* 4. Active Job Postings */}
        <TiltCard className="bento-cell bento-cell--jobs" maxTilt={3}>
          <div className="bento-section-header">
            <span className="bento-section-title">Your Job Postings</span>
            {loading && <RefreshCw size={14} className="animate-spin text-primary" />}
          </div>
          <div className="bento-feed-scroll" style={{ maxHeight: 400 }}>
            {jobs.length > 0 ? jobs.map((job) => (
              <div 
                key={job._id} 
                className="bento-feed-row"
                onClick={() => {
                  setSelectedJob(job);
                  setView('applicants');
                }}
              >
                <div>
                  <div className="bento-feed-title">{job.title}</div>
                  <div className="bento-feed-meta">
                    <Clock size={10} style={{ display:'inline', marginRight:3 }} />{new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex-row gap-2 items-center">
                  <span className="text-accent font-bold text-xs">{job.applicationsCount || 0} {t.applicantsCount}</span>
                  <ArrowLeft size={14} className="text-muted" style={{ transform: 'rotate(180deg)' }}/>
                </div>
              </div>
            )) : (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)', fontSize:13 }}>
                <Briefcase size={28} style={{ margin:'0 auto 8px', display:'block', opacity:0.4 }} />
                {t.noJobs}
              </div>
            )}
          </div>
        </TiltCard>

        {/* 5. Recent Activity (Placeholder) */}
        <TiltCard className="bento-cell bento-cell--activity" maxTilt={5}>
          <div className="bento-section-header">
            <span className="bento-section-title">Recent Activity</span>
          </div>
          <div className="flex-column gap-3 mt-2">
            {[
              { msg: 'Ramesh Singh applied for Plumber', time: '10 mins ago', type: 'applied' },
              { msg: 'Suresh Wood shortlisted', time: '1 hour ago', type: 'shortlisted' }
            ].map((act, i) => (
              <div key={i} className="flex-row gap-3 items-start">
                <div className={`bento-notif-dot ${act.type === 'shortlisted' ? 'bg-success shadow-[0_0_6px_rgba(16,185,129,0.6)]' : ''}`} />
                <div>
                  <div className="text-xs text-primary-label leading-tight">{act.msg}</div>
                  <div className="text-[10px] text-muted mt-1">{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </TiltCard>

      </div>

      {/* Modals */}
      {view === 'post-job' && (
        <div className="bento-modal-overlay" onClick={() => setView('dashboard')}>
          <div className="bento-modal" onClick={e => e.stopPropagation()}>
            <button className="bento-modal-close" onClick={() => setView('dashboard')}><X size={14}/></button>
            <PostJobForm 
              language={language}
              onSuccess={() => {
                setView('dashboard');
                fetchDashboardData();
              }} 
              onCancel={() => setView('dashboard')}
            />
          </div>
        </div>
      )}

      {view === 'applicants' && selectedJob && (
        <div className="bento-modal-overlay" onClick={() => { setView('dashboard'); setSelectedJob(null); }}>
          <div className="bento-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <button className="bento-modal-close" onClick={() => { setView('dashboard'); setSelectedJob(null); }}><X size={14}/></button>
            <ApplicantPipeline 
              job={selectedJob}
              language={language}
              onBack={() => {
                setView('dashboard');
                setSelectedJob(null);
                fetchDashboardData();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};


/* ==========================================================================
   PostJobForm Component (Employer Job Publishing)
   ========================================================================== */
interface PostJobProps {
  language: 'en' | 'hi';
  onSuccess: () => void;
  onCancel: () => void;
}

const PostJobForm: React.FC<PostJobProps> = ({ language, onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tradeCategory, setTradeCategory] = useState('electrician');
  const [address, setAddress] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobType, setJobType] = useState<'full-time' | 'gig' | 'contract'>('contract');
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Translations
  const t = {
    en: {
      postJob: 'Publish Job Posting',
      title: 'Job Title',
      description: 'Job Description',
      category: 'Trade Category',
      address: 'Work Address / Area',
      salary: 'Salary Range (Monthly/Gig)',
      type: 'Job Type',
      gpsBtn: 'Mark Job Location (GPS)',
      successGps: 'Location marked!',
      publish: 'Publish Post',
      cancel: 'Cancel',
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
      postJob: 'नौकरी पोस्ट करें',
      title: 'नौकरी का शीर्षक',
      description: 'नौकरी का विवरण',
      category: 'काम का प्रकार',
      address: 'काम का पता / स्थान',
      salary: 'वेतन दायरा (मासिक/दहाड़ी)',
      type: 'कार्य प्रकार',
      gpsBtn: 'काम का स्थान दर्ज करें (GPS)',
      successGps: 'स्थान दर्ज हो गया!',
      publish: 'नौकरी पोस्ट करें',
      cancel: 'रद्द करें',
      electrician: 'इलेक्ट्रीशियन (बिजली मिस्त्री)',
      plumber: 'प्लंबर (नलसाज)',
      carpenter: 'कारपेंटर (बढ़ई)',
      delivery: 'डिलीवरी पार्टनर',
      driver: 'ड्राइवर (चालक)',
      housekeeping: 'हाउसकीपिंग (सफाई)',
      mechanic: 'मैकेनिक',
      fresher: 'फ्रेशर',
      other: 'अन्य',
    }
  }[language];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !address) {
      setError('Title, Description, and Address are required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const payload = {
        title,
        description,
        tradeCategory,
        address,
        salaryRange,
        jobType,
        location: {
          type: 'Point' as const,
          coordinates: coords || [77.5946, 12.9716] // MG Road fallback
        }
      };

      await api.jobs.createJob(payload);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Job creation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-white font-bold text-base mb-4">{t.postJob}</h3>

      {error && (
        <div className="text-danger bg-red-950/20 p-2 rounded text-xs text-center mb-3">
          {error}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">{t.title}</label>
        <input 
          type="text" 
          className="input-field" 
          placeholder="e.g. Society Electrician Needed" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.description}</label>
        <textarea 
          className="input-field" 
          placeholder="e.g. Looking for an electrician to wire building switches and fix fuses." 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          rows={3}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.category}</label>
        <select 
          className="input-field select-field" 
          value={tradeCategory} 
          onChange={(e) => setTradeCategory(e.target.value)}
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
        <label className="form-label">{t.salary}</label>
        <input 
          type="text" 
          className="input-field" 
          placeholder="e.g. ₹15,000 - ₹20,000 / month" 
          value={salaryRange} 
          onChange={(e) => setSalaryRange(e.target.value)} 
        />
      </div>

      <div className="form-group">
        <label className="form-label">{t.type}</label>
        <select 
          className="input-field select-field" 
          value={jobType} 
          onChange={(e) => setJobType(e.target.value as any)}
        >
          <option value="contract">Contract / Freelance</option>
          <option value="gig">One-time Gig</option>
          <option value="full-time">Full-time Employee</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">{t.address}</label>
        <input 
          type="text" 
          className="input-field" 
          placeholder="e.g. Sector 62, Noida" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          required
        />
      </div>

      <div className="form-group mb-4">
        <label className="form-label">Location coordinates</label>
        <button
          type="button"
          className={`btn btn-secondary flex-row justify-center ${
            locationStatus === 'success' ? 'border-success text-success' : ''
          }`}
          onClick={detectLocation}
          disabled={locationStatus === 'fetching'}
        >
          <Navigation size={16} />
          {locationStatus === 'idle' && t.gpsBtn}
          {locationStatus === 'fetching' && 'Locating...'}
          {locationStatus === 'success' && t.successGps}
          {locationStatus === 'error' && 'Failed to capture GPS'}
        </button>
      </div>

      <div className="flex-row gap-2">
        <button type="button" className="btn btn-secondary flex-1" onClick={onCancel}>
          {t.cancel}
        </button>
        <button type="submit" className={`btn btn-primary flex-1 ${loading ? 'btn-disabled' : ''}`} disabled={loading}>
          {loading ? '...' : t.publish}
        </button>
      </div>
    </form>
  );
};

/* ==========================================================================
   ApplicantPipeline Component (Candidate screening)
   ========================================================================== */
interface PipelineProps {
  job: any;
  language: 'en' | 'hi';
  onBack: () => void;
}

const ApplicantPipeline: React.FC<PipelineProps> = ({ job, language, onBack }) => {
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Passport Inspector overlay state
  const [selectedPassportId, setSelectedPassportId] = useState<string | null>(null);
  const [passportData, setPassportData] = useState<any>(null);
  const [loadingPassport, setLoadingPassport] = useState(false);

  // Translations
  const t: any = {
    en: {
      candidates: 'Candidates for',
      noApplicants: 'No applications received yet.',
      shortlist: 'Shortlist',
      hire: 'Hire',
      reject: 'Reject',
      viewPassport: 'Inspect Passport',
      pitchIntro: 'Oral Introduction / Pitch',
      badgeTitle: 'Verified Passport Badges',
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
      candidates: 'आवेदन प्राप्त हुए:',
      noApplicants: 'इस नौकरी के लिए कोई आवेदन प्राप्त नहीं हुआ है।',
      shortlist: 'शॉर्टलिस्ट',
      hire: 'नौकरी दें',
      reject: 'अस्वीकार करें',
      viewPassport: 'पासपोर्ट जांचें',
      pitchIntro: 'वॉयस इंट्रोडक्शन / पिच',
      badgeTitle: 'पासपोर्ट सत्यापित बैच',
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

  // Fetch applicants list
  const fetchApplicants = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.jobs.getApplicants(job._id);
      setApplicants(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve applicants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [job._id]);

  // Update applicant status
  const updateStatus = async (appId: string, status: 'applied' | 'shortlisted' | 'hired' | 'rejected') => {
    try {
      await api.jobs.updateApplicationStatus(appId, status);
      fetchApplicants(); // Reload pipeline status list
    } catch (err: any) {
      alert(err.message || 'Status update failed.');
    }
  };

  // Inspect public Skill Passport
  const inspectPassport = async (workerId: string) => {
    setSelectedPassportId(workerId);
    setLoadingPassport(true);
    try {
      const res = await api.workers.getPassport(workerId);
      setPassportData(res.data);
    } catch (err: any) {
      alert(err.message || 'Could not load passport data.');
      setSelectedPassportId(null);
    } finally {
      setLoadingPassport(false);
    }
  };

  return (
    <div className="flex-column gap-3">
      <div className="flex-row">
        <button className="language-pill flex-row" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Dashboard</span>
        </button>
      </div>

      <div className="mb-2">
        <span className="text-secondary-label text-xs">{t.candidates}</span>
        <h3 className="text-white font-bold text-base">{job.title}</h3>
      </div>

      {loading && (
        <div className="text-center py-6">
          <RefreshCw className="animate-spin text-primary mx-auto" size={24} />
        </div>
      )}

      {error && (
        <div className="text-danger bg-red-950/20 p-2 rounded text-xs text-center">
          {error}
        </div>
      )}

      {!loading && applicants.length === 0 && (
        <div className="card text-center py-8">
          <User className="text-muted mx-auto mb-2" size={28} />
          <p className="text-secondary-label text-sm">{t.noApplicants}</p>
        </div>
      )}

      {!loading && applicants.length > 0 && (
        <div className="flex-column gap-3">
          {applicants.map((app) => {
            const worker = app.workerId;
            const statusBadge = {
              applied: 'badge-pending',
              shortlisted: 'badge-info',
              hired: 'badge-verified',
              rejected: 'badge-danger'
            }[app.status as 'applied' | 'shortlisted' | 'hired' | 'rejected'] || 'badge-pending';

            return (
              <div key={app._id} className="card flex-column gap-3">
                <div className="flex-row space-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  <div className="flex-column">
                    <h4 className="text-white font-bold text-sm">{worker?.fullName || 'Worker'}</h4>
                    <span className="text-secondary text-[11px]">{t[worker?.tradeCategory] || worker?.tradeCategory} ({worker?.experienceYears} {language === 'hi' ? 'वर्ष अनुभव' : 'Years Exp'})</span>
                  </div>
                  <span className={`badge ${statusBadge}`}>{app.status}</span>
                </div>

                {/* Voice Pitch Introduction Player */}
                {app.voicePitchUrl && (
                  <div className="flex-column bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-accent font-bold text-xs uppercase mb-2 flex-row">
                      <Play size={12} fill="currentColor" />
                      {t.pitchIntro}
                    </span>
                    <audio src={app.voicePitchUrl} controls style={{ width: '100%', height: '36px' }} />
                  </div>
                )}

                <div className="flex-row gap-2 mt-1">
                  <button className="btn btn-secondary flex-1 py-2 text-xs flex-row justify-center" onClick={() => inspectPassport(worker._id)}>
                    <FileText size={14} />
                    <span>{t.viewPassport}</span>
                  </button>

                  <div className="flex-row gap-1">
                    <button 
                      className="btn btn-secondary bg-sky-950/20 text-sky-400 border border-sky-900/30 p-2 rounded" 
                      onClick={() => updateStatus(app._id, 'shortlisted')}
                      title={t.shortlist}
                    >
                      <Clock size={16} />
                    </button>
                    <button 
                      className="btn btn-success p-2 rounded" 
                      onClick={() => updateStatus(app._id, 'hired')}
                      title={t.hire}
                    >
                      <Check size={16} />
                    </button>
                    <button 
                      className="btn btn-danger p-2 rounded" 
                      onClick={() => updateStatus(app._id, 'rejected')}
                      title={t.reject}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Public Skill Passport Inspector Modal Overlay */}
      {selectedPassportId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex-row space-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h3 className="text-white font-bold text-base">Verified Skill Passport</h3>
              <button className="text-muted hover:text-white" onClick={() => {
                setSelectedPassportId(null);
                setPassportData(null);
              }}>
                <X size={18} />
              </button>
            </div>

            {loadingPassport ? (
              <div className="text-center py-6">
                <RefreshCw className="animate-spin text-primary mx-auto" size={24} />
              </div>
            ) : passportData ? (
              <div className="flex-column gap-3">
                <div>
                  <h4 className="text-white font-bold text-base">{passportData.fullName}</h4>
                  <span className="badge badge-verified mt-1">{(t[passportData.tradeCategory] || passportData.tradeCategory).toUpperCase()}</span>
                </div>

                <div className="flex-column gap-2 text-xs bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex-row space-between">
                    <span className="text-secondary">{language === 'hi' ? 'अनुभव:' : 'Experience:'}</span>
                    <span className="text-white font-bold">{passportData.experienceYears} {language === 'hi' ? 'वर्ष' : 'Years'}</span>
                  </div>
                  <div className="flex-row space-between">
                    <span className="text-secondary">{language === 'hi' ? 'पसंदीदा भाषाएं:' : 'Preferred Languages:'}</span>
                    <span className="text-white font-bold">
                      {passportData.languages?.map((l: string) => l === 'hi' ? 'हिन्दी' : l === 'en' ? 'English' : l).join(', ')}
                    </span>
                  </div>
                  <div className="flex-row space-between">
                    <span className="text-secondary">{language === 'hi' ? 'काम का स्थान:' : 'Location Area:'}</span>
                    <span className="text-white font-bold">{passportData.address}</span>
                  </div>
                  <div className="flex-row space-between">
                    <span className="text-secondary">{language === 'hi' ? 'रेटिंग:' : 'Customer Rating:'}</span>
                    <span className="text-accent font-bold flex-row gap-1">
                      <Star size={12} fill="currentColor" />
                      {passportData.rating?.toFixed(1) || '5.0'} ({passportData.reviewCount || 0} {language === 'hi' ? 'समीक्षाएं' : 'reviews'})
                    </span>
                  </div>
                </div>

                {/* Verified badges details */}
                <div>
                  <span className="text-white font-bold text-xs uppercase tracking-wider mb-2 block">{t.badgeTitle}</span>
                  {passportData.verifiedBadges && passportData.verifiedBadges.length > 0 ? (
                    <div className="flex-column gap-2">
                      {passportData.verifiedBadges.map((b: any, i: number) => (
                        <div key={i} className="flex-row space-between p-2 rounded bg-success/10 border border-success/20 text-xs">
                          <span className="text-success font-semibold flex-row gap-1">
                            <Award size={14} />
                            {b.badgeName}
                          </span>
                          <span className="text-success font-bold">{b.score}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted text-xs">No verified credentials. Self-declared experience listed.</p>
                  )}
                </div>

                {/* Skills progress list */}
                {passportData.skills && passportData.skills.length > 0 && (
                  <div>
                    <span className="text-white font-bold text-xs uppercase tracking-wider mb-2 block">Passport Skills</span>
                    <div className="flex-column gap-2">
                      {passportData.skills.map((s: string, i: number) => (
                        <div key={i} className="flex-column gap-1">
                          <div className="flex-row space-between text-xs text-secondary font-semibold">
                            <span>{s}</span>
                            <span className="text-success">85%</span>
                          </div>
                          <div className="score-progress-bar">
                            <div className="score-progress-fill" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
