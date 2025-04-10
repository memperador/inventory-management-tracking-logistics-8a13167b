
import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../hooks/useTieredAIChat';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              rounded-lg p-3 max-w-[85%]
              ${message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted border'}
            `}>
              <div className="flex items-center gap-2 mb-1">
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
                <span className="text-xs font-medium">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
              </div>
              
              <div className="text-sm">
                {typeof message.content === 'string' 
                  ? message.content 
                  : message.content
                }
              </div>
              
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg p-3 bg-muted border">
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-4 w-4" />
                <span className="text-xs font-medium">Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="animate-pulse flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                </div>
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
