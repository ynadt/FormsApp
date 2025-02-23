import { baseUrl } from '../constants/constants';
import { fetchWithAuth } from '../utils/fetchWithAuth.ts';

export const fetchUsersAutocomplete = async (
  search?: string,
): Promise<Array<{ id: string; email: string; name: string }>> => {
  const url = `${baseUrl}/users/autocomplete?search=${search || ''}`;

  try {
    const data = await fetchWithAuth(url, {
      credentials: 'include',
    });

    if (!Array.isArray(data)) {
      throw new Error('Invalid response format: expected an array of users');
    }

    return data;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
};
