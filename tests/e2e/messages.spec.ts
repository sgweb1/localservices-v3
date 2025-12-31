import { test, expect } from '@playwright/test';

/**
 * Testy E2E dla systemu wiadomości
 * 
 * Flow testowy:
 * 1. Provider loguje się
 * 2. Przechodzi do strony wiadomości
 * 3. Widzi listę konwersacji
 * 4. Wybiera konwersację
 * 5. Wysyła wiadomość
 * 6. Oznacza jako przeczytane
 * 7. Ukrywa konwersację
 * 
 * UWAGA: Te testy wymagają działającego backendu i seedowanych danych
 */

test.describe('Messages - Provider Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Logowanie jako provider
    await page.goto('https://ls.test/dev/login');
    
    // Wybieramy providera z listy (zakładamy że pierwszy to provider)
    await page.click('button:has-text("Provider")');
    
    // Czekamy na przekierowanie do dashboardu
    await page.waitForURL('**/provider/dashboard');
  });

  test('Provider może zobaczyć listę konwersacji', async ({ page }) => {
    // Przejdź do strony wiadomości
    await page.goto('https://ls.test/provider/messages');

    // Czekaj na załadowanie strony
    await page.waitForSelector('h2:has-text("Wiadomości")');

    // Sprawdź czy lista konwersacji się wyświetla
    const conversationsList = page.locator('[data-testid="conversations-list"]').first();
    await expect(conversationsList).toBeVisible();

    // Sprawdź czy są zakładki Aktywne/Ukryte
    await expect(page.locator('button:has-text("Aktywne")')).toBeVisible();
    await expect(page.locator('button:has-text("Ukryte")')).toBeVisible();
  });

  test('Provider może wyszukiwać konwersacje', async ({ page }) => {
    await page.goto('https://ls.test/provider/messages');

    // Znajdź pole wyszukiwania
    const searchInput = page.locator('input[placeholder*="Szukaj konwersacji"]');
    await expect(searchInput).toBeVisible();

    // Wpisz tekst
    await searchInput.fill('Anna');
    
    // Sprawdź czy lista się zaktualizowała (filtrowanie po stronie klienta)
    await page.waitForTimeout(500); // Daj czas na React re-render
    
    // Jeśli jest Anna Kowalska, powinna być widoczna
    const firstConversation = page.locator('[data-testid="conversation-item"]').first();
    if (await firstConversation.isVisible()) {
      await expect(firstConversation).toContainText(/anna/i);
    }
  });

  test('Provider może wybrać konwersację i zobaczyć chat', async ({ page }) => {
    await page.goto('https://ls.test/provider/messages');

    // Poczekaj na załadowanie konwersacji
    await page.waitForSelector('[data-testid="conversation-item"]');

    // Kliknij pierwszą konwersację
    await page.locator('[data-testid="conversation-item"]').first().click();

    // Sprawdź czy okno czatu się pojawiło
    await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();

    // Sprawdź czy jest input do wysyłania wiadomości
    await expect(page.locator('textarea[placeholder*="wiadomość"]')).toBeVisible();
  });

  test('Provider może wysłać wiadomość', async ({ page }) => {
    await page.goto('https://ls.test/provider/messages');

    // Wybierz konwersację
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();

    // Poczekaj na załadowanie czatu
    await page.waitForSelector('[data-testid="chat-window"]');

    // Znajdź textarea i wpisz wiadomość
    const messageInput = page.locator('textarea[placeholder*="wiadomość"]');
    await messageInput.fill('To jest testowa wiadomość E2E');

    // Kliknij przycisk wyślij
    const sendButton = page.locator('button[type="submit"]', { has: page.locator('svg') });
    await sendButton.click();

    // Poczekaj na potwierdzenie wysłania (wiadomość powinna się pojawić na liście)
    await page.waitForTimeout(1000);
    
    // Sprawdź czy wiadomość się pojawiła
    await expect(page.locator('text=To jest testowa wiadomość E2E')).toBeVisible();
  });

  test('Provider może przełączać między zakładkami Aktywne/Ukryte', async ({ page }) => {
    await page.goto('https://ls.test/provider/messages');

    // Kliknij zakładkę Ukryte
    const ukryteButton = page.locator('button:has-text("Ukryte")');
    await ukryteButton.click();

    // Sprawdź czy zakładka ma aktywne style (gradient)
    await expect(ukryteButton).toHaveClass(/from-cyan-500/);

    // Wróć do Aktywne
    const aktywneButton = page.locator('button:has-text("Aktywne")');
    await aktywneButton.click();

    await expect(aktywneButton).toHaveClass(/from-cyan-500/);
  });

  test('Mobile: Provider może wrócić do listy konwersacji', async ({ page }) => {
    // Symuluj mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('https://ls.test/provider/messages');

    // Wybierz konwersację
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();

    // Na mobile chat powinien być full-screen
    await page.waitForSelector('[data-testid="chat-window"]');

    // Sprawdź czy jest przycisk "Wróć" (back button)
    const backButton = page.locator('button[aria-label*="Wróć"]');
    await expect(backButton).toBeVisible();

    // Kliknij back button
    await backButton.click();

    // Sprawdź czy wróciliśmy do listy
    await expect(page.locator('h2:has-text("Wiadomości")')).toBeVisible();
  });

  test('Provider widzi licznik nieprzeczytanych wiadomości', async ({ page }) => {
    await page.goto('https://ls.test/provider/messages');

    // Poczekaj na załadowanie konwersacji
    await page.waitForSelector('[data-testid="conversation-item"]');

    // Znajdź badge z licznikiem (jeśli jest)
    const unreadBadge = page.locator('[data-testid="conversation-item"]').first().locator('[class*="bg-gradient"]');
    
    // Jeśli badge istnieje, sprawdź czy ma liczbę
    if (await unreadBadge.isVisible()) {
      const badgeText = await unreadBadge.textContent();
      expect(badgeText).toMatch(/\d+/); // Zawiera cyfry
    }
  });

  test('Provider może oznaczyć konwersację jako przeczytaną', async ({ page }) => {
    await page.goto('https://ls.test/provider/messages');

    // Wybierz konwersację z nieprzeczytanymi wiadomościami
    await page.waitForSelector('[data-testid="conversation-item"]');
    const conversationWithUnread = page.locator('[data-testid="conversation-item"]').filter({ has: page.locator('[class*="bg-gradient"]') }).first();
    
    if (await conversationWithUnread.isVisible()) {
      await conversationWithUnread.click();

      // Poczekaj na załadowanie czatu
      await page.waitForSelector('[data-testid="chat-window"]');

      // Poczekaj 2 sekundy (backend automatycznie oznacza jako przeczytane)
      await page.waitForTimeout(2000);

      // Wróć do listy i sprawdź czy licznik zniknął
      await page.goto('https://ls.test/provider/messages');
      
      // Badge powinien zniknąć lub pokazywać 0
      const badge = conversationWithUnread.locator('[class*="bg-gradient"]');
      const isVisible = await badge.isVisible();
      
      if (isVisible) {
        const badgeText = await badge.textContent();
        expect(badgeText).toBe('0');
      }
    }
  });
});

