
export interface Tenant {
  id: string;
  name: string;
  subscription_tier?: string;
  subscription_status?: string;
  company_type?: 'construction' | 'electrical' | 'plumbing' | 'hvac' | 'mechanical' | 'general';
  trial_ends_at?: string | null;
  subscription_expires_at?: string | null;
  onboarding_completed?: boolean;
  settings: {
    theme: string;
    features: string[];
    logoUrl?: string | null;
    aiConfig?: {
      isAiEnabled: boolean;
      defaultModel?: string;
      hasApiKey?: boolean;
    };
    industryCodeSettings?: {
      companyPrefix?: string;
      selectedCodeType?: string;
      customCodes?: Array<{
        id: string;
        code: string;
        description: string;
      }>;
    };
  };
}

export interface TenantContextType {
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentTenant: (tenant: Tenant) => void;
  updateTenantSettings: (settings: Partial<Tenant['settings']>) => void;
  updateCompanyType: (companyType: Tenant['company_type']) => void;
}

export interface IndustryCode {
  id: string;
  code: string;
  description: string;
}

export const INDUSTRY_CODE_TYPES = {
  CSI: 'Construction Specifications Institute',
  NEC: 'National Electrical Code',
  UPC: 'Uniform Plumbing Code',
  ASHRAE: 'ASHRAE Standards',
  IMC: 'International Mechanical Code'
};

export const DEFAULT_CODES_BY_TYPE: Record<string, IndustryCode[]> = {
  CSI: [
    { id: '1', code: '01-10', description: 'Operation and Maintenance' },
    { id: '2', code: '01-20', description: 'Allowances' },
    { id: '3', code: '01-30', description: 'Administrative Requirements' },
    { id: '4', code: '01-40', description: 'Quality Requirements' },
    { id: '5', code: '01-50', description: 'Temporary Facilities and Controls' },
  ],
  NEC: [
    { id: '1', code: '110', description: 'Requirements for Electrical Installations' },
    { id: '2', code: '210', description: 'Branch Circuits' },
    { id: '3', code: '250', description: 'Grounding and Bonding' },
    { id: '4', code: '300', description: 'Wiring Methods' },
    { id: '5', code: '408', description: 'Switchboards, Switchgear, and Panelboards' },
  ],
  UPC: [
    { id: '1', code: '301', description: 'General Regulations' },
    { id: '2', code: '310', description: 'Water Supply and Distribution' },
    { id: '3', code: '403', description: 'Fixture Requirements' },
    { id: '4', code: '601', description: 'Water Supply' },
    { id: '5', code: '701', description: 'Sanitary Drainage' },
  ],
  ASHRAE: [
    { id: '1', code: '62.1', description: 'Ventilation for Indoor Air Quality' },
    { id: '2', code: '90.1', description: 'Energy Standard for Buildings' },
    { id: '3', code: '55', description: 'Thermal Environmental Conditions' },
    { id: '4', code: '170', description: 'Ventilation of Health Care Facilities' },
    { id: '5', code: '189.1', description: 'Green Building Standard' },
  ],
  IMC: [
    { id: '1', code: '301', description: 'General Regulations' },
    { id: '2', code: '401', description: 'Ventilation' },
    { id: '3', code: '501', description: 'Exhaust Systems' },
    { id: '4', code: '601', description: 'Duct Systems' },
    { id: '5', code: '701', description: 'Combustion Air' },
  ]
};

export const COMPANY_TYPE_TO_CODE_MAP = {
  construction: 'CSI',
  electrical: 'NEC',
  plumbing: 'UPC',
  hvac: 'ASHRAE',
  mechanical: 'IMC',
  general: 'CSI'
};
