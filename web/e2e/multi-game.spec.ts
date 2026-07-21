import { test, expect } from '@playwright/test';
import { resetAppState, createGame, setPlayers, goToTab, fillScore } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetAppState(page);
});

test('keeps state isolated across games and supports delete', async ({ page }) => {
  await createGame(page, 'Game A');
  await setPlayers(page, ['Alice', 'Bob']);
  await goToTab(page, 'Rounds');
  await fillScore(page, 'Alice', '10');
  await fillScore(page, 'Bob', '5');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await page.getByRole('button', { name: 'My Games' }).click();
  await expect(page.getByTestId('game-list-item')).toHaveCount(1);

  await createGame(page, 'Game B');
  await setPlayers(page, ['Carol', 'Dave']);
  await goToTab(page, 'Rounds');
  await fillScore(page, 'Carol', '1');
  await fillScore(page, 'Dave', '2');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await page.getByRole('button', { name: 'My Games' }).click();
  await expect(page.getByTestId('game-list-item')).toHaveCount(2);

  const gameAItem = page.locator('[data-testid="game-list-item"][data-game-name="Game A"]');
  const gameBItem = page.locator('[data-testid="game-list-item"][data-game-name="Game B"]');

  await gameAItem.getByRole('button', { name: 'Open' }).click();
  await goToTab(page, 'Rounds');
  await expect(page.getByText('RD 1')).toBeVisible();
  await expect(page.getByText('Alice: +10')).toBeVisible();

  await page.getByRole('button', { name: 'My Games' }).click();
  await gameBItem.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByTestId('game-list-item')).toHaveCount(1);
});
