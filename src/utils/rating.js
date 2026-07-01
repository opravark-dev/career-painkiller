// Map a final ATS score (0–100) to a categorical optimization rating.
export function getOptimizationRating(score) {
  if (score >= 90) return { label: 'Outstanding', color: '#16A34A' };
  if (score >= 80) return { label: 'Excellent',   color: '#22C55E' };
  if (score >= 70) return { label: 'Good',        color: '#3B82F6' };
  if (score >= 55) return { label: 'Fair',        color: '#F59E0B' };
  return { label: 'Poor', color: '#EF4444' };
}

// Format a signed delta for badges (e.g. +12 or -3).
export function formatDelta(delta) {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return '±0';
}
