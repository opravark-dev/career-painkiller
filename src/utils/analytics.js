export function trackEvent(event, metadata = {}) {
  const timestamp = new Date().toISOString();
  const eventData = {
    event,
    ...metadata,
    timestamp,
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // In a real production environment, this would call an API like Plausible, Mixpanel, or Segment.
  // For now, we log to the console to verify tracking is working.
  console.log(`[Analytics] Event: ${event}`, eventData);

  // Example: navigator.sendBeacon('/api/analytics', JSON.stringify(eventData));
}
