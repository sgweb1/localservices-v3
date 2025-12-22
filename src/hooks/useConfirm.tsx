import { useState, useCallback } from 'react';
import { ConfirmDialog, ConfirmDialogVariant } from '@/components/ConfirmDialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  isLoading: boolean;
  resolver?: (value: boolean) => void;
}

export const useConfirm = () => {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    isLoading: false,
    title: '',
    message: '',
    confirmText: 'Potwierdź',
    cancelText: 'Anuluj',
    variant: 'info',
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        isLoading: false,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Potwierdź',
        cancelText: options.cancelText || 'Anuluj',
        variant: options.variant || 'info',
        resolver: resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolver?.(true);
    setState((prev) => ({ ...prev, isOpen: false }));
  }, [state.resolver]);

  const handleCancel = useCallback(() => {
    state.resolver?.(false);
    setState((prev) => ({ ...prev, isOpen: false }));
  }, [state.resolver]);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const ConfirmDialogComponent = (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={state.title}
      message={state.message}
      confirmText={state.confirmText}
      cancelText={state.cancelText}
      variant={state.variant}
      isLoading={state.isLoading}
    />
  );

  return { confirm, setLoading, ConfirmDialog: ConfirmDialogComponent };
};
