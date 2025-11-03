/**
 * Utility functions for detecting and handling email confirmation routes
 */

export interface ConfirmationParams {
  type?: string;
  token?: string;
  confirmation_token?: string;
  recovery_token?: string;
  invite_token?: string;
  access_token?: string;
  refresh_token?: string;
}

/**
 * Checks if the current URL contains Supabase email confirmation parameters
 * These can appear as hash fragments like #type=signup&confirmation_token=...
 * or as query parameters like ?type=signup&confirmation_token=...
 * Also handles cases where parameters were cleared after processing
 */
export const isEmailConfirmationRoute = (): boolean => {
  const hash = window.location.hash;
  const search = window.location.search;

  // Parse both hash and query parameters
  const hashParams = hash ? parseHashParams(hash) : {};
  const searchParams = search ? parseSearchParams(search) : {};

  // Combine both sets of parameters
  const params = { ...hashParams, ...searchParams };

  // Check for Supabase confirmation parameters
  const hasConfirmationType = params.type && ['signup', 'recovery', 'invite', 'email_change'].includes(params.type);
  const hasConfirmationToken = !!(params.confirmation_token || params.recovery_token || params.invite_token || params.access_token);

  // If we found confirmation parameters, mark this session
  if (hasConfirmationType && hasConfirmationToken) {
    sessionStorage.setItem('supabase_confirmation_detected', 'true');
    return true;
  }

  // TEMPORARY FIX: For now, assume mobile visits to root with # are confirmation attempts
  // This is a workaround since Supabase seems to strip parameters before we can detect them
  const isMobile = window.innerWidth < 1280;
  const isRootWithHash = window.location.pathname === '/' && window.location.hash === '#';
  const hasNoSearchParams = !search;

  // Debug: Store detection results for debugging
  if (typeof window !== 'undefined') {
    (window as any).confirmationDebug = {
      isMobile,
      pathname: window.location.pathname,
      hash: window.location.hash,
      isRootWithHash,
      hasNoSearchParams,
      wouldTrigger: isMobile && isRootWithHash && hasNoSearchParams
    };
  }

  if (isMobile && isRootWithHash && hasNoSearchParams) {
    // This is likely a confirmation link that had its parameters stripped
    return true;
  }

  return false;
};

/**
 * Parses URL hash parameters into an object
 */
export const parseHashParams = (hash: string): ConfirmationParams => {
  // Remove the # symbol and split by &
  const cleanHash = hash.replace('#', '');
  const params: ConfirmationParams = {};

  if (!cleanHash) return params;

  const pairs = cleanHash.split('&');

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[key as keyof ConfirmationParams] = decodeURIComponent(value);
    }
  }

  return params;
};

/**
 * Parses URL search parameters into an object
 */
export const parseSearchParams = (search: string): ConfirmationParams => {
  // Remove the ? symbol and split by &
  const cleanSearch = search.replace('?', '');
  const params: ConfirmationParams = {};

  if (!cleanSearch) return params;

  const pairs = cleanSearch.split('&');

  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[key as keyof ConfirmationParams] = decodeURIComponent(value);
    }
  }

  return params;
};

/**
 * Gets the confirmation type from the URL
 */
export const getConfirmationType = (): string | null => {
  const hashParams = parseHashParams(window.location.hash);
  const searchParams = parseSearchParams(window.location.search);
  const params = { ...hashParams, ...searchParams };
  return params.type || null;
};