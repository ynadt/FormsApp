import { baseUrl } from '../constants/constants';
import { fetchWithAuth } from '../utils/fetchWithAuth.ts';
import { TemplateListResponse } from '../types/template';

export const fetchSearchResults = async (
  query: string,
  page = 1,
  limit = 20,
): Promise<TemplateListResponse> => {
  const url = `${baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`;
  return await fetchWithAuth(url, { credentials: 'include' });
};
