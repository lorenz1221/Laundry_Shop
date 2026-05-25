export function useDateFormatter() {
  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string | null, time: string | null) => {
    if (!date) return 'Not scheduled';
    const d = formatDate(date);
    return time ? `${d} at ${time.slice(0, 5)}` : d;
  };

  return { formatDate, formatDateTime };
}
