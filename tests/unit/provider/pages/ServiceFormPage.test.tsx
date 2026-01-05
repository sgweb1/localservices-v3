import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ServiceFormPage from '@/features/provider/pages/ServiceFormPage';
import { useService } from '@/features/provider/hooks/useService';

// Mock hooks
vi.mock('@/features/provider/hooks/useService', () => ({
  useService: vi.fn(() => ({
    data: null,
    isLoading: false,
  })),
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategories: vi.fn(() => ({
    categories: [
      { id: 1, name: 'Hydraulika', slug: 'hydraulika' },
      { id: 2, name: 'Elektryka', slug: 'elektryka' },
    ],
    loading: false,
  })),
}));

vi.mock('@/hooks/useLocations', () => ({
  useLocations: vi.fn(() => ({
    locations: [
      { id: 1, name: 'Warszawa', slug: 'warszawa' },
      { id: 2, name: 'Kraków', slug: 'krakow' },
    ],
    loading: false,
  })),
}));

vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => ({
    user: { id: 1, name: 'Test Provider', email: 'test@example.com' },
    isAuthenticated: true,
  }),
}));

// Mock Quill editor
vi.mock('quill', () => ({
  default: vi.fn().mockImplementation(() => ({
    root: { innerHTML: '' },
    on: vi.fn(),
    off: vi.fn(),
    clipboard: {
      dangerouslyPasteHTML: vi.fn(),
    },
  })),
}));

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(() => ({})),
  },
}));

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="marker" />,
  Circle: () => <div data-testid="circle" />,
  useMapEvents: vi.fn(),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = (mode: 'create' | 'edit' = 'create') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const initialEntry = mode === 'edit' 
    ? '/provider/services/edit/1' 
    : '/provider/services/create';

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/provider/services/create" element={children} />
            <Route path="/provider/services/edit/:id" element={children} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('ServiceFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering - Tryb Create', () => {
    it('renderuje tytuł "Dodaj usługę" w trybie create', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      expect(screen.getByText('Dodaj usługę')).toBeInTheDocument();
    });

    it('renderuje wszystkie główne sekcje formularza', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      // Sekcje powinny być widoczne przez headingi
      expect(screen.getByText(/Podstawowe informacje/i)).toBeInTheDocument();
      expect(screen.getByText(/Cennik i rozliczenie/i)).toBeInTheDocument();
      expect(screen.getByText(/Rezerwacje i dostępność/i)).toBeInTheDocument();
      // SEO pojawia się kilka razy, sprawdzamy czy jest
      const seoElements = screen.getAllByText(/SEO/i);
      expect(seoElements.length).toBeGreaterThan(0);
    });

    it('renderuje pola podstawowe', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      expect(screen.getByPlaceholderText(/Profesjonalne usługi hydrauliczne/i)).toBeInTheDocument();
      // Formularz zawiera przycisk do dodania zdjęć
      expect(screen.getByText(/Dodaj zdjęcia/i)).toBeInTheDocument();
    });
  });

  describe('Sekcja Ceny', () => {
    it('domyślnie pokazuje typ cennika "hourly"', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      const hourlyRadio = screen.getByDisplayValue('hourly') as HTMLInputElement;
      expect(hourlyRadio).toBeChecked();
    });

    it('zmienia widoczność pól po zmianie typu cennika na "fixed"', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      const fixedRadio = screen.getByDisplayValue('fixed') as HTMLInputElement;
      await user.click(fixedRadio);
      
      expect(fixedRadio).toBeChecked();
      expect(screen.getByPlaceholderText(/np\. 150/i)).toBeInTheDocument();
    });

    it('pokazuje pola zakresu cen dla typu "quote"', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      const quoteRadio = screen.getByRole('radio', { name: /Wycena indywidualna/i });
      await user.click(quoteRadio);
      
      expect(quoteRadio).toBeChecked();
      // Po kliknięciu quote, pola zakresu ceny powinny być widoczne
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/np\. 100/)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/np\. 300/)).toBeInTheDocument();
      });
    });
  });

  describe('Sekcja Rezerwacji', () => {
    it('domyślnie ma włączony instant booking', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      // Pierwszy switch na stronie to instant booking
      const switches = screen.getAllByRole('switch');
      expect(switches[0]).toBeChecked();
    });

    it('pozwala zmienić instant booking', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      const switches = screen.getAllByRole('switch');
      await user.click(switches[0]);
      
      expect(switches[0]).not.toBeChecked();
    });

    it('renderuje pole minimalne wyprzedzenie', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      const minNoticeInput = screen.getByPlaceholderText(/np\. 12/i);
      expect(minNoticeInput).toBeInTheDocument();
      expect(minNoticeInput).toHaveValue(12); // Domyślna wartość
    });
  });

  describe('Sekcja Lokalizacji', () => {
    it('renderuje mapę', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('renderuje select lokalizacji', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      // LocationSelect powinien być w dokumencie
      expect(screen.getByText(/Wybierz miasto/i)).toBeInTheDocument();
    });

    it('domyślnie ma włączoną gotowość do dojazdu', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      // Znajdujemy switch po jego pozycji - trzeci switch na stronie (instant, accept quotes, travel)
      const switches = screen.getAllByRole('switch');
      expect(switches[2]).toBeChecked(); // willing to travel jest trzecim switchem
    });

    it('ma domyślny dystans 20km', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      // Znajdujemy slider z promieniem działania
      const distanceSlider = screen.getByRole('slider', { name: /Promień działania/i });
      expect(distanceSlider).toHaveValue('20');
    });
  });

  describe('Sekcja Zdjęć', () => {
    it('renderuje strefę drag & drop', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/Upuść zdjęcia lub kliknij/i)).toBeInTheDocument();
    });

    it('pokazuje button "Dodaj zdjęcia"', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/Dodaj zdjęcia/i)).toBeInTheDocument();
    });
  });

  describe('Sekcja SEO', () => {
    it('renderuje pola SEO', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      expect(screen.getByPlaceholderText(/Hydraulik 24\/7/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Krótki opis do wyników/i)).toBeInTheDocument();
    });
  });

  describe('Akcje Formularza', () => {
    it('renderuje przycisk "Anuluj"', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper('create') });
      
      expect(screen.getByText(/Anuluj/i)).toBeInTheDocument();
    });

    it('renderuje przycisk submit w trybie create', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper('create') });
      
      expect(screen.getByText(/Utwórz usługę/i)).toBeInTheDocument();
    });
  });

  describe('Walidacja', () => {
    it('renderuje informacje o wymaganych polach', () => {
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      // Sprawdzamy czy jest informacja o minimalnej długości opisu
      expect(screen.getByText(/Opis:/)).toBeInTheDocument();
    });
  });

  describe('Interakcje użytkownika', () => {
    it('pozwala wpisać tytuł usługi', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      const titleInput = screen.getByPlaceholderText(/Profesjonalne usługi hydrauliczne/i);
      await user.type(titleInput, 'Naprawa hydrauliczna');
      
      expect(titleInput).toHaveValue('Naprawa hydrauliczna');
    });

    it('pozwala zmienić cenę bazową', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPage />, { wrapper: createWrapper() });
      
      const priceInput = screen.getByPlaceholderText(/np\. 150/i);
      await user.clear(priceInput);
      await user.type(priceInput, '200');
      
      expect(priceInput).toHaveValue(200);
    });
  });

  describe('Loading states', () => {
    it('pokazuje "Ładowanie..." gdy dane są pobierane w trybie edit', () => {
      // Mockujemy useService z loadingiem przed renderem
      const mockUseService = vi.mocked(useService);
      mockUseService.mockReturnValue({
        data: null,
        isLoading: true,
        isError: false,
        error: null,
        refetch: vi.fn(),
      } as any);

      render(<ServiceFormPage />, { wrapper: createWrapper('edit') });
      
      expect(screen.getByText(/Ładowanie.../i)).toBeInTheDocument();
    });
  });
});
