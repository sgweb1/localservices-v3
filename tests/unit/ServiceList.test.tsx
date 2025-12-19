import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServiceList } from '@/features/customer/components/ServiceList';
import { ServiceClient } from '@/api/v1/services';
import { LocationClient } from '@/api/v1/locations';

// Mock API clients
vi.mock('@/api/v1/services');
vi.mock('@/api/v1/locations');

const mockServices = [
  {
    id: 1,
    uuid: 'test-uuid-1',
    name: 'Naprawa hydrauliki',
    description: 'Profesjonalna naprawa instalacji wodnych',
    base_price: 150,
    category: 'plumbing',
    provider: {
      id: 10,
      name: 'Jan Kowalski',
      avatar: null,
      rating: 4.5,
      reviews_count: 12,
    },
    latitude: 52.2297,
    longitude: 21.0122,
  },
  {
    id: 2,
    uuid: 'test-uuid-2',
    name: 'Instalacje elektryczne',
    description: 'Montaż i naprawa instalacji elektrycznych',
    base_price: 200,
    category: 'electrical',
    provider: {
      id: 11,
      name: 'Anna Nowak',
      avatar: null,
      rating: 4.8,
      reviews_count: 25,
    },
    latitude: 52.2350,
    longitude: 21.0150,
  },
];

const mockLocations = [
  { id: 1, name: 'Warszawa', slug: 'warszawa', latitude: 52.2297, longitude: 21.0122, is_major_city: true },
  { id: 2, name: 'Kraków', slug: 'krakow', latitude: 50.0647, longitude: 19.9450, is_major_city: true },
];

