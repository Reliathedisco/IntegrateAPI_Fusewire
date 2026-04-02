import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './__checks__',
  timeout: 30_000,
  use: {
    baseURL: 'https://integrateapi.io',
    viewport: { width: 1280, height: 720 },
    headless: true,
  },
})
