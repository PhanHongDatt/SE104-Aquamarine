import React from 'react';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || `date-picker-${generatedId.replace(/:/g, "")}`;

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium">{label}</label>
        <input
          id={inputId}
          type="date"
          ref={ref}
          className="rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
