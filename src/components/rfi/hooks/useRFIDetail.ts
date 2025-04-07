
import { useState, useEffect } from 'react';
import { RFI } from '../types';

// This mock data would be replaced with an actual API call in a real application
const MOCK_RFI: RFI = {
  id: '1',
  title: 'Clarification on foundation reinforcement',
  description: 'Need clarification on the rebar spacing for the main building foundation. The plans show 12" O.C. but the structural notes mention 8" O.C. in high-stress areas. Please confirm which spacing should be used for the southwest corner of the building.',
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
};

export const useRFIDetail = (id: string | undefined) => {
  const [rfi, setRFI] = useState<RFI | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // In a real application, this would be an API call
    const fetchRFI = async () => {
      try {
        setIsLoading(true);
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // In a real app, you would fetch by ID from an API
        if (id) {
          // For demo purposes, we're just returning the mock data
          setRFI(MOCK_RFI);
          setError(null);
        } else {
          throw new Error('RFI ID is required');
        }
      } catch (err) {
        console.error('Error fetching RFI:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch RFI');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRFI();
  }, [id]);
  
  return { rfi, isLoading, error };
};
