import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  MapPin, Briefcase, IndianRupee, Clock, ShieldAlert 
} from 'lucide-react';

interface JobFeedProps {
  language: 'en' | 'hi';
  workerCoordinates?: [number, number];
}

export const JobFeed: React.FC<JobFeedProps> = ({ language, workerCoordinates }) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [category, setCategory] = useState<string>('');

  // Translations
  const t = {
    en: {
      findJobs: 'Jobs Near You',
      radiusLabel: 'Search Radius',
      categoryAll: 'All Categories',
      distance: 'away',
      salary: 'Salary',
      type: 'Job Type',
      applyBtn: 'Apply Now',
      appliedBtn: 'Applied',
      noJobs: 'No jobs found in this area. Try expanding your search radius.',
      noRange: 'No Range (All Jobs)',
      locating: 'Loading jobs near you...',
      gpsRequired: 'Please enable GPS access to see jobs near you.',
      retryGps: 'Access Location',
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
      findJobs: 'आस-पास के रोजगार',
      radiusLabel: 'खोज का दायरा',
      categoryAll: 'सभी काम',
      distance: 'की दूरी पर',
      salary: 'वेतन',
      type: 'कार्य प्रकार',
      applyBtn: 'अप्लाई करें',
      appliedBtn: 'अप्लाई कर दिया',
      noJobs: 'इस क्षेत्र में कोई काम नहीं मिला। खोज का दायरा बढ़ा कर देखें।',
      noRange: 'कोई सीमा नहीं (सभी काम)',
      locating: 'काम खोज रहे हैं...',
      gpsRequired: 'आस-पास की नौकरियां देखने के लिए कृपया जीपीएस अनुमति दें।',
      retryGps: 'स्थान का पता लगाएं',
      electrician: 'बिजली मिस्त्री',
      plumber: 'नलसाज',
      carpenter: 'बढ़ई',
      delivery: 'डिलीवरी पार्टनर',
      driver: 'ड्राइवर',
      housekeeping: 'सफाई / हाउसकीपिंग',
      mechanic: 'मैकेनिक',
      fresher: 'फ्रेशर',
      other: 'अन्य',
    }
  }[language];

  // Set coordinates from profile or default to Noida fallback
  useEffect(() => {
    if (workerCoordinates && workerCoordinates.length === 2 && workerCoordinates[0] !== 0) {
      setCoords(workerCoordinates);
    } else {
      setCoords([77.3718, 28.6273]); // Noida Sector 62 fallback coordinates
    }
  }, [workerCoordinates]);

  // Fetch jobs once coordinates are loaded
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

  const handleApplyDirect = async (jobId: string) => {
    setLoading(true);
    setError('');
    try {
      await api.jobs.apply(jobId);
      await fetchNearbyJobs(); // Refresh application status
    } catch (err: any) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

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
            <option value={-1}>{t.noRange}</option>
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
            <option value="carpenter">{t.carpenter}</option>
            <option value="delivery">{t.delivery}</option>
            <option value="driver">{t.driver}</option>
            <option value="housekeeping">{t.housekeeping}</option>
            <option value="mechanic">{t.mechanic}</option>
            <option value="fresher">{t.fresher}</option>
            <option value="other">{t.other}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="text-accent bg-amber-950/20 border border-amber-900/30 p-3 rounded-lg text-xs flex-row">
          <ShieldAlert size={16} />
          <span>{error}</span>
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
              onApplyClick={handleApplyDirect} 
            />
          ))}
        </div>
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
  onApplyClick: (jobId: string) => void;
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
          <button className="btn btn-primary py-2 text-xs" onClick={() => onApplyClick(job._id)}>
            {t.applyBtn}
          </button>
        )}
      </div>
    </div>
  );
};
