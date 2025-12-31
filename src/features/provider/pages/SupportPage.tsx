import React, { useState } from 'react';
import { PageTitle, Text, SectionTitle } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import * as Tabs from '@radix-ui/react-tabs';
import * as Accordion from '@radix-ui/react-accordion';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle, 
  FileText, 
  Video, 
  Book,
  ChevronDown,
  Send,
  Clock,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * Support Page - Centrum pomocy i wsparcia
 * 
 * Features:
 * - FAQ z Radix Accordion
 * - Formularz kontaktowy
 * - Linki do dokumentacji
 * - Status systemowy
 * - Godziny wsparcia
 */
export const SupportPage: React.FC = () => {
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.subject || !ticketForm.message) {
      toast.error('Wypełnij wszystkie pola');
      return;
    }

    setIsSubmitting(true);
    // Symulacja wysyłania
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    
    toast.success('Zgłoszenie wysłane! Odpowiemy w ciągu 24h.');
    setTicketForm({ subject: '', category: 'general', message: '' });
  };

  const faqItems = [
    {
      question: 'Jak dodać nową usługę?',
      answer: 'Przejdź do zakładki "Usługi" i kliknij przycisk "Dodaj usługę". Wypełnij formularz z podstawowymi informacjami, cenami, zdjęciami i opublikuj.',
    },
    {
      question: 'Jak zarządzać kalendarzem dostępności?',
      answer: 'W sekcji "Kalendarz" możesz blokować dni, ustawiać godziny pracy i zarządzać dostępnością dla każdej usługi osobno.',
    },
    {
      question: 'Jak zmienić plan subskrypcji?',
      answer: 'Wejdź w "Subskrypcja", porównaj plany i kliknij "Upgrade" przy wybranym planie. Zmiana jest natychmiastowa.',
    },
    {
      question: 'Jak odpowiedzieć na opinię klienta?',
      answer: 'W zakładce "Opinie" znajdziesz wszystkie recenzje. Kliknij "Odpowiedz" pod wybraną opinią i dodaj swoją odpowiedź.',
    },
    {
      question: 'Jak kontaktować się z klientami?',
      answer: 'Wiadomości od klientów znajdziesz w sekcji "Wiadomości". Możesz tam wymieniać się wiadomościami w czasie rzeczywistym.',
    },
  ];

  return (
    <div className="min-h-screen space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-indigo-950/20 border border-cyan-100 dark:border-cyan-900/30 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_50%)]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">💬</span>
            <PageTitle className="text-gray-900 dark:text-gray-100">Centrum Wsparcia</PageTitle>
          </div>
          <Text muted size="sm">Znajdź odpowiedzi, skontaktuj się z pomocą i poznaj najlepsze praktyki</Text>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/20">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <Text muted size="sm">Status systemu</Text>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500 text-white">Wszystko działa</Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <Text muted size="sm">Czas odpowiedzi</Text>
          </div>
          <Text className="text-2xl font-bold text-blue-600">&lt; 24h</Text>
          <Text muted size="sm" className="mt-1">średni czas odpowiedzi</Text>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <Text muted size="sm">Wsparcie</Text>
          </div>
          <Text className="text-sm text-purple-700 dark:text-purple-300 font-medium">Pn-Pt: 9:00-17:00</Text>
          <Text muted size="sm" className="mt-1">Weekend: email only</Text>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs.Root defaultValue="faq" className="w-full">
        <Tabs.List className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-6">
          <Tabs.Trigger
            value="faq"
            className="px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600 transition-colors"
          >
            <HelpCircle className="w-4 h-4 inline mr-2" />
            FAQ
          </Tabs.Trigger>
          <Tabs.Trigger
            value="contact"
            className="px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600 transition-colors"
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Kontakt
          </Tabs.Trigger>
          <Tabs.Trigger
            value="resources"
            className="px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 data-[state=active]:text-cyan-600 data-[state=active]:border-b-2 data-[state=active]:border-cyan-600 transition-colors"
          >
            <Book className="w-4 h-4 inline mr-2" />
            Zasoby
          </Tabs.Trigger>
        </Tabs.List>

        {/* FAQ Tab */}
        <Tabs.Content value="faq" className="space-y-4">
          <SectionTitle>Najczęściej zadawane pytania</SectionTitle>
          <Accordion.Root type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <Accordion.Item
                key={index}
                value={`item-${index}`}
                className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                    <Text className="font-semibold text-slate-900 dark:text-slate-100 pr-4">{item.question}</Text>
                    <ChevronDown className="w-5 h-5 text-slate-500 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-6 pb-4 text-slate-600 dark:text-slate-400 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                  <Text size="sm">{item.answer}</Text>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Tabs.Content>

        {/* Contact Tab */}
        <Tabs.Content value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Formularz */}
            <Card className="p-6">
              <SectionTitle className="mb-4">Wyślij zgłoszenie</SectionTitle>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2">
                    <Text className="font-medium">Temat</Text>
                  </label>
                  <Input
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    placeholder="Krótki opis problemu"
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    <Text className="font-medium">Kategoria</Text>
                  </label>
                  <select
                    value={ticketForm.category}
                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="general">Ogólne</option>
                    <option value="technical">Problem techniczny</option>
                    <option value="billing">Płatności</option>
                    <option value="account">Konto</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2">
                    <Text className="font-medium">Wiadomość</Text>
                  </label>
                  <Textarea
                    rows={6}
                    value={ticketForm.message}
                    onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                    placeholder="Opisz szczegółowo swój problem..."
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Wysyłanie...' : 'Wyślij zgłoszenie'}
                </Button>
              </form>
            </Card>

            {/* Kontakty */}
            <div className="space-y-4">
              <SectionTitle>Inne sposoby kontaktu</SectionTitle>
              
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <Text className="font-semibold mb-1">Email</Text>
                    <Text size="sm" muted className="mb-2">Odpowiadamy w ciągu 24h</Text>
                    <a href="mailto:support@localservices.pl" className="text-cyan-600 hover:text-cyan-700 font-medium">
                      support@localservices.pl
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <Text className="font-semibold mb-1">Telefon</Text>
                    <Text size="sm" muted className="mb-2">Pn-Pt: 9:00-17:00</Text>
                    <a href="tel:+48123456789" className="text-cyan-600 hover:text-cyan-700 font-medium">
                      +48 123 456 789
                    </a>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/20">
                    <MessageCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <Text className="font-semibold mb-1">Live Chat</Text>
                    <Text size="sm" muted className="mb-2">Dostępny w godzinach biurowych</Text>
                    <Button variant="outline" size="sm">Rozpocznij czat</Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Tabs.Content>

        {/* Resources Tab */}
        <Tabs.Content value="resources" className="space-y-6">
          <SectionTitle>Materiały szkoleniowe</SectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 w-fit mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <Text className="font-semibold mb-2">Dokumentacja</Text>
              <Text size="sm" muted className="mb-4">Kompletny przewodnik po platformie</Text>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Przejdź do dokumentacji
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/20 w-fit mb-4">
                <Video className="w-6 h-6 text-red-600" />
              </div>
              <Text className="font-semibold mb-2">Tutoriale wideo</Text>
              <Text size="sm" muted className="mb-4">Nagrania instruktażowe krok po kroku</Text>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Zobacz filmy
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/20 w-fit mb-4">
                <Book className="w-6 h-6 text-green-600" />
              </div>
              <Text className="font-semibold mb-2">Blog</Text>
              <Text size="sm" muted className="mb-4">Artykuły, porady i aktualizacje</Text>
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Czytaj bloga
              </Button>
            </Card>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
};

export default SupportPage;
