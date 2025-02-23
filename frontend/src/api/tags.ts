import { baseUrl } from '../constants/constants.ts';

export const fetchTags = async (
  search?: string,
): Promise<Array<{ id: string; name: string }>> => {
  const response = await fetch(`${baseUrl}/tags?search=${search || ''}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }
  return response.json();
};
