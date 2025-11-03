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
 * These typically appear as hash fragments like #type=signup&confirmation_token=...
 */
export const isEmailConfirmationRoute = (): boolean => {
  const hash = window.location.hash;

  if (!hash) return false;

  // Parse the hash parameters
  const params = parseHashParams(hash);

  // Check for Supabase confirmation parameters
  const hasConfirmationType = params.type && ['signup', 'recovery', 'invite', 'email_change'].includes(params.type);
  const hasConfirmationToken = !!(params.confirmation_token || params.recovery_token || params.invite_token || params.access_token);

  return hasConfirmationType && hasConfirmationToken;
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
 * Gets the confirmation type from the URL
 */
export const getConfirmationType = (): string | null => {
  const params = parseHashParams(window.location.hash);
  return params.type || null;
};