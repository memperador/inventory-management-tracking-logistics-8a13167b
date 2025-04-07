
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useComments } from '../hooks/useComments';
import { formatDate } from '../utils/dateUtils';

const CommentsTab: React.FC = () => {
  const {
    comments,
    newComment,
    setNewComment,
    isSubmitting,
    handleAddComment
  } = useComments();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{comment.author}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No comments yet</p>
          )}
          
          <div className="space-y-2">
            <Textarea 
              placeholder="Add a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
            <Button 
              onClick={handleAddComment}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsTab;
