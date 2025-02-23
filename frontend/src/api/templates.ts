import { fetchWithAuth } from '../utils/fetchWithAuth.ts';
import { baseUrl } from '../constants/constants';
import {
  FullTemplate,
  TemplateCreateData,
  TemplateUpdateData,
  TemplateListResponse,
} from '../types/template';

export const fetchTemplates = async (params?: {
  sort?: string;
  limit?: number;
}): Promise<TemplateListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  const url = `${baseUrl}/templates?${queryParams.toString()}`;
  return await fetchWithAuth(url, { credentials: 'include' });
};

export const fetchMyTemplates = async (params?: {
  sort?: string;
  limit?: number;
}): Promise<TemplateListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  const url = `${baseUrl}/templates/my-templates?${queryParams.toString()}`;
  return await fetchWithAuth(url, { credentials: 'include' });
};

export const fetchTemplateById = async (id: string): Promise<FullTemplate> => {
  return await fetchWithAuth(`${baseUrl}/templates/${id}`, {
    credentials: 'include',
  });
};

export const createTemplate = async (
  data: TemplateCreateData,
): Promise<FullTemplate> => {
  return await fetchWithAuth(`${baseUrl}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
};

export const updateTemplate = async (
  id: string,
  data: TemplateUpdateData,
): Promise<FullTemplate> => {
  return await fetchWithAuth(`${baseUrl}/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
};

export const deleteTemplates = async (
  ids: string[],
): Promise<{ deletedCount: number }> => {
  return await fetchWithAuth(`${baseUrl}/templates/`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ids }),
  });
};
