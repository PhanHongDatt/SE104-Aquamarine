import React from 'react';

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{label}</label>
        <select
          ref={ref}
          className="rounded-md border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
