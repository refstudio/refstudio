import { expect, test } from '@playwright/test';

test('Show "Ref Studio" title and "Get Started"', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Ref Studio/);
  await expect(page.getByText('Get Started')).toBeDefined();
});
