import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  useTheme,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import supabase from '../supabase';
import { fetchComments, addComment } from '../api/comments';

const CommentsTab: React.FC = () => {
  const { id: templateId } = useParams<{ id: string }>();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const { user } = useAuthStore();
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const getComments = async () => {
    if (!templateId) {
      console.error('Template ID is undefined');
      return;
    }
    try {
      const data = await fetchComments(templateId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getComments();
  }, [templateId]);

  useEffect(() => {
    const subscription = supabase
      .channel('comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Comment',
          filter: `templateId=eq.${templateId}`,
        },
        (payload) => {
          if (payload.errors && payload.errors.length > 0) {
            console.error('Realtime errors:', payload.errors);
            return;
          }
          supabase
            .from('User')
            .select('id, name, email')
            .eq('id', payload.new.userId)
            .single()
            .then(({ data: userData }) => {
              setComments((prev) => {
                const exists = prev.some((c) => c.id === payload.new.id);
                if (exists) return prev;
                return [...prev, { ...payload.new, user: userData }];
              });
            });
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [templateId]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !user || isAddingComment || !templateId) return;
    setIsAddingComment(true);
    try {
      const newCommentData = await addComment(templateId, newComment);
      setComments((prev) => [...prev, newCommentData]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ height: 400, overflowY: 'auto', mb: 2 }}>
        <List>
          {comments.map((comment) => {
            const isCurrentUser = comment.user?.id === user?.id;
            return (
              <ListItem
                key={comment.id}
                sx={{
                  alignItems: 'flex-start',
                  justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                }}
              >
                {!isCurrentUser && (
                  <ListItemAvatar>
                    <Avatar>
                      {comment.user?.name?.[0] ||
                        comment.user?.email?.[0] ||
                        'U'}
                    </Avatar>
                  </ListItemAvatar>
                )}
                <Paper
                  elevation={1}
                  sx={{
                    paddingY: 0.5,
                    paddingX: 1,
                    m: 0.5,
                    borderRadius: 2,
                    maxWidth: '80%',
                    bgcolor: isCurrentUser
                      ? theme.palette.mode === 'dark'
                        ? 'grey.800'
                        : 'grey.100'
                      : theme.palette.mode === 'dark'
                        ? 'grey.900'
                        : 'grey.300',
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        component="div"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {comment.user?.name ||
                          comment.user?.email ||
                          'Anonymous'}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="caption"
                          component="div"
                          color="text.secondary"
                        >
                          {new Date(comment.createdAt).toLocaleString()}
                        </Typography>
                        <Typography variant="body1" component="div">
                          {comment.text}
                        </Typography>
                      </>
                    }
                  />
                </Paper>
                {isCurrentUser && (
                  <ListItemAvatar>
                    <Avatar>
                      {comment.user?.name?.[0] ||
                        comment.user?.email?.[0] ||
                        'U'}
                    </Avatar>
                  </ListItemAvatar>
                )}
              </ListItem>
            );
          })}
          <div ref={commentsEndRef} />
        </List>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'center',
          p: 1,
          marginRight: 4,
        }}
      >
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Type a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
          disabled={isAddingComment}
          sx={{ flex: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleAddComment}
          disabled={!newComment.trim() || isAddingComment}
        >
          {isAddingComment ? <CircularProgress size={24} /> : 'Send'}
        </Button>
      </Box>
    </Box>
  );
};

export default CommentsTab;
