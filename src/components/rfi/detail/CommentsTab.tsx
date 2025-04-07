
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const CommentsTab: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p className="text-muted-foreground">No comments yet</p>
          <div className="space-y-2">
            <Textarea placeholder="Add a comment..." />
            <Button>Post Comment</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommentsTab;
