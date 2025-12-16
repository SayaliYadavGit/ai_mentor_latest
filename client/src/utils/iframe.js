/**
 * Check if app is running inside an iframe (e.g., SharePoint)
 */
export const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

/**
 * Get the full app URL for opening in new tab
 */
export const getFullAppUrl = () => {
  return window.location.origin; // https://ai-mentor-latest.vercel.app
};

/**
 * Open app in new tab (when embedded)
 */
export const openInNewTab = (path = '/') => {
  const fullUrl = `${getFullAppUrl()}${path}`;
  window.open(fullUrl, '_blank', 'noopener,noreferrer');
};