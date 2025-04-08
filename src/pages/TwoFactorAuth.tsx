
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const TwoFactorAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get email from local storage (set during sign-in)
    const storedEmail = localStorage.getItem('pendingTwoFactorEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email is stored, redirect to login
      navigate('/auth');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "No email found for verification",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    
    try {
      // Retrieve factors from localStorage
      const factorId = localStorage.getItem('factorId');
      
      if (!factorId) {
        throw new Error('No authentication factor found');
      }
      
      const { data, error } = await supabase.auth.mfa.verifyOTP({
        factorId,
        code: otp,
      });
      
      if (error) throw error;
      
      // Clean up localStorage
      localStorage.removeItem('pendingTwoFactorEmail');
      localStorage.removeItem('factorId');
      
      toast({
        title: "Success",
        description: "Authentication successful",
      });
      
      // Redirect to home/dashboard
      navigate('/');
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-center">
            Enter the verification code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <InputOTP 
                maxLength={6} 
                value={otp} 
                onChange={setOtp}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} index={index} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={otp.length < 6 || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="link" 
            className="px-0"
            onClick={() => navigate('/auth')}
          >
            Back to login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TwoFactorAuth;
