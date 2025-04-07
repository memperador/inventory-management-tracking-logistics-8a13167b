
import { Equipment } from './types';

export const equipmentData: Equipment[] = [
  {
    id: 'EQ-1234',
    name: 'Cat Excavator',
    type: 'Heavy Equipment',
    status: 'Operational',
    location: 'Downtown High-rise',
    lastMaintenance: '2024-03-15',
    nextMaintenance: '2024-05-15',
    gpsTag: 'GT-7851',
    csi_code: '33 05 23',
    nec_code: 'NFPA 70E 130.7',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000' 
  },
  {
    id: 'EQ-5678',
    name: 'JCB Backhoe',
    type: 'Heavy Equipment',
    status: 'Maintenance',
    location: 'Highway Extension',
    lastMaintenance: '2024-02-20',
    nextMaintenance: '2024-04-20',
    gpsTag: 'GT-9245',
    nec_code: 'NFPA 70 110.26',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000'
  },
  {
    id: 'EQ-9012',
    name: 'Manitowoc Crane',
    type: 'Heavy Equipment',
    status: 'Operational',
    location: 'Commercial Complex',
    lastMaintenance: '2024-03-01',
    nextMaintenance: '2024-05-01',
    gpsTag: 'GT-3487',
    nec_code: 'NFPA 70 110.13',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000'
  },
  {
    id: 'EQ-3456',
    name: 'Bobcat Skid Steer',
    type: 'Medium Equipment',
    status: 'Out of Service',
    location: 'Warehouse Project',
    lastMaintenance: '2023-12-10',
    nextMaintenance: '2024-04-10',
    gpsTag: 'GT-6120',
    nec_code: 'NFPA 70 400.7',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000'
  },
  {
    id: 'EQ-7890',
    name: 'Toyota Forklift',
    type: 'Medium Equipment',
    status: 'Operational',
    location: 'Warehouse Project',
    lastMaintenance: '2024-03-25',
    nextMaintenance: '2024-05-25',
    gpsTag: 'GT-1742',
    nec_code: 'NFPA 70 620.51',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000'
  },
  {
    id: 'EQ-1122',
    name: 'Komatsu Bulldozer',
    type: 'Heavy Equipment',
    status: 'Maintenance',
    location: 'Highway Extension',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-04-05',
    gpsTag: 'GT-5390',
    nec_code: 'NFPA 70 440.12',
    tenant_id: '550e8400-e29b-41d4-a716-446655440000'
  }
];
