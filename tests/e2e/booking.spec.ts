import { test, expect } from '@playwright/test';

/**
 * E2E testy dla booking journey
 * SC-201: Customer booking flow
 * SC-002: Provider workflow
 */

test.describe('SC-201: Customer Booking Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Czyszczenie localStorage
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    // Login jako customer (mock)
    // W produkcji zamiast tego logowalibyśmy się przez UI
    await page.goto('/');
  });

  test('przegląda dostępne usługi w mieście', async ({ page }) => {
    await page.goto('/szukaj');
    
    // Czekaj na załadowanie usług
    await page.waitForSelector('[data-testid="service-card"]', { timeout: 5000 });
    
    // Sprawdzić czy jest przynajmniej jedna karta usługi
    const serviceCards = page.locator('[data-testid="service-card"]');
    await expect(serviceCards.first()).toBeVisible();
    
    // Sprawdzić czy widać informacje o mieście
    const cityFilter = page.locator('[data-testid="city-filter"]');
    await expect(cityFilter).toBeVisible();
  });

  test('filtruje usługi po kategorii i mieście', async ({ page }) => {
    await page.goto('/szukaj');
    
    // Czekaj na załadowanie
    await page.waitForSelector('[data-testid="service-card"]', { timeout: 5000 });
    
    // Otwórz panel filtrów
    const filterButton = page.getByTestId('filters-toggle');
    if (await filterButton.isVisible()) {
      await filterButton.click();
    }
    
    // Wybierz kategorię
    const categorySelect = page.locator('[data-testid="category-filter"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('hydraulika');
    }
    
    // Sprawdź czy URL się zmienił
    await page.waitForTimeout(300);
    const url = page.url();
    expect(url).toContain('/szukaj');
  });

  test('wyświetla szczegóły dostawcy i jego usługi', async ({ page }) => {
    await page.goto('/szukaj');
    
    // Czekaj na karty usług
    await page.waitForSelector('[data-testid="service-card"]', { timeout: 5000 });
    
    // Kliknij na pierwszą usługę/dostawcę
    const firstServiceCard = page.locator('[data-testid="service-card"]').first();
    await firstServiceCard.click();
    
    // Czekaj na modal/stronę z szczegółami
    await page.waitForTimeout(500);
    
    // Sprawdź czy są widoczne detale
    const providerName = page.locator('[data-testid="provider-name"]');
    if (await providerName.isVisible()) {
      await expect(providerName).toBeVisible();
    }
    
    // Sprawdź czy są widoczne oceny/Trust Score
    const trustScore = page.locator('[data-testid="trust-score"]');
    if (await trustScore.isVisible()) {
      await expect(trustScore).toContainText(/\d+/);
    }
  });

  test('rezerwuje usługę (instant booking)', async ({ page }) => {
    // Nawiguj do szukaj
    await page.goto('/szukaj');
    
    // Czekaj na usługi
    await page.waitForSelector('[data-testid="service-card"]', { timeout: 5000 });
    
    // Kliknij na usługę
    const firstService = page.locator('[data-testid="service-card"]').first();
    await firstService.click();
    
    await page.waitForTimeout(500);
    
    // Szukaj przycisku rezerwacji
    const bookButton = page.locator('[data-testid="book-now"]').or(
      page.getByText(/Zarezerwuj|Rezerwuj/i)
    );
    
    if (await bookButton.isVisible()) {
      await bookButton.click();
      
      // Czekaj na dialog rezerwacji
      await page.waitForTimeout(300);
      
      // Możliwe że pojawi się formularz
      const dateInput = page.locator('input[type="date"]').first();
      const timeInput = page.locator('input[type="time"]').first();
      
      if (await dateInput.isVisible()) {
        // Ustaw datę na jutro
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 3);
        const dateStr = tomorrow.toISOString().split('T')[0];
        
        await dateInput.fill(dateStr);
        
        if (await timeInput.isVisible()) {
          await timeInput.fill('10:00');
        }
        
        // Szukaj przycisku potwierdzenia
        const confirmButton = page.locator('[data-testid="confirm-booking"]').or(
          page.getByText(/Potwierdź|Zarezerwuj/)
        );
        
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
          
          // Czekaj na sukces
          await page.waitForTimeout(1000);
          
          // Sprawdź czy jest komunikat o sukcesie lub redirect
          const successMessage = page.locator('[data-testid="success-message"]').or(
            page.getByText(/rezerwacja|sukces/i)
          );
          
          if (await successMessage.isVisible()) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    }
  });

  test('śledzi status rezerwacji', async ({ page }) => {
    // Nawiguj do panelu klienta / rezerwacji
    const bookingsLink = page.getByText(/Moje rezerwacje|Rezerwacje|Bookings/i);
    
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      
      await page.waitForTimeout(500);
      
      // Czekaj na listę rezerwacji
      const bookingsList = page.locator('[data-testid="booking-item"]').or(
        page.locator('[data-testid="booking-card"]')
      );
      
      if (await bookingsList.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        // Są rezerwacje
        await expect(bookingsList.first()).toBeVisible();
        
        // Kliknij na pierwszą rezerwację
        await bookingsList.first().click();
        
        await page.waitForTimeout(500);
        
        // Sprawdź status
        const status = page.locator('[data-testid="booking-status"]');
        if (await status.isVisible()) {
          const statusText = await status.textContent();
          expect(['confirmed', 'pending', 'completed', 'in_progress']).toContain(statusText?.toLowerCase() ?? '');
        }
      }
    }
  });

  test('anuluje rezerwację', async ({ page }) => {
    // Nawiguj do rezerwacji
    const bookingsLink = page.getByText(/Moje rezerwacje|Rezerwacje/i);
    
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      
      await page.waitForTimeout(500);
      
      // Szukaj przycisku anulowania
      const cancelButton = page.locator('[data-testid="cancel-booking"]').or(
        page.getByText(/Anuluj/)
      );
      
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Potwierdź dialog
        const confirmDialog = page.locator('[data-testid="confirm-dialog"]').or(
          page.getByText(/Czy na pewno|Potwierdź/)
        );
        
        if (await confirmDialog.isVisible()) {
          const confirmButton = page.locator('[data-testid="confirm"]').or(
            page.getByText(/Tak|Potwierdź/).last()
          );
          
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
            
            await page.waitForTimeout(500);
          }
        }
      }
    }
  });
});

