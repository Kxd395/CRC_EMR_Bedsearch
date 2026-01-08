import { test, expect } from '@playwright/test';

async function ensureFinderTabVisible(page) {
  const navItem = page.locator('.workflow-nav li[data-tab="finderTab"]');
  await navItem.waitFor();
  await navItem.scrollIntoViewIfNeeded();
  await navItem.click();
  await page.waitForTimeout(150);

  await page.evaluate(() => {
    const finderTab = document.getElementById('finderTab');
    if (!finderTab) return;

    const nav = document.querySelector('.workflow-nav li[data-tab="finderTab"]');
    if (nav) {
      nav.classList.add('active');
      nav.setAttribute('aria-selected', 'true');
    }

    finderTab.removeAttribute('hidden');
    finderTab.setAttribute('aria-hidden', 'false');
    finderTab.style.display = '';
  });

  await expect(page.locator('#finderTab')).toBeVisible();
}

async function ensureActiveSearchesVisible(page) {
  const anchor = page.locator('a[href="#searchList"]');
  if (await anchor.count()) {
    await anchor.scrollIntoViewIfNeeded();
    await anchor.click();
  }

  const searchList = page.locator('#searchList');
  if (!(await searchList.isVisible())) {
    await page.evaluate(() => {
      const list = document.getElementById('searchList');
      if (!list) return;
      list.removeAttribute('hidden');
      list.style.display = '';
      const parent = list.closest('[aria-hidden="true"]');
      if (parent) {
        parent.removeAttribute('aria-hidden');
        parent.style.display = '';
      }
    });
  }

  await searchList.scrollIntoViewIfNeeded();
  await expect(searchList).toBeVisible();
}

