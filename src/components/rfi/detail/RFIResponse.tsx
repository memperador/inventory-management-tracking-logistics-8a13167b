
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useRFIResponse } from '../hooks/useRFIResponse';

interface RFIResponseProps {
  responseText: string | null;
  responseDate: string | null;
  formatDate: (date: string | null) => string;
}

const RFIResponse: React.FC<RFIResponseProps> = ({ 
  responseText, 
  responseDate, 
  formatDate 
}) => {
  const {
    responseText: newResponseText,
    setResponseText,
    isSubmitting,
    handleSubmitResponse
  } = useRFIResponse();
  
  return (
    <div className="pt-4 border-t">
      <h3 className="font-medium mb-4">Response</h3>
      {responseText ? (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Responded on {formatDate(responseDate)}</p>
          <p>{responseText}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">No response yet. Provide a response below:</p>
          <Textarea 
            placeholder="Enter your response..." 
            className="min-h-[150px]"
            value={newResponseText}
            onChange={(e) => setResponseText(e.target.value)}
            disabled={isSubmitting}
          />
          <Button 
            onClick={handleSubmitResponse}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Response"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RFIResponse;
