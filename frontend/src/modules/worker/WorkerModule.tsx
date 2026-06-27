import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  User, Award, Star, Languages, Clock, MapPin, 
  RefreshCw, Download,
  Briefcase, MessageSquare, Settings, ChevronRight,
  Mic, Bell, ChevronLeft, X
} from 'lucide-react';
import { TiltCard } from '../../components/TiltCard';

interface WorkerModuleProps {
  user: any;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  onLogout: () => void;
  renderJobFeed: (coords?: [number, number]) => React.ReactNode;
}

type ModalView = null | 'chat' | 'edit' | 'passport-full';

export const WorkerModule: React.FC<WorkerModuleProps> = ({
  user: _user,
  language,
  setLanguage,
  onLogout,
  renderJobFeed,
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [modalView, setModalView] = useState<ModalView>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  const t = {
    en: {
      welcome: 'Welcome back,', logout: 'Logout', findJobs: 'Nearby Jobs',
      myPassport: 'Skill Passport', chatTab: 'Messages', profileTab: 'Settings',
      assessmentAlert: 'Boost your visibility!', takeAssessmentBtn: 'Start Voice Assessment',
      loading: 'Loading dashboard...', verifyHeader: 'SkillVerse Passport',
      experience: 'Yrs Exp', verifiedSkills: 'Verified Skills', badges: 'Badges',
      languages: 'Languages', location: 'Location', downloadPdf: 'Download PDF Passport',
      noBadges: 'No badges yet. Complete an assessment!', rating: 'Rating', joined: 'Joined',
      electrician:'Electrician',plumber:'Plumber',carpenter:'Carpenter',delivery:'Delivery Partner',
      driver:'Driver',housekeeping:'Housekeeping',mechanic:'Mechanic',fresher:'Fresher',other:'Other',
    },
    hi: {
      welcome: 'स्वागत है,', logout: 'लॉगआउट', findJobs: 'नज़दीकी काम',
      myPassport: 'मेरा पासपोर्ट', chatTab: 'संदेश', profileTab: 'सेटिंग्स',
      assessmentAlert: 'एआई वोकल परीक्षा दें!', takeAssessmentBtn: 'वॉयस परीक्षण शुरू करें',
      loading: 'डैशबोर्ड लोड हो रहा है...', verifyHeader: 'स्किलवर्स पासपोर्ट',
      experience: 'अनुभव', verifiedSkills: 'सत्यापित कौशल', badges: 'बैज',
      languages: 'भाषाएं', location: 'स्थान', downloadPdf: 'पीडीएफ पासपोर्ट',
      noBadges: 'कोई बैज नहीं।', rating: 'रेटिंग', joined: 'सदस्यता',
      electrician:'इलेक्ट्रीशियन',plumber:'प्लंबर',carpenter:'कारपेंटर',delivery:'डिलीवरी पार्टनर',
      driver:'ड्राइवर',housekeeping:'हाउसकीपिंग',mechanic:'मैकेनिक',fresher:'फ्रेशर',other:'अन्य',
    }
  }[language];

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const [profileRes, jobsRes, appsRes] = await Promise.allSettled([
        api.workers.getProfile(),
        api.jobs.getNearbyJobs(),
        api.jobs.getWorkerApplications(),
      ]);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
      if (jobsRes.status === 'fulfilled') setJobs((jobsRes.value as any).data || []);
      if (appsRes.status === 'fulfilled') {
        const d = (appsRes.value as any);
        setApplications(Array.isArray(d) ? d : d.data || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingProfile(false); }
  };

  useEffect(() => { fetchProfile(); }, []);

  if (loadingProfile) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:12 }}>
        <RefreshCw className="animate-spin" size={32} style={{ color:'var(--primary)' }} />
        <p style={{ color:'var(--text-secondary)', fontSize:14 }}>{t.loading}</p>
      </div>
    );
  }

  const tradeLabel = t[profile?.tradeCategory as keyof typeof t] as string || profile?.tradeCategory || '';

  return (
    <>
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-logo">
          <Briefcase size={20} />
          <span>SkillVerse</span>
        </div>
        <div className="flex-row gap-3">
          <span style={{ fontSize:13, color:'var(--text-secondary)' }}>
            {t.welcome} <strong style={{ color:'#fff' }}>{profile?.fullName?.split(' ')[0] || 'Worker'}</strong>
          </span>
          <button className="language-pill" style={{ fontSize:12, padding:'4px 12px' }}
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}>
            {language === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <button className="language-pill" style={{ fontSize:12, padding:'4px 12px' }} onClick={onLogout}>
            {t.logout}
          </button>
        </div>
      </header>

      {/* ── Bento Grid ── */}
      <div className="bento-grid">

        {/* ① PASSPORT — left column, spans 2 rows */}
        <TiltCard className="bento-cell bento-cell--passport" maxTilt={5} hoverScale={1.01}>
          <div className="bento-section-header">
            <span className="bento-section-title">{t.verifyHeader}</span>
            <span className="badge badge-verified" style={{ fontSize:10 }}>VERIFIED</span>
          </div>

          {/* Name + trade */}
          <div>
            <h2 style={{ fontSize:22, fontWeight:900, fontFamily:'var(--font-display)', color:'#fff', marginBottom:4 }}>
              {profile?.fullName || 'Worker'}
            </h2>
            <span className="badge badge-primary" style={{ fontSize:11 }}>{tradeLabel.toUpperCase()}</span>
          </div>

          {/* Details */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { icon: <Clock size={14}/>, label: t.experience, value: `${profile?.experienceYears || 0} ${language==='hi'?'वर्ष':'yrs'}` },
              { icon: <Languages size={14}/>, label: t.languages, value: (profile?.languages||['en']).map((l:string)=>l==='hi'?'हिन्दी':'English').join(', ') },
              { icon: <MapPin size={14}/>, label: t.location, value: profile?.address || '—' },
              { icon: <Star size={14}/>, label: t.rating, value: `★ ${profile?.rating?.toFixed(1)||'5.0'} (${profile?.reviewCount||0})` },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-muted)' }}>
                  {icon}<span>{label}</span>
                </div>
                <span style={{ fontWeight:600, color:'#fff', textAlign:'right', maxWidth:'55%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Progress bar — skill score */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)', marginBottom:6, fontFamily:'var(--font-display)', fontWeight:700, letterSpacing:'0.04em', textTransform:'uppercase' }}>
              <span>Skill Score</span>
              <span style={{ color:'#a5b4fc' }}>{Math.min(100, (profile?.verifiedBadges?.length||0)*20 + 40)}%</span>
            </div>
            <div className="score-progress-bar">
              <div className="score-progress-fill" style={{ width:`${Math.min(100,(profile?.verifiedBadges?.length||0)*20+40)}%` }} />
            </div>
          </div>

          {/* Badges */}
          <div>
            <p style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-muted)', marginBottom:8, fontFamily:'var(--font-display)' }}>{t.badges}</p>
            {profile?.verifiedBadges?.length > 0 ? (
              profile.verifiedBadges.map((b:any, i:number) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'var(--r-sm)', padding:'7px 12px', marginBottom:6, fontSize:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Award size={13} style={{ color:'var(--success)' }} />
                    <span style={{ fontWeight:600, color:'#fff' }}>{b.badgeName}</span>
                  </div>
                  <span style={{ color:'var(--success)', fontWeight:700 }}>{b.score}%</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize:12, color:'var(--text-muted)' }}>{t.noBadges}</p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:'auto' }}>
            <button className="btn btn-ghost" style={{ fontSize:13, padding:'10px 16px' }}
              onClick={() => alert('PDF generation queued.')}>
              <Download size={14} /> {t.downloadPdf}
            </button>
            <button className="btn btn-ghost" style={{ fontSize:13, padding:'10px 16px' }}
              onClick={() => setModalView('edit')}>
              <Settings size={14} /> Edit Profile
            </button>
          </div>
        </TiltCard>

        {/* ② STATS */}
        <TiltCard className="bento-cell bento-cell--stats" maxTilt={10}>
          <div className="bento-section-header">
            <span className="bento-section-title">Quick Stats</span>
          </div>
          <div className="bento-stat-grid">
            <div className="bento-stat-card">
              <div className="bento-stat-icon bento-stat-icon--indigo"><Briefcase size={16}/></div>
              <div>
                <div className="bento-stat-value">{applications.length}</div>
                <div className="bento-stat-label">Jobs Applied</div>
              </div>
            </div>
            <div className="bento-stat-card">
              <div className="bento-stat-icon bento-stat-icon--violet"><Award size={16}/></div>
              <div>
                <div className="bento-stat-value">{Math.min(100,(profile?.verifiedBadges?.length||0)*20+40)}</div>
                <div className="bento-stat-label">Skill Score</div>
              </div>
            </div>
            <div className="bento-stat-card">
              <div className="bento-stat-icon bento-stat-icon--amber"><Star size={16}/></div>
              <div>
                <div className="bento-stat-value">{profile?.reviewCount || 0}</div>
                <div className="bento-stat-label">Reviews</div>
              </div>
            </div>
          </div>
        </TiltCard>

        {/* ③ MAP */}
        <TiltCard className="bento-cell bento-cell--map" maxTilt={10}>
          <div className="bento-section-header">
            <span className="bento-section-title">Nearby Opportunities</span>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>{jobs.length} jobs found</span>
          </div>
          <div className="bento-map-placeholder">
            {/* Decorative pins */}
            {[{top:'30%',left:'25%'},{top:'55%',left:'60%'},{top:'20%',left:'70%'},{top:'65%',left:'30%'}].map((pos,i)=>(
              <div key={i} style={{ position:'absolute', top:pos.top, left:pos.left, transform:'translate(-50%,-50%)' }}>
                <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div className="bento-map-pulse" style={{ animationDelay:`${i*0.5}s` }} />
                  <div className="bento-map-pin-dot" />
                </div>
              </div>
            ))}
            <div style={{ position:'absolute', bottom:10, left:12, fontSize:10, color:'var(--text-muted)', fontFamily:'var(--font-display)', fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase' }}>
              📍 {profile?.address || 'Your area'}
            </div>
          </div>
        </TiltCard>

        {/* ④ JOB FEED */}
        <TiltCard className="bento-cell bento-cell--feed" maxTilt={5} hoverScale={1.01}>
          <div className="bento-section-header">
            <span className="bento-section-title">{t.findJobs}</span>
            <button className="bento-section-action">View all →</button>
          </div>
          <div className="bento-feed-scroll">
            {jobs.length > 0 ? jobs.slice(0,10).map((job:any, i:number) => (
              <div key={i} className="bento-feed-row">
                <div>
                  <div className="bento-feed-title">{job.title}</div>
                  <div className="bento-feed-meta">
                    <MapPin size={10} style={{ display:'inline', marginRight:3 }} />{job.address || 'Local Area'}
                    {job.salaryRange && <span style={{ marginLeft:8, color:'var(--accent)', fontWeight:600 }}>{job.salaryRange}</span>}
                  </div>
                </div>
                <span className="badge badge-info" style={{ fontSize:10, whiteSpace:'nowrap' }}>
                  {job.tradeCategory?.toUpperCase()}
                </span>
              </div>
            )) : (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-muted)', fontSize:13 }}>
                <Briefcase size={28} style={{ margin:'0 auto 8px', display:'block', opacity:0.4 }} />
                No nearby jobs found yet.
              </div>
            )}
          </div>
        </TiltCard>

        {/* ⑤ VOICE CTA */}
        <TiltCard className="bento-cell bento-cell--voice" maxTilt={12}>
          <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:14 }}>
            <button
              style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,var(--primary),var(--secondary))', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 0 32px rgba(99,102,241,0.5)', transition:'transform 0.2s ease' }}
              onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.1)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
              onClick={() => alert('Voice Assessment module — connect your microphone to begin the oral skills test.')}
            >
              <Mic size={28} color="#fff" />
            </button>
            <div style={{ textAlign:'center' }}>
              <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:15, color:'#fff', marginBottom:4 }}>
                Start Voice Assessment
              </p>
              <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>
                Earn verified badges &amp; boost your profile visibility
              </p>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {['3 mins','AI graded','Free'].map(tag=>(
                <span key={tag} style={{ fontSize:10, background:'rgba(99,102,241,0.12)', border:'1px solid rgba(99,102,241,0.25)', color:'#a5b4fc', borderRadius:'99px', padding:'3px 9px', fontWeight:600, fontFamily:'var(--font-display)' }}>{tag}</span>
              ))}
            </div>
          </div>
        </TiltCard>

        {/* ⑥ MESSAGES + NOTIFICATIONS */}
        <TiltCard className="bento-cell bento-cell--msgs" maxTilt={8}>
          {/* Messages */}
          <div className="bento-section-header">
            <span className="bento-section-title">Messages</span>
            <button className="bento-section-action" onClick={() => setModalView('chat')}>Open →</button>
          </div>
          <div>
            {applications.slice(0,2).map((app:any, i:number) => (
              <div key={i} className="bento-msg-row" onClick={() => setModalView('chat')}>
                <div className="bento-msg-avatar">
                  {(app.jobId?.title||'J')[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="bento-msg-text">{app.jobId?.title || 'Job Application'}</div>
                  <div className="bento-msg-sub">Your application is {app.status}</div>
                </div>
                <span className="bento-msg-time">now</span>
              </div>
            ))}
            {applications.length === 0 && (
              <p style={{ fontSize:12, color:'var(--text-muted)', padding:'8px 0' }}>Apply to jobs to start chatting</p>
            )}
          </div>

          {/* Divider */}
          <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />

          {/* Notifications */}
          <div className="bento-section-header">
            <span className="bento-section-title">Notifications</span>
            <Bell size={13} style={{ color:'var(--text-muted)' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[
              { msg: 'Complete your assessment to get verified!', time:'Just now' },
              { msg: `${jobs.length} new jobs in your area`, time:'Today' },
            ].map((n,i)=>(
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div className="bento-notif-dot" />
                <div>
                  <p style={{ fontSize:12, color:'var(--text-primary)', lineHeight:1.4 }}>{n.msg}</p>
                  <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </TiltCard>
      </div>

      {/* ── Modal: Chat ── */}
      {modalView === 'chat' && (
        <div className="bento-modal-overlay" onClick={() => setModalView(null)}>
          <div className="bento-modal" onClick={e => e.stopPropagation()}>
            <button className="bento-modal-close" onClick={() => setModalView(null)}><X size={14}/></button>
            <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:18 }}>Messages</h3>
            <ChatSection language={language} />
          </div>
        </div>
      )}

      {/* ── Modal: Edit Profile ── */}
      {modalView === 'edit' && (
        <div className="bento-modal-overlay" onClick={() => setModalView(null)}>
          <div className="bento-modal" onClick={e => e.stopPropagation()}>
            <button className="bento-modal-close" onClick={() => setModalView(null)}><X size={14}/></button>
            <EditProfileForm
              profile={profile}
              language={language}
              setLanguage={setLanguage}
              onSave={async (data) => {
                await api.workers.updateProfile(data);
                await fetchProfile();
                setModalView(null);
              }}
              onCancel={() => setModalView(null)}
            />
          </div>
        </div>
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
