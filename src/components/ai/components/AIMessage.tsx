
import React from 'react';
import { Bot, AlertTriangle, Lightbulb } from 'lucide-react';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  type?: 'error' | 'recommendation' | 'standard';
}

interface AIMessageProps {
  message: AIMessage;
}

const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  const baseClasses = "rounded-lg px-4 py-2 max-w-[80%]";
  let classes = "";
  
  if (message.role === 'user') {
    classes = `${baseClasses} bg-primary text-primary-foreground`;
  } else if (message.type === 'error') {
    classes = `${baseClasses} bg-red-50 border border-red-200 text-red-800`;
  } else if (message.type === 'recommendation') {
    classes = `${baseClasses} bg-blue-50 border border-blue-200 text-blue-800`;
  } else {
    classes = `${baseClasses} bg-background border`;
  }
  
  let icon = null;
  if (message.type === 'error') {
    icon = <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />;
  } else if (message.type === 'recommendation') {
    icon = <Lightbulb className="h-4 w-4 mr-1 text-blue-600" />;
  } else if (message.role === 'assistant') {
    icon = <Bot className="h-4 w-4 mr-1" />;
  }
  
  return (
    <div className={classes}>
      {icon && (
        <div className="flex items-center mb-1">
          {icon}
          <span className="text-xs font-medium">
            {message.type === 'error' ? 'Error Assistant' : 
             message.type === 'recommendation' ? 'Feature Suggestion' : 
             'Assistant'}
          </span>
        </div>
      )}
      <p className="text-sm">{message.content}</p>
      <p className="text-xs opacity-70 mt-1">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  );
};

export default AIMessage;
