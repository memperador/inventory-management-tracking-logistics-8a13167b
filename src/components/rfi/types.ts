
export type RFIStatus = 'draft' | 'submitted' | 'answered' | 'closed';
export type RequestType = 'rfi' | 'rfq' | 'rfp';

export interface RFI {
  id: string;
  title: string;
  description: string;
  projectId: string;
  createdBy: string;
  assignedTo: string | null;
  status: RFIStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  responseText: string | null;
  responseDate: string | null;
  attachments?: string[];
  category?: string;
  type: RequestType;
}

export type SubmittalStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'revised';

export interface Submittal {
  id: string;
  title: string;
  description: string;
  projectId: string;
  createdBy: string;
  assignedTo: string | null;
  status: SubmittalStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  reviewComments: string | null;
  reviewDate: string | null;
  attachments?: string[];
  category: string;
  supplierName?: string;
}

export type RFQStatus = 'draft' | 'sent' | 'received' | 'evaluated' | 'awarded' | 'closed';

export interface RFQ {
  id: string;
  title: string;
  description: string;
  projectId: string;
  createdBy: string;
  assignedTo: string | null;
  status: RFQStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  vendors: string[];
  responses: RFQResponse[];
  category?: string;
  attachments?: string[];
  items: RFQItem[];
}

export interface RFQItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
}

export interface RFQResponse {
  vendorName: string;
  submissionDate: string;
  totalPrice: number;
  items: RFQResponseItem[];
  notes?: string;
}

export interface RFQResponseItem {
  itemId: string;
  unitPrice: number;
  totalPrice: number;
}

export type RFPStatus = 'draft' | 'published' | 'reviewing' | 'shortlisted' | 'awarded' | 'closed';

export interface RFP {
  id: string;
  title: string;
  description: string;
  projectId: string;
  createdBy: string;
  assignedTo: string | null;
  status: RFPStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  scope: string;
  evaluationCriteria: EvaluationCriterion[];
  vendors: string[];
  responses: RFPResponse[];
  category?: string;
  attachments?: string[];
}

export interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number;
}

export interface RFPResponse {
  vendorName: string;
  submissionDate: string;
  proposalSummary: string;
  price: number;
  evaluationScores?: { [criterionId: string]: number };
  attachments?: string[];
  notes?: string;
}

export const RFI_CATEGORIES = [
  'Architectural',
  'Structural',
  'Mechanical',
  'Electrical',
  'Plumbing',
  'Civil',
  'Other'
];

export const SUBMITTAL_CATEGORIES = [
  'Product Data',
  'Shop Drawings',
  'Samples',
  'Quality Assurance',
  'Certifications',
  'Warranties',
  'Other'
];

export const RFQ_CATEGORIES = [
  'Materials',
  'Equipment',
  'Subcontractor Services',
  'Specialized Tools',
  'Rentals',
  'Other'
];

export const RFP_CATEGORIES = [
  'Design Services',
  'Engineering Services',
  'Major Subcontract Work',
  'Consulting Services',
  'Specialized Construction',
  'Other'
];

export const UNIT_TYPES = [
  'EA', // Each
  'LF', // Linear Feet
  'SF', // Square Feet
  'SY', // Square Yard
  'CY', // Cubic Yard
  'TON', // Ton
  'LS', // Lump Sum
  'HR', // Hour
  'DAY', // Day
  'WK', // Week
  'MO', // Month
  'GAL', // Gallon
  'LB', // Pound
  'BAG', // Bag
  'BOX', // Box
  'ROLL', // Roll
  'PC', // Piece
];
