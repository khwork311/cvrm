import { useTranslation } from 'react-i18next';
import { Button, ButtonProps } from './Button';

interface FormButtonsProps {
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  loadingText?: string;
  submitDisabled?: boolean;
  cancelDisabled?: boolean;
  fullWidth?: boolean;
}

/**
 * Pre-configured form action buttons (Cancel + Submit)
 * Follows Open/Closed Principle - can be extended without modification
 */
export const FormButtons: React.FC<FormButtonsProps> = ({
  onCancel,
  submitText = 'Save',
  cancelText = 'cancel',
  isSubmitting = false,
  loadingText = 'Saving...',
  submitDisabled = false,
  cancelDisabled = false,
  fullWidth = false,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 pt-4 sm:justify-end">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={cancelDisabled || isSubmitting}
          fullWidth={fullWidth}
        >
          {t(`common:${cancelText}`)}
        </Button>
      )}
      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        loadingText={loadingText}
        disabled={submitDisabled}
        fullWidth={fullWidth}
      >
        {submitText}
      </Button>
    </div>
  );
};

// Specialized button variants for common use cases

export const SubmitButton = (props: Omit<ButtonProps, 'type' | 'variant'>) => (
  <Button type="submit" variant="primary" {...props} />
);

export const CancelButton = (props: Omit<ButtonProps, 'type' | 'variant'>) => (
  <Button type="button" variant="outline" {...props} />
);

export const DeleteButton = (props: Omit<ButtonProps, 'variant'>) => <Button variant="danger" {...props} />;

export const SecondaryButton = (props: Omit<ButtonProps, 'variant'>) => <Button variant="secondary" {...props} />;
