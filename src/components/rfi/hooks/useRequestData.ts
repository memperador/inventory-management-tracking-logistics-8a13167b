
import { useState } from 'react';
import { RFI, RequestType } from '../types';

// Mock data
const MOCK_RFIS: RFI[] = [
  {
    id: '1',
    title: 'Clarification on foundation reinforcement',
    description: 'Need clarification on the rebar spacing for the main building foundation.',
    projectId: '85e6bf2f-a7e0-4943-941a-07a254f1a4ed',
    createdBy: 'John Doe',
    assignedTo: 'Jane Smith',
    status: 'submitted',
    dueDate: '2025-04-20',
    createdAt: '2025-04-07T14:30:00Z',
    updatedAt: '2025-04-07T14:30:00Z',
    responseText: null,
    responseDate: null,
    category: 'Structural',
    type: 'rfi'
  },
  {
    id: '2',
    title: 'Electrical panel location',
    description: 'Please confirm the location of the main electrical panel as shown in drawing E-101.',
    projectId: '85e6bf2f-a7e0-4943-941a-07a254f1a4ed',
    createdBy: 'John Doe',
    assignedTo: null,
    status: 'draft',
    dueDate: '2025-04-25',
    createdAt: '2025-04-06T10:15:00Z',
    updatedAt: '2025-04-06T10:15:00Z',
    responseText: null,
    responseDate: null,
    category: 'Electrical',
    type: 'rfi'
  }
];

const MOCK_RFQS: RFI[] = [
  {
    id: '101',
    title: 'Concrete supply for foundation',
    description: 'Need quotes for 50 cubic yards of 4000 PSI concrete.',
    projectId: '85e6bf2f-a7e0-4943-941a-07a254f1a4ed',
    createdBy: 'John Doe',
    assignedTo: null,
    status: 'sent',
    dueDate: '2025-04-15',
    createdAt: '2025-04-05T09:30:00Z',
    updatedAt: '2025-04-05T09:30:00Z',
    responseText: null,
    responseDate: null,
    category: 'Materials',
    type: 'rfq'
  }
];

const MOCK_RFPS: RFI[] = [
  {
    id: '201',
    title: 'Mechanical System Design-Build',
    description: 'Seeking proposals for complete HVAC system design and installation.',
    projectId: '85e6bf2f-a7e0-4943-941a-07a254f1a4ed',
    createdBy: 'Jane Smith',
    assignedTo: null,
    status: 'published',
    dueDate: '2025-05-01',
    createdAt: '2025-04-01T13:45:00Z',
    updatedAt: '2025-04-01T13:45:00Z',
    responseText: null,
    responseDate: null,
    category: 'Engineering Services',
    type: 'rfp'
  }
];

export interface RequestState {
  rfi: RFI[];
  rfq: RFI[];
  rfp: RFI[];
}

export const useRequestData = () => {
  const [requests, setRequests] = useState<RequestState>({
    rfi: MOCK_RFIS,
    rfq: MOCK_RFQS,
    rfp: MOCK_RFPS
  });
  
  const handleCreateRequest = (newRequest: RFI) => {
    setRequests(prev => ({
      ...prev,
      [newRequest.type]: [newRequest, ...prev[newRequest.type]]
    }));
  };
  
  return { requests, handleCreateRequest };
};
