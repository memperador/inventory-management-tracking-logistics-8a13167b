
export type ChecklistItemStatus = 'pending' | 'in-progress' | 'completed' | 'not-required';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: ChecklistItemStatus;
  dueDate?: string;
  assignedTo?: string;
  notes?: string;
  documents?: DocumentAttachment[];
}

export interface DocumentAttachment {
  id: string;
  name: string;
  fileType: string;
  uploadDate: string;
  uploadedBy?: string;
  fileSize?: string;
  fileUrl?: string;
}

export interface PreConstructionSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface PreConstructionPlan {
  projectId: string;
  sections: PreConstructionSection[];
}
