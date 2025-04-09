
import React from 'react';
import ProviderSpecificTips from './ProviderSpecificTips';

interface VerificationGuideProps {
  emailProvider: string | null;
}

const VerificationGuide: React.FC<VerificationGuideProps> = ({ emailProvider }) => {
  return (
    <div className="mt-3 text-xs space-y-2">
      <p className="font-medium">Troubleshooting tips:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Check both inbox and spam/junk folders</li>
        <li>Add <strong>noreply@mail.app.supabase.io</strong> to your contacts</li>
        <li>Email delivery can take up to 5-10 minutes with some providers</li>
        <li>Try refreshing your email inbox</li>
        <li>Check for full inbox (some providers block incoming emails when inbox is full)</li>
        <ProviderSpecificTips emailProvider={emailProvider} />
        <li>Try using a personal email address if you're using a work email</li>
      </ul>
    </div>
  );
};

export default VerificationGuide;
