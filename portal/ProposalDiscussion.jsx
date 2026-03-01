import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { MessageSquare, Send, Loader2, User } from "lucide-react";
import { format } from "date-fns";

export default function ProposalDiscussion({ proposalId }) {
  const [user, setUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['proposal-messages', proposalId],
    queryFn: () => base44.entities.ProposalMessage.filter(
      { proposal_id: proposalId },
      'created_date'
    ),
    refetchInterval: 5000
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return await base44.entities.ProposalMessage.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['proposal-messages', proposalId]);
      setNewMessage("");
      scrollToBottom();
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;

    sendMessageMutation.mutate({
      proposal_id: proposalId,
      message: newMessage,
      sender_email: user.email,
      sender_name: user.full_name,
      is_internal: false
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="text-lg font-bold">Discussion Thread</h3>
        </div>
        <p className="text-sm text-blue-100 mt-1">
          Ask questions or discuss this proposal with the team
        </p>
      </div>

      <div className="h-[400px] overflow-y-auto p-6 bg-gray-50 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 font-medium mb-2">No messages yet</p>
            <p className="text-sm text-gray-500">Start the conversation by sending a message below</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isCurrentUser = msg.sender_email === user?.email;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCurrentUser ? 'bg-blue-600' : 'bg-gray-400'
                  }`}>
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className={`flex-1 max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      isCurrentUser 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <p className={`text-xs font-semibold mb-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {msg.sender_name}
                      </p>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 px-2 ${
                      isCurrentUser ? 'text-right' : 'text-left'
                    }`}>
                      {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message... (Press Enter to send)"
            className="flex-1 min-h-[60px] resize-none"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700 h-[60px] px-6"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}