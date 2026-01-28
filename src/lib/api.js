const API_BASE_URL = 'https://api.hyperx.llc';
const WALLET_API_BASE_URL = 'https://api.hyperx.llc';

// API utility functions
export const apiRequest = async (endpoint, options = {}, baseUrl = API_BASE_URL) => {
  const url = `${baseUrl}${endpoint}`;
  const token = localStorage.getItem('accessToken');

  const { headers: optionsHeaders, ...restOptions } = options;

  const config = {
    mode: 'cors',
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...optionsHeaders,
    },
  };

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📤 API REQUEST');
  console.log('URL:', url);
  console.log('Method:', config.method || 'GET');
  console.log('Headers:', config.headers);
  if (config.body) {
    console.log('Request Body:', config.body);
    try {
      console.log('Parsed Body:', JSON.parse(config.body));
    } catch (e) {
      console.log('(Body is not JSON)');
    }
  }

  // Log the Authorization header for debugging token issues
  if (config.headers.Authorization) {
    console.log('✓ Authorization header present');
  } else {
    console.warn('⚠ No Authorization header - token missing from localStorage');
  }

  try {
    const response = await fetch(url, config);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 API RESPONSE');
    console.log('Status:', response.status, response.statusText);
    console.log('OK:', response.ok);

    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    let data;

    if (contentType && contentType.includes('application/json')) {
      const responseText = await response.text();
      console.log('Raw Response Text:', responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''));

      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed Response Data:', data);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        throw new Error('Failed to parse JSON response');
      }
    } else {
      // If not JSON, read as text for better error reporting
      const textResponse = await response.text();
      console.log('❌ Non-JSON response received:', textResponse.substring(0, 200) + (textResponse.length > 200 ? '...' : ''));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Try to extract meaningful error message from HTML or text
      let errorMessage = `Server returned non-JSON response (${response.status})`;
      if (textResponse.includes('<!DOCTYPE')) {
        errorMessage = `Server returned HTML page instead of JSON (${response.status}). The API endpoint may be unavailable.`;
      }

      throw new Error(errorMessage);
    }

    if (!response.ok) {
      console.warn('⚠️ Response NOT OK:', response.status);
      console.log('Error Response Data:', data);

      // Handle token expiration
      if (response.status === 401 && token) {
        console.log('🔄 Token expired, attempting refresh...');
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${baseUrl}/v1/auth/refresh-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              console.log('Token refresh successful');
              localStorage.setItem('accessToken', refreshData.accessToken || refreshData.token);
              if (refreshData.refreshToken) {
                localStorage.setItem('refreshToken', refreshData.refreshToken);
              }

              // Retry original request with new token
              config.headers.Authorization = `Bearer ${refreshData.accessToken || refreshData.token}`;
              const retryResponse = await fetch(url, config);
              const retryData = await retryResponse.json();
              console.log('Retry request successful');
              return retryData;
            } else {
              console.log('Token refresh failed, clearing tokens');
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Don't redirect immediately, let the auth context handle it
          }
        } else {
          console.log('No refresh token available, clearing access token');
          localStorage.removeItem('accessToken');
        }
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('❌ API REQUEST FAILED');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  signup: (email, password) => 
    apiRequest('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  login: (email, password) => 
    apiRequest('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyEmail: (email,otp) => 
    apiRequest('/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email,otp }),
    }),

  resendVerification: (email) => 
    apiRequest('/v1/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  requestPasswordReset: (email) => 
    apiRequest('/auth/v2/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, newPassword) => 
    apiRequest('/auth/v2/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  refreshToken: (refreshToken) => 
    apiRequest('/auth/v2/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  getUser: () => 
    apiRequest('/v1/auth/user'),

  getVerificationStatus: () => 
    apiRequest('/auth/v2/verification-status'),

  logout: () => 
    apiRequest('/auth/v2/logout', { method: 'POST' }),

  cleanup: () => 
    apiRequest('/auth/v2/cleanup', { method: 'POST' }),

  // PIN Management
  createPin: (userId, pin) =>
    apiRequest('/auth/v1/pin/create', {
      method: 'POST',
      body: JSON.stringify({ userId, pin }),
    }),

  verifyPin: (userId, pin) =>
    apiRequest('/auth/v1/pin/verify', {
      method: 'POST',
      body: JSON.stringify({ userId, pin }),
    }),

  loginWithPin: (userId, pin) =>
    apiRequest('/auth/v1/pin/login', {
      method: 'POST',
      body: JSON.stringify({ userId, pin }),
    }),

  getPinStatus: (userId) =>
    apiRequest(`/auth/v1/pin/status?userId=${userId}`),
};

// Wallet API functions
export const walletAPI = {
  createWallet: (userId) => 
    apiRequest('/v1/wallet/create', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }, WALLET_API_BASE_URL),

  getWalletAddresses: (userId) => 
    apiRequest(`/v1/wallet/addresses/${userId}`, {}, WALLET_API_BASE_URL),

  getWalletBalances: (userId) => 
    apiRequest(`/v1/wallet/balances/${userId}`, {}, WALLET_API_BASE_URL),

  getSpecificBalance: (currency, address) =>
    apiRequest(`/v1/wallet/balance/${currency}/${address}`, {}, WALLET_API_BASE_URL),

  getFiatBalance: (userId, currency) =>
    apiRequest(`/v1/wallet/balance/${userId}/${currency}`, {}, WALLET_API_BASE_URL),

  getDepositAddress: (currency, chain, userId) => 
    apiRequest(`/v1/receive/address?currency=${currency}&chain=${chain}&userId=${userId}`, {}, WALLET_API_BASE_URL),

  // New: resolve bank name for NGN payouts by account number + bank identifier
  resolvePayoutBank: (accountNumber, bankName) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔎 [Resolve Payout Bank] called');
    console.log('  accountNumber:', accountNumber);
    console.log('  bankName:', bankName);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!accountNumber || !bankName) {
      return Promise.reject(new Error('Both accountNumber and bankName are required to resolve payout bank'));
    }

    return apiRequest('/v1/wallet/payout/ngn/resolve', {
      method: 'POST',
      body: JSON.stringify({ accountNumber, bankName }),
    }, WALLET_API_BASE_URL);
  },

  getDepositHistory: (currency, limit = 20) => 
    apiRequest(`/v1/receive/history?currency=${currency}&limit=${limit}`, {}, WALLET_API_BASE_URL),

  getTransactionHistory: (userId, limit = 5) => 
    apiRequest(`/v1/transactions?userId=${userId}&limit=${limit}`, {}, WALLET_API_BASE_URL),

  getSpecificTransaction: (transactionId) => 
    apiRequest(`/v1/transactions/${transactionId}`, {}, WALLET_API_BASE_URL),

  getWalletHistory: (userId) => 
    apiRequest(`/v1/wallet/history?userId=${userId}`, {}, WALLET_API_BASE_URL),

  getSwapQuote: (fromCurrency, toCurrency, amount) => 
    apiRequest('/v1/wallet/swap/quote', {
      method: 'POST',
      body: JSON.stringify({ 
        fromCurrency: fromCurrency, 
        toCurrency: toCurrency, 
        fromAmount: amount 
      }),
    }, WALLET_API_BASE_URL),

  executeSwap: (userId, fromCurrency, toCurrency, amount, quoteId, idempotencyKey) =>
    apiRequest('/v1/wallet/swap/execute', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        userId,
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        fromAmount: amount,
        quoteId
      }),
    }, WALLET_API_BASE_URL),

  sendExternal: (currency, amount, address, chain = null, idempotencyKey, passcode) =>
    apiRequest('/v1/vault/withdraw', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({
        currency,
        amount,
        toAddress: address,
        passcode,
        chain: chain || (
          currency === 'BTC' ? 'bitcoin' :
          currency === 'ETH' ? 'ethereum' :
          currency === 'SOL' ? 'solana' :
          currency === 'USDT' ? 'ethereum' :
          'ethereum'
        )
      }),
    }, WALLET_API_BASE_URL),

  getRate: (currency) =>
    apiRequest(`/v1/wallet/rates/${currency.toLowerCase()}`, {}, WALLET_API_BASE_URL),

  getConvertQuote: (crypto, fiat, amount, direction) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💱 [Convert Quote] Function called');
    console.log('Parameters received:');
    console.log('  crypto:', crypto, '(type:', typeof crypto, ')');
    console.log('  fiat:', fiat, '(type:', typeof fiat, ')');
    console.log('  amount:', amount, '(type:', typeof amount, ')');
    console.log('  direction:', direction, '(type:', typeof direction, ')');
    console.log('  direction === "buy":', direction === 'buy');
    console.log('  direction === "sell":', direction === 'sell');

    // Validate all required parameters
    if (!crypto || !fiat || !amount || !direction) {
      console.error('❌ Missing required parameters');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return Promise.reject(new Error('Missing required parameters: crypto, fiat, amount, and direction are all required'));
    }

    if (direction !== 'buy' && direction !== 'sell') {
      console.error('❌ Invalid direction received:', direction);
      console.error('Direction must be either "buy" or "sell"');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return Promise.reject(new Error('Invalid direction parameter: must be "buy" or "sell"'));
    }

    // Construct payload matching backend ConvertRequest interface
    const payload = {
      crypto,      // 'BTC' | 'ETH' | 'USDT'
      amount,      // Positive number
      fiat,        // 'NGN' | 'ZAR' | 'KES' | 'GHS'
      direction    // 'buy' | 'sell'
    };

    console.log('✅ Payload constructed (matches backend ConvertRequest interface):');
    console.log('   ', JSON.stringify(payload, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return apiRequest('/v1/wallet/crypto/convert/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, WALLET_API_BASE_URL);
  },

  executeConvert: (crypto, fiat, amount, direction, quoteId, idempotencyKey) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💱 [Execute Convert] Function called');
    console.log('Parameters received:');
    console.log('  crypto:', crypto);
    console.log('  fiat:', fiat);
    console.log('  amount:', amount);
    console.log('  direction:', direction, '(type:', typeof direction, ')');
    console.log('  quoteId:', quoteId);
    console.log('  idempotencyKey:', idempotencyKey);

    // Validate required parameters
    if (!crypto || !fiat || !amount || !direction) {
      console.error('❌ Missing required parameters for executeConvert');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return Promise.reject(new Error('Missing required parameters for conversion execution'));
    }

    if (direction !== 'buy' && direction !== 'sell') {
      console.error('❌ Invalid direction for executeConvert:', direction);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return Promise.reject(new Error('Invalid direction: must be "buy" or "sell"'));
    }

    // Construct payload matching backend ConvertRequest interface
    const payload = {
      crypto,      // 'BTC' | 'ETH' | 'USDT'
      amount,      // Positive number
      fiat,        // 'NGN' | 'ZAR' | 'KES' | 'GHS'
      direction,   // 'buy' | 'sell'
      clientRef: idempotencyKey  // For idempotency
    };

    // Add optional quoteId if provided
    if (quoteId) {
      payload.quoteId = quoteId;
    }

    console.log('✅ Execute payload (matches backend ConvertRequest interface):');
    console.log('   ', JSON.stringify(payload, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return apiRequest('/v1/wallet/crypto/convert/execute', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(payload),
    }, WALLET_API_BASE_URL);
  },
};

// Test API functions (for development)
export const testAPI = {
  getTestUsers: () => 
    apiRequest('/test/users'),

  createTestUser: (userData) => 
    apiRequest('/test/create-test-user', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
};

export default { apiRequest, authAPI, walletAPI, testAPI };
