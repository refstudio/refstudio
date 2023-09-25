import { expect, test } from '@playwright/test';

test('Show "Ref Studio" title', async ({ page }) => {
  await page.route('/api/projects', (route) => {
    console.log('route intercepted');
    return route.fulfill({
      status: 200,
      body: JSON.stringify([]),
    });
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/Ref Studio/);
  await expect(page.getByText('Get Started')).toBeVisible();
});
