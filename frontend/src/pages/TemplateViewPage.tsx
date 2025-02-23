import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchTemplateById } from '../api/templates';
import { fetchFormsByTemplateId } from '../api/forms';
import { fetchAnalyticsByTemplateId } from '../api/analytics';
import { FullTemplate } from '../types/template';
import { FormType } from '../types/form';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Divider,
  Stack,
  Paper,
  Fab,
  Tooltip,
} from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import { useAuthStore } from '../store/authStore';
import EditIcon from '@mui/icons-material/Edit';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { AnalyticsData } from '../types/analytics';
import CustomPageHeader from '../components/CustomPageHeader.tsx';
import TagCloud from '../components/TagCloud';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import UpdateIcon from '@mui/icons-material/Update';
import { canEdit } from '../utils/canEdit';
import TemplateQuestionsTab from '../components/TemplateQuestionsTab';
import TemplateFormsTab from '../components/TemplateFormsTab';
import TemplateAnalyticsTab from '../components/TemplateAnalyticsTab';
import ExpandableDescription from '../components/ExpandableDescription.tsx';
import CommentsTab from '../components/CommentsTab.tsx';

const TemplateViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <DashboardLayout>
        <Typography color="error">Invalid template ID.</Typography>
      </DashboardLayout>
    );
  }

  const currentUser = useAuthStore.getState().user;
  const currentUserId = currentUser?.id;
  const isAdmin = currentUser?.role === 'ADMIN';

  const [tabIndex, setTabIndex] = useState(0);

  const {
    data: template,
    isLoading: isTemplateLoading,
    error: templateError,
  } = useQuery<FullTemplate>({
    queryKey: ['template', id],
    queryFn: () => fetchTemplateById(id),
  });

  const {
    data: forms = [],
    isLoading: isFormsLoading,
    error: formsError,
  } = useQuery<FormType[]>({
    queryKey: ['forms', id],
    queryFn: () => fetchFormsByTemplateId(id),
    enabled: Boolean(
      template && canEdit(template, currentUserId, isAdmin) && tabIndex === 1,
    ),
  });

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
  } = useQuery<AnalyticsData>({
    queryKey: ['analytics', id],
    queryFn: () => fetchAnalyticsByTemplateId(id),
    enabled: Boolean(
      template && canEdit(template, currentUserId, isAdmin) && tabIndex === 2,
    ),
  });

  if (template && !template.public) {
    const isAuthorized =
      currentUserId === template.authorId ||
      isAdmin ||
      template.templateAccesses.some(
        (access) => access.user.id === currentUserId,
      );
    if (!isAuthorized) {
      return (
        <DashboardLayout>
          <Typography color="error" sx={{ mt: 4 }}>
            You are not authorized to view this private template.
          </Typography>
        </DashboardLayout>
      );
    }
  }

  const tabsToShow =
    template && canEdit(template, currentUserId, isAdmin)
      ? ['Questions', 'Comments', 'Forms', 'Analytics']
      : ['Questions', 'Comments'];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const handleEdit = () => {
    navigate(`/templates/${id}/edit`);
  };

  const handleFillTemplate = () => {
    navigate(`/templates/${id}/fill`);
  };

  if (isTemplateLoading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            overflow: 'hidden',
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (templateError || !template) {
    return (
      <DashboardLayout>
        <Typography color="error">Error loading template.</Typography>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card sx={{ m: 2, p: 2, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 0,
            }}
          >
            <CustomPageHeader
              title={template.title}
              sx={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            />
          </Box>
          {/* Template basic information */}
          <Box sx={{ mb: 2 }}>
            {template.image_url && (
              <Box sx={{ mb: 2, textAlign: 'flex-start' }}>
                <Box
                  component="img"
                  src={template.image_url}
                  alt={template.title}
                  sx={{
                    maxWidth: '50%',
                    height: 'auto',
                    borderRadius: 2,
                    border: '2px solid #ddd',
                    boxShadow: 1,
                  }}
                />
              </Box>
            )}
            <ExpandableDescription
              description={template.description}
              maxLength={300}
            />
            {template.topic && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={`Topic: ${template.topic.name}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            )}
            {template.tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <TagCloud
                  tags={template.tags.map((tt) => ({
                    id: tt.id,
                    name: tt.name,
                  }))}
                  isLoading={false}
                  error={null}
                />
              </Box>
            )}
            <Typography
              variant="subtitle2"
              sx={{ mb: 1, display: 'flex', alignItems: 'center' }}
            >
              <PersonIcon fontSize="small" sx={{ mr: 1 }} />
              Author:{' '}
              {template.authorName
                ? `${template.authorName} (${template.authorEmail})`
                : template.authorEmail}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EventIcon fontSize="small" />
              <Typography
                variant="caption"
                component="div"
                color="text.secondary"
              >
                Created at: {new Date(template.createdAt).toLocaleString()}
              </Typography>
            </Box>
            {template.createdAt !== template.updatedAt && (
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
              >
                <UpdateIcon fontSize="small" />
                <Typography
                  variant="caption"
                  component="div"
                  color="text.secondary"
                >
                  Updated at: {new Date(template.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`This is a ${template.public ? 'public' : 'private'} template`}
                color={template.public ? 'success' : 'error'}
                variant="outlined"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            {/* Access List for Private Templates (only for creator/admin) */}
            {!template.public && canEdit(template, currentUserId, isAdmin) && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Access List
                </Typography>
                <Paper
                  sx={{
                    maxHeight: 150,
                    overflowY: 'auto',
                    p: 1,
                    backgroundColor: 'background.paper',
                  }}
                  variant="outlined"
                >
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {template.templateAccesses.map((access) => (
                      <Chip key={access.id} label={access.user.email} />
                    ))}
                  </Stack>
                </Paper>
              </Box>
            )}
          </Box>
          {/* Tabs */}
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            sx={{ mb: 2 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            {tabsToShow.map((tab, index) => (
              <Tab key={index} label={tab} />
            ))}
          </Tabs>
          <Box sx={{ mt: 2 }}>
            {tabIndex === 0 && (
              <TemplateQuestionsTab questions={template.questions} />
            )}
            {tabIndex === 1 && <CommentsTab />}
            {tabIndex === 2 && canEdit(template, currentUserId, isAdmin) && (
              <TemplateFormsTab
                forms={forms}
                isLoading={isFormsLoading}
                error={formsError}
              />
            )}
            {tabIndex === 3 && canEdit(template, currentUserId, isAdmin) && (
              <TemplateAnalyticsTab
                analytics={analytics ?? null}
                isLoading={isAnalyticsLoading}
                error={analyticsError}
              />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Floating Action Button (FAB) with Tooltips */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 30,
          right: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          zIndex: 10,
        }}
      >
        <Tooltip title="Fill Template" placement="left">
          <Fab
            color="success"
            aria-label="fill-template"
            onClick={handleFillTemplate}
          >
            <PostAddIcon />
          </Fab>
        </Tooltip>
        {canEdit(template, currentUserId, isAdmin) && (
          <Tooltip title="Edit Template" placement="left">
            <Fab
              color="primary"
              aria-label="edit-template"
              onClick={handleEdit}
            >
              <EditIcon />
            </Fab>
          </Tooltip>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default TemplateViewPage;
