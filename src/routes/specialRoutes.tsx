
import React, { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';

export const ProjectRedirect: React.FC = () => {
  const { projectId } = useParams();
  return <Navigate to={`/projects/${projectId}`} replace />;
};

export const RootRedirect: React.FC = () => {
  // Simple redirect to the dashboard if user is authenticated, otherwise to auth
  return <Navigate to="/dashboard" replace />;
};
