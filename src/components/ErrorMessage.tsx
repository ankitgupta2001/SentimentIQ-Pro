import React from 'react';
import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import type { AnalysisError } from '../types/sentiment';

interface ErrorMessageProps {
  error: AnalysisError;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <RefreshCw className="w-5 h-5" />;
      case 'validation':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <XCircle className="w-5 h-5" />;
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'network':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'validation':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'network':
        return 'Connection Error';
      case 'validation':
        return 'Input Error';
      default:
        return 'Analysis Error';
    }
  };

  return (
    <div className={`
      rounded-xl p-6 border-2 transition-all duration-300
      ${getErrorColor()}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getErrorIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold mb-1">
            {getErrorTitle()}
          </h3>
          <p className="text-sm leading-relaxed">
            {error.message}
          </p>
          
          {error.type === 'network' && (
            <div className="mt-3 text-xs opacity-80">
              <p>Troubleshooting tips:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Wait a moment and try again</li>
              </ul>
            </div>
          )}
          
          {error.type === 'validation' && (
            <div className="mt-3 text-xs opacity-80">
              <p>Please ensure your text meets the requirements and try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;