/**
 * Form Components - Wrapper dla Radix UI z Tailwind
 * 
 * Komponenty do budowania formularzy z automatyczną walidacją,
 * labelami, błędami i tooltipami.
 * 
 * Używamy Radix UI primitives + własny styling dla spójności.
 */

import React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * FormField - Kontener dla pojedynczego pola formularza
 * 
 * Automatycznie dodaje:
 * - Label z required indicator
 * - Error message display
 * - Help text
 * - Proper spacing
 * 
 * @example
 * <FormField label="Tytuł usługi" required error={errors.title} help="Min 5 znaków">
 *   <Input value={title} onChange={e => setTitle(e.target.value)} />
 * </FormField>
 */
interface FormFieldProps {
  /** Label tekst - pokazuje się nad inputem */
  label?: string;
  /** ID dla htmlFor - łączy label z inputem (accessibility) */
  htmlFor?: string;
  /** Czy pole wymagane - dodaje czerwoną gwiazdkę */
  required?: boolean;
  /** Komunikat błędu - pokazuje się pod inputem w czerwonym */
  error?: string | null;
  /** Tekst pomocniczy - mały szary tekst pod inputem */
  help?: string;
  /** Children - input/select/textarea */
  children: React.ReactNode;
  /** Dodatkowe klasy CSS */
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  help,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Label z required indicator */}
      {label && (
        <LabelPrimitive.Root
          htmlFor={htmlFor}
          className="text-sm font-medium text-slate-900 dark:text-slate-100 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </LabelPrimitive.Root>
      )}

      {/* Input/Select/Textarea */}
      {children}

      {/* Error message - pokazuje się tylko gdy jest błąd */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Help text - mały szary tekst */}
      {help && !error && (
        <p className="text-sm text-slate-500 dark:text-slate-400">{help}</p>
      )}
    </div>
  );
}

/**
 * FormSection - Sekcja formularza z nagłówkiem i opisem
 * 
 * Grupuje pola formularza w logiczne sekcje.
 * Automatycznie dodaje padding, border, i spacing.
 * 
 * @example
 * <FormSection 
 *   title="Podstawowe informacje" 
 *   description="Dane identyfikujące Twoją usługę"
 * >
 *   <FormField label="Tytuł">...</FormField>
 *   <FormField label="Opis">...</FormField>
 * </FormSection>
 */
interface FormSectionProps {
  /** Tytuł sekcji - duży bold tekst */
  title: string;
  /** Opis sekcji - mniejszy szary tekst pod tytułem */
  description?: string;
  /** Children - FormField components */
  children: React.ReactNode;
  /** Dodatkowe klasy CSS */
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 space-y-6',
        className
      )}
    >
      {/* Header sekcji */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {/* Pola formularza */}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

/**
 * FormRow - Układ horizontal dla dwóch pól obok siebie
 * 
 * Na desktop: 2 kolumny
 * Na mobile: 1 kolumna (stack)
 * 
 * @example
 * <FormRow>
 *   <FormField label="Cena od">...</FormField>
 *   <FormField label="Cena do">...</FormField>
 * </FormRow>
 */
interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export function FormRow({ children, className }: FormRowProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * FormActions - Sticky footer z przyciskami akcji
 * 
 * Zawsze widoczny na dole ekranu podczas scrollowania.
 * Zawiera przyciski: Anuluj, Zapisz, itp.
 * 
 * @example
 * <FormActions>
 *   <Button variant="outline" onClick={handleCancel}>Anuluj</Button>
 *   <Button onClick={handleSave}>Zapisz</Button>
 * </FormActions>
 */
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg">
      <div className={cn('max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4', className)}>
        {children}
      </div>
    </div>
  );
}

/**
 * CharacterCount - Licznik znaków dla textarea/input
 * 
 * Pokazuje ile znaków użytkownik wpisał i jaki jest limit.
 * Zmienia kolor na czerwony gdy przekroczy limit.
 * 
 * @example
 * <CharacterCount current={title.length} max={100} />
 * // Wyświetli: "45/100"
 */
interface CharacterCountProps {
  /** Aktualna liczba znaków */
  current: number;
  /** Maksymalna liczba znaków */
  max: number;
  /** Dodatkowe klasy CSS */
  className?: string;
}

export function CharacterCount({ current, max, className }: CharacterCountProps) {
  const isOverLimit = current > max;
  
  return (
    <span
      className={cn(
        'text-sm',
        isOverLimit ? 'text-red-600 font-semibold' : 'text-slate-500',
        className
      )}
    >
      {current}/{max}
    </span>
  );
}
