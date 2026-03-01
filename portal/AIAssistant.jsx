import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Minimize2, Maximize2, Loader2, AlertCircle, X, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIAssistant({ user, projects = [], proposals = [], documents = [] }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${user?.full_name || 'there'}! 👋 I'm your AI project assistant. I can help you with:\n\n• Project status summaries\n• Document information\n• General questions about your projects\n• Timeline and milestone updates\n\nWhat would you like to know?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isMinimized) {
      setUnreadCount(0);
    }
  }, [isMinimized]);

  const buildContext = () => {
    const activeProjects = projects.filter(p => p.status === "In Progress");
    const recentDocuments = documents.slice(0, 5);
    const pendingProposals = proposals.filter(p => p.status === "sent" || p.status === "awaiting_signature");

    return `
CURRENT USER CONTEXT:
- User: ${user?.full_name} (${user?.email})
- Total Projects: ${projects.length}
- Active Projects: ${activeProjects.length}
- Recent Documents: ${recentDocuments.length}
- Pending Proposals: ${pendingProposals.length}

ACTIVE PROJECTS SUMMARY:
${activeProjects.map(p => `- ${p.project_name} (${p.project_number}): ${p.status} - ${p.progress_percentage}% complete`).join('\n')}

RECENT DOCUMENTS:
${recentDocuments.map(d => `- ${d.document_name} (${d.document_type}) - Uploaded ${new Date(d.created_date).toLocaleDateString()}`).join('\n')}

PENDING PROPOSALS:
${pendingProposals.map(p => `- ${p.title} - Status: ${p.status}`).join('\n')}
`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const context = buildContext();
      
      const conversationHistory = messages
        .slice(-5)
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join('\n\n');

      const systemPrompt = `You are an AI assistant for Pacific Engineering & Construction Inc.'s client portal. 

YOUR ROLE:
- Provide helpful information about the client's projects, documents, and proposals
- Answer questions accurately based on the provided context
- Be professional, friendly, and concise
- Always cite data sources when providing specific information

CRITICAL GUIDELINES:
1. ONLY use information from the provided context
2. If you don't have information, say: "I don't have enough information to answer that accurately, but I can forward your question to your assigned project manager."
3. NEVER make up project details, dates, or status information
4. Always acknowledge uncertainty when data is unclear
5. Suggest contacting the project manager for detailed technical questions

CONTEXT DATA:
${context}

CONVERSATION HISTORY:
${conversationHistory}

USER QUESTION: ${input}

Provide a helpful, accurate response. If you reference specific data (like dates, percentages, or names), cite where it came from.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: systemPrompt,
        add_context_from_internet: false
      });

      const assistantMessage = {
        role: "assistant",
        content: typeof response === 'string' ? response : response.content || response.text || "I apologize, but I couldn't generate a response.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("AI Assistant error:", error);
      
      let errorMessage = "I'm having trouble connecting right now. Please try again in a moment.";
      
      if (error.message?.includes("rate limit")) {
        errorMessage = "I'm experiencing high demand right now. Please wait a few moments and try again.";
      } else if (error.message?.includes("network")) {
        errorMessage = "I'm having network connectivity issues. Please check your connection and try again.";
      }

      setError(errorMessage);
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-2xl relative"
        >
          <Sparkles className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold border-2 border-white">
              {unreadCount}
            </div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <Card className="border-0 shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[calc(100vh-3rem)]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">AI Assistant</h3>
              <p className="text-xs text-cyan-100">Here to help 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(true)}
              className="text-white hover:bg-white/20 h-8 w-8"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : message.isError
                    ? "bg-red-50 border border-red-200 text-red-800"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                {message.role === "assistant" ? (
                  <ReactMarkdown className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
                <p className="text-xs mt-2 opacity-60">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-xs text-red-800">{error}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setError(null)}
              className="ml-auto h-6 w-6"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your projects..."
              className="min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </Card>
    </div>
  );
}