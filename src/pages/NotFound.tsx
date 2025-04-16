
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuthContext";
import { createErrorResponse, handleError } from "@/utils/errorHandling/errorService";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Log the 404 error with our error system
    const errorResponse = createErrorResponse('SY-001', {
      message: `404 Error: Page not found - ${location.pathname}`,
      technicalDetails: `User attempted to access non-existent route: ${location.pathname}${location.search}`,
      location: 'NotFound',
      userGuidance: 'This page does not exist. Please use the navigation links to go to a valid page.',
      severity: 'LOW'
    });
    
    handleError(errorResponse, { showToast: false, throwError: false });
  }, [location.pathname, location.search]);

  const handleLoginClick = () => {
    // If user was trying to access a protected route, remember it for redirect after login
    const currentPath = encodeURIComponent(location.pathname + location.search);
    navigate(`/auth?returnTo=${currentPath}`);
  };

  const handleDashboardClick = () => {
    navigate(user ? "/dashboard" : "/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col space-y-2">
          <Button onClick={handleDashboardClick} className="w-full flex gap-2 items-center justify-center" variant="default">
            <Home size={16} />
            {user ? "Return to Dashboard" : "Go to Login"}
          </Button>
          {location.pathname !== '/auth' && !user && (
            <Button onClick={handleLoginClick} variant="outline" className="w-full">
              Sign In / Sign Up
            </Button>
          )}
          <Button onClick={() => navigate(-1)} variant="outline" className="w-full flex gap-2 items-center justify-center">
            <ArrowLeft size={16} />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
