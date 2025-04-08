
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailSettingsProps {
  email: string;
  isValid: boolean;
  onChange: (email: string) => void;
  onSave: () => void;
}

export const EmailSettings: React.FC<EmailSettingsProps> = ({
  email,
  isValid,
  onChange,
  onSave
}) => {
  return (
    <div className="pt-2">
      <h3 className="font-medium mb-2">Email Notification Settings</h3>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="alert-email">Email Address</Label>
          <Input 
            id="alert-email"
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
        <Button onClick={onSave} disabled={!isValid}>
          Save Email
        </Button>
      </div>
    </div>
  );
};
