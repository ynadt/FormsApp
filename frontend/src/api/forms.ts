import { baseUrl } from '../constants/constants';
import type { FormListResponse, FormType } from '../types/form';
import { fetchWithAuth } from '../utils/fetchWithAuth.ts';

export const fetchForms = async (params?: {
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<FormListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  return await fetchWithAuth(`${baseUrl}/forms?${queryParams.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
};

export const fetchMyForms = async (params?: {
  sort?: string;
  limit?: number;
}): Promise<FormListResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  const url = `${baseUrl}/forms/my-forms?${queryParams.toString()}`;
  return await fetchWithAuth(url, { credentials: 'include' });
};

export const fetchFormById = async (id: string): Promise<FormType> => {
  return await fetchWithAuth(`${baseUrl}/forms/${id}`, {
    credentials: 'include',
  });
};

export const deleteForms = async (
  ids: string[],
): Promise<{ deletedCount: number }> => {
  return await fetchWithAuth(`${baseUrl}/forms/`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ ids }),
  });
};

export const submitForm = async ({
  templateId,
  answers,
}: {
  templateId: string;
  answers: { [questionId: string]: string };
}) => {
  return await fetchWithAuth(`${baseUrl}/forms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ templateId, answers }),
  });
};

export const updateForm = async ({
  formId,
  answers,
  version,
}: {
  formId: string;
  answers: { [questionId: string]: string };
  version: number;
}) => {
  return await fetchWithAuth(`${baseUrl}/forms/${formId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ answers, version }),
  });
};

export const fetchFormsByTemplateId = async (templateId: string) => {
  return await fetchWithAuth(`${baseUrl}/templates/${templateId}/forms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
};
