import React from 'react';
import { MessageSquare } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your text here...",
  disabled = false
}) => {
  return (
    <div className="relative">
      <div className="flex items-center mb-3">
        <MessageSquare className="w-5 h-5 text-gray-500 mr-2" />
        <label className="text-sm font-medium text-gray-700">
          Text to Analyze
        </label>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={8}
        className={`
          w-full p-4 border-2 border-gray-200 rounded-xl resize-none transition-all duration-200
          focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none
          disabled:bg-gray-50 disabled:cursor-not-allowed
          placeholder:text-gray-400
        `}
        style={{ minHeight: '200px' }}
      />
      
      {value.length > 9000 && (
        <div className={`
          absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-medium
          ${value.length > 10000 
            ? 'bg-red-100 text-red-700' 
            : 'bg-orange-100 text-orange-700'
          }
        `}>
          {value.length > 10000 ? 'Too long!' : 'Near limit'}
        </div>
      )}
    </div>
  );
};

export default TextInput;