import { FC, FormEvent, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { loginUser, registerUser } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { AuthResponse, LoginVars } from '../types/auth';
import { validateEmail, validatePassword } from '../utils/validationUtils.ts';
import { useTranslation } from 'react-i18next';

export const AuthPage: FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setAuthError(`${t('auth.authErrorEmail')}`);
      return;
    }

    if (!validatePassword(password)) {
      setAuthError(`${t('auth.authErrorPassword')}`);
      return;
    }

    if (mode === 'login') {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ email, password, name });
    }
  };

  const handleAuthSuccess = (data: AuthResponse) => {
    if (data.supabase && data.supabase.user && data.user) {
      setUser({
        id: data.supabase.user.id,
        email: data.supabase.user.email,
        name: data.user.name,
        role: data.user.role || 'USER',
      });
      navigate('/');
    }
  };

  const handleAuthError = (error: Error, errorMessage: string) => {
    setAuthError(error.message || t(errorMessage));
  };

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginVars) => loginUser(email, password),
    onSuccess: handleAuthSuccess,
    onError: (error: Error) => handleAuthError(error, 'auth.loginError'),
  });

  const registerMutation = useMutation({
    mutationFn: ({ email, password, name }: LoginVars & { name?: string }) =>
      registerUser(email, password, name),
    onSuccess: handleAuthSuccess,
    onError: (error: Error) => handleAuthError(error, 'auth.registerError'),
  });

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
          <ToggleButton value="login">{t('auth.login')}</ToggleButton>
          <ToggleButton value="register">{t('auth.register')}</ToggleButton>
        </ToggleButtonGroup>
        <Box component="form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <TextField
              label={t('auth.name')}
              type="text"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              autoComplete="name"
            />
          )}
          <TextField
            label={t('auth.email')}
            type="email"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            autoComplete="email"
          />
          <TextField
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
            autoComplete={
              mode === 'login' ? 'current-password' : 'new-password'
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
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
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthPage;
