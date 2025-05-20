import { format } from 'date-fns';

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string to use (default: 'MMM dd, yyyy HH:mm:ss')
 * @returns {string} - The formatted date string
 */
export default function formatDateTimeString(date, formatStr = 'MMM dd, yyyy HH:mm:ss') {
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}
