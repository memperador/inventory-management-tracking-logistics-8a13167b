
import { PreConstructionSection } from '../../types/preConstructionTypes';

export const defaultSections: PreConstructionSection[] = [
  {
    id: 'permits',
    title: 'Permits & Compliance',
    items: [
      {
        id: 'permit-1',
        title: 'Building Permit Application',
        description: 'Submit application for main building permit',
        status: 'pending',
        documents: []
      },
      {
        id: 'permit-2',
        title: 'Electrical Permit',
        description: 'Obtain specialized electrical work permits',
        status: 'pending',
        documents: []
      },
      {
        id: 'permit-3',
        title: 'Site Plan Approval',
        description: 'Get approval for site plans from local authority',
        status: 'pending',
        documents: []
      }
    ]
  },
  {
    id: 'site-prep',
    title: 'Site Preparation',
    items: [
      {
        id: 'site-1',
        title: 'Site Survey',
        description: 'Complete topographical and boundary survey',
        status: 'pending',
        documents: []
      },
      {
        id: 'site-2',
        title: 'Utility Locating',
        description: 'Mark underground utilities before excavation',
        status: 'pending',
        documents: []
      },
      {
        id: 'site-3',
        title: 'Environmental Assessment',
        description: 'Conduct required environmental tests',
        status: 'pending',
        documents: []
      }
    ]
  },
  {
    id: 'resource-planning',
    title: 'Resource Planning',
    items: [
      {
        id: 'resource-1',
        title: 'Equipment Requirements',
        description: 'Identify all equipment needed for project',
        status: 'pending',
        documents: []
      },
      {
        id: 'resource-2',
        title: 'Labor Planning',
        description: 'Determine labor requirements and scheduling',
        status: 'pending',
        documents: []
      },
      {
        id: 'resource-3',
        title: 'Material Procurement Plan',
        description: 'Create schedule for ordering and delivering materials',
        status: 'pending',
        documents: []
      }
    ]
  }
];
