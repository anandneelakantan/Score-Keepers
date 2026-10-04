import { test, expect, type Page } from '@playwright/test';
import { resetAppState, createGame, setPlayers, goToTab, fillScore, START_BUTTON } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetAppState(page);
});

test('creates a game and starts it', async ({ page }) => {
  await createGame(page, 'Friday Game Night');
  await page.getByPlaceholder('Player 1').fill('Alice');
  await page.getByPlaceholder('Player 2').fill('Bob');
  await page.getByRole('button', { name: 'Start game · 2 players →' }).click();
  await expect(page.getByTestId('toast')).toContainText('Game started with 2 players.');
  await expect(page.getByRole('button', { name: START_BUTTON })).toHaveCount(0);
});

test('keeps start disabled until 2 players are named', async ({ page }) => {
  await createGame(page, 'Solo Test');
  const start = page.getByRole('button', { name: START_BUTTON });
  await expect(start).toBeDisabled();
  await expect(page.getByText('Add 2 more players to start')).toBeVisible();

  await page.getByPlaceholder('Player 1').fill('OnlyOne');
  await expect(start).toBeDisabled();
  await expect(page.getByText('Add 1 more player to start')).toBeVisible();

  await page.getByPlaceholder('Player 2').fill('Another');
  await expect(start).toBeEnabled();
});

test('rejects duplicate player names', async ({ page }) => {
  await createGame(page, 'Dup Test');
  await page.getByPlaceholder('Player 1').fill('Sam');
  await page.getByPlaceholder('Player 2').fill('sam');
  await page.getByRole('button', { name: START_BUTTON }).click();
  await expect(page.getByTestId('toast')).toContainText('Player names must be unique.');
});

test('adds and removes player rows', async ({ page }) => {
  await createGame(page, 'Rows Test');
  await expect(page.getByPlaceholder('Player 3')).toHaveCount(0);

  // An empty row is reused before a new one is added.
  await page.getByRole('button', { name: 'Add player' }).click();
  await expect(page.getByPlaceholder('Player 1')).toBeFocused();
  await expect(page.getByPlaceholder('Player 3')).toHaveCount(0);

  await page.getByPlaceholder('Player 1').fill('Alice');
  await page.getByPlaceholder('Player 2').fill('Bob');
  await page.getByPlaceholder('Player 2').press('Enter');
  await expect(page.getByPlaceholder('Player 3')).toBeFocused();

  await page.getByRole('button', { name: 'Remove player 1' }).click();
  await expect(page.getByPlaceholder('Player 1')).toHaveValue('Bob');
  await expect(page.getByPlaceholder('Player 3')).toHaveCount(0);
});

test('summarises the setup under the game name', async ({ page }) => {
  await createGame(page, 'Summary Test');
  await page.getByPlaceholder('Player 1').fill('Alice');
  await page.getByLabel('Winning points').fill('300');
  await page.getByLabel('Time each round').check({ force: true });
  await page.getByRole('button', { name: '90s' }).click();
  await expect(page.locator('.setup-summary')).toHaveText(/1 player.*Highest wins.*Play to 300.*90s rounds/);
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
  await expect(page.getByRole('button', { name: START_BUTTON })).toHaveCount(0);
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
    const newPlayer = page.getByPlaceholder('Add a late joiner');
    await newPlayer.fill('Carol');
    await newPlayer.press('Enter');
    await expect(page.getByTestId('toast')).toContainText('Carol added.');
    await expect(page.getByPlaceholder('Player 3')).toHaveValue('Carol');
    await expect(newPlayer).toHaveValue('');

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

test.describe('remembered players', () => {
  const suggestions = (page: Page) =>
    page.locator('#known-players option').evaluateAll((opts) =>
      opts.map((o) => (o as HTMLOptionElement).value),
    );

  test('suggests players from earlier games, excluding names already entered', async ({ page }) => {
    await createGame(page, 'First Game');
    await setPlayers(page, ['Alice', 'Bob']);
    await page.getByRole('button', { name: 'My Games' }).click();

    await createGame(page, 'Second Game');
    await expect.poll(async () => (await suggestions(page)).sort()).toEqual(['Alice', 'Bob']);

    await page.getByPlaceholder('Player 1').fill('Bob');
    await expect.poll(() => suggestions(page)).toEqual(['Alice']);
  });

  test('adds a recent player with one tap', async ({ page }) => {
    await createGame(page, 'First Game');
    await setPlayers(page, ['Alice', 'Bob']);
    await page.getByRole('button', { name: 'My Games' }).click();

    await createGame(page, 'Second Game');
    const recent = page.locator('.setup-recent');
    await recent.getByRole('button', { name: 'Bob' }).click();
    await expect(page.getByPlaceholder('Player 1')).toHaveValue('Bob');
    await expect(recent.getByRole('button', { name: 'Bob' })).toHaveCount(0);

    await recent.getByRole('button', { name: 'Alice' }).click();
    await expect(page.getByPlaceholder('Player 2')).toHaveValue('Alice');
    await expect(recent).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Start game · 2 players →' })).toBeEnabled();
  });
});
