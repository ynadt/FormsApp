export interface AuthResponse {
  supabase: {
    session: {
      access_token: string;
      refresh_token: string;
    };
    user: {
      id: string;
      email: string;
    };
  };
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export interface LoginVars {
  email: string;
  password: string;
}
