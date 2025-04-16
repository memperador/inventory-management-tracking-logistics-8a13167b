
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { logAuth, AUTH_LOG_LEVELS } from '@/utils/debug/authLogger';

type SignupFormProps = {
  setVerificationSent?: (value: boolean) => void;
  setVerificationEmail?: (value: string) => void;
  onSignupComplete?: (email: string) => void;
};

const SignupForm = ({ 
  setVerificationSent, 
  setVerificationEmail,
  onSignupComplete
}: SignupFormProps) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim() || !companyName.trim()) {
      setError("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Company name validation
    if (companyName.length < 2) {
      setError("Company name must be at least 2 characters long");
      return;
    }
    
    logAuth('SIGNUP-FORM', `Starting signup for: ${email} with company: ${companyName}`, {
      level: AUTH_LOG_LEVELS.INFO
    });
    
    setLoading(true);
    
    try {
      const result = await signUp(email, password, firstName, lastName, companyName);
      
      logAuth('SIGNUP-FORM', `Signup successful for: ${email}`, {
        level: AUTH_LOG_LEVELS.INFO
      });
      
      toast({
        title: 'Account created',
        description: 'Welcome! You will now be redirected to set up your subscription.',
      });
      
      // If we have verification handlers, update them with the email
      if (setVerificationSent && setVerificationEmail) {
        setVerificationSent(true);
        setVerificationEmail(result.email);
      }

      // If we have the new onSignupComplete handler, call it
      if (onSignupComplete) {
        onSignupComplete(result.email);
      }
    } catch (error: any) {
      logAuth('SIGNUP-FORM', `Signup failed for: ${email}`, {
        level: AUTH_LOG_LEVELS.ERROR,
        data: error
      });
      
      if (error.message?.includes("Organization Already Exists") || error.message?.includes("company name already exists")) {
        setError("An organization with this name already exists. Please try a different name or contact your administrator for access.");
      } else if (error.message?.includes("Users from your organization already exist")) {
        setError("Users from your organization already exist in our system. Please contact your administrator for access.");
      } else if (error.message?.includes("User already registered")) {
        setError("A user with this email already exists. Please use the sign in option instead.");
      } else {
        setError(error.message || "An error occurred during signup");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input
          id="firstName"
          placeholder="Enter your first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input
          id="lastName"
          placeholder="Enter your last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="companyName">Company/Organization Name</Label>
        <Input
          id="companyName"
          placeholder="Enter your company or organization name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Your company name will be used to create your tenant. Each company has a separate tenant with its own data.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign up'}
      </Button>
    </form>
  );
};

export default SignupForm;
