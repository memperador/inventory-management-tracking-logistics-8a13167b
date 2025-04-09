import { MailCheck, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';

export const EmailVerificationIndicator = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const isEmailVerified = user.email_confirmed_at || user.email_confirmed_at !== null;
  
  return isEmailVerified ? (
    <div className="flex items-center text-xs text-green-600">
      <MailCheck className="h-3 w-3 mr-1" />
      <span>Verified</span>
    </div>
  ) : (
    <div className="flex items-center text-xs text-yellow-600">
      <Mail className="h-3 w-3 mr-1" />
      <span>Unverified</span>
    </div>
  );
};
