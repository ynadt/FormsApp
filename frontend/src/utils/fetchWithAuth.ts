import { refreshToken } from '../api/auth.ts';

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  let res = await fetch(url, { ...options, credentials: 'include' });

  if (res.status === 401) {
    try {
      await refreshToken();
      res = await fetch(url, { ...options, credentials: 'include' });
    } catch (err) {
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!res.ok) {
    const text = await res.text();
    let message = text;
    try {
      const json = JSON.parse(text);
      if (json.error) {
        message = json.error;
      }
    } catch (err) {}
    throw new Error(message);
  }

  return res.json();
};
