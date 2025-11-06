/**
 * Componente reutilizável para campos do perfil
 * Reduz repetição de código e mantém consistência visual
 */

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ReactNode } from 'react';

interface ProfileFieldProps {
  label: string;
  value: string | number;
  isEditing?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  type?: 'text' | 'number';
  icon?: ReactNode;
  onChange?: (value: string) => void;
  helperText?: string;
  error?: string; // Mensagem de erro de validação (Zod, etc)
  'data-test'?: string;
}

export function ProfileField({
  label,
  value,
  isEditing = false,
  isRequired = false,
  isDisabled = false,
  placeholder,
  maxLength,
  type = 'text',
  icon,
  onChange,
  helperText,
  error,
  'data-test': dataTest,
}: ProfileFieldProps) {
  return (
    <div data-test={dataTest}>
      <Label className="text-sm font-medium text-gray-700 mb-2">
        {label} {isRequired && isEditing && <span className="text-red-500">*</span>}
      </Label>
      
      {isEditing && !isDisabled ? (
        <>
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={`mt-1 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
            placeholder={placeholder}
            maxLength={maxLength}
            required={isRequired}
          />
          {error && (
            <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
          )}
          {helperText && !error && (
            <p className="text-xs text-gray-500 mt-1">{helperText}</p>
          )}
        </>
      ) : (
        <>
          <div className={`p-3 rounded-lg border border-gray-200 ${
            isDisabled ? 'bg-gray-100' : 'bg-gray-50'
          }`}>
            {icon ? (
              <div className="flex items-center">
                <span className="mr-2 text-gray-400">{icon}</span>
                <p className={isDisabled ? 'text-gray-600' : 'text-gray-900'}>
                  {value || 'Não informado'}
                </p>
              </div>
            ) : (
              <p className={isDisabled ? 'text-gray-600' : 'text-gray-900'}>
                {value || 'Não informado'}
              </p>
            )}
          </div>
          {helperText && isDisabled && (
            <p className="text-xs text-gray-500 mt-1">{helperText}</p>
          )}
        </>
      )}
    </div>
  );
}
