import { DEFAULT_LIMIT } from '../constants';

export interface PaginationOptions {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

export function buildPaginationOptions(query: any): PaginationOptions {
  const page = parseInt(query.page as string, 10) || 1;
  const limit = parseInt(query.limit as string, 10) || DEFAULT_LIMIT;
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
}

export function buildSortingOptions(sort?: string): any {
  if (!sort) {
    return { createdAt: 'desc' };
  }

  const [field, direction] = sort.split(':');
  if (field && direction) {
    if (field === 'authorEmail') {
      return { user: { email: direction } };
    }
    if (field === 'templateTitle') {
      return { template: { title: direction } };
    }

    return { [field]: direction };
  } else if (sort === 'popular') {
    return { forms: { _count: 'desc' } };
  } else if (sort === 'newest') {
    return { createdAt: 'desc' };
  }

  return { createdAt: 'desc' };
}
