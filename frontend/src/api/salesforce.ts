import { baseUrl } from '../constants/constants';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { SalesforceAccountResponse } from '../types/salesforce.ts';

export const syncWithSalesforce = async (
  userId: string,
  data: { name: string; email: string; phone: string },
) => {
  return await fetchWithAuth(`${baseUrl}/salesforce/sync-account`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, ...data }),
  });
};

export const checkSalesforceAccount = async (
  userId: string,
): Promise<SalesforceAccountResponse> => {
  return await fetchWithAuth(`${baseUrl}/salesforce/check-account/${userId}`);
};
