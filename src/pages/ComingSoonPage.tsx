import React, { useState } from 'react';
import { Mail, Heart, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const ComingSoonPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Podaj prawidłowy email');
      return;
    }

    setIsLoading(true);
    // Simulate email capture
    setTimeout(() => {
      setSubmitted(true);
      setEmail('');
      toast.success('Dziękujemy! Skontaktujemy się wkrótce.');
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-600 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Logo / Title */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-block px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 mb-6">
            <span className="text-white/80 text-sm font-semibold">🚀 Nowy projekt</span>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight animate-fade-in-delay-1">
          🏠 LocalServices
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-delay-2 font-light max-w-xl mx-auto">
          Platforma łącząca klientów z najlepszymi fachowcami w Twojej okolicy
        </p>

        {/* Description */}
        <div className="mb-12 space-y-4 animate-fade-in-delay-3">
          <div className="flex items-center justify-center gap-3 text-white/80">
            <CheckCircle className="w-5 h-5 text-white" />
            <span>Szukaj usług w okolicy</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-white/80">
            <CheckCircle className="w-5 h-5 text-white" />
            <span>Porównuj oferty</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-white/80">
            <CheckCircle className="w-5 h-5 text-white" />
            <span>Pracuj z veryfikowanymi fachowcami</span>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mb-12 animate-fade-in-delay-4">
          <p className="text-lg text-white/80 mb-6">
            ⏰ Launching Soon!
          </p>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Twój email"
                  className="w-full pl-12 pr-4 py-3.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:border-white/50 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3.5 bg-white text-cyan-600 rounded-xl font-bold hover:bg-white/90 transition-all hover:shadow-lg disabled:opacity-70"
              >
                {isLoading ? '...' : 'Powiadom mnie'}
              </button>
            </form>
          ) : (
            <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Dziękujemy! Wkrótce Cię powiadomimy.</span>
              </div>
            </div>
          )}
        </div>

        {/* Social Proof / Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 text-center mb-12 animate-fade-in-delay-5">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
            <div className="text-sm text-white/70">Fachowców</div>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <div className="text-2xl md:text-3xl font-bold text-white">1000+</div>
            <div className="text-sm text-white/70">Zadowolonych klientów</div>
          </div>
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <div className="text-2xl md:text-3xl font-bold text-white">50+</div>
            <div className="text-sm text-white/70">Miast</div>
          </div>
        </div>

        {/* Footer message */}
        <div className="text-white/60 text-sm">
          <p>
            Szybko. Wiarygodnie. Lokalnie.
            <Heart className="inline w-4 h-4 ml-2 text-red-400" />
          </p>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay-1 {
          animation: fade-in 0.6s ease-out 0.1s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-4 {
          animation: fade-in 0.6s ease-out 0.4s forwards;
          opacity: 0;
        }

        .animate-fade-in-delay-5 {
          animation: fade-in 0.6s ease-out 0.5s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};
