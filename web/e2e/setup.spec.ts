import { test, expect } from '@playwright/test';
import { resetAppState, createGame, setPlayers, goToTab, fillScore } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetAppState(page);
});

test('creates a game and starts it', async ({ page }) => {
  await createGame(page, 'Friday Game Night');
  await page.getByPlaceholder('Player 1').fill('Alice');
  await page.getByPlaceholder('Player 2').fill('Bob');
  await page.getByRole('button', { name: 'Start game →' }).click();
  await expect(page.getByTestId('toast')).toContainText('Game started with 2 players.');
  await expect(page.getByRole('button', { name: 'Start game →' })).toHaveCount(0);
});

test('rejects fewer than 2 players', async ({ page }) => {
  await createGame(page, 'Solo Test');
  await page.getByPlaceholder('Player 1').fill('OnlyOne');
  await page.getByRole('button', { name: 'Start game →' }).click();
  await expect(page.getByTestId('toast')).toContainText('Add at least 2 players.');
});

test('rejects duplicate player names', async ({ page }) => {
  await createGame(page, 'Dup Test');
  await page.getByPlaceholder('Player 1').fill('Sam');
  await page.getByPlaceholder('Player 2').fill('sam');
  await page.getByRole('button', { name: 'Start game →' }).click();
  await expect(page.getByTestId('toast')).toContainText('Player names must be unique.');
});

test('auto-grows the player input list as names are typed', async ({ page }) => {
  await createGame(page, 'Grow Test');
  await expect(page.getByPlaceholder('Player 2')).toHaveCount(0);
  await page.getByPlaceholder('Player 1').fill('Alice');
  await expect(page.getByPlaceholder('Player 2')).toHaveCount(1);
});

test('shows existing player names when reopening a saved game', async ({ page }) => {
  await createGame(page, 'Reopen Test');
  await setPlayers(page, ['Alice', 'Bob']);

  await goToTab(page, 'Rounds');

  await page.getByRole('button', { name: 'My Games' }).click();
  await page.getByTestId('game-list-item').getByRole('button', { name: 'Open' }).click();

  await goToTab(page, 'Game setup');
  await expect(page.getByPlaceholder('Player 1')).toHaveValue('Alice');
  await expect(page.getByPlaceholder('Player 2')).toHaveValue('Bob');
  await expect(page.getByRole('button', { name: 'Start game →' })).toHaveCount(0);
});

test.describe('editing players mid-game', () => {
  test.beforeEach(async ({ page }) => {
    await createGame(page, 'Mid-game Test');
    await setPlayers(page, ['Alice', 'Bob']);
    await goToTab(page, 'Rounds');
    await fillScore(page, 'Alice', '10');
    await fillScore(page, 'Bob', '7');
    await page.getByRole('button', { name: 'Submit Round ✓' }).click();
    await goToTab(page, 'Game setup');
  });

  test('renames a player without losing scores', async ({ page }) => {
    const alice = page.getByPlaceholder('Player 1');
    await alice.fill('Alicia');
    await alice.press('Enter');

    await goToTab(page, 'Leaderboard');
    const rows = page.locator('.lb-row');
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0).locator('.lb-name-text')).toHaveText('Alicia');
    await expect(rows.nth(0).locator('.lb-score')).toHaveText('10');
  });

  test('adds a player without resetting rounds', async ({ page }) => {
    const newPlayer = page.getByPlaceholder('Player 3');
    await newPlayer.fill('Carol');
    await newPlayer.press('Enter');
    await expect(page.getByTestId('toast')).toContainText('Carol added.');
    await expect(page.getByPlaceholder('Player 4')).toHaveCount(1);

    await goToTab(page, 'Rounds');
    await expect(page.getByText('RD 1')).toBeVisible();
    await expect(page.locator('.round-badge')).toHaveText('Round 2');
    await expect(page.locator('.score-field', { hasText: 'Carol' })).toHaveCount(1);

    await goToTab(page, 'Leaderboard');
    const rows = page.locator('.lb-row');
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(2).locator('.lb-name-text')).toHaveText('Carol');
    await expect(rows.nth(2).locator('.lb-score')).toHaveText('0');
  });

  test('reverts a rename to a duplicate or empty name', async ({ page }) => {
    const alice = page.getByPlaceholder('Player 1');

    await alice.fill('bob');
    await alice.press('Enter');
    await expect(page.getByTestId('toast')).toContainText('Player names must be unique.');
    await expect(alice).toHaveValue('Alice');

    await alice.fill('');
    await alice.press('Enter');
    await expect(page.getByTestId('toast')).toContainText('Player name cannot be empty.');
    await expect(alice).toHaveValue('Alice');
  });
});
