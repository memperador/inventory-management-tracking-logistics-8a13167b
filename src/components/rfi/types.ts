
export type RFIStatus = 'draft' | 'submitted' | 'answered' | 'closed';

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
