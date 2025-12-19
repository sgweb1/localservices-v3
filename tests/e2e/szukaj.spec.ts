import { test, expect } from '@playwright/test';

/**
 * E2E testy dla strony /szukaj
 * Testują pełne przepływy użytkownika
 */

test.describe('Strona wyszukiwania usług (/szukaj)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('favoriteServices', '[]');
      localStorage.setItem('serviceListViewMode', 'list');
    });
    await page.goto('/szukaj');
  });

  test('strona się ładuje i wyświetla nagłówek', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Znajdź specjalistę/i })).toBeVisible();
    await expect(page.getByText(/Wyniki:/)).toBeVisible();
  });

  test('wyświetla listę usług', async ({ page }) => {
    // Czekaj na załadowanie usług
    await page.waitForSelector('[data-testid="service-card"]', { timeout: 5000 });
    
    // Sprawdź czy są karty usług
    const serviceCards = page.locator('[data-testid="service-card"]');
    await expect(serviceCards.first()).toBeVisible();
  });

  test('wyszukiwanie przez input search', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Szukaj:/i);
    
    await searchInput.fill('hydraulik');
    await searchInput.press('Enter');
    
    // Czekaj na debounce i przeładowanie
    await page.waitForTimeout(500);
    
    // URL powinien zawierać parametr q
    await expect(page).toHaveURL(/\?.*q=hydraulik/);
  });

  test('filtrowanie po kategorii', async ({ page }) => {
    // Otwórz panel filtrów jeśli jest zamknięty
    await page.getByTestId('filters-open').click();
    
    // Wybierz kategorię
    const categorySelect = page.locator('select').filter({ hasText: 'Kategoria' }).or(
      page.getByLabel(/Kategoria/i)
    );
    await categorySelect.selectOption('plumbing');
    
    // Zastosuj filtry
    await page.getByTestId('filters-apply').click();
    
    // URL powinien się zmienić na /szukaj/plumbing
    await expect(page).toHaveURL(/\/szukaj\/plumbing/);
  });

  test('przełączanie między widokiem listy a mapy', async ({ page }) => {
    // Kliknij przycisk Mapa
    await page.getByTestId('view-map').click();
    
    // Mapa powinna się wyświetlić
    await expect(page.getByTestId('service-map')).toBeVisible({ timeout: 5000 });
    
    // Kliknij Lista
    await page.getByTestId('view-list').click();
    
    // Mapa powinna zniknąć
    await expect(page.getByTestId('service-map')).toBeHidden();
  });

  test('dodawanie do ulubionych', async ({ page }) => {
    // Czekaj na załadowanie usług
    await page.waitForSelector('[data-testid="service-card"]', { timeout: 5000 });
    
    // Kliknij pierwsze serce (favorite button)
    const favoriteButton = page.getByTestId('favorite-toggle').first();
    await favoriteButton.click();
    
    // Serce powinno się wypełnić (zmiana koloru)
    await expect(favoriteButton.locator('.lucide-heart')).toHaveClass(/fill-red-500/);
    
    // Badge z liczbą ulubionych powinien się pojawić
    await expect(page.locator('.bg-red-500').filter({ hasText: '1' })).toBeVisible();
  });

  test('otwieranie sidebaru z ulubionymi', async ({ page }) => {
    // Dodaj usługę do ulubionych
    await page.waitForSelector('button:has(.lucide-heart)', { timeout: 5000 });
    const favoriteButton = page.locator('button').filter({ has: page.locator('.lucide-heart') }).first();
    await favoriteButton.click();
    
    // Kliknij badge z ulubionymi w nagłówku
    await page.getByTestId('favorites-toggle').click();
    
    // Sidebar powinien się otworzyć
    await expect(page.getByText('Ulubione')).toBeVisible();
  });

  test('filtrowanie po cenie', async ({ page }) => {
    // Otwórz filtry
    await page.getByTestId('filters-open').click();
    
    // Ustaw cena min
    const minPriceInput = page.getByLabel(/Cena min/i);
    await minPriceInput.fill('100');
    
    // Ustaw cena max
    const maxPriceInput = page.getByLabel(/Cena max/i);
    await maxPriceInput.fill('300');
    
    // Zastosuj
    await page.getByTestId('filters-apply').click();
    
    // URL powinien zawierać parametry pmin i pmax
    await expect(page).toHaveURL(/\?.*pmin=100.*pmax=300/);
  });

  test('sortowanie usług', async ({ page }) => {
    // Otwórz filtry
    await page.getByTestId('filters-open').click();
    
    // Wybierz sortowanie
    const sortSelect = page.getByLabel(/Sortowanie/i);
    await sortSelect.selectOption('price_asc');
    
    // Zastosuj
    await page.getByTestId('filters-apply').click();
    
    // URL powinien zawierać sort=price_asc
    await expect(page).toHaveURL(/\?.*sort=price_asc/);
  });

  test('usuwanie pojedynczego filtra przez badge X', async ({ page }) => {
    // Ustaw filtr kategorii
    await page.getByTestId('filters-open').click();
    const categorySelect = page.getByLabel(/Kategoria/i);
    await categorySelect.selectOption('electrical');
    await page.getByTestId('filters-apply').click();
    
    // Poczekaj na badge
    await expect(page.getByText('electrical')).toBeVisible();
    
    // Kliknij X na badge
    const badgeXButton = page.locator('.flex.items-center.gap-1').filter({ hasText: 'electrical' }).locator('button');
    await badgeXButton.click();
    
    // Badge powinien zniknąć
    await expect(page.getByText('electrical')).toBeHidden();
    
    // URL powinien się zaktualizować
    await expect(page).toHaveURL(/\/szukaj$/);
  });

  test('czyszczenie wszystkich filtrów', async ({ page }) => {
    // Ustaw wiele filtrów
    await page.getByTestId('filters-open').click();
    
    const categorySelect = page.getByLabel(/Kategoria/i);
    await categorySelect.selectOption('cleaning');
    
    const minPrice = page.getByLabel(/Cena min/i);
    await minPrice.fill('50');
    
    await page.getByRole('button', { name: /Zastosuj/i }).click();
    
    // Sprawdź czy są badge'y
    await expect(page.getByText('cleaning')).toBeVisible();
    
    // Wyczyść wszystkie filtry
    await page.getByRole('button', { name: /Wyczyść filtry/i }).click();
    
    // Badge'y powinny zniknąć
    await expect(page.getByText('cleaning')).toBeHidden();
    
    // URL powinien być czysty
    await expect(page).toHaveURL(/\/szukaj$/);
  });

  test('preset "Najlepiej oceniani"', async ({ page }) => {
    // Kliknij preset
    await page.getByRole('button', { name: /Najlepiej oceniani/i }).click();
    
    // Panel filtrów powinien się otworzyć
    await expect(page.getByLabel(/Minimalna ocena/i)).toBeVisible();
  });

  test('preset "Express / Instant"', async ({ page }) => {
    // Kliknij preset
    await page.getByRole('button', { name: /Express.*Instant/i }).click();
    
    // Switch instant booking powinien być włączony
    const instantSwitch = page.getByLabel(/Instant.*ekspres/i);
    await expect(instantSwitch).toBeChecked();
  });

  test('dark mode toggle', async ({ page }) => {
    // Znajdź przycisk dark mode (ikona Moon/Sun)
    const darkModeButton = page.locator('button[aria-label="Toggle dark mode"]').or(
      page.locator('button:has(.lucide-moon), button:has(.lucide-sun)').first()
    );
    
    // Przełącz dark mode
    await darkModeButton.click();
    
    // HTML powinien mieć klasę 'dark'
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('responsive - mobile view', async ({ page }) => {
    // Ustaw rozmiar mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Strona powinna się załadować
    await expect(page.getByRole('heading', { name: /Znajdź specjalistę/i })).toBeVisible();
    
    // Przycisk filtry powinien pokazywać tylko ikonę (ukryty tekst)
    const filterButton = page.getByTestId('filters-open');
    await expect(filterButton).toBeVisible();
  });

  test('otwieranie modalu ze szczegółami usługi', async ({ page }) => {
    // Czekaj na karty usług
    await page.waitForSelector('[data-testid="service-card"]', { timeout: 5000 });
    
    // Kliknij pierwszą kartę
    const firstCard = page.locator('[data-testid="service-card"]').first();
    await firstCard.click();
    
    // Modal powinien się otworzyć
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Zamknij modal przez backdrop
    await page.locator('[role="dialog"]').press('Escape');
    await expect(page.locator('[role="dialog"]')).toBeHidden();
  });

  test('SEO-friendly URL - kategoria i miasto', async ({ page }) => {
    // Przejdź do URL z kategorią
    await page.goto('/szukaj/plumbing');
    
    await expect(page).toHaveURL(/\/szukaj\/plumbing/);
    await expect(page.getByRole('heading', { name: /Znajdź specjalistę/i })).toBeVisible();
    
    // Przejdź do URL z kategorią i miastem
    await page.goto('/szukaj/electrical/warszawa');
    
    await expect(page).toHaveURL(/\/szukaj\/electrical\/warszawa/);
  });

  test('infinite scroll - ładowanie kolejnych stron', async ({ page }) => {
    // Przewiń do dołu
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Poczekaj na pojawienie się spinnera lub nowych usług
    await page.waitForTimeout(1000);
    
    // Powinny załadować się kolejne usługi (jeśli jest więcej niż jedna strona)
    const serviceCards = page.locator('.rounded-2xl').filter({ hasText: 'zł' });
    const count = await serviceCards.count();
    
    expect(count).toBeGreaterThan(0);
  });
});
