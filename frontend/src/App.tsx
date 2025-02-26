import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@toolpad/core/AppProvider';
import { createTheme } from '@mui/material/styles';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTemplatesPage from './pages/AdminTemplatesPage';
import MyTemplatesPage from './pages/MyTemplatesPage.tsx';
import TemplatePage from './pages/TemplatePage.tsx';
import FormPage from './pages/FormPage.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import GlobalQueryClientProvider from './GlobalQueryClientProvider';
import { ThemeProviderCustom, useThemeCustom } from './ThemeContext';
import TemplateViewPage from './pages/TemplateViewPage.tsx';
import FormViewPage from './pages/FormViewPage.tsx';
import AdminFormsPage from './pages/AdminFormsPage.tsx';
import MyFormsPage from './pages/MyFormsPage.tsx';
import SearchResultsPage from './pages/SearchResultsPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

const AppContent: React.FC = () => {
  const { mode } = useThemeCustom();
  const theme = createTheme({
    palette: {
      mode,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <GlobalQueryClientProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/search" element={<SearchResultsPage />} />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/templates"
              element={
                <ProtectedRoute>
                  <AdminTemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/forms"
              element={
                <ProtectedRoute>
                  <AdminFormsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/new"
              element={
                <ProtectedRoute>
                  <TemplatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/templates/:id/edit"
              element={
                <ProtectedRoute>
                  <TemplatePage />
                </ProtectedRoute>
              }
            />
            <Route path="/templates/:id" element={<TemplateViewPage />} />
            <Route
              path="/templates/:id/fill"
              element={
                <ProtectedRoute>
                  <FormPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/forms/:formId/edit"
              element={
                <ProtectedRoute>
                  <FormPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms/:formId"
              element={
                <ProtectedRoute>
                  <FormViewPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-templates"
              element={
                <ProtectedRoute>
                  <MyTemplatesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-forms"
              element={
                <ProtectedRoute>
                  <MyFormsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            closeOnClick
            newestOnTop
            pauseOnHover
            draggable
            progressClassName="custom-progress-bar"
          />
        </GlobalQueryClientProvider>
      </Router>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemeProviderCustom>
        <AppContent />
      </ThemeProviderCustom>
    </AppProvider>
  );
};

export default App;
