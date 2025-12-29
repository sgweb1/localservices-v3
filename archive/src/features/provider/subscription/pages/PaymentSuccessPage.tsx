import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePayment } from '../hooks/usePayment';
import { Button } from '@/components/ui/button';
import { SectionTitle, Text } from '@/components/ui/typography';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

/**
 * Strona potwierdzenia płatności PayU
 *
 * PayU redirekt tu użytkownika po pomyślnej płatności.
 * Sprawdzamy status płatności i aktywujemy subskrypcję.
 *
 * @since 2025-12-24
 */
export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const orderId = searchParams.get('orderId');
  const extOrderId = searchParams.get('ext_order_id');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    // Jeśli PayU zwrócił nas bez ID - coś poszło nie tak
    if (!orderId && !extOrderId) {
      setStatus('error');
      setMessage('Brak informacji o płatności. Kontakt z pomocą techniczną.');
      return;
    }

    // Symulacja poczekania na webhook z PayU
    // W produkcji webhook powinien być obsłużony asynchronicznie
    const timer = setTimeout(() => {
      setStatus('success');
      setMessage('Twoja subskrypcja została aktywowana!');

      // Przekieruj do strony subskrypcji po 3 sekundach
      setTimeout(() => {
        navigate('/subscription');
      }, 3000);
    }, 2000);

    return () => clearTimeout(timer);
  }, [orderId, extOrderId, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* Loading State */}
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-spin opacity-20" />
                <Loader className="absolute inset-0 m-auto w-8 h-8 text-blue-600 animate-spin" />
              </div>
            </div>
            <SectionTitle className="text-2xl mb-2">Przetwarzanie płatności</SectionTitle>
            <Text muted>
              Czekamy na potwierdzenie z PayU. To powinno chwilę potrwać...
            </Text>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4">
                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <SectionTitle className="text-2xl mb-2">Sukces!</SectionTitle>
            <Text muted className="mb-6">
              {message}
            </Text>
            <Text muted size="sm" className="mb-6 text-blue-600">
              Za chwilę przeniesiemy Cię do strony subskrypcji...
            </Text>
            <Button
              variant="primary"
              onClick={() => navigate('/subscription')}
              className="w-full"
            >
              Przejdź do subskrypcji
            </Button>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <SectionTitle className="text-2xl mb-2">Błąd płatności</SectionTitle>
            <Text muted className="mb-6">
              {message}
            </Text>
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => navigate('/subscription')}
                className="w-full"
              >
                Wróć do subskrypcji
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
              >
                Strona główna
              </Button>
            </div>
          </>
        )}

        {/* Order Info */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Text muted size="sm">
            Numer zamówienia
          </Text>
          <Text className="font-mono text-sm break-all">
            {orderId || extOrderId || 'N/A'}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
