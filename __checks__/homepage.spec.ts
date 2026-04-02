import { test, expect } from '@playwright/test'

test('Visit IntegrateAPI homepage', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBeLessThan(400)
  await expect(page).toHaveTitle(/IntegrateAPI/)
  await page.screenshot({ path: 'homepage.jpg' })
})
