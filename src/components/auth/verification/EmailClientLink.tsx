
import React from 'react';
import { ExternalLink } from 'lucide-react';

interface EmailClientLinkProps {
  email: string | undefined;
}

const EmailClientLink: React.FC<EmailClientLinkProps> = ({ email }) => {
  const getEmailClientUrl = () => {
    if (!email) return '#';
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (!domain) return '#';
    
    if (domain.includes('gmail')) return 'https://mail.google.com';
    if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) return 'https://outlook.live.com';
    if (domain.includes('yahoo')) return 'https://mail.yahoo.com';
    if (domain.includes('proton')) return 'https://mail.proton.me';
    if (domain.includes('aol')) return 'https://mail.aol.com';
    
    return '#'; // No specific URL
  };
  
  const emailClientUrl = getEmailClientUrl();
  
  if (emailClientUrl === '#') return null;
  
  return (
    <div className="mt-2">
      <a 
        href={emailClientUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm flex items-center text-blue-600 hover:text-blue-800"
      >
        Open your email client <ExternalLink className="h-3 w-3 ml-1" />
      </a>
    </div>
  );
};

export default EmailClientLink;
