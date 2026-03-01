// Reusable Error Display Component
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  RefreshCw, 
  WifiOff, 
  ShieldAlert, 
  Clock, 
  ServerOff,
  XCircle,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ErrorTypes, formatErrorForDisplay } from "../utils/errorHandler";

const errorIcons = {
  [ErrorTypes.NETWORK]: WifiOff,
  [ErrorTypes.AUTH]: ShieldAlert,
  [ErrorTypes.PERMISSION]: ShieldAlert,
  [ErrorTypes.TIMEOUT]: Clock,
  [ErrorTypes.SERVER]: ServerOff,
  [ErrorTypes.NOT_FOUND]: XCircle,
  [ErrorTypes.VALIDATION]: AlertTriangle,
  [ErrorTypes.UNKNOWN]: AlertTriangle
};

const errorColors = {
  [ErrorTypes.NETWORK]: { bg: "bg-yellow-100", icon: "text-yellow-600" },
  [ErrorTypes.AUTH]: { bg: "bg-blue-100", icon: "text-blue-600" },
  [ErrorTypes.PERMISSION]: { bg: "bg-red-100", icon: "text-red-600" },
  [ErrorTypes.TIMEOUT]: { bg: "bg-orange-100", icon: "text-orange-600" },
  [ErrorTypes.SERVER]: { bg: "bg-red-100", icon: "text-red-600" },
  [ErrorTypes.NOT_FOUND]: { bg: "bg-gray-100", icon: "text-gray-600" },
  [ErrorTypes.VALIDATION]: { bg: "bg-amber-100", icon: "text-amber-600" },
  [ErrorTypes.UNKNOWN]: { bg: "bg-red-100", icon: "text-red-600" }
};

export default function ErrorDisplay({ 
  error, 
  onRetry, 
  showHomeButton = true,
  compact = false,
  className = ""
}) {
  const errorInfo = formatErrorForDisplay(error);
  const IconComponent = errorIcons[errorInfo.type] || AlertTriangle;
  const colors = errorColors[errorInfo.type] || errorColors[ErrorTypes.UNKNOWN];

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50 ${className}`}>
        <IconComponent className={`w-5 h-5 ${colors.icon} flex-shrink-0`} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{errorInfo.title}</p>
          <p className="text-xs text-gray-600">{errorInfo.message}</p>
        </div>
        {errorInfo.showRetry && onRetry && (
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      <Card className="max-w-md w-full p-8 border-0 shadow-xl">
        <div className="text-center">
          <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <IconComponent className={`w-8 h-8 ${colors.icon}`} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{errorInfo.title}</h2>
          <p className="text-gray-600 mb-6">{errorInfo.message}</p>
          
          <div className="flex gap-3 justify-center">
            {errorInfo.showRetry && onRetry && (
              <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            {showHomeButton && (
              <Link to={createPageUrl("Home")}>
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Inline error for form fields
export function InlineError({ message, className = "" }) {
  if (!message) return null;
  
  return (
    <p className={`text-sm text-red-600 mt-1 flex items-center gap-1 ${className}`}>
      <AlertTriangle className="w-3 h-3" />
      {message}
    </p>
  );
}

// Toast-style error notification
export function ErrorToast({ error, onDismiss }) {
  const errorInfo = formatErrorForDisplay(error);
  const IconComponent = errorIcons[errorInfo.type] || AlertTriangle;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-white border border-red-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start gap-3">
          <IconComponent className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{errorInfo.title}</p>
            <p className="text-sm text-gray-600">{errorInfo.message}</p>
          </div>
          {onDismiss && (
            <button 
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}