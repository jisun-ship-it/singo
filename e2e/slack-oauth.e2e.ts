import { test, expect } from '@playwright/test'

test('Settings page shows Connect Slack button', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Connect Slack/i })).toBeVisible()
})

test('Connect Slack button href points to Slack OAuth', async ({ page }) => {
  await page.goto('/')
  const link = page.getByRole('link', { name: /Connect Slack/i })
  const href = await link.getAttribute('href')
  expect(href).toContain('slack.com/oauth/v2/authorize')
})

test('Settings shows connected confirmation after OAuth success', async ({ page }) => {
  await page.goto('/?connected=true')
  await expect(page.getByText(/Slack workspace connected/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /Connect Slack/i })).not.toBeVisible()
})