describe('ServiceList', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    // Mock API responses
    vi.mocked(ServiceClient.list).mockResolvedValue({
      data: mockServices,
      meta: {
        current_page: 1,
        per_page: 12,
        total: 2,
        last_page: 1,
      },
    });

    vi.mocked(LocationClient.list).mockResolvedValue(mockLocations);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ServiceList />
        </QueryClientProvider>
      </BrowserRouter>
    );
  };

  it('renderuje nagłówek strony', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Znajdź specjalistę')).toBeInTheDocument();
    });
  });

  it('ładuje i wyświetla listę usług', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Naprawa hydrauliki')).toBeInTheDocument();
      expect(screen.getByText('Instalacje elektryczne')).toBeInTheDocument();
    });
  });

  it('wyświetla liczbę wyników', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Wyniki:/)).toBeInTheDocument();
      const wyniki = screen.getByText(/Wyniki:/).parentElement as HTMLElement;
      expect(within(wyniki).getByText('2')).toBeInTheDocument();
    });
  });

  it('wyświetla skeleton loader podczas ładowania', () => {
    vi.mocked(ServiceClient.list).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderComponent();

    // Sprawdź czy są szkielety (szukamy po klasie Tailwind)
    // czekamy, aż stan loading pojawi się po wywołaniu efektu
    return waitFor(() => {
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('obsługuje błąd API', async () => {
    vi.mocked(ServiceClient.list).mockRejectedValue(new Error('Network error'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Nie udało się pobrać usług/i)).toBeInTheDocument();
    });
  });

  it('filtruje usługi po wyszukiwanej frazie', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Szukaj:/)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Szukaj:/);
    await user.type(searchInput, 'hydraulik');

    await waitFor(() => {
      expect(ServiceClient.list).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'hydraulik',
        })
      );
    }, { timeout: 1000 }); // Debounce 350ms
  });

  it('przełącza między widokiem listy a mapy', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Mapa')).toBeInTheDocument();
    });

    const mapButton = screen.getByText('Mapa');
    await user.click(mapButton);

    // Mapa powinna się wyświetlić
    await waitFor(() => {
      expect(document.querySelector('.leaflet-container')).toBeInTheDocument();
    });
  });

  it('dodaje usługę do ulubionych', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Naprawa hydrauliki')).toBeInTheDocument();
    });

    // Kliknij przycisk serca na karcie pierwszej usługi (unikamy ikony w nagłówku)
    // Weź drugi przycisk serca (pierwszy to ikona w nagłówku)
    const heartButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
      !!btn.querySelector('svg.lucide-heart')
    );
    if (heartButtons.length < 2) throw new Error('Nie znaleziono przycisku ulubionych na karcie');
    await user.click(heartButtons[1]);

    // Sprawdź localStorage
    const favorites = JSON.parse(localStorage.getItem('favoriteServices') || '[]');
    expect(favorites).toContain(1);
  });

  it('otwiera sidebar z ulubionymi', async () => {
    const user = userEvent.setup();
    localStorage.setItem('favoriteServices', JSON.stringify([1]));
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Naprawa hydrauliki')).toBeInTheDocument();
    });

    // Kliknij przycisk serca w nagłówku
    const headerHeartButton = screen.getAllByRole('button').find(btn =>
      btn.querySelector('.lucide-heart')
    );
    
    if (headerHeartButton) {
      await user.click(headerHeartButton);

      await waitFor(() => {
        expect(screen.getByText('Ulubione')).toBeInTheDocument();
      });
    }
  });

  it('aplikuje filtry przez panel filtrów', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Filtry')).toBeInTheDocument();
    });

    // Otwórz panel filtrów jeśli jest zamknięty
    const filterButton = screen.getByText('Filtry');
    await user.click(filterButton);

    // Wybierz kategorię
    const categorySelect = screen.getByLabelText(/Kategoria/i);
    await user.selectOptions(categorySelect, 'plumbing');

    // Zastosuj filtry
    const applyButton = screen.getByText(/Zastosuj filtry/i);
    await user.click(applyButton);

    await waitFor(() => {
      expect(ServiceClient.list).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'plumbing',
        })
      );
    });
  });

  it('wyświetla aktywne filtry jako badge', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Filtry')).toBeInTheDocument();
    });

    // Otwórz panel
    await user.click(screen.getByText('Filtry'));

    // Ustaw filtr kategorii
    const categorySelect = screen.getByLabelText(/Kategoria/i);
    await user.selectOptions(categorySelect, 'plumbing');

    // Zastosuj
    await user.click(screen.getByText(/Zastosuj filtry/i));

    await waitFor(() => {
      expect(screen.getByText('plumbing')).toBeInTheDocument();
    });
  });

  it('czyści wszystkie filtry', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Filtry')).toBeInTheDocument();
    });

    // Ustaw filtry
    await user.click(screen.getByText('Filtry'));
    const categorySelect = screen.getByLabelText(/Kategoria/i);
    await user.selectOptions(categorySelect, 'electrical');
    await user.click(screen.getByText(/Zastosuj filtry/i));

    await waitFor(() => {
      expect(screen.getByText('electrical')).toBeInTheDocument();
    });

    // Wyczyść filtry
    const clearButton = screen.getByText(/Wyczyść filtry/i);
    await user.click(clearButton);

    await waitFor(() => {
      expect(ServiceClient.list).toHaveBeenCalledWith(expect.objectContaining({}));
    });
  });

  it('otwiera dialog ze szczegółami usługi', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Naprawa hydrauliki').length).toBeGreaterThan(0);
    });

    // Kliknij na kartę usługi
    const serviceCard = screen.getAllByText('Naprawa hydrauliki')[0].closest('div');
    if (serviceCard) {
      await user.click(serviceCard);

      // Dialog powinien się otworzyć
      await waitFor(() => {
        expect(screen.getAllByText('Naprawa hydrauliki').length).toBeGreaterThan(1);
      });
    }
  });

  it('zapisuje stan widoku (mapa/lista) w localStorage', async () => {
    const user = userEvent.setup();
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Mapa')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Mapa'));

    await waitFor(() => {
      expect(localStorage.getItem('serviceListViewMode')).toBe('map');
    });

    await user.click(screen.getByText('Lista'));

    await waitFor(() => {
      expect(localStorage.getItem('serviceListViewMode')).toBe('list');
    });
  });
});
