import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';

export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

export const formatDateLong = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), 'dd MMMM yyyy');
  } catch {
    return 'Invalid Date';
  }
};

export const getRelativeTime = (dateString: string): string => {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return '';
  }
};

export const getDaysUntilExpiry = (expiryDate?: string | null): number | null => {
  if (!expiryDate) return null;
  try {
    return differenceInDays(parseISO(expiryDate), new Date());
  } catch {
    return null;
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getCategoryIcon = (category: string): string => {
  const icons: Record<string, string> = {
    Identity: 'card-account-details',
    Educational: 'school',
    Vehicle: 'car',
    Insurance: 'shield-check',
    Financial: 'bank',
    Property: 'home',
    Medical: 'hospital-box',
    Legal: 'scale-balance',
    Other: 'file-document',
  };
  return icons[category] || 'file-document';
};

export const getExpiryStatusText = (status: string, expiryDate?: string | null): string => {
  if (status === 'No Expiry') return 'No Expiry Date';
  if (status === 'Expired') return 'Expired';
  if (status === 'Expiring Soon') {
    const days = getDaysUntilExpiry(expiryDate);
    if (days !== null && days >= 0) return `Expires in ${days} day${days !== 1 ? 's' : ''}`;
    return 'Expiring Soon';
  }
  if (status === 'Valid') {
    const days = getDaysUntilExpiry(expiryDate);
    if (days !== null) return `Valid for ${days} day${days !== 1 ? 's' : ''}`;
    return 'Valid';
  }
  return status;
};
