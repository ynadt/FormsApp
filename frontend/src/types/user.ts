export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  blocked: boolean;
}

export interface UserListResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}
