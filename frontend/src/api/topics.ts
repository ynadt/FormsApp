import { baseUrl } from '../constants/constants';

export const fetchTopics = async (
  search?: string,
): Promise<Array<{ id: string; name: string }>> => {
  const response = await fetch(`${baseUrl}/topics?search=${search || ''}`);
  if (!response.ok) {
    throw new Error('Failed to fetch topics');
  }
  return response.json();
};
