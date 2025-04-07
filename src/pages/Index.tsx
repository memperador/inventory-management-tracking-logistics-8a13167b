
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  // Redirect to dashboard instead of rendering it directly
  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);
  
  return null; // No render needed as we're redirecting
};

export default Index;
