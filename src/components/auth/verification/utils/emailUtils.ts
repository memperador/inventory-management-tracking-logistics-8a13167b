
/**
 * Determine email provider based on email domain
 */
export function getEmailProvider(email: string): string | null {
  if (!email) return null;
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  
  if (domain.includes('gmail')) return 'Gmail';
  if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) return 'Microsoft';
  if (domain.includes('yahoo')) return 'Yahoo';
  if (domain.includes('proton')) return 'ProtonMail';
  if (domain.includes('aol')) return 'AOL';
  if (domain.includes('munetworks.io')) return 'MUNetworks';
  
  return null;
}
