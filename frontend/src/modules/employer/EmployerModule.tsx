import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Briefcase, Plus, Clock, User, 
  Award, Play, Check, X, Star, FileText, ArrowLeft, RefreshCw, Navigation 
} from 'lucide-react';

interface EmployerModuleProps {
  user: any;
  language: 'en' | 'hi';
  onLogout: () => void;
}

export const EmployerModule: React.FC<EmployerModuleProps> = ({
  user: _user,
  language,
  onLogout,
}) => {
  const [view, setView] = useState<'dashboard' | 'post-job' | 'applicants'>('dashboard');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pipeline targets
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Translations
  const t = {
    en: {
      employerPortal: 'Employer Dashboard',
      postJobBtn: 'Post a New Job',
      noJobs: 'You have not posted any jobs yet.',
      applicantsCount: 'Applicants',
      posted: 'Posted on',
      backBtn: 'Back to Dashboard',
      logout: 'Logout',
    },
    hi: {
      employerPortal: 'नियोक्ता डैशबोर्ड',
      postJobBtn: 'नई नौकरी पोस्ट करें',
      noJobs: 'आपने अभी तक कोई नौकरी पोस्ट नहीं की है।',
      applicantsCount: 'आवेदन मिले',
      posted: 'पोस्टिंग तिथि',
      backBtn: 'डैशबोर्ड पर लौटें',
      logout: 'लॉगआउट',
    }
  }[language];

  // Fetch jobs posted by employer
  const fetchMyJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.jobs.getEmployerJobs();
      setJobs(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="flex-row">
          <Briefcase className="text-accent" size={20} />
          <h2 className="text-sm font-bold">{t.employerPortal}</h2>
        </div>
        <button className="language-pill" onClick={onLogout}>{t.logout}</button>
      </header>

      <div className="app-main">
        {error && (
          <div className="text-danger bg-red-950/20 p-3 rounded-lg text-xs text-center">
            {error}
          </div>
        )}

        {view === 'dashboard' && (
          <div className="flex-column gap-3">
            <button className="btn btn-primary flex-row justify-center" onClick={() => setView('post-job')}>
              <Plus size={18} />
              <span>{t.postJobBtn}</span>
            </button>

            {loading && (
              <div className="text-center py-6">
                <RefreshCw className="animate-spin text-primary mx-auto" size={24} />
              </div>
            )}

            {!loading && jobs.length === 0 && (
              <div className="card text-center py-8">
                <Briefcase className="text-muted mx-auto mb-2" size={28} />
                <p className="text-secondary-label text-sm">{t.noJobs}</p>
              </div>
            )}

            {!loading && jobs.length > 0 && (
              <div className="job-feed-list">
                {jobs.map((job) => (
                  <div 
                    key={job._id} 
                    className="card card-interactive job-card"
                    onClick={() => {
                      setSelectedJob(job);
                      setView('applicants');
                    }}
                  >
                    <div className="flex-row space-between">
                      <h4 className="text-white font-bold text-base">{job.title}</h4>
                      <span className="badge badge-info">{job.tradeCategory}</span>
                    </div>
                    <p className="text-secondary-label text-xs line-clamp-2">{job.description}</p>
                    
                    <div className="flex-row space-between mt-2 pt-2 text-xs text-secondary" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span>{t.posted}: {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span className="font-bold text-accent">{job.applicationsCount || 0} {t.applicantsCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'post-job' && (
          <PostJobForm 
            language={language}
            onSuccess={() => {
              setView('dashboard');
              fetchMyJobs();
            }} 
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'applicants' && selectedJob && (
          <ApplicantPipeline 
            job={selectedJob}
            language={language}
            onBack={() => {
              setView('dashboard');
              setSelectedJob(null);
              fetchMyJobs();
            }}
          />
        )}
      </div>
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
          <option value="electrician">Electrician</option>
          <option value="plumber">Plumber</option>
          <option value="painter">Painter</option>
          <option value="carpenter">Carpenter</option>
          <option value="delivery">Delivery Partner</option>
          <option value="housekeeping">Housekeeping / Cleaning</option>
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
  const t = {
    en: {
      candidates: 'Candidates for',
      noApplicants: 'No applications received yet.',
      shortlist: 'Shortlist',
      hire: 'Hire',
      reject: 'Reject',
      viewPassport: 'Inspect Passport',
      pitchIntro: 'Oral Introduction / Pitch',
      badgeTitle: 'Verified Passport Badges',
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
                    <span className="text-secondary text-[11px]">{worker?.tradeCategory} ({worker?.experienceYears} Years Exp)</span>
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
                  <span className="badge badge-verified mt-1">{passportData.tradeCategory.toUpperCase()}</span>
                </div>

                <div className="flex-column gap-2 text-xs bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex-row space-between">
                    <span className="text-secondary">Experience:</span>
                    <span className="text-white font-bold">{passportData.experienceYears} Years</span>
                  </div>
                  <div className="flex-row space-between">
                    <span className="text-secondary">Preferred Languages:</span>
                    <span className="text-white font-bold">{passportData.languages?.join(', ')}</span>
                  </div>
                  <div className="flex-row space-between">
                    <span className="text-secondary">Location Area:</span>
                    <span className="text-white font-bold">{passportData.address}</span>
                  </div>
                  <div className="flex-row space-between">
                    <span className="text-secondary">Customer Rating:</span>
                    <span className="text-accent font-bold flex-row gap-1">
                      <Star size={12} fill="currentColor" />
                      {passportData.rating?.toFixed(1) || '5.0'} ({passportData.reviewCount || 0} reviews)
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
