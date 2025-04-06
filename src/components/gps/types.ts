
export type ChecklistItem = {
  id: string;
  text: string;
  completed: boolean;
  category: string;
};

export type ChecklistCategory = {
  name: string;
  description: string;
  isOpen: boolean;
};
