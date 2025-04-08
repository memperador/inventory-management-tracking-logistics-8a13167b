
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Copy, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const TwoFactorSetup = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [factor, setFactor] = useState<any>(null);

  // Check if 2FA is enabled
  useEffect(() => {
    const check2FAStatus = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        
        if (error) throw error;
        
        // If currentLevel is aal2, 2FA is active
        setIsEnabled(data.currentLevel === 'aal2');
        
        // Get enrolled factors to check if any exist
        const { data: factorsData } = await supabase.auth.mfa.listFactors();
        const hasTOTP = factorsData.totp.length > 0;
        setIsEnabled(hasTOTP);
      } catch (error) {
        console.error('Error checking 2FA status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    check2FAStatus();
  }, [user]);

  const handleSetupStart = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Start the 2FA enrollment process
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      
      if (error) throw error;
      
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactor(data);
      setIsSetupOpen(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start 2FA setup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!factor || !factor.id) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId: factor.id
      });
      
      if (error) throw error;
      
      const challengeId = data.id;
      
      // Verify the OTP
      const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challengeId,
        code: otp
      });
      
      if (verifyError) throw verifyError;
      
      setIsEnabled(true);
      setIsSetupOpen(false);
      
      toast({
        title: "Success",
        description: "Two-factor authentication enabled successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!user || !factor?.id) return;
    
    try {
      setIsLoading(true);
      
      // Get enrolled factors
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData.totp[0];
      
      if (!totpFactor) {
        setIsEnabled(false);
        return;
      }
      
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: totpFactor.id
      });
      
      if (error) throw error;
      
      setIsEnabled(false);
      
      toast({
        title: "Success",
        description: "Two-factor authentication disabled successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to disable 2FA",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySecretToClipboard = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast({
        title: "Copied",
        description: "Secret key copied to clipboard",
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security to your account
          </p>
        </div>
        <Switch 
          checked={isEnabled} 
          onCheckedChange={isEnabled ? handleDisable2FA : handleSetupStart}
          disabled={isLoading || isSetupOpen}
        />
      </div>

      {isSetupOpen && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Set up Two-Factor Authentication</CardTitle>
            <CardDescription>
              Scan the QR code with your authenticator app or enter the secret key manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {qrCode && (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="border p-4 rounded-md bg-white">
                  <QRCodeSVG value={qrCode} size={200} />
                </div>
                
                {secret && (
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      {secret}
                    </span>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={copySecretToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                After scanning, save your backup codes. If you lose access to your authenticator app, you'll need these codes to sign in.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label>Enter the 6-digit verification code</Label>
              <div className="flex justify-center py-4">
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
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setIsSetupOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerify}
              disabled={otp.length < 6 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify and Enable"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default TwoFactorSetup;
