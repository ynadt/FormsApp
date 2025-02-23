import { fetchWithAuth } from '../utils/fetchWithAuth.ts';
import { baseUrl } from '../constants/constants.ts';

import { UserListResponse } from '../types/user';

export const fetchUsers = async ({
  page = 1,
  limit = 10,
  sort = '',
}: {
  page?: number;
  limit?: number;
  sort?: string;
}): Promise<UserListResponse> => {
  return await fetchWithAuth(
    `${baseUrl}/users?page=${page}&limit=${limit}&sort=${sort}`,
  );
};

export const updateUsersRole = async ({
  ids,
  role,
}: {
  ids: string[];
  role: string;
}) => {
  return await fetchWithAuth(`${baseUrl}/users/update-role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, role }),
  });
};

export const blockUsers = async ({
  ids,
  blocked,
}: {
  ids: string[];
  blocked: boolean;
}) => {
  return await fetchWithAuth(`${baseUrl}/users/block`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, blocked }),
  });
};

export const deleteUsers = async (
  ids: string[],
): Promise<{ message: string }> => {
  return await fetchWithAuth(`${baseUrl}/users`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
};
