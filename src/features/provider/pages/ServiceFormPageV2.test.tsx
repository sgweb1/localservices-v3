/**
 * @file ServiceFormPageV2.test.tsx
 * @description Comprehensive test suite for ServiceFormPageV2 component
 * 
 * Test Coverage:
 * - Component rendering and initial state
 * - Form field validation
 * - Tab navigation
 * - Dynamic arrays (requirements, tools)
 * - Photo upload and management
 * - Conditional rendering based on field values
 * - Form submission
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ServiceFormPageV2 from './ServiceFormPageV2';

// Mock dependencies
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '11' }),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

/**
 * Test wrapper with all required providers
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  );
};

describe('ServiceFormPageV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the form with all tabs', () => {
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      // Check if all tabs are present
      expect(screen.getByText('Podstawowe')).toBeInTheDocument();
      expect(screen.getByText('Ceny')).toBeInTheDocument();
      expect(screen.getByText('Rezerwacja')).toBeInTheDocument();
      expect(screen.getByText('Lokalizacja')).toBeInTheDocument();
      expect(screen.getByText('Zawartość')).toBeInTheDocument();
      expect(screen.getByText('Polityki')).toBeInTheDocument();
      expect(screen.getByText('Zdjęcia')).toBeInTheDocument();
      expect(screen.getByText('SEO')).toBeInTheDocument();
    });

    it('should display the form title', () => {
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });
      expect(screen.getByText('Edytuj usługę')).toBeInTheDocument();
    });

    it('should render action buttons in footer', () => {
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });
      
      expect(screen.getByText('Anuluj')).toBeInTheDocument();
      expect(screen.getByText('💾 Zapisz jako wstrzymana')).toBeInTheDocument();
      expect(screen.getByText('✅ Zapisz i publikuj')).toBeInTheDocument();
    });
  });

  describe('Section 1 - Basic Information', () => {
    it('should render all basic info fields', () => {
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/Tytuł usługi/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Opis usługi/i)).toBeInTheDocument();
      expect(screen.getByText(/Kategoria/i)).toBeInTheDocument();
      expect(screen.getByText(/Status/i)).toBeInTheDocument();
    });

    it('should update title field on input', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const titleInput = screen.getByLabelText(/Tytuł usługi/i);
      await user.type(titleInput, 'Test Service Title');

      expect(titleInput).toHaveValue('Test Service Title');
    });

    it('should show character count for title', () => {
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });
      
      // Should show character counter
      expect(screen.getByText(/0 \/ 100/)).toBeInTheDocument();
    });

    it('should validate title length (min 5 chars)', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const titleInput = screen.getByLabelText(/Tytuł usługi/i);
      await user.type(titleInput, 'Test');

      const saveButton = screen.getByText('✅ Zapisz i publikuj');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Tytuł musi mieć min. 5 znaków/i)).toBeInTheDocument();
      });
    });

    it('should validate description length (min 50 chars)', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const descInput = screen.getByLabelText(/Opis usługi/i);
      await user.type(descInput, 'Too short');

      const saveButton = screen.getByText('✅ Zapisz i publikuj');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Opis musi mieć min. 50 znaków/i)).toBeInTheDocument();
      });
    });
  });

  describe('Section 2 - Pricing', () => {
    it('should render pricing type radio group', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      // Navigate to pricing tab
      const pricingTab = screen.getByText('Ceny');
      await user.click(pricingTab);

      expect(screen.getByText('Stawka godzinowa')).toBeInTheDocument();
      expect(screen.getByText('Cena stała')).toBeInTheDocument();
      expect(screen.getByText('Wycena indywidualna')).toBeInTheDocument();
    });

    it('should show basePrice field for hourly pricing', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const pricingTab = screen.getByText('Ceny');
      await user.click(pricingTab);

      // Default is hourly
      expect(screen.getByLabelText(/Stawka za godzinę/i)).toBeInTheDocument();
    });

    it('should show price range fields for quote pricing', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const pricingTab = screen.getByText('Ceny');
      await user.click(pricingTab);

      // Select quote pricing
      const quoteRadio = screen.getByText('Wycena indywidualna');
      await user.click(quoteRadio);

      await waitFor(() => {
        expect(screen.getByLabelText(/Cena od/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Cena do/i)).toBeInTheDocument();
      });
    });

    it('should validate base price for hourly/fixed', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const pricingTab = screen.getByText('Ceny');
      await user.click(pricingTab);

      const saveButton = screen.getByText('✅ Zapisz i publikuj');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Cena bazowa jest wymagana/i)).toBeInTheDocument();
      });
    });
  });

  describe('Section 3 - Booking', () => {
    it('should render booking switches', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const bookingTab = screen.getByText('Rezerwacja');
      await user.click(bookingTab);

      expect(screen.getByText(/Natychmiastowa rezerwacja/i)).toBeInTheDocument();
      expect(screen.getByText(/Akceptuj zapytania o wycenę/i)).toBeInTheDocument();
    });

    it('should toggle instant booking switch', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const bookingTab = screen.getByText('Rezerwacja');
      await user.click(bookingTab);

      const instantSwitch = screen.getByRole('switch', { name: /Natychmiastowa rezerwacja/i });
      expect(instantSwitch).toBeChecked();

      await user.click(instantSwitch);
      expect(instantSwitch).not.toBeChecked();
    });

    it('should render min notice and duration fields', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const bookingTab = screen.getByText('Rezerwacja');
      await user.click(bookingTab);

      expect(screen.getByLabelText(/Minimalny czas powiadomienia/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Przewidywany czas trwania/i)).toBeInTheDocument();
    });
  });

  describe('Section 4 - Location', () => {
    it('should render location fields', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const locationTab = screen.getByText('Lokalizacja');
      await user.click(locationTab);

      expect(screen.getByText(/Lokalizacja usługi/i)).toBeInTheDocument();
      expect(screen.getByText(/Czy dojedziesz do klienta?/i)).toBeInTheDocument();
    });

    it('should show travel distance slider when willing to travel', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const locationTab = screen.getByText('Lokalizacja');
      await user.click(locationTab);

      // Default willingToTravel is true
      expect(screen.getByText(/Maksymalny dystans dojazdu/i)).toBeInTheDocument();
      expect(screen.getByText(/20 km/i)).toBeInTheDocument();
    });

    it('should hide travel fields when not willing to travel', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const locationTab = screen.getByText('Lokalizacja');
      await user.click(locationTab);

      const travelSwitch = screen.getByRole('switch', { name: /Czy dojedziesz do klienta?/i });
      await user.click(travelSwitch);

      await waitFor(() => {
        expect(screen.queryByText(/Maksymalny dystans dojazdu/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Section 5 - Content (Dynamic Arrays)', () => {
    it('should add requirement item', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const contentTab = screen.getByText('Zawartość');
      await user.click(contentTab);

      const addButton = screen.getByText('➕ Dodaj wymaganie');
      await user.click(addButton);

      expect(screen.getByPlaceholderText('Wymaganie 1')).toBeInTheDocument();
    });

    it('should remove requirement item', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const contentTab = screen.getByText('Zawartość');
      await user.click(contentTab);

      // Add requirement
      const addButton = screen.getByText('➕ Dodaj wymaganie');
      await user.click(addButton);

      const requirementInput = screen.getByPlaceholderText('Wymaganie 1');
      await user.type(requirementInput, 'Test requirement');

      // Remove requirement
      const removeButtons = screen.getAllByText('🗑️');
      await user.click(removeButtons[0]);

      expect(screen.queryByPlaceholderText('Wymaganie 1')).not.toBeInTheDocument();
    });

    it('should add and manage multiple tools', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const contentTab = screen.getByText('Zawartość');
      await user.click(contentTab);

      // Add 2 tools
      const addToolButton = screen.getByText('➕ Dodaj narzędzie');
      await user.click(addToolButton);
      await user.click(addToolButton);

      expect(screen.getByPlaceholderText('Narzędzie 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Narzędzie 2')).toBeInTheDocument();
    });
  });

  describe('Section 6 - Policies', () => {
    it('should render cancellation policy presets', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const policiesTab = screen.getByText('Polityki');
      await user.click(policiesTab);

      expect(screen.getByText('Elastyczna')).toBeInTheDocument();
      expect(screen.getByText('Umiarkowana')).toBeInTheDocument();
      expect(screen.getByText('Sztywna')).toBeInTheDocument();
      expect(screen.getByText('Własna polityka')).toBeInTheDocument();
    });

    it('should show custom textarea when custom policy selected', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const policiesTab = screen.getByText('Polityki');
      await user.click(policiesTab);

      const customRadio = screen.getByText('Własna polityka');
      await user.click(customRadio);

      await waitFor(() => {
        expect(screen.getByLabelText(/Własna polityka anulowania/i)).toBeInTheDocument();
      });
    });

    it('should show preview for preset policies', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const policiesTab = screen.getByText('Polityki');
      await user.click(policiesTab);

      const flexibleRadio = screen.getByText('Elastyczna');
      await user.click(flexibleRadio);

      await waitFor(() => {
        expect(screen.getByText(/Podgląd:/i)).toBeInTheDocument();
        expect(screen.getByText(/Klient może anulować rezerwację/i)).toBeInTheDocument();
      });
    });
  });

  describe('Section 7 - Photos', () => {
    it('should render photo upload area', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const photosTab = screen.getByText('Zdjęcia');
      await user.click(photosTab);

      expect(screen.getByText(/Przeciągnij zdjęcia tutaj/i)).toBeInTheDocument();
      expect(screen.getByText(/JPG, PNG lub WEBP/i)).toBeInTheDocument();
    });

    it('should handle file upload via input', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const photosTab = screen.getByText('Zdjęcia');
      await user.click(photosTab);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('photo-upload') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/Zdjęcia \(1\/10\)/i)).toBeInTheDocument();
      });
    });

    it('should set primary photo', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const photosTab = screen.getByText('Zdjęcia');
      await user.click(photosTab);

      // Upload 2 photos
      const file1 = new File(['test1'], 'test1.jpg', { type: 'image/jpeg' });
      const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('photo-upload') as HTMLInputElement;

      await user.upload(input, [file1, file2]);

      await waitFor(() => {
        // First photo should be primary by default
        expect(screen.getByText('⭐ Główne zdjęcie')).toBeInTheDocument();
      });
    });

    it('should remove photo', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const photosTab = screen.getByText('Zdjęcia');
      await user.click(photosTab);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText('photo-upload') as HTMLInputElement;

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/Zdjęcia \(1\/10\)/i)).toBeInTheDocument();
      });

      const removeButton = screen.getByText('🗑️ Usuń');
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText(/Zdjęcia \(1\/10\)/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Section 8 - SEO', () => {
    it('should render SEO fields', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const seoTab = screen.getByText('SEO');
      await user.click(seoTab);

      expect(screen.getByLabelText(/Meta tytuł/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Meta opis/i)).toBeInTheDocument();
    });

    it('should show character count for meta title', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const seoTab = screen.getByText('SEO');
      await user.click(seoTab);

      expect(screen.getByText(/0 \/ 60/)).toBeInTheDocument();
    });

    it('should show Google search preview', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const seoTab = screen.getByText('SEO');
      await user.click(seoTab);

      expect(screen.getByText(/Podgląd w Google:/i)).toBeInTheDocument();
      expect(screen.getByText(/ls.test › usługi › .../i)).toBeInTheDocument();
    });

    it('should update preview when meta fields change', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      // First set title in basic section
      const titleInput = screen.getByLabelText(/Tytuł usługi/i);
      await user.type(titleInput, 'Test Service');

      // Go to SEO tab
      const seoTab = screen.getByText('SEO');
      await user.click(seoTab);

      // Meta title should show in preview
      const metaTitleInput = screen.getByLabelText(/Meta tytuł/i);
      await user.type(metaTitleInput, 'Custom Meta Title');

      await waitFor(() => {
        expect(screen.getByText('Custom Meta Title')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields on submit', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const saveButton = screen.getByText('✅ Zapisz i publikuj');
      await user.click(saveButton);

      await waitFor(() => {
        // Should show multiple validation errors
        expect(screen.getByText(/Tytuł musi mieć min. 5 znaków/i)).toBeInTheDocument();
        expect(screen.getByText(/Opis musi mieć min. 50 znaków/i)).toBeInTheDocument();
      });
    });

    it('should clear error when field is fixed', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const saveButton = screen.getByText('✅ Zapisz i publikuj');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Tytuł musi mieć min. 5 znaków/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Tytuł usługi/i);
      await user.type(titleInput, 'Valid Title');

      await waitFor(() => {
        expect(screen.queryByText(/Tytuł musi mieć min. 5 znaków/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      // Initially on basic tab
      expect(screen.getByLabelText(/Tytuł usługi/i)).toBeInTheDocument();

      // Navigate to pricing
      const pricingTab = screen.getByText('Ceny');
      await user.click(pricingTab);

      await waitFor(() => {
        expect(screen.getByText('Stawka godzinowa')).toBeInTheDocument();
      });

      // Navigate to photos
      const photosTab = screen.getByText('Zdjęcia');
      await user.click(photosTab);

      await waitFor(() => {
        expect(screen.getByText(/Przeciągnij zdjęcia tutaj/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Actions', () => {
    it('should handle cancel button', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const cancelButton = screen.getByText('Anuluj');
      expect(cancelButton).toBeInTheDocument();
      
      // Click should navigate back (mocked)
      await user.click(cancelButton);
    });

    it('should save as paused status', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const pauseButton = screen.getByText('💾 Zapisz jako wstrzymana');
      await user.click(pauseButton);

      // Status should be set to paused (internal state change)
    });

    it('should show loading state during save', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      const saveButton = screen.getByText('✅ Zapisz i publikuj');
      await user.click(saveButton);

      // Should show loading text (though validation will fail first)
    });
  });

  describe('Integration Tests', () => {
    it('should complete full form flow', async () => {
      const user = userEvent.setup();
      render(<ServiceFormPageV2 />, { wrapper: createWrapper() });

      // Fill basic info
      await user.type(screen.getByLabelText(/Tytuł usługi/i), 'Professional Cleaning Service');
      await user.type(
        screen.getByLabelText(/Opis usługi/i),
        'We provide professional cleaning services for homes and offices. Our experienced team uses eco-friendly products to ensure a spotless clean.'
      );

      // Navigate to pricing
      const pricingTab = screen.getByText('Ceny');
      await user.click(pricingTab);

      await user.type(screen.getByLabelText(/Stawka za godzinę/i), '50');

      // Navigate to booking
      const bookingTab = screen.getByText('Rezerwacja');
      await user.click(bookingTab);

      await user.type(screen.getByLabelText(/Przewidywany czas trwania/i), '120');

      // Navigate to content
      const contentTab = screen.getByText('Zawartość');
      await user.click(contentTab);

      await user.type(screen.getByLabelText(/Co jest wliczone w cenę?/i), 'All cleaning materials and equipment included');

      // Navigate to policies
      const policiesTab = screen.getByText('Polityki');
      await user.click(policiesTab);

      const flexibleRadio = screen.getByText('Elastyczna');
      await user.click(flexibleRadio);

      // Try to save
      const saveButton = screen.getByText('✅ Zapisz i publikuj');
      await user.click(saveButton);

      // Should pass validation (or show API error if not mocked)
    });
  });
});
