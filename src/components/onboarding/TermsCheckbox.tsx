
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TermsCheckboxProps {
  acceptTerms: boolean;
  setAcceptTerms: (checked: boolean) => void;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ acceptTerms, setAcceptTerms }) => {
  return (
    <div className="flex items-top space-x-2 pt-4">
      <Checkbox 
        id="accept-terms" 
        checked={acceptTerms}
        onCheckedChange={(checked) => setAcceptTerms(checked === true)}
      />
      <Label htmlFor="accept-terms" className="text-sm text-muted-foreground">
        I accept the terms of service and have read the privacy policy.
      </Label>
    </div>
  );
};

export default TermsCheckbox;
