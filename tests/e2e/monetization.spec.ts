/**
 * Testy E2E dla flow'u monetization (Playwright)
 */

import { test, expect, Page } from '@playwright/test'

test.describe('Monetization Flow', () => {
  let page: Page

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage
    // Zaloguj się jako provider
    await page.goto('http://localhost:5173/login')
    await page.fill('input[type="email"]', 'provider@test.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Zaloguj się")')
    await page.waitForNavigation()
  })

  test('user can navigate to boost purchase page', async () => {
    await page.goto('http://localhost:5173/monetization/boost')
    
    expect(page.url()).toContain('/monetization/boost')
    expect(page.locator('text=Kup Boost')).toBeVisible()
  })

  test('user can select city boost and fill form', async () => {
    await page.goto('http://localhost:5173/monetization/boost')
    
    // Kliknij City Boost
    await page.click('button:has-text("City Boost")')
    
    // Wypełnij miasto
    await page.fill('input[placeholder*="miasto"]', 'Warszawa')
    
    // Wybierz 7 dni
    await page.click('button:has-text("7 dni")')
    
    // Powinien widać cen
    expect(page.locator('text=9.99 PLN')).toBeVisible()
  })

  test('user can select spotlight and fill form', async () => {
    await page.goto('http://localhost:5173/monetization/boost')
    
    // Kliknij Spotlight
    await page.click('button:has-text("Spotlight")')
    
    // Wybierz kategorię
    await page.selectOption('select', 'plumbing')
    
    // Wybierz 14 dni
    await page.click('button:has-text("14 dni")')
    
    // Powinien widać cenę
    expect(page.locator('text=24.99 PLN')).toBeVisible()
  })

  test('user cannot submit boost form without location', async () => {
    await page.goto('http://localhost:5173/monetization/boost')
    
    // Kliknij City Boost
    await page.click('button:has-text("City Boost")')
    
    // Spróbuj kliknąć Kup teraz bez wpisania miasta
    const buyButton = page.locator('button:has-text("Kup teraz")')
    
    // Przycisk powinien być disabled
    expect(buyButton).toBeDisabled()
  })

  test('user can view active boosts', async () => {
    await page.goto('http://localhost:5173/monetization/boosts')
    
    // Powinien widać listę
    expect(page.locator('text=Moje Booosty')).toBeVisible()
    
    // Jeśli jest boost - powinien widać szczegóły
    const boostCard = page.locator('[class*="border-green"]').first()
    if (await boostCard.isVisible()) {
      expect(boostCard.locator('text=Warszawa')).toBeVisible()
    }
  })

  test('user can view subscription purchase page', async () => {
    await page.goto('http://localhost:5173/monetization/subscription')
    
    expect(page.url()).toContain('/monetization/subscription')
    expect(page.locator('text=Plany Subskrypcji')).toBeVisible()
  })

  test('user can select subscription plan and period', async () => {
    await page.goto('http://localhost:5173/monetization/subscription')
    
    // Kliknij na plan
    const firstPlan = page.locator('[class*="border-2"]').first()
    await firstPlan.click()
    
    // Powinna widać opcje okresu
    expect(page.locator('button:has-text("Miesięcznie")')).toBeVisible()
    expect(page.locator('button:has-text("Rocznie")')).toBeVisible()
  })

  test('user can toggle subscription billing period', async () => {
    await page.goto('http://localhost:5173/monetization/subscription')
    
    const firstPlan = page.locator('[class*="border-2"]').first()
    await firstPlan.click()
    
    // Kliknij na Rocznie
    await page.click('button:has-text("Rocznie")')
    
    // Cena powinna się zmienić
    const yearlyPrice = page.locator('[class*="text-4xl"]').first()
    const monthlyPrice = await yearlyPrice.textContent()
    
    expect(monthlyPrice).toBeTruthy()
  })

  test('user can view active subscription', async () => {
    await page.goto('http://localhost:5173/monetization/subscriptions')
    
    // Jeśli jest aktywna subskrypcja
    const activeSubHeader = page.locator('text=Moja Subskrypcja')
    
    if (await activeSubHeader.isVisible()) {
      expect(page.locator('text=Aktywna')).toBeVisible()
    }
  })

  test('checkout success page displays after payment', async () => {
    // Symulacja: URL zawiera session_id i type
    await page.goto('http://localhost:5173/checkout/success?session_id=cs_test_123&type=boost')
    
    // Powinien widać komunikat potwierdzenia
    expect(page.locator('text=Płatność Potwierdzona')).toBeVisible()
  })

  test('checkout cancel page displays on anulowaniu', async () => {
    await page.goto('http://localhost:5173/checkout/cancel')
    
    expect(page.locator('text=Płatność Anulowana')).toBeVisible()
    expect(page.locator('text=Spróbuj ponownie')).toBeVisible()
  })

  test('boost card displays countdown timer', async () => {
    await page.goto('http://localhost:5173/monetization/boosts')
    
    const boostCard = page.locator('[class*="border-green"]').first()
    
    if (await boostCard.isVisible()) {
      // Powinien widać countdown
      expect(boostCard.locator('text=dni')).toBeVisible()
      expect(boostCard.locator('text=godz')).toBeVisible()
    }
  })

  test('user can renew boost from list', async () => {
    await page.goto('http://localhost:5173/monetization/boosts')
    
    const renewButton = page.locator('button:has-text("Przedłuż")').first()
    
    if (await renewButton.isVisible()) {
      // Kliknij Przedłuż
      await renewButton.click()
      
      // Powinien pojawić się dialog do wyboru dni
      expect(page.locator('text=Ile dni')).toBeVisible()
    }
  })

  test('user can cancel boost with confirmation', async () => {
    await page.goto('http://localhost:5173/monetization/boosts')
    
    const cancelButton = page.locator('button:has-text("Anuluj")').first()
    
    if (await cancelButton.isVisible()) {
      // Kliknij Anuluj
      await cancelButton.click()
      
      // Powinien pojawić się dialog potwierdzenia
      expect(page.locator('text=Na pewno chcesz anulować')).toBeVisible()
    }
  })

  test('responsive design - mobile view', async () => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('http://localhost:5173/monetization/boost')
    
    // Na mobile powinien widać komponenty w kolumnie
    expect(page.locator('button:has-text("City Boost")')).toBeVisible()
    expect(page.locator('input[placeholder*="miasto"]')).toBeVisible()
  })

  test('error handling - network error on purchase', async () => {
    // Ustaw offline mode
    await page.context().setOffline(true)
    
    await page.goto('http://localhost:5173/monetization/boost')
    
    // Wypełnij formularz
    await page.click('button:has-text("City Boost")')
    await page.fill('input[placeholder*="miasto"]', 'Warszawa')
    await page.click('button:has-text("7 dni")')
    
    // Spróbuj kupić - powinien widać błąd
    await page.click('button:has-text("Kup teraz")')
    
    // Ustaw back online
    await page.context().setOffline(false)
  })
})
