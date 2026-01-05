import React, { useState } from 'react';
import { PageTitle, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Zap, 
  MessageCircle, 
  Star, 
  Calendar, 
  Settings, 
  Bell, 
  CreditCard,
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

/**
 * DevSimulatorPage - Strona testowa do symulacji logiki biznesowej
 * 
 * Umożliwia:
 * - Generowanie testowych danych (rezerwacje, wiadomości, opinie)
 * - Symulowanie eventów (nowa rezerwacja, zmiana statusu)
 * - Testowanie wszystkich akcji providera
 * - Wysyłanie notyfikacji
 * 
 * UWAGA: Strona dostępna tylko w trybie development!
 */
export function DevSimulatorPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dodaj rezultat do listy
  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const timestamp = new Date().toLocaleTimeString('pl-PL');
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setResults(prev => [`[${timestamp}] ${icon} ${message}`, ...prev]);
  };

  // Wyczyść rezultaty
  const clearResults = () => setResults([]);

  // Invalidate all queries (odśwież cache)
  const refreshCache = async () => {
    await queryClient.invalidateQueries();
    addResult('Cache odświeżony - wszystkie dane zostaną ponownie pobrane', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <PageTitle className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-cyan-400" />
              Dev Simulator
            </PageTitle>
            <Text className="text-slate-400 mt-2">
              Testowanie logiki biznesowej i generowanie eventów
            </Text>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button 
              variant="neutral" 
              size="sm" 
              onClick={refreshCache}
            >
              🔄 Odśwież cache
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={clearResults}
            >
              🗑️ Wyczyść logi
            </Button>
          </div>
        </div>

        {/* User Info */}
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <Text className="text-white font-semibold">{user?.name || 'Brak użytkownika'}</Text>
              <Text className="text-slate-400 text-sm">ID: {user?.id} • Role: {(user as any)?.roles?.[0]?.name || 'N/A'}</Text>
            </div>
            <Badge variant="success" className="ml-auto">
              Development Mode
            </Badge>
          </div>
        </Card>

        {/* Main Content - Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Rezerwacje
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Wiadomości
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Opinie
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Usługi
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notyfikacje
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Płatności
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Kalendarz
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <BookingsSimulator 
              addResult={addResult} 
              isLoading={isLoading} 
              setIsLoading={setIsLoading}
              queryClient={queryClient}
            />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <MessagesSimulator 
              addResult={addResult} 
              isLoading={isLoading} 
              setIsLoading={setIsLoading}
              queryClient={queryClient}
            />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <ReviewsSimulator 
              addResult={addResult} 
              isLoading={isLoading} 
              setIsLoading={setIsLoading}
              queryClient={queryClient}
            />
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <ServicesSimulator 
              addResult={addResult} 
              isLoading={isLoading} 
              setIsLoading={setIsLoading}
              queryClient={queryClient}
            />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationsSimulator 
              addResult={addResult} 
              isLoading={isLoading} 
              setIsLoading={setIsLoading}
              queryClient={queryClient}
            />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentsSimulator 
              addResult={addResult} 
              isLoading={isLoading} 
              setIsLoading={setIsLoading}
              queryClient={queryClient}
            />
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <CalendarSimulator 
              addResult={addResult} 
              isLoading={isLoading} 
              setIsLoading={setIsLoading}
              queryClient={queryClient}
            />
          </TabsContent>
        </Tabs>

        {/* Results Log */}
        <Card className="bg-slate-900/50 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <Text className="text-white font-semibold">🔍 Logi akcji</Text>
            <Badge variant="neutral">{results.length} wpisów</Badge>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 max-h-96 overflow-y-auto">
            {results.length === 0 ? (
              <Text className="text-slate-500 text-center py-8">
                Brak logów. Wykonaj akcję aby zobaczyć rezultaty.
              </Text>
            ) : (
              <div className="space-y-2 font-mono text-sm">
                {results.map((result, idx) => (
                  <div 
                    key={idx} 
                    className="text-slate-300 hover:bg-slate-800/30 px-2 py-1 rounded transition-colors"
                  >
                    {result}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/**
 * BookingsSimulator - Symulacja rezerwacji
 */
interface SimulatorProps {
  addResult: (message: string, type?: 'success' | 'error' | 'info') => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  queryClient: ReturnType<typeof useQueryClient>;
}

function BookingsSimulator({ addResult, isLoading, setIsLoading, queryClient }: SimulatorProps) {
  const [bookingId, setBookingId] = useState('');
  const [status, setStatus] = useState('confirmed');
  const [count, setCount] = useState('3');

  const generateBookings = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/dev/simulate-events', {
        type: 'bookings',
        count: parseInt(count) || 3
      });
      addResult(`Wygenerowano ${count} rezerwacji`, 'success');
      
      // Wyświetl utworzone rezerwacje
      if (response.data.data?.created?.bookings) {
        response.data.data.created.bookings.forEach((booking: any) => {
          addResult(`  📅 Rezerwacja #${booking.booking_number} na ${booking.booking_date}`, 'info');
        });
      }
      
      // Odśwież cache
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Generate bookings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeBookingStatus = async () => {
    if (!bookingId) {
      addResult('Podaj ID rezerwacji', 'error');
      return;
    }

    setIsLoading(true);
    try {
      let endpoint = '';
      let action = '';
      
      switch(status) {
        case 'confirmed':
          endpoint = `/provider/bookings/${bookingId}/accept`;
          action = 'zaakceptowana';
          break;
        case 'in_progress':
          endpoint = `/provider/bookings/${bookingId}/start`;
          action = 'rozpoczęta';
          break;
        case 'completed':
          endpoint = `/provider/bookings/${bookingId}/complete`;
          action = 'zakończona';
          break;
        case 'cancelled':
          endpoint = `/provider/bookings/${bookingId}/decline`;
          action = 'anulowana';
          break;
        default:
          throw new Error('Nieznany status');
      }
      
      const response = await apiClient.post(endpoint);
      addResult(`✅ Rezerwacja #${bookingId} ${action}`, 'success');
      
      // Odśwież cache
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Change status error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Generuj rezerwacje */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Generuj rezerwacje</Text>
            <Text className="text-slate-400 text-sm">Twórz testowe rezerwacje</Text>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Ilość rezerwacji</label>
            <Input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              placeholder="3"
              min="1"
              max="20"
            />
          </div>

          <Button 
            onClick={generateBookings} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generowanie...' : '🎲 Generuj rezerwacje'}
          </Button>
        </div>
      </Card>

      {/* Zmień status */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Zmień status rezerwacji</Text>
            <Text className="text-slate-400 text-sm">Symuluj zmiany statusów</Text>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">ID Rezerwacji</label>
            <Input
              type="number"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="123"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm mb-2 block">Nowy status</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="confirmed">Potwierdzona</option>
              <option value="in_progress">W trakcie</option>
              <option value="completed">Zakończona</option>
              <option value="cancelled">Anulowana</option>
            </Select>
          </div>

          <Button 
            onClick={changeBookingStatus} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Zapisywanie...' : '💾 Zmień status'}
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700 p-6 md:col-span-2">
        <Text className="text-white font-semibold mb-4">⚡ Szybkie akcje</Text>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button size="sm" variant="info" disabled={isLoading}>
            Nowa rezerwacja
          </Button>
          <Button size="sm" variant="success" disabled={isLoading}>
            Zaakceptuj wszystkie
          </Button>
          <Button size="sm" variant="warning" disabled={isLoading}>
            Rozpocznij pierwszą
          </Button>
          <Button size="sm" variant="danger" disabled={isLoading}>
            Anuluj ostatnią
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * MessagesSimulator - Symulacja wiadomości
 */
function MessagesSimulator({ addResult, isLoading, setIsLoading, queryClient }: SimulatorProps) {
  const [recipientId, setRecipientId] = useState('');
  const [messageText, setMessageText] = useState('');

  const sendMessage = async () => {
    if (!recipientId || !messageText) {
      addResult('Wypełnij wszystkie pola', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Znajdź lub utwórz konwersację i wyślij wiadomość
      const response = await apiClient.post('/conversations', {
        participant_id: parseInt(recipientId),
        message: messageText
      });
      
      addResult(`📨 Wysłano wiadomość do użytkownika #${recipientId}`, 'success');
      addResult(`Treść: "${messageText}"`, 'info');
      setMessageText('');
      
      // Odśwież cache
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      await queryClient.invalidateQueries({ queryKey: ['messages'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Send message error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateConversations = async () => {
    setIsLoading(true);
    try {
      // Wygeneruj 5 przykładowych wiadomości
      addResult('🎲 Generowanie konwersacji...', 'info');
      
      const messages = [
        'Dzień dobry, interesuje mnie Pana oferta.',
        'Czy jest Pan dostępny w przyszły poniedziałek?',
        'Ile wyniesie koszt usługi?',
        'Czy może Pan podjechać do mojej lokalizacji?',
        'Dziękuję za szybką odpowiedź!'
      ];
      
      // TODO: Implement actual API call when backend is ready
      addResult(`Wygenerowano ${messages.length} przykładowych wiadomości`, 'success');
      
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateIncomingMessage = async () => {
    setIsLoading(true);
    try {
      addResult('📥 Symulowanie otrzymania wiadomości...', 'info');
      
      // Pobierz prawdziwe ID customerów z bazy
      const usersResponse = await apiClient.get('/dev/users?type=customer&limit=5');
      const customers = usersResponse.data.data || [];
      
      if (customers.length === 0) {
        addResult('⚠️ Brak customerów w bazie. Utwórz najpierw klientów.', 'error');
        return;
      }
      
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      
      const mockMessages = [
        'Witam, interesuje mnie Pana oferta. Proszę o kontakt.',
        'Czy może Pan przyjechać jutro około 14:00?',
        'Ile kosztuje naprawa instalacji elektrycznej?',
        'Polecono mi Pana jako profesjonalistę. Chciałbym umówić się na konsultację.',
        'Dziękuję za szybką odpowiedź! Czekam na potwierdzenie terminu.'
      ];
      
      const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
      
      try {
        // Symuluj utworzenie konwersacji/wiadomości od tego użytkownika
        await apiClient.post('/conversations', {
          participant_id: randomCustomer.id,
          message: randomMessage
        });
        
        addResult(`📥 Otrzymano wiadomość od ${randomCustomer.name} (#${randomCustomer.id})`, 'success');
        addResult(`Treść: "${randomMessage}"`, 'info');
        
        await queryClient.invalidateQueries({ queryKey: ['conversations'] });
        await queryClient.invalidateQueries({ queryKey: ['messages'] });
      } catch (err: any) {
        // Fallback - zaloguj że to symulacja
        addResult(`📥 Symulacja: ${randomCustomer.name} (#${randomCustomer.id}) wysłał wiadomość`, 'info');
        addResult(`"${randomMessage}"`, 'info');
      }
      
    } catch (error: any) {
      addResult(`Błąd: ${error.message}`, 'error');
      console.error('simulateIncomingMessage error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Wyślij wiadomość */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Wyślij wiadomość</Text>
            <Text className="text-slate-400 text-sm">Symuluj wysłanie wiadomości</Text>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">ID Odbiorcy</label>
            <Input
              type="number"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="123"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm mb-2 block">Treść wiadomości</label>
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Witam, mam pytanie odnośnie..."
              rows={4}
            />
          </div>

          <Button 
            onClick={sendMessage} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Wysyłanie...' : '📨 Wyślij wiadomość'}
          </Button>
        </div>
      </Card>

      {/* Generuj konwersacje */}
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Generuj konwersacje</Text>
            <Text className="text-slate-400 text-sm">Twórz testowe wiadomości</Text>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={generateConversations}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generowanie...' : '🎲 Generuj 5 konwersacji'}
          </Button>

          <Button 
            onClick={simulateIncomingMessage}
            variant="neutral"
            disabled={isLoading}
            className="w-full"
          >
            📥 Symuluj otrzymanie wiadomości
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * ReviewsSimulator - Symulacja opinii
 */
function ReviewsSimulator({ addResult, isLoading, setIsLoading, queryClient }: SimulatorProps) {
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const addReview = async () => {
    if (!comment) {
      addResult('Podaj treść opinii', 'error');
      return;
    }

    setIsLoading(true);
    try {
      addResult(`⭐ Dodawanie opinii ${rating}/5...`, 'info');
      
      // Symuluj dodanie opinii poprzez dev endpoint
      const response = await apiClient.post('/dev/simulate-events', {
        type: 'review',
        rating: parseInt(rating),
        comment: comment
      });
      
      addResult(`Dodano opinię: ${rating}/5 - "${comment}"`, 'success');
      setComment('');
      
      // Odśwież cache
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Add review error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReviews = async () => {
    setIsLoading(true);
    try {
      addResult('🎲 Generowanie 5 opinii...', 'info');
      
      const response = await apiClient.post('/dev/simulate-events', {
        type: 'reviews',
        count: 5
      });
      
      addResult('Wygenerowano 5 losowych opinii', 'success');
      
      // Odśwież cache
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Generate reviews error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const respondToLastReview = async () => {
    setIsLoading(true);
    try {
      addResult('💬 Pobieranie ostatniej opinii...', 'info');
      
      // Pobierz listę opinii providera
      const reviewsResponse = await apiClient.get('/provider/reviews', {
        params: { limit: 1, sort: '-created_at' }
      });
      
      const reviews = reviewsResponse.data?.data || [];
      
      if (reviews.length === 0) {
        addResult('❌ Brak opinii do odpowiedzi', 'error');
        return;
      }
      
      const lastReview = reviews[0];
      const mockResponse = `Dziękuję za opinię! Cieszę się, że była(był) Pan(i) zadowolony(a) z mojej usługi. Zapraszam ponownie!`;
      
      // Dodaj odpowiedź na opinię
      await apiClient.post(`/provider/reviews/${lastReview.id}/response`, {
        response: mockResponse
      });
      
      addResult(`💬 Odpowiedziano na opinię #${lastReview.id}`, 'success');
      addResult(`Odpowiedź: "${mockResponse}"`, 'info');
      
      // Odśwież cache
      await queryClient.invalidateQueries({ queryKey: ['reviews'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Respond to review error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Dodaj opinię</Text>
            <Text className="text-slate-400 text-sm">Symuluj otrzymanie opinii</Text>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm mb-2 block">Ocena (1-5)</label>
            <Input
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              min="1"
              max="5"
            />
          </div>

          <div>
            <label className="text-slate-300 text-sm mb-2 block">Komentarz</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Świetna usługa, polecam!"
              rows={4}
            />
          </div>

          <Button disabled={isLoading} onClick={addReview} className="w-full">
            {isLoading ? 'Dodawanie...' : '⭐ Dodaj opinię'}
          </Button>
        </div>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Odpowiedź na opinię</Text>
            <Text className="text-slate-400 text-sm">Symuluj odpowiedź providera</Text>
          </div>
        </div>

        <div className="space-y-4">
          <Button disabled={isLoading} onClick={respondToLastReview} className="w-full">
            {isLoading ? 'Odpowiadanie...' : '💬 Odpowiedz na ostatnią opinię'}
          </Button>
          
          <Button variant="neutral" disabled={isLoading} onClick={generateReviews} className="w-full">
            {isLoading ? 'Generowanie...' : '🎲 Generuj 5 opinii'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * ServicesSimulator - Symulacja usług
 */
function ServicesSimulator({ addResult, isLoading, setIsLoading, queryClient }: SimulatorProps) {
  
  const createService = async () => {
    setIsLoading(true);
    try {
      addResult('➕ Tworzenie nowej usługi...', 'info');
      
      const mockService = {
        name: `Testowa usługa ${Date.now()}`,
        description: 'To jest automatycznie wygenerowana usługa testowa',
        base_price: Math.floor(Math.random() * 500) + 100,
        duration_minutes: 60,
        category_id: 1, // TODO: Get from actual categories
        is_active: true
      };
      
      const response = await apiClient.post('/provider/services', mockService);
      
      addResult(`✅ Utworzono usługę: ${mockService.name}`, 'success');
      addResult(`ID: ${response.data.data?.id}, Cena: ${mockService.base_price} PLN`, 'info');
      
      await queryClient.invalidateQueries({ queryKey: ['services'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Create service error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVisibility = async () => {
    setIsLoading(true);
    try {
      addResult('👁️ Pobieranie ostatniej usługi...', 'info');
      
      const servicesResponse = await apiClient.get('/provider/services');
      const services = servicesResponse.data?.data || [];
      
      if (services.length === 0) {
        addResult('❌ Brak usług do zmiany widoczności', 'error');
        return;
      }
      
      const lastService = services[0];
      const newVisibility = !lastService.is_active;
      
      await apiClient.patch(`/provider/services/${lastService.id}`, {
        is_active: newVisibility
      });
      
      addResult(`✅ Zmieniono widoczność usługi "${lastService.name}"`, 'success');
      addResult(`Nowy stan: ${newVisibility ? 'Widoczna' : 'Ukryta'}`, 'info');
      
      await queryClient.invalidateQueries({ queryKey: ['services'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Toggle visibility error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activateBoost = async () => {
    setIsLoading(true);
    try {
      addResult('🚀 Aktywacja boost...', 'info');
      
      const servicesResponse = await apiClient.get('/provider/services');
      const services = servicesResponse.data?.data || [];
      
      if (services.length === 0) {
        addResult('❌ Brak usług do boost', 'error');
        return;
      }
      
      const lastService = services[0];
      
      // Symuluj zakup boost (7 dni)
      addResult(`🚀 Boost aktywowany dla "${lastService.name}" na 7 dni`, 'success');
      addResult('💡 Funkcja w development - endpoint do boost w przygotowaniu', 'info');
      
    } catch (error: any) {
      addResult(`Błąd: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Package className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Zarządzanie usługami</Text>
            <Text className="text-slate-400 text-sm">Twórz i edytuj usługi</Text>
          </div>
        </div>

        <div className="space-y-3">
          <Button disabled={isLoading} onClick={createService} className="w-full">
            {isLoading ? 'Tworzenie...' : '➕ Dodaj nową usługę'}
          </Button>
          <Button variant="info" disabled={isLoading} onClick={toggleVisibility} className="w-full">
            {isLoading ? 'Zmiana...' : '👁️ Zmień widoczność'}
          </Button>
          <Button variant="warning" disabled={isLoading} className="w-full">
            ✏️ Edytuj ostatnią
          </Button>
        </div>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Boost & Promocje</Text>
            <Text className="text-slate-400 text-sm">Testuj promowanie usług</Text>
          </div>
        </div>

        <div className="space-y-3">
          <Button disabled={isLoading} onClick={activateBoost} className="w-full">
            {isLoading ? 'Aktywacja...' : '🚀 Aktywuj boost'}
          </Button>
          <Button variant="success" disabled={isLoading} className="w-full">
            💰 Symuluj zakup promocji
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * NotificationsSimulator - Symulacja notyfikacji
 */
function NotificationsSimulator({ addResult, isLoading, setIsLoading, queryClient }: SimulatorProps) {
  
  const sendNotification = async (type: string) => {
    setIsLoading(true);
    try {
      addResult(`🔔 Wysyłanie notyfikacji: ${type}...`, 'info');
      
      // Symuluj wysłanie notyfikacji przez backend
      const notificationMessages: Record<string, string> = {
        'new_booking': 'Masz nową rezerwację na jutro o 14:00',
        'booking_accepted': 'Twoja rezerwacja została zaakceptowana',
        'new_message': 'Jan Kowalski wysłał Ci wiadomość',
        'new_review': 'Otrzymałeś nową opinię 5/5 ⭐'
      };
      
      await apiClient.post(`/notifications/${type}/test`);
      
      addResult(`✅ Wysłano: ${notificationMessages[type]}`, 'success');
      
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
    } catch (error: any) {
      // Fallback - symulacja bez backendu
      const messages: Record<string, string> = {
        'new_booking': '📅 Nowa rezerwacja',
        'booking_accepted': '✅ Rezerwacja zaakceptowana',
        'new_message': '💬 Nowa wiadomość',
        'new_review': '⭐ Nowa opinia'
      };
      addResult(`Symulacja: ${messages[type]}`, 'info');
      console.error('Send notification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllNotifications = async () => {
    setIsLoading(true);
    try {
      addResult('🔕 Czyszczenie wszystkich notyfikacji...', 'info');
      
      await apiClient.put('/notifications/read-all');
      
      addResult('✅ Wszystkie notyfikacje oznaczone jako przeczytane', 'success');
      
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Clear notifications error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Bell className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Wyślij notyfikację</Text>
            <Text className="text-slate-400 text-sm">Testuj system powiadomień</Text>
          </div>
        </div>

        <div className="space-y-3">
          <Button disabled={isLoading} onClick={() => sendNotification('new_booking')} className="w-full">
            {isLoading ? 'Wysyłanie...' : '🔔 Nowa rezerwacja'}
          </Button>
          <Button variant="success" disabled={isLoading} onClick={() => sendNotification('booking_accepted')} className="w-full">
            {isLoading ? 'Wysyłanie...' : '✅ Zaakceptowano'}
          </Button>
          <Button variant="info" disabled={isLoading} onClick={() => sendNotification('new_message')} className="w-full">
            {isLoading ? 'Wysyłanie...' : '💬 Nowa wiadomość'}
          </Button>
          <Button variant="warning" disabled={isLoading} onClick={() => sendNotification('new_review')} className="w-full">
            {isLoading ? 'Wysyłanie...' : '⭐ Nowa opinia'}
          </Button>
        </div>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Porządki powiadomień</Text>
            <Text className="text-slate-400 text-sm">Oznacz wszystko jako przeczytane</Text>
          </div>
        </div>

        <div className="space-y-3">
          <Button variant="neutral" disabled={isLoading} onClick={clearAllNotifications} className="w-full">
            {isLoading ? 'Czyszczenie...' : '🔕 Wyczyść wszystkie'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * PaymentsSimulator - Symulacja płatności
 */
function PaymentsSimulator({ addResult, isLoading, setIsLoading, queryClient }: SimulatorProps) {
  
  const purchaseSubscription = async (plan: 'basic' | 'premium') => {
    setIsLoading(true);
    try {
      addResult(`💳 Symulacja zakupu planu ${plan.toUpperCase()}...`, 'info');
      
      const plans = {
        basic: { name: 'Basic', price: 99, duration: 30 },
        premium: { name: 'Premium', price: 199, duration: 30 }
      };
      
      const selectedPlan = plans[plan];
      
      // Symuluj redirect do płatności
      addResult(`Przekierowanie do płatności: ${selectedPlan.price} PLN/miesiąc`, 'info');
      addResult(`✅ Plan ${selectedPlan.name} - ${selectedPlan.duration} dni`, 'success');
      addResult('💡 W produkcji: redirect do Stripe/PayU', 'info');
      
      await queryClient.invalidateQueries({ queryKey: ['subscription'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renewSubscription = async () => {
    setIsLoading(true);
    try {
      addResult('🔄 Odnawianie subskrypcji...', 'info');
      
      // Pobierz aktualną subskrypcję
      const subResponse = await apiClient.get('/provider/subscription');
      const currentSub = subResponse.data?.data;
      
      if (!currentSub) {
        addResult('❌ Brak aktywnej subskrypcji do odnowienia', 'error');
        return;
      }
      
      addResult(`✅ Odnowiono plan: ${currentSub.plan_name}`, 'success');
      addResult('Nowa data wygaśnięcia: +30 dni', 'info');
      
      await queryClient.invalidateQueries({ queryKey: ['subscription'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Renew subscription error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const payForBooking = async () => {
    setIsLoading(true);
    try {
      addResult('💰 Symulacja płatności za rezerwację...', 'info');
      
      // Pobierz ostatnią rezerwację
      const bookingsResponse = await apiClient.get('/provider/bookings', {
        params: { limit: 1, payment_status: 'pending' }
      });
      
      const bookings = bookingsResponse.data?.data || [];
      
      if (bookings.length === 0) {
        addResult('❌ Brak rezerwacji oczekujących na płatność', 'error');
        return;
      }
      
      const booking = bookings[0];
      
      addResult(`✅ Opłacono rezerwację #${booking.booking_number}`, 'success');
      addResult(`Kwota: ${booking.total_price} PLN`, 'info');
      
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Pay booking error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Subskrypcje</Text>
            <Text className="text-slate-400 text-sm">Testuj zakup planów</Text>
          </div>
        </div>

        <div className="space-y-3">
          <Button disabled={isLoading} onClick={() => purchaseSubscription('basic')} className="w-full">
            {isLoading ? 'Przetwarzanie...' : '💳 Kup plan Basic'}
          </Button>
          <Button variant="info" disabled={isLoading} onClick={() => purchaseSubscription('premium')} className="w-full">
            {isLoading ? 'Przetwarzanie...' : '💎 Kup plan Premium'}
          </Button>
          <Button variant="warning" disabled={isLoading} onClick={renewSubscription} className="w-full">
            {isLoading ? 'Odnawianie...' : '🔄 Odnów subskrypcję'}
          </Button>
        </div>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Płatności rezerwacji</Text>
            <Text className="text-slate-400 text-sm">Symuluj opłacenie</Text>
          </div>
        </div>

        <div className="space-y-3">
          <Button disabled={isLoading} onClick={payForBooking} className="w-full">
            {isLoading ? 'Przetwarzanie...' : '💰 Opłać rezerwację'}
          </Button>
          <Button variant="success" disabled={isLoading} className="w-full">
            ✅ Potwierdź płatność
          </Button>
        </div>
      </Card>
    </div>
  );
}

/**
 * CalendarSimulator - Symulacja kalendarza
 */
function CalendarSimulator({ addResult, isLoading, setIsLoading, queryClient }: SimulatorProps) {
  
  const generateWeekSlots = async () => {
    setIsLoading(true);
    try {
      addResult('🎲 Generowanie slotów na tydzień...', 'info');
      
      // Wykorzystaj istniejący endpoint
      const response = await apiClient.post('/dev/calendar/generate-bookings', {
        days: 7,
        slotsPerDay: 4
      });
      
      addResult('✅ Wygenerowano sloty na cały tydzień', 'success');
      
      await queryClient.invalidateQueries({ queryKey: ['calendar'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Generate slots error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCalendarBookings = async () => {
    setIsLoading(true);
    try {
      addResult('📅 Generowanie rezerwacji w kalendarzu...', 'info');
      
      const response = await apiClient.post('/dev/calendar/generate-bookings');
      
      addResult('✅ Wygenerowano rezerwacje w kalendarzu', 'success');
      
      await queryClient.invalidateQueries({ queryKey: ['calendar'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Generate calendar bookings error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTestData = async () => {
    setIsLoading(true);
    try {
      addResult('🗑️ Czyszczenie testowych danych...', 'info');
      
      const response = await apiClient.delete('/dev/calendar/clear-test-bookings');
      
      addResult('✅ Wyczyszczono testowe dane z kalendarza', 'success');
      
      await queryClient.invalidateQueries({ queryKey: ['calendar'] });
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      
    } catch (error: any) {
      addResult(`Błąd: ${error.response?.data?.message || error.message}`, 'error');
      console.error('Clear test data error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Dostępność</Text>
            <Text className="text-slate-400 text-sm">Zarządzaj slotami</Text>
          </div>
        </div>

        <div className="space-y-3">
          <Button disabled={isLoading} className="w-full">
            ➕ Dodaj slot
          </Button>
          <Button variant="warning" disabled={isLoading} className="w-full">
            🚫 Blokada czasu
          </Button>
          <Button variant="neutral" disabled={isLoading} className="w-full">
            🏖️ Dodaj urlop
          </Button>
        </div>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <Text className="text-white font-semibold">Generuj dane</Text>
            <Text className="text-slate-400 text-sm">Wypełnij kalendarz</Text>
          </div>
        </div>

        <div className="space-y-3">
          <Button disabled={isLoading} onClick={generateWeekSlots} className="w-full">
            {isLoading ? 'Generowanie...' : '🎲 Generuj sloty (tydzień)'}
          </Button>
          <Button variant="info" disabled={isLoading} onClick={generateCalendarBookings} className="w-full">
            {isLoading ? 'Generowanie...' : '📅 Generuj rezerwacje'}
          </Button>
          <Button variant="danger" disabled={isLoading} onClick={clearTestData} className="w-full">
            {isLoading ? 'Czyszczenie...' : '🗑️ Wyczyść testowe dane'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
