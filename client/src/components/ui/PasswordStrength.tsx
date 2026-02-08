'use client';

import React, { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const REQUIREMENTS: Requirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One special character (@$!%*?&#)', test: (p) => /[@$!%*?&#]/.test(p) },
];

const STRENGTH_CONFIG = [
  { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-600' },
  { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-600' },
  { label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-600' },
  { label: 'Good', color: 'bg-lime-500', textColor: 'text-lime-600' },
  { label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' },
];

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const { passed, strengthIndex } = useMemo(() => {
    const results = REQUIREMENTS.map((req) => req.test(password));
    const passedCount = results.filter(Boolean).length;
    return {
      passed: results,
      strengthIndex: password.length === 0 ? -1 : Math.min(passedCount, STRENGTH_CONFIG.length) - 1,
    };
  }, [password]);

  if (!password) return null;

  const config = strengthIndex >= 0 ? STRENGTH_CONFIG[strengthIndex] : STRENGTH_CONFIG[0];

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Strength bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-surface-500">Password Strength</span>
          <span className={`text-xs font-semibold ${config.textColor}`}>{config.label}</span>
        </div>
        <div className="flex gap-1">
          {STRENGTH_CONFIG.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                index <= strengthIndex ? config.color : 'bg-surface-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-1 gap-1.5">
        {REQUIREMENTS.map((req, index) => (
          <div
            key={index}
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              passed[index] ? 'text-green-600' : 'text-surface-400'
            }`}
          >
            {passed[index] ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
