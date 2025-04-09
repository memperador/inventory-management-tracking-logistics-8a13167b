import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

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
          <Button onClick={handleDashboardClick} className="w-full">
            {user ? "Return to Dashboard" : "Go to Login"}
          </Button>
          {location.pathname !== '/auth' && !user && (
            <Button onClick={handleLoginClick} variant="outline" className="w-full">
              Sign In / Sign Up
            </Button>
          )}
          <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
