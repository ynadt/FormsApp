import { baseUrl } from '../constants/constants';
import { fetchWithAuth } from '../utils/fetchWithAuth.ts';

export const fetchComments = async (templateId: string) => {
  return await fetchWithAuth(`${baseUrl}/comments/${templateId}`);
};

export const addComment = async (templateId: string, text: string) => {
  return await fetchWithAuth(`${baseUrl}/comments/${templateId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    credentials: 'include',
  });
};