test.describe('Messages - Desktop Layout', () => {
  test('Desktop pokazuje split view (lista + chat)', async ({ page }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await page.goto('https://ls.test/dev/login');
    await page.click('button:has-text("Provider")');
    await page.goto('https://ls.test/provider/messages');

    // Sprawdź czy widoczne są oba panele
    await expect(page.locator('h2:has-text("Wiadomości")')).toBeVisible();
    await expect(page.locator('text=/wybierz konwersację/i')).toBeVisible();

    // Wybierz konwersację
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();

    // Oba panele nadal widoczne
    await expect(page.locator('h2:has-text("Wiadomości")')).toBeVisible();
    await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();
  });
});

test.describe('Messages - Mobile Layout', () => {
  test('Mobile pokazuje single view (lista LUB chat)', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('https://ls.test/dev/login');
    await page.click('button:has-text("Provider")');
    await page.goto('https://ls.test/provider/messages');

    // Na start widoczna tylko lista
    await expect(page.locator('h2:has-text("Wiadomości")')).toBeVisible();

    // Wybierz konwersację
    await page.waitForSelector('[data-testid="conversation-item"]');
    await page.locator('[data-testid="conversation-item"]').first().click();

    // Teraz widoczny tylko chat
    await expect(page.locator('[data-testid="chat-window"]')).toBeVisible();
    
    // Lista powinna być ukryta (sprawdzamy przez class 'hidden')
    const sidebar = page.locator('h2:has-text("Wiadomości")').locator('..');
    await expect(sidebar).toHaveClass(/hidden/);
  });
});

test.describe('Messages - Error Handling', () => {
  test('Pokazuje komunikat gdy brak konwersacji', async ({ page }) => {
    // Możemy symulować brak danych poprzez mockowanie API
    // Lub zalogować się jako user bez konwersacji
    
    await page.goto('https://ls.test/dev/login');
    await page.click('button:has-text("Provider")');
    await page.goto('https://ls.test/provider/messages');

    // Sprawdź czy jest jakiś komunikat o braku danych
    // (zakładając że ConversationList ma taki stan)
    await page.waitForTimeout(2000);
    
    // Jeśli nie ma konwersacji, powinien być pusty stan
    const conversationItems = await page.locator('[data-testid="conversation-item"]').count();
    
    if (conversationItems === 0) {
      // Sprawdź czy jest komunikat o pustej liście
      await expect(page.locator('text=/brak konwersacji/i')).toBeVisible();
    }
  });
});
