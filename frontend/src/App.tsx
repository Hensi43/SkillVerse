import { useState, useEffect } from 'react';
import { AuthModule } from './modules/auth/AuthModule';
import { WorkerModule } from './modules/worker/WorkerModule';
import { EmployerModule } from './modules/employer/EmployerModule';
import { JobFeed } from './modules/job/JobModule';
import { getSavedUser, clearAuth } from './services/api';

function App() {
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>(() => {
    return (localStorage.getItem('skillverse_lang') as 'en' | 'hi') || 'en';
  });

  // Verify active local storage session on mount
  useEffect(() => {
    const savedUser = getSavedUser();
    if (savedUser) {
      setUser(savedUser);
      const localLang = localStorage.getItem('skillverse_lang') as 'en' | 'hi';
      if (!localLang && savedUser.preferredLanguage) {
        setLanguage(savedUser.preferredLanguage);
      }
    }
  }, []);

  // Sync language with localStorage when state changes
  useEffect(() => {
    localStorage.setItem('skillverse_lang', language);
  }, [language]);

  const handleAuthComplete = (loggedInUser: any) => {
    setUser(loggedInUser);
    if (loggedInUser.preferredLanguage) {
      setLanguage(loggedInUser.preferredLanguage);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <>
      {!user ? (
        <AuthModule 
          onAuthComplete={handleAuthComplete} 
          language={language} 
        />
      ) : user.role === 'employer' ? (
        <EmployerModule 
          user={user} 
          language={language} 
          setLanguage={setLanguage}
          onLogout={handleLogout} 
        />
      ) : (
        <WorkerModule 
          user={user} 
          language={language} 
          setLanguage={setLanguage}
          onLogout={handleLogout} 
          renderJobFeed={(coords?: [number, number]) => <JobFeed language={language} workerCoordinates={coords} />}
        />
      )}
    </>
  );
}

export default App;
