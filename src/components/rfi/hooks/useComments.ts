
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export const useComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment before posting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // In a real app, you would submit to an API
      await new Promise(resolve => setTimeout(resolve, 300));

      const newCommentObj: Comment = {
        id: Date.now().toString(),
        content: newComment,
        author: 'Current User', // In a real app, get from auth context
        createdAt: new Date().toISOString(),
      };

      setComments(prevComments => [...prevComments, newCommentObj]);
      setNewComment('');
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Failed to add comment",
        description: "There was an error posting your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comments,
    newComment,
    setNewComment,
    isSubmitting,
    handleAddComment
  };
};
