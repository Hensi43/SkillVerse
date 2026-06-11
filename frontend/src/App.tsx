import { useState, useEffect } from 'react';
import { AuthModule } from './modules/auth/AuthModule';
import { WorkerModule } from './modules/worker/WorkerModule';
import { EmployerModule } from './modules/employer/EmployerModule';
import { JobFeed } from './modules/job/JobModule';
import { getSavedUser, clearAuth } from './services/api';

function App() {
  const [user, setUser] = useState<any>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Verify active local storage session on mount
  useEffect(() => {
    const savedUser = getSavedUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  const handleAuthComplete = (loggedInUser: any) => {
    setUser(loggedInUser);
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
          setLanguage={setLanguage} 
        />
      ) : user.role === 'employer' ? (
        <EmployerModule 
          user={user} 
          language={language} 
          onLogout={handleLogout} 
        />
      ) : (
        <WorkerModule 
          user={user} 
          language={language} 
          onLogout={handleLogout} 
          renderJobFeed={() => <JobFeed language={language} />}
        />
      )}
    </>
  );
}

export default App;
