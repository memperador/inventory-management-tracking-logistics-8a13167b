
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DeliveryResult } from './types';

export class EmailVerificationService {
  private storeDeliveryResult(result: DeliveryResult): void {
    try {
      localStorage.setItem('last_email_delivery_result', JSON.stringify(result));
    } catch (error) {
      console.warn('Error storing delivery result:', error);
    }
  }

  private getStoredSendCount(email: string): number {
    try {
      const storedCount = localStorage.getItem(`verificationSendCount_${email}`);
      return storedCount ? parseInt(storedCount, 10) : 0;
    } catch (error) {
      console.warn('Error retrieving send count:', error);
      return 0;
    }
  }

  private incrementSendCount(email: string): void {
    try {
      const currentCount = this.getStoredSendCount(email);
      localStorage.setItem(`verificationSendCount_${email}`, (currentCount + 1).toString());
    } catch (error) {
      console.warn('Error incrementing send count:', error);
    }
  }

  private storeLastSentTime(email: string): void {
    try {
      const now = new Date();
      localStorage.setItem(`lastVerificationSent_${email}`, now.toISOString());
    } catch (error) {
      console.warn('Error storing last sent time:', error);
    }
  }

  public async sendVerificationEmail(email: string): Promise<void> {
    const domain = window.location.origin;
    console.log(`Using redirect URL: ${domain}/auth`);

    try {
      // Try to refresh session before sending
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn("Error getting current session:", sessionError);
        } else {
          console.log("Current session:", sessionData.session ? "Active" : "No active session");
        }
        
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.warn("Session refresh warning:", refreshError);
        } else {
          console.log("Session refreshed successfully");
        }
      } catch (refreshErr: any) {
        console.warn("Error refreshing session:", refreshErr);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${domain}/auth`
        }
      });
      
      if (error) {
        console.error("Failed to resend verification email:", error);
        
        this.storeDeliveryResult({
          timestamp: new Date().toISOString(),
          email,
          success: false,
          message: error.message || "Unknown error"
        });
        
        throw error;
      }
      
      console.log("Verification email resend response:", data);
      
      this.storeLastSentTime(email);
      this.incrementSendCount(email);
      
      this.storeDeliveryResult({
        timestamp: new Date().toISOString(),
        email,
        success: true,
        message: "Verification email sent successfully"
      });
      
      toast({
        title: "Verification Email Sent",
        description: `We've sent a verification email to ${email}. Please check your inbox and spam folder.`,
      });
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
      
      throw error;
    }
  }
}

export const emailVerificationService = new EmailVerificationService();
