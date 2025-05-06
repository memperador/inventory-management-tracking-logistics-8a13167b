
import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';

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
  
  return <Navigate to="/auth" replace />;
};
