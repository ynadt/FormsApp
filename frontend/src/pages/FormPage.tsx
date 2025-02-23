import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchTemplateById } from '../api/templates';
import { fetchFormById, submitForm, updateForm } from '../api/forms';
import { FullTemplate, Question } from '../types/template';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
  Divider,
  Backdrop,
} from '@mui/material';
import DashboardLayout from '../components/DashboardLayout';
import { toast } from 'react-toastify';
import CustomPageHeader from '../components/CustomPageHeader.tsx';
import ExpandableDescription from '../components/ExpandableDescription.tsx';
import { Answer } from '../types/form.ts';

const FormPage: React.FC = () => {
  const { id, formId } = useParams<{ id?: string; formId?: string }>();
  const navigate = useNavigate();

  const [templateId, setTemplateId] = useState<string | undefined>(undefined);

  const { data: form, isLoading: formLoading } = useQuery({
    queryKey: ['form', formId],
    queryFn: () => (formId ? fetchFormById(formId) : null),
    enabled: Boolean(formId),
  });

  useEffect(() => {
    if (form && form.template.id) {
      setTemplateId(form.template.id);
    }
  }, [form]);

  useEffect(() => {
    if (!formId && id) {
      setTemplateId(id);
    }
  }, [formId, id]);

  const {
    data: template,
    isLoading: templateLoading,
    error: templateError,
  } = useQuery<FullTemplate>({
    queryKey: ['template', templateId],
    queryFn: () => fetchTemplateById(templateId!),
    enabled: !!templateId,
  });

  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (template) {
      const initialAnswers: Record<string, string> = {};
      template.questions.forEach((q: Question) => {
        initialAnswers[q.id] = q.type === 'CHECKBOX' ? 'false' : '';
      });
      setAnswers(initialAnswers);
    }
    if (form && form.answers) {
      const existingAnswers: Record<string, string> = {};
      form.answers.forEach((answer: Answer) => {
        existingAnswers[answer.questionId] = answer.value || '';
      });
      setAnswers(existingAnswers);
    }
  }, [template, form]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const submitMutation = useMutation({
    mutationFn: (payload: {
      templateId: string;
      answers: Record<string, string>;
    }) => submitForm(payload),
    onSuccess: (data) => {
      toast.success('Form submitted successfully.');
      navigate(`/forms/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error submitting form.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      formId: string;
      answers: Record<string, string>;
      version: number;
    }) => updateForm(payload),
    onSuccess: (data) => {
      toast.success('Form updated successfully.');
      navigate(`/forms/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error updating form.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (template) {
      for (const q of template.questions) {
        if (q.required && !answers[q.id]?.trim()) {
          toast.error(`Please answer the required question: ${q.title}`);
          return;
        }
      }
    }
    if (formId) {
      updateMutation.mutate({ formId, answers, version: form!.version });
    } else {
      submitMutation.mutate({ templateId: templateId!, answers });
    }
  };

  if (templateLoading || formLoading) {
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

  if (templateError || (!template && !form)) {
    return (
      <DashboardLayout>
        <Typography color="error">Error loading template.</Typography>
      </DashboardLayout>
    );
  }

  return (
    <>
      <Backdrop
        open={updateMutation.isPending || submitMutation.isPending}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <DashboardLayout>
        <Card sx={{ m: 2, p: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 0,
              }}
            >
              <CustomPageHeader
                title={template?.title || 'Untitled Template'}
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
            {template?.description && (
              <ExpandableDescription
                description={template.description}
                maxLength={300}
              />
            )}
            <Divider sx={{ mb: 2 }} />
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              {template?.questions.map((q, index) => (
                <Box key={q.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {index + 1}. {q.title}{' '}
                    {q.required && <span style={{ color: 'red' }}>*</span>}
                  </Typography>
                  {q.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {q.description}
                    </Typography>
                  )}
                  {q.type === 'SINGLE_LINE' && (
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                  )}
                  {q.type === 'MULTI_LINE' && (
                    <TextField
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={4}
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                  )}
                  {q.type === 'INTEGER' && (
                    <TextField
                      fullWidth
                      variant="outlined"
                      type="number"
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    />
                  )}
                  {q.type === 'CHECKBOX' && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={answers[q.id] === 'true'}
                            onChange={(e) =>
                              handleAnswerChange(
                                q.id,
                                e.target.checked ? 'true' : 'false',
                              )
                            }
                          />
                        }
                        label=""
                      />
                    </Box>
                  )}
                </Box>
              ))}
              <Stack direction="row" spacing={2}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={
                    submitMutation.isPending || updateMutation.isPending
                  }
                >
                  {formId ? 'Update Form' : 'Submit Form'}
                </Button>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </DashboardLayout>
    </>
  );
};

export default FormPage;
