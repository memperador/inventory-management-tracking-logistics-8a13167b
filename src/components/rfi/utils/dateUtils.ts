
/**
 * Formats a date string for display
 * @param dateString The date string to format or null
 * @returns Formatted date string or "Not set" if dateString is null
 */
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Not set';
  return new Date(dateString).toLocaleDateString();
};
