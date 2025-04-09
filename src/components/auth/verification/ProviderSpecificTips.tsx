
import React from 'react';

interface ProviderSpecificTipsProps {
  emailProvider: string | null;
}

const ProviderSpecificTips: React.FC<ProviderSpecificTipsProps> = ({ emailProvider }) => {
  if (!emailProvider) return null;

  let providerTip = '';

  switch (emailProvider) {
    case 'Gmail':
      providerTip = "Gmail users: Check the 'Promotions' or 'Updates' tabs";
      break;
    case 'Microsoft':
      providerTip = "Outlook/Hotmail users: Check the 'Other' or 'Junk' folders";
      break;
    case 'Yahoo':
      providerTip = "Yahoo users: Check the 'Spam' folder and mark as 'Not Spam'";
      break;
    case 'ProtonMail':
      providerTip = "ProtonMail users: Check spam folder and whitelist the sender";
      break;
    default:
      return null;
  }

  return <li>{providerTip}</li>;
};

export default ProviderSpecificTips;
