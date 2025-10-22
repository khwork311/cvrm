import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

/**
 * Custom hook for form validation with automatic error re-translation on language change
 * @param getSchema - Function that returns the Zod schema (to get fresh translations)
 * @param formData - Current form data to validate (or function to extract validation data)
 * @param extractData - Optional function to extract validation data from formData
 * @returns Object containing errors, validate function, and setErrors
 */
export function useFormValidation<T extends z.ZodTypeAny, F = z.infer<T>>(
  getSchema: () => T,
  formData: F,
  extractData?: (data: F) => z.infer<T>
) {
  const { i18n } = useTranslation();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get validation data - either use extractData function or formData directly
  const getValidationData = useCallback(() => {
    return extractData ? extractData(formData) : (formData as unknown as z.infer<T>);
  }, [formData, extractData]);

  // Re-translate errors when language changes
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const validationData = getValidationData();
      const result = getSchema().safeParse(validationData);

      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.issues.forEach((error) => {
          if (error.path[0]) {
            newErrors[error.path[0] as string] = error.message;
          }
        });
        setErrors(newErrors);
      }
    }
  }, [i18n.language, getValidationData, errors, getSchema]);

  const validate = useCallback((): boolean => {
    const validationData = getValidationData();
    const result = getSchema().safeParse(validationData);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((error) => {
        if (error.path[0]) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  }, [getValidationData, getSchema]);

  return { errors, validate, setErrors };
}
