import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Shield, Lock, Star } from 'lucide-react';

/**
 * Footer Component - Stopka globalna
 * Bez newsletter'a (jak localhost:8000)
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerColumns = [
    {
      title: 'Dla klientów',
      links: [
        { label: 'Znajdź usługę', href: '/szukaj' },
        { label: 'Jak to działa?', href: '/jak-to-dziala' },
        { label: 'Trust Score™', href: '/trust-score' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Dla specjalistów',
      links: [
        { label: 'Dołącz jako specjalista', href: '/rejestracja' },
        { label: 'Cennik i plany', href: '/cennik' },
        { label: 'Proces weryfikacji', href: '/weryfikacja' },
        { label: 'Portal specjalisty', href: '/portal' },
      ],
    },
    {
      title: 'Informacje',
      links: [
        { label: 'O nas', href: '/o-nas' },
        { label: 'Blog', href: '/blog' },
        { label: 'Kontakt', href: '/kontakt' },
        { label: 'Dla prasy', href: '/dla-prasy' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook', color: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram', color: 'from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' },
  ];

  return (
    <footer className="bg-gray-100 dark:bg-gray-950/80 border-t border-gray-200 dark:border-white/5 py-16 mt-24 text-gray-900 dark:text-white">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Kolumna 1: O LocalServices */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-sky-500/30">
                LS
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">LocalServices</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Marketplace łączący klientów z najlepszymi usługodawcami. Trust Score™ gwarantuje rzetelność każdej oferty.
            </p>
            <div className="flex items-center gap-2.5 pt-4">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener"
                  aria-label={label}
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all active:scale-95`}
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-4">
                {column.title}
              </h3>
              <ul className="space-y-3 text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-gray-700 dark:text-gray-300 hover:text-sky-700 dark:hover:text-sky-300 transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-slate-400">
            <span className="text-gray-900 dark:text-white font-medium">&copy; {currentYear} LocalServices</span>
            <span>Wszystkie prawa zastrzeżone</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <a href="/regulamin" className="text-gray-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300 transition">
              Regulamin
            </a>
            <a href="/polityka-prywatnosci" className="text-gray-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300 transition">
              Polityka prywatności
            </a>
            <a href="/cookies" className="text-gray-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300 transition">
              Polityka cookies
            </a>
            <a href="/rodo" className="text-gray-600 dark:text-slate-400 hover:text-sky-700 dark:hover:text-sky-300 transition">
              RODO
            </a>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-200 dark:border-white/5 pt-8 mt-8">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 text-sm">
              <Shield size={20} className="text-sky-700 dark:text-sky-400" />
              <span>Zweryfikowani specjaliści</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 text-sm">
              <Lock size={20} className="text-sky-700 dark:text-sky-400" />
              <span>Bezpieczna platforma</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 text-sm">
              <Star size={20} className="text-sky-700 dark:text-sky-400" />
              <span>Trust Score™</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
