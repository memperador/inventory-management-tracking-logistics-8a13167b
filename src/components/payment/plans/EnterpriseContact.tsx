
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';

interface EnterpriseContactProps {
  onEnterpriseInquiry: () => void;
}

export const EnterpriseContact: React.FC<EnterpriseContactProps> = ({ onEnterpriseInquiry }) => {
  return (
    <div className="text-center p-8 border rounded-lg bg-slate-50 mt-8">
      <h3 className="text-xl font-semibold mb-4">Contact Our Enterprise Sales Team</h3>
      <p className="mb-4">Please reach out for custom pricing and implementation details for our Enterprise plan.</p>
      <Button onClick={onEnterpriseInquiry} className="bg-slate-800 hover:bg-slate-900">
        <Building className="mr-2 h-4 w-4" />
        Contact Sales
      </Button>
    </div>
  );
};

export default EnterpriseContact;
