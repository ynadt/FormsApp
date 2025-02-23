import { FC, FormEvent, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { loginUser, registerUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { AuthResponse, LoginVars } from '../types/auth';

export const AuthPage: FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const loginMutation: UseMutationResult<
    AuthResponse,
    Error,
    LoginVars,
    unknown
  > = useMutation({
    mutationFn: ({ email, password }: LoginVars) => loginUser(email, password),
    onSuccess: (data) => {
      if (data.supabase && data.supabase.user && data.user) {
        setUser({
          id: data.supabase.user.id,
          email: data.supabase.user.email,
          name: data.user.name,
          role: data.user.role,
        });
        navigate('/');
      }
    },
    onError: (error: Error) => setAuthError(error.message || 'Login failed'),
  });

  const registerMutation: UseMutationResult<
    AuthResponse,
    Error,
    LoginVars & { name?: string },
    unknown
  > = useMutation({
    mutationFn: ({ email, password, name }: LoginVars & { name?: string }) =>
      registerUser(email, password, name),
    onSuccess: (data) => {
      if (data.supabase && data.supabase.user && data.user) {
        setUser({
          id: data.supabase.user.id,
          email: data.supabase.user.email,
          name: data.user.name,
          role: data.user.role,
        });
        navigate('/');
      }
    },
    onError: (error: Error) =>
      setAuthError(error.message || 'Registration failed'),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (mode === 'login') {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, password, name });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, margin: 'auto', mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <ToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={(_e, newMode) => {
            if (newMode) setMode(newMode);
          }}
          fullWidth
          sx={{ mb: 2 }}
        >
          <ToggleButton value="login">Login</ToggleButton>
          <ToggleButton value="register">Register</ToggleButton>
        </ToggleButtonGroup>
        <Box component="form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <TextField
              label="Name"
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
            />
          )}
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          {authError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {authError}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loginMutation.isPending || registerMutation.isPending}
          >
            {mode === 'login' ? 'Login' : 'Register'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthPage;
