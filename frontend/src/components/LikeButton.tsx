import React from 'react';
import { IconButton, Tooltip, Badge, CircularProgress } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLikeStatus, likeTemplate, unlikeTemplate } from '../api/likes';
import { useAuthStore } from '../store/authStore';

interface LikeButtonProps {
  templateId: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ templateId }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const likeStatusQueryKey = ['likeStatus', templateId];

  const { data: likeStatus, isLoading: isLikeStatusLoading } = useQuery({
    queryKey: likeStatusQueryKey,
    queryFn: () => fetchLikeStatus(templateId),
    refetchOnWindowFocus: true,
  });

  const likeMutation = useMutation({
    mutationFn: () => likeTemplate(templateId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: likeStatusQueryKey });
      const previous = queryClient.getQueryData(likeStatusQueryKey);
      queryClient.setQueryData(likeStatusQueryKey, (old: any) => ({
        ...old,
        liked: true,
        count: (old?.count ?? 0) + 1,
      }));
      return { previous };
    },
    onError: (_err, _, context) => {
      queryClient.setQueryData(likeStatusQueryKey, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: likeStatusQueryKey });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikeTemplate(templateId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: likeStatusQueryKey });
      const previous = queryClient.getQueryData(likeStatusQueryKey);
      queryClient.setQueryData(likeStatusQueryKey, (old: any) => ({
        ...old,
        liked: false,
        count: Math.max((old?.count ?? 1) - 1, 0),
      }));
      return { previous };
    },
    onError: (_err, _, context) => {
      queryClient.setQueryData(likeStatusQueryKey, context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: likeStatusQueryKey });
    },
  });

  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    if (likeStatus?.liked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  if (isLikeStatusLoading) {
    return <CircularProgress size={24} />;
  }

  return (
    <Tooltip title={user ? 'Like' : 'Log in to like'}>
      <div onClick={(e) => e.stopPropagation()}>
        {' '}
        <IconButton
          onClick={handleToggleLike}
          disabled={!user || likeMutation.isPending || unlikeMutation.isPending}
        >
          {likeMutation.isPending || unlikeMutation.isPending ? (
            <CircularProgress size={24} />
          ) : (
            <Badge
              badgeContent={likeStatus?.count ?? 0}
              color="primary"
              showZero
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              sx={{
                '& .MuiBadge-badge': { transform: 'translate(70%, -50%)' },
              }}
            >
              {likeStatus?.liked ? (
                <ThumbUpIcon color="primary" />
              ) : (
                <ThumbUpOffAltIcon />
              )}
            </Badge>
          )}
        </IconButton>
      </div>
    </Tooltip>
  );
};

export default LikeButton;
