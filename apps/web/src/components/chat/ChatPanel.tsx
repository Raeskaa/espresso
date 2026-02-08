"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { InlineActions } from "@/components/ui/generation-actions";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  onSendMessage: (message: string) => Promise<string>;
  placeholder?: string;
  welcomeMessage?: string;
  className?: string;
}

export function ChatPanel({ 
  onSendMessage, 
  placeholder = "Ask me anything...",
  welcomeMessage = "I'm here to help you create the perfect profile. What would you like to improve?",
  className 
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(input.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-white rounded-2xl border border-[#2D4A3E]/10", className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#2D4A3E]/10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#2D4A3E] flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#2D4A3E]">AI Assistant</p>
          <p className="text-xs text-[#2D4A3E]/50">Always here to help</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? "flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
              message.role === 'assistant' 
                ? "bg-[#2D4A3E]" 
                : "bg-[#7EA3DC]"
            )}>
              {message.role === 'assistant' ? (
                <Sparkles className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message bubble */}
            <div className={cn(
              "group max-w-[80%] px-4 py-3 rounded-2xl text-sm",
              message.role === 'assistant' 
                ? "bg-[#FFFEF5] border border-[#2D4A3E]/10 text-[#2D4A3E]" 
                : "bg-[#2D4A3E] text-white"
            )}>
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* Actions for assistant messages */}
              {message.role === 'assistant' && (
                <div className="mt-2">
                  <InlineActions text={message.content} />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2D4A3E] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-[#FFFEF5] border border-[#2D4A3E]/10">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#2D4A3E]/50 animate-spin" />
                <span className="text-sm text-[#2D4A3E]/50">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#2D4A3E]/10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-[#2D4A3E]/10 focus:border-[#2D4A3E]/30 focus:outline-none resize-none text-sm text-[#2D4A3E] placeholder:text-[#2D4A3E]/40"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                input.trim() && !isLoading
                  ? "bg-[#2D4A3E] text-white hover:bg-[#1f352d]"
                  : "bg-[#2D4A3E]/10 text-[#2D4A3E]/30"
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        <p className="text-xs text-[#2D4A3E]/40 text-center mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