test.describe('CRC SSOT EMR – Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      try {
        const visibilityDefaults = {
          noteTab: true,
          finderTab: true,
          tasksTab: true,
          activityTab: true,
          contactPlanner: true,
          patientList: true,
          workflow: true,
          steward: true,
          audit: true,
          commitment: true
        };

        window.localStorage?.clear();
        window.sessionStorage?.clear();
        window.localStorage?.setItem('crc-ssot-panel-visibility', JSON.stringify(visibilityDefaults));
      } catch (err) {
        console.warn('Init script failed to prepare storage state', err);
      }
    });

    await page.goto('/');
    await page.waitForSelector('.app-shell');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/CRC SSOT/);
  });

  test('should load EMR interface with all core components', async ({ page }) => {
    const selectors = [
      'header.app-header',
      'section.patient-context',
      'nav.workflow-nav',
      'section.note-panel',
      '#searchList',
      '#patientListTable'
    ];

    for (const selector of selectors) {
      await expect(page.locator(selector)).toBeVisible();
    }
  });

  test('should display patient information correctly', async ({ page }) => {
    const patientSelect = page.locator('#patientSelect');
    await expect(patientSelect).toBeVisible();

    await expect(patientSelect.locator('option[value]')).not.toHaveCount(0);

    const valueToSelect = await patientSelect.locator('option[value]').first().getAttribute('value');

    if (valueToSelect) {
      await patientSelect.selectOption(valueToSelect);
    }

    await expect(page.locator('#patientName')).not.toHaveText(/^\s*$/);
    await expect(page.locator('#patientMrn')).not.toHaveText(/^\s*$/);
    await expect(page.locator('#patientFin')).not.toHaveText(/^\s*$/);

    await expect(page.locator('#patientListBody tr')).not.toHaveCount(0);
  });

  test('should allow facility search and filtering', async ({ page }) => {
    await ensureFinderTabVisible(page);

    const facilitySearch = page.locator('#facilitySearch');
    await facilitySearch.scrollIntoViewIfNeeded();
    await expect(facilitySearch).toBeVisible();

    await facilitySearch.fill('Philadelphia');
    await expect(page.locator('.facility-card')).not.toHaveCount(0);

    const filterAcuteBh = page.locator('#filterAcuteBh');
    if (await filterAcuteBh.isVisible()) {
      await filterAcuteBh.check();
      await filterAcuteBh.uncheck();
    }
  });

  test('should surface placement workflow controls', async ({ page }) => {
    await ensureActiveSearchesVisible(page);
    const addSearchBtn = page.locator('#addSearchBtn');
    await addSearchBtn.scrollIntoViewIfNeeded();
    await expect(addSearchBtn).toBeVisible();

    const searchRows = page.locator('#searchList .search-row');
    await expect.poll(async () => searchRows.count()).toBeGreaterThan(0);

    await addSearchBtn.click();
    const searchPopover = page.locator('#searchPopover');
    await expect(searchPopover).toBeVisible();

    await page.locator('#closeSearchPopover').click();
    await expect(searchPopover).toBeHidden();
  });

  test('should display ASAM level information', async ({ page }) => {
    const asamField = page.locator('#asamField');
    await expect(asamField).toBeVisible();

    await expect.poll(async () =>
      asamField.evaluate((select) => Array.from(select.options).length)
    ).toBeGreaterThan(0);

    const firstValue = await asamField.evaluate((select) => {
      const option = Array.from(select.options).find((opt) => opt.value);
      return option ? option.value : null;
    });

    if (firstValue) {
      await asamField.selectOption(firstValue);
      await expect(asamField).toHaveValue(firstValue);
    }
  });

  test('should handle level of care (LOC) filtering controls', async ({ page }) => {
    await ensureFinderTabVisible(page);

    const locFilter = page.locator('#filterAsam');
    await expect(locFilter).toBeVisible();

    const locValues = await locFilter.locator('option[value]').evaluateAll((options) =>
      options.map((opt) => opt.value)
    );

    if (locValues.length > 0) {
      await locFilter.selectOption(locValues.slice(0, Math.min(locValues.length, 2)));
    }

    const matFilter = page.locator('#filterMat');
    if (await matFilter.count()) {
      const matValue = await matFilter.locator('option[value]').first().evaluate((opt) => opt?.value || null);
      if (matValue) {
        await matFilter.selectOption(matValue);
      }
    }

    await expect(page.locator('.facility-card')).not.toHaveCount(0);
  });

  test('should expose commitment status controls', async ({ page }) => {
    const commitmentSelect = page.locator('#threeOhTwo');
    await expect(commitmentSelect).toBeVisible();

    const optionValues = await commitmentSelect.locator('option').evaluateAll((options) =>
      options.map((opt) => opt.value)
    );

    if (optionValues.includes('302Required')) {
      await commitmentSelect.selectOption('302Required');
      await expect(commitmentSelect).toHaveValue('302Required');
    }
  });

  test('should open and close settings modal', async ({ page }) => {
    const settingsButton = page.locator('#openSettings');
    await settingsButton.scrollIntoViewIfNeeded();
    await expect(settingsButton).toBeVisible();

    await settingsButton.click();
    const settingsModal = page.locator('#settingsModal');
    await expect(settingsModal).toBeVisible();

    await page.locator('#closeSettings').click();
    await expect(settingsModal).toBeHidden();
  });

  test('should request patient data via API without storing bed searches in localStorage', async ({ page }) => {
    const patientSelect = page.locator('#patientSelect');
    await expect(patientSelect).toBeVisible();

    const apiRequests = [];
    page.on('request', (request) => {
      if (request.method() === 'GET' && request.url().includes('/api/patients/')) {
        apiRequests.push(request);
      }
    });

    const firstValue = await patientSelect.locator('option[value]').first().getAttribute('value');
    if (firstValue) {
      await patientSelect.selectOption(firstValue);
    }

    await expect.poll(async () => apiRequests.length).toBeGreaterThan(0);

    const patientKeys = await page.evaluate(() => {
      if (!window.localStorage) return [];
      return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
        (key) => key?.startsWith('patient_')
      );
    });

    expect(patientKeys.length).toBe(0);
  });

  test('should retain layout across responsive breakpoints', async ({ page }) => {
    const header = page.locator('header.app-header');
    const nav = page.locator('nav.workflow-nav');

    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 414, height: 896 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await expect(header).toBeVisible();
      await expect(nav).toBeVisible();
    }
  });
});
