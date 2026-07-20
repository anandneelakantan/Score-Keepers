import type { Page } from '@playwright/test';

export async function resetAppState(page: Page) {
  await page.goto('/');
  await page.evaluate(async () => {
    localStorage.clear();
    await new Promise<void>((resolve) => {
      const req = indexedDB.deleteDatabase('scorekeepers');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      req.onblocked = () => resolve();
    });
  });
  await page.reload();
}

export async function createGame(page: Page, name: string) {
  await page.getByPlaceholder('New game name').fill(name);
  await page.getByRole('button', { name: '+ New Game' }).click();
}

export async function setPlayers(page: Page, names: string[]) {
  for (let i = 0; i < names.length; i++) {
    await page.getByPlaceholder(`Player ${i + 1}`).fill(names[i]);
  }
  await page.getByRole('button', { name: 'Apply Players →' }).click();
}

export async function goToTab(page: Page, label: 'Game setup' | 'Rounds' | 'Leaderboard') {
  await page.getByRole('button', { name: label }).click();
}

export async function fillScore(page: Page, playerName: string, value: string) {
  await page.locator('.score-field', { hasText: playerName }).locator('input').click();

  const keypad = page.locator('.keypad');
  await keypad.waitFor({ state: 'visible' });

  const valueDisplay = keypad.locator('.keypad-value');
  while ((await valueDisplay.textContent())?.trim() !== '0') {
    await keypad.getByRole('button', { name: '⌫' }).click();
  }

  const negative = value.startsWith('-');
  const digits = negative ? value.slice(1) : value;

  if (negative) {
    await keypad.getByRole('button', { name: '+/-' }).click();
  }

  for (const digit of digits) {
    await keypad.getByRole('button', { name: digit, exact: true }).click();
  }

  await keypad.getByRole('button', { name: 'Done' }).click();
}
