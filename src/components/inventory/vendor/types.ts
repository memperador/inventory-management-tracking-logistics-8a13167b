
import { z } from 'zod';
import { webhookConfigSchema } from '@/components/rfi/utils/formSchemas';

export type WebhookConfigValues = z.infer<typeof webhookConfigSchema>;

export type TestStatus = 'idle' | 'testing' | 'success' | 'error';

export interface VendorIntegrationProps {
  // Add any props here if needed
}

export interface VendorConnectionFormData {
  vendorUrl: string;
  apiKey: string;
}

export interface SupportedVendor {
  id: string;
  name: string;
}
