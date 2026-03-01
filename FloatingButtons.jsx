import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getClientPortalUrl, isMainDomain } from "@/components/utils/subdomainHelpers";
import { User, Bell } from "lucide-react";
import ChatBot from "@/components/ChatBot.jsx";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function FloatingButtons({ user }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Only show floating buttons on main domain
  if (!isMainDomain()) {
    return null;
  }

  return (
    <>
      {/* Chat Bot with State Tracking */}
      <ErrorBoundary>
        <div>
          <ChatBotWrapper onOpenChange={setIsChatOpen} />
        </div>
      </ErrorBoundary>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 z-50 flex items-center gap-3 transition-all duration-300"
           style={{ right: isChatOpen ? 'calc(24rem + 1.5rem + 1.5rem)' : '6.5rem' }}>
        
        {/* Notification Button */}
        {user && (
          <ErrorBoundary>
            <div className="relative">
              <NotificationCenter user={user} />
            </div>
          </ErrorBoundary>
        )}

        {/* Client Portal Button */}
        <a href={getClientPortalUrl(createPageUrl("ClientAuth"))}>
          <button
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group"
          >
            <User className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </a>
      </div>
    </>
  );
}

function ChatBotWrapper({ onOpenChange }) {
  return <ChatBotWithCallback onOpenChange={onOpenChange} />;
}

function ChatBotWithCallback({ onOpenChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (newState) => {
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  return <ChatBot isOpen={isOpen} onToggle={handleToggle} />;
}