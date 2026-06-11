import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { 
  MapPin, Briefcase, IndianRupee, Clock, Navigation, 
  Mic, Square, Send, CheckCircle, X, ShieldAlert 
} from 'lucide-react';

interface JobFeedProps {
  language: 'en' | 'hi';
}

export const JobFeed: React.FC<JobFeedProps> = ({ language }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [category, setCategory] = useState<string>('');
  
  // Modal State
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  // Translations
  const t = {
    en: {
      findJobs: 'Jobs Near You',
      radiusLabel: 'Search Radius',
      categoryAll: 'All Categories',
      distance: 'away',
      salary: 'Salary',
      type: 'Job Type',
      applyBtn: 'Quick Apply (Voice)',
      appliedBtn: 'Applied',
      noJobs: 'No jobs found in this area. Try expanding your search radius.',
      locating: 'Locating you...',
      gpsRequired: 'Please enable GPS access to see jobs near you.',
      retryGps: 'Access Location',
      electrician: 'Electrician',
      plumber: 'Plumber',
      painter: 'Painter',
      carpenter: 'Carpenter',
      delivery: 'Delivery Partner',
      housekeeping: 'Housekeeping / Cleaning',
    },
    hi: {
      findJobs: 'आस-पास के रोजगार',
      radiusLabel: 'खोज का दायरा',
      categoryAll: 'सभी काम',
      distance: 'की दूरी पर',
      salary: 'वेतन',
      type: 'कार्य प्रकार',
      applyBtn: 'जल्दी अप्लाई (आवाज़ से)',
      appliedBtn: 'अप्लाई कर दिया',
      noJobs: 'इस क्षेत्र में कोई काम नहीं मिला। खोज का दायरा बढ़ा कर देखें।',
      locating: 'आपका स्थान खोज रहे हैं...',
      gpsRequired: 'आस-पास की नौकरियां देखने के लिए कृपया जीपीएस अनुमति दें।',
      retryGps: 'स्थान का पता लगाएं',
      electrician: 'बिजली मिस्त्री',
      plumber: 'नलसाज',
      painter: 'पेंटर',
      carpenter: 'बढ़ई',
      delivery: 'डिलीवरी पार्टनर',
      housekeeping: 'सफाई / हाउसकीपिंग',
    }
  }[language];

  // Request user coordinates
  const getUserLocation = () => {
    setLoading(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords([position.coords.longitude, position.coords.latitude]);
      },
      () => {
        // Fallback coordinates: Bangalore MG Road for testing convenience
        setCoords([77.5946, 12.9716]);
        setError('Could not access GPS. Displaying fallback Bangalore jobs.');
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch jobs once coordinates are fetched
  const fetchNearbyJobs = async () => {
    if (!coords) return;
    setLoading(true);
    try {
      const res = await api.jobs.getNearby({
        lng: coords[0],
        lat: coords[1],
        radiusKm,
        category: category || undefined
      });
      setJobs(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to search nearby jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (coords) {
      fetchNearbyJobs();
    }
  }, [coords, radiusKm, category]);

  return (
    <div className="flex-column gap-3">
      {/* Search Filter Box */}
      <div className="card bg-black/40">
        <h3 className="text-white font-bold text-sm mb-3">{t.findJobs}</h3>
        
        <div className="form-group">
          <label className="form-label">{t.radiusLabel}</label>
          <select 
            className="input-field select-field py-2 text-xs" 
            value={radiusKm} 
            onChange={(e) => setRadiusKm(Number(e.target.value))}
          >
            <option value={5}>5 Km</option>
            <option value={10}>10 Km</option>
            <option value={20}>20 Km</option>
            <option value={50}>50 Km</option>
          </select>
        </div>

        <div className="form-group mb-0">
          <label className="form-label">Trade Filters</label>
          <select 
            className="input-field select-field py-2 text-xs" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">{t.categoryAll}</option>
            <option value="electrician">{t.electrician}</option>
            <option value="plumber">{t.plumber}</option>
            <option value="painter">{t.painter}</option>
            <option value="carpenter">{t.carpenter}</option>
            <option value="delivery">{t.delivery}</option>
            <option value="housekeeping">{t.housekeeping}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="text-accent bg-amber-950/20 border border-amber-900/30 p-3 rounded-lg text-xs flex-row">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Geolocation missing prompts */}
      {!coords && !loading && (
        <div className="card text-center py-6">
          <Navigation className="text-muted mx-auto mb-2" size={32} />
          <p className="text-secondary-label text-sm mb-4">{t.gpsRequired}</p>
          <button className="btn btn-primary text-xs py-2 w-auto mx-auto" onClick={getUserLocation}>
            {t.retryGps}
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-6">
          <Clock className="animate-spin text-primary mx-auto" size={24} />
          <p className="text-secondary-label text-xs mt-2">{t.locating}</p>
        </div>
      )}

      {/* Job listings container */}
      {coords && !loading && jobs.length === 0 && (
        <div className="card text-center py-8">
          <Briefcase className="text-muted mx-auto mb-2" size={28} />
          <p className="text-secondary-label text-sm">{t.noJobs}</p>
        </div>
      )}

      {coords && !loading && jobs.length > 0 && (
        <div className="job-feed-list">
          {jobs.map((job) => (
            <JobCard 
              key={job._id} 
              job={job} 
              language={language}
              t={t}
              onApplyClick={() => setSelectedJob(job)} 
            />
          ))}
        </div>
      )}

      {/* Quick Apply Dialog */}
      {selectedJob && (
        <QuickApplyModal 
          job={selectedJob} 
          language={language}
          onClose={() => setSelectedJob(null)}
          onSuccess={() => {
            setSelectedJob(null);
            fetchNearbyJobs(); // Refresh application status indicators
          }}
        />
      )}
    </div>
  );
};

/* ==========================================================================
   JobCard Component
   ========================================================================== */
interface JobCardProps {
  job: any;
  language: 'en' | 'hi';
  t: any;
  onApplyClick: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, language: _language, t, onApplyClick }) => {
  // Compute distance in Km
  const distance = job.distance ? (job.distance / 1000).toFixed(1) : '1.2';
  const hasApplied = job.hasApplied || false; // Backend check helper if available

  return (
    <div className="card job-card">
      <div className="flex-row space-between">
        <h4 className="text-white font-bold text-base">{job.title}</h4>
        <span className="badge badge-info">{job.tradeCategory}</span>
      </div>

      <p className="text-secondary-label text-xs line-clamp-2">{job.description}</p>

      {/* Meta specifications */}
      <div className="job-meta-row mt-1">
        <div className="job-meta-item">
          <MapPin size={14} className="text-primary" />
          <span>{distance} Km {t.distance} ({job.address})</span>
        </div>
        
        {job.salaryRange && (
          <div className="job-meta-item">
            <IndianRupee size={14} className="text-success" />
            <span>{job.salaryRange}</span>
          </div>
        )}

        <div className="job-meta-item">
          <Clock size={14} className="text-accent" />
          <span>{job.jobType || 'Contract'}</span>
        </div>
      </div>

      <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {hasApplied ? (
          <button className="btn btn-secondary py-2 text-xs btn-disabled" disabled>
            {t.appliedBtn}
          </button>
        ) : (
          <button className="btn btn-primary py-2 text-xs" onClick={onApplyClick}>
            {t.applyBtn}
          </button>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   QuickApplyModal (Voice Pitch Application Overlay)
   ========================================================================== */
interface QuickApplyProps {
  job: any;
  language: 'en' | 'hi';
  onClose: () => void;
  onSuccess: () => void;
}

const QuickApplyModal: React.FC<QuickApplyProps> = ({
  job,
  language,
  onClose,
  onSuccess,
}) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const t = {
    en: {
      applyTitle: 'Quick Apply via Voice',
      jobLabel: 'Applying for:',
      instruction: 'Instead of writing a resume, record a 20-30 second oral introduction explaining your experience and why you are suitable.',
      recordBtn: 'Record Voice Note',
      stopBtn: 'Stop Recording',
      sendBtn: 'Submit Pitch Application',
      successMsg: 'Application submitted successfully!',
      errorHead: 'Error',
      closeBtn: 'Close',
    },
    hi: {
      applyTitle: 'आवाज़ से जल्दी अप्लाई करें',
      jobLabel: 'नौकरी का नाम:',
      instruction: 'बिना कोई रेज़्युमे बनाए, २०-३० सेकंड की रिकॉर्डिंग में अपना अनुभव समझाएं और बताएं कि आप यह काम क्यों करना चाहते हैं।',
      recordBtn: 'आवाज़ रिकॉर्ड करें',
      stopBtn: 'रिकॉर्डिंग बंद करें',
      sendBtn: 'आवेदन जमा करें',
      successMsg: 'आपका आवेदन सफलतापूर्वक जमा हो गया है!',
      errorHead: 'त्रुटि',
      closeBtn: 'बंद करें',
    }
  }[language];

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
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setError('');
    } catch (err) {
      setError('Microphone access denied. Enable permissions in your browser.');
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Submit application
  const handleSubmit = async () => {
    if (!audioBlob) {
      setError('Please record a voice intro before submitting.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.jobs.apply(job._id, audioBlob);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Hiring portal application failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex-row space-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <h3 className="text-white font-bold text-base">{t.applyTitle}</h3>
          <button className="text-muted hover:text-white" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="text-danger bg-red-950/20 p-2 rounded text-xs text-center">
            <strong>{t.errorHead}: </strong> {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-4">
            <CheckCircle className="text-success mx-auto mb-2" size={40} />
            <p className="text-white font-semibold text-sm mb-4">{t.successMsg}</p>
            <button className="btn btn-primary" onClick={onSuccess}>
              {t.closeBtn}
            </button>
          </div>
        ) : (
          <div className="flex-column gap-3">
            <div>
              <span className="text-secondary-label text-xs">{t.jobLabel}</span>
              <h4 className="text-accent font-bold text-sm">{job.title}</h4>
            </div>

            <p className="text-secondary-label text-xs leading-relaxed">
              {t.instruction}
            </p>

            {/* Visual audio wave bouncing */}
            <div className="voice-wave">
              <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
              <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
              <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
              <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
              <div className={`voice-wave-bar ${recording ? 'voice-wave-bar-recording' : ''}`}></div>
            </div>

            {/* Audio recorder buttons */}
            <div className="mic-btn-container" style={{ margin: '10px 0' }}>
              {recording ? (
                <button className="mic-btn mic-btn-recording" onClick={stopRecording}>
                  <Square size={20} className="text-white" />
                </button>
              ) : (
                <button className="mic-btn" onClick={startRecording}>
                  <Mic size={24} className="text-white" />
                </button>
              )}
              <span className="text-muted text-xs">
                {recording ? t.stopBtn : t.recordBtn}
              </span>
            </div>

            {audioUrl && (
              <div className="audio-player-card">
                <audio src={audioUrl} controls style={{ width: '100%' }} />
              </div>
            )}

            {audioBlob && (
              <button 
                className={`btn btn-primary flex-row justify-center mt-2 ${loading ? 'btn-disabled' : ''}`}
                onClick={handleSubmit}
                disabled={loading}
              >
                <Send size={16} />
                <span>{loading ? '...' : t.sendBtn}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
