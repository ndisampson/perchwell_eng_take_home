// API utility functions with user context support

/**
 * Makes an API request with automatic client_id header if available
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {string|null} clientId - Optional client ID to include in headers
 * @returns {Promise<Response>}
 */
export async function apiRequest(url, options = {}, clientId = null) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  };

  // Add client_id header if provided
  if (clientId) {
    defaultHeaders['X-Client-Id'] = clientId;
  }

  const mergedOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: 'same-origin',
  };

  return fetch(url, mergedOptions);
}

/**
 * Helper to get JSON response from API request
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options
 * @param {string|null} clientId - Optional client ID
 * @returns {Promise<Object>}
 */
export async function getApiData(url, options = {}, clientId = null) {
  const response = await apiRequest(url, options, clientId);
  return response.json();
}

