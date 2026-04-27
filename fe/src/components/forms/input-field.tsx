import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{label}</label>
        <input
          ref={ref}
          className="rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

InputField.displayName = 'InputField';
