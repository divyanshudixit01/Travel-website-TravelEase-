import api from './api';

/**
 * Request an authoritative server quote for flight, hotel, or partner service
 */
export const requestFareQuote = async (quoteParams) => {
  try {
    const response = await api.post('/pricing/quote', quoteParams);
    return response.data;
  } catch (error) {
    console.error('[pricingApi] Quote generation failed:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to establish verified fare quote from server.');
  }
};

/**
 * Verify validity of a quoteToken
 */
export const verifyFareQuote = async (quoteToken) => {
  try {
    const response = await api.post('/pricing/verify', { quoteToken });
    return response.data;
  } catch (error) {
    console.error('[pricingApi] Quote verification failed:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Invalid or expired quote.' };
  }
};
