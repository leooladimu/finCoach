import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

// Initialize Plaid client
// In production, use environment variables from .env.local
const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, // Use 'sandbox' for testing
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
    },
  },
});

export const plaidClient = new PlaidApi(configuration);

// Create link token for Plaid Link initialization
export async function createLinkToken(userId: string) {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'FinCoach',
      products: [Products.Transactions, Products.Auth, Products.Balance],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    
    return response.data.link_token;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
}

// Exchange public token for access token
export async function exchangePublicToken(publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    
    return {
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
    };
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
}

// Get account balances
export async function getBalances(accessToken: string) {
  try {
    const response = await plaidClient.accountsBalanceGet({
      access_token: accessToken,
    });
    
    return response.data.accounts;
  } catch (error) {
    console.error('Error fetching balances:', error);
    throw error;
  }
}

// Get transactions
export async function getTransactions(
  accessToken: string,
  startDate: string,
  endDate: string
) {
  try {
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
    });
    
    return response.data.transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

// Get institution information
export async function getInstitution(accessToken: string) {
  try {
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    });
    
    const institutionId = itemResponse.data.item.institution_id;
    
    if (institutionId) {
      const institutionResponse = await plaidClient.institutionsGetById({
        institution_id: institutionId,
        country_codes: [CountryCode.Us],
      });
      
      return institutionResponse.data.institution;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching institution:', error);
    throw error;
  }
}
