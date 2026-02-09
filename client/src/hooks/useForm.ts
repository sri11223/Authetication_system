'use client';

import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export function useForm<T extends object>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear field error on change
      if (errors[name as keyof T]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[name as keyof T];
          return next;
        });
      }

      if (serverError) {
        setServerError(null);
      }
    },
    [errors, serverError]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setServerError(null);

      // Run validation
      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          return;
        }
      }

      setErrors({});
      setIsSubmitting(true);

      try {
        await onSubmit(values);
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string; errors?: string[] } } };
        const message =
          axiosError?.response?.data?.message ||
          axiosError?.response?.data?.errors?.[0] ||
          'Something went wrong. Please try again.';
        setServerError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setServerError(null);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    serverError,
    handleChange,
    handleSubmit,
    resetForm,
    reset: resetForm,
    setServerError,
    setValues,
  };
}
