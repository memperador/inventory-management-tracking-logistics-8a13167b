
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useEmailSettings = () => {
  const [emailSettings, setEmailSettings] = useState({
    email: '',
    isValid: false
  });
  
  const { toast } = useToast();

  // Validate email
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailSettings(prev => ({
      ...prev,
      isValid: emailRegex.test(prev.email)
    }));
  }, [emailSettings.email]);

  // Save email settings
  const saveEmailSettings = () => {
    if (!emailSettings.isValid) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Email Settings Saved",
      description: `Notifications will be sent to ${emailSettings.email}`,
    });
  };

  const updateEmail = (email: string) => {
    setEmailSettings(prev => ({ ...prev, email }));
  };

  return {
    emailSettings,
    updateEmail,
    saveEmailSettings
  };
};
