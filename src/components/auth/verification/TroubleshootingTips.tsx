
import React from 'react';
import { AlertCircle } from 'lucide-react';

const TroubleshootingTips: React.FC = () => {
  return (
    <div className="flex items-start mt-3 bg-yellow-100 p-3 rounded-md text-sm text-yellow-700">
      <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">Troubleshooting Email Delivery Issues:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Check your spam/junk folder (some providers move verification emails there)</li>
          <li>Make sure your email address is spelled correctly</li>
          <li>Add <strong>noreply@mail.app.supabase.io</strong> to your contacts</li>
          <li>Try using a Gmail, Outlook or Yahoo email address for better delivery rates</li>
          <li>Some corporate email systems block verification emails entirely</li>
          <li>Try accessing your email through a web browser instead of an email app</li>
          <li>Clear your browser cache and cookies, then try again</li>
        </ul>
      </div>
    </div>
  );
};

export default TroubleshootingTips;
