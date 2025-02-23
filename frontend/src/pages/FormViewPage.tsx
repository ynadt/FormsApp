import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchFormById } from '../api/forms';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Divider,
  Tooltip,
  Fab,
} from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import EditIcon from '@mui/icons-material/Edit';
import { FormType } from '../types/form.ts';
import CustomPageHeader from '../components/CustomPageHeader.tsx';
import { headingStyles } from '../styles/typographyStyles.ts';
import { canEdit } from '../utils/canEdit.ts';
import QuestionAnswerBox from '../components/QuestionAnswerBox.tsx';
import ExpandableDescription from '../components/ExpandableDescription.tsx';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import UpdateIcon from '@mui/icons-material/Update';

const FormViewPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const {
    data: form,
    isLoading: formLoading,
    error: formError,
  } = useQuery<FormType>({
    queryKey: ['form', formId],
    queryFn: () => fetchFormById(formId!),
  });

  if (formLoading) {
    return (
      <DashboardLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (formError || !form) {
    toast.error('Error loading form');
    return (
      <DashboardLayout>
        <Typography color="error">Error loading form.</Typography>
      </DashboardLayout>
    );
  }

  const answerMap: Record<string, string> = {};
  form.answers.forEach((a) => {
    answerMap[a.questionId] = a.value || '-';
  });

  const template = form.template;

  return (
    <DashboardLayout>
      <Card sx={{ m: 2, p: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <CustomPageHeader
              title="Form Details"
              subtitle="View form details and answers"
            />
          </Box>

          <Typography variant="h6" sx={headingStyles}>
            Template Information
          </Typography>
          <Typography variant="subtitle1">
            <strong>Title:</strong> {template.title}
          </Typography>
          {template.description && (
            <Typography variant="body1">
              <strong>Description:</strong>
              <ExpandableDescription
                description={template.description}
                maxLength={300}
              />
            </Typography>
          )}
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            <strong>Author:</strong>{' '}
            {template.authorName
              ? `${template.authorName} (${template.authorEmail})`
              : template.authorEmail}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={headingStyles}>
            Form Submission Details
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ mb: 1, display: 'flex', alignItems: 'center' }}
          >
            <PersonIcon fontSize="small" sx={{ mr: 1 }} />
            <strong>Submitted by:</strong>{' '}
            {form.authorName
              ? `${form.authorName} (${form.authorEmail})`
              : form.authorEmail || form.authorId}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EventIcon />
            <Typography variant="subtitle1" component="div">
              <strong>Submitted on:</strong>{' '}
              {new Date(form.createdAt).toLocaleString()}
            </Typography>
          </Box>
          {form.createdAt !== form.updatedAt && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <UpdateIcon />
              <Typography variant="subtitle1" component="div">
                <strong>Updated at:</strong>{' '}
                {new Date(form.updatedAt).toLocaleString()}
              </Typography>
            </Box>
          )}
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={headingStyles}>
            Answers:
          </Typography>
          {template.questions.map((q, index) => (
            <QuestionAnswerBox
              key={q.id}
              question={q}
              answer={answerMap[q.id]}
              index={index}
            />
          ))}
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Back
          </Button>

          <Box
            sx={{
              position: 'fixed',
              bottom: 30,
              right: 30,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              zIndex: 100000,
            }}
          >
            {canEdit(form, currentUser?.id, currentUser?.role === 'ADMIN') && (
              <Tooltip title="Edit Form" placement="left">
                <Fab
                  color="primary"
                  aria-label="edit-form"
                  onClick={() => navigate(`/forms/${formId}/edit`)}
                >
                  <EditIcon />
                </Fab>
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default FormViewPage;
