
export interface DeliveryResult {
  timestamp: string;
  email: string;
  success: boolean;
  message: string;
}

export interface EmailVerificationService {
  sendVerificationEmail: (email: string) => Promise<void>;
}
