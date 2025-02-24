import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Checkbox,
  Typography,
  IconButton,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';
import {
  createTemplate,
  updateTemplate,
  fetchTemplateById,
} from '../api/templates';
import {
  TemplateCreateData,
  NewQuestion,
  TemplateUpdateData,
} from '../types/template';
import { fetchTopics } from '../api/topics';
import { fetchUsersAutocomplete } from '../api/users';
import { fetchTags } from '../api/tags';
import debounce from 'lodash.debounce';
import { useAuthStore } from '../store/authStore';
import ImageUploader from '../components/ImageUploader.tsx';
import QuestionManager from '../components/QuestionManager.tsx';
import UserAccessManager from '../components/UserAccessManager.tsx';
import TopicSelector from '../components/TopicSelector.tsx';
import TagSelector from '../components/TagSelector.tsx';
import Loader from '../components/Loader.tsx';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ConfirmationDialog from '../components/ConfirmationDialog.tsx';
import { haveQuestionsChanged } from '../utils/questionUtils.ts';

type FormDataType = TemplateCreateData & { version?: number };

const TemplatePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { user: currentUser } = useAuthStore();
  const [initialFormData, setInitialFormData] = useState<FormDataType | null>(
    null,
  );

  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    description: '',
    public: true,
    topicId: undefined,
    questions: [
      {
        type: 'SINGLE_LINE',
        title: '',
        description: '',
        required: false,
        showInResults: true,
      },
    ],
    tags: [],
    image_url: '',
    templateAccesses: [],
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [onConfirmCallback, setOnConfirmCallback] = useState<() => void>(
    () => {},
  );
  const [selectedUsers, setSelectedUsers] = useState<
    Array<{ id: string; email: string; name: string }>
  >([]);
  const [tagInput, setTagInput] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');
  const [debouncedSearchInput, setDebouncedSearchInput] = useState('');

  useEffect(() => {
    const debounced = debounce(() => {
      setDebouncedSearchInput(userSearchInput);
    }, 300);
    debounced();
    return () => debounced.cancel();
  }, [userSearchInput]);

  const {
    data: templateData,
    isLoading: isTemplateLoading,
    isError: isTemplateError,
  } = useQuery({
    queryKey: ['template', id],
    queryFn: () => fetchTemplateById(id!),
    enabled: isEditMode,
  });

  useEffect(() => {
    if (templateData) {
      const initialData = {
        title: templateData.title,
        description: templateData.description || '',
        public: templateData.public,
        topicId: templateData.topic?.id,
        questions: templateData.questions.map((q) => ({
          id: q.id,
          type: q.type,
          title: q.title,
          description: q.description || '',
          required: q.required,
          showInResults: q.showInResults,
        })),
        tags: templateData.tags.map((t) => t.name),
        image_url: templateData.image_url || '',
        templateAccesses: templateData.templateAccesses.map((access) => ({
          userId: access.user.id,
        })),
        version: templateData.version,
      };
      setInitialFormData(initialData);
      setFormData(initialData);
      if (!templateData.public) {
        setSelectedUsers(
          templateData.templateAccesses.map((access) => ({
            id: access.user.id,
            email: access.user.email,
            name: access.user.name || '',
          })),
        );
      }

      if (templateData.authorId && currentUser) {
        if (
          templateData.authorId !== currentUser.id &&
          currentUser.role !== 'ADMIN'
        ) {
          toast.error('You are not authorized to edit this template.');
          navigate(-1);
        }
      }
    }
  }, [templateData, currentUser, navigate]);

  const { data: users, isFetching } = useQuery({
    queryKey: ['users', debouncedSearchInput],
    queryFn: () => fetchUsersAutocomplete(debouncedSearchInput),
    enabled: debouncedSearchInput.length > 0,
  });

  const { data: topics } = useQuery({
    queryKey: ['topics'],
    queryFn: () => fetchTopics(),
  });
  const { data: tags } = useQuery({
    queryKey: ['tags'],
    queryFn: () => fetchTags(),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormDataType) => createTemplate(data),
    onSuccess: (data) => {
      toast.success('Template created successfully.');
      navigate(`/templates/${data.id}`);
    },
    onError: (err: any) => {
      const message =
        err instanceof Error ? err.message : 'Failed to create template.';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormDataType) => {
      if (data.version === undefined) {
        throw new Error('Version is required for updating the template.');
      }
      return updateTemplate(id!, data as TemplateUpdateData);
    },
    onSuccess: (data) => {
      toast.success('Template updated successfully.');
      navigate(`/templates/${data.id}`);
    },
    onError: (err: any) => {
      const message =
        err instanceof Error ? err.message : 'Failed to update template.';
      toast.error(message);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          type: 'SINGLE_LINE',
          title: '',
          description: '',
          required: false,
          showInResults: true,
        },
      ],
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData((prev) => {
      const newQuestions = prev.questions.filter((_, i) => i !== index);
      return { ...prev, questions: newQuestions };
    });
  };

  const handleQuestionChange = (
    index: number,
    field: keyof NewQuestion,
    value: string | boolean,
  ) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleReorderQuestions = (newQuestions: NewQuestion[]) => {
    setFormData((prev) => ({ ...prev, questions: newQuestions }));
  };

  const handleTagInputChange = (value: string) => setTagInput(value);
  const handleTagSelection = (newValue: string[]) => {
    setFormData((prev) => ({
      ...prev,
      tags: newValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required.');
      return;
    }

    if (formData.questions.length === 0) {
      toast.error('At least one question is required.');
      return;
    }

    for (const [i, q] of formData.questions.entries()) {
      if (!q.title.trim()) {
        toast.error(`Question ${i + 1}: Title is required.`);
        return;
      }
    }

    if (
      isEditMode &&
      JSON.stringify(formData) === JSON.stringify(initialFormData)
    ) {
      toast.info('No changes detected.');
      return;
    }

    const questionsChanged = haveQuestionsChanged(
      formData.questions,
      initialFormData?.questions || [],
    );

    if (questionsChanged) {
      setOnConfirmCallback(() => () => {
        handleFormUpdate();
      });
      setShowConfirmation(true);
    } else {
      handleFormUpdate();
    }
  };

  const handleFormUpdate = () => {
    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isEditMode && isTemplateLoading) {
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );
  }

  if (isEditMode && isTemplateError) {
    return (
      <DashboardLayout>
        <Typography color="error">Error loading template data.</Typography>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Card sx={{ m: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" gutterBottom>
              {isEditMode ? 'Edit Template' : 'Create New Template'}
            </Typography>
            {isEditMode && (
              <IconButton
                onClick={() => navigate(`/templates/${id}`)}
                color="primary"
                title="View Template"
              >
                <VisibilityIcon fontSize="large" />
              </IconButton>
            )}
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <TextField
              label="Description (Markdown supported)"
              name="description"
              multiline
              rows={4}
              value={formData.description || ''}
              onChange={handleChange}
            />
            <ImageUploader
              initialImageUrl={formData.image_url}
              onImageUpload={(url) =>
                setFormData((prev) => ({ ...prev, image_url: url }))
              }
              onImageDelete={() =>
                setFormData((prev) => ({ ...prev, image_url: '' }))
              }
            />
            <TopicSelector
              topics={topics}
              selectedTopicId={formData.topicId}
              onChange={(topicId) =>
                setFormData((prev) => ({ ...prev, topicId }))
              }
            />
            <TagSelector
              tags={tags ? tags.map((tag) => tag.name) : []}
              selectedTags={formData.tags}
              onChange={handleTagSelection}
              onInputChange={handleTagInputChange}
              tagInput={tagInput}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.public}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      public: e.target.checked,
                    }))
                  }
                />
              }
              label="Public"
            />
            {!formData.public && (
              <UserAccessManager
                selectedUsers={selectedUsers}
                setSelectedUsers={(users) => {
                  setSelectedUsers(users);
                  setFormData((prev) => ({
                    ...prev,
                    templateAccesses: users.map((user) => ({
                      userId: user.id,
                    })),
                  }));
                }}
                userSearchInput={userSearchInput}
                setUserSearchInput={setUserSearchInput}
                users={users}
                isFetching={isFetching}
              />
            )}

            {isEditMode && (
              <Typography variant="body2" color="error" marginY={2}>
                * Warning: Changing questions (except reordering) will delete
                all previously submitted forms for this template.
              </Typography>
            )}

            <QuestionManager
              questions={formData.questions}
              onAddQuestion={handleAddQuestion}
              onRemoveQuestion={handleRemoveQuestion}
              onChangeQuestion={handleQuestionChange}
              onReorderQuestions={handleReorderQuestions}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={updateMutation.isPending || createMutation.isPending}
              sx={{ mt: 2 }}
            >
              {updateMutation.isPending || createMutation.isPending ? (
                <CircularProgress size={24} />
              ) : isEditMode ? (
                'Update Template'
              ) : (
                'Create Template'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showConfirmation}
        message="Changing questions will delete all previously submitted forms for this template. Do you want to proceed?"
        onClose={() => setShowConfirmation(false)}
        onConfirm={() => {
          setShowConfirmation(false);
          onConfirmCallback();
        }}
      />
    </DashboardLayout>
  );
};

export default TemplatePage;
