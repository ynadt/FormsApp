import { baseUrl } from '../constants/constants';
import { fetchWithAuth } from '../utils/fetchWithAuth.ts';

export interface LikeStatus {
  count: number;
  liked: boolean;
}

export const fetchLikeStatus = async (
  templateId: string,
): Promise<LikeStatus> => {
  const res = await fetch(`${baseUrl}/likes/${templateId}/status`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const likeTemplate = async (templateId: string) => {
  const res = await fetchWithAuth(`${baseUrl}/likes/${templateId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const unlikeTemplate = async (templateId: string) => {
  const res = await fetchWithAuth(`${baseUrl}/likes/${templateId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) throw new Error(await res.text());
};