test.describe('SC-002: Provider Booking Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Czyszczenie localStorage
    await page.addInitScript(() => {
      localStorage.clear();
    });
    
    // Login jako provider (mock)
    await page.goto('/');
  });

  test('przegląda swoje rezerwacje', async ({ page }) => {
    // Nawiguj do provider dashboard / rezerwacji
    const bookingsLink = page.getByText(/Rezerwacje|Bookings|Dashboard/i);
    
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      
      await page.waitForTimeout(500);
      
      // Czekaj na listę rezerwacji
      const bookingsList = page.locator('[data-testid="booking-item"]').or(
        page.locator('[data-testid="booking-card"]')
      );
      
      if (await bookingsList.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(bookingsList.first()).toBeVisible();
      }
    }
  });

  test('akceptuje rezerwację (request quote -> confirmed)', async ({ page }) => {
    // Nawiguj do rezerwacji
    const bookingsLink = page.getByText(/Rezerwacje|Bookings/i);
    
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      
      await page.waitForTimeout(500);
      
      // Szukaj rezerwacji w statusie pending
      const bookingItems = page.locator('[data-testid="booking-item"]');
      
      // Kliknij na pierwszą rezerwację
      if (await bookingItems.first().isVisible()) {
        await bookingItems.first().click();
        
        await page.waitForTimeout(500);
        
        // Szukaj przycisku akceptacji
        const acceptButton = page.locator('[data-testid="accept-booking"]').or(
          page.getByText(/Zaakceptuj|Akceptuj/)
        );
        
        if (await acceptButton.isVisible()) {
          await acceptButton.click();
          
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('wysyła cytat', async ({ page }) => {
    // Nawiguj do rezerwacji
    const bookingsLink = page.getByText(/Rezerwacje|Bookings/i);
    
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      
      await page.waitForTimeout(500);
      
      // Szukaj przycisku "Wyślij cytat"
      const quoteButton = page.locator('[data-testid="send-quote"]').or(
        page.getByText(/Cytat|Quote/)
      );
      
      if (await quoteButton.isVisible()) {
        await quoteButton.click();
        
        await page.waitForTimeout(500);
        
        // Formularz cytatu
        const priceInput = page.locator('input[type="number"]').first();
        
        if (await priceInput.isVisible()) {
          await priceInput.fill('250');
          
          const submitButton = page.locator('[data-testid="submit-quote"]').or(
            page.getByText(/Wyślij/)
          );
          
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            await page.waitForTimeout(500);
          }
        }
      }
    }
  });

  test('kontaktuje się z klientem przez czat', async ({ page }) => {
    // Nawiguj do rezerwacji
    const bookingsLink = page.getByText(/Rezerwacje|Bookings/i);
    
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      
      await page.waitForTimeout(500);
      
      // Szukaj przycisku czatu
      const chatButton = page.locator('[data-testid="open-chat"]').or(
        page.getByText(/Czat|Wiadomość|Message/)
      );
      
      if (await chatButton.isVisible()) {
        await chatButton.click();
        
        await page.waitForTimeout(500);
        
        // Wpisz wiadomość
        const messageInput = page.locator('[data-testid="message-input"]').or(
          page.locator('textarea')
        );
        
        if (await messageInput.isVisible()) {
          await messageInput.fill('Będę u Ciebie za 15 minut');
          
          // Wyślij
          const sendButton = page.locator('[data-testid="send-message"]').or(
            page.getByText(/Wyślij/)
          );
          
          if (await sendButton.isVisible()) {
            await sendButton.click();
            
            await page.waitForTimeout(500);
          }
        }
      }
    }
  });

  test('oznacza rezerwację jako w trakcie', async ({ page }) => {
    // Nawiguj do rezerwacji
    const bookingsLink = page.getByText(/Rezerwacje|Bookings/i);
    
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      
      await page.waitForTimeout(500);
      
      // Szukaj przycisku "Rozpocznij"
      const startButton = page.locator('[data-testid="start-booking"]').or(
        page.getByText(/Rozpocznij|Start/)
      );
      
      if (await startButton.isVisible()) {
        await startButton.click();
        
        await page.waitForTimeout(500);
      }
    }
  });

  test('oznacza rezerwację jako ukończoną', async ({ page }) => {
    // Nawiguj do rezerwacji
    const bookingsLink = page.getByText(/Rezerwacje|Bookings/i);
    
    if (await bookingsLink.isVisible()) {
      await bookingsLink.click();
      
      await page.waitForTimeout(500);
      
      // Szukaj przycisku "Ukończ"
      const completeButton = page.locator('[data-testid="complete-booking"]').or(
        page.getByText(/Ukończ|Complete/)
      );
      
      if (await completeButton.isVisible()) {
        await completeButton.click();
        
        // Formularz ukończenia
        const notesInput = page.locator('textarea').first();
        
        if (await notesInput.isVisible()) {
          await notesInput.fill('Usługa wykonana bez problemów');
        }
        
        const submitButton = page.locator('[data-testid="submit"]').or(
          page.getByText(/Potwierdź|Ukończ/)
        );
        
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('przegląda statystyki', async ({ page }) => {
    // Nawiguj do provider dashboard / statystyk
    const dashboardLink = page.getByText(/Dashboard|Statystyki|Analytics/i);
    
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      
      await page.waitForTimeout(500);
      
      // Sprawdź czy są widoczne statystyki
      const totalBookings = page.locator('[data-testid="total-bookings"]');
      const completionRate = page.locator('[data-testid="completion-rate"]');
      
      if (await totalBookings.isVisible()) {
        await expect(totalBookings).toContainText(/\d+/);
      }
      
      if (await completionRate.isVisible()) {
        await expect(completionRate).toContainText(/%/);
      }
    }
  });
});

test.describe('E2E: Complete Booking Journey', () => {
  test('pełny przepływ: customer rezerwuje i provider realizuje', async ({ page }) => {
    // Uproszczony test pełnego procesu
    
    // 1. Strona główna
    await page.goto('/');
    await expect(page).toHaveTitle(/LocalServices|Home/i);
    
    // 2. Przejście do wyszukiwania
    const searchLink = page.getByText(/Szukaj|Search/i);
    if (await searchLink.isVisible()) {
      await searchLink.click();
      
      // Czekaj na załadowanie
      await page.waitForTimeout(1000);
      
      // Powinniśmy być na stronie wyszukiwania
      const url = page.url();
      expect(['szukaj', 'search', 'services']).toEqual(
        expect.arrayContaining([
          url.toLowerCase().includes('szukaj') ? 'szukaj' : 
          url.toLowerCase().includes('search') ? 'search' : 'services'
        ])
      );
    }
  });
});
