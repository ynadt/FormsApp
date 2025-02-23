import { baseUrl } from '../constants/constants.ts';
import { fetchWithAuth } from '../utils/fetchWithAuth.ts';

export const fetchAnalyticsByTemplateId = async (templateId: string) => {
  return await fetchWithAuth(`${baseUrl}/analytics/${templateId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
};
