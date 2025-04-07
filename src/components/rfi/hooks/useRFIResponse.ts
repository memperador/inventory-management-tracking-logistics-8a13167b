
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useRFIResponse = () => {
  const [responseText, setResponseText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  
  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      toast({
        title: "Response required",
        description: "Please enter a response before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      // In a real app, you would submit to an API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Response submitted",
        description: "The RFI response has been submitted successfully.",
      });
      
      // Reset form after successful submission
      setResponseText('');
      
      // Return true to indicate successful submission
      return true;
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your response. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    responseText,
    setResponseText,
    isSubmitting,
    handleSubmitResponse
  };
};
