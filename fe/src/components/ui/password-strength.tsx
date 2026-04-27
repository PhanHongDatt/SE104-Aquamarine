"use client";

import { getPasswordStrength } from "@/schemas/auth.schema";

interface PasswordStrengthProps {
  password: string;
}

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  if (!password) return null;
  const { score, label, color } = getPasswordStrength(password);
  const filledBars = Math.ceil((score / 6) * 4);

  return (
    <div className="mt-2 space-y-1.5 animate-fade-in">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((bar) => (
          <div
            key={bar}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              bar <= filledBars ? color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Độ mạnh: <span className={
          score <= 2 ? "text-red-500 font-medium" :
          score <= 4 ? "text-yellow-600 font-medium" :
          "text-green-600 font-medium"
        }>{label}</span>
      </p>
    </div>
  );
};
