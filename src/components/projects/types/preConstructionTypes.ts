
export type ChecklistItemStatus = 'pending' | 'in-progress' | 'completed' | 'not-required';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: ChecklistItemStatus;
  dueDate?: string;
  assignedTo?: string;
  notes?: string;
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
