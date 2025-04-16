
import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import EmergencyLabratLogin from '@/components/admin/EmergencyLabratLogin';

export const LabratLoginPage: React.FC = () => {
  useEffect(() => {
    console.log('[LABRAT-LOGIN] Page loaded at', new Date().toISOString());
    
    const visits = parseInt(sessionStorage.getItem('login_page_visits') || '0') + 1;
    sessionStorage.setItem('login_page_visits', visits.toString());
    
    if (visits > 5) {
      console.warn('[LABRAT-LOGIN] Multiple login page visits detected, possible loop');
      sessionStorage.setItem('potential_auth_loop', 'true');
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">FleetTrack Emergency Access</h1>
        <EmergencyLabratLogin />
        <p className="text-center mt-4">
          <a href="/auth" className="text-blue-600 hover:underline">
            Return to normal login
          </a>
        </p>
      </div>
    </div>
  );
};

export const ProjectRedirect: React.FC = () => {
  const { projectId } = useParams();
  return <Navigate to={`/projects/${projectId}`} replace />;
};

export const RootRedirect: React.FC = () => {
  console.log('[APP] RootRedirect component rendering');
  
  const potentialLoop = sessionStorage.getItem('potential_auth_loop') === 'true';
  const breakLoop = sessionStorage.getItem('break_auth_loop') === 'true';
  
  if (potentialLoop || breakLoop) {
    console.log('[APP] Loop detected, redirecting to auth with bypass');
    return <Navigate to="/auth?bypass=loop&emergency=true" replace />;
  }
  
  return <Navigate to="/labrat-login" replace />;
};
